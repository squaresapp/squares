
namespace Rail
{
	/** */
	export function coverFollowersHat()
	{
		Rail.appendCssReset();
		const hat = new FollowersHat();
		document.body.append(hat.head);
	}
}
