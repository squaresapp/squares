
namespace Squares
{
	/** */
	export function coverFollowersHat()
	{
		Squares.appendCssReset();
		const hat = new FollowersHat();
		document.body.append(hat.head);
	}
}
