
namespace ScrollApp
{
	export namespace Util
	{
		/** */
		export async function getFeedChecksum(feedUrl: string)
		{
			try
			{
				const ac = new AbortController();
				const id = setTimeout(() => ac.abort(), timeout);
				
				const fetchResult = await fetch(feedUrl, {
					method: "HEAD",
					mode: "no-cors",
					signal: ac.signal,
				});
				
				clearTimeout(id);
				
				if (!fetchResult.ok)
					return null;
				
				const len = fetchResult.headers.get("Content-Length") || "";
				const mod = fetchResult.headers.get("Last-Modified") || "";
				
				if (!len && !mod)
					return null;
					
				const checksum = (mod + ";" + len).replace(/[,:\s]/g, "");
				return checksum;
			}
			catch (e) { }
			
			return null;
		}
		
		const timeout = 500;
		
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
		export function getIconUrl(feed: IFeed)
		{
			const folder = HtmlFeed.Url.folderOf(feed.url);
			return HtmlFeed.Url.resolve(feed.icon, folder);
		}
		
		/**
		 * Parses URIs as specified in the HTML feeds specification found at:
		 * https://www.scrollapp.org/specs/htmlfeeds/
		 */
		export function parseHtmlUri(uri: string)
		{
			uri = uri.trim();
			const prefix = "html://follow?";
			
			if (!uri.startsWith(prefix))
				return "";
			
			uri = uri.slice(prefix.length);
			
			if (uri.length > 2048)
				return "";
			
			try
			{
				const url = new URL(uri);
				return url.toString();
			}
			catch (e) { }
			
			return "";
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
		 * Returns the environment-specific path to the application data folder.
		 */
		export async function getDataFolder()
		{
			if (TAURI)
			{
				const dir = await Tauri.path.appDataDir();
				return Fila.new(dir);
			}
			else if (ELECTRON)
			{
				const fila = Fila.new(__dirname).down("data");
				await fila.writeDirectory();
				return fila;
			}
			else if (CAPACITOR)
			{
				const path = DEBUG ?
					FilaCapacitor.directory.documents :
					FilaCapacitor.directory.data;
				
				return Fila.new(path);
			}
			
			throw new Error("Not implemented");
		}
		
		/** */
		export async function readClipboardHtmlUri()
		{
			const text = await readClipboard();
			const uri = parseHtmlUri(text);
			return uri ? text : "";
		}
		
		/** */
		export async function readClipboard()
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
				const text = await CapClipboard.read();
				return text.value;
			}
			return "";
		}
	}
}
