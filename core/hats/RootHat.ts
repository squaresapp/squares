
namespace Squares
{
	/** */
	export class RootHat
	{
		readonly head;
		
		/** */
		constructor()
		{
			this.head = raw.div(
				UI.noScrollBars,
				{
					height: "inherit",
					top: "env(safe-area-inset-top)",
					tabIndex: 0,
				},
				raw.on(document.body, "squares:follow", () =>
				{
					this.construct();
				}),
				raw.on(document.body, "squares:unfollow", ev =>
				{
					Data.archiveFeed(ev.detail.feedKey);
				})
			);
			
			Hat.wear(this);
		}
		
		/** */
		async construct()
		{
			const scrolls = await Data.readScrolls();
			
			let e: HTMLElement;
			
			if (scrolls.length === 0)
			{
				e = this.renderEmptyState();
			}
			else if (scrolls.length === 1 || scrolls[0].feeds.length > 1)
			{
				e = this.renderScrollState(scrolls);
			}
			else
			{
				const feed = scrolls[0].feeds[0];
				e = this.renderSingleFeedState(feed);
			}
			
			this.head.replaceChildren(e);
		}
		
		/** */
		private renderEmptyState()
		{
			let div: HTMLElement;
			
			return raw.div(
				"empty-state",
				Dock.cover(),
				{
					overflow: "hidden",
					top: "calc(-1.5 * env(safe-area-inset-top))", // centering
				},
				div = raw.div(
					Dock.center(),
					raw.css(" > *", {
						textAlign: "center",
						margin: "40px auto",
						opacity: 0,
						transform: "translateY(80px)",
						transitionProperty: "opacity, transform",
						transitionDuration: "1s",
					}),
					raw.div(e => { e.innerHTML = Images.appLogo }),
					raw.div(
						Style.textTitle1(Strings.openingTitle),
					),
					raw.div(
						{ maxWidth: "17em" },
						Style.textParagraph(Strings.openingMessage)
					),
					Widget.attentionButton(Strings.openingAction, () =>
					{
						Util.openWebLink(Strings.findFeedsUrl);
					},
					{
						href: Strings.findFeedsUrl,
						target: "_blank"
					}),
				),
				raw.on("connected", async () =>
				{
					await UI.wait(10);
					for (const element of Query.children(div))
					{
						const s = element.style;
						s.opacity = "1";
						s.transform = "translateY(0)";
						await UI.wait(200);
					}
				})
			);
		}
		
		/** */
		private renderSingleFeedState(feed: IFeedDetail)
		{
			return new ScrollFeedViewerHat(feed, []).head;
		}
		
		/**
		 * Renders the full application state where there is a 
		 * are multiple feeds multi-plexed within a single scroll.
		 */
		private renderScrollState(scrolls: IScroll[])
		{
			const paneSwiper = new PaneSwiper();
				
			for (const scroll of scrolls)
			{
				const viewer = new ScrollMuxViewerHat(scroll);
				paneSwiper.addPane(viewer.head);
			}
			
			if (paneSwiper.length === 0)
			{
				// Display the first-run experience.
			}
			else
			{
				paneSwiper.addPane(new FollowersHat().head);
				this.head.append(paneSwiper.head);
				
				const dotsHat = new DotsHat();
				dotsHat.insert(2);
				dotsHat.highlight(0);
				
				raw.get(dotsHat.head)({
					position: "absolute",
					left: 0,
					right: 0,
					bottom:
						CAPACITOR ? "105px" :
						DEMO ? 0 :
						"15px",
					margin: "auto",
				});
				
				this.head.append(dotsHat.head);
				
				
				
				paneSwiper.visiblePaneChanged(index =>
				{
					dotsHat.highlight(index);
				});
			}
			
			return paneSwiper.head;
		}
		
		/**
		 * Gets the fully qualified URL where the post resides, which is calculated
		 * by concatenating the post path with the containing feed URL.
		 */
		getPostUrl(post: IPost)
		{
			const feedFolder = Webfeed.getFolderOf(post.feed.url);
			return feedFolder + post.path;
		}
	}
}
