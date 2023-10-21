
namespace ScrollApp
{
	// 
	
	
	
	
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
				}
			);
			
			Hat.wear(this)
				.wear(UnfollowSignal, id => this.appData.unfollowFeed(id));
		}
		
		/** */
		async construct()
		{
			if (ELECTRON)
				FilaNode.use();
			
			else if (TAURI)
				FilaTauri.use();
			
			else if (CAPACITOR)
				FilaCapacitor.use();
			
			if (DEBUG)
			{
				await debugGenerateJsonFiles();
				debugConnectRefreshTool();
			}
			
			window.addEventListener("focus", () =>
			{
				
			});
			
			window.addEventListener("follow", ev =>
			{
				const followUrl: string = (ev as any).data;
				//! TODO: Capture the follow message here.
			});
			
			this._appData = await AppData.read();
			this._scrollDatas = await this._appData.readScrolls();
			const paneSwiper = new PaneSwiper();
			
			for (const scrollData of this.scrollDatas)
			{
				const viewer = new ScrollMuxViewerHat(scrollData);
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
		get appData()
		{
			if (!this._appData)
				throw new Error();
			
			return this._appData;
		}
		private _appData: AppData | null = null;
		
		/** */
		get scrollDatas()
		{
			if (!this._scrollDatas)
				throw new Error();
			
			return this._scrollDatas;
		}
		private _scrollDatas: ScrollData[] = [];
		
		/**
		 * Gets the fully qualified URL where the post resides, which is calculated
		 * by concatenating the post path with the containing feed URL.
		 */
		getPostUrl(post: IPostJson)
		{
			const feed = this.appData.getFeed(post.feedId);
			if (!feed)
				return null;
			
			const feedFolder = HtmlFeed.Url.folderOf(feed.url);
			return feedFolder + post.path;
		}
	}
	
	//@ts-ignore
	if (!DEBUG) return;
	
	/** */
	function debugConnectRefreshTool()
	{
		let pointerdown = false;
		let timeoutId: any = 0;
		
		document.body.addEventListener("pointerdown", ev =>
		{
			pointerdown = true;
			
			timeoutId = setTimeout(() =>
			{
				if (pointerdown)
					window.location.reload();
			},
			1000);
		});
		
		const end = () =>
		{
			pointerdown = false;
			clearTimeout(timeoutId);
		};
		
		document.body.addEventListener("pointerup", end);
		document.body.addEventListener("pointermove", end);
	}
	
	/**
	 * DEBUG-only function that generates app data files and
	 * stores them in the local file system.
	 */
	export async function debugGenerateJsonFiles()
	{
		const identifier = "scroll-id";
		const urlBase = "https://htmlfeeds.github.io/Examples/";
		
		const appDataFila = await ScrollApp.getAppDataFila();
		const scrollFila = appDataFila.down(identifier);
		if (await scrollFila.exists())
			await scrollFila.delete();
		
		const scrollData = new ScrollData(identifier);
		const appData = new AppData();
		appData.addScroll(scrollData.identifier);
		
		const feedPaths = [
			"raccoons/",
			"red-flowers/",
			"trees/",
		];
		
		const feedsArray: IFeedJson[] = [];
		const urlLists: string[][] = [];
		
		for (const feedPath of feedPaths)
		{
			const feedUrl = urlBase + feedPath + "index.txt";
			const { urls, bytesRead } = await HtmlFeed.getFeedFromUrl(feedUrl);
			urlLists.push(urls);
			
			const feedMeta = await HtmlFeed.getFeedMetaData(feedUrl);
			const feedJson = IFeedJson.create({
				id: Date.now(),
				url: feedUrl,
				icon: feedMeta?.icon || "",
				author: feedMeta?.author || "",
				description: feedMeta?.description || "",
				size: bytesRead,
				dateFollowed: Date.now()
			});
			
			feedsArray.push(feedJson);
			appData.followFeed(feedJson, scrollData.identifier);
		}
		
		const maxLength = urlLists.reduce((a, b) => a > b.length ? a : b.length, 0);
		let incrementingDate = Date.now() - 10 ** 7;
		
		for (let i = -1; ++i < maxLength * urlLists.length;)
		{
			const indexOfList = i % urlLists.length;
			const urlList = urlLists[indexOfList];
			const indexWithinList = Math.floor(i / urlLists.length);
			
			if (urlList.length <= indexWithinList)
				continue;
			
			const feedJson = feedsArray[indexOfList];
			const feedDirectory = HtmlFeed.Url.folderOf(feedJson.url);
			const path = urlList[indexWithinList].slice(feedDirectory.length);
			
			await scrollData.writePost({
				visited: false,
				dateFound: incrementingDate++,
				feedId: feedJson.id,
				path,
			});
		}
	}
}
