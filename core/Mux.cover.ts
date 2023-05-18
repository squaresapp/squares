
namespace Rail.Cover
{
	/** */
	export async function coverRailMux()
	{
		const feedUrl1 = "http://localhost:10001/beach-sunset/feed.txt";
		const feed1 = await Reels.getFeedFromUrl(feedUrl1);
		
		const feedUrl2 = "http://localhost:10001/old-church/feed.txt";
		const feed2 = await Reels.getFeedFromUrl(feedUrl2);
		
		const feedUrl3 = "http://localhost:10001/red-flowers/feed.txt";
		const feed3 = await Reels.getFeedFromUrl(feedUrl3);
		
		const fila = Fila.new(__dirname, "../+mux.json");
		fila.writeText("{}");
		const mux = new Mux();
		await mux.load(fila.path);
		
		const feedId1 = mux.addFeed({ url: feedUrl1 });
		const feedId2 = mux.addFeed({ url: feedUrl2 });
		const feedId3 = mux.addFeed({ url: feedUrl3 });
		
		for (let i = -1; ++i < 4;)
		{
			mux.addStory(feedId1, feed1.urls[i]);
			mux.addStory(feedId2, feed2.urls[i]);
			mux.addStory(feedId3, feed3.urls[i]);
		}
		
		await mux.save();
		debugger;
	}
}
