
namespace ScrollApp
{
	//! TODO:
	// Consider getting rid of the storage of the feeds, make it just
	// pull data directly from the file system every time on demand,
	// without caching.
	
	/**
	 * A class that describes one of many possible JSON files that store
	 * information about a Scroll (which is a composition of multiple feeds).
	 */
	export class ScrollJson
	{
		/** */
		static async read(identifier: string)
		{
			const scrollDirFila = await getScrollDirectory(identifier);
			
			const scrollFila = scrollDirFila.down(scrollJsonName);
			if (!await scrollFila.exists())
				return new ScrollJson(identifier);
			
			const scrollJsonText = await scrollFila.readText();
			const scrollJsonPartial = JSON.parse(scrollJsonText);
			const scrollJson = new ScrollJson(identifier);
			
			// Read in any attributes (for now just one)
			if (typeof scrollJsonPartial.anchorIndex === "number")
				scrollJson.anchorIndex = scrollJsonPartial.anchorIndex || 0;
			
			// Read the feeds
			const feedsFila = scrollDirFila.down(feedsJsonName);
			if (await feedsFila.exists())
			{
				const feedsJsonText = await feedsFila.readText();
				const feedsJson = <IFeedJson[]>tryParseJson(feedsJsonText) || [];
				scrollJson.feeds = feedsJson;
			}
			
			// Read the posts
			const contents = await scrollDirFila.readDirectory();
			for (let i = contents.length; i-- > 0;)
			{
				const reg = /^\d{4}-\d{2}-\d{2}\.json$/;
				if (!reg.test(contents[i].name))
					continue;
				
				const postsRead = await readPostsFile(contents[i]);
				scrollJson.posts.push(...postsRead);
			}
			
			return scrollJson;
		}
		
		/** */
		constructor(identifier: string)
		{
			this._identifier = identifier;
		}
		
		anchorIndex: number = 0;
		private feeds: IFeedJson[] = [];
		private posts: IPostJson[] = [];
		
		/** */
		get identifier()
		{
			return this._identifier;
		}
		set identifier(value: string)
		{
			this._identifier = value;
		}
		private _identifier = "scroll-" + Date.now().toString(36);
		
		/** */
		async addFeeds(...feedJsons: IFeedJson[])
		{
			this.feeds.push(...feedJsons);
			const scrollFila = await this.writeScrollJson();
			const feedsFila = scrollFila.down(feedsJsonName);
			const feedJson = JSON.stringify(this.feeds);
			await feedsFila.writeText(feedJson);
			await this.writeScrollJson();
		}
		
		/** */
		private async writeScrollJson()
		{
			const scrollFila = await getScrollDirectory(this.identifier);
			const scrollJson: IScrollJson = {
				anchorIndex: this.anchorIndex,
				feeds: this.feeds.map(f => f.id),
			};
			
			await scrollFila.down(scrollJsonName).writeText(JSON.stringify(scrollJson));
			return scrollFila;
		}
		
		/** */
		async writePost(postJson: IPostJson)
		{
			const scrollFila = await getScrollDirectory(this.identifier);
			const fileName = this.getContainingFileName(postJson.dateFound);
			const postsFila = scrollFila.down(fileName);
			const postsExists = await postsFila.exists();
			const posts = postsExists ? await readPostsFile(postsFila) : [];
			let postIndex = posts.findIndex(p => p.dateFound === postJson.dateFound);
			
			// If the post does not exist within the file, then it simply gets
			// appended to the end.
			if (postIndex < 0)
				postIndex = posts.push(postJson);
			
			// If the post is already in the file, then the original version
			// of the post needs to be replaced with the updated version.
			else for (let i = -1; ++i < posts.length;)
				if (posts[i].dateFound === postJson.dateFound)
					posts[i] = postJson;
			
			const jsonText = JSON.stringify(posts);
			await postsFila.writeText(jsonText);
			this.posts.push(postJson);
		}
		
		/**
		 * Returns the post at the specified index, or null in the case
		 * when the specified index is less than zero or larger than
		 * the number of posts defined within the scroll.
		 */
		getPost(index: number)
		{
			if (index < 0 || index >= this.posts.length)
				return null;
			
			return this.posts[index];
		}
		
		/** */
		getPosts(): readonly IPostJson[]
		{
			return this.posts;
		}
		
		/**
		 * Gets the fully qualified URL where the post resides, which is calculated
		 * by concatenating the post path with the containing feed URL.
		 */
		getPostUrl(post: IPostJson)
		{
			const feed = this.feeds.find(feed => feed.id === post.feedId);
			if (!feed)
				return null;
			
			const feedFolder = HtmlFeed.Url.folderOf(feed.feedUrl);
			return feedFolder + post.path;
		}
		
		/** */
		private getContainingFileName(dateFound: number)
		{
			const date = new Date(dateFound);
			const y = date.getFullYear();
			const m = ("0" + (date.getMonth() + 1)).slice(-2);
			const d = ("0" + date.getDate()).slice(-2);
			return [y, m, d].join("-") + ".json";
		}
	}
	
	/**
	 * Reads the contents of a JSON file that contains multiple posts.
	 */
	async function readPostsFile(postsFila: Fila)
	{
		const postsJson = await postsFila.readText();
		const postsArray = <IPostJson[]>tryParseJson(postsJson);
		
		if (!Array.isArray(postsArray))
			return [];
		
		return postsArray;
	}
		
	
	/**
	 * Gets the directory that contains all the files for one particular scroll instance.
	 */
	async function getScrollDirectory(identifier: string)
	{
		const baseFila = await ScrollApp.getAppDataFila();
		const scrollFila = baseFila.down(identifier);
		
		if (!await scrollFila.exists())
			await scrollFila.writeDirectory();
		
		return scrollFila;
	}
	
	/** */
	interface IScrollJson
	{
		anchorIndex: number;
		feeds: number[];
	}
	
	const scrollJsonName = "scroll.json";
	const feedsJsonName = "feeds.json";
}