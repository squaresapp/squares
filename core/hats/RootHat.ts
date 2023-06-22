
namespace Rail
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
					width: "100vw",
					height: ["100dvh", "100vh"],
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
				hot.div(
					"pair",
					{
						position: "sticky",
						top: 0,
						left: 0,
						width: 0,
						height: "100%",
						scrollSnapAlign: "start",
						scrollSnapStop: "always",
					},
					
					hot.get(new MuxHat())(
						Cq.width(100, "root-hat"),
						{
							height: "100%",
							position: "absolute",
							left: 0,
							top: 0,
						}
					),
					
					hot.get(new FollowersHat())(
						Cq.width(100, "root-hat"),
						Cq.left(100, "root-hat"),
						{
							position: "sticky",
							top: 0,
							bottom: 0,
							height: "100%",
							backgroundColor: "rgba(0, 0, 0, 0.1)",
							backdropFilter: "blur(15px)",
							clipPath: `var(${RootHat.cssSwipeVar})`,
						}
					)
				),
				// This element is required in order to create the
				// scroll-snap stopping effect at the FollowersHat.
				hot.div(
					"pair-stopper",
					Cq.width(100, "root-hat"),
					Cq.left(100, "root-hat"),
					{
						position: "absolute",
						top: 0,
						height: "100%",
						scrollSnapAlign: "start",
						scrollSnapStop: "always",
						pointerEvents: "none",
					},
				),
			);
			
			Hat.wear(this);
			
			//displayThreePanes();
		}
	}
	
	/** */
	function displayThreePanes()
	{
		let feedDiv: HTMLElement;
		let followersDiv: HTMLElement;
		
		const rootDiv = hot.div(
			hot.style(
				"*", {
					position: "relative",
					boxSizing: "border-box",
					margin: 0,
					padding: 0,
				},
				"*::-webkit-scrollbar", {
					display: "none"
				},
			),
			{
				whiteSpace: "nowrap",
				width: "100vw",
				height: "100vh",
				scrollSnapType: "x mandatory",
				overflowX: "auto",
			},
			hot.on("scroll", () =>
			{
				let pct = (rootDiv.scrollLeft / window.innerWidth) * 100;
				pct = 100 - (pct < 50 ? Math.floor(pct) : Math.ceil(pct));
				followersDiv.style.clipPath = `inset(0 0 0 ${pct}%)`;
				// In a real implementation, this will need to operate against
				// a CSS rule which will target many child DIV's
				// You'd also need to speed this up by tracking the last
				// position and then determining the direction of motion.
			}),
			hot.div(
				"pair",
				{
					position: "sticky",
					top: 0,
					left: 0,
					width: 0,
					height: "100%",
					scrollSnapAlign: "start",
					scrollSnapStop: "always",
				},
				feedDiv = hot.div(
					"feed",
					{
						position: "absolute",
						left: 0,
						top: 0,
						width: "100vw",
						height: "100vh",
						backgroundImage: "url(https://htmlreels.b-cdn.net/image.jpg)",
						backgroundSize: "cover",
					}
				),
				followersDiv = hot.div(
					"followers",
					{
						position: "sticky",
						left: "100vw",
						top: 0,
						bottom: 0,
						width: "100vw",
						height: "100vh",
						backgroundColor: "rgba(0, 0, 0, 0.1)",
						backdropFilter: "blur(15px)",
						clipPath: "inset(0 0 0 100%)",
					}
				),
			),
			// Some random spacer?
			hot.div(
				"pair-stopper",
				{
					position: "absolute",
					top: 0,
					left: "100vw",
					width: "100vw",
					height: "100vh",
					scrollSnapAlign: "start",
					scrollSnapStop: "always",
				},
			),
			// Profile hat
			hot.div(
				{
					position: "absolute",
					top: 0,
					left: "200vw",
					width: "100vw",
					height: "100vh",
					background: "linear-gradient(45deg, black, white)",
					scrollSnapAlign: "start",
					scrollSnapStop: "always",
				}
			),
		);
		
		document.body.append(rootDiv);
	}
}
