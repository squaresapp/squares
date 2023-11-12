
namespace ScrollApp
{
	/**
	 * Namespace of functions for container query units.
	 */
	export namespace Cq
	{
		/**
		 * 
		 */
		export function width(amount: number, targetContainerClass: string)
		{
			return getProperty("width", "w", amount, targetContainerClass);
		}
		
		/**
		 * 
		 */
		export function height(amount: number, targetContainerClass: string)
		{
			return getProperty("height", "h", amount, targetContainerClass);
		}
		
		/**
		 * 
		 */
		export function left(amount: number, targetContainerClass: string)
		{
			return getProperty("left", "w", amount, targetContainerClass);
		}
		
		/** */
		function getProperty(
			property: string,
			axis: "w" | "h",
			amount: number,
			cls: string): Raw.Param
		{
			if (supportsContainerUnits === null)
				supportsContainerUnits = raw.div({ width: "1cqw" }).style.width !== "";
			
			let container: HTMLElement | null = null;
			
			return e => raw.on("connected", () =>
			{
				container ||= Query.ancestors(e).find((c): c is HTMLElement => 
					c instanceof HTMLElement &&
					c.classList.contains(cls)) || null;
				
				if (!container)
					throw "Container not found.";
				
				if (supportsContainerUnits)
				{
					container.style.containerType = "size";
					e.style.setProperty(property, amount + "cq" + axis);
				}
				else Resize.watch(container, (w, h) =>
				{
					const wOrH = axis === "w" ? w : h;
					const stringified = ((amount / 100) * wOrH).toFixed(3) + "px";
					e.style.setProperty(property, stringified);
				}, true);
			});
		}
		
		let supportsContainerUnits: boolean | null = null;
	}
}