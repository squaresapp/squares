
namespace Squares
{
	/** */
	export interface IAbstractScroll
	{
		anchorIndex: number;
	}
	
	/** */
	export interface IDiskScroll extends IAbstractScroll
	{
		feeds: number[];
	}
	
	/** */
	export interface IScroll extends IAbstractScroll
	{
		key: number;
		feeds: readonly IFeed[];
	}
}
