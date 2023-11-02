
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
			
			this.head = hot.div(
				{
					height: IOS || ANDROID ? "177.7777vw" : "100%",
					alignSelf: "center",
					borderRadius: isTouch ? "30px" : 0,
					overflow: "hidden",
				},
				this.gridContainer = hot.div(
					"grid-container",
					{
						height: "100%",
						borderRadius: isTouch ? "30px" : 0,
						overflow: "hidden",
						transitionDuration,
						transitionProperty: "transform, opacity",
					}
				),
				!CAPACITOR && hot.div(
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
					hot.text("↻"),
					hot.on("click", () => this.handleRefreshInner()),
				),
				hot.get(this.pullToRefreshHat = new PullToRefreshHat(this.grid.head))(
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
		protected abstract getStory(index: number): Promise<{
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
				this.showStory(index);
			});
		}
		
		/** */
		private async showStory(index: number)
		{
			const story = await this.getStory(index);
			const storyHat = new StoryHat(story.sections, story.feed);
			
			hot.get(storyHat)(
				Dock.cover(),
				{
					transitionDuration,
					transitionProperty: "transform",
					transform: "translateY(110%)",
				},
				hot.on("connected", () => setTimeout(async () =>
				{
					for (const e of Query.ancestors(this.head))
						if (e instanceof HTMLElement)
							e.classList.add(noOverflowClass);
					
					storyHat.head.style.transform = "translateY(0)";
					await UI.waitTransitionEnd(storyHat.head);
					this.gridContainer.style.transitionDuration = "0s";
				})),
				hot.on("scroll", () => window.requestAnimationFrame(() =>
				{
					const h = storyHat.head;
					const scrollTop = Math.ceil(h.scrollTop);
					const scrollLeft = Math.ceil(h.scrollLeft);
					const scrollHeight = Math.ceil(h.scrollHeight);
					const offsetHeight = Math.ceil(h.offsetHeight);
					const offsetWidth = Math.ceil(h.offsetWidth);
					let pct = -1;
					
					if (canExitLeft && scrollLeft < offsetWidth)
						pct = scrollLeft / offsetWidth;
					
					else if (scrollTop < offsetHeight)
						pct = scrollTop / offsetHeight;
					
					else if (scrollTop >= scrollHeight - offsetHeight * 2)
						pct = (scrollHeight - offsetHeight - scrollTop) / offsetHeight;
					
					if (pct >= 0)
					{
						const s = this.gridContainer.style;
						s.transform = translateZ(pct * translateZMax + "px");
						s.opacity = (1 - pct).toString();
						
						if (scrollTop === 0 || scrollTop >= scrollHeight - offsetHeight)
							s.pointerEvents = "all";
					}
				})),
				hot.on(this.grid.head, "scroll", () =>
				{
					const e = storyHat.head;
					
					if (!e.isConnected)
						return;
					
					// This check will indicate whether the storyHat has rightward
					// scrolling inertia. If it does, it's scrolling will halt and it will be
					// necessary to animate the story hat away manually.
					if (e.scrollLeft > 0 && e.scrollLeft < e.offsetWidth)
						slideAway("x", e.scrollLeft);
					
					else if (e.scrollTop > 0 && e.scrollTop < e.offsetHeight)
						slideAway("y", e.scrollTop);
				})
			);
			
			const slideAway = (axis: "x" | "y", amount: number) =>
			{
				const ms = 250;
				const e = storyHat.head;
				e.style.transitionDuration = ms + "ms";
				e.style.transitionProperty = "transform";
				e.style.transform = `translate${axis.toLocaleUpperCase()}(${amount}px)`;
				e.style.pointerEvents = "none";
				
				setTimeout(() =>
				{
					storyHat.head.remove();
					disconnected();
				},
				ms);
				
				this.showGrid(true);
			}
			
			const disconnected = async () =>
			{
				if (this.selectedGridItem)
				{
					const s = this.selectedGridItem.style;
					s.transitionDuration = "0.5s";
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
			
			storyHat.disconnected(disconnected);
			this.gridContainer.after(storyHat.head);
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
					
					const poster = await HtmlFeed.getPosterFromUrl(url);
					if (!poster)
						break block;
					
					return post.visited ? 
						applyVisitedStyle(poster) :
						poster;
				}
				
				return HtmlFeed.getErrorPoster();
			})();
		}
		
		/** */
		protected async getStory(index: number)
		{
			const post = await Data.readScrollPost(this.scroll.key, index);
			if (!post)
				throw new Error();
			
			const root = Hat.over(this, RootHat);
			const postUrl = root.getPostUrl(post) || "";
			const reel = await HtmlFeed.getReelFromUrl(postUrl);
			const sections: HTMLElement[] = reel ?
				reel.sections.slice() :
				[HtmlFeed.getErrorPoster()];
			
			const feed = await Data.readFeed(post.feed.key);
			if (!feed)
				throw new Error();
			
			return { sections, feed };
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
				const maybePoster = await HtmlFeed.getPosterFromUrl(url);
				return maybePoster || HtmlFeed.getErrorPoster();
			})();
		}
		
		/** */
		protected async getStory(index: number)
		{
			return {
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
		s.opacity = "0.5";
		s.filter = "saturate(0)";
		return e;
	}
	
	const translateZ = (amount: string) => `perspective(10px) translateZ(${amount})`;
	const translateZMax = -3;
	
	const noOverflowClass = hot.css({
		overflow: "hidden !"
	});
}
