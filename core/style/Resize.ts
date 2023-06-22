
namespace Rail
{
	export namespace Resize
	{
		/**
		 * Observes the resizing of the particular element, and invokes
		 * the specified callback when the element is resized.
		 */
		export function watch(
			e: HTMLElement,
			callback: (width: number, height: number) => void,
			runInitially: boolean = false)
		{
			if (typeof ResizeObserver !== "undefined")
			{
				new ResizeObserver(rec =>
				{
					if (rec.length === 0)
						return;
					
					const entry = rec[0];
					if (entry.borderBoxSize?.length > 0)
					{
						const size = entry.borderBoxSize[0];
						callback(size.inlineSize, size.blockSize);
					}
					else
					{
						const width = e.offsetWidth;
						const height = e.offsetHeight;
						callback(width, height);
					}
				}).observe(e, { box: "border-box" });
			}
			else hot.get(e)(hot.on(window, "resize", () =>
			{
				window.requestAnimationFrame(() =>
				{
					const width = e.offsetWidth;
					const height = e.offsetHeight;
					callback(width, height);
				});
			}));
			
			if (runInitially)
			{
				const exec = () => callback(e.offsetWidth, e.offsetHeight);
				
				if (e.isConnected)
					exec();
				else
					hot.get(e)(hot.on("connected", exec));
			}
		}
	}
}
