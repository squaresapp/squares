
namespace ScrollApp.Cover
{
	/** */
	export function coverFeedMetaHat()
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
		
		const feedMetaHat = new FeedMetaHat();
		const hat = new StoryHat(sections, feedMetaHat);
		document.body.append(hat.head);
	}
}
