
namespace ScrollApp
{
	/** */
	export function appendCssReset()
	{
		document.head.append(
			raw.style(
				"*", {
					position: "relative",
					padding: 0,
					margin: 0,
					zIndex: 0,
					boxSizing: "border-box",
					webkitFontSmoothing: "antialiased",
					color: "inherit",
					fontSize: "inherit",
				},
				":root", {
					height: isPwa ? "100vh" : "100dvh",
					fontSize: "20px",
					fontFamily: "Inter, -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, roboto, noto, arial, sans-serif",
					color: "white",
					backgroundColor: "black",
				},
				"BODY", {
					height: "inherit",
				},
				// Eliminate margin collapsing
				"ADDRESS, ARTICLE, ASIDE, BLOCKQUOTE, DD, DIV, FORM, "+
				"H1, H2, H3, H4, H4, H6, HEADER, HGROUP, OL, UL, P, PRE, SECTION",  {
					padding: "0.016px 0"
				},
				// No scrollbars anywhere... for now
				"*::-webkit-scrollbar", {
					display: "none"
				},
			)
		);
	}
}
