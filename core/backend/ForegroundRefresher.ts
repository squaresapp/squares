
namespace Squares
{
	/** */
	export class ForegroundRefresher
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
		private feedIterator: IterableIterator<IFeed> | null = null;
		
		/** */
		async fetch()
		{
			this.stopFetch();
			this.feedIterator = Data.eachFeed();
			const threads: Promise<void>[] = [];
			const modifiedFeeds: IFeed[] = [];
			
			for (let i = -1; ++i < maxFetchThreads;)
			{
				// Creates a "thread" that attempts to ping
				// the URL of the next feed in the line.
				threads.push(new Promise<void>(async r =>
				{
					for (;;)
					{
						const feedIteration = this.feedIterator?.next();
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
			await Fetcher.fetch(...modifiedFeeds);
		}
		
		/** */
		stopFetch()
		{
			for (const ac of this.abortControllers)
				ac.abort();
			
			this.abortControllers.clear();
			this.feedIterator?.return?.();
		}
		
		private readonly abortControllers = new Set<AbortController>();
	}
	
	const maxFetchThreads = 10;
}
