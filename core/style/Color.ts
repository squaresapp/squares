
namespace Squares
{
	/** */
	export namespace Color
	{
		export let defaultHue = 215;
		
		/** */
		export interface IColor
		{
			readonly h: number;
			readonly s: number;
			readonly l: number;
			readonly a?: number;
		}
		
		/** */
		export function from(values: Partial<IColor>)
		{
			const h = (Array.isArray(values) ? values.at(0) : values.h) ?? defaultHue;
			const s = (Array.isArray(values) ? values.at(1) : values.s) ?? 50;
			const l = (Array.isArray(values) ? values.at(2) : values.l) ?? 50;
			const a = Array.isArray(values) ? 1 : values.a ?? 1;
			return a === 1 ?
				`hsl(${h}, ${s}%, ${l}%)` :
				`hsla(${h}, ${s}%, ${l}%, ${a})`;
		}
		
		/** */
		export function white(alpha = 1)
		{
			return alpha === 1 ? "white" : `rgba(255, 255, 255, ${alpha})`;
		}
		
		/** */
		export function black(alpha = 1)
		{
			return alpha === 1 ? "black" : `rgba(0, 0, 0, ${alpha})`;
		}
		
		/** */
		export function gray(value = 128, alpha = 1)
		{
			return alpha === 1 ?
				`rgb(${value}, ${value}, ${value})` :
				`rgba(${value}, ${value}, ${value}, ${alpha})`;
		}
	}
}
