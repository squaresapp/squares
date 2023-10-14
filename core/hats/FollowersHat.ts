
namespace ScrollApp
{
	/** */
	export class FollowersHat
	{
		readonly head;
		
		/** */
		constructor()
		{
			this.head = hot.div(
				{
					padding: "20px",
				},
				hot.on("connected", () => this.construct()),
				hot.div(
					{
						fontSize: "22px",
						fontWeight: 600,
						marginBottom: "20px",
					},
					hot.text(Strings.following)
				)
			);
			
			Hat.wear(this);
		}
		
		/** */
		private construct()
		{
			const feeds = Hat.over(this, RootHat).scrollJsons
				.flatMap(json => json.feeds)
				.filter((v, i, a) => a.findIndex(json => json.id === v.id) === i);
			
			for (const feed of feeds)
				this.head.append(this.renderIdentity(feed));
		}
		
		/** */
		private renderIdentity(feed: IFeedJson)
		{
			const iconUrl = IFeedJson.getIconUrl(feed);
			const author = feed.author || Strings.unknownAuthor;
			
			return hot.div(
				{
					display: "flex",
					alignContent: "center",
					alignItems: "center",
					marginBottom: "10px",
					padding: "10px",
					fontSize: "15px",
					backgroundColor: "rgba(128, 128, 128, 0.25)",
					borderRadius: Style.borderRadiusSmall,
				},
				hot.div(
					{
						width: "50px",
						padding: "10px",
						marginRight: "20px",
						aspectRatio: "1/1",
						borderRadius: "100%",
						backgroundImage: `url(${iconUrl})`,
						backgroundSize: "cover",
					},
				),
				hot.div(
					{
						fontWeight: 500,
						flex: "1 0",
					},
					hot.text(author)
				),
				Widget.fillButton(
					hot.text(Strings.unfollow)
				)
			);
		}
	}
}
