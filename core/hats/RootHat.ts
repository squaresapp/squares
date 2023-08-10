
namespace ScrollApp
{
	/** */
	export class RootHat
	{
		static readonly cssSwipeVar = "--horizontal-swipe-amount";
		readonly head;
		
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
					
				),
				
				hot.get(new ScrollHat())(
					{
						minWidth: "100%",
						width: "100%",
						scrollSnapAlign: "start",
						scrollSnapStop: "always",
					}
				),
			);
			
			Hat.wear(this);
		}
	}
}
