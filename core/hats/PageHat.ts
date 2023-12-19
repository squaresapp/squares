
namespace Squares
{
	/** */
	export class PageHat
	{
		readonly head;
		private readonly swiper;
		private readonly scrollable;
		
		readonly onDisconnect;
		private readonly _onDisconnect;
		
		readonly onRetract;
		private readonly _onRetract;
		
		/** */
		constructor(
			head: HTMLElement[],
			sections: HTMLElement[],
			private readonly feed: IFeed)
		{
			if (sections.length < 1)
				throw new Error("Must have at least one section.");
			
			if (CAPACITOR || DEMO)
			{
				raw.get(sections[0])({
					borderTopLeftRadius: Style.borderRadiusLarge + " !",
					borderTopRightRadius: Style.borderRadiusLarge + " !",
				});
			}
			
			for (const section of sections)
			{
				raw.get(section)(
					Util.getSectionSanitizationCss(),
					{
						scrollSnapStop: "always !",
						scrollSnapAlign: "start",
					},
				);
			}
			
			this.swiper = new PaneSwiper();
			const metaHat = new FeedMetaHat(this.feed);
			const metaHatHeight = 200;
			
			this.head = raw.div(
				"head",
				{
					width: "100%",
					height: "100%",
				},
				raw.on("connected", () =>
				{
					this.swiper.setVisiblePane(1);
					this.setupRetractionTracker();
					
					setTimeout(() =>
					{
						const e = this.scrollable;
						e.scrollTo(0, e.offsetHeight + metaHatHeight);
					});
				}),
				this.swiper
			);
			
			this.scrollable = raw.div(
				"scrollable-element",
				{
					scrollSnapType: "y mandatory",
					overflowY: "auto",
					height: "100%",
				},
				raw.div(
					"snap-top",
					snap,
					{ height: "100%" },
				),
				raw.get(metaHat)(
					{
						height: (metaHatHeight - 10) + "px",
						marginBottom: "10px",
						backgroundColor: "rgba(128, 128, 128, 0.33)",
						borderRadius: Style.borderRadiusLarge,
					},
					Style.backdropBlur(8),
					snap,
				),
				(CAPACITOR || DEMO) && raw.div(
					"corners-container",
					{
						position: "absolute",
						left: 0,
						right: 0,
						zIndex: 2,
						pointerEvents: "none",
					},
					[
						UI.cornerAbsolute("tl"),
						UI.cornerAbsolute("tr"),
					],
				),
				raw.div(
					"shadow-container",
					{ display: "contents" },
					raw.shadow(
						...head,
						raw.body(
							{ display: "contents !" },
							...sections
						)
					),
				),
				raw.div(
					"snap-bottom",
					snap,
					{ height: "100%" }
				)
			);
			
			this.swiper.addPane(raw.div("exit-left-element"));
			this.swiper.addPane(this.scrollable);
			
			[this.onRetract, this._onRetract] = Force.create<(percent: number) => void>();
			[this.onDisconnect, this._onDisconnect] = Force.create<() => void>();
			this.onDisconnect(() => this.head.remove());
			
			Hat.wear(this);
		}
		
		/** */
		private setupRetractionTracker()
		{
			const e = this.scrollable;
			let lastScrollTop = -1;
			let lastScrollLeft = -1;
			let timeoutId: any = 0;
			
			const handler = () =>
			{
				let clipTop = 0;
				let clipBottom = 0;
				let clipLeft = 0;
				
				const w = e.offsetWidth;
				const offsetHeight = e.offsetHeight;
				const scrollHeight = e.scrollHeight;
				const scrollLeft = this.swiper.head.scrollLeft;
				const scrollTop = e.scrollTop;
				
				clipTop = offsetHeight - scrollTop;
				
				if (scrollLeft < w)
					clipLeft = 1 - scrollLeft / w;
				
				else if (scrollTop > scrollHeight - offsetHeight)
					clipBottom = scrollTop - (scrollHeight - offsetHeight);
				
				clipLeft *= 100; 
				this.head.style.clipPath = `inset(${clipTop}px 0 ${clipBottom}px ${clipLeft}%)`;
				
				// Deal with retraction notification
				let retractPct = -1;
				
				if (scrollLeft < w)
					retractPct = scrollLeft / w;
				
				else if (scrollTop < offsetHeight)
					retractPct = scrollTop / offsetHeight;
				
				else if (scrollTop >= scrollHeight - offsetHeight * 2)
					retractPct = (scrollHeight - offsetHeight - scrollTop) / offsetHeight;
				
				if (retractPct > 0)
					this._onRetract(retractPct);
				
				// Remove the element if necessary
				clearTimeout(timeoutId);
				if (retractPct > 0)
				{
					lastScrollLeft = scrollLeft;
					lastScrollTop = scrollTop;
					
					timeoutId = setTimeout(() =>
					{
						if (scrollLeft !== lastScrollLeft)
							return;
						
						if (scrollTop !== lastScrollTop)
							return;
						
						// A more elegant way to deal with this would be to animate
						// it off the screen... but just removing it is good enough for now
						// because this is just an edge case that isn't going to happen
						// very often.
						if (scrollLeft <= 2||
							scrollTop <= 2 ||
							scrollTop >= scrollHeight - offsetHeight - 2)
						{
							this._onDisconnect();
						}
					});
				}
			};
			
			e.addEventListener("scroll", handler);
			this.swiper.head.addEventListener("scroll", handler);
		}
		
		/** */
		forceRetract()
		{
			return new Promise<void>(r =>
			{
				const slideAway = (axis: "x" | "y", amount: number) =>
				{
					const ms = 100;
					const e = this.head;
					e.style.transitionDuration = ms + "ms";
					e.style.transitionProperty = "transform";
					e.style.transform = `translate${axis.toLocaleUpperCase()}(${amount}px)`;
					e.style.pointerEvents = "none";
					
					setTimeout(() =>
					{
						this._onDisconnect();
						r();
					},
					ms);
				}
				
				const e = this.scrollable;
				const w = e.offsetWidth;
				const offsetHeight = e.offsetHeight;
				const scrollLeft = this.swiper.head.scrollLeft;
				const scrollTop = e.scrollTop;
				
				// This check will indicate whether the pageHat has rightward
				// scrolling inertia. If it does, it's scrolling will halt and it will be
				// necessary to animate the pageHat away manually.
				if (scrollLeft > 0 && scrollLeft < w)
					slideAway("x", scrollLeft);
				
				else if (scrollTop > 0 && scrollTop < offsetHeight)
					slideAway("y", scrollTop);
			});
		}
	}
	
	const snap: Raw.Style = {
		scrollSnapStop: "always",
		scrollSnapAlign: "start",
	};
}
