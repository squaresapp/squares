
namespace ScrollApp
{
	/** */
	export class RootHat
	{
		static readonly cssSwipeVar = "--horizontal-swipe-amount";
		readonly head;
		
		/** */
		constructor()
		{
			this.head = hot.div();
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
				//await debugGenerateJsonFiles();
				debugConnectRefreshTool();
			}
			
			ScrollApp.appendCssReset();
			
			TAURI && window.addEventListener("focus", () =>
			{
				
			});
			
			this._appJson = await AppJson.read();
			this._scrollJsons = await this._appJson.readScrolls();
			
			const scrollViewerHats = this.scrollJsons.map(json =>
			{
				return hot.get(new ScrollViewerHat(json))(
					{
						minWidth: "100%",
						width: "100%",
						scrollSnapAlign: "start",
						scrollSnapStop: "always",
					}
				).head
			});
			
			hot.get(this.head)(
				"root-hat",
				UI.noScrollBars,
				{
					display: "flex",
					width: "100%",
					height: "100%",
					scrollSnapType: "x mandatory",
					overflowX: "auto",
					overflowY: "hidden",
				},
				
				hot.on("scroll", () =>
				{
					let pct = (this.head.scrollLeft / window.innerWidth) * 100;
					pct = 100 - (pct < 50 ? Math.floor(pct) : Math.ceil(pct));
					this.head.style.setProperty(RootHat.cssSwipeVar, `inset(0 0 0 ${pct}%)`);
				}),
				
				hot.get(new ScrollCreatorHat())(
					//?
				),
				
				scrollViewerHats
			);
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
			"https://htmlreels.b-cdn.net/";
		
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
			const { urls, bytesRead } = await FeedBlit.getFeedFromUrl(feedUrl);
			urlLists.push(urls);
			
			const feedMeta = await FeedBlit.getFeedMetaData(feedUrl);
			feeds.push(IFeedJson.create({
				id: Date.now(),
				feedUrl,
				avatarUrl: feedMeta?.icon || "",
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
			const feedDirectory = FeedBlit.Url.folderOf(feedJsons.feedUrl);
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
