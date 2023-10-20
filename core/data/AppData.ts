
namespace ScrollApp
{
	/** */
	interface IAppJson
	{
		scrolls: string[];
	}
	
	/**
	 * A class that describes the JSON file that stores information
	 * specific to the app's configuration.
	 */
	export class AppData
	{
		/** */
		static async read()
		{
			const filas = await this.getFilas();
			let appData = new AppData();
			
			if (await filas.app.exists())
			{
				const appJsonText = await filas.app.readText();
				const appJson = <IAppJson>ScrollApp.tryParseJson(appJsonText) || { scrolls: [] };
				appData.scrolls.push(...appJson.scrolls);
			}
			
			if (await filas.feeds.exists())
			{
				const feedsJsonText = await filas.feeds.readText();
				const feedsJsonArray = <IFeedJson[]>ScrollApp.tryParseJson(feedsJsonText) || [];
				appData._feeds.push(...feedsJsonArray);
			}
			
			return appData;
		}
		
		/** */
		private static async getFilas()
		{
			const fila = await ScrollApp.getAppDataFila();
			return {
				app: fila.down(appJsonName),
				feeds: fila.down(feedsJsonName),
			};
		}
		
		private readonly scrolls: string[] = [];
		
		/** */
		async addScroll(identifier: string)
		{
			this.scrolls.push(identifier);
			await this.writeAppJson();
		}
		
		/** */
		async removeScroll(identifier: string)
		{
			for (let i = this.scrolls.length; i-- > 0;)
				if (this.scrolls[i] === identifier)
					this.scrolls.splice(i, 1);
			
			await this.writeAppJson();
		}
		
		/** */
		async moveScroll(identifier: string, targetIndex: number)
		{
			const srcIndex = this.scrolls.findIndex(s => s === identifier);
			if (srcIndex < 0)
				return;
			
			this.scrolls.splice(srcIndex, 1);
			this.scrolls.splice(targetIndex, 0, identifier);
			await this.writeAppJson();
		}
		
		/** */
		async readScrolls()
		{
			const jsons: ScrollData[] = [];
			
			for (const id of this.scrolls)
				jsons.push(await ScrollData.read(id));
			
			return jsons;
		}
		
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
		
		/**
		 * 
		 */
		async followFeed(feedJson: IFeedJson, scrollName: string)
		{
			this._feeds.push(feedJson);
			await this.writeFeedsJson();
			
			const scrollDatas = await this.readScrolls();
			const sd = scrollDatas.find(s => s.identifier === scrollName);
			sd?.addFeedReference(feedJson.id);
		}
		
		/**
		 * 
		 */
		async unfollowFeed(identifier: number)
		{
			const scrollDatas = await this.readScrolls();
			
			for (const scrollData of scrollDatas)
				scrollData.removeFeedReference(identifier);
			
			for (let i = this._feeds.length; i-- > 0;)
			{
				const feed = this._feeds[i];
				if (feed.id === identifier)
					feed.dateFollowed = -Math.abs(feed.dateFollowed);
			}
			
			await this.writeFeedsJson();
		}
		
		/** */
		private async writeAppJson()
		{
			const json = JSON.stringify({ scrolls: this.scrolls });
			const filas = await AppData.getFilas();
			await filas.app.writeText(json);
		}
		
		/** */
		private async writeFeedsJson()
		{
			const json = JSON.stringify(this._feeds);
			const filas = await AppData.getFilas();
			await filas.feeds.writeText(json);
		}
	}
	
	const appJsonName = "app.json";
	const feedsJsonName = "feeds.json";
}
