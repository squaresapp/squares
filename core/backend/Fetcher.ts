
namespace Squares
{
	/**
	 * A namespace of functions that deals with fetching webfeed data,
	 * and 
	 */
	export namespace Fetcher
	{
		/**
		 * Fetches the latest version of one of more feeds, as specified by
		 * the feed object, or by the URL of the webfeed index. The downloaded
		 * data is stored via the data layer.
		 */
		export async function fetch(...targets: (IFeed | string)[]): Promise<IFeed[]>
		{
			const feeds: IFeed[] = [];
			const postsToWrite: Partial<IPost>[] = [];
			
			for (const target of targets)
			{
				const webfeedIndexUrl = typeof target === "string" ? target : target.url;
				
				const [postUrls, checksum, details] = await Promise.all([
					Webfeed.downloadIndex(webfeedIndexUrl),
					Webfeed.ping(webfeedIndexUrl),
					Webfeed.downloadDetails(webfeedIndexUrl)
				]);
				
				const feed = Data.writeFeed(
					typeof target === "string" ? {} : target,
					details || {},
					checksum ? { checksum } : {},
					{
						url: webfeedIndexUrl,
						length: postUrls?.length || 0
					});
				
				if (postUrls)
				{
					const { added, removed } = await Data.writeIndexUpdate(feed, postUrls);
					
					const feedUrlFolder = Webfeed.getFolderOf(feed.url);
					if (!feedUrlFolder)
						return [];
					
					for (const url of added)
					{
						const path = url.slice(feedUrlFolder.length);
						postsToWrite.push({ feed, path });
					}
				}
				
				feeds.push(feed);
			}
			
			await Data.writePosts(...postsToWrite);
			
			for (const feed of feeds)
			{
				const postKeys = postsToWrite
					.filter(p => p.feed?.key === feed.key)
					.map(p => p.key)
					.filter((k): k is number => !!k);
				
				await Data.writeFeedPosts(feed.key, postKeys);
			}
			
			if (feeds.length === 0)
				return [];
			
			if (Data.getScrollCount() === 0)
				Data.writeScroll({ feeds });
			
			return feeds;
		}
	}
}
