
namespace ScrollApp
{
	const transitionDuration = "0.5s";
	
	/** */
	export class ScrollViewerHat
	{
		/** */
		private static async maybeSetupPinger()
		{
			if (this.pinger)
				return;
			
			const pingerFila = await ScrollApp.getPingerFila();
			this.pinger = new Pinger.Service(pingerFila.path);
		}
		private static pinger: Pinger.Service;
		
		readonly head;
		private readonly gridContainer;
		private readonly grid: GridHat;
		private selectedGridItem: HTMLElement | null = null;
		
		/** */
		constructor(private readonly scrollJson: ScrollJson)
		{
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
					},
				)
			);
			
			Hat.wear(this);
			
			this.showGrid(true);
			this.grid = new GridHat();
			this.grid.head.style.borderRadius = "inherit";
			
			this.grid.handleRender(index =>
			{
				const post = scrollJson.getPost(index);
				if (post === null)
					return null;
				
				const postUrl = scrollJson.getPostUrl(post);
				if (!postUrl)
					return null;
				
				return (async () =>
				{
					const maybePoster = await HtmlFeed.getPosterFromUrl(postUrl);
					const poster = maybePoster || HtmlFeed.getErrorPoster();
					return post.visited ? 
						applyVisitedStyle(poster) :
						poster;
				})();
			});
			
			this.grid.handleSelect(async (e, index) =>
			{
				this.selectedGridItem = e;
				this.showStory(index);
			});
			
			(async () =>
			{
				/*
				//! This code is trying to setup pinging in the wrong place
				await ScrollViewerHat.maybeSetupPinger();
				const muxDirectory = await ScrollApp.getAppDataFila();
				await this.scrollProvider.load(muxDirectory);
				
				for (const post of scrollJson.getPosts())
				{
					const feed = this.scrollProvider.getFeed(post.feedId);
					if (!feed)
					{
						console.error("Feed not found for post: " + post.path);
						continue;
					}
					
					ScrollViewerHat.pinger.set(feed.feedUrl);
				}
				*/
				
			})().then(() =>
			{
				this.gridContainer.append(this.grid.head);
			});
		}
		
		/** */
		private async showStory(index: number)
		{
			const post = this.scrollJson.getPost(index);
			if (!post)
				throw new Error();
			
			const postUrl = this.scrollJson.getPostUrl(post) || "";
			const reel = await HtmlFeed.getReelFromUrl(postUrl);
			const sections: HTMLElement[] = [];
			
			if (!reel)
				return void sections.push(HtmlFeed.getErrorPoster());
			
			const feedMetaHat = new FeedMetaHat();
			reel.head
			
			const storyHat = new StoryHat(reel.sections, feedMetaHat);
			
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
				
				post.visited = true;
				await this.scrollJson.writePost(post);
			}
			
			storyHat.disconnected(disconnected);
			this.head.append(storyHat.head);
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
