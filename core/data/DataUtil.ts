
namespace ScrollApp.Data
{
	/**
	 * Returns the environment-specific path to the application data folder
	 */
	export async function getBaseFila()
	{
		if (TAURI)
		{
			const dir = await Tauri.path.appDataDir();
			return Fila.new(dir);
		}
		else if (ELECTRON)
		{
			const fila = Fila.new(__dirname).down("data");
			await fila.writeDirectory();
			return fila;
		}
		else if (CAPACITOR)
		{
			return Fila.new(FilaCapacitor.directory.documents);
		}
		
		throw new Error("Not implemented");
	}
	
	/**
	 * Gets the path to where the pinger data files are stored.
	 */
	export async function getPingerFila()
	{
		const fila = await getAppDataFila();
		return fila.down("pinger");
	}
}
