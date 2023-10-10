
namespace ScrollApp.Cover
{
	/** */
	export async function coverJson()
	{
		FilaNode.use();
		const appJson = new AppJson();
		const scroll1 = createScrollJson();
		const scroll2 = createScrollJson();
		await appJson.addScroll(scroll1.identifier);
		await appJson.addScroll(scroll2.identifier);
	}
	
	/** */
	function createScrollJson()
	{
		const scroll = new ScrollJson("scroll-created");
		scroll.anchorIndex = 1;
		const f1 = createFeed(++feedIndex);
		const f2 = createFeed(++feedIndex);
		scroll.addFeeds(f1, f2);
		scroll.writePost(createPost(f1.id));
		scroll.writePost(createPost(f1.id));
		scroll.writePost(createPost(f2.id));
		scroll.writePost(createPost(f2.id));
		return scroll;
	}
	
	let feedIndex = 0;
	
	/** */
	function createFeed(id: number): IFeedJson
	{
		return {
			id,
			url: `https://www.scrollapp.org/feed-${id}.txt`,
			author: `John Smith (${id})`,
			description: `Generic description (${id})`,
			icon: "https://www.scrollapp.org/icon/android-icon-192x192.png",
			size: 0,
			dateFollowed: Date.now()
		};
	}
	
	/** */
	function createPost(feedId: number)
	{
		return IPostJson.create({
			feedId,
			path: "post-" + (++postIndex)
		});
	}
	
	let postIndex = 0;
}
