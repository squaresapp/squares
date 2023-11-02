
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
					tabIndex: 0,
				},
				hot.on(window, "paste", async ev =>
				{
					const uri = await Util.readClipboardHtmlUri();
					if (uri)
						this.followFeedFromUri(uri);
				}),
				hot.on(window, "follow" as any, ev =>
				{
					this.followFeedFromUri((ev as any).data);
				})
			);
			
			Hat.wear(this)
				.wear(UnfollowSignal, key => Data.archiveFeed(key));
		}
		
		/** */
		async construct()
		{
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
		
		/**
		 * 
		 */
		async followFeedFromUri(htmlUri: string)
		{
			const followUri = Util.parseHtmlUri(htmlUri);
			if (!followUri)
				return;
			
			const urls = await HtmlFeed.getFeedUrls(followUri);
			if (!urls)
				return;
			
			const checksum = await Util.getFeedChecksum(followUri);
			if (!checksum)
				return;
			
			const feedMeta = await HtmlFeed.getFeedMetaData(followUri);
			const feed = await Data.writeFeed(feedMeta || {}, { checksum });
			await Data.captureRawFeed(feed, urls);
			
			Hat.signal(FollowSignal, feed);
			
			if (CAPACITOR)
			{
				await Toast.show({
					position: "center",
					duration: "long",
					text: Strings.nowFollowing + " " + feed.author,
				});
			}
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
