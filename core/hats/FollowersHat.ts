
namespace ScrollApp
{
	/** */
	export class FollowersHat
	{
		readonly head;
		
		/** */
		constructor()
		{
			const size = 2;
			
			this.head = hot.div(
				{
					display: "grid",
					width: "100%",
					gridTemplateColumns: `repeat(${size}, 1fr)`,
					gridAutoRows: (100 / size).toFixed(4) + "%",
				},
				hot.css("> DIV", {
					background: "linear-gradient(45deg, crimson, orange)"
				}),
				hot.div(
					new Text("Follower 1"),
				),
				hot.div(
					new Text("Follower 2"),
				),
				hot.div(
					new Text("Follower 3"),
				),
				hot.div(
					new Text("Follower 4"),
				),
				hot.div(
					new Text("Follower 5"),
				),
				hot.div(
					new Text("Follower 6"),
				),
				hot.div(
					new Text("Follower 7"),
				),
				hot.div(
					new Text("Follower 8"),
				),
				hot.div(
					new Text("Follower 9"),
				),
			);
			
			Hat.wear(this);
		}
	}
}
