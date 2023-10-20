
namespace ScrollApp
{
	/** */
	export function UnfollowSignal(feedId: number) {}
	
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
			
			Hat
				.wear(this)
				.wear(UnfollowSignal, this.handleUnfollow);
		}
		
		/** */
		private handleUnfollow(feedId: number)
		{
			const cls = idPrefix + feedId;
			Array.from(this.head.children)
				.filter(e => e instanceof HTMLElement && e.classList.contains(cls))
				.map(e => e.remove());
		}
		
		/** */
		private construct()
		{
			const feeds = Hat.over(this, RootHat).appData.feeds;
			for (let i = feeds.length; i-- > 0;)
				this.head.append(this.renderIdentity(feeds[i]));
		}
		
		/** */
		private renderIdentity(feed: IFeedJson)
		{
			const iconUrl = IFeedJson.getIconUrl(feed);
			const author = feed.author || Strings.unknownAuthor;
			
			const e = hot.div(
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
				idPrefix + feed.id,
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
					hot.text(Strings.unfollow),
					hot.on("click", async () =>
					{
						await Hat.over(this, RootHat).appData.unfollowFeed(feed.id);
						await UI.collapse(e);
						e.remove();
					}),
				)
			);
			
			return e;
		}
	}
	
	const idPrefix = "id:";
}
