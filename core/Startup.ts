
namespace Rail
{
	export const hot = new Hot();
	
	/** */
	export function startup()
	{
		Rail.appendCssReset();
		
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
						backgroundImage: getCssUrl("image.jpg"),
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
			hot.div(
				"pair-spacer",
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
	
	/** */
	function renderFeed()
	{
		
	}
	
	/** */
	function getCssUrl(resourceFileName: string)
	{
		const Path = require("path") as typeof import("path");
		const path = Path.join(__dirname, "../resources/" + resourceFileName);
		return "url(" + path + ")";
	}
}

//@ts-ignore
if (typeof module === "object") Object.assign(module.exports, { Rail });
