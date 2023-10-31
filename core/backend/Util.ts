
namespace ScrollApp
{
	export namespace Util
	{
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
		export function parseFollowUri(uri: string)
		{
			uri = uri.trim();
			const prefix = "html://follow?"
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
		export async function getAppDataFila()
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
				const path = FilaCapacitor.directory.documents;
				return Fila.new(path);
			}
			
			throw new Error("Not implemented");
		}
		
		/**
		 * Scans the clipboard for content in the form of a text/uri-list that starts with the
		 * html://subscribe/ URI prefix, and returns a list of the URLs that are stored within
		 * the URI after the prefix.
		 */
		export async function getUrlList()
		{
			if (TAURI)
			{
				const text = (await Tauri.clipboard.readText()) || "";
				const lines = text.split("\n").map(s => s.trim());
				
				if (lines.every(line => line.slice(0, knownPrefix.length) === knownPrefix))
				{
					const urls = lines.map(line =>
					{
						try { return new URL(line.slice(0, knownPrefix.length)); }
						catch (e) { return []; }
					});
					
					if (urls.every(url => !!url))
						return urls as URL[];
				}
				
				return [];
			}
			else throw new Error("Not implemented");
		}
		
		/** */
		export function handleUriListChanged(callback: (urls: URL[]) => void)
		{
			MACOS && (async () =>
			{
				currentClipboardText = await Tauri.clipboard.readText() || "";
				currentClipboardCount = await Tauri.invoke("clipboard_change_count");
				
				const poll = async () =>
				{
					const newCount = Number(await Tauri.invoke("clipboard_change_count"));
					if (newCount !== currentClipboardCount)
					{
						const urls = await getUrlList();
						if (urls.length > 0)
							callback(urls);
					}
					
					setTimeout(poll, delay);
				};
				
				setTimeout(poll, delay);
			})();
		}
		
		let currentClipboardText = "";
		let currentClipboardCount = -1;
		
		const delay = 250;
		const knownPrefix = "html://subscribe/";
	}
}
