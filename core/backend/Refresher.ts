
namespace Squares
{
	/**
	 * A namespace of functions that deals with fetching webfeed data,
	 * and 
	 */
	export namespace Refresher
	{
		/**
		 * Fetches the latest version of one of more feeds, as specified by
		 * the feed object, or by the URL of the webfeed index. The downloaded
		 * data is stored via the data layer, and any provided IFeed objects
		 * are updated in-place.
		 */
		export async function refreshFeeds(...targets: (IFeed | string)[]): Promise<IFeed[]>
		{
			const postsToWrite: Partial<IPost>[] = [];
			const feedsIn: IFeed[] = targets.map(target =>
				typeof target !== "string" ? target : { url: target } as IFeed);
			
			const feedsOut: IFeed[] = [];
			
			for (const feedIn of feedsIn)
			{
				const [indexResult, details] = await Promise.all([
					Webfeed.downloadIndex(feedIn.url),
					Webfeed.downloadDetails(feedIn.url)
				]);
				
				const index = indexResult?.index || [];
				const checksum = indexResult?.checksum || "";
				
				const feedOut = Data.writeFeed(
					feedIn,
					details || {},
					checksum ? { checksum } : {},
					{
						url: feedIn.url,
						length: index.length
					});
				
				if (index)
				{
					const { added, removed } = await Data.writeIndexUpdate(feedOut, index);
					
					const feedUrlFolder = Webfeed.getFolderOf(feedOut.url);
					if (!feedUrlFolder)
						return [];
					
					for (const url of added)
					{
						const path = url.slice(feedUrlFolder.length);
						postsToWrite.push({ feed: feedOut, path });
					}
				}
				
				feedsOut.push(feedOut);
			}
			
			await Data.writePosts(...postsToWrite);
			
			for (const feed of feedsOut)
			{
				const postKeys = postsToWrite
					.filter(p => p.feed?.key === feed.key)
					.map(p => p.key)
					.filter((k): k is number => !!k);
				
				await Data.writeFeedPosts(feed.key, postKeys);
			}
			
			if (feedsOut.length === 0)
				return [];
			
			if (Data.getScrollCount() === 0)
				Data.writeScroll({ feeds: feedsOut });
			
			return feedsOut;
		}
		
		/**
		 * 
		 */
		export function refreshAllFeeds()
		{
			throw new Error("Not implemented.");
		}
		
		/**
		 * 
		 */
		export function refreshAllFeedsInBackground()
		{
			throw new Error("Not implemented.");
		}
	}
	
	
	/**
	 * Unused, but this will come back.
	 */
	class ForegroundRefresher
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
			await Refresher.refreshFeeds(...modifiedFeeds);
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
