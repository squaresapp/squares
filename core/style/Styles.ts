
namespace ScrollApp
{
	/**
	 * A namespace of functions that produce generic CSS
	 * styling values that aren't particular to any theme.
	 */
	export namespace Style
	{
		/** */
		export function backgroundOverlay(): Raw.Param
		{
			return [
				{
					backgroundColor: "rgba(0, 0, 0, 0.75)",
				},
				Style.backdropBlur(5),
			]
		}
		
		/** */
		export function backdropBlur(pixels = 5): Raw.Style
		{
			const value = pixels > 0 ? `blur(${pixels}px)` : "none";
			return {
				backdropFilter: value,
				webkitBackdropFilter: value,
			};
		}
		
		/** */
		export const unselectable: Raw.Style = {
			userSelect: "none",
			webkitUserSelect: "none",
		};
		
		/** */
		export const presentational: Raw.Style = {
			...unselectable,
			pointerEvents: "none",
			cursor: "default",
		};
		
		/** */
		export const keyable: Raw.Param = {
			tabIndex: 0,
			outline: 0,
		};
		
		/** */
		export const clickable: Raw.Style = {
			...unselectable,
			cursor: "pointer"
		} as const;
		
		/**
		 * Returns styles that produce a font weight whose value
		 * may or may not be perfectly divisible by 100.
		 */
		export function weight(weight: number): Raw.Style
		{
			return {
				fontWeight: weight.toString(),
				...(weight % 100 === 0 ? {} : { fontVariationSettings: "'wght' " + weight })
			};
		}
		
		/**
		 * Displays text at a given font size and weight that
		 * defaults to being unselectable.
		 */
		export function text(label: string = "", size: number | string = 20, weight?: number): Raw.Param[]
		{
			return [
				Style.unselectable,
				{
					fontSize: typeof size === "number" ? size + "px" : size,
				},
				weight ? Style.weight(weight) : null,
				label ? new Text(label) : null,
				e =>
				{
					// Only apply this weakly. The goal here is to get away from the I-beam,
					// but other uses of this function could specify a pointer or something else,
					// so this function shouldn't overwrite that.
					if (e.style.cursor === "")
						e.style.cursor = "default";
				}
			];
		}
		
		export const borderRadiusLarge = "30px";
		export const borderRadiusSmall = "10px";
	}
}
