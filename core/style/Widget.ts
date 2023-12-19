
namespace ScrollApp
{
	/** */
	export namespace Widget
	{
		/** */
		export function fillButton(...params: Raw.Param[])
		{
			return raw.div(
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
