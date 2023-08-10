
namespace ScrollApp
{
	/** */
	export namespace ClipboardMonitor
	{
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
