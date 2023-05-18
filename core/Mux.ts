
namespace Rail
{
	/**
	 * 
	 */
	export class Mux
	{
		/** */
		constructor() { }
		
		private filePath = "";
		
		/** */
		async load(fullFilePath: string)
		{
			this.filePath = fullFilePath;
			const fila = Fila.new(fullFilePath);
			if (!await fila.exists())
				return;
			
			const jsonText = await fila.readText();
			const jsonObject = Rail.tryParseJson(jsonText) as IMuxJson;
			if (!(jsonObject instanceof Object))
				return;
			
			this._feeds = jsonObject.feeds || [];
			this._stories = jsonObject.stories || [];
		}
		
		/** */
		async save()
		{
			if (this.filePath === "")
				throw new Error("File path not set.");
			
			const json: IMuxJson = {
				feeds: this._feeds,
				stories: this._stories,
			};
			
			const jsonText = JSON.stringify(json, null, "\t");
			await Fila.new(this.filePath).writeText(jsonText);
		}
		
		/** */
		private async queueSave()
		{
			clearTimeout(this.timeoutId);
			this.timeoutId = setTimeout(() => this.save(), 100);
		}
		private timeoutId: any = null;
		
		/** */
		get feeds(): readonly IFeedInfo[]
		{
			return this._feeds;
		}
		private _feeds: IFeedInfo[] = [];
		
		/** */
		get stories(): readonly IStoryInfo[]
		{
			return this._stories;
		}
		private _stories: IStoryInfo[] = [];
		
		/** */
		addFeed(feedInfo: Partial<IFeedInfo>)
		{
			if (!feedInfo.url)
				throw new Error(".url property must be provided");
			
			feedInfo.id ||= getNextId();
			feedInfo.description ||= "";
			feedInfo.avatarUrl ||= "";
			feedInfo.size ||= 0;
			feedInfo.grouping ||= 0;
			feedInfo.dateFollowed ||= Date.now();
			this._feeds.push(feedInfo as IFeedInfo);
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
			const readResult = await Reels.getFeedFromUrl(feed.url, feed.size);
			if (readResult.bytesRead === 0)
				return;
			
			for (const path of readResult.urls)
				this.addStory(feed.id, path);
			
			feed.size = feed.size + readResult.bytesRead;
			this.queueSave();
		}
		
		/** */
		private getFeedIndex(value: string | number)
		{
			if (typeof value === "string")
			{
				for (let i = this._feeds.length; i-- > 0;)
					if (this._feeds[i].url === value)
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
		async addStory(feedNeedle: number | string, path: string)
		{
			if (typeof feedNeedle === "string" && !this._feeds.some(s => s.url === feedNeedle) ||
				typeof feedNeedle === "number" && !this._feeds.some(s => s.id === feedNeedle))
				throw new Error("Feed not found: " + feedNeedle);
			
			const feedIdx = this.getFeedIndex(feedNeedle);
			const feed = this._feeds[feedIdx];
			
			const storyInfo: IStoryInfo = {
				id: getNextId(),
				feedId: feed.id,
				path,
				dateFound: Date.now(),
			};
			
			this._stories.push(storyInfo);
			this.queueSave();
		}
		
		/** */
		removeStory(id: number)
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
	
	/** */
	export interface IFeedInfo
	{
		/**
		 * 
		 */
		id: number;
		
		/**
		 * Stores the URL of the text file that contains the feed information.
		 */
		url: string;
		
		/**
		 * Stores a description of the feed, which is typically the name of the person
		 * or organization that owns the feed.
		 */
		description: string;
		
		/** */
		avatarUrl: string;
		
		/**
		 * Stores the size of the feed, which is the size of the feed text file in bytes.
		 */
		size: number;
		
		/**
		 * Stores a value which indicates the number of seconds that must have
		 * elapsed before a story can occupy a new space on the feed feed.
		 */
		grouping: number;
		
		/**
		 * Stores the date (in ticks) when the user began following the feed.
		 */
		dateFollowed: number;
	}
	
	/** */
	export interface IStoryInfo
	{
		/**
		 * 
		 */
		id: number;
		
		/**
		 * Stores the ID of the feed to which this story belongs.
		 */
		feedId: number;
		
		/**
		 * Stores the path of the feed, relative to the URL of the feed text file.
		 */
		path: string;
		
		/**
		 * Stores the date (in ticks) when the story was discovered on the feed.
		 */
		dateFound: number;
	}
	
	/** */
	interface IMuxJson
	{
		readonly feeds: IFeedInfo[];
		readonly stories: IStoryInfo[];
	}
}
