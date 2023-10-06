
namespace ScrollApp.Cover
{
	/** */
	export async function generateTestAppData()
	{
		FilaNode.use();
		await ScrollApp.debugGenerateJsonFiles();
	}
}