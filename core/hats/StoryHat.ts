
namespace Rail
{
	const canExitLeft = false;
	
	/** */
	export class StoryHat
	{
		readonly head;
		readonly ownerBox;
		readonly disconnected;
		private readonly _disconnected;
		
		/** */
		constructor(
			sections: HTMLElement[],
			private readonly owner: StoryOwnerHat)
		{
			if (sections.length < 1)
				throw new Error("Must have at least one section.");
			
			const snap: Hot.Style = {
				scrollSnapStop: "always",
				scrollSnapAlign: "start",
			};
			
			this.head = hot.div(
				"head",
				{
					width: "100%",
					height: "100%",
					overflow: "auto",
					scrollSnapType: "both mandatory",
				},
				hot.on("connected", () =>
				{
					// The scroll event needs to be behind an additional
					// setTimeout, otherwise it won't skip to the right position.
					// I already tried putting the connected event elsewhere
					// with no luck.
					setTimeout(() =>
					{
						this.head.scrollTo(
							canExitLeft ? this.head.offsetWidth : 0,
							this.head.offsetHeight);
						
						this.setupScrollTracker();
					});
				}),
				hot.div(
					{
						display: "flex",
						flexWrap: "wrap",
						width: canExitLeft ? "200%" : "100%",
					},
					hot.css("> DIV", {
						width: canExitLeft ? "50%" : "100%",
					}),
					hot.div(
						"snap-top",
						snap,
						Cq.height(50, "head"),
						{
							width: "100%",
						}
					),
					this.ownerBox = hot.div(
						"owner",
						snap,
						Cq.height(50, "head"),
						canExitLeft ? { marginLeft: "50%" } : null,
						owner
					),
					sections.map(section =>
					{
						return [
							canExitLeft && hot.div(
								"snap-left",
								snap,
								Cq.height(100, "head"),
							),
							hot.get(section)(
								snap,
								Cq.width(100, "head"),
								Cq.height(100, "head"),
							),
						];
					}),
					hot.div(
						"snap-bottom",
						snap,
						Cq.height(100, "head"),
						{
							width: "100%",
						},
					)
				)
			);
			
			[this.disconnected, this._disconnected] = Force.create<() => void>();
			Hat.wear(this);
		}
		
		/** */
		private setupScrollTracker()
		{
			const e = this.head;
			let lastScrollTop = -1;
			let lastScrollLeft = -1;
			let timeoutId: any = 0;
			
			e.addEventListener("scroll", () =>
			{
				let top = 0;
				let bottom = 0;
				let left = 0;
				
				const w = e.offsetWidth;
				const h = e.offsetHeight;
				
				if (canExitLeft && e.scrollLeft < w)
					left = 1 - e.scrollLeft / w;
				
				if (e.scrollTop < h / 2)
					top = (1 - e.scrollTop / (h / 2));
				
				else if (e.scrollTop > e.scrollHeight - h * 2)
					bottom = (e.scrollTop - h * 2) / h;
				
				top *= 100;
				bottom *= 100;
				left *= 100; 
				
				e.style.clipPath = `inset(${top}% 0 ${bottom}% ${left}%)`;
				
				let pct = 0;
				
				if (e.scrollTop < e.offsetHeight / 2)
					pct = (1 - (e.scrollTop / (e.offsetHeight / 2))) * 100;
					
				this.owner.head.style.transform = `translateY(${pct}%)`;
				
				lastScrollLeft = e.scrollLeft;
				lastScrollTop = e.scrollTop;
				
				clearTimeout(timeoutId);
				timeoutId = setTimeout(() =>
				{
					if (canExitLeft && e.scrollLeft !== lastScrollLeft)
						return;
					
					if (e.scrollTop !== lastScrollTop)
						return;
					
					// A more elegant way to deal with this would be to animate
					// it off the screen... but just removing it is good enough for now
					// because this is just an edge case that isn't going to happen
					// very often.
					if (canExitLeft && e.scrollLeft <= 0 ||
						e.scrollTop <= 0 ||
						e.scrollTop >= e.scrollHeight - e.offsetHeight)
					{
						e.remove();
						this._disconnected();
					}
				});
			});
		}
	}
}
