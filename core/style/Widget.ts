
namespace Squares
{
	/** */
	export namespace Widget
	{
		/** */
		export function fillButton(...params: Raw.Param[])
		{
			return raw.div(
				"fill-button",
				{
					display: "inline-block",
					padding: "10px",
					borderRadius: "5px",
					backgroundColor: "rgba(128, 128, 128, 0.5)",
					fontWeight: 500,
				},
				Style.clickable,
				Style.backdropBlur(5),
				...params
			)
		}
		
		/** */
		export function hollowButton(options: {
			text: string,
			click?: (ev: Event) => void,
			params?: Raw.Param,
		})
		{
			return raw.div(
				"hollow-button",
				{
					padding: "15px",
					border: "2px solid " + Pal.gray1,
					borderRadius: "15px",
					color: Pal.gray1,
					textAlign: "center",
					cursor: "pointer",
					whiteSpace: "nowrap",
				},
				options.click && raw.on("click", options.click),
				Style.text(options.text, 23, 500),
			);
		}
		
		/** */
		export function attentionButton(
			text: string,
			click?: (ev: Event) => void,
			...params: Raw.Param<Raw.AnchorElementAttribute>[]
		)
		{
			return raw.a(
				"attention-button",
				{
					display: "block",
					width: "fit-content",
					padding: "1em 3em",
					borderRadius: "10px",
					outline: 0,
					color: "white",
					textDecoration: "none",
					backgroundColor: "hsl(205, 100%, 50%)",
				},
				Style.text(text, 23, 900),
				params
			);
		}
		
		/** */
		export function underlineTextbox(...params: Raw.Param[])
		{
			return raw.input(
				{
					outline: 0,
					border: 0,
					padding: "10px 0",
					borderBottom: "2px solid " + Pal.gray2,
					backgroundColor: "transparent",
					color: "white",
					display: "block",
					fontSize: "inherit",
					spellcheck: false,
				},
				UI.stretch(),
				params
			);
		}
	}
}
