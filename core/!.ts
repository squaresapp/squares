
declare const DEBUG: boolean;
declare const ELECTRON: boolean;
declare const TAURI: boolean;
declare const MACOS: boolean;
declare const IOS: boolean;
declare const ANDROID: boolean;
declare const CAPACITOR: boolean;
declare const SIMULATOR: boolean;
declare const Moduless: { getRunningFunctionName(): string; }

declare namespace Electron
{
	export const fs: typeof import("fs");
	export const path: typeof import("path");
}

declare namespace Tauri
{
	export const fs: typeof import("@tauri-apps/api").fs;
	export const cli: typeof import("@tauri-apps/api").cli;
	export const clipboard: typeof import("@tauri-apps/api").clipboard;
	export const dialog: typeof import("@tauri-apps/api").dialog;
	export const event: typeof import("@tauri-apps/api").event;
	export const globalShortcut: typeof import("@tauri-apps/api").globalShortcut;
	export const http: typeof import("@tauri-apps/api").http;
	export const invoke: typeof import("@tauri-apps/api").invoke;
	export const notification: typeof import("@tauri-apps/api").notification;
	export const os: typeof import("@tauri-apps/api").os;
	export const path: typeof import("@tauri-apps/api").path;
	export const process: typeof import("@tauri-apps/api").process;
	export const shell: typeof import("@tauri-apps/api").shell;
	export const tauri: typeof import("@tauri-apps/api").tauri;
	export const updater: typeof import("@tauri-apps/api").updater;
	export const window: typeof import("@tauri-apps/api").window;
}

declare const Capacitor: typeof import("@capacitor/core").Capacitor &
{
	platform: string;
}

// The globalThis value isn't available in Safari, so a polyfill is necessary:
if (typeof globalThis === "undefined")
	(window as any).globalThis = window;

// If the DEBUG flag is undefined, that means that the executing code
// has not passed through terser, and so we are either running in a
// cover function, or in one of the hosts in debug mode. In this case,
// we set the compilation constants explicitly at runtime.
if (typeof DEBUG === "undefined")
	Object.assign(globalThis, { DEBUG: true });

if (typeof ELECTRON === "undefined")
	Object.assign(globalThis, { ELECTRON: typeof screen + typeof require === "objectfunction" });

if (typeof TAURI === "undefined")
	Object.assign(globalThis, { TAURI: typeof window !== "undefined" && typeof (window as any).__TAURI__ !== "undefined" });

if (typeof MACOS === "undefined")
	Object.assign(globalThis, { MACOS: (navigator.platform || "").indexOf("Mac") === 0 });

if (typeof IOS === "undefined")
	Object.assign(globalThis, { IOS: navigator.platform.startsWith("iP") });

if (typeof ANDROID === "undefined")
	Object.assign(globalThis, { ANDROID: navigator.userAgent.includes("Android") });

if (typeof CAPACITOR === "undefined")
	Object.assign(globalThis, { CAPACITOR: IOS || ANDROID });

if (typeof SIMULATOR === "undefined")
	Object.assign(globalThis, { SIMULATOR: false });

if (ELECTRON)
{
	const g = globalThis as any;
	g.Electron = Object.freeze({
		fs: require("fs"),
		path: require("path")
	});
}
else if (TAURI)
{
	const g = globalThis as any;
	g.Tauri = g.__TAURI__;
}

const isPwa = 
	"standalone" in navigator ||
	window.matchMedia("(display-mode: standalone)").matches;

const isTouch =  matchMedia("(pointer:coarse)").matches;
const hot = new Hot();

declare const Device: typeof import("@capacitor/device").Device;

// Bindings for the Toast plugin
declare const Toast: typeof import("@capacitor/toast").Toast;

// Bindings for the Background Fetch plugin
declare const BackgroundFetch: typeof import("@transistorsoft/capacitor-background-fetch").BackgroundFetch;

declare const CapClipboard: typeof import("@capacitor/clipboard").Clipboard;

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
		
		const g = globalThis as any;
		
		if (CAPACITOR)
		{
			g.Toast = g.Capacitor?.Plugins?.Toast;
			g.BackgroundFetch = g.Capacitor?.Plugins?.BackgroundFetch;
			g.Capactor?.Clipboard;
			g.Device = g.Capacitor?.Plugins?.Device;
		}
		
		if (DEBUG)
		{
			if (CAPACITOR)
			{
				const device = g.Capacitor?.Plugins?.Device;
				const info = await device.getInfo();
				Object.assign(globalThis, { SIMULATOR: info.isVirtual });
			}
			
			await debugGenerateJsonFiles();
			debugConnectRefreshTool();
		}
		
		ScrollApp.appendCssReset();
		await Data.initialize();
		const rootHat = new RootHat();
		await rootHat.construct();
		document.body.append(rootHat.head);
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
	async function debugGenerateJsonFiles()
	{
		const dataFolder = await Util.getDataFolder();
		if (!await dataFolder.exists())
			await dataFolder.writeDirectory();
		
		await Data.clear();
		const feeds: IFeed[] = [];
		const urlLists: string[][] = [];
		
		const feedUrls = [
			"https://htmlfeeds.github.io/Examples/trees/index.txt",
			"https://htmlfeeds.github.io/Examples/raccoons/index.txt",
		];
		
		for (const url of feedUrls)
		{
			const urls = await HtmlFeed.getFeedUrls(url);
			if (!urls)
				continue;
			
			const checksum = await Util.getFeedChecksum(url);
			if (!checksum)
				continue;
			
			urlLists.push(urls);
			
			const feedMeta = await HtmlFeed.getFeedMetaData(url);
			const feed = await Data.writeFeed(feedMeta || {}, { checksum });
			await Data.captureRawFeed(feed, urls);
			feeds.push(feed);
		}
		
		const scroll = await Data.writeScroll({ feeds });
		const maxLength = urlLists.reduce((a, b) => a > b.length ? a : b.length, 0);
		
		for (let i = -1; ++i < maxLength * urlLists.length;)
		{
			const indexOfList = i % urlLists.length;
			const urlList = urlLists[indexOfList];
			const indexWithinList = Math.floor(i / urlLists.length);
			
			if (urlList.length <= indexWithinList)
				continue;
			
			const feed = feeds[indexOfList];
			const feedDirectory = HtmlFeed.Url.folderOf(feed.url);
			const path = urlList[indexWithinList].slice(feedDirectory.length);
			const post = await Data.writePost({ feed, path });
			await Data.writeScrollPost(scroll.key, post);
		}
		
		console.log("Debug data files recreated.");
	}
}

//@ts-ignore
if (typeof module === "object") Object.assign(module.exports, { ScrollApp });