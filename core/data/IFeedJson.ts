
namespace ScrollApp
{
	/** */
	export interface IFeedJson
	{
		/**
		 * 
		 */
		id: number;
		
		/**
		 * Stores the URL of the text file that contains the feed information.
		 */
		url: string;
		
		/**
		 * Stores the location of the avatar associated with the feed, which is
		 * extracted from the standard <link rel="icon"> tag.
		 */
		icon: string;
		
		/**
		 * Stores the information that was extracted from the <meta name="author">
		 * tag that was found on the URL that referenced the feed.
		 */
		author: string;
		
		/**
		 * Stores a description of the feed, which is typically the name of the person
		 * or organization that owns the feed.
		 */
		description: string;
		
		/**
		 * Stores the number of bytes of the feed file.
		 */
		size: number;
		
		/**
		 * Stores the date (in ticks) when the user began following the feed.
		 */
		dateFollowed: number;
	}
	
	/** */
	export namespace IFeedJson
	{
		/** */
		export function create(...defaults: Partial<IFeedJson>[]): IFeedJson
		{
			return Object.assign(
				{
					id: Date.now(),
					url: "",
					icon: "",
					author: "",
					description: "",
					size: 0,
					dateFollowed: Date.now(),
				},
				...defaults);
		}
		
		/**
		 * Returns the fully-qualified URL to the icon image
		 * specified in the specified feed.
		 */
		export function getIconUrl(feed: IFeedJson)
		{
			const folder = HtmlFeed.Url.folderOf(feed.url);
			return HtmlFeed.Url.resolve(feed.icon, folder);
		}
	}
}