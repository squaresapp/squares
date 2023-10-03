
namespace ScrollApp.Cover
{
	/** */
	export function coverTilerHat()
	{
		ScrollApp.appendCssReset();
		const gridHat = new GridHat();
		
		gridHat.handleRender(index =>
		{
			return generateFakeScene("Post " + index);
		});
		
		gridHat.handleSelect((e, index) =>
		{
			console;
		});
		
		const container = hot.div(
			{
				position: "absolute",
				top: 0,
				left: 0,
				bottom: 0,
				right: 0,
				width: "80vw",
				height: "80vh",
				margin: "auto",
				outline: "10px solid white",
			},
			gridHat
		);
		
		document.body.append(container);
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
