
namespace Rail
{
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
					overflowY: "auto",
				}
			);
			
			this.construct();
			Hat.wear(this);
		}
		
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
			
			scroller.handleSelect((e, index) =>
			{
				debugger;
				//! Implement this.
			});
			
			this.head.append(scroller.head);
		}
		
		private readonly mux: Mux;
	}
}
