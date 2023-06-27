
namespace Rail.Cover
{
	/** */
	export function coverStoryHat()
	{
		Rail.appendCssReset();
		
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
		
		const ownerHat = new StoryOwnerHat();
		const hat = new StoryHat(sections, ownerHat);
		document.body.append(hat.head);
	}
}
