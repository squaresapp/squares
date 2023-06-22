
namespace Rail
{
	/** */
	export const enum MuxConst
	{
		aboutFile = "about.json",
		feedsFile = "feeds.json",
		postsFile = "posts.json",
	}
	
	/** */
	export interface IMuxAbout
	{
		anchorIndex: number;
	}
	
	/** */
	export interface IMuxFeed
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
	export interface IMuxPost
	{
		/**
		 * Stores the date (in ticks) when the post was discovered on the feed.
		 * This number is unique, and can be used as an ID
		 */
		dateFound: number;
		
		/**
		 * Stores the ID of the feed to which this post belongs.
		 */
		feedId: number;
		
		/**
		 * Stores the path of the feed, relative to the URL of the feed text file.
		 */
		path: string;
		
	}
}
