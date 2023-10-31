
namespace ScrollApp
{
	/** */
	export class RootHat
	{
		readonly head;
		
		/** */
		constructor()
		{
			this.head = hot.div(
				UI.noScrollBars,
				{
					height: "inherit",
					top: "env(safe-area-inset-top)",
				},
				hot.on(window, "follow" as any, async ev =>
				{
					const htmlUri: string = (ev as any).data;
					const feedJson = await this.followFeedFromUri(htmlUri);
					if (!feedJson)
						return;
					
					await Toast.show({
						position: "center",
						duration: "long",
						text: Strings.nowFollowing + " " + feedJson.author
					});
				})
			);
			
			Hat.wear(this)
				.wear(UnfollowSignal, key => Data.archiveFeed(key));
		}
		
		/** */
		async construct()
		{
			this._foregroundFetcher = new ForegroundFetcher();
			const paneSwiper = new PaneSwiper();
			
			for await (const scroll of Data.readScrolls())
			{
				const viewer = new ScrollMuxViewerHat(scroll);
				paneSwiper.addPane(viewer.head);
			}
			
			paneSwiper.addPane(new FollowersHat().head);
			this.head.append(paneSwiper.head);
			
			const dotsHat = new DotsHat();
			dotsHat.insert(2);
			dotsHat.highlight(0);
			
			hot.get(dotsHat.head)({
				position: "absolute",
				left: 0,
				right: 0,
				bottom: CAPACITOR ? "105px" : "15px",
				margin: "auto",
			});
			
			this.head.append(dotsHat.head);
			
			paneSwiper.visiblePaneChanged(index =>
			{
				dotsHat.highlight(index);
			});
		}
		
		/** */
		get foregroundFetcher()
		{
			return this._foregroundFetcher!;
		}
		private _foregroundFetcher: ForegroundFetcher | null = null;
		
		/**
		 * 
		 */
		async followFeedFromUri(htmlUri: string)
		{
			const followUri = Util.parseFollowUri(htmlUri);
			if (!followUri)
				return null;
			
			const feedContents = await HtmlFeed.getFeedContents(followUri);
			if (!feedContents)
				return null;
			
			const feedMeta = await HtmlFeed.getFeedMetaData(followUri);
			const feed = await Data.writeFeed(feedMeta || {}, { size: feedContents.bytesRead });
			//await this.appData.followFeed(feed, this.scrollDatas[0].identifier);
			
			Hat.signal(FollowSignal, feed);
			return feed;
		}
		
		/**
		 * Gets the fully qualified URL where the post resides, which is calculated
		 * by concatenating the post path with the containing feed URL.
		 */
		getPostUrl(post: IPost)
		{
			const feedFolder = HtmlFeed.Url.folderOf(post.feed.url);
			return feedFolder + post.path;
		}
	}
}
