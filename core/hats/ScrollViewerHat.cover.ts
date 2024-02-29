
namespace Cover
{
	/** */
	export async function coverScrollFeedViewerHat()
	{
		await Squares.startup();
		
		const feed: Squares.IFeedDetail = {
			key: 1696947977011,
			url: "https://webfeed-tulips.pages.dev/index.txt",
			icon: "icon.jpg",
			author: "Mr Raccoons",
			description: "Sample feed of raccoons",
			checksum: "?",
		};
		
		const feedUrl = "https://webfeed-tulips.pages.dev/index.txt";
		const urls = await Webfeed.downloadIndex(feedUrl);
		if (!urls)
			throw "No feed loaded";
		
		const hat = new Squares.ScrollFeedViewerHat(feed, urls);
		document.body.append(hat.head);
	}
}
