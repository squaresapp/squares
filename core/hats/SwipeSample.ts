
namespace Rail
{
	/** */
	export class SwipeSampleHat
	{
		/** */
		constructor()
		{
			document.body.style.overflow = "hidden";
			
			let startX = 0;
			let startY = 0;
			let currentX = 0;
			let currentY = 0;
			let inertiaX = 0;
			let inertiaY = 0;
			let elementX = 0;
			let elementY = 0;
			
			let swiping = false;
			
			this.head = hot.div(
				"swipe-sample",
				{
					width: "100%",
					height: "100%",
					overflowX: "hidden",
					overflowY: "auto",
				},
				hot.on("touchstart", ev =>
				{
					if (ev.changedTouches.length > 1)
						return;
					
					this.draggable.style.transitionDuration = "0.05s";
					startX = ev.changedTouches[0].screenX;
					startY = ev.changedTouches[0].screenY;
				}),
				hot.on("touchend", () =>
				{
					if (!swiping)
						return;
					
					const forward = Math.abs(inertiaX) > 5 ?
						inertiaX < 0 :
						Math.abs(elementX) > this.head.offsetWidth / 2;
					
					this.draggable.style.transitionDuration = "0.25s";
					this.draggable.style.transform = forward ?
						`translate(0)` :
						`translate(100%)`;
					
					UI.waitTransitionEnd(this.draggable);
					this.head.style.overflowX = "hidden";
					this.head.style.overflowY = "auto";
					swiping = false;
					
					startX = 0;
					startY = 0;
					currentX = 0;
					currentY = 0;
					inertiaX = 0;
					inertiaY = 0;
					elementX = 0;
					elementY = 0;
				}),
				hot.on("touchmove", ev =>
				{
					const lastX = currentX;
					const lastY = currentY;
					currentX = ev.changedTouches[0].screenX;
					currentY = ev.changedTouches[0].screenY;
					inertiaX = currentX - lastX;
					inertiaY = currentY - lastY;
					
					elementX = startX - currentX;
					elementY = startY - currentY;
					
					if (swiping || Math.abs(elementY) < 5)
					{
						swiping = true;
						this.head.style.overflow = "hidden";
						this.draggable.style.transform = `translateX(100%) translateX(-${elementX}px)`;
					}
				}),
				hot.div(
					"draggable-sticky",
					{
						position: "sticky",
						top: 0,
						left: 0,
						right: 0,
						height: 0,
						pointerEvents: "none",
						zIndex: 1,
					},
					hot.div(
						"draggable-clip",
						{
							clipPath: "inset(0 0)",
						},
						Cq.height(100, "swipe-sample"),
						this.draggable = hot.div(
							"draggable",
							Dock.cover(),
							{
								background: "rgba(0, 0, 0, 0.5)",
								transform: "translateX(100%)",
								transitionProperty: "transform",
								transitionDuration: "0.05s",
							}
						)
					)
				),
				hot.div(
					{
						height: "300%",
						background: "repeating-linear-gradient(purple 0%, green 5%)",
					},
				)
			);
		}
		
		readonly head;
		private readonly draggable;
	}
	
	/** */
	export function coverSwipeSampleHat()
	{
		Rail.appendCssReset();
		const hat = new SwipeSampleHat();
		document.body.append(hat.head);
	}
}
