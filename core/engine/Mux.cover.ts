
namespace ScrollApp.Cover
{
	/** */
	export async function coverScrollAppMux()
	{
		FilaNode.use();
		
		const fila = Fila.new(__dirname, "../+mux.json");
		const mux = new Mux();
		
		const feedUrl1 = "http://localhost:10001/beach-sunset/feed.txt";
		const feed1 = await FeedBlit.getFeedFromUrl(feedUrl1);
		
		const feedUrl2 = "http://localhost:10001/old-church/feed.txt";
		const feed2 = await FeedBlit.getFeedFromUrl(feedUrl2);
		
		const feedUrl3 = "http://localhost:10001/red-flowers/feed.txt";
		const feed3 = await FeedBlit.getFeedFromUrl(feedUrl3);
		
		await mux.load(fila);
		
		const feedId1 = mux.addFeed({ feedUrl: feedUrl1 });
		const feedId2 = mux.addFeed({ feedUrl: feedUrl2 });
		const feedId3 = mux.addFeed({ feedUrl: feedUrl3 });
		
		for (let i = -1; ++i < 4;)
		{
			mux.addPost(feedId1, feed1.urls[i]);
			mux.addPost(feedId2, feed2.urls[i]);
			mux.addPost(feedId3, feed3.urls[i]);
		}
		
		await mux.save();
		debugger;
	}
}
