
namespace ScrollApp.Cover
{
	/** */
	export async function coverJson()
	{
		FilaNode.use();
		const app = new Data.AppJson();
		app.scrolls.push(createScroll(), createScroll());
		await app.write();
	}
	
	/** */
	function createScroll()
	{
		const scroll = new Data.ScrollJson();
		scroll.anchorIndex = 1;
		const f1 = createFeed(++feedIndex);
		const f2 = createFeed(++feedIndex);
		scroll.feeds.push(f1, f2);
		
		scroll.posts.push(
			createPost(f1.id),
			createPost(f1.id),
			createPost(f2.id),
			createPost(f2.id),
		);
		
		return scroll;
	}
	
	let feedIndex = 0;
	
	/** */
	function createFeed(id: number)
	{
		return new Data.FeedJson({
			id,
			feedUrl: "https://www.scrollapp.org/feed-" + id + ".txt",
			description: `John Smith (${id})`,
			avatarUrl: "https://www.scrollapp.org/icon/android-icon-192x192.png"
		});
	}
	
	/** */
	function createPost(feedId: number)
	{
		return new Data.PostJson({
			feedId,
			path: "post-" + (++postIndex)
		});
	}
	
	let postIndex = 0;
}
