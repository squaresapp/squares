
namespace Cover
{
	/** */
	export async function coverData()
	{
		await Squares.Data.clear();
		await Squares.startup({
			headless: true,
			skipDataInit: true,
			useDefaultData: false,
		});
		
		await Squares.Data.initialize();
		await Squares.Fetcher.fetch(SampleWebfeedUrls.tulips);
		const scrolls = Squares.Data.getScrolls();
		
		if (scrolls.length !== 1)
			return () => !"No scrolls created";
		
		const scroll = scrolls[0];
		if (scroll.feeds.length !== 1)
			return () => !"Bad scroll data";
		
		const feed = scroll.feeds[0];
		if (feed.url !== SampleWebfeedUrls.tulips)
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
