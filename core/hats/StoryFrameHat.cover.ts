
namespace Rail.Cover
{
	/** */
	export function coverStoryFrameHat()
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
		
		const drawer = hot.div(
			{
				height: "200vh",
				background: "linear-gradient(green, cyan)"
			},
		);
		
		const hat = new StoryFrameHat(sections, drawer);
		document.body.append(hat.head);
	}
}
