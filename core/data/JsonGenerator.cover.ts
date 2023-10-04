
namespace ScrollApp.Cover
{
	/** */
	export async function generateTestAppData()
	{
		FilaNode.use();
		const urlBase = "http://localhost:43332/";
		const identifier = "scroll-id";
		
		const appDataFila = await ScrollApp.getAppDataFila();
		const scrollFila = appDataFila.down(identifier);
		if (await scrollFila.exists())
			await scrollFila.delete();
		
		const scrollJson = new ScrollJson({ identifier });
		const appJson = new AppJson();
		appJson.addScroll(scrollJson.identifier);
		
		const feedPaths = [
			"raccoons/",
			"red-flowers/",
			"trees/",
		];
		
		const feeds: IFeedJson[] = [];
		const urlLists: string[][] = [];
		
		for (const feedPath of feedPaths)
		{
			const feedUrl = urlBase + feedPath + "index.txt";
			const { urls, bytesRead } = await FeedBlit.getFeedFromUrl(feedUrl);
			urlLists.push(urls);
			
			const feedMeta = await FeedBlit.getFeedMetaData(feedUrl);
			feeds.push(IFeedJson.create({
				id: Date.now(),
				feedUrl,
				avatarUrl: feedMeta?.icon || "",
				description: feedMeta?.description || "",
				size: bytesRead,
				dateFollowed: Date.now()
			}));
		}
		
		await scrollJson.addFeeds(...feeds);
		
		const maxLength = urlLists.reduce((a, b) => a > b.length ? a : b.length, 0);
		let incrementingDate = Date.now() - 10 ** 7;
		
		for (let i = -1; ++i < maxLength * urlLists.length;)
		{
			const indexOfList = i % urlLists.length;
			const urlList = urlLists[indexOfList];
			const indexWithinList = Math.floor(i / urlLists.length);
			
			if (urlList.length <= indexWithinList)
				continue;
			
			const feedJsons = feeds[indexOfList];
			const feedDirectory = FeedBlit.Url.folderOf(feedJsons.feedUrl);
			const path = urlList[indexWithinList].slice(feedDirectory.length);
			
			await scrollJson.writePost({
				seen: false,
				dateFound: incrementingDate++,
				feedId: feedJsons.id,
				path,
			});
		}
	}
}