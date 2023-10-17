
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
				}
			);
			
			Hat.wear(this);
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
			
			TAURI && window.addEventListener("focus", () =>
			{
				
			});
			
			this._appJson = await AppJson.read();
			this._scrollJsons = await this._appJson.readScrolls();
			const paneSwiper = new PaneSwiper();
			
			for (const scrollJson of this.scrollJsons)
			{
				const viewer = new ScrollMuxViewerHat(scrollJson);
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
				bottom: "105px",
			});
			
			this.head.append(dotsHat.head);
			
			paneSwiper.visiblePaneChanged(index =>
			{
				dotsHat.highlight(index);
			});
		}
		
		/** */
		get appJson()
		{
			if (!this._appJson)
				throw new Error();
			
			return this._appJson;
		}
		private _appJson: AppJson | null = null;
		
		/** */
		get scrollJsons()
		{
			if (!this._scrollJsons)
				throw new Error();
			
			return this._scrollJsons;
		}
		private _scrollJsons: ScrollJson[] = [];
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
		const urlBase = ELECTRON || TAURI || SIMULATOR ?
			"http://localhost:43332/" :
			"https://htmlfeeds.github.io/Examples/";
		
		const appDataFila = await ScrollApp.getAppDataFila();
		const scrollFila = appDataFila.down(identifier);
		if (await scrollFila.exists())
			await scrollFila.delete();
		
		const scrollJson = new ScrollJson(identifier);
		const appJson = new AppJson();
		appJson.addScroll(scrollJson.identifier);
		
		const feedPaths = [
			"raccoons/",
			"red-flowers/",
			"trees/",
		];
		
		const feeds: IFeedJson[] = [];
		const urlLists: string[][] = [];
		
		for (const feedPath of feedPaths)
		{
			const feedUrl = urlBase + feedPath + "index.txt";
			const { urls, bytesRead } = await HtmlFeed.getFeedFromUrl(feedUrl);
			urlLists.push(urls);
			
			const feedMeta = await HtmlFeed.getFeedMetaData(feedUrl);
			feeds.push(IFeedJson.create({
				id: Date.now(),
				url: feedUrl,
				icon: feedMeta?.icon || "",
				author: feedMeta?.author || "",
				description: feedMeta?.description || "",
				size: bytesRead,
				dateFollowed: Date.now()
			}));
		}
		
		await scrollJson.addFeeds(...feeds);
		
		const maxLength = urlLists.reduce((a, b) => a > b.length ? a : b.length, 0);
		let incrementingDate = Date.now() - 10 ** 7;
		
		for (let i = -1; ++i < maxLength * urlLists.length;)
		{
			const indexOfList = i % urlLists.length;
			const urlList = urlLists[indexOfList];
			const indexWithinList = Math.floor(i / urlLists.length);
			
			if (urlList.length <= indexWithinList)
				continue;
			
			const feedJsons = feeds[indexOfList];
			const feedDirectory = HtmlFeed.Url.folderOf(feedJsons.url);
			const path = urlList[indexWithinList].slice(feedDirectory.length);
			
			await scrollJson.writePost({
				visited: false,
				dateFound: incrementingDate++,
				feedId: feedJsons.id,
				path,
			});
		}
	}
}
