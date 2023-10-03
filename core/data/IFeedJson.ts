
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
		feedUrl: string;
		
		/**
		 * Stores a description of the feed, which is typically the name of the person
		 * or organization that owns the feed.
		 */
		description: string;
		
		/**
		 * Stores the location of the avatar associated with the feed, which is
		 * extracted from the standard <link rel="icon"> tag.
		 */
		avatarUrl: string;
		
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
		export function create(defaults: Partial<IFeedJson> = {}): IFeedJson
		{
			return Object.assign({
				id: 0,
				feedUrl: "",
				description: "",
				avatarUrl: "",
				size: 0,
				dateFollowed: Date.now(),
			}, defaults);
		}
	}
}