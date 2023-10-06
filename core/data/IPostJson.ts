
namespace ScrollApp
{
	/** */
	export interface IPostJson
	{
		/**
		 * 
		 */
		visited: boolean;
		
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
	
	/** */
	export namespace IPostJson
	{
		/** */
		export function create(defaults: Partial<IPostJson> = {}): IPostJson
		{
			return Object.assign({
				visited: false,
				dateFound: Date.now(),
				feedId: 0,
				path: "",
			}, defaults);
		}
	}
}