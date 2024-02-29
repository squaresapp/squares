
namespace Squares
{
	/**
	 * Represents the IFeed object, as it is stored on disk.
	 */
	export interface IDiskFeedDetail
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
		 * Stores a value which can be used for comparison purposes to see if a
		 * feed has been updated.
		 */
		checksum: string;
	}
	
	/** */
	export interface IFeedDetail extends IDiskFeedDetail
	{
		/** */
		key: number;
	}
}
