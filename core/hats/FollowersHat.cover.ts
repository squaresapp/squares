
namespace ScrollApp
{
	/** */
	export function coverFollowersHat()
	{
		ScrollApp.appendCssReset();
		const hat = new FollowersHat();
		document.body.append(hat.head);
	}
}
