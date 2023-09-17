
namespace ScrollApp.Data
{
	/** */
	export class PostJson
	{
		/** */
		constructor(data: Partial<PostJson> = {})
		{
			Object.assign(this, data);
		}
		
		/**
		 * 
		 */
		seen = false;
		
		/**
		 * Stores the date (in ticks) when the post was discovered on the feed.
		 * This number is unique, and can be used as an ID
		 */
		dateFound = Date.now();
		
		/**
		 * Stores the ID of the feed to which this post belongs.
		 */
		feedId = 0;
		
		/**
		 * Stores the path of the feed, relative to the URL of the feed text file.
		 */
		path = "";
		
		/** */
		toJSON()
		{
			return {
				seen: this.seen,
				dateFound: this.dateFound,
				feedId: this.feedId,
				path: this.path
			};
		}
	}
}