
namespace Squares.Data
{
	/** */
	export interface IReadArrayOptions
	{
		start?: number;
		limit?: number;
	}
	
	/** */
	export async function setupDataCache()
	{
		initializeScrollCache();
		
		for await (const feed of readFeedsFromDisk())
			localFeedCache.set(feed.key, feed);
	}
	
	//# Feeds
	
	export const localFeedCache = new Map<number, IFeed>();
	export const localFeedPostKeysCache = new Map<number, number[]>();
	
	/**
	 * Creates a new IFeed object to disk, optionally populated with the
	 * specified values, writes it to disk, and returns the constructed object.
	 */
	export function writeFeed(...defaults: Partial<IFeed>[])
	{
		const key = Util.getSafeTicks();
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
		
		if (!feed.url)
			throw new Error(".url property must be populated.");
		
		const diskFeed = Object.assign({}, feed) as IDiskFeed;
		delete (diskFeed as any).key;
		const json = JSON.stringify(diskFeed);
		
		(async () =>
		{
			const fila = getFeedFile(feed.key);
			await fila.writeText(json);
		})();
		
		localFeedCache.set(feed.key, feed);
		return feed;
	}
	
	/**
	 * 
	 */
	export function getFeed(key: number)
	{
		return localFeedCache.get(key) || null;
	}
	
	/**
	 * Returns an interator that enumerates through
	 * all the feeds loaded into memory.
	 */
	export function eachFeed()
	{
		return localFeedCache.values();
	}
	
	/**
	 * Reads the post from the specified feed, at the specified position.
	 */
	export async function readFeedPost(feedKey: number, position: number)
	{
		const feed = localFeedCache.get(feedKey);
		if (!feed)
			return null;
		
		const postKeys = await readFeedPostKeys(feedKey);
		const key = postKeys.at(position);
		if (!key)
			return null;
		
		const post = await readPost(key);
		return post;
	}
	
	/**
	 * Reads all non-archived feeds from the file system.
	 */
	async function * readFeedsFromDisk()
	{
		const folder = getFeedFile(0).up();
		const files = await folder.readDirectory();
		
		for (const file of files)
		{
			if (file.extension !== ".json")
				continue;
			
			const feedKey = keyOf(file);
			const feed = await readFeedFromDisk(feedKey);
			if (feed)
				yield feed;
		}
	}
	
	/**
	 * Reads a single feed from disk, whose file name
	 * matches the specified key.
	 */
	async function readFeedFromDisk(key: number)
	{
		let fila = getFeedFile(key);
		if (!await fila.exists())
		{
			fila = getFeedFileArchived(key);
			if (!await fila.exists())
				return null;
		}
		
		const jsonText = await fila.readText();
		const feed: IFeed = JSON.parse(jsonText);
		feed.key = key;
		return feed;
	}
	
	/**
	 * Moves the feed file to the archive (which is the unfollow operation).
	 */
	export async function archiveFeed(feedKey: number)
	{
		const src = getFeedFile(feedKey);
		const json = await src.readText();
		const dst = getFeedFileArchived(feedKey);
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
	function getFeedFile(key: number)
	{
		return getFeedsFolder().down(key + ".json");
	}
	
	/** */
	function getFeedPostKeysFile(key: number)
	{
		return getFeedsFolder().down(key + ".txt");
	}
	
	/** */
	function getFeedsFolder()
	{
		return Util.getDataFolder().down("feeds");;
	}
	
	/** */
	function getFeedFileArchived(key: number)
	{
		const fila = Util.getDataFolder();
		return fila.down("archive").down(key + ".json");
	}
	
	//# Indexes
	
	/**
	 * Writes the URLs contained in the specified to the file system, in their full-qualified
	 * form, and returns an object that indicates what URLs where added and which ones
	 * were removed from the previous time that this function was called.
	 * 
	 * The URLs are expected to be in their fully-qualified form, which is different from
	 * how the URLs are typically written in the feed text file.
	 */
	export async function writeIndexUpdate(feed: IFeed, urls: string[])
	{
		if (!feed.key)
			throw new Error("Cannot capture this feed because it has no key.");
		
		const added: string[] = [];
		const removed: string[] = [];
		const filaIndex = getIndexesFolder().down(feed.key + ".txt");
		
		if (await filaIndex.exists())
		{
			const rawText = await filaIndex.readText();
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
		await filaIndex.writeText(text);
		
		return { added, removed };
	}
	
	/** */
	function getIndexesFolder()
	{
		return Util.getDataFolder().down("indexes");
	}
	
	//# Posts
	
	/** */
	export async function readPost(key: number)
	{
		const postsFile = getPostsFile(key);
		const postsObject = await readPostsFile(postsFile);
		const diskPost: IDiskPost = postsObject[key];
		if (!diskPost)
			return null;
		
		const feed = getFeed(diskPost.feed);
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
		const results = await writePosts(post);
		return results[0];
	}
	
	/** */
	export async function writePosts(...posts: Partial<IPost>[])
	{
		const postsFileObjects = new Map<string, IPostFileObject>();
		const fullPosts: IPost[] = [];
		
		for (const post of posts)
		{
			if (!post.key)
				post.key = Util.getSafeTicks();
			
			const fullPost = post as IPost;
			const feedKey = fullPost.feed?.key || 0;
			
			const diskPost: IDiskPost = {
				visited: fullPost.visited || false,
				feed: feedKey,
				path: fullPost.path || ""
			};
			
			if (!diskPost.path)
				throw new Error("Post has no .path property.");
			
			const postsFila = getPostsFile(post.key);
			
			let postsFileObject = postsFileObjects.get(postsFila.path);
			if (!postsFileObject)
			{
				postsFileObject = await readPostsFile(postsFila);
				postsFileObjects.set(postsFila.path, postsFileObject);
			}
			
			// This may either override the post at the existing key,
			// or assign a new post at the new key.
			postsFileObject[post.key] = diskPost;
			
			fullPosts.push(fullPost);
		}
		
		for (const [path, postsFileObject] of postsFileObjects)
		{
			const postsObjectJsonText = JSON.stringify(postsFileObject);
			await new Fila(path).writeText(postsObjectJsonText);
		}
		
		return fullPosts;
	}
	
	/**
	 * Returns the post keys for the specified feed from memory.
	 * If the post keys do not exist in memory, they are loaded from
	 * disk, cached, and returned.
	 */
	async function readFeedPostKeys(feedKey: number)
	{
		let postKeys = localFeedPostKeysCache.get(feedKey);
		if (postKeys)
			return postKeys;
		
		const fila = getFeedPostKeysFile(feedKey);
		postKeys = await readArrayFile(fila);
		localFeedPostKeysCache.set(feedKey, postKeys);
		return postKeys;
	}
	
	/**
	 * 
	 */
	export async function writeFeedPosts(feedKey: number, newPostKeys: number[])
	{
		const cachedPostKeys = localFeedPostKeysCache.get(feedKey) || [];
		cachedPostKeys.push(...newPostKeys);
		localFeedPostKeysCache.set(feedKey, cachedPostKeys);
		const fila = getFeedPostKeysFile(feedKey);
		await appendArrayFile(fila, newPostKeys);
	}
	
	/**
	 * Reads the contents of a JSON file that contains multiple posts.
	 */
	async function readPostsFile(postsFila: Fila)
	{
		if (!await postsFila.exists())
			return {};
		
		const postsJson = await postsFila.readText();
		const postsObject = Util.tryParseJson(postsJson) as IPostFileObject;
		return postsObject;
	}
	
	/** */
	function getPostsFolder()
	{
		return Util.getDataFolder().down("posts");
	}
	
	/** */
	function getPostsFile(key: number)
	{
		const date = new Date(key);
		const y = date.getFullYear();
		const m = ("0" + (date.getMonth() + 1)).slice(-2);
		const d = ("0" + date.getDate()).slice(-2);
		const postsFileName = [y, m, d].join("-") + ".json";
		return getPostsFolder().down(postsFileName);
	}
	
	//# Scrolls
	
	const localScrollCache = new Map<number, IScroll>();
	const localScrollPostKeysCache = new Map<number, number[]>();
	
	/** */
	async function initializeScrollCache()
	{
		for (const scroll of await readScrollsFromDisk())
		{
			localScrollCache.set(scroll.key, scroll);
			const postKeys = await readScrollPostKeysFromDisk(scroll.key);
			localScrollPostKeysCache.set(scroll.key, postKeys);
		}
	}
	
	/** */
	async function readScrollsFromDisk()
	{
		const scrolls: IScroll[] = [];
		
		for (const fila of await readScrollFilas("json"))
		{
			const key = keyOf(fila);
			const scroll = await readScrollFromDisk(key);
			if (scroll)
				scrolls.push(scroll);
		}
		
		return scrolls;
	}
	
	/**
	 * Read the scroll object from the file system with the specified key.
	 * If the argument is omitted, the first discovered scroll is returned.
	 */
	async function readScrollFromDisk(key?: number)
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
			const feed = getFeed(feedKey);
			if (feed)
				feeds.push(feed);
		}
		
		const scroll: IScroll = {
			anchorIndex: diskScroll.anchorIndex,
			key,
			feeds,
			length: diskScroll.length,
		};
		
		return scroll;
	}
	
	/** */
	async function readScrollPostKeysFromDisk(scrollKey: number)
	{
		const fila = getScrollPostsFile(scrollKey);
		const postKeys = await readArrayFile(fila);
		return postKeys;
	}
	
	/** */
	async function readScrollFilas(type: "json" | "txt")
	{
		const folder = getScrollFolder();
		if (!await folder.exists())
			return [];
		
		const filas = await folder.readDirectory();
		const reg = new RegExp("^[0-9]+\\." + type + "$");
		return filas.filter(f => reg.test(f.name));
	}
	
	/**
	 * Returns whether there is at least one scroll written to the data layer.
	 */
	export function getScrollCount()
	{
		return localScrollCache.size;
	}
	
	/**
	 * 
	 */
	export function getScroll(keyOrPosition: number)
	{
		return isKey(keyOrPosition) ?
			localScrollCache.get(keyOrPosition) || null :
			Array.from(localScrollCache.values())[keyOrPosition] || null;
	}
	
	/**
	 * 
	 */
	export function getScrolls()
	{
		return Array.from(localScrollCache.values());
	}
	
	/** */
	export function writeScroll(defaults: Partial<IScroll>)
	{
		const scroll: IScroll = Object.assign(
			{
				key: Util.getSafeTicks(),
				anchorIndex: 0,
				feeds: [],
				length: 0,
			},
			defaults
		);
		
		const diskScroll: IDiskScroll = {
			anchorIndex: scroll.anchorIndex,
			feeds: scroll.feeds.map(s => s.key),
			length: scroll.length
		};
		
		(async () =>
		{
			const key = scroll.key;
			const json = JSON.stringify(diskScroll);
			await getScrollFile(key).writeText(json);
		})();
		
		localScrollCache.set(scroll.key, scroll);
		return scroll;
	}
	
	/**
	 * Adds a reference to a post within a particular scroll.
	 */
	export async function writeScrollPost(scrollKey: number, postKey: number)
	{
		const fila = getScrollPostsFile(scrollKey);
		const newKeys = [postKey];
		await appendArrayFile(fila, newKeys);
		
		const allKeys = localScrollPostKeysCache.get(scrollKey) || [];
		allKeys.push(postKey);
		localScrollPostKeysCache.set(scrollKey, allKeys);
			
		const scroll = getScroll(scrollKey);
		if (!scroll)
			throw new Error("scroll with key not found: " + scrollKey);
		
		scroll.length++;
		writeScroll(scroll);
	}
	
	/**
	 * Reads a post that has been directly attached to a scroll.
	 */
	export async function readScrollPost(scrollKey: number, index: number)
	{
		const postKeys = localScrollPostKeysCache.get(scrollKey);
		const postKey = postKeys?.at(index);
		return postKey ? await readPost(postKey) : null;
	}
	
	/** */
	function getScrollFile(key: number)
	{
		return getScrollFolder().down(key + ".json");
	}
	
	/** */
	function getScrollPostsFile(key: number)
	{
		return getScrollFolder().down(key + ".txt");
	}
	
	/** */
	function getScrollFolder()
	{
		return Util.getDataFolder().down("scrolls");
	}
	
	//# Generic
	
	/** */
	function keyOf(fila: Fila)
	{
		return Number(fila.name.split(".")[0]) || 0;
	}
	
	/** */
	function isKey(keyOrIndex: number)
	{
		return keyOrIndex > 1700000000000;
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
		const scrollFolder = getScrollFolder();
		const feedFolder = getFeedsFolder();
		const indexesFolder = getIndexesFolder();
		const postsFolder = getPostsFolder();
		const all: Fila[] = [];
		
		if (await scrollFolder.exists())
			all.push(...await scrollFolder.readDirectory());
		
		if (await feedFolder.exists())
			all.push(...await feedFolder.readDirectory());
		
		if (await indexesFolder.exists())
			all.push(...await indexesFolder.readDirectory());
		
		if (await postsFolder.exists())
			all.push(...await postsFolder.readDirectory());
		
		await Promise.all(all.map(fila => fila.delete()));
	}
}
