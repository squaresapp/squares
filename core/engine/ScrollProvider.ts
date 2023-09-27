
namespace ScrollApp
{
	/**
	 * A class that multiplexes a series of feeds into a single readable stream.
	 */
	export class ScrollProvider
	{
		/** */
		constructor() { }
		
		private filePath = "";
		
		/**
		 * Loads the mux JSON file from the specified file path. If no file exists 
		 * at the specified path, a new file is written to the specified location
		 * with an empty JSON object.
		 */
		async load(baseFila: Fila)
		{
			this.filePath = baseFila.path;
			if (!await baseFila.exists())
			{
				baseFila.writeText("{}");
				return;
			}
			
			// Load the about file
			const aboutFila = baseFila.down(MuxConst.aboutFile);
			const aboutJson = await aboutFila.readText();
			let about = ScrollApp.tryParseJson(aboutJson) as IMuxAbout | null;
			if (!about)
				about = { anchorIndex: 0 };
			
			// Load the feed file
			const feedsFila = baseFila.down(MuxConst.feedsFile);
			const feedsJson = await feedsFila.readText();
			let feeds = ScrollApp.tryParseJson(feedsJson) as IMuxFeed[];
			if (!feeds)
				feeds = [];
			
			// Load the posts file
			const postsFila = baseFila.down(MuxConst.postsFile);
			const postsJson = await postsFila.readText();
			let posts = ScrollApp.tryParseJson(postsJson) as IMuxPost[];
			if (!posts)
				posts = [];
			
			// Fully-qualify the post URLs
			for (const post of posts)
			{
				const feed = feeds.find(feed => feed.id === post.feedId);
				if (feed)
					post.path = new URL(post.path, feed.feedUrl).toString();
			}
			
			this._about = about;
			this._feeds = feeds;
			this._posts = posts;
		}
		
		/** */
		async save(
			aboutJsonText = "",
			feedsJsonText = "",
			postsJsonText = "")
		{
			if (this.filePath === "")
				throw new Error("File path not set.");
			
			const baseFila = Fila.new(this.filePath);
			
			const aboutFila = baseFila.down(MuxConst.aboutFile);
			const aboutJson = aboutJsonText || JSON.stringify(this._about, null, "\t");
			await aboutFila.writeText(aboutJson);
			
			const feedsFila = baseFila.down(MuxConst.feedsFile);
			const feedsJson = feedsJsonText || JSON.stringify(this._feeds, null, "\t");
			await feedsFila.writeText(feedsJson);
			
			const postsFila = baseFila.down(MuxConst.postsFile);
			const postsJson = postsJsonText || JSON.stringify(this._posts, null, "\t");
			await postsFila.writeText(postsJson);
		}
		
		/** */
		private async queueSave()
		{
			clearTimeout(this.timeoutId);
			this.timeoutId = setTimeout(() => this.save(), 100);
		}
		private timeoutId: any = null;
		
		/** */
		get anchorIndex()
		{
			return this._about?.anchorIndex || 0;
		}
		set anchorIndex(value: number)
		{
			this._about.anchorIndex = value;
		}
		private _about: IMuxAbout = { anchorIndex: 0 };
		
		/** */
		get feeds(): readonly IMuxFeed[]
		{
			return this._feeds;
		}
		private _feeds: IMuxFeed[] = [];
		
		/** */
		get posts(): readonly IMuxPost[]
		{
			return this._posts;
		}
		private _posts: IMuxPost[] = [];
		
		/** */
		addFeed(feedInfo: Partial<IMuxFeed>)
		{
			if (!feedInfo.feedUrl)
				throw new Error(".url property must be provided");
			
			feedInfo.id ||= getNextId();
			feedInfo.description ||= "";
			feedInfo.avatarUrl ||= "";
			feedInfo.size ||= 0;
			feedInfo.dateFollowed ||= Date.now();
			this._feeds.push(feedInfo as IMuxFeed);
			this.queueSave();
			return feedInfo.id;
		}
		
		/** */
		getFeed(id: number)
		{
			for (const feed of this._feeds)
				if (feed.id === id)
					return feed;
			
			return null;
		}
		
		/** */
		removeFeed(feedUrl: string): void;
		/** */
		removeFeed(feedId: number): void;
		removeFeed(value: string | number)
		{
			const idx = this.getFeedIndex(value);
			if (idx >= 0)
			{
				this._feeds.splice(idx, 1);
				this.queueSave();
			}
		}
		
		/**
		 * Downloads any new feed content from the specified feed URL,
		 * where the starting byte is the last loaded byte of the 
		 */
		async refreshFeed(feedUrl: string): Promise<void>;
		/**
		 * 
		 */
		async refreshFeed(feedId: number): Promise<void>;
		async refreshFeed(value: string | number)
		{
			const idx = this.getFeedIndex(value);
			if (idx <= 0)
				return;
			
			const feed = this._feeds[idx];
			const readResult = await FeedBlit.getFeedFromUrl(feed.feedUrl, feed.size);
			if (readResult.bytesRead === 0)
				return;
			
			for (const path of readResult.urls)
				this.addPost(feed.id, path);
			
			feed.size = feed.size + readResult.bytesRead;
			this.queueSave();
		}
		
		/** */
		private getFeedIndex(value: string | number)
		{
			if (typeof value === "string")
			{
				for (let i = this._feeds.length; i-- > 0;)
					if (this._feeds[i].feedUrl === value)
						return i;
			}
			else
			{
				for (let i = this._feeds.length; i-- > 0;)
					if (this._feeds[i].id === value)
						return i;
			}
			
			return -1;
		}
		
		/** */
		async addPost(feedNeedle: number | string, path: string)
		{
			if (typeof feedNeedle === "string" && !this._feeds.some(s => s.feedUrl === feedNeedle) ||
				typeof feedNeedle === "number" && !this._feeds.some(s => s.id === feedNeedle))
				throw new Error("Feed not found: " + feedNeedle);
			
			const feedIdx = this.getFeedIndex(feedNeedle);
			const feed = this._feeds[feedIdx];
			
			const postInfo: IMuxPost = {
				feedId: feed.id,
				path,
				dateFound: Date.now(),
			};
			
			this._posts.push(postInfo);
			this.queueSave();
		}
		
		/** */
		removePost(id: number)
		{
			for (let i = this._feeds.length; i-- > 0;)
				if (this._feeds[i].id === id)
					this._feeds.splice(i, 1);
			
			this.queueSave();
		}
	}
	
	/** */
	function getNextId()
	{
		const feedId = Number(localStorage.getItem("--next-id") || "0") + 1;
		localStorage.setItem("--next-id", feedId.toString());
		return feedId;
	}
}
