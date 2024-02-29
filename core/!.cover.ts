
namespace Cover
{
	/** */
	export async function startupAsDebug()
	{
		await Squares.startup();
	}
	
	/** */
	export async function startupAsDebugWithData()
	{
		await Squares.startup(true);
	}
	
	/** */
	export async function startup()
	{
		Object.assign(globalThis, { DEBUG: false });
		await Squares.startup();
	}
	
	/** */
	export async function startupWithData()
	{
		Object.assign(globalThis, { DEBUG: false });
		await Squares.startup(true);
	}
	
	/** */
	export async function coverFollow()
	{
		await Squares.startup();
		const link = "https://webfeed-tulips.pages.dev/index.txt";
		await Squares.FollowUtil.followWebfeeds(link);
		
	}
}

typeof module === "object" && Object.assign(module.exports, { Cover });
