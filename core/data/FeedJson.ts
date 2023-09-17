
namespace ScrollApp.Data
{
	/** */
	export class FeedJson
	{
		/** */
		constructor(data: Partial<FeedJson> = {})
		{
			Object.assign(this, data);
		}
		
		/**
		 * 
		 */
		id = 0;
		
		/**
		 * Stores the URL of the text file that contains the feed information.
		 */
		feedUrl = "";
		
		/**
		 * Stores a description of the feed, which is typically the name of the person
		 * or organization that owns the feed.
		 */
		description = "";
		
		/**
		 * Stores the location of the avatar associated with the feed, which is
		 * extracted from the standard <link rel="icon"> tag.
		 */
		avatarUrl = "";
		
		/**
		 * Stores the number of bytes of the feed file.
		 */
		size = 0;
		
		/**
		 * Stores the date (in ticks) when the user began following the feed.
		 */
		dateFollowed = Date.now();
		
		/** */
		toJSON()
		{
			return {
				id: this.id,
				feedUrl: this.feedUrl,
				description: this.description,
				avatarUrl: this.avatarUrl, 
				size: this.size,
				dateFollowed: this.dateFollowed,
			};
		}
	}
}