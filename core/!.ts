
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

namespace ScrollApp
{
	/**
	 * This is the main entry point of the app.
	 * When running in Tauri, this function is called from the auto-generated index.html file.
	 */
	export async function startup()
	{
		if (DEBUG && CAPACITOR)
		{
			const g = globalThis as any;
			const device = g.Capacitor?.Plugins?.Device;
			const info = await device.getInfo();
			Object.assign(globalThis, { SIMULATOR: info.isVirtual });
		}
		
		ScrollApp.appendCssReset();
		const rootHat = new RootHat();
		await rootHat.construct();
		document.body.append(rootHat.head);
	}
}

//@ts-ignore
if (typeof module === "object") Object.assign(module.exports, { ScrollApp });
