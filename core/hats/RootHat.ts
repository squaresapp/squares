
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
			this.setupSystemListeners();
		}
		
		/** */
		async construct()
		{
			const scrolls = Data.getScrolls();
			let e: HTMLElement;
			
			if (scrolls.length === 0)
				e = this.renderEmptyState();
			
			else if (scrolls.length === 1 && scrolls[0].feeds.length === 1)
				e = new FeedSquaresHat(scrolls[0].feeds[0]).head;
			
			else
				e = new ScrollSquaresHat(scrolls[0]).head;
			
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
		
		/**
		 * Renders the full application state where there is a 
		 * are multiple feeds multi-plexed within a single scroll.
		 */
		private renderMultiFeedState(scrolls: IScroll[])
		{
			/*
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
						WEB ? 0 :
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
			*/
		}
		
		/**
		 * 
		 */
		private setupSystemListeners()
		{
			if (CAPACITOR)
			{
				CapacitorApp.addListener("appUrlOpen", ev =>
				{
					this.followUniversalLink(ev.url);
				});
			}
			else if (TAURI)
			{
				// This code needs to setup a clipboard monitor
				// in order to determine when follow links have been
				// copied to the clipboard. The webfeed-follow library
				// needs to add something to the clipboard, the application
				// needs to detect this, and needs to erase the data from
				// the clipboard. This doesn't work very well though,
				// because if the app isn't open, there won't be any
				// clipboard monitoring going on. We need to use custom
				// protocols, but these aren't widely supported in browsers,
				// in seems.
			}
			
			// In platforms other than Capacitor, dragging and dropping
			// links into the webview is supported.
			if (!CAPACITOR)
			{
				raw.get(document.body)(
					raw.on("dragover", ev => ev.preventDefault()),
					raw.on("drop", ev =>
					{
						ev.preventDefault();
						
						for (const item of Array.from(ev.dataTransfer?.items || []))
							if (item.kind === "string" && item.type === "text/uri-list")
								item.getAsString(string => this.followUniversalLink(string));
					})
				);
			}
		}
		
		/**
		 * 
		 */
		private async followUniversalLink(url: string)
		{
			const webfeedUrls = Util.parseUniversalAppLink(url);
			if (webfeedUrls)
				await this.followWebfeedUrls(webfeedUrls);
		}
		
		/**
		 * 
		 */
		private async followWebfeedUrls(webfeedUrls: string | string[])
		{
			debugger;
			const feeds = await Refresher.refreshFeeds(...Util.toArray(webfeedUrls));
			dispatch("squares:follow", { feeds });
			
			if (CAPACITOR)
			{
				const text = webfeedUrls.length > 1 ?
					Strings.nowFollowingCount.replace("?", "" + webfeedUrls.length) :
					Strings.nowFollowing + " " + feeds[0].author;
				
				await Toast.show({
					position: "center",
					duration: "long",
					text
				});
			}
		}
	}
}
