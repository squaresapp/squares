
namespace Squares
{
	/** */
	export interface IStartupOptions
	{
		clearData: boolean;
		setupDataCache: boolean;
		setupDefaultData: boolean;
		headless: boolean;
	}
	
	/**
	 * The main entry point of the app.
	 * 
	 * This function is called automatically, in every environment (Tauri, Capacitor),
	 * except when running from a Moduless cover function.
	 */
	export async function startup(options: Partial<IStartupOptions> = {})
	{
		if (document.readyState !== "complete")
		{
			await new Promise<void>(resolve =>
			{
				document.addEventListener("readystatechange", () =>
				{
					if (document.readyState === "complete")
						resolve();
				});
			});
		}
		
		(window as any).t = raw.text.bind(raw);
		
		// The CAPACITOR constant needs to be defined after the document has loaded,
		// otherwise, window.Capacitor will be undefined (on Android, it doesn't appear
		// to be injected right away.
		if (typeof CAPACITOR === "undefined")
			Object.assign(globalThis, { CAPACITOR: typeof Capacitor === "object" });
		
		const g = globalThis as any;
		
		if (ELECTRON)
		{
			const g = globalThis as any;
			g.Electron = Object.freeze({
				app: require("electron"),
				fs: require("fs"),
				path: require("path"),
			});
		}
		else if (TAURI)
		{
			const g = globalThis as any;
			g.Tauri = g.__TAURI__;
			Tauri.appDataDir = await Tauri.path.appDataDir();
		}
		else if (CAPACITOR)
		{
			g.AppLauncher = g.Capacitor?.Plugins?.AppLauncher;
			g.BackgroundFetch = g.Capacitor?.Plugins?.BackgroundFetch;
			g.CapacitorApp = g.Capacitor?.Plugins?.App;
			g.CapClipboard = g.Capacitor?.Plugins?.Clipboard;
			g.Toast = g.Capacitor?.Plugins?.Toast;
		}
		
		if (DEBUG)
		{
			await Data.clear();
			const dataFolder = Util.getDataFolder();
			if (!await dataFolder.exists())
				await dataFolder.writeDirectory();
		}
		
		if (DEBUG || WEB)
			if (options?.setupDefaultData)
				await Refresher.refreshFeeds(Strings.sampleWebfeedColors);
		
		if (options?.setupDataCache)
			await Data.setupDataCache();
		
		if (!options?.headless)
		{
			Squares.appendCssReset();
			const rootHat = new RootHat();
			await rootHat.construct();
			document.body.append(rootHat.head);
		}
	}
	
	// Auto-run the startup function if not running as a moduless cover function
	if (typeof Moduless === "undefined")
		startup({ setupDefaultData: true });
}

typeof module === "object" && Object.assign(module.exports, { Squares });
