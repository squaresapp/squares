
declare const DEBUG: boolean;
declare const ELECTRON: boolean;
declare const TAURI: boolean;
declare const MAC: boolean;
declare const WINDOWS: boolean;
declare const LINUX: boolean;
declare const CAPACITOR: boolean;
declare const IOS: boolean;
declare const ANDROID: boolean;
declare const WEB: boolean;
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
	
	/**
	 * Stores a synchronous version of the variable that stores
	 * appDataDir in Tauri (Accessing system paths in Tauri
	 * is asynchronous, which causes cascading asynchrony).
	 */
	export let appDataDir: string;
}

declare const Capacitor: typeof import("@capacitor/core").Capacitor &
{
	platform: string;
}

declare const Toast: typeof import("@capacitor/toast").Toast;
declare const CapClipboard: typeof import("@capacitor/clipboard").Clipboard;
//declare const BackgroundFetch: typeof import("@transistorsoft/capacitor-background-fetch").BackgroundFetch;
declare const AppLauncher: typeof import("@capacitor/app-launcher").AppLauncher;
declare const CapacitorApp: typeof import("@capacitor/app").App;

// The globalThis value isn't available in Safari, so a polyfill is necessary:
if (typeof globalThis === "undefined")
	(window as any).globalThis = window;

// If the DEBUG flag is undefined, that means that the executing code
// has not passed through terser, and so we are either running in a
// cover function, or in one of the hosts in debug mode. In this case,
// we set the compilation constants explicitly at runtime.
if (typeof DEBUG === "undefined")
	Object.assign(globalThis, { DEBUG: true });

if (typeof WEB === "undefined")
{
	const lo = window.location;
	const host = lo.hostname;
	Object.assign(globalThis, { WEB: !(Number(host.split(".").join("")) > 0) && lo.protocol.startsWith("http") });
}

if (typeof ELECTRON === "undefined")
	Object.assign(globalThis, { ELECTRON: !WEB && typeof screen + typeof require === "objectfunction" });

if (typeof TAURI === "undefined")
	Object.assign(globalThis, { TAURI: typeof window !== "undefined" && typeof (window as any).__TAURI__ !== "undefined" });

if (typeof CAPACITOR === "undefined")
	Object.assign(globalThis, { CAPACITOR: !WEB && !TAURI && !ELECTRON });

if (typeof IOS === "undefined")
	Object.assign(globalThis, { IOS: typeof navigator !== "undefined" && navigator.platform.startsWith("iP") });

if (typeof ANDROID === "undefined")
	Object.assign(globalThis, { ANDROID: typeof navigator !== "undefined" && navigator.userAgent.includes("Android") });

declare const t: typeof raw["text"];
