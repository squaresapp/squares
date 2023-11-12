
namespace ScrollApp
{
	/**
	 * 
	 */
	export namespace UI
	{
		/** */
		export function cornerAbsolute(kind: "tl" | "tr" | "bl" | "br")
		{
			if (kind === "tl")
				return raw.get(UI.corner("tl"))(cornerStyles, { top: 0, left: 0 });
			
			if (kind === "tr")
				return raw.get(UI.corner("tr"))(cornerStyles, { top: 0, right: 0 });
			
			else if (kind === "bl")
				return raw.get(UI.corner("bl"))(cornerStyles, { bottom: 0, left: 0 });
			
			else if (kind === "br")
				return raw.get(UI.corner("br"))(cornerStyles, { bottom: 0, right: 0 });
		}
		
		const size = parseInt(Style.borderRadiusLarge);
		const cornerStyles: Raw.Style = {
			position: "absolute",
			zIndex: 1,
			width: size + "px",
			height: size + "px",
			pointerEvents: "none",
		};
		
		/**
		 * Renders a single inverted rounded corner piece.
		 */
		export function corner(kind: "tl" | "tr" | "bl" | "br")
		{
			let top = 0;
			let right = 0;
			let bottom = 0;
			let left = 0
			
			if (kind === "tl")
				bottom = right = -100;
			
			else if (kind === "tr")
				bottom = left = -100;
			
			else if (kind === "bl")
				top = right = -100;
			
			else if (kind === "br")
				top = left = -100;
			
			return raw.span(
				"corner",
				{
					overflow: "hidden",
					width: "100px",
					height: "100px",
					clipPath: "inset(0 0)"
				},
				raw.span({
					position: "absolute",
					top: top + "%",
					right: right + "%",
					bottom: bottom + "%",
					left: left + "%",
					borderRadius: "100%",
					boxShadow: "0 0 0 1000px black",
				}),
			);
		}
		
		/** */
		export function stretch(): Raw.Style[]
		{
			return [
				{ width: "-moz-available" },
				{ width: "-webkit-fill-available" },
				{ width: "fill-available" },
				{ width: "stretch" }
			];
		}
		
		/** */
		export function escape(fn: () => void): Raw.Param[]
		{
			return [
				{ tabIndex: 0 },
				raw.on("keydown", ev =>
				{
					if (ev.key === "Escape")
						fn();
				})
			];
		}
		
		/** */
		export function click(handlerFn: (ev: Event) => void): Raw.Param
		{
			return [
				e => ((e as any).role = "button"),
				Style.clickable,
				raw.on("click", handlerFn)
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
				await new Promise(r => raw.get(e)(raw.on("connected", r)));
			
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
			return raw.style(
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
				raw.style("." + cls, { display: "none !" }).attach();
				hideHasRun = true;
			}
			
			return cls;
		}
		let hideHasRun = false;
		
		/** */
		export function visibleWhenAlone()
		{
			return raw.css(":not(:only-child) !", { display: "none" });
		}
		
		/** */
		export function visibleWhenNotAlone()
		{
			return raw.css(":only-child !", { display: "none" });
		}
		
		/** */
		export function visibleWhenEmpty(watchTarget: HTMLElement): Raw.Param
		{
			return [
				watchTarget.children.length === 0 ? "" : UI.hide(),
				raw.on("connected", ev => addVisibilityObserver(ev.target, watchTarget, true)),
			];
		}
		
		/** */
		export function visibleWhenNotEmpty(watchTarget: HTMLElement): Raw.Param
		{
			return [
				watchTarget.children.length === 0 ? UI.hide() : "",
				raw.on("connected", ev => addVisibilityObserver(ev.target, watchTarget, false)),
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
		
		/** */
		export async function collapse(e: HTMLElement)
		{
			const height = e.offsetHeight;
			e.style.marginBottom = "0px";
			e.style.clipPath = "inset(0 0 0 0)";
			e.style.transitionProperty = "opacity, margin-bottom, clip-path";
			e.style.transitionDuration = "0.5s";
			await UI.wait();
			e.style.opacity = "0";
			e.style.marginBottom = "-" + height + "px";
			e.style.clipPath = "inset(0 0 100% 0)";
			await UI.waitTransitionEnd(e);
		}
		
		/** */
		export async function fade(e: HTMLElement)
		{
			e.style.transitionProperty = "opacity";
			e.style.transitionDuration = "0.5s";
			e.style.pointerEvents = "none";
			
			if (!e.style.opacity)
				e.style.opacity = "1";
			
			await UI.wait();
			e.style.opacity = "0";
			await UI.waitTransitionEnd(e);
			e.style.visibility = "hidden";
		}
	}
}
