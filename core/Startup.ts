
namespace Rail
{
	/**
	 * This is the main entry point of the app.
	 * When running in Tauri, this function is called from the auto-generated index.html file.
	 */
	export async function startup()
	{
		if (!ELECTRON)
		{
			FilaKeyva.use();
		
			if (DEBUG)
				await debugGetAppDataFiles();
		}
		
		Rail.appendCssReset();
		const rootHat = new RootHat();
		document.body.append(rootHat.head);
	}
	
	//@ts-ignore
	if (!DEBUG) return;
	
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
			const result = await Reels.getHttpContent(url);
			if (!result)
				continue;
			
			// This should be FilaKeyva
			const fila = Fila.new(name);
			await fila.writeText(result.text);
		}
	}
}

//@ts-ignore
if (typeof module === "object") Object.assign(module.exports, { Rail });
