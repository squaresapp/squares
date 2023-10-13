
namespace ScrollApp
{
	/** */
	export class FeedMetaHat
	{
		readonly head;
		
		/** */
		constructor(data: IFeedJson)
		{
			const iconUrl = IFeedJson.getIconUrl(data);
			const author = data.author || `(${Strings.unknownAuthor})`;
			
			this.head = hot.div(
				{
					display: "flex",
					height: "100%",
					justifyContent: "center",
					alignContent: "center",
					alignItems: "center",
				},
				hot.div(
					{
						display: "flex",
						width: "140px",
						padding: "20px",
						justifyContent: "center",
						alignContent: "center",
						alignItems: "center",
					},
					hot.div(
						{
							width: "100%",
							aspectRatio: "1/1",
							borderRadius: "100%",
							backgroundImage: `url(${iconUrl})`,
							backgroundSize: "cover"
						}
					),
				),
				hot.div(
					{
						flex: "1 0",
						fontSize: "18px",
					},
					hot.css(" > :not(:first-child)", {
						marginTop: "10px"
					}),
					hot.div(
						{
							fontWeight: 700,
							display: "-webkit-box",
							webkitBoxOrient: "vertical",
							webkitLineClamp: "1",
							overflow: "hidden",
						},
						hot.text(author),
					),
					!!data.description && hot.div(
						{
							fontWeight: 500,
							display: "-webkit-box",
							webkitBoxOrient: "vertical",
							webkitLineClamp: "2",
							overflow: "hidden",
						},
						hot.text(data.description)
					),
					
					this.renderButton("Share"),
					this.renderButton("Unfollow"),
				),
			);
			
			Hat.wear(this);
		}
		
		/** */
		private renderButton(label: string)
		{
			return hot.div(
				{
					display: "inline-block",
					marginRight: "15px",
					padding: "10px",
					borderRadius: "5px",
					backgroundColor: "rgba(128, 128, 128, 0.5)",
					fontWeight: 500,
				},
				Style.clickable,
				Style.backdropBlur(5),
				hot.text(label),
				hot.on("click", () =>
				{
					
				})
			)
		}
	}
}
