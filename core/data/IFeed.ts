
namespace Squares
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
		 * Stores a value which can be used for comparison purposes to see if a
		 * feed has been updated.
		 */
		checksum: string;
		
		/**
		 * Stores a value that indicates which post to display in the top-right corner
		 * of the screen when the feed is first loaded. Used to allow the user to pick
		 * up where they left off in content consumption.
		 */
		anchorIndex: number;
		
		/**
		 * Stores the number of posts in the feed.
		 */
		length: number;
	}
	
	/** */
	export interface IFeed extends IDiskFeed
	{
		/** */
		key: number;
	}
}
