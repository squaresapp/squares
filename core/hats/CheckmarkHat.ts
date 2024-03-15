
namespace Squares
{
	/** */
	export class CheckmarkHat
	{
		/** */
		get head()
		{
			return this._head;
		}
		private _head;
		
		private readonly check;
		private readonly marker;
		
		/** */
		constructor()
		{
			maybeAddCheckmarkCss();
			this.marker = raw.div();
			
			this.check = raw.div(
				"icon icon--order-success svg",
				{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					width: "100px",
					height: "100px",
					borderRadius: "100%",
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					transformOrigin: "50% 50%",
					transitionProperty: "opacity,",
					transitionDuration: "0.75s",
					transitionTimingFunction: "cubic-bezier(.17,.67,.49,2)",
					pointerEvents: "all",
				},
				Style.backdropBlur(),
			);
			
			this.check.innerHTML = checkmarkSvg;
			this._head = this.marker;
			Hat.wear(this);
			this.show(false);
		}
		
		/** */
		async show(show: boolean)
		{
			const s = this.check.style;
			
			if (show)
			{
				if (!this.check.isConnected && this.marker.isConnected)
				{
					this.marker.replaceWith(this.check);
					await new Promise<void>(r => setTimeout(r, 1));
				}
				
				s.opacity = "1";
				s.transform = "scale(1)";
			}
			else
			{
				s.opacity = "0";
				s.transform = "scale(0.25)";
				
				UI.waitTransitionEnd(this.check).then(() =>
				{
					if (s.opacity === "0")
						this.check.replaceWith(this.marker);
				});
			}
		}
	}
	
	/** */
	function maybeAddCheckmarkCss()
	{
		const styleTagId = "checkmark-css";
		if (document.getElementById(styleTagId))
			return;
		
		const style = raw.style();
		style.textContent = checkmarkCss;
		document.head.append(style);
	}
	
	const checkmarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="80px" height="80px">
            <g fill="none" stroke="white" stroke-width="5"><circle cx="40" cy="40" r="35" style="stroke-dasharray:240px, 240px; stroke-dashoffset: 480px;"/><path d="m13.417 34.778 9.93 9.909 25.444-25.393" style="transform: translate(8px, 8px); stroke-dasharray:50px, 50px; stroke-dashoffset: 0px;"></path></g></svg>`;
	
	const checkmarkCss = `@-webkit-keyframes checkmark{0%{stroke-dashoffset:50px}100%{stroke-dashoffset:0}}@-ms-keyframes checkmark{0%{stroke-dashoffset:50px}100%{stroke-dashoffset:0}}@keyframes checkmark{0%{stroke-dashoffset:50px}100%{stroke-dashoffset:0}}@-webkit-keyframes checkmark-circle{0%{stroke-dashoffset:240px}100%{stroke-dashoffset:480px}}@-ms-keyframes checkmark-circle{0%{stroke-dashoffset:240px}100%{stroke-dashoffset:480px}}@keyframes checkmark-circle{0%{stroke-dashoffset:240px}100%{stroke-dashoffset:480px}}.inlinesvg .svg svg{display:inline}.icon--order-success svg path{-webkit-animation:checkmark 0.25s ease-in-out 0.7s backwards;animation:checkmark 0.25s ease-in-out 0.7s backwards animation-delay:0.6s}.icon--order-success svg circle{-webkit-animation:checkmark-circle 0.6s ease-in-out backwards;animation:checkmark-circle 0.6s ease-in-out backwards animation-delay:0s}
	`;
}
