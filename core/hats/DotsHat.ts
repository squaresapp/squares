
namespace ScrollApp
{
	/** */
	export class DotsHat
	{
		readonly head;
		
		/** */
		constructor()
		{
			this.head = hot.div(
				{
					width: "fit-content",
					padding: "5px 10px",
					borderRadius: "1000px",
					backgroundColor: "rgba(0, 0, 0, 0.75)",
					textAlign: "center",
				},
				Style.backdropBlur(5),
				hot.css(" > SPAN", {
					display: "inline-block",
					width: "10px",
					height: "10px",
					margin: "3px",
					borderRadius: "100%",
					backgroundColor: "rgba(128, 128, 128)",
				}),
				hot.css(" > SPAN." + highlightClass, {
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
				spans.push(hot.span());
			
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
