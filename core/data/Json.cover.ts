
namespace ScrollApp.Cover
{
	/** */
	export async function coverJson()
	{
		FilaNode.use();
		const appJson = new AppJson();
		const feedsJson = new FeedsJson();
		
		const createFeed = (id: number) =>
		{
			return <IFeedJson>{
				id,
				url: `https://www.scrollapp.org/feed-${id}.txt`,
				author: `John Smith (${id})`,
				description: `Generic description (${id})`,
				icon: "https://www.scrollapp.org/icon/android-icon-192x192.png",
				size: 0,
				dateFollowed: Date.now()
			};
		}
		
		const f1 = createFeed(++feedIndex);
		const f2 = createFeed(++feedIndex);
		feedsJson.addFeed(f1);
		feedsJson.addFeed(f2);
		
		const createPost = (feedId: number) =>
		{
			return IPostJson.create({
				feedId,
				path: "post-" + (++postIndex)
			});
		}
		
		const createScrollJson = () =>
		{
			const scroll = new ScrollJson("scroll-created");
			scroll.anchorIndex = 1;
			
			scroll.addFeeds(f1.id, f2.id);
			scroll.writePost(createPost(f1.id));
			scroll.writePost(createPost(f1.id));
			scroll.writePost(createPost(f2.id));
			scroll.writePost(createPost(f2.id));
			return scroll;
		}
		
		const scroll1 = createScrollJson();
		const scroll2 = createScrollJson();
		await appJson.addScroll(scroll1.identifier);
		await appJson.addScroll(scroll2.identifier);
	}
	
	let feedIndex = 0;
	let postIndex = 0;
}
