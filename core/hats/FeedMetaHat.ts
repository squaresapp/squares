
namespace ScrollApp
{
	/** */
	export class FeedMetaHat
	{
		readonly head;
		
		/** */
		constructor()
		{
			this.head = hot.div(
				"feed-meta-hat",
				{
					display: "flex",
					height: "100%",
					padding: CAPACITOR ? 0 : "30px",
				},
				hot.div(
					Style.backdropBlur(5),
					{
						flex: "1 0",
						width: "100%",
						height: "100%",
						backgroundColor: "rgba(128, 128, 128, 0.33)",
						backdropFilter: "blur(8px)",
						borderRadius: "30px",
					}
				)
			);
		}
	}
}
