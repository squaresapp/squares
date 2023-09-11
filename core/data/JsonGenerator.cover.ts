
namespace ScrollApp.Cover
{
	/** */
	export function generateDefaultMux()
	{
		return generateMux([
			"https://htmlreels.b-cdn.net/raccoons/index.txt",
			"https://htmlreels.b-cdn.net/trees/index.txt",
			"https://htmlreels.b-cdn.net/red-flowers/index.txt",
		]);
	}
	
	/** */
	async function generateMux(feedUrls: string[])
	{
		FilaNode.use();
		const outFila = Fila.new(__dirname).up().down("+mux");
		
		const urlLists: string[][] = [];
		let feedIndex = 0;
		const feeds: ScrollApp.IMuxFeed[] = [];
		const posts: ScrollApp.IMuxPost[] = [];
		
		for (const feedUrl of feedUrls)
		{
			const { urls, bytesRead } = await FeedBlit.getFeedFromUrl(feedUrl);
			const feedMeta = await FeedBlit.getFeedMetaData(feedUrl);
			const id = feedIndex++;
			
			const feedInfo: ScrollApp.IMuxFeed = {
				id,
				feedUrl,
				description: feedMeta?.description || "",
				avatarUrl: feedMeta?.icon || "",
				size: bytesRead,
				dateFollowed: Date.now()
			};
			
			feeds.push(feedInfo);
			urlLists.push(urls);
		}
		
		const maxLength = urlLists.reduce((a, b) => a > b.length ? a : b.length, 0);
		let incrementingDate = Date.now() - 10 ** 7;
		
		for (let i = -1; ++i < maxLength * urlLists.length;)
		{
			const indexOfList = i % urlLists.length;
			const urlList = urlLists[indexOfList];
			const indexWithinList = Math.floor(i / urlLists.length);
			
			if (urlList.length <= indexWithinList)
				continue;
			
			const feedInfo = feeds[indexOfList];
			const feedDirectory = FeedBlit.Url.folderOf(feedInfo.feedUrl);
			const path = urlList[indexWithinList]
				.slice(feedDirectory.length)
				.replace(/\/$/, "");
			
			const postInfo: ScrollApp.IMuxPost = {
				dateFound: incrementingDate++,
				feedId: feedInfo.id,
				path,
			};
			
			posts.push(postInfo);
		}
		
		const aboutJson: ScrollApp.IMuxAbout = { anchorIndex: 0 };
		const aboutJsonText = JSON.stringify(aboutJson, null, "\t");
		outFila.down(ScrollApp.MuxConst.aboutFile).writeText(aboutJsonText);
		
		const feedJsonText = JSON.stringify(feeds, null, "\t");
		outFila.down(ScrollApp.MuxConst.feedsFile).writeText(feedJsonText);
		
		const postsJsonText = JSON.stringify(posts, null, "\t");
		outFila.down(ScrollApp.MuxConst.postsFile).writeText(postsJsonText);
	}
}