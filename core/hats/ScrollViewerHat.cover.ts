
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
			size: 721,
			dateFollowed: 1696947977011
		};
		
		const feedUrl = "http://localhost:43332/raccoons/index.txt";
		const feedContents = await HtmlFeed.getFeedContents(feedUrl, 0);
		if (!feedContents)
			throw "No feed loaded";
		
		const hat = new ScrollFeedViewerHat(feed, feedContents.urls);
		document.body.append(hat.head);
	}
}
