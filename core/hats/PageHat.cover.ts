
namespace ScrollApp.Cover
{
	/** */
	export function coverStoryHat()
	{
		ScrollApp.appendCssReset();
		
		const sections = [
			hot.div(
				{
					scrollSnapStop: "always",
					scrollSnapAlign: "start",
					backgroundColor: "red",
				}
			),
			hot.div(
				{
					scrollSnapStop: "always",
					scrollSnapAlign: "start",
					backgroundColor: "green",
				}
			),
			hot.div(
				{
					scrollSnapStop: "always",
					scrollSnapAlign: "start",
					backgroundColor: "blue",
				}
			)
		];
		
		const feed: IFeed = {
			key: Util.getSafeTicks(),
			author: "Paul Gordon",
			url: "http://localhost:43332/raccoons/index.txt",
			description: "A description of the feed",
			icon: "http://localhost:43332/raccoons/icon.jpg",
			checksum: "?",
		};
		
		const hat = new PageHat([], sections, feed);
		document.body.append(hat.head);
	}
}
