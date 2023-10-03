
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
	export class AppJson
	{
		/** */
		static async read()
		{
			const fila = await this.getFila();
			
			if (!fila.exists())
				return new AppJson();
			
			const appJsonText = await fila.readText();
			const appJson = <IAppJson>ScrollApp.tryParseJson(appJsonText) || { scrolls: [] };
			return new AppJson(appJson.scrolls);
		}
		
		/** */
		private static async getFila()
		{
			const fila = await ScrollApp.getAppDataFila();
			return fila.down(appJsonName);
		}
		
		/** */
		constructor(
			private readonly scrolls: string[] = []
		) { }
		
		/** */
		async addScroll(identifier: string)
		{
			this.scrolls.push(identifier);
			await this.write();
		}
		
		/** */
		async removeScroll(identifier: string)
		{
			for (let i = this.scrolls.length; i-- > 0;)
				if (this.scrolls[i] === identifier)
					this.scrolls.splice(i, 1);
			
			await this.write();
		}
		
		/** */
		async moveScroll(identifier: string, targetIndex: number)
		{
			const srcIndex = this.scrolls.findIndex(s => s === identifier);
			if (srcIndex < 0)
				return;
			
			this.scrolls.splice(srcIndex, 1);
			this.scrolls.splice(targetIndex, 0, identifier);
			await this.write();
		}
		
		/** */
		async readScrolls()
		{
			const promises = this.scrolls.map(id => ScrollJson.read(id));
			const jsons = await Promise.all(promises);
			return jsons;
		}
		
		/** */
		async write()
		{
			const json = JSON.stringify({ scrolls: this.scrolls });
			const fila = await AppJson.getFila();
			await fila.writeText(json);
		}
	}
	
	const appJsonName = "app.json";
}
