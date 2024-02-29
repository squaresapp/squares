
namespace Squares
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
		private feedIterator: AsyncGenerator<IFeedDetail, void, unknown> | null = null;
		
		/** */
		async fetch()
		{
			this.stopFetch();
			this.feedIterator = Data.readFeedDetails();
			const threads: Promise<void>[] = [];
			const modifiedFeeds: IFeedDetail[] = [];
			
			for (let i = -1; ++i < maxFetchThreads;)
			{
				// Creates a "thread" that attempts to ping
				// the URL of the next feed in the line.
				threads.push(new Promise<void>(async r =>
				{
					for (;;)
					{
						const feedIteration = await this.feedIterator?.next();
						if (!feedIteration || feedIteration.done)
						{
							// If i is less than the number of "threads" running,
							// and the iterator has run out, that means there's
							// fewer feeds than there are threads (so avoid
							// termination in this case).
							if (i >= maxFetchThreads)
							{
								this.feedIterator = null;
								this.abortControllers.clear();
							}
							
							return r();
						}
						
						const feed = feedIteration.value;
						
						const checksum = await Webfeed.ping(feed.url);
						if (checksum !== feed.checksum)
							modifiedFeeds.push(feed);
					}
				}));
			}
			
			await Promise.all(threads);
			await Fetcher.updateModifiedFeeds(modifiedFeeds);
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
	
	const maxFetchThreads = 10;
}
