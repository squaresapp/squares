
namespace Squares
{
	/** */
	export class FeedMetaHat
	{
		readonly head;
		
		/** */
		constructor(data: IFeed)
		{
			const iconUrl = Util.getIconUrl(data);
			const author = data.author || Strings.unknownAuthor;
			const isFollowing = data.key > 0;
			
			this.head = raw.div(
				{
					display: "flex",
					height: "100%",
					justifyContent: "center",
					alignContent: "center",
					alignItems: "center",
				},
				raw.div(
					{
						display: "flex",
						width: "140px",
						padding: "20px",
						justifyContent: "center",
						alignContent: "center",
						alignItems: "center",
					},
					raw.div(
						{
							width: "100%",
							aspectRatio: "1/1",
							borderRadius: "100%",
							backgroundImage: `url(${iconUrl})`,
							backgroundSize: "cover"
						}
					),
				),
				raw.div(
					{
						flex: "1 0",
						fontSize: "18px",
					},
					raw.css(" > :not(:first-child)", {
						marginTop: "10px"
					}),
					raw.div(
						{
							fontWeight: 700,
							display: "-webkit-box",
							webkitBoxOrient: "vertical",
							webkitLineClamp: "1",
							overflow: "hidden",
						},
						raw.text(author),
					),
					!!data.description && raw.div(
						{
							fontWeight: 500,
							display: "-webkit-box",
							webkitBoxOrient: "vertical",
							webkitLineClamp: "2",
							overflow: "hidden",
						},
						raw.text(data.description)
					),
					
					this.renderButton(Strings.share, () => {}),
					isFollowing && (e => this.renderButton(Strings.unfollow, () =>
					{
						Hat.over(this, PageHat).head.scrollBy({ top: -1 });
						Hat.signal(UnfollowSignal, data.key);
						UI.fade(e);
					})),
				),
			);
			
			Hat.wear(this);
		}
		
		/** */
		private renderButton(label: string, clickFn: () => void)
		{
			return Widget.fillButton(
				{
					marginRight: "15px",
				},
				raw.text(label),
				raw.on("click", () => clickFn())
			);
		}
	}
}
