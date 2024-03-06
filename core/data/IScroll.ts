
namespace Squares
{
	/** */
	export interface IAbstractScroll
	{
		anchorIndex: number;
		
		/** Stores the number of posts in the scroll. */
		length: number;
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
