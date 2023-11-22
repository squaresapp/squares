
namespace ScrollApp
{
	const transitionDuration = "0.5s";
	
	/** */
	export abstract class ScrollViewerHat
	{
		readonly head;
		private readonly gridContainer;
		private readonly grid: GridHat;
		private readonly pullToRefreshHat;
		private selectedGridItem: HTMLElement | null = null;
		
		/** */
		constructor()
		{
			this.grid = new GridHat();
			const borderRadius = (CAPACITOR || DEMO) ? "30px" : 0;
			
			this.head = raw.div(
				{
					height: (CAPACITOR || DEMO) ? "177.7777vw" : "100%",
					alignSelf: "center",
					borderRadius,
					overflow: "hidden",
				},
				this.gridContainer = raw.div(
					"grid-container",
					{
						height: "100%",
						borderRadius,
						overflow: "hidden",
						transitionDuration,
						transitionProperty: "transform, opacity",
					}
				),
				!(CAPACITOR || DEMO) && raw.div(
					Dock.bottomRight(10),
					{
						zIndex: 1,
						color: "white",
						borderRadius: "100%",
						padding: "10px",
						width: "50px",
						height: "50px",
						lineHeight: "33px",
						textAlign: "center",
						fontSize: "25px",
						fontWeight: 700,
					},
					Style.backgroundOverlay(),
					Style.clickable,
					t`↻`,
					raw.on("click", () => this.handleRefreshInner()),
				),
				raw.get(this.pullToRefreshHat = new PullToRefreshHat(this.grid.head))(
					{
						position: "absolute",
						bottom: "20px",
						left: 0,
						right: 0,
						margin: "auto",
					}
				)
			);
			
			Hat.wear(this);
			this.constructGrid();
			this.showGrid(true);
			this.pullToRefreshHat.onRefresh(() => this.handleRefreshInner());
			this.gridContainer.append(this.grid.head);
		}
		
		/** */
		protected abstract getPost(index: number): ReturnType<RenderFn>;
		
		/** */
		protected abstract handleRefresh(): Promise<void>;
		
		/** */
		private async handleRefreshInner()
		{
			await this.handleRefresh();
			this.grid.tryAppendPosters(1);
		}
		
		/** */
		protected abstract getPageInfo(index: number): Promise<{
			readonly head: HTMLElement[];
			readonly sections: HTMLElement[];
			readonly feed: IFeed;
		}>;
		
		/** */
		protected abstract handlePostVisited(index: number): void | Promise<void>;
		
		/** */
		private constructGrid()
		{
			this.grid.head.style.borderRadius = "inherit";
			this.grid.handleRender(index => this.getPost(index));
			this.grid.handleSelect(async (e, index) =>
			{
				this.selectedGridItem = e;
				this.showPage(index);
			});
		}
		
		/** */
		private async showPage(index: number)
		{
			const pageInfo = await this.getPageInfo(index);
			const pageHat = new PageHat(pageInfo.head, pageInfo.sections, pageInfo.feed);
			
			raw.get(pageHat)(
				Dock.cover(),
				{
					transitionDuration,
					transitionProperty: "transform",
					transform: "translateY(110%)",
				},
				raw.on("connected", () => setTimeout(async () =>
				{
					for (const e of Query.ancestors(this.head))
						if (e instanceof HTMLElement)
							e.classList.add(noOverflowClass);
					
					pageHat.head.style.transform = "translateY(0)";
					await UI.waitTransitionEnd(pageHat.head);
					this.gridContainer.style.transitionDuration = "0s";
				})),
				raw.on(this.grid.head, "scroll", async () =>
				{
					if (pageHat.head.isConnected)
					{
						await pageHat.forceRetract();
						this.showGrid(true);
					}
				})
			);
			
			pageHat.onRetract(pct => window.requestAnimationFrame(() =>
			{
				const s = this.gridContainer.style;
				s.transform = translateZ(pct * translateZMax + "px");
				s.opacity = (1 - pct).toString();
			}));
			
			const disconnected = async () =>
			{
				if (this.selectedGridItem)
				{
					const s = this.selectedGridItem.style;
					s.transitionDuration = "0.75s";
					s.transitionProperty = "opacity, filter";
					await UI.wait(1);
					applyVisitedStyle(this.selectedGridItem);
				}
				
				this.selectedGridItem = null;
				this.gridContainer.style.transitionDuration = transitionDuration;
				
				for (const e of Query.ancestors(this.head))
					if (e instanceof HTMLElement)
						e.classList.remove(noOverflowClass);
				
				const info = this.getPost(index);
				if (info)
					this.handlePostVisited(index);
			}
			
			pageHat.onDisconnect(disconnected);
			this.gridContainer.after(pageHat.head);
			this.showGrid(false);
		}
		
		/** */
		private showGrid(show: boolean)
		{
			const s = this.gridContainer.style;
			s.transitionDuration = transitionDuration;
			s.transform = translateZ(show ? "0" : translateZMax + "px");
			s.opacity = show ? "1" : "0";
		}
	}
	
	/**
	 * A specialization of the ScrollViewerHat that supports scenarios where
	 * multiple feeds are multiplexed into a single view.
	 */
	export class ScrollMuxViewerHat extends ScrollViewerHat
	{
		/** */
		constructor(private readonly scroll: IScroll)
		{
			super();
			this.foregroundFetcher = new ForegroundFetcher();
		}
		
		private readonly foregroundFetcher;
		
		/** */
		protected async handleRefresh()
		{
			await this.foregroundFetcher.fetch();
		}
		
		/** */
		protected getPost(index: number)
		{
			if (index >= Data.readScrollPostCount(this.scroll.key))
				return null;
			
			return (async () =>
			{
				block:
				{
					const post = await Data.readScrollPost(this.scroll.key, index);
					if (post === null)
						break block;
					
					const url = Hat.over(this, RootHat).getPostUrl(post);
					if (!url)
						break block;
					
					const poster = await Webfeed.getPosterFromUrl(url);
					if (!poster)
						break block;
					
					return post.visited ? 
						applyVisitedStyle(poster) :
						poster;
				}
				
				return Webfeed.getErrorPoster();
			})();
		}
		
		/** */
		protected async getPageInfo(index: number)
		{
			const post = await Data.readScrollPost(this.scroll.key, index);
			if (!post)
				throw new Error();
			
			const root = Hat.over(this, RootHat);
			const postUrl = root.getPostUrl(post) || "";
			const page = await Webfeed.getPageFromUrl(postUrl);
			const head = page?.head || [];
			const sections: HTMLElement[] = page ?
				page.sections.slice() :
				[Webfeed.getErrorPoster()];
			
			const feed = await Data.readFeed(post.feed.key);
			if (!feed)
				throw new Error();
			
			return { head, sections, feed };
		}
		
		/** */
		protected async handlePostVisited(index: number)
		{
			const post = await Data.readScrollPost(this.scroll.key, index);
			if (post)
			{
				post.visited = true;
				Data.writePost(post);
			}
		}
	}
	
	/**
	 * A specialization of the ScrollViewerHat that supports scenarios where
	 * a single feed is displayed within a single view.
	 */
	export class ScrollFeedViewerHat extends ScrollViewerHat
	{
		/** */
		constructor(
			private readonly feed: IFeed,
			private readonly urls: string[])
		{
			super();
		}
		
		/** */
		protected async handleRefresh()
		{
			
		}
		
		/** */
		protected getPost(index: number)
		{
			if (index < 0 || index >= this.urls.length)
				return null;
			
			const url = this.urls[index];
			
			return (async () =>
			{
				const maybePoster = await Webfeed.getPosterFromUrl(url);
				return maybePoster || Webfeed.getErrorPoster();
			})();
		}
		
		/** */
		protected async getPageInfo(index: number)
		{
			return {
				head: [],
				sections: [],
				feed: this.feed,
			};
		}
		
		/** */
		protected handlePostVisited(index: number) { }
	}
	
	/** */
	function applyVisitedStyle(e: HTMLElement)
	{
		const s = e.style;
		s.filter = "saturate(0) brightness(0.4)";
		return e;
	}
	
	const translateZ = (amount: string) => `perspective(10px) translateZ(${amount})`;
	const translateZMax = -3;
	
	const noOverflowClass = raw.css({
		overflow: "hidden !"
	});
}
