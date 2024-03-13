
namespace Squares
{
	/**
	 * Initializes the app with a list of default feeds, and populates
	 * a single scroll with the content contained within those feeds.
	 */
	export async function runDataInitializer(defaultFeedUrls: string[])
	{
		/*
		const feeds: IFeed[] = [];
		const urlLists: string[][] = [];
		
		for (const url of defaultFeedUrls)
		{
			const urls = await Webfeed.downloadIndex(url);
			if (!urls)
				continue;
			
			const checksum = await Webfeed.ping(url);
			if (!checksum)
				continue;
			
			urlLists.push(urls);
			
			const details = await Webfeed.downloadDetails(url);
			const feed = Data.writeFeed(details || {}, { url, checksum });
			await Data.writeIndexUpdate(feed, urls);
			feeds.push(feed);
		}
		
		const scroll = Data.writeScroll({ feeds: feeds });
		const maxLength = urlLists.reduce((a, b) => a > b.length ? a : b.length, 0);
		
		for (let i = -1; ++i < maxLength * urlLists.length;)
		{
			const indexOfList = i % urlLists.length;
			const urlList = urlLists[indexOfList];
			const indexWithinList = Math.floor(i / urlLists.length);
			
			if (urlList.length <= indexWithinList)
				continue;
			
			const feed = feeds[indexOfList];
			const feedDirectory = Webfeed.getFolderOf(feed.url)!;
			const path = urlList[indexWithinList].slice(feedDirectory.length);
			const post = await Data.writePost({ feed, path });
			await Data.writeScrollPost(scroll.key, post.key);
		}
		*/
	}
}
