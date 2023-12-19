
namespace Squares
{
	/** */
	export class DotsHat
	{
		readonly head;
		
		/** */
		constructor()
		{
			this.head = raw.div(
				Style.backgroundOverlay(),
				{
					width: "fit-content",
					padding: "5px 10px",
					borderRadius: "1000px",
					textAlign: "center",
				},
				raw.css(" > SPAN", {
					display: "inline-block",
					width: "10px",
					height: "10px",
					margin: "3px",
					borderRadius: "100%",
					backgroundColor: "rgba(128, 128, 128)",
				}),
				raw.css(" > SPAN." + highlightClass, {
					backgroundColor: "hsl(205, 100%, 50%)",
				})
			);
			
			Hat.wear(this);
		}
		
		/** */
		insert(count: number, at = this.head.childElementCount)
		{
			const spans: HTMLSpanElement[] = [];
			
			for (let i = -1; ++i < count;)
				spans.push(raw.span());
			
			at = Math.max(0, at);
			at = Math.min(this.head.childElementCount, at);
			
			if (at >= this.head.childElementCount)
			{
				this.head.append(...spans);
			}
			else
			{
				const elements = Array.from(this.head.children);
				elements[at].before(...spans);
			}
		}
		
		/** */
		highlight(index: number)
		{
			index = Math.max(0, index);
			index = Math.min(this.head.childElementCount - 1, index);
			const children = Array.from(this.head.children);
			children.forEach(e => e.classList.remove(highlightClass));
			children[index].classList.add(highlightClass);
		}
	}
	
	const highlightClass = "highlight";
}
