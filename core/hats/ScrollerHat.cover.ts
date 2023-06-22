
namespace Rail.Cover
{
	/** */
	export function coverScrollerHat()
	{
		Rail.appendCssReset();
		const hat = new ScrollerHat();
		
		hat.handleRender(index =>
		{
			return generateFakeScene("Post " + index);
		});
		
		hat.handleSelect((e, index) =>
		{
			console;
		});
		
		document.body.append(hat.head);
	}
	
	/** */
	function generateFakeScene(text: string)
	{
		return hot.div(
			{
				backgroundImage: "linear-gradient(45deg, orange, crimson)",
				minHeight: "100vh",
			},
			hot.div(
				{
					position: "absolute",
					top: 0,
					left: 0,
					bottom: 0,
					right: 0,
					margin: "auto",
					width: "fit-content",
					height: "fit-content",
					color: "white",
					fontSize: "20vmin",
					fontWeight: 900,
					textAlign: "center",
				},
				hot.text(text)
			)
		);
	}
}
