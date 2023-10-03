
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
		//private readonly scrollProvider = new ScrollProvider();
		private readonly scrollerBox;
		private readonly grid: GridHat;
		
		/** */
		constructor(private readonly scrollJson: ScrollJson)
		{
			this.head = hot.div(
				{
					height: "100%",
				},
				this.scrollerBox = hot.div(
					"scroller-box",
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
			
			this.showScroller(true);
			this.grid = new GridHat();
			this.grid.head.style.borderRadius = "inherit";
			
			this.grid.handleRender(index =>
			{
				const post = scrollJson.getPost(index);
				if (post === null)
					return null;
				
				return (async () =>
				{
					const maybePoster = await FeedBlit.getPosterFromUrl(post.path);
					return maybePoster || FeedBlit.getErrorPoster();
				})();
			});
			
			this.grid.handleSelect(async (e, index) =>
			{
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
				this.scrollerBox.append(this.grid.head);
			});
		}
		
		/** */
		private async showStory(index: number)
		{
			const post = this.scrollJson.getPost(index);
			if (!post)
				throw new Error();
			
			const reel = await FeedBlit.getReelFromUrl(post.path);
			const sections: HTMLElement[] = [];
			
			if (!reel)
				return void sections.push(FeedBlit.getErrorPoster());
			
			const ownerHat = new StoryOwnerHat();
			const storyHat = new StoryHat(reel.sections, ownerHat);
			
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
					this.scrollerBox.style.transitionDuration = "0s";
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
						const s = this.scrollerBox.style;
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
				
				this.showScroller(true);
			}
			
			const disconnected = () =>
			{
				this.scrollerBox.style.transitionDuration = transitionDuration;
				
				for (const e of Query.ancestors(this.head))
					if (e instanceof HTMLElement)
						e.classList.remove(noOverflowClass);
			}
			
			storyHat.disconnected(disconnected);
			this.head.append(storyHat.head);
			this.showScroller(false);
		}
		
		/** */
		private showScroller(show: boolean)
		{
			const s = this.scrollerBox.style;
			s.transitionDuration = transitionDuration;
			s.transform = translateZ(show ? "0" : translateZMax + "px");
			s.opacity = show ? "1" : "0";
		}
	}
	
	const translateZ = (amount: string) => `perspective(10px) translateZ(${amount})`;
	const translateZMax = -3;
	
	const noOverflowClass = hot.css({
		overflow: "hidden !"
	});
}
