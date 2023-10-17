
namespace ScrollApp
{
	//! TODO:
	// Consider getting rid of the storage of the feeds, make it just
	// pull data directly from the file system every time on demand,
	// without caching.
	
	/**
	 * A class that manages the data that relates to a single scrollable element,
	 * such as the feeds it includes and the posts.
	 */
	export class ScrollData
	{
		/** */
		static async read(identifier: string)
		{
			const scrollDirFila = await getScrollDirectory(identifier);
			
			const scrollFila = scrollDirFila.down(scrollJsonName);
			if (!await scrollFila.exists())
				return new ScrollData(identifier);
			
			const scrollJsonText = await scrollFila.readText();
			const scrollJson = JSON.parse(scrollJsonText);
			const scrollData = new ScrollData(identifier);
			
			// Read in any attributes (for now just one)
			if (typeof scrollJson.anchorIndex === "number")
				scrollData.anchorIndex = scrollJson.anchorIndex || 0;
			
			const feedIds = scrollJson.feeds as number[];
			scrollData.feedIds.push(...feedIds);
			
			// Read the posts
			const contents = await scrollDirFila.readDirectory();
			for (let i = contents.length; i-- > 0;)
			{
				const reg = /^\d{4}-\d{2}-\d{2}\.json$/;
				if (!reg.test(contents[i].name))
					continue;
				
				const postsRead = await readPostsFile(contents[i]);
				scrollData.posts.push(...postsRead);
			}
			
			return scrollData;
		}
		
		/** */
		constructor(identifier: string)
		{
			this._identifier = identifier;
		}
		
		anchorIndex: number = 0;
		private posts: IPostJson[] = [];
		private readonly feedIds: number[] = [];
		
		/** */
		get identifier()
		{
			return this._identifier;
		}
		set identifier(value: string)
		{
			this._identifier = value;
		}
		private _identifier = "scroll-" + Date.now().toString(36);
		
		/**
		 * CALLED EXCLUSIVELY FROM AppData.
		 * Adds a reference to the specified feed from this ScrollData,
		 * so that the posts within the feed display within the corresponding
		 * scrollable element.
		 */
		async addFeedReference(feedId: number)
		{
			this.feedIds.push(feedId);
			await this.writeScrollJson();
		}
		
		/**
		 * CALLED EXCLUSIVELY FROM AppData.
		 * Removes a reference to the specified feed from this ScrollData,
		 */
		async removeFeedReference(feedId: number)
		{
			for (let i = this.feedIds.length; i-- > 0;)
				if (this.feedIds[i] === feedId)
					this.feedIds.splice(i, 1);
			
			await this.writeScrollJson();
		}
		
		/** */
		private async writeScrollJson()
		{
			const scrollFila = await getScrollDirectory(this.identifier);
			const scrollJson: IScrollJson = {
				anchorIndex: this.anchorIndex,
				feeds: this.feedIds,
			};
			
			await scrollFila.down(scrollJsonName).writeText(JSON.stringify(scrollJson));
			return scrollFila;
		}
		
		/** */
		async writePost(postJson: IPostJson)
		{
			const scrollFila = await getScrollDirectory(this.identifier);
			const fileName = this.getContainingFileName(postJson.dateFound);
			const postsFila = scrollFila.down(fileName);
			const postsExists = await postsFila.exists();
			const posts = postsExists ? await readPostsFile(postsFila) : [];
			let postIndex = posts.findIndex(p => p.dateFound === postJson.dateFound);
			
			// If the post does not exist within the file, then it simply gets
			// appended to the end.
			if (postIndex < 0)
				postIndex = posts.push(postJson);
			
			// If the post is already in the file, then the original version
			// of the post needs to be replaced with the updated version.
			else for (let i = -1; ++i < posts.length;)
				if (posts[i].dateFound === postJson.dateFound)
					posts[i] = postJson;
			
			const jsonText = JSON.stringify(posts);
			await postsFila.writeText(jsonText);
			this.posts.push(postJson);
		}
		
		/**
		 * Returns the post at the specified index, or null in the case
		 * when the specified index is less than zero or larger than
		 * the number of posts defined within the scroll.
		 */
		getPost(index: number)
		{
			if (index < 0 || index >= this.posts.length)
				return null;
			
			return this.posts[index];
		}
		
		/** */
		getPosts(): readonly IPostJson[]
		{
			return this.posts;
		}
		
		/** */
		private getContainingFileName(dateFound: number)
		{
			const date = new Date(dateFound);
			const y = date.getFullYear();
			const m = ("0" + (date.getMonth() + 1)).slice(-2);
			const d = ("0" + date.getDate()).slice(-2);
			return [y, m, d].join("-") + ".json";
		}
	}
	
	/**
	 * Reads the contents of a JSON file that contains multiple posts.
	 */
	async function readPostsFile(postsFila: Fila)
	{
		const postsJson = await postsFila.readText();
		const postsArray = <IPostJson[]>tryParseJson(postsJson);
		
		if (!Array.isArray(postsArray))
			return [];
		
		return postsArray;
	}
		
	
	/**
	 * Gets the directory that contains all the files for one particular scroll instance.
	 */
	async function getScrollDirectory(identifier: string)
	{
		const baseFila = await ScrollApp.getAppDataFila();
		const scrollFila = baseFila.down(identifier);
		
		if (!await scrollFila.exists())
			await scrollFila.writeDirectory();
		
		return scrollFila;
	}
	
	/** */
	interface IScrollJson
	{
		anchorIndex: number;
		feeds: number[];
	}
	
	const scrollJsonName = "scroll.json";
}