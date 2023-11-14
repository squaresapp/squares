
namespace ScrollApp.Cover
{
	/** */
	export async function coverScrollFeedViewerHat()
	{
		const feed: IFeed = {
			key: 1696947977011,
			url: "http://localhost:43332/raccoons/index.txt",
			icon: "icon.jpg",
			author: "Mr Raccoons",
			description: "Sample feed of raccoons",
			checksum: "?"
		};
		
		const feedUrl = "http://localhost:43332/raccoons/index.txt";
		const urls = await Libfeed.getFeedUrls(feedUrl);
		if (!urls)
			throw "No feed loaded";
		
		const hat = new ScrollFeedViewerHat(feed, urls);
		document.body.append(hat.head);
	}
}
