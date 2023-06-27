
namespace Rail
{
	/**
	 * 
	 */
	export namespace UI
	{
		/** */
		export function stretch(): Hot.Style[]
		{
			return [
				{ width: "-moz-available" },
				{ width: "-webkit-fill-available" },
				{ width: "fill-available" },
				{ width: "stretch" }
			];
		}
		
		/** */
		export function escape(fn: () => void): Hot.Param[]
		{
			return [
				{ tabIndex: 0 },
				hot.on("keydown", ev =>
				{
					if (ev.key === "Escape")
						fn();
				})
			];
		}
		
		/** */
		export function click(handlerFn: (ev: Event) => void): Hot.Param
		{
			return [
				e => ((e as any).role = "button"),
				Style.clickable,
				hot.on("click", handlerFn)
			];
		}
		
		/** */
		export function wait(ms = 0)
		{
			return new Promise(r => setTimeout(r, ms));
		}
		
		/** */
		export async function waitConnected(e: HTMLElement)
		{
			if (!e.isConnected)
				await new Promise(r => hot.get(e)(hot.on("connected", r)));
			
			// Wait an additional 1ms so that the element becomes transition-ready
			await new Promise(r => setTimeout(r, 1));
		}
		
		/** */
		export async function waitTransitionEnd(e: Element)
		{
			await new Promise<void>(r => e.addEventListener("transitionend", ev =>
			{
				if (ev.target === e)
					r();
			}));
		}
		
		/** */
		export function noScrollBars()
		{
			return hot.style(
				"*::-webkit-scrollbar", {
					display: "none"
				}
			);
		}
		
		/** */
		export function hide()
		{
			const cls = "hide";
			
			if (!hideHasRun)
			{
				hot.style("." + cls, { display: "none !" }).attach();
				hideHasRun = true;
			}
			
			return cls;
		}
		let hideHasRun = false;
		
		/** */
		export function visibleWhenAlone()
		{
			return hot.css(":not(:only-child) !", { display: "none" });
		}
		
		/** */
		export function visibleWhenNotAlone()
		{
			return hot.css(":only-child !", { display: "none" });
		}
		
		/** */
		export function visibleWhenEmpty(watchTarget: HTMLElement): Hot.Param
		{
			return [
				watchTarget.children.length === 0 ? "" : UI.hide(),
				hot.on("connected", ev => addVisibilityObserver(ev.target, watchTarget, true)),
			];
		}
		
		/** */
		export function visibleWhenNotEmpty(watchTarget: HTMLElement): Hot.Param
		{
			return [
				watchTarget.children.length === 0 ? UI.hide() : "",
				hot.on("connected", ev => addVisibilityObserver(ev.target, watchTarget, false)),
			];
		}
		
		/** */
		function addVisibilityObserver(
			visibilityTarget: Node | null,
			watchTarget: HTMLElement,
			forEmpty: boolean)
		{
			if (!(visibilityTarget instanceof HTMLElement))
				return;
			
			const exec = () =>
			{
				const children = Query.children(watchTarget);
				
				if (forEmpty && children.length > 0)
					visibilityTarget.classList.add(UI.hide());
				
				else if (!forEmpty && children.length === 0)
					visibilityTarget.classList.add(UI.hide());
				
				else
					visibilityTarget.classList.remove(UI.hide());
			};
			
			exec();
			UI.onChildrenChanged(watchTarget, exec);
		}
		
		/** */
		export function onChildrenChanged(e: HTMLElement, fn: () => void)
		{
			new MutationObserver(() => fn()).observe(e, { childList: true });
		}
	}
}
