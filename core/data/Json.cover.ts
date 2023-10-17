
namespace ScrollApp.Cover
{
	/** */
	export async function coverJson()
	{
		FilaNode.use();
		const appJson = new AppData();
		
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
		
		const createPost = (feedId: number) =>
		{
			return IPostJson.create({
				feedId,
				path: "post-" + (++postIndex)
			});
		}
		
		const createScroll = () =>
		{
			const scroll = new ScrollData("scroll-created");
			scroll.anchorIndex = 1;
			scroll.writePost(createPost(f1.id));
			scroll.writePost(createPost(f1.id));
			scroll.writePost(createPost(f2.id));
			scroll.writePost(createPost(f2.id));
			return scroll;
		}
		
		const scroll1 = createScroll();
		const scroll2 = createScroll();
		await appJson.addScroll(scroll1.identifier);
		await appJson.addScroll(scroll2.identifier);
		await appJson.followFeed(f1, scroll1.identifier);
		await appJson.followFeed(f2, scroll2.identifier);
	}
	
	let feedIndex = 0;
	let postIndex = 0;
}
