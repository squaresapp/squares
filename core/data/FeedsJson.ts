
namespace ScrollApp
{
	/** */
	export class FeedsJson
	{
		/** */
		static async read()
		{
			const fila = await this.getFila();
			
			if (!fila.exists())
				return new FeedsJson();
			
			const feedsJsonText = await fila.readText();
			const feedsJsonArray = <IFeedJson[]>ScrollApp.tryParseJson(feedsJsonText) || [];
			const feedsJson = new FeedsJson();
			feedsJson._feeds.push(...feedsJsonArray);
			return feedsJson;
		}
		
		/** */
		private static async getFila()
		{
			const fila = await ScrollApp.getAppDataFila();
			return fila.down(feedsJsonName);
		}
		
		/** */
		constructor() { }
		
		/** */
		get feeds(): readonly IFeedJson[]
		{
			return this._feeds;
		}
		private readonly _feeds: IFeedJson[] = [];
		
		/** */
		getFeed(feedId: number)
		{
			for (const feed of this._feeds)
				if (feedId === feed.id)
					return feed;
			
			return null;
		}
		
		/** */
		async addFeed(feedJson: IFeedJson)
		{
			this._feeds.push(feedJson);
			await this.write();
		}
		
		/** */
		async removeFeed(identifier: number)
		{
			for (let i = this._feeds.length; i-- > 0;)
				if (this._feeds[i].id === identifier)
					this._feeds.splice(i, 1);
			
			await this.write();
		}
		
		/** */
		private async write()
		{
			const json = JSON.stringify(this._feeds);
			const fila = await FeedsJson.getFila();
			await fila.writeText(json);
		}
	}
	
	const feedsJsonName = "feeds.json";
}
