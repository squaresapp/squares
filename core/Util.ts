
namespace Rail
{
	/**
	 * 
	 */
	export function tryParseJson(jsonText: string): object | null
	{
		try
		{
			return JSON.parse(jsonText);
		}
		catch (e) { }
		
		return null;
	}
}
