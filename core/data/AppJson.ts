
namespace ScrollApp.Data
{
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
			const appJsonText = await fila.readText();
			const appJson = <IScrollJsonFile>(ScrollApp.tryParseJson(appJsonText) || { scrolls: [] });
			
		}
		
		/** */
		private static async getFila()
		{
			const fila = await Data.getBaseFila();
			return fila.down(appJsonName);
		}
		
		/** */
		async write()
		{
			const scrolls = this.scrolls.map(s => s.identifier);
			const promises = this.scrolls.map(s => s.write());
			const json = JSON.stringify({ scrolls });
			const fila = await AppJson.getFila();
			promises.push(fila.writeText(json));
			await Promise.all(promises);
		}
		
		readonly scrolls: ScrollJson[] = [];
	}
	
	/** */
	interface IScrollJsonFile
	{
		scrolls: string[];
	}
	
	const appJsonName = "app.json";
}
