
namespace Squares.Cover
{
	/** */
	export function startupWithDebug()
	{
		Object.assign(globalThis, { DEBUG: true});
		Squares.startup();
	}
	
	/** */
	export function startupWithoutDebug()
	{
		Squares.startup();
	}
}
