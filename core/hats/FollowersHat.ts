
namespace Squares
{
	/** */
	export class FollowersHat
	{
		readonly head;
		private readonly feedElements;
		
		/** */
		constructor()
		{
			this.head = raw.div(
				{
					padding: "20px",
				},
				raw.on("connected", () => this.construct()),
				raw.div(
					{ marginBottom: "20px" },
					Style.textTitle2(Strings.following),
				),
				raw.on(document.body, "squares:follow", ev =>
				{
					this.handleFollow(ev.detail.feeds);
				}),
				raw.on(document.body, "squares:unfollow", ev =>
				{
					this.handleUnfollow(ev.detail.feedKey);
				}),
				this.feedElements = raw.div()
			);
			
			Hat.wear(this);
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
		private handleFollow(feeds: IFeedDetail[])
		{
			for (const feed of feeds)
				this.feedElements.prepend(this.renderIdentity(feed));
		}
		
		/** */
		private async construct()
		{
			for await (const feed of Data.readFeedDetails())
				this.feedElements.append(this.renderIdentity(feed));
		}
		
		/** */
		private renderIdentity(feed: IFeedDetail)
		{
			const iconUrl = Util.getIconUrl(feed);
			const author = feed.author || Strings.unknownAuthor;
			
			const e = raw.div(
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
				raw.div(
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
				raw.div(
					{
						fontWeight: 500,
						flex: "1 0",
					},
					raw.text(author)
				),
				Widget.fillButton(
					raw.text(Strings.unfollow),
					raw.on("click", async () =>
					{
						dispatch("squares:unfollow", { feedKey: feed.key });
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
