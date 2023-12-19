
namespace Squares.Instagram
{
	/**
	 * Describes the format of the file inthe content/posts_1.json file
	 * in the exported data package.
	 */
	export type PostsJson = IPostJson[];
	
	/** */
	export interface IPostJson
	{
		media: IPostMedia[];
	}
	
	/** */
	export interface IPostMedia
	{
		uri: string;
		creation_timestamp: number;
		title: string;
	}
}
