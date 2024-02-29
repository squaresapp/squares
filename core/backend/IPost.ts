
namespace Squares
{
	/** */
	export interface IAbstractPost
	{
		/**
		 * 
		 */
		visited: boolean;
		
		/**
		 * Stores the path of the feed, relative to the URL of the feed text file.
		 */
		path: string;
	}
	
	/** */
	export interface IDiskPost extends IAbstractPost
	{
		/**
		 * Stores the ID of the feed to which this post belongs.
		 */
		feed: number;
	}
	
	/** */
	export interface IPost extends IAbstractPost
	{
		/**
		 * 
		 */
		key: number;
		
		/**
		 * A reference to the feed
		 */
		feed: IFeedDetail;
	}
	
	/** */
	export interface IPostFile
	{
		[key: number]: IDiskPost
	}
}
