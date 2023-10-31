
namespace ScrollApp
{
	/** */
	export class ForegroundFetcher
	{
		/** */
		constructor() { }
		
		/**
		 * Gets whether there is a fetch operation being carried out.
		 */
		get isFetching()
		{
			return !!this.feedIterator;
		}
		private feedIterator: AsyncGenerator<IFeed, void, unknown> | null = null;
		
		/** */
		async startFetch(updateFn: (feed: IFeed) => void)
		{
			this.stopFetch();
			this.feedIterator = Data.readFeeds();
			const promises: Promise<void>[] = [];
			
			for (let i = -1; ++i < numFetchThreads;)
			{
				promises.push(this.startFetchThread(async feed =>
				{
					await Data.writeFeed(feed);
				}));
			}
			
			await Promise.all(promises);
		}
		
		/**
		 * Launches a "thread" that attempts to ping
		 * the URL of the next feed in the line.
		 */
		private async startFetchThread(updateFn: (feed: IFeed) => void)
		{
			for (;;)
			{
				const feedIteration = await this.feedIterator?.next();
				if (!feedIteration || feedIteration.done)
				{
					this.feedIterator = null;
					this.abortControllers.clear();
					return;
				}
				
				const feed = feedIteration.value;
				
				try
				{
					const ac = new AbortController();
					this.abortControllers.add(ac);
					
					const id = setTimeout(() => ac.abort(), pingResponseTimeout);
					const fetchResult = await fetch(feed.url, {
						method: "HEAD",
						mode: "no-cors",
						signal: ac.signal,
					});
					
					this.abortControllers.delete(ac);
					clearTimeout(id);
					
					if (fetchResult.ok)
					{
						const sizeStr = fetchResult.headers.get("Content-Length") || "-1";
						const size = parseInt(sizeStr, 10);
						if (size >= 0)
						{
							feed.size = size;
							updateFn(feed);
							continue;
						}
					}
				}
				catch (e) { }
			}
		}
		
		/** */
		stopFetch()
		{
			for (const ac of this.abortControllers)
				ac.abort();
			
			this.abortControllers.clear();
			this.feedIterator?.return();
		}
		
		private readonly abortControllers = new Set<AbortController>();
	}
	
	const numFetchThreads = 10;
	const pingResponseTimeout = 500;
	
	/**
	 * 
	 */
	export class BackgroundFetcher
	{ 
		/** */
		constructor()
		{
			//! Not implemented
		}
	}
	
	/** */
	async function updateFeedJson(feedJson: IFeed)
	{
		
	}
	
	/**
	 * 
	 */
	async function handlePostFetch(modifiedFeeds: IFeed[])
	{
		for (const modifiedFeed of modifiedFeeds)
		{
			HtmlFeed.getFeedContents(modifiedFeed.url).then(contents =>
			{
				if (!contents)
					return;
				
				
			});
		}
	}
}
