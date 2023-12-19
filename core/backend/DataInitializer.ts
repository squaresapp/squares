
namespace Squares
{
	/**
	 * Initializes the app with a list of default feeds, and populates
	 * a single scroll with the content contained within those feeds.
	 */
	export async function runDataInitializer(defaultFeedUrls: string[])
	{
		const feeds: IFeed[] = [];
		const urlLists: string[][] = [];
		
		for (const url of defaultFeedUrls)
		{
			const urls = await Webfeed.getFeedUrls(url);
			if (!urls)
				continue;
			
			const checksum = await Util.getFeedChecksum(url);
			if (!checksum)
				continue;
			
			urlLists.push(urls);
			
			const feedMeta = await Webfeed.getFeedMetaData(url);
			const feed = await Data.writeFeed(feedMeta, { checksum });
			await Data.captureRawFeed(feed, urls);
			feeds.push(feed);
		}
		
		const scroll = await Data.writeScroll({ feeds });
		const maxLength = urlLists.reduce((a, b) => a > b.length ? a : b.length, 0);
		
		for (let i = -1; ++i < maxLength * urlLists.length;)
		{
			const indexOfList = i % urlLists.length;
			const urlList = urlLists[indexOfList];
			const indexWithinList = Math.floor(i / urlLists.length);
			
			if (urlList.length <= indexWithinList)
				continue;
			
			const feed = feeds[indexOfList];
			const feedDirectory = Webfeed.Url.folderOf(feed.url);
			const path = urlList[indexWithinList].slice(feedDirectory.length);
			const post = await Data.writePost({ feed, path });
			await Data.writeScrollPost(scroll.key, post);
		}
	}
}
