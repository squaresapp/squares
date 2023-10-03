
namespace ScrollApp.Cover
{
	/** */
	export async function coverJson()
	{
		FilaNode.use();
		const appJson = new AppJson();
		const scroll1 = createScrollJson();
		const scroll2 = createScrollJson();
		appJson.addScroll(scroll1.identifier);
		appJson.addScroll(scroll2.identifier);
		await appJson.write();
	}
	
	/** */
	function createScrollJson()
	{
		const scroll = new ScrollJson();
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
			feedUrl: "https://www.scrollapp.org/feed-" + id + ".txt",
			description: `John Smith (${id})`,
			avatarUrl: "https://www.scrollapp.org/icon/android-icon-192x192.png",
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
