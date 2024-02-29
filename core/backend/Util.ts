
namespace Squares
{
	export namespace Util
	{
		/**
		 * Returns the current date in ticks form, but with any incrementation
		 * necessary to avoid returning the same ticks value twice.
		 */
		export function getSafeTicks()
		{
			let now = Date.now();
			
			if (now <= lastTicks)
				now = ++lastTicks;
			
			lastTicks = now;
			return now;
		}
		let lastTicks = 0;
		
		/**
		 * Returns the fully-qualified URL to the icon image
		 * specified in the specified feed.
		 */
		export function getIconUrl(feed: IFeedDetail)
		{
			const folder = Webfeed.getFolderOf(feed.url) || "";
			return new URL(feed.icon, folder).toString();
		}
		
		/**
		 * Safely parses a string JSON into an object.
		 */
		export function tryParseJson<T extends object = object>(jsonText: string): T | null
		{
			try
			{
				return JSON.parse(jsonText);
			}
			catch (e) { }
			
			return null;
		}
		
		/**
		 * Parses the specified URL string and returns a URL object,
		 * or null if the URL fails to parse.
		 */
		export function tryParseUrl(url: string)
		{
			try
			{
				return new URL(url);
			}
			catch (e) { }
			
			return null;
		}
		
		/**
		 * Returns the value wrapped in an array, if it is not already
		 * an array to begin with.
		 */
		export function toArray<T>(value: T | T[]): T[]
		{
			return Array.isArray(value) ? value : [value];
		}
		
		/**
		 * Returns the environment-specific path to the application data folder.
		 */
		export async function getDataFolder()
		{
			if (TAURI)
			{
				const dir = await Tauri.path.appDataDir();
				return new Fila(dir);
			}
			else if (ELECTRON)
			{
				const fila = new Fila(__dirname).down(DEBUG ? "+data" : "data");
				await fila.writeDirectory();
				return fila;
			}
			else if (CAPACITOR)
			{
				// These values are documented here:
				// https://capacitorjs.com/docs/apis/filesystem#directory
				const path = DEBUG ? "DOCUMENTS" : "DATA";
				return new Fila(path);
			}
			else if (DEMO)
			{
				return new Fila();
			}
			
			throw new Error("Not implemented");
		}
		
		/** */
		export async function readClipboard(): Promise<string>
		{
			if (ELECTRON)
			{
				const electron = require("electron");
				return electron.clipboard.readText() || "";
			}
			else if (TAURI)
			{
				const text = await Tauri.clipboard.readText();
				return text || "";
			}
			else if (CAPACITOR)
			{
				try
				{
					const text = await CapClipboard.read();
					return text.value;
				}
				catch (e) { }
			}
			return "";
		}
		
		/** */
		export async function writeClipboard(text: string)
		{
			if (CAPACITOR)
			{
				CapClipboard.write({ string: text });
			}
		}
		
		/**
		 * Removes problematic CSS attributes from the specified section tag,
		 * and ensures that no external CSS is modifying its display propert
		 */
		export function getSectionSanitizationCss(): Raw.Style
		{
			return {
				position: "relative !",
				zIndex: 0,
				width: "auto !",
				height: "100% !",
				margin: "0 !",
				boxSizing: "border-box !",
				display: "block !",
				float: "none !",
				clipPath: "inset(0 0) !",
				mask: "none !",
				opacity: "1 !",
				transform: "none !",
			};
		}
		
		/**
		 * 
		 */
		export async function openWebLink(url: string)
		{
			if (CAPACITOR)
			{
				await AppLauncher.openUrl({ url });
			}
			else if (TAURI)
			{
				
			}
			else
			{
				window.open(url, "_blank");
			}
		}
	}
}
