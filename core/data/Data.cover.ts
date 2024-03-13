
namespace Cover
{
	/** */
	export async function coverData()
	{
		await Squares.Data.clear();
		await Squares.startup({
			headless: true,
			setupDataCache: true,
			setupDefaultData: false,
		});
		
		await Squares.Data.setupDataCache();
		await Squares.Refresher.refreshFeeds(Squares.Strings.sampleWebfeedTulips);
		const scrolls = Squares.Data.getScrolls();
		
		if (scrolls.length !== 1)
			return () => !"No scrolls created";
		
		const scroll = scrolls[0];
		if (scroll.feeds.length !== 1)
			return () => !"Bad scroll data";
		
		const feed = scroll.feeds[0];
		if (feed.url !== Squares.Strings.sampleWebfeedTulips)
			return () => !"Error in feed url";
		
		const posts: Squares.IPost[] = [];
		for (let i = -1; ++i < feed.length;)
		{
			const post = await Squares.Data.readFeedPost(feed.key, i);
			if (!post)
				return () => !"Post came back as null";
			
			posts.push(post);
		}
		
		return () => true;
	}
}
