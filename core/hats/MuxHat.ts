
namespace Rail
{
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
		
		/** */
		constructor()
		{
			this.mux = new Mux();
			this.head = hot.div(
				{
					height: "100%",
				},
				
				this.scrollerContainer = hot.div(
					"scroll-container",
					{
						height: "100%",
						borderRadius: "30px",
						overflow: "hidden",
						opacity: 1,
						transform: "perspective(10px) translateZ(0)",
						transitionDuration,
						transitionProperty: "transform, opacity",
					}
				)
			);
			
			this.muxHiddenClass = hot.css({
				opacity: "0 !",
				transform: "perspective(10px) translateZ(-3px) !",
				pointerEvents: "none",
			});
			
			this.construct();
			Hat.wear(this);
		}
		
		private readonly scrollerContainer;
		private readonly muxHiddenClass;
		
		/** */
		private async construct()
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
			
			const scroller = new ScrollerHat();
			scroller.head.style.borderRadius = "inherit";
			
			scroller.handleRender(index =>
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
			
			scroller.handleSelect(async (e, index) =>
			{
				const post = this.mux.posts[index];
				const reel = await Reels.getReelFromUrl(post.path);
				const sections: HTMLElement[] = [];
				
				if (!reel)
					return void sections.push(Reels.getErrorPoster());
				
				const drawer = hot.div(new Text("about section is in here"));
				const storyFrameHat = new StoryFrameHat(reel.sections, drawer);
				
				hot.get(storyFrameHat)(
					Dock.cover(),
					{
						transitionDuration,
						transitionProperty: "transform",
						transform: "translateY(110%)",
					},
					hot.on("disconnected", () =>
					{
						this.scrollerContainer.classList.remove(this.muxHiddenClass);
					})
				);
				
				this.head.append(storyFrameHat.head);
				await UI.waitConnected(storyFrameHat.head);
				storyFrameHat.head.style.transform = "translateY(0)";
				this.scrollerContainer.classList.add(this.muxHiddenClass);
			});
			
			this.scrollerContainer.append(scroller.head);
		}
		
		private readonly mux: Mux;
	}
}
