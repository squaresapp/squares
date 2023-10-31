
namespace ScrollApp
{
	/** */
	export class FollowersHat
	{
		readonly head;
		private readonly feedElements;
		
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
				),
				this.feedElements = hot.div()
			);
			
			Hat
				.wear(this)
				.wear(UnfollowSignal, this.handleUnfollow)
				.wear(FollowSignal, this.handleFollow);
		}
		
		/** */
		private handleUnfollow(feedKey: number)
		{
			const cls = keyPrefix + feedKey;
			Array.from(this.head.children)
				.filter(e => e instanceof HTMLElement && e.classList.contains(cls))
				.map(e => e.remove());
		}
		
		/** */
		private handleFollow(feed: IFeed)
		{
			this.feedElements.prepend(this.renderIdentity(feed));
		}
		
		/** */
		private async construct()
		{
			for await (const feed of Data.readFeeds())
				this.feedElements.append(this.renderIdentity(feed));
		}
		
		/** */
		private renderIdentity(feed: IFeed)
		{
			const iconUrl = Util.getIconUrl(feed);
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
				keyPrefix + feed.key,
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
						Hat.signal(UnfollowSignal, feed.key);
						await UI.collapse(e);
						e.remove();
					}),
				)
			);
			
			return e;
		}
	}
	
	const keyPrefix = "id:";
}
