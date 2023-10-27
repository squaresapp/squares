
namespace ScrollApp
{
	/** */
	export class PullToRefreshHat
	{
		readonly head;
		private readonly symbol;
		private rotationDegress = 0;
		private animation: Animation | null = null;
		
		/** */
		constructor(private readonly target: HTMLElement)
		{
			const size = (parseInt(Style.borderRadiusLarge) * 2) + "px";
			
			this.head = hot.div(
				{
					width: size,
					height: size,
					textAlign: "center",
					borderRadius: "100%",
					zIndex: 1,
					opacity: 0,
					pointerEvents: "none",
				},
				Style.backdropBlur(),
				hot.on(target, "scroll", () => this.handleTargetScroll()),
				this.symbol = hot.div(
					Dock.center(),
					{
						width: factor * 9 + "px",
						height: factor * 16 + "px",
						borderRadius: "6px",
						backgroundColor: "rgba(128, 128, 128, 0.75)",
						transitionDuration: "0.1s",
					}
				)
			);
			
			Hat.wear(this);
			[this.onRefresh, this._onRefresh] = Force.create<() => void>();
		}
		
		readonly onRefresh;
		private readonly _onRefresh;
		
		/** */
		private handleTargetScroll()
		{
			if (this.animation)
				return;
			
			const e = this.target;
			const overscrollAmount = Math.max(0, e.scrollTop + e.offsetHeight - e.scrollHeight);
				
			if (overscrollAmount <= 0)
				this.setLoadingAnimation(false);
			
			else if (overscrollAmount < beginRefreshFrame)
				this.setAnimationFrame(overscrollAmount);
			
			else if (overscrollAmount >= beginRefreshFrame)
				this.setLoadingAnimation(true);
		}
		
		/** */
		private setAnimationFrame(n: number)
		{
			n = Math.max(0, n);
			const opacity = Math.min(1, n / beginRefreshFrame);
			this.rotationDegress = Math.round(n * 1.5);
			this.head.style.opacity = opacity.toString();
			this.symbol.style.transform = `rotateZ(${this.rotationDegress}deg)`;
		}
		
		/** */
		setLoadingAnimation(enable: boolean)
		{
			if (enable && !this.animation)
			{
				this.head.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
				
				this.animation = this.symbol.animate(
					[
						{ transform: `rotateZ(${this.rotationDegress}deg)` },
						{ transform: `rotateZ(${this.rotationDegress + 360}deg)` },
					],
					{
						iterations: 10000,
						duration: 800,
					}
				);
				
				this._onRefresh();
			}
			else if (!enable && this.animation) (async () =>
			{
				const animation = this.animation!;
				this.animation = null;
				const s = this.head.style;
				s.transitionDuration = "0.8s";
				s.transitionProperty = "transform";
				s.transform = "scale(1)";
				await UI.wait(1);
				s.transform = "scale(0)";
				await UI.waitTransitionEnd(this.head);
				animation.finish();
				s.opacity = "0";
				s.transform = "scale(1)";
			})();
		}
	}
	
	/** The frame at which the RefreshHat becomes fully opaque */
	const beginRefreshFrame = 100;
	
	const factor = 2;
}
