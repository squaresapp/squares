
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
		
		const feedJson: IFeed = {
			author: "Paul Gordon",
			url: "http://localhost:43332/raccoons/index.txt",
			description: "A description of the feed",
			dateFollowed: Date.now(),
			icon: "http://localhost:43332/raccoons/icon.jpg",
			key: 0,
			size: 0,
		};
		
		const hat = new StoryHat(sections, feedJson);
		document.body.append(hat.head);
	}
}
