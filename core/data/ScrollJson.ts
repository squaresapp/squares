
namespace ScrollApp.Data
{
	/**
	 * A class that describes one of many possible JSON files that store
	 * information about a Scroll (which is a composition of multiple feeds).
	 */
	export class ScrollJson
	{
		/** */
		static async read()
		{
			
		}
		
		/** */
		constructor(data: Partial<ScrollJson> = {})
		{
			Object.assign(this, data);
		}
		
		identifier = Date.now().toString(36);
		anchorIndex: number = 0;
		readonly feeds: FeedJson[] = [];
		readonly posts: PostJson[] = [];
		
		/** */
		async write()
		{
			if (this.identifier === "")
				throw new Error("Cannot save. No identifier set.");
			
			const feedsJson = JSON.stringify(this.feeds);
			const postsJson = JSON.stringify(this.posts);
			
			const fila = await Data.getBaseFila();
			const feedsFila = fila.down(this.identifier + feedsJsonNameSuffix);
			const postsFila = fila.down(this.identifier + postsJsonNameSuffix);
			
			await Promise.all([
				feedsFila.writeText(feedsJson),
				postsFila.writeText(postsJson),
			]);
			
		}
	}
	
	const feedsJsonNameSuffix = ".feeds.json";
	const postsJsonNameSuffix = ".posts.json";
}