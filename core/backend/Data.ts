
namespace ScrollApp.Data
{
	/** */
	export interface IReadArrayOptions
	{
		start?: number;
		limit?: number;
	}
	
	/** */
	export async function initialize()
	{
		for (const postFila of await readScrollFilas("json"))
		{
			const key = parseInt(postFila.name) || 0;
			const postKeys = await readScrollPostKeys(key);
			scrollPostCounts.set(key, postKeys.length);
		}
	}
	
	/** */
	export function readScrollPostCount(scrollKey: number)
	{
		return scrollPostCounts.get(scrollKey) || 0;
	}
	
	const scrollPostCounts = new Map<number, number>();
	
	/** */
	export async function writeScroll(defaults: Partial<IScroll>)
	{
		const scroll: IScroll = Object.assign(
			{
				key: Util.getSafeTicks(),
				anchorIndex: 0,
				feeds: []
			},
			defaults
		);
		
		const diskScroll: IDiskScroll = {
			anchorIndex: scroll.anchorIndex,
			feeds: scroll.feeds.map(s => s.key),
		};
		
		const key = scroll.key;
		const json = JSON.stringify(diskScroll);
		const fila = await getScrollFile(key);
		await fila.writeText(json);
		return scroll;
	}
	
	/** */
	export async function writeScrollPost(scrollKey: number, post: IPost)
	{
		const fila = await getScrollPostsFile(scrollKey);
		const keys = [post.key];
		await appendArrayFile(fila, keys);
		scrollPostCounts.set(scrollKey, (scrollPostCounts.get(scrollKey) || 0) + 1);
	}
	
	/**
	 * Read the scroll object from the file system with the specified key.
	 * If the argument is omitted, the first discovered scroll is returned.
	 */
	export async function readScroll(key?: number)
	{
		if (!key)
			for (const fila of await readScrollFilas("json"))
				key = keyOf(fila);
		
		if (!key)
			return null;
		
		const fila = await getScrollFile(key);
		if (!await fila.exists())
			return null;
		
		const diskScrollJson = await fila.readText();
		const diskScroll: IDiskScroll = JSON.parse(diskScrollJson);
		const feeds: IFeed[] = [];
		
		for (const feedKey of diskScroll.feeds)
		{
			const feed = await readFeed(feedKey);
			if (feed)
				feeds.push(feed);
		}
		
		const scroll: IScroll = {
			anchorIndex: diskScroll.anchorIndex,
			key,
			feeds,
		};
		
		return scroll;
	}
	
	/** */
	export async function * readScrolls()
	{
		for (const fila of await readScrollFilas("json"))
		{
			const key = keyOf(fila);
			const scroll = await readScroll(key);
			if (scroll)
				yield scroll;
		}
	}
	
	/** */
	async function readScrollFilas(type: "json" | "txt")
	{
		const folder = await getScrollFolder();
		const filas = await folder.readDirectory();
		const reg = new RegExp("^[0-9]+\\." + type + "$");
		return filas.filter(f => reg.test(f.name));
	}
	
	/** */
	export async function readScrollPost(scrollKey: number, index: number)
	{
		for await (const post of readScrollPosts(scrollKey, { start: index, limit: 1 }))
			return post;
		
		return null;
	}
	
	/** */
	export async function * readScrollPosts(scrollKey: number, options?: IReadArrayOptions)
	{
		for (const postKey of await readScrollPostKeys(scrollKey, options))
		{
			const post = await readPost(postKey);
			if (post)
				yield post;
		}
	}
	
	/** */
	async function readScrollPostKeys(scrollKey: number, options?: IReadArrayOptions)
	{
		const fila = await getScrollPostsFile(scrollKey);
		const postKeys = await readArrayFile(fila, options);
		return postKeys;
	}
	
	/** */
	async function getScrollFolder()
	{
		const fila = await Util.getDataFolder();
		return fila.down("scrolls");
	}
	
	/** */
	async function getScrollFile(key: number)
	{
		return (await getScrollFolder()).down(key + ".json");
	}
	
	/** */
	async function getScrollPostsFile(key: number)
	{
		return (await getScrollFolder()).down(key + ".txt");
	}
	
	/**
	 * Creates a new IFeed object to disk, optionally populated with the
	 * specified values, writes it to disk, and returns the constructed object.
	 */
	export async function writeFeed(...defaults: Partial<IFeed>[])
	{
		const key =  Util.getSafeTicks();
		const feed: IFeed = Object.assign(
			{
				key,
				url: "",
				icon: "",
				author: "",
				description: "",
				size: 0,
			},
			...defaults);
		
		const diskFeed = Object.assign({}, feed) as IDiskFeed;
		delete (diskFeed as any).key;
		const json = JSON.stringify(diskFeed);
		const fila = await getFeedFile(key);
		await fila.writeText(json);
		return feed;
	}
	
	/** */
	async function writeFeedPost(feedKey: number, postKeys: number[])
	{
		const fila = await getFeedPostsFile(feedKey);
		await appendArrayFile(fila, postKeys);
	}
	
	/**
	 * 
	 */
	export async function readFeed(key: number)
	{
		let fila = await getFeedFile(key);
		if (!await fila.exists())
		{
			fila = await getFeedFileArchived(key);
			if (!await fila.exists())
				return null;
		}
		
		const jsonText = await fila.readText();
		const feed: IFeed = JSON.parse(jsonText);
		feed.key = key;
		return feed;
	}
	
	/**
	 * Reads all non-archived feeds from the file system.
	 */
	export async function * readFeeds()
	{
		const folder = (await getFeedFile(0)).up();
		const files = await folder.readDirectory();
		
		for (const file of files)
		{
			if (file.extension !== ".json")
				continue;
			
			const key = keyOf(file);
			const feed = await readFeed(key);
			if (feed)
				yield feed;
		}
	}
	
	/** */
	export async function * readFeedPosts(feedKey: number)
	{
		for (const postKey of await readFeedPostKeys(feedKey))
		{
			const post = await readPost(postKey);
			if (post)
				yield post;
		}
	}
	
	/** */
	async function readFeedPostKeys(feedKey: number)
	{
		const fila = await getFeedPostsFile(feedKey);
		const postKeys = await readArrayFile(fila);
		return postKeys;
	}
	
	/**
	 * Moves the feed file to the archive (which is the unfollow operation).
	 */
	export async function archiveFeed(feedKey: number)
	{
		const src = await getFeedFile(feedKey);
		const json = await src.readText();
		const dst = await getFeedFileArchived(feedKey);
		dst.writeText(json);
		src.delete();
		
		// Remove the feed from any scroll files.
		for (const fila of await readScrollFilas("json"))
		{
			const diskScrollJson = await fila.readText();
			const diskScroll: IDiskScroll = JSON.parse(diskScrollJson);
			
			for (let i = diskScroll.feeds.length; i-- > 0;)
			{
				const key = diskScroll.feeds[i];
				if (key === feedKey)
					diskScroll.feeds.splice(i, 1);
			}
			
			const diskScrollJsonNew = JSON.stringify(diskScroll);
			fila.writeText(diskScrollJsonNew);
		}
	}
	
	/** */
	async function getFeedsFolder()
	{
		const fila = await Util.getDataFolder();
		return fila.down(DEBUG ? "+feeds" : "feeds");
	}
	
	/** */
	async function getFeedFile(key: number)
	{
		return (await getFeedsFolder()).down(key + ".json");
	}
	
	/** */
	async function getFeedPostsFile(key: number)
	{
		return (await getFeedsFolder()).down(key + ".txt");
	}
	
	/** */
	async function getFeedFileArchived(key: number)
	{
		const fila = await Util.getDataFolder();
		return fila.down("feeds-archived").down(key + ".json");
	}
	
	/**
	 * Writes the URLs contained in the specified to the file system, in their full-qualified
	 * form, and returns an object that indicates what URLs where added and which ones
	 * were removed from the previous time that this function was called.
	 * 
	 * Worth noting that the URLs are expected to be in their fully-qualified form,
	 * which is different from how the URLs are typically written in the feed text file.
	 */
	export async function captureRawFeed(feed: IFeed, urls: string[])
	{
		if (!feed.key)
			throw new Error("Cannot capture this feed because it has no key.");
		
		const added: string[] = [];
		const removed: string[] = [];
		const filaRaw = (await getFeedsRawFolder()).down(feed.key + ".txt");
		
		if (await filaRaw.exists())
		{
			const rawText = await filaRaw.readText();
			const rawLines = rawText.split("\n");
			const rawLinesSet = new Set(rawLines);
			const urlsSet = new Set(urls);
			
			for (const url of rawLines)
				if (!urlsSet.has(url))
					removed.push(url);
			
			for (const url of urls)
				if (!rawLinesSet.has(url))
					added.push(url);
		}
		else
		{
			added.push(...urls);
		}
		
		const text = urls.join("\n");
		await filaRaw.writeText(text);
		
		return { added, removed };
	}
	
	/** */
	async function getFeedsRawFolder()
	{
		const fila = await Util.getDataFolder();
		return fila.down("feeds-raw");
	}
	
	/** */
	export async function readPost(key: number)
	{
		const postsFile = await getPostsFile(key);
		const postsObject = await readPostsFile(postsFile);
		const diskPost: IDiskPost = postsObject[key];
		if (!diskPost)
			return null;
		
		const feed = await readFeed(diskPost.feed);
		if (!feed)
			return null;
		
		return <IPost>{
			key,
			feed,
			visited: diskPost.visited,
			path: diskPost.path,
		};
	}
	
	/** */
	export async function writePost(post: Partial<IPost>)
	{
		if (!post.key)
			post.key = Util.getSafeTicks();
		
		const fullPost = post as IPost;
		
		const diskPost: IDiskPost = {
			visited: fullPost.visited || false,
			feed: fullPost.feed?.key || 0,
			path: fullPost.path || ""
		};
		
		if (!diskPost.path)
			throw new Error("Post has no .path property.");
		
		const postsFile = await getPostsFile(post.key);
		const postsObject = await readPostsFile(postsFile);
		
		// This may either override the post at the existing key,
		// or assign a new post at the new key.
		postsObject[post.key] = diskPost;
		
		const postsObjectJsonText = JSON.stringify(postsObject);
		await postsFile.writeText(postsObjectJsonText);
		
		// Add the post to the feed
		await writeFeedPost(diskPost.feed, [post.key]);
		
		return fullPost;
	}
	
	/**
	 * Reads the contents of a JSON file that contains multiple posts.
	 */
	async function readPostsFile(postsFila: Fila)
	{
		if (!await postsFila.exists())
			return {};
		
		const postsJson = await postsFila.readText();
		const postsObject = Util.tryParseJson(postsJson) as IPostFile;
		return postsObject;
	}
	
	/** */
	async function getPostsFolder()
	{
		const fila = await Util.getDataFolder();
		return fila.down("posts");
	}
	
	/** */
	async function getPostsFile(key: number)
	{
		const date = new Date(key);
		const y = date.getFullYear();
		const m = ("0" + (date.getMonth() + 1)).slice(-2);
		const d = ("0" + date.getDate()).slice(-2);
		const postsFileName = [y, m, d].join("-") + ".json";
		return (await getPostsFolder()).down(postsFileName);
	}
	
	/** */
	function keyOf(fila: Fila)
	{
		return Number(fila.name.split(".")[0]) || 0;
	}
	
	/** */
	async function readArrayFile(fila: Fila, options?: IReadArrayOptions)
	{
		if (!await fila.exists())
			return [];
		
		const text = await fila.readText();
		const numbers: number[] = [];
		let lines = text.split("\n");
		
		const start = options?.start || 0;
		lines = lines.slice(start);
		lines = lines.slice(0, options?.limit);
		
		for (const line of lines)
		{
			const n = Number(line) || 0;
			if (n > 0)
				numbers.push(n);
		}
		
		return numbers;
	}
	
	/** */
	async function appendArrayFile(fila: Fila, keys: number[])
	{
		const text = keys.map(k => k + "\n").join("");
		await fila.writeText(text, { append: true });
	}
	
	/**
	 * Deletes all data in the data folder.
	 * Intended only for debugging purposes.
	 */
	export async function clear()
	{
		const scrollFolder = await getScrollFolder();
		const feedFolder = await getFeedsFolder();
		const feedRawFolder = await getFeedsRawFolder();
		const postsFolder = await getPostsFolder();
		const all: Fila[] = [];
		
		if (await scrollFolder.exists())
			all.push(...await scrollFolder.readDirectory());
		
		if (await feedFolder.exists())
			all.push(...await feedFolder.readDirectory());
		
		if (await feedRawFolder.exists())
			all.push(...await feedRawFolder.readDirectory());
		
		if (await postsFolder.exists())
			all.push(...await postsFolder.readDirectory());
		
		await Promise.all(all.map(fila => fila.delete()));
	}
}
