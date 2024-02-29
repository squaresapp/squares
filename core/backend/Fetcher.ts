
namespace Squares
{
	/**
	 * A namespace of functions which are shared between
	 * the ForegroundFetcher and the BackgroundFetcher.
	 */
	export namespace Fetcher
	{
		/**
		 * 
		 */
		export async function updateModifiedFeeds(modifiedFeeds: IFeedDetail[])
		{
			const scroll = await Data.readScroll();
			
			for (const feed of modifiedFeeds)
			{
				Webfeed.downloadIndex(feed.url).then(async urls =>
				{
					if (!urls)
						return;
					
					const feedUrlFolder = Webfeed.getFolderOf(feed.url);
					if (!feedUrlFolder)
						return null;
					
					const { added, removed } = await Data.writeFeedUpdates(feed, urls);
					
					for (const url of added)
					{
						const path = url.slice(feedUrlFolder.length);
						const post = await Data.writePost({ feed, path });
						
						if (scroll)
							Data.writeScrollPost(scroll.key, post);
					}
				});
			}
		}
	}
}
