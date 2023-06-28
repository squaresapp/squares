
namespace Rail
{
	const canExitLeft = false;
	const transitionDuration = "0.5s";
	
	/** */
	export class MuxHat
	{
		/** */
		private static async maybeSetupPinger()
		{
			if (this.pinger)
				return;
			
			const pingerFila = await Rail.getPingerFila();
			this.pinger = new Pinger.Service(pingerFila.path);
		}
		private static pinger: Pinger.Service;
		
		readonly head;
		private readonly mux = new Mux();
		private readonly scrollerBox;
		private readonly scroller: ScrollerHat;
		
		/** */
		constructor()
		{
			this.head = hot.div(
				{
					height: "100%",
				},
				this.scrollerBox = hot.div(
					"scroller-box",
					{
						height: "100%",
						borderRadius: "30px",
						overflow: "hidden",
						transitionDuration,
						transitionProperty: "transform, opacity",
					},
				)
			);
			
			Hat.wear(this);
			
			this.showScroller(true);
			this.scroller = new ScrollerHat();
			this.scroller.head.style.borderRadius = "inherit";
			
			this.scroller.handleRender(index =>
			{
				if (index >= this.mux.posts.length)
					return null;
				
				return (async () =>
				{
					const post = this.mux.posts[index];
					const maybePoster = await Reels.getPosterFromUrl(post.path);
					return maybePoster || Reels.getErrorPoster();
				})();
			});
			
			this.scroller.handleSelect(async (e, index) =>
			{
				this.showStory(index);
			});
			
			(async () =>
			{
				await MuxHat.maybeSetupPinger();
				const muxDirectory = await Rail.getAppDataFila();
				await this.mux.load(muxDirectory);
				
				for (const post of this.mux.posts)
				{
					const feed = this.mux.getFeed(post.feedId);
					if (!feed)
					{
						console.error("Feed not found for post: " + post.path);
						continue;
					}
					
					MuxHat.pinger.set(feed.feedUrl);
				}
				
			})().then(() =>
			{
				this.scrollerBox.append(this.scroller.head);
			});
		}
		
		/** */
		private async showStory(index: number)
		{
			const post = this.mux.posts[index];
			const reel = await Reels.getReelFromUrl(post.path);
			const sections: HTMLElement[] = [];
			
			if (!reel)
				return void sections.push(Reels.getErrorPoster());
			
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
				hot.on(this.scroller.head, "scroll", () =>
				{
					const e = storyHat.head;
					
					if (!e.isConnected)
						return;
					
					// This check will indicate whether the storyHat has rightward
					// scrolling inertia. If it does, it's scrolling will halt and it will be
					// necessary to animate the story hat away manually.
					if (e.scrollLeft < e.offsetWidth)
						slideAway("x", e.scrollLeft);
					
					if (e.scrollTop < e.offsetHeight)
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
