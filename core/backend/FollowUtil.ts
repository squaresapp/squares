
namespace Squares
{
	export namespace FollowUtil
	{
		/** */
		export function setupSystemListeners()
		{
			if (CAPACITOR)
			{
				CapacitorApp.addListener("appUrlOpen", ev =>
				{
					followWebfeedsFromUniversalLink(ev.url);
				});
			}
			else if (TAURI)
			{
				// This code needs to setup a clipboard monitor
				// in order to determine when follow links have been
				// copied to the clipboard. The webfeed-follow library
				// needs to add something to the clipboard, the application
				// needs to detect this, and needs to erase the data from
				// the clipboard. This doesn't work very well though,
				// because if the app isn't open, there won't be any
				// clipboard monitoring going on. We need to use custom
				// protocols, but these aren't widely supported in browsers,
				// in seems.
			}
			else if (ELECTRON)
			{
				
			}
			
			// In platforms other than Capacitor, drag and dropping of links
			// from the browser is supported.
			if (!CAPACITOR)
			{
				raw.get(document.body)(
					raw.on("dragover", ev => ev.preventDefault()),
					raw.on("drop", ev =>
					{
						ev.preventDefault();
						
						for (const item of Array.from(ev.dataTransfer?.items || []))
							if (item.kind === "string" && item.type === "text/uri-list")
								item.getAsString(string => followWebfeedsFromUniversalLink(string));
					})
				);
			}
		}
		
		/**
		 * 
		 */
		async function followWebfeedsFromUniversalLink(url: string)
		{
			const webfeedUrls = parseUniversalAppLink(url);
			if (webfeedUrls)
				await followWebfeeds(webfeedUrls);
		}
		
		/** */
		function parseUniversalAppLink(urlText: string)
		{
			if (!urlText.startsWith(universalAppLinkPrefix))
				return null;
			
			const queryPos = urlText.indexOf("?");
			if (queryPos < 0)
				return null;
			
			const query = urlText.slice(queryPos + 1);
			const urls = query
				.split("&")
				.map(s => decodeURIComponent(s))
				.map(s => Util.tryParseUrl(s) ? s : null)
				.filter((s): s is string => !!s)
				.map(s => s.trim());
			
			if (urls.length === 0)
				return null;
			
			return urls;
		}
		
		const universalAppLinkPrefix = "https://deeplink.squaresapp.org/follow/";
		
		/**
		 * 
		 */
		export async function followWebfeeds(webfeedUrls: string | string[])
		{
			const feedDetails: IFeedDetail[] = [];
			
			for (const webfeedUrl of Util.toArray(webfeedUrls))
			{
				const urls = await Webfeed.downloadIndex(webfeedUrl);
				if (!urls)
					return;
				
				const checksum = await Webfeed.ping(webfeedUrl);
				if (!checksum)
					return;
				
				const feedDetail = await Webfeed.downloadDetails(webfeedUrl) || {};
				const feed = await Data.writeFeed(feedDetail, { checksum, url: webfeedUrl });
				await Data.writeFeedUpdates(feed, urls);
				feedDetails.push(feed);
			}
			
			if (feedDetails.length === 0)
				return;
			
			if (!Data.hasScrolls())
				await Data.writeScroll({ feeds: feedDetails });
			
			dispatch("squares:follow", { feeds: feedDetails });
			
			if (CAPACITOR)
			{
				const text = webfeedUrls.length > 1 ?
					Strings.nowFollowingCount.replace("?", "" + webfeedUrls.length) :
					Strings.nowFollowing + " " + feedDetails[0].author;
				
				await Toast.show({
					position: "center",
					duration: "long",
					text
				});
			}
		}
	}
}
