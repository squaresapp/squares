
namespace ScrollApp
{
	/** */
	export class RootHat
	{
		static readonly cssSwipeVar = "--horizontal-swipe-amount";
		readonly head;
		private readonly scrollsMarker: Comment;
		
		/** */
		constructor()
		{
			this.head = hot.div(
				"root-hat",
				UI.noScrollBars,
				{
					display: "flex",
					width: "100%",
					height: "100%",
					scrollSnapType: "x mandatory",
					overflowX: "auto",
					overflowY: "hidden",
				},
				
				hot.on("scroll", () =>
				{
					let pct = (this.head.scrollLeft / window.innerWidth) * 100;
					pct = 100 - (pct < 50 ? Math.floor(pct) : Math.ceil(pct));
					this.head.style.setProperty(RootHat.cssSwipeVar, `inset(0 0 0 ${pct}%)`);
				}),
				
				hot.get(new ScrollCreatorHat())(
					//?
				),
				
				this.scrollsMarker = document.createComment(""),
			);
			
			Hat.wear(this);
			this.construct();
		}
		
		/** */
		private async construct()
		{
			const appJson = await AppJson.read();
			const scrollJsons = await appJson.readScrolls();
			const nodes = scrollJsons.map(json =>
			{
				return hot.get(new ScrollViewerHat(json))(
					{
						minWidth: "100%",
						width: "100%",
						scrollSnapAlign: "start",
						scrollSnapStop: "always",
					}
				).head
			});
			
			this.scrollsMarker.replaceWith(...nodes);
		}
	}
}
