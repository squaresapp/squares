
namespace ScrollApp
{
	/**
	 * Represents the IFeed object, as it is stored on disk.
	 */
	export interface IDiskFeed
	{
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
	}
	
	/** */
	export interface IFeed extends IDiskFeed
	{
		/** */
		key: number;
		
		/**
		 * Stores the date (in ticks) when the user began following the feed.
		 */
		dateFollowed: number;
	}
}

