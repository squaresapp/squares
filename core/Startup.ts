
namespace ScrollApp
{
	/**
	 * This is the main entry point of the app.
	 * When running in Tauri, this function is called from the auto-generated index.html file.
	 */
	export async function startup()
	{
		if (ELECTRON)
			FilaNode.use();
		
		else if (TAURI)
			FilaTauri.use();
		
		else if (CAPACITOR)
			FilaCapacitor.use();
		
		if (DEBUG && CAPACITOR)
		{
			await debugGetAppDataFiles();
			connectDebugRefreshTool();
		}
		
		ScrollApp.appendCssReset();
		const rootHat = new RootHat();
		document.body.append(rootHat.head);
		
		TAURI && window.addEventListener("focus", () =>
		{
			
		});
	}
	
	//@ts-ignore
	if (!DEBUG) return;
	
	/** */
	function connectDebugRefreshTool()
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
	 * DEBUG-only function that downloads app data files from a
	 * remote server and adds them to the local virtual file system.
	 */
	async function debugGetAppDataFiles()
	{
		const src = "https://htmlreels.b-cdn.net/app-data/";
		const files = [
			"about.json",
			"feeds.json",
			"mux.json",
			"posts.json"
		];
		
		for (const name of files)
		{
			const url = src + name;
			const result = await FeedBlit.getHttpContent(url);
			if (!result)
				continue;
			
			const baseFila = await ScrollApp.getAppDataFila();
			const saveFila = baseFila.down(name);
			await saveFila.writeText(result.text);
		}
	}
}

//@ts-ignore
if (typeof module === "object") Object.assign(module.exports, { ScrollApp });
