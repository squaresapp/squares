


namespace Squares
{
	/**
	 * A class that creates a series of panes that swipe horizontally on mobile.
	 */
	export class PaneSwiper
	{
		readonly head;
		
		/** */
		constructor()
		{
			this.head = raw.div(
				Dock.cover(),
				{
					whiteSpace: "nowrap",
					overflowX: "auto",
					overflowY: "hidden",
					scrollSnapType: "x mandatory",
				},
				raw.css(" > DIV", {
					display: "inline-block",
					width: "100%",
					height: "100%",
					whiteSpace: "normal",
					scrollSnapAlign: "start",
					scrollSnapStop: "always",
					overflowX: "hidden",
					overflowY: "auto",
				}),
				raw.on("scroll", () => this.updateVisiblePane()),
			);
			
			Hat.wear(this);
			[this.visiblePaneChanged, this._visiblePaneChanged] = 
				Force.create<(visiblePaneIndex: number) => void>();
		}
		
		/** */
		readonly visiblePaneChanged;
		private readonly _visiblePaneChanged;
		
		/** */
		addPane(element: HTMLElement, at: number = -0)
		{
			const pane = raw.div(
				"swiper-pane",
				{
					height: "100%",
					overflowX: "hidden",
					overflowY: "auto",
					whiteSpace: "normal",
				},
				element
			);
			
			if (at >= this.head.childElementCount || Object.is(at, -0))
			{
				this.head.append(pane);
			}
			else if (at < 0)
			{
				at = Math.max(0, this.head.childElementCount + at);
				const children = Array.from(this.head.children);
				children[at].before(pane);
			}
		}
		
		/** */
		setVisiblePane(index: number)
		{
			const w = this.head.offsetWidth;
			this.head.scrollBy(w * index, 0);
		}
		
		/** */
		private updateVisiblePane()
		{
			const w = this.head.offsetWidth;
			const s = this.head.scrollLeft;
			const paneIndex = Math.round(s / w);
			
			if (paneIndex !== this.lastVisiblePane)
				this._visiblePaneChanged(paneIndex);
			
			this.lastVisiblePane = paneIndex;
		}
		
		private lastVisiblePane = 0;
		
		/** Gets the number of panes in the PaneSwiper. */
		get length()
		{
			return this.head.childElementCount;
		}
	}
}
