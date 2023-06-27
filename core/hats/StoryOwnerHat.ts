
namespace Rail
{
	/** */
	export class StoryOwnerHat
	{
		readonly head;
		
		/** */
		constructor()
		{
			this.head = hot.div(
				"story-owner-hat",
				{
					height: "100%",
					padding: "30px",
				},
				hot.div(
					UI.stretchHeight(),
					{
						backgroundColor: "rgba(128, 128, 128, 0.33)",
						backdropFilter: "blur(8px)",
						borderRadius: "20px"
					}
				)
			);
		}
	}
}
