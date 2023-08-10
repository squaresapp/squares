
namespace ScrollApp
{
	/** */
	export class AppJson
	{
		/** */
		static async read()
		{
			
		}
		
		/** */
		async write()
		{
			
		}
		
		readonly scrolls: ScrollJson[] = [];
	}
	
	/** */
	export class ScrollJson
	{
		/** */
		static async read()
		{
			
		}
		
		/** */
		async write()
		{
			
		}
		
		anchorIndex: number = 0;
		readonly feeds: FeedJson[] = [];
		readonly posts: PostJson[] = [];
	}
	
	export interface IFeedJson
	{
		/**
		 * 
		 */
		readonly id: number,
		
		/**
		 * Stores the URL of the text file that contains the feed information.
		 */
		readonly feedUrl: string,
		
		/**
		 * Stores a description of the feed, which is typically the name of the person
		 * or organization that owns the feed.
		 */
		readonly description: string,
		
		/**
		 * Stores the location of the avatar associated with the feed, which is
		 * extracted from the standard <link rel="icon"> tag.
		 */
		readonly avatarUrl: string,
		
		/**
		 * Stores the number of bytes of the feed file.
		 */
		readonly size: number,
		
		/**
		 * Stores the date (in ticks) when the user began following the feed.
		 */
		readonly dateFollowed: number
	}
	
	/** */
	export class FeedJson
	{
		constructor(readonly data: IFeedJson) { }
	}
	
	/** */
	export interface IPostJson
	{
		/**
		 * Stores the date (in ticks) when the post was discovered on the feed.
		 * This number is unique, and can be used as an ID
		 */
		readonly dateFound: number;
		
		/**
		 * Stores the ID of the feed to which this post belongs.
		 */
		readonly feedId: number;
		
		/**
		 * Stores the path of the feed, relative to the URL of the feed text file.
		 */
		readonly path: string;
	}
	
	/** */
	export class PostJson
	{
		constructor(readonly data: IPostJson) { }
		
		
	}
}
