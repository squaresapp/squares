
namespace Cover
{
	/** */
	export function coverTilerHat()
	{
		Squares.appendCssReset();
		const gridHat = new Squares.GridHat();
		
		gridHat.handleRender(index =>
		{
			return generateFakeScene("Post " + index);
		});
		
		gridHat.handleSelect((e, index) =>
		{
			console;
		});
		
		const container = raw.div(
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
		return raw.div(
			{
				backgroundImage: "linear-gradient(45deg, orange, crimson)",
				minHeight: "100vh",
			},
			raw.div(
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
				raw.text(text)
			)
		);
	}
}
