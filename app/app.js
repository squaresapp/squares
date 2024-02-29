"use strict";
var Cover;
(function (Cover) {
    /** */
    async function startupAsDebug() {
        await Squares.startup();
    }
    Cover.startupAsDebug = startupAsDebug;
    /** */
    async function startupAsDebugWithData() {
        await Squares.startup(true);
    }
    Cover.startupAsDebugWithData = startupAsDebugWithData;
    /** */
    async function startup() {
        Object.assign(globalThis, { DEBUG: false });
        await Squares.startup();
    }
    Cover.startup = startup;
    /** */
    async function startupWithData() {
        Object.assign(globalThis, { DEBUG: false });
        await Squares.startup(true);
    }
    Cover.startupWithData = startupWithData;
    /** */
    async function coverFollow() {
        await Squares.startup();
        const link = "https://webfeed-tulips.pages.dev/index.txt";
        await Squares.FollowUtil.followWebfeeds(link);
    }
    Cover.coverFollow = coverFollow;
})(Cover || (Cover = {}));
typeof module === "object" && Object.assign(module.exports, { Cover });
// The globalThis value isn't available in Safari, so a polyfill is necessary:
if (typeof globalThis === "undefined")
    window.globalThis = window;
// If the DEBUG flag is undefined, that means that the executing code
// has not passed through terser, and so we are either running in a
// cover function, or in one of the hosts in debug mode. In this case,
// we set the compilation constants explicitly at runtime.
if (typeof DEBUG === "undefined")
    Object.assign(globalThis, { DEBUG: true });
if (typeof ELECTRON === "undefined")
    Object.assign(globalThis, { ELECTRON: typeof screen + typeof require === "objectfunction" });
if (typeof TAURI === "undefined")
    Object.assign(globalThis, { TAURI: typeof window !== "undefined" && typeof window.__TAURI__ !== "undefined" });
if (typeof IOS === "undefined")
    Object.assign(globalThis, { IOS: typeof navigator !== "undefined" && navigator.platform.startsWith("iP") });
if (typeof ANDROID === "undefined")
    Object.assign(globalThis, { ANDROID: typeof navigator !== "undefined" && navigator.userAgent.includes("Android") });
if (typeof DEMO === "undefined") {
    const host = window.location.hostname;
    Object.assign(globalThis, { DEMO: !!host && !(Number(host.split(".").join("")) > 0) });
}
var Squares;
(function (Squares) {
    /**
     * The main entry point of the app.
     *
     * This function is called automatically, in every environment (Tauri, Capacitor),
     * except when running from a Moduless cover function.
     */
    async function startup(useDefaultData) {
        if (document.readyState !== "complete") {
            await new Promise(resolve => {
                document.addEventListener("readystatechange", () => {
                    if (document.readyState === "complete")
                        resolve();
                });
            });
        }
        window.t = raw.text.bind(raw);
        // The CAPACITOR constant needs to be defined after the document has loaded,
        // otherwise, window.Capacitor will be undefined (on Android, it doesn't appear
        // to be injected right away.
        if (typeof CAPACITOR === "undefined")
            Object.assign(globalThis, { CAPACITOR: typeof Capacitor === "object" });
        const g = globalThis;
        if (ELECTRON) {
            const g = globalThis;
            g.Electron = Object.freeze({
                app: require("electron"),
                fs: require("fs"),
                path: require("path"),
            });
        }
        else if (TAURI) {
            const g = globalThis;
            g.Tauri = g.__TAURI__;
        }
        else if (CAPACITOR) {
            g.AppLauncher = g.Capacitor?.Plugins?.AppLauncher;
            g.BackgroundFetch = g.Capacitor?.Plugins?.BackgroundFetch;
            g.CapacitorApp = g.Capacitor?.Plugins?.App;
            g.CapClipboard = g.Capacitor?.Plugins?.Clipboard;
            g.Toast = g.Capacitor?.Plugins?.Toast;
        }
        if (DEBUG || DEMO)
            await Squares.Data.clear();
        if (DEBUG) {
            const dataFolder = await Squares.Util.getDataFolder();
            if (!await dataFolder.exists())
                await dataFolder.writeDirectory();
        }
        if (DEBUG || DEMO)
            if (useDefaultData)
                await Squares.runDataInitializer(Squares.feedsDefault);
        Squares.appendCssReset();
        Squares.FollowUtil.setupSystemListeners();
        await Squares.Data.initialize();
        const rootHat = new Squares.RootHat();
        await rootHat.construct();
        document.body.append(rootHat.head);
    }
    Squares.startup = startup;
    // Auto-run the startup function if not running as a moduless cover function
    if (typeof Moduless === "undefined")
        startup();
})(Squares || (Squares = {}));
typeof module === "object" && Object.assign(module.exports, { Squares });
var Squares;
(function (Squares) {
    /**
     * Provides a way to dispatch a bubbling CustomEvent
     * object with type-safe .details property.
     */
    function dispatch(name, a, b) {
        const target = [a, b].find(e => Raw.is.element(e)) || document.body;
        const detail = [a, b].find(e => !!e && !Raw.is.element(e) ? e : null) || {};
        const ev = new CustomEvent(name, { bubbles: true, detail });
        target.dispatchEvent(ev);
        return detail;
    }
    Squares.dispatch = dispatch;
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    //@ts-ignore
    if (!DEBUG && !DEMO)
        return;
    Squares.feedsDefault = [
        "https://webfeed-tulips.pages.dev/index.txt",
        "https://webfeed-beaches.pages.dev/index.txt",
    ];
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    let Images;
    (function (Images) {
        Images["appLogo"] = "<svg height=\"150\" viewBox=\"0 0 190 150\" width=\"190\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><radialGradient id=\"a\" cx=\"84.758723%\" cy=\"13.698648%\" gradientTransform=\"matrix(-.38793823 .56367144 -.92168537 -.23724983 1.302656 -.308275)\" r=\"153.105708%\"><stop offset=\"0\" stop-color=\"#359aff\"/><stop offset=\"1\" stop-color=\"#06c\"/></radialGradient><radialGradient id=\"b\" cx=\"58.546912%\" cy=\"18.144159%\" gradientTransform=\"matrix(-.39278345 .56214652 -.91963099 -.24009831 .982291 -.104113)\" r=\"145.613102%\"><stop offset=\"0\" stop-color=\"#ff3556\"/><stop offset=\"1\" stop-color=\"#ad1f36\"/></radialGradient><g fill=\"none\" fill-rule=\"evenodd\" transform=\"translate(0 .03635)\"><path d=\"m179.911781.00039741c5.522632-.04872228 10.039108 4.38875878 10.08783 9.91139136l.000389 129.64114323c0 5.522848-4.477153 10-10 10h-81.298002l-.055725-31.732759c-.0021869-1.245331.7652246-2.362524 1.928401-2.807354l18.841568-7.205531c1.54755-.591825 2.322317-2.32613 1.730492-3.87368-.015591-.040768-.032069-.08119-.049424-.121239l-.787216-1.816632c-.633946-1.462937-2.301473-2.1744357-3.796279-1.619792l-13.931726 5.16933c-1.553371.576374-3.2798693-.215639-3.8562432-1.769009-.1239254-.333988-.1873743-.687379-.1873743-1.043617v-58.288123c0-5.1924792 2.0194395-10.1814187 5.6312965-13.9118783l26.252516-27.11457192c1.862504-1.92366317 4.418663-3.0200503 7.096132-3.04367172zm-27.5572 36.19363999c-1.952206-1.9502015-5.115231-1.9502015-7.067436 0l-10.660579 10.6496364c-1.95525 1.9572548-1.953624 5.1230792 0 7.0746978l10.660579 10.6496364c1.952205 1.9502015 5.11523 1.9502015 7.067436 0l10.660579-10.6496364c1.955249-1.9572547 1.953623-5.1230792 0-7.0746978z\" fill=\"url(#a)\"/><path d=\"m10.0169801.33912319 38.6206399.06557846c2.5084398.00425937 4.9236673.95110215 6.766681 2.65274516l29.6245498 27.35216139c4.1006024 3.7860606 6.4326777 9.1133345 6.4326777 14.6944809v57.5842849c0 .365874-.0669274.728662-.1974777 1.070452-.5911947 1.547791-2.3251847 2.323265-3.872975 1.73207l-13.3321768-5.092365c-1.4863985-.5677452-3.157499.123726-3.8081557 1.575745l-.8942379 1.995601c-.0285236.063654-.0548185.128283-.0788367.19377-.5705141 1.555532.2280007 3.279033 1.7835326 3.849547l18.4014102 6.748986c1.1857196.43488 1.9721013 1.56579 1.9669681 2.828733l-.1315776 32.372737h-81.298002c-5.5228475 0-10-4.477152-10-10l.00001442-129.6415214c.00937787-5.5228395 4.49412618-9.99238328 10.01696568-9.98300541zm38.688664 36.41556101c-1.9522053-1.9502015-5.1152307-1.9502015-7.067436 0l-10.6605789 10.6496364c-.0012109.0012097-.0024212.00242-.0036309.0036309-1.9516185 1.9536238-1.9499929 5.1194483.0036309 7.0710669l10.6605789 10.6496364c1.9522053 1.9502015 5.1152307 1.9502015 7.067436 0l10.6605789-10.6496364c.0012109-.0012097.0024212-.00242.0036309-.0036309 1.9516186-1.9536239 1.949993-5.1194483-.0036309-7.0710669z\" fill=\"url(#b)\"/></g></svg>";
    })(Images = Squares.Images || (Squares.Images = {}));
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    let Strings;
    (function (Strings) {
        Strings["openingTitle"] = "Welcome To Squares";
        Strings["openingMessage"] = "Squares is where you avoid the chaos of social media platforms. It doesn\u2019t show you anything unless someone you follow shares it.";
        Strings["openingAction"] = "Find feeds to follow";
        Strings["findFeedsUrl"] = "https://www.squaresapp.org/feeds/";
        Strings["following"] = "Following";
        Strings["unfollow"] = "Unfollow";
        Strings["nowFollowing"] = "Now following";
        Strings["nowFollowingCount"] = "Now following ? feeds";
        Strings["invalidFollowUrl"] = "Invalid follow URL";
        Strings["share"] = "Share";
        Strings["unknownAuthor"] = "(Author Unknown)";
    })(Strings = Squares.Strings || (Squares.Strings = {}));
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /**
     *
     */
    class BackgroundFetcher {
        /** */
        constructor() {
            //! Not implemented
        }
    }
    Squares.BackgroundFetcher = BackgroundFetcher;
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    var Data;
    (function (Data) {
        /** */
        async function initialize() {
            for (const postFila of await readScrollFilas("json")) {
                const key = parseInt(postFila.name) || 0;
                const postKeys = await readScrollPostKeys(key);
                scrollPostCounts.set(key, postKeys.length);
            }
        }
        Data.initialize = initialize;
        /**
         * Returns whether there is at least one scroll written to the data layer.
         */
        function hasScrolls() {
            return scrollPostCounts.size > 0;
        }
        Data.hasScrolls = hasScrolls;
        /** */
        function readScrollPostCount(scrollKey) {
            return scrollPostCounts.get(scrollKey) || 0;
        }
        Data.readScrollPostCount = readScrollPostCount;
        const scrollPostCounts = new Map();
        /** */
        async function writeScroll(defaults) {
            const scroll = Object.assign({
                key: Squares.Util.getSafeTicks(),
                anchorIndex: 0,
                feeds: []
            }, defaults);
            const diskScroll = {
                anchorIndex: scroll.anchorIndex,
                feeds: scroll.feeds.map(s => s.key),
            };
            const key = scroll.key;
            const json = JSON.stringify(diskScroll);
            const fila = await getScrollFile(key);
            await fila.writeText(json);
            return scroll;
        }
        Data.writeScroll = writeScroll;
        /**
         * Adds a reference to a post within a particular scroll.
         */
        async function writeScrollPost(scrollKey, post) {
            const fila = await getScrollPostsFile(scrollKey);
            const keys = [post.key];
            await appendArrayFile(fila, keys);
            scrollPostCounts.set(scrollKey, (scrollPostCounts.get(scrollKey) || 0) + 1);
        }
        Data.writeScrollPost = writeScrollPost;
        /**
         * Read the scroll object from the file system with the specified key.
         * If the argument is omitted, the first discovered scroll is returned.
         */
        async function readScroll(key) {
            if (!key)
                for (const fila of await readScrollFilas("json"))
                    key = keyOf(fila);
            if (!key)
                return null;
            const fila = await getScrollFile(key);
            if (!await fila.exists())
                return null;
            const diskScrollJson = await fila.readText();
            const diskScroll = JSON.parse(diskScrollJson);
            const feeds = [];
            for (const feedKey of diskScroll.feeds) {
                const feed = await readFeedDetail(feedKey);
                if (feed)
                    feeds.push(feed);
            }
            const scroll = {
                anchorIndex: diskScroll.anchorIndex,
                key,
                feeds,
            };
            return scroll;
        }
        Data.readScroll = readScroll;
        /** */
        async function readScrolls() {
            const scrolls = [];
            for (const fila of await readScrollFilas("json")) {
                const key = keyOf(fila);
                const scroll = await readScroll(key);
                if (scroll)
                    scrolls.push(scroll);
            }
            return scrolls;
        }
        Data.readScrolls = readScrolls;
        /** */
        async function readScrollFilas(type) {
            const folder = await getScrollFolder();
            if (!await folder.exists())
                return [];
            const filas = await folder.readDirectory();
            const reg = new RegExp("^[0-9]+\\." + type + "$");
            return filas.filter(f => reg.test(f.name));
        }
        /** */
        async function readScrollPost(scrollKey, index) {
            for await (const post of readScrollPosts(scrollKey, { start: index, limit: 1 }))
                return post;
            return null;
        }
        Data.readScrollPost = readScrollPost;
        /** */
        async function* readScrollPosts(scrollKey, options) {
            for (const postKey of await readScrollPostKeys(scrollKey, options)) {
                const post = await readPost(postKey);
                if (post)
                    yield post;
            }
        }
        Data.readScrollPosts = readScrollPosts;
        /** */
        async function readScrollPostKeys(scrollKey, options) {
            const fila = await getScrollPostsFile(scrollKey);
            const postKeys = await readArrayFile(fila, options);
            return postKeys;
        }
        /** */
        async function getScrollFolder() {
            const fila = await Squares.Util.getDataFolder();
            return fila.down("scrolls");
        }
        /** */
        async function getScrollFile(key) {
            return (await getScrollFolder()).down(key + ".json");
        }
        /** */
        async function getScrollPostsFile(key) {
            return (await getScrollFolder()).down(key + ".txt");
        }
        /**
         * Creates a new IFeed object to disk, optionally populated with the
         * specified values, writes it to disk, and returns the constructed object.
         */
        async function writeFeed(...defaults) {
            const key = Squares.Util.getSafeTicks();
            const feed = Object.assign({
                key,
                url: "",
                icon: "",
                author: "",
                description: "",
                size: 0,
            }, ...defaults);
            if (!feed.url)
                throw new Error(".url property must be populated.");
            const diskFeed = Object.assign({}, feed);
            delete diskFeed.key;
            const json = JSON.stringify(diskFeed);
            const fila = await getFeedDetailsFile(key);
            await fila.writeText(json);
            return feed;
        }
        Data.writeFeed = writeFeed;
        /** */
        async function writeFeedPost(feedKey, postKeys) {
            const fila = await getFeedPostKeysFile(feedKey);
            await appendArrayFile(fila, postKeys);
        }
        /**
         *
         */
        async function readFeedDetail(key) {
            let fila = await getFeedDetailsFile(key);
            if (!await fila.exists()) {
                fila = await getFeedFileArchived(key);
                if (!await fila.exists())
                    return null;
            }
            const jsonText = await fila.readText();
            const feed = JSON.parse(jsonText);
            feed.key = key;
            return feed;
        }
        Data.readFeedDetail = readFeedDetail;
        /**
         * Reads all non-archived feeds from the file system.
         */
        async function* readFeedDetails() {
            const folder = (await getFeedDetailsFile(0)).up();
            const files = await folder.readDirectory();
            for (const file of files) {
                if (file.extension !== ".json")
                    continue;
                const key = keyOf(file);
                const feed = await readFeedDetail(key);
                if (feed)
                    yield feed;
            }
        }
        Data.readFeedDetails = readFeedDetails;
        /** */
        async function* readFeedPosts(feedKey) {
            for (const postKey of await readFeedPostKeys(feedKey)) {
                const post = await readPost(postKey);
                if (post)
                    yield post;
            }
        }
        Data.readFeedPosts = readFeedPosts;
        /** */
        async function readFeedPostKeys(feedKey) {
            const fila = await getFeedPostKeysFile(feedKey);
            const postKeys = await readArrayFile(fila);
            return postKeys;
        }
        /**
         * Moves the feed file to the archive (which is the unfollow operation).
         */
        async function archiveFeed(feedKey) {
            const src = await getFeedDetailsFile(feedKey);
            const json = await src.readText();
            const dst = await getFeedFileArchived(feedKey);
            dst.writeText(json);
            src.delete();
            // Remove the feed from any scroll files.
            for (const fila of await readScrollFilas("json")) {
                const diskScrollJson = await fila.readText();
                const diskScroll = JSON.parse(diskScrollJson);
                for (let i = diskScroll.feeds.length; i-- > 0;) {
                    const key = diskScroll.feeds[i];
                    if (key === feedKey)
                        diskScroll.feeds.splice(i, 1);
                }
                const diskScrollJsonNew = JSON.stringify(diskScroll);
                fila.writeText(diskScrollJsonNew);
            }
        }
        Data.archiveFeed = archiveFeed;
        /** */
        async function getFeedDetailsFile(key) {
            return (await getFeedsFolder()).down(key + ".json");
        }
        /** */
        async function getFeedPostKeysFile(key) {
            return (await getFeedsFolder()).down(key + ".txt");
        }
        /** */
        async function getFeedsFolder() {
            const fila = await Squares.Util.getDataFolder();
            return fila.down("feeds");
        }
        /** */
        async function getFeedFileArchived(key) {
            const fila = await Squares.Util.getDataFolder();
            return fila.down("archive").down(key + ".json");
        }
        /**
         * Writes the URLs contained in the specified to the file system, in their full-qualified
         * form, and returns an object that indicates what URLs where added and which ones
         * were removed from the previous time that this function was called.
         *
         * The URLs are expected to be in their fully-qualified form, which is different from
         * how the URLs are typically written in the feed text file.
         */
        async function writeFeedUpdates(feed, urls) {
            if (!feed.key)
                throw new Error("Cannot capture this feed because it has no key.");
            const added = [];
            const removed = [];
            const filaIndex = (await getIndexesFolder()).down(feed.key + ".txt");
            if (await filaIndex.exists()) {
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
            else {
                added.push(...urls);
            }
            const text = urls.join("\n");
            await filaIndex.writeText(text);
            return { added, removed };
        }
        Data.writeFeedUpdates = writeFeedUpdates;
        /** */
        async function getIndexesFolder() {
            const fila = await Squares.Util.getDataFolder();
            return fila.down("indexes");
        }
        /** */
        async function readPost(key) {
            const postsFile = await getPostsFile(key);
            const postsObject = await readPostsFile(postsFile);
            const diskPost = postsObject[key];
            if (!diskPost)
                return null;
            const feed = await readFeedDetail(diskPost.feed);
            if (!feed)
                return null;
            return {
                key,
                feed,
                visited: diskPost.visited,
                path: diskPost.path,
            };
        }
        Data.readPost = readPost;
        /** */
        async function writePost(post) {
            if (!post.key)
                post.key = Squares.Util.getSafeTicks();
            const fullPost = post;
            const diskPost = {
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
        Data.writePost = writePost;
        /**
         * Reads the contents of a JSON file that contains multiple posts.
         */
        async function readPostsFile(postsFila) {
            if (!await postsFila.exists())
                return {};
            const postsJson = await postsFila.readText();
            const postsObject = Squares.Util.tryParseJson(postsJson);
            return postsObject;
        }
        /** */
        async function getPostsFolder() {
            const fila = await Squares.Util.getDataFolder();
            return fila.down("posts");
        }
        /** */
        async function getPostsFile(key) {
            const date = new Date(key);
            const y = date.getFullYear();
            const m = ("0" + (date.getMonth() + 1)).slice(-2);
            const d = ("0" + date.getDate()).slice(-2);
            const postsFileName = [y, m, d].join("-") + ".json";
            return (await getPostsFolder()).down(postsFileName);
        }
        /** */
        function keyOf(fila) {
            return Number(fila.name.split(".")[0]) || 0;
        }
        /** */
        async function readArrayFile(fila, options) {
            if (!await fila.exists())
                return [];
            const text = await fila.readText();
            const numbers = [];
            let lines = text.split("\n");
            const start = options?.start || 0;
            lines = lines.slice(start);
            lines = lines.slice(0, options?.limit);
            for (const line of lines) {
                const n = Number(line) || 0;
                if (n > 0)
                    numbers.push(n);
            }
            return numbers;
        }
        /** */
        async function appendArrayFile(fila, keys) {
            const text = keys.map(k => k + "\n").join("");
            await fila.writeText(text, { append: true });
        }
        /**
         * Deletes all data in the data folder.
         * Intended only for debugging purposes.
         */
        async function clear() {
            const scrollFolder = await getScrollFolder();
            const feedFolder = await getFeedsFolder();
            const feedRawFolder = await getIndexesFolder();
            const postsFolder = await getPostsFolder();
            const all = [];
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
        Data.clear = clear;
    })(Data = Squares.Data || (Squares.Data = {}));
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /**
     * Initializes the app with a list of default feeds, and populates
     * a single scroll with the content contained within those feeds.
     */
    async function runDataInitializer(defaultFeedUrls) {
        const feedDetails = [];
        const urlLists = [];
        for (const url of defaultFeedUrls) {
            const urls = await Webfeed.downloadIndex(url);
            if (!urls)
                continue;
            const checksum = await Webfeed.ping(url);
            if (!checksum)
                continue;
            urlLists.push(urls);
            const feedDetail = await Webfeed.downloadIndex(url) || {};
            const feed = await Squares.Data.writeFeed(feedDetail, { url, checksum });
            await Squares.Data.writeFeedUpdates(feed, urls);
            feedDetails.push(feed);
        }
        const scroll = await Squares.Data.writeScroll({ feeds: feedDetails });
        const maxLength = urlLists.reduce((a, b) => a > b.length ? a : b.length, 0);
        for (let i = -1; ++i < maxLength * urlLists.length;) {
            const indexOfList = i % urlLists.length;
            const urlList = urlLists[indexOfList];
            const indexWithinList = Math.floor(i / urlLists.length);
            if (urlList.length <= indexWithinList)
                continue;
            const feed = feedDetails[indexOfList];
            const feedDirectory = Webfeed.getFolderOf(feed.url);
            const path = urlList[indexWithinList].slice(feedDirectory.length);
            const post = await Squares.Data.writePost({ feed, path });
            await Squares.Data.writeScrollPost(scroll.key, post);
        }
    }
    Squares.runDataInitializer = runDataInitializer;
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /**
     * A namespace of functions which are shared between
     * the ForegroundFetcher and the BackgroundFetcher.
     */
    let Fetcher;
    (function (Fetcher) {
        /**
         *
         */
        async function updateModifiedFeeds(modifiedFeeds) {
            const scroll = await Squares.Data.readScroll();
            for (const feed of modifiedFeeds) {
                Webfeed.downloadIndex(feed.url).then(async (urls) => {
                    if (!urls)
                        return;
                    const feedUrlFolder = Webfeed.getFolderOf(feed.url);
                    if (!feedUrlFolder)
                        return null;
                    const { added, removed } = await Squares.Data.writeFeedUpdates(feed, urls);
                    for (const url of added) {
                        const path = url.slice(feedUrlFolder.length);
                        const post = await Squares.Data.writePost({ feed, path });
                        if (scroll)
                            Squares.Data.writeScrollPost(scroll.key, post);
                    }
                });
            }
        }
        Fetcher.updateModifiedFeeds = updateModifiedFeeds;
    })(Fetcher = Squares.Fetcher || (Squares.Fetcher = {}));
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    let FollowUtil;
    (function (FollowUtil) {
        /** */
        function setupSystemListeners() {
            if (CAPACITOR) {
                CapacitorApp.addListener("appUrlOpen", ev => {
                    followWebfeedsFromUniversalLink(ev.url);
                });
            }
            else if (TAURI) {
                // This code needs to setup a clipboard monitor
                // in order to determine when follow links have been
                // copied to the clipboard. The webfeed-follow library
                // needs to add something to the clipboard, the application
                // needs to detect this, and needs to erase the data from
                // the clipboard. This doesn't work very well though,
                // because if the app isn't open, there won't be any
                // clipboard monitoring going on. We need to use custom
                // protocols, but these aren't widely supported in browsers,
                // in seems.
            }
            else if (ELECTRON) {
            }
            // In platforms other than Capacitor, drag and dropping of links
            // from the browser is supported.
            if (!CAPACITOR) {
                raw.get(document.body)(raw.on("dragover", ev => ev.preventDefault()), raw.on("drop", ev => {
                    ev.preventDefault();
                    for (const item of Array.from(ev.dataTransfer?.items || []))
                        if (item.kind === "string" && item.type === "text/uri-list")
                            item.getAsString(string => followWebfeedsFromUniversalLink(string));
                }));
            }
        }
        FollowUtil.setupSystemListeners = setupSystemListeners;
        /**
         *
         */
        async function followWebfeedsFromUniversalLink(url) {
            const webfeedUrls = parseUniversalAppLink(url);
            if (webfeedUrls)
                await followWebfeeds(webfeedUrls);
        }
        /** */
        function parseUniversalAppLink(urlText) {
            if (!urlText.startsWith(universalAppLinkPrefix))
                return null;
            const queryPos = urlText.indexOf("?");
            if (queryPos < 0)
                return null;
            const query = urlText.slice(queryPos + 1);
            const urls = query
                .split("&")
                .map(s => decodeURIComponent(s))
                .map(s => Squares.Util.tryParseUrl(s) ? s : null)
                .filter((s) => !!s)
                .map(s => s.trim());
            if (urls.length === 0)
                return null;
            return urls;
        }
        const universalAppLinkPrefix = "https://deeplink.squaresapp.org/follow/";
        /**
         *
         */
        async function followWebfeeds(webfeedUrls) {
            const feedDetails = [];
            for (const webfeedUrl of Squares.Util.toArray(webfeedUrls)) {
                const urls = await Webfeed.downloadIndex(webfeedUrl);
                if (!urls)
                    return;
                const checksum = await Webfeed.ping(webfeedUrl);
                if (!checksum)
                    return;
                const feedDetail = await Webfeed.downloadDetails(webfeedUrl) || {};
                const feed = await Squares.Data.writeFeed(feedDetail, { checksum, url: webfeedUrl });
                await Squares.Data.writeFeedUpdates(feed, urls);
                feedDetails.push(feed);
            }
            if (feedDetails.length === 0)
                return;
            if (!Squares.Data.hasScrolls())
                await Squares.Data.writeScroll({ feeds: feedDetails });
            Squares.dispatch("squares:follow", { feeds: feedDetails });
            if (CAPACITOR) {
                const text = webfeedUrls.length > 1 ?
                    "Now following ? feeds" /* Strings.nowFollowingCount */.replace("?", "" + webfeedUrls.length) :
                    "Now following" /* Strings.nowFollowing */ + " " + feedDetails[0].author;
                await Toast.show({
                    position: "center",
                    duration: "long",
                    text
                });
            }
        }
        FollowUtil.followWebfeeds = followWebfeeds;
    })(FollowUtil = Squares.FollowUtil || (Squares.FollowUtil = {}));
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /** */
    class ForegroundFetcher {
        /** */
        constructor() { }
        /**
         * Gets whether there is a fetch operation being carried out.
         */
        get isFetching() {
            return !!this.feedIterator;
        }
        feedIterator = null;
        /** */
        async fetch() {
            this.stopFetch();
            this.feedIterator = Squares.Data.readFeedDetails();
            const threads = [];
            const modifiedFeeds = [];
            for (let i = -1; ++i < maxFetchThreads;) {
                // Creates a "thread" that attempts to ping
                // the URL of the next feed in the line.
                threads.push(new Promise(async (r) => {
                    for (;;) {
                        const feedIteration = await this.feedIterator?.next();
                        if (!feedIteration || feedIteration.done) {
                            // If i is less than the number of "threads" running,
                            // and the iterator has run out, that means there's
                            // fewer feeds than there are threads (so avoid
                            // termination in this case).
                            if (i >= maxFetchThreads) {
                                this.feedIterator = null;
                                this.abortControllers.clear();
                            }
                            return r();
                        }
                        const feed = feedIteration.value;
                        const checksum = await Webfeed.ping(feed.url);
                        if (checksum !== feed.checksum)
                            modifiedFeeds.push(feed);
                    }
                }));
            }
            await Promise.all(threads);
            await Squares.Fetcher.updateModifiedFeeds(modifiedFeeds);
        }
        /** */
        stopFetch() {
            for (const ac of this.abortControllers)
                ac.abort();
            this.abortControllers.clear();
            this.feedIterator?.return();
        }
        abortControllers = new Set();
    }
    Squares.ForegroundFetcher = ForegroundFetcher;
    const maxFetchThreads = 10;
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    let Util;
    (function (Util) {
        /**
         * Returns the current date in ticks form, but with any incrementation
         * necessary to avoid returning the same ticks value twice.
         */
        function getSafeTicks() {
            let now = Date.now();
            if (now <= lastTicks)
                now = ++lastTicks;
            lastTicks = now;
            return now;
        }
        Util.getSafeTicks = getSafeTicks;
        let lastTicks = 0;
        /**
         * Returns the fully-qualified URL to the icon image
         * specified in the specified feed.
         */
        function getIconUrl(feed) {
            const folder = Webfeed.getFolderOf(feed.url) || "";
            return new URL(feed.icon, folder).toString();
        }
        Util.getIconUrl = getIconUrl;
        /**
         * Safely parses a string JSON into an object.
         */
        function tryParseJson(jsonText) {
            try {
                return JSON.parse(jsonText);
            }
            catch (e) { }
            return null;
        }
        Util.tryParseJson = tryParseJson;
        /**
         * Parses the specified URL string and returns a URL object,
         * or null if the URL fails to parse.
         */
        function tryParseUrl(url) {
            try {
                return new URL(url);
            }
            catch (e) { }
            return null;
        }
        Util.tryParseUrl = tryParseUrl;
        /**
         * Returns the value wrapped in an array, if it is not already
         * an array to begin with.
         */
        function toArray(value) {
            return Array.isArray(value) ? value : [value];
        }
        Util.toArray = toArray;
        /**
         * Returns the environment-specific path to the application data folder.
         */
        async function getDataFolder() {
            if (TAURI) {
                const dir = await Tauri.path.appDataDir();
                return new Fila(dir);
            }
            else if (ELECTRON) {
                const fila = new Fila(__dirname).down(DEBUG ? "+data" : "data");
                await fila.writeDirectory();
                return fila;
            }
            else if (CAPACITOR) {
                // These values are documented here:
                // https://capacitorjs.com/docs/apis/filesystem#directory
                const path = DEBUG ? "DOCUMENTS" : "DATA";
                return new Fila(path);
            }
            else if (DEMO) {
                return new Fila();
            }
            throw new Error("Not implemented");
        }
        Util.getDataFolder = getDataFolder;
        /** */
        async function readClipboard() {
            if (ELECTRON) {
                const electron = require("electron");
                return electron.clipboard.readText() || "";
            }
            else if (TAURI) {
                const text = await Tauri.clipboard.readText();
                return text || "";
            }
            else if (CAPACITOR) {
                try {
                    const text = await CapClipboard.read();
                    return text.value;
                }
                catch (e) { }
            }
            return "";
        }
        Util.readClipboard = readClipboard;
        /** */
        async function writeClipboard(text) {
            if (CAPACITOR) {
                CapClipboard.write({ string: text });
            }
        }
        Util.writeClipboard = writeClipboard;
        /**
         * Removes problematic CSS attributes from the specified section tag,
         * and ensures that no external CSS is modifying its display propert
         */
        function getSectionSanitizationCss() {
            return {
                position: "relative !",
                zIndex: 0,
                width: "auto !",
                height: "100% !",
                margin: "0 !",
                boxSizing: "border-box !",
                display: "block !",
                float: "none !",
                clipPath: "inset(0 0) !",
                mask: "none !",
                opacity: "1 !",
                transform: "none !",
            };
        }
        Util.getSectionSanitizationCss = getSectionSanitizationCss;
        /**
         *
         */
        async function openWebLink(url) {
            if (CAPACITOR) {
                await AppLauncher.openUrl({ url });
            }
            else if (TAURI) {
            }
            else {
                window.open(url, "_blank");
            }
        }
        Util.openWebLink = openWebLink;
    })(Util = Squares.Util || (Squares.Util = {}));
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /** */
    class DotsHat {
        head;
        /** */
        constructor() {
            this.head = raw.div(Squares.Style.backgroundOverlay(), {
                width: "fit-content",
                padding: "5px 10px",
                borderRadius: "1000px",
                textAlign: "center",
            }, raw.css(" > SPAN", {
                display: "inline-block",
                width: "10px",
                height: "10px",
                margin: "3px",
                borderRadius: "100%",
                backgroundColor: "rgba(128, 128, 128)",
            }), raw.css(" > SPAN." + highlightClass, {
                backgroundColor: "hsl(205, 100%, 50%)",
            }));
            Hat.wear(this);
        }
        /** */
        insert(count, at = this.head.childElementCount) {
            const spans = [];
            for (let i = -1; ++i < count;)
                spans.push(raw.span());
            at = Math.max(0, at);
            at = Math.min(this.head.childElementCount, at);
            if (at >= this.head.childElementCount) {
                this.head.append(...spans);
            }
            else {
                const elements = Array.from(this.head.children);
                elements[at].before(...spans);
            }
        }
        /** */
        highlight(index) {
            index = Math.max(0, index);
            index = Math.min(this.head.childElementCount - 1, index);
            const children = Array.from(this.head.children);
            children.forEach(e => e.classList.remove(highlightClass));
            children[index].classList.add(highlightClass);
        }
    }
    Squares.DotsHat = DotsHat;
    const highlightClass = "highlight";
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /** */
    class FeedMetaHat {
        head;
        /** */
        constructor(data) {
            const iconUrl = Squares.Util.getIconUrl(data);
            const author = data.author || "(Author Unknown)" /* Strings.unknownAuthor */;
            const isFollowing = data.key > 0;
            this.head = raw.div({
                display: "flex",
                height: "100%",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
            }, raw.div({
                display: "flex",
                width: "140px",
                padding: "20px",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
            }, raw.div({
                width: "100%",
                aspectRatio: "1/1",
                borderRadius: "100%",
                backgroundImage: `url(${iconUrl})`,
                backgroundSize: "cover"
            })), raw.div({
                flex: "1 0",
                fontSize: "18px",
            }, raw.css(" > :not(:first-child)", {
                marginTop: "10px"
            }), raw.div({
                fontWeight: 700,
                display: "-webkit-box",
                webkitBoxOrient: "vertical",
                webkitLineClamp: "1",
                overflow: "hidden",
            }, raw.text(author)), !!data.description && raw.div({
                fontWeight: 500,
                display: "-webkit-box",
                webkitBoxOrient: "vertical",
                webkitLineClamp: "2",
                overflow: "hidden",
            }, raw.text(data.description)), this.renderButton("Share" /* Strings.share */, () => { }), isFollowing && (e => this.renderButton("Unfollow" /* Strings.unfollow */, () => {
                Hat.over(this, Squares.PageHat).head.scrollBy({ top: -1 });
                Squares.dispatch("squares:unfollow", { feedKey: data.key });
                Squares.UI.fade(e);
            }))));
            Hat.wear(this);
        }
        /** */
        renderButton(label, clickFn) {
            return Squares.Widget.fillButton({
                marginRight: "15px",
            }, raw.text(label), raw.on("click", () => clickFn()));
        }
    }
    Squares.FeedMetaHat = FeedMetaHat;
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /** */
    function coverFollowersHat() {
        Squares.appendCssReset();
        const hat = new Squares.FollowersHat();
        document.body.append(hat.head);
    }
    Squares.coverFollowersHat = coverFollowersHat;
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /** */
    class FollowersHat {
        head;
        feedElements;
        /** */
        constructor() {
            this.head = raw.div({
                padding: "20px",
            }, raw.on("connected", () => this.construct()), raw.div({ marginBottom: "20px" }, Squares.Style.textTitle2("Following" /* Strings.following */)), raw.on(document.body, "squares:follow", ev => {
                this.handleFollow(ev.detail.feeds);
            }), raw.on(document.body, "squares:unfollow", ev => {
                this.handleUnfollow(ev.detail.feedKey);
            }), this.feedElements = raw.div());
            Hat.wear(this);
        }
        /** */
        handleUnfollow(feedKey) {
            const cls = keyPrefix + feedKey;
            Array.from(this.head.children)
                .filter(e => e instanceof HTMLElement && e.classList.contains(cls))
                .map(e => e.remove());
        }
        /** */
        handleFollow(feeds) {
            for (const feed of feeds)
                this.feedElements.prepend(this.renderIdentity(feed));
        }
        /** */
        async construct() {
            for await (const feed of Squares.Data.readFeedDetails())
                this.feedElements.append(this.renderIdentity(feed));
        }
        /** */
        renderIdentity(feed) {
            const iconUrl = Squares.Util.getIconUrl(feed);
            const author = feed.author || "(Author Unknown)" /* Strings.unknownAuthor */;
            const e = raw.div({
                display: "flex",
                alignContent: "center",
                alignItems: "center",
                marginBottom: "10px",
                padding: "10px",
                fontSize: "15px",
                backgroundColor: "rgba(128, 128, 128, 0.25)",
                borderRadius: Squares.Style.borderRadiusSmall,
            }, keyPrefix + feed.key, raw.div({
                width: "50px",
                padding: "10px",
                marginRight: "20px",
                aspectRatio: "1/1",
                borderRadius: "100%",
                backgroundImage: `url(${iconUrl})`,
                backgroundSize: "cover",
            }), raw.div({
                fontWeight: 500,
                flex: "1 0",
            }, raw.text(author)), Squares.Widget.fillButton(raw.text("Unfollow" /* Strings.unfollow */), raw.on("click", async () => {
                Squares.dispatch("squares:unfollow", { feedKey: feed.key });
                await Squares.UI.collapse(e);
                e.remove();
            })));
            return e;
        }
    }
    Squares.FollowersHat = FollowersHat;
    const keyPrefix = "id:";
})(Squares || (Squares = {}));
var Cover;
(function (Cover) {
    /** */
    function coverTilerHat() {
        Squares.appendCssReset();
        const gridHat = new Squares.GridHat();
        gridHat.handleRender(index => {
            return generateFakeScene("Post " + index);
        });
        gridHat.handleSelect((e, index) => {
            console;
        });
        const container = raw.div({
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            width: "80vw",
            height: "80vh",
            margin: "auto",
            outline: "10px solid white",
        }, gridHat);
        document.body.append(container);
    }
    Cover.coverTilerHat = coverTilerHat;
    /** */
    function generateFakeScene(text) {
        return raw.div({
            backgroundImage: "linear-gradient(45deg, orange, crimson)",
            minHeight: "100vh",
        }, raw.div({
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            margin: "auto",
            width: "fit-content",
            height: "fit-content",
            color: "white",
            fontSize: "20vmin",
            fontWeight: 900,
            textAlign: "center",
        }, raw.text(text)));
    }
})(Cover || (Cover = {}));
var Squares;
(function (Squares) {
    /**
     *
     */
    class GridHat {
        /** */
        head;
        /** */
        cornersElement;
        /** */
        constructor() {
            if (showClass === "") {
                showClass = raw.css({
                    display: "block !",
                });
            }
            maybeAppendDefaultCss();
            this.head = raw.div(Squares.Style.unselectable, {
                minHeight: "100%",
                overflowY: "auto",
            }, Squares.UI.stretch(), raw.css("> ." + "poster" /* Class.poster */, {
                display: "none",
                position: "absolute",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                outline: "2px solid black",
                ...Squares.Style.clickable,
            }), raw.on("scroll", () => this.updatePosterVisibility(true)), raw.on("connected", () => {
                this.setSizeInner(calculateNaturalSize());
                this._width = this.head.offsetWidth;
                this._height = this.head.offsetHeight;
                Squares.Resize.watch(this.head, (w, h) => [this._width, this._height] = [w, h]);
                this.tryAppendPosters(3);
            }), (CAPACITOR || DEMO) && [
                Squares.UI.cornerAbsolute("tl"),
                Squares.UI.cornerAbsolute("tr"),
                this.cornersElement = raw.span("corners-element", {
                    display: "block",
                    position: "absolute",
                    pointerEvents: "none",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 2,
                }, Squares.UI.cornerAbsolute("bl"), Squares.UI.cornerAbsolute("br"))
            ]);
            Hat.wear(this);
        }
        /** */
        handleRender(fn) {
            this.renderFn = fn;
        }
        renderFn = () => null;
        /** */
        handleSelect(fn) {
            this.selectFn = fn;
        }
        selectFn = () => { };
        //# Size
        /**
         * Gets the pixel width of the head element.
         */
        get width() {
            return this._width;
        }
        _width = 0;
        /**
         * Gets the pixel height of the head element.
         */
        get height() {
            return this._height;
        }
        _height = 0;
        /**
         * Gets or sets the number of posters being displayed in one dimension.
         */
        get size() {
            return this._size;
        }
        set size(size) {
            this.setSizeInner(size);
        }
        /** */
        setSizeInner(size) {
            size = Math.max(minSize, Math.min(size, maxSize));
            if (size === this._size)
                return;
            this._size = size;
            const cls = sizeClasses.get(size);
            if (cls) {
                this.head.classList.remove(...sizeClasses.values());
                this.head.classList.add(cls);
            }
            this.updatePosterVisibility();
        }
        _size = -1;
        /**
         * Gets the maximum possible size of the Omniview,
         * given the number of previews that are available.
         * A value of 0 indicates that there is no size limit.
         */
        sizeLimit = 0;
        //# Posters
        /**
         * Returns an array of HTMLElement objects that contain the posters
         * that have at least a single pixel visible on the screen.
         */
        getVisiblePosters() {
            const elements = [];
            for (const element of getByClass(showClass, this.head)) {
                const rect = element.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0)
                    continue;
                if (rect.top > this.height)
                    continue;
                elements.push(element);
            }
            return elements;
        }
        /** */
        get posterCount() {
            return this.head.getElementsByClassName("poster" /* Class.poster */).length;
        }
        /** */
        async tryAppendPosters(screenCount) {
            const pullCount = this.size * this.size * screenCount;
            const rangeStart = this.posterCount;
            const rangeEnd = rangeStart + pullCount;
            const maybePromises = [];
            let canContinue = true;
            for (let i = rangeStart; i < rangeEnd; i++) {
                const result = this.renderFn(i);
                // If null is returned, this means that the stream has terminated.
                if (result === null) {
                    canContinue = false;
                    break;
                }
                maybePromises.push(result);
            }
            const newPosterCount = maybePromises.length;
            if (newPosterCount === 0)
                return;
            if (rangeStart === 0 && newPosterCount < this.size) {
                // The constrained size cannot go below 2. This means that if there
                // is only 1 preview returned, the Omniview is going to look a bit
                // awkward with a preview on the left side of the screen, and an
                // empty space on the right. If this is undesirable, the component
                // that owns the Omniview is responsible for avoiding this situation
                // by it's own means.
                this.sizeLimit = Math.max(2, newPosterCount);
                this.setSizeInner(this.sizeLimit);
            }
            const elements = [];
            for (const maybePromise of maybePromises) {
                if (!maybePromise)
                    throw "?";
                if (maybePromise instanceof Promise) {
                    const shim = raw.div("element-placeholder", getDefaultBackground());
                    elements.push(shim);
                    maybePromise.then(element => {
                        if (element === null)
                            return;
                        for (const n of shim.getAttributeNames())
                            if (n !== "style" && n !== "class")
                                element.setAttribute(n, shim.getAttribute(n) || "");
                        for (const definedProperty of Array.from(shim.style)) {
                            element.style.setProperty(definedProperty, shim.style.getPropertyValue(definedProperty));
                        }
                        raw.get(element)(
                        // Classes that have been set on the shim since it was inserted
                        // must be copied over to the element.
                        Array.from(shim.classList), raw.on("click", () => this.selectFn(element, getIndex(element))));
                        shim.replaceWith(element);
                    });
                }
                else {
                    elements.push(raw.get(maybePromise)(raw.on("click", () => this.selectFn(maybePromise, getIndex(maybePromise)))));
                }
            }
            for (const [i, e] of elements.entries()) {
                setIndex(e, this.posterCount + i);
                e.classList.add("poster" /* Class.poster */);
            }
            this.head.append(...elements);
            this.updatePosterVisibility(canContinue);
        }
        /** */
        updatePosterVisibility(canContinue = false) {
            if (!this.head.isConnected)
                return;
            let isNearingBottom = false;
            if (this.posterCount > 0) {
                const y = this.head.scrollTop;
                const rowHeight = this.height / this.size;
                const rowCount = this.posterCount / this.size;
                const visibleRowStart = Math.floor(y / rowHeight);
                const visibleItemStart = visibleRowStart * this.size;
                const visibleItemEnd = visibleItemStart + this.size * (this.size + 2);
                const elementsWithTop = new Set(getByClass("has-top" /* Class.hasCssTop */, this.head));
                const elementsVisible = new Set(getByClass(showClass, this.head));
                const children = Array.from(this.head.children).filter(e => e instanceof HTMLDivElement);
                for (let i = visibleItemStart; i < visibleItemEnd; i++) {
                    const e = children[i];
                    if (!(e instanceof HTMLDivElement)) {
                        if (i >= children.length)
                            break;
                        continue;
                    }
                    const mul = getIndex(e) > 0 ? 1 : -1;
                    const pct = (100 * this.rowOf(e) * mul || 0).toFixed(5);
                    e.style.top = `calc(${pct}% / var(${"--size" /* Class.sizeVar */}))`;
                    e.classList.add("has-top" /* Class.hasCssTop */, showClass);
                    elementsWithTop.delete(e);
                    elementsVisible.delete(e);
                }
                for (const e of elementsWithTop) {
                    e.style.removeProperty("top");
                    e.classList.remove("has-top" /* Class.hasCssTop */);
                }
                for (const e of elementsVisible)
                    e.classList.remove(showClass);
                if (y !== this.lastY) {
                    this.lastY = y;
                    isNearingBottom = (y + this.height) > (rowCount - 1) * (this.height / this.size);
                }
            }
            if (canContinue && isNearingBottom)
                this.tryAppendPosters(1);
            if (CAPACITOR || DEMO) {
                const query = this.head.getElementsByClassName("has-top" /* Class.hasCssTop */);
                if (query.length > 0) {
                    const last = query.item(query.length - 1);
                    if (last && last !== this.lastVisiblePoster) {
                        this.cornersElement.style.height = (1 + last.offsetTop + last.offsetHeight / this.size) + "px";
                        this.lastVisiblePoster = last;
                    }
                }
            }
        }
        lastVisiblePoster = null;
        lastY = -1;
        /** */
        rowOf(previewElement) {
            const eIdx = getIndex(previewElement);
            const rowIndex = Math.floor(eIdx / this.size);
            return rowIndex;
        }
    }
    Squares.GridHat = GridHat;
    /** */
    let Class;
    (function (Class) {
        Class["poster"] = "poster";
        Class["body"] = "body";
        Class["hasCssTop"] = "has-top";
        Class["sizeVar"] = "--size";
    })(Class || (Class = {}));
    /** */
    let getDefaultBackground = () => {
        const canvas = raw.canvas({ width: 32, height: 32 });
        const ctx = canvas.getContext("2d");
        const grad = ctx.createLinearGradient(0, 0, 32, 32);
        grad.addColorStop(0, "rgb(50, 50, 50)");
        grad.addColorStop(1, "rgb(0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);
        const cls = raw.css({
            backgroundImage: `url(${canvas.toDataURL()})`,
            backgroundSize: "100% 100%",
        });
        getDefaultBackground = () => cls;
    };
    /** */
    let maybeAppendDefaultCss = () => {
        maybeAppendDefaultCss = () => { };
        raw.style("." + "body" /* Class.body */, {
            position: "fixed",
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            zIndex: 1,
            transform: "translateY(0)",
            transitionProperty: "transform",
            transitionDuration: "0.33s",
            scrollSnapType: "y mandatory",
            overflowY: "auto",
        }, `.${"body" /* Class.body */}:before, .${"body" /* Class.body */}:after`, {
            content: `""`,
            display: "block",
            height: "1px",
            scrollSnapStop: "always",
        }, `.${"body" /* Class.body */}:before`, {
            scrollSnapAlign: "start",
        }, `.${"body" /* Class.body */}:after`, {
            scrollSnapAlign: "end",
        }, `.${"body" /* Class.body */} > *`, {
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
            height: "100%",
        }, 
        // Place a screen over the poster element to kill any selection
        // events. This has to be done in another element rather than 
        // just doing a pointer-events: none on the children because the
        // poster element's contents are within a shadow root.
        `.${"poster" /* Class.poster */}:before`, {
            content: `""`,
            position: "absolute",
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            zIndex: 1,
            userSelect: "none",
        }).attach();
        const classes = new Map();
        for (let size = minSize; size <= maxSize; size++) {
            const params = [];
            const scale = 1 / size;
            const sizeClass = "size-" + size;
            classes.set(size, sizeClass);
            params.push("." + sizeClass, {
                ["--size" /* Class.sizeVar */]: size
            });
            for (let n = -1; ++n < size;) {
                params.push(` .${sizeClass} > DIV:nth-of-type(${size}n + ${n + 1})`, {
                    left: (scale * 100 * n) + "%",
                    transform: `scale(${scale.toFixed(4)})`,
                    transformOrigin: "0 0",
                });
            }
            raw.style(...params).attach();
        }
        sizeClasses = classes;
    };
    let sizeClasses;
    /**
     * Calculates a comfortable preview size based on the size and pixel density
     * of the screen. (The technique used is probably quite faulty, but good enough
     * for most scenarios).
     */
    function calculateNaturalSize() {
        return 3;
        const dp1 = window.devicePixelRatio === 1;
        const logicalWidth = window.innerWidth / window.devicePixelRatio;
        if (logicalWidth <= (dp1 ? 900 : 450))
            return 2;
        if (logicalWidth <= (dp1 ? 1400 : 700))
            return 3;
        if (logicalWidth <= 1800)
            return 4;
        return 5;
    }
    const minSize = 2;
    const maxSize = 7;
    //const ratioX = 9;
    //const ratioY = 16;
    /** */
    function getIndex(e) {
        return Number((Array.from(e.classList)
            .find(cls => cls.startsWith(indexPrefix)) || "")
            .slice(indexPrefix.length)) || 0;
    }
    /** */
    function setIndex(e, index) {
        e.classList.add(indexPrefix + index);
    }
    const indexPrefix = "index:";
    //# Utilities
    /** */
    let showClass = "";
    /** */
    function getByClass(cls, element) {
        const col = (element || document).getElementsByClassName(cls);
        return Array.from(col);
    }
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    var Cover;
    (function (Cover) {
        /** */
        function coverStoryHat() {
            Squares.appendCssReset();
            const sections = [
                raw.div({
                    scrollSnapStop: "always",
                    scrollSnapAlign: "start",
                    backgroundColor: "red",
                }),
                raw.div({
                    scrollSnapStop: "always",
                    scrollSnapAlign: "start",
                    backgroundColor: "green",
                }),
                raw.div({
                    scrollSnapStop: "always",
                    scrollSnapAlign: "start",
                    backgroundColor: "blue",
                })
            ];
            const feed = {
                key: Squares.Util.getSafeTicks(),
                author: "Paul Gordon",
                url: "http://localhost:43332/raccoons/index.txt",
                description: "A description of the feed",
                icon: "http://localhost:43332/raccoons/icon.jpg",
                checksum: "?",
            };
            const hat = new Squares.PageHat([], sections, feed);
            document.body.append(hat.head);
        }
        Cover.coverStoryHat = coverStoryHat;
    })(Cover = Squares.Cover || (Squares.Cover = {}));
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /** */
    class PageHat {
        feed;
        head;
        swiper;
        scrollable;
        onDisconnect;
        _onDisconnect;
        onRetract;
        _onRetract;
        /** */
        constructor(head, sections, feed) {
            this.feed = feed;
            if (sections.length < 1)
                throw new Error("Must have at least one section.");
            if (CAPACITOR || DEMO) {
                raw.get(sections[0])({
                    borderTopLeftRadius: Squares.Style.borderRadiusLarge + " !",
                    borderTopRightRadius: Squares.Style.borderRadiusLarge + " !",
                });
            }
            for (const section of sections) {
                raw.get(section)(Squares.Util.getSectionSanitizationCss(), {
                    scrollSnapStop: "always !",
                    scrollSnapAlign: "start",
                });
            }
            this.swiper = new Squares.PaneSwiper();
            const metaHatHeight = 200;
            this.head = raw.div("head", {
                width: "100%",
                height: "100%",
            }, raw.on("connected", () => {
                this.swiper.setVisiblePane(1);
                this.setupRetractionTracker();
                setTimeout(() => {
                    const e = this.scrollable;
                    e.scrollTo(0, e.offsetHeight + metaHatHeight);
                });
            }), this.swiper);
            this.scrollable = raw.div("scrollable-element", {
                scrollSnapType: "y mandatory",
                overflowY: "auto",
                height: "100%",
            }, raw.div("snap-top", snap, { height: "100%" }), raw.get(new Squares.FeedMetaHat(this.feed))({
                height: (metaHatHeight - 10) + "px",
                marginBottom: "10px",
                backgroundColor: "rgba(128, 128, 128, 0.33)",
                borderRadius: Squares.Style.borderRadiusLarge,
            }, Squares.Style.backdropBlur(8), snap), (CAPACITOR || DEMO) && raw.div("corners-container", {
                position: "absolute",
                left: 0,
                right: 0,
                zIndex: 2,
                pointerEvents: "none",
            }, [
                Squares.UI.cornerAbsolute("tl"),
                Squares.UI.cornerAbsolute("tr"),
            ]), raw.div("shadow-container", { display: "contents" }, raw.shadow(...head, raw.body({ display: "contents !" }, ...sections))), raw.div("snap-bottom", snap, { height: "100%" }));
            this.swiper.addPane(raw.div("exit-left-element"));
            this.swiper.addPane(this.scrollable);
            [this.onRetract, this._onRetract] = Force.create();
            [this.onDisconnect, this._onDisconnect] = Force.create();
            this.onDisconnect(() => this.head.remove());
            Hat.wear(this);
        }
        /** */
        setupRetractionTracker() {
            const e = this.scrollable;
            let lastScrollTop = -1;
            let lastScrollLeft = -1;
            let timeoutId = 0;
            const handler = () => {
                let clipTop = 0;
                let clipBottom = 0;
                let clipLeft = 0;
                const w = e.offsetWidth;
                const offsetHeight = e.offsetHeight;
                const scrollHeight = e.scrollHeight;
                const scrollLeft = this.swiper.head.scrollLeft;
                const scrollTop = e.scrollTop;
                clipTop = offsetHeight - scrollTop;
                if (scrollLeft < w)
                    clipLeft = 1 - scrollLeft / w;
                else if (scrollTop > scrollHeight - offsetHeight)
                    clipBottom = scrollTop - (scrollHeight - offsetHeight);
                clipLeft *= 100;
                this.head.style.clipPath = `inset(${clipTop}px 0 ${clipBottom}px ${clipLeft}%)`;
                // Deal with retraction notification
                let retractPct = -1;
                if (scrollLeft < w)
                    retractPct = scrollLeft / w;
                else if (scrollTop < offsetHeight)
                    retractPct = scrollTop / offsetHeight;
                else if (scrollTop >= scrollHeight - offsetHeight * 2)
                    retractPct = (scrollHeight - offsetHeight - scrollTop) / offsetHeight;
                if (retractPct > 0)
                    this._onRetract(retractPct);
                // Remove the element if necessary
                clearTimeout(timeoutId);
                if (retractPct > 0) {
                    lastScrollLeft = scrollLeft;
                    lastScrollTop = scrollTop;
                    timeoutId = setTimeout(() => {
                        if (scrollLeft !== lastScrollLeft)
                            return;
                        if (scrollTop !== lastScrollTop)
                            return;
                        // A more elegant way to deal with this would be to animate
                        // it off the screen... but just removing it is good enough for now
                        // because this is just an edge case that isn't going to happen
                        // very often.
                        if (scrollLeft <= 2 ||
                            scrollTop <= 2 ||
                            scrollTop >= scrollHeight - offsetHeight - 2) {
                            this._onDisconnect();
                        }
                    });
                }
            };
            e.addEventListener("scroll", handler);
            this.swiper.head.addEventListener("scroll", handler);
        }
        /** */
        forceRetract() {
            return new Promise(r => {
                const slideAway = (axis, amount) => {
                    const ms = 100;
                    const e = this.head;
                    e.style.transitionDuration = ms + "ms";
                    e.style.transitionProperty = "transform";
                    e.style.transform = `translate${axis.toLocaleUpperCase()}(${amount}px)`;
                    e.style.pointerEvents = "none";
                    setTimeout(() => {
                        this._onDisconnect();
                        r();
                    }, ms);
                };
                const e = this.scrollable;
                const w = e.offsetWidth;
                const offsetHeight = e.offsetHeight;
                const scrollLeft = this.swiper.head.scrollLeft;
                const scrollTop = e.scrollTop;
                // This check will indicate whether the pageHat has rightward
                // scrolling inertia. If it does, it's scrolling will halt and it will be
                // necessary to animate the pageHat away manually.
                if (scrollLeft > 0 && scrollLeft < w)
                    slideAway("x", scrollLeft);
                else if (scrollTop > 0 && scrollTop < offsetHeight)
                    slideAway("y", scrollTop);
            });
        }
    }
    Squares.PageHat = PageHat;
    const snap = {
        scrollSnapStop: "always",
        scrollSnapAlign: "start",
    };
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /**
     * A class that creates a series of panes that swipe horizontally on mobile.
     */
    class PaneSwiper {
        head;
        /** */
        constructor() {
            this.head = raw.div(Dock.cover(), {
                whiteSpace: "nowrap",
                overflowX: "auto",
                overflowY: "hidden",
                scrollSnapType: "x mandatory",
            }, raw.css(" > DIV", {
                display: "inline-block",
                width: "100%",
                height: "100%",
                whiteSpace: "normal",
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
                overflowX: "hidden",
                overflowY: "auto",
            }), raw.on("scroll", () => this.updateVisiblePane()));
            Hat.wear(this);
            [this.visiblePaneChanged, this._visiblePaneChanged] =
                Force.create();
        }
        /** */
        visiblePaneChanged;
        _visiblePaneChanged;
        /** */
        addPane(element, at = -0) {
            const pane = raw.div("swiper-pane", {
                height: "100%",
                overflowX: "hidden",
                overflowY: "auto",
                whiteSpace: "normal",
            }, element);
            if (at >= this.head.childElementCount || Object.is(at, -0)) {
                this.head.append(pane);
            }
            else if (at < 0) {
                at = Math.max(0, this.head.childElementCount + at);
                const children = Array.from(this.head.children);
                children[at].before(pane);
            }
        }
        /** */
        setVisiblePane(index) {
            const w = this.head.offsetWidth;
            this.head.scrollBy(w * index, 0);
        }
        /** */
        updateVisiblePane() {
            const w = this.head.offsetWidth;
            const s = this.head.scrollLeft;
            const paneIndex = Math.round(s / w);
            if (paneIndex !== this.lastVisiblePane)
                this._visiblePaneChanged(paneIndex);
            this.lastVisiblePane = paneIndex;
        }
        lastVisiblePane = 0;
        /** Gets the number of panes in the PaneSwiper. */
        get length() {
            return this.head.childElementCount;
        }
    }
    Squares.PaneSwiper = PaneSwiper;
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /** */
    class ProfileHat {
        head;
        /** */
        constructor() {
            this.head = raw.div();
            Hat.wear(this);
        }
    }
    Squares.ProfileHat = ProfileHat;
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /** */
    class PullToRefreshHat {
        target;
        head;
        symbol;
        rotationDegress = 0;
        animation = null;
        /** */
        constructor(target) {
            this.target = target;
            const size = (parseInt(Squares.Style.borderRadiusLarge) * 2) + "px";
            this.head = raw.div({
                width: size,
                height: size,
                textAlign: "center",
                borderRadius: "100%",
                zIndex: 1,
                opacity: 0,
                pointerEvents: "none",
            }, Squares.Style.backdropBlur(), raw.on(target, "scroll", () => this.handleTargetScroll()), this.symbol = raw.div(Dock.center(), {
                width: factor * 9 + "px",
                height: factor * 16 + "px",
                borderRadius: "6px",
                backgroundColor: "rgba(128, 128, 128, 0.75)",
                transitionDuration: "0.1s",
            }));
            Hat.wear(this);
            [this.onRefresh, this._onRefresh] = Force.create();
        }
        onRefresh;
        _onRefresh;
        /** */
        handleTargetScroll() {
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
        setAnimationFrame(n) {
            n = Math.max(0, n);
            const opacity = Math.min(1, n / beginRefreshFrame);
            this.rotationDegress = Math.round(n * 1.5);
            this.head.style.opacity = opacity.toString();
            this.symbol.style.transform = `rotateZ(${this.rotationDegress}deg)`;
        }
        /** */
        setLoadingAnimation(enable) {
            if (enable && !this.animation) {
                this.head.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                this.animation = this.symbol.animate([
                    { transform: `rotateZ(${this.rotationDegress}deg)` },
                    { transform: `rotateZ(${this.rotationDegress + 360}deg)` },
                ], {
                    iterations: 10000,
                    duration: 800,
                });
                this._onRefresh();
            }
            else if (!enable && this.animation)
                (async () => {
                    const animation = this.animation;
                    this.animation = null;
                    const s = this.head.style;
                    s.transitionDuration = "0.8s";
                    s.transitionProperty = "transform";
                    s.transform = "scale(1)";
                    await Squares.UI.wait(1);
                    s.transform = "scale(0)";
                    await Squares.UI.waitTransitionEnd(this.head);
                    animation.finish();
                    s.opacity = "0";
                    s.transform = "scale(1)";
                })();
        }
    }
    Squares.PullToRefreshHat = PullToRefreshHat;
    /** The frame at which the RefreshHat becomes fully opaque */
    const beginRefreshFrame = 100;
    const factor = 2;
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /** */
    class RootHat {
        head;
        /** */
        constructor() {
            this.head = raw.div(Squares.UI.noScrollBars, {
                height: "inherit",
                top: "env(safe-area-inset-top)",
                tabIndex: 0,
            }, raw.on(document.body, "squares:follow", () => {
                this.construct();
            }), raw.on(document.body, "squares:unfollow", ev => {
                Squares.Data.archiveFeed(ev.detail.feedKey);
            }));
            Hat.wear(this);
        }
        /** */
        async construct() {
            const scrolls = await Squares.Data.readScrolls();
            let e;
            if (scrolls.length === 0) {
                e = this.renderEmptyState();
            }
            else if (scrolls.length === 1 || scrolls[0].feeds.length > 1) {
                e = this.renderScrollState(scrolls);
            }
            else {
                const feed = scrolls[0].feeds[0];
                e = this.renderSingleFeedState(feed);
            }
            this.head.replaceChildren(e);
        }
        /** */
        renderEmptyState() {
            let div;
            return raw.div("empty-state", Dock.cover(), {
                overflow: "hidden",
                top: "calc(-1.5 * env(safe-area-inset-top))", // centering
            }, div = raw.div(Dock.center(), raw.css(" > *", {
                textAlign: "center",
                margin: "40px auto",
                opacity: 0,
                transform: "translateY(80px)",
                transitionProperty: "opacity, transform",
                transitionDuration: "1s",
            }), raw.div(e => { e.innerHTML = Squares.Images.appLogo; }), raw.div(Squares.Style.textTitle1("Welcome To Squares" /* Strings.openingTitle */)), raw.div({ maxWidth: "17em" }, Squares.Style.textParagraph("Squares is where you avoid the chaos of social media platforms. It doesn\u2019t show you anything unless someone you follow shares it." /* Strings.openingMessage */)), Squares.Widget.attentionButton("Find feeds to follow" /* Strings.openingAction */, () => {
                Squares.Util.openWebLink("https://www.squaresapp.org/feeds/" /* Strings.findFeedsUrl */);
            }, {
                href: "https://www.squaresapp.org/feeds/" /* Strings.findFeedsUrl */,
                target: "_blank"
            })), raw.on("connected", async () => {
                await Squares.UI.wait(10);
                for (const element of Query.children(div)) {
                    const s = element.style;
                    s.opacity = "1";
                    s.transform = "translateY(0)";
                    await Squares.UI.wait(200);
                }
            }));
        }
        /** */
        renderSingleFeedState(feed) {
            return new Squares.ScrollFeedViewerHat(feed, []).head;
        }
        /**
         * Renders the full application state where there is a
         * are multiple feeds multi-plexed within a single scroll.
         */
        renderScrollState(scrolls) {
            const paneSwiper = new Squares.PaneSwiper();
            for (const scroll of scrolls) {
                const viewer = new Squares.ScrollMuxViewerHat(scroll);
                paneSwiper.addPane(viewer.head);
            }
            if (paneSwiper.length === 0) {
                // Display the first-run experience.
            }
            else {
                paneSwiper.addPane(new Squares.FollowersHat().head);
                this.head.append(paneSwiper.head);
                const dotsHat = new Squares.DotsHat();
                dotsHat.insert(2);
                dotsHat.highlight(0);
                raw.get(dotsHat.head)({
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: CAPACITOR ? "105px" :
                        DEMO ? 0 :
                            "15px",
                    margin: "auto",
                });
                this.head.append(dotsHat.head);
                paneSwiper.visiblePaneChanged(index => {
                    dotsHat.highlight(index);
                });
            }
            return paneSwiper.head;
        }
        /**
         * Gets the fully qualified URL where the post resides, which is calculated
         * by concatenating the post path with the containing feed URL.
         */
        getPostUrl(post) {
            const feedFolder = Webfeed.getFolderOf(post.feed.url);
            return feedFolder + post.path;
        }
    }
    Squares.RootHat = RootHat;
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /** */
    class ScrollCreatorHat {
        head;
        /** */
        constructor() {
            this.head = raw.div();
        }
    }
    Squares.ScrollCreatorHat = ScrollCreatorHat;
})(Squares || (Squares = {}));
var Cover;
(function (Cover) {
    /** */
    async function coverScrollFeedViewerHat() {
        await Squares.startup();
        const feed = {
            key: 1696947977011,
            url: "https://webfeed-tulips.pages.dev/index.txt",
            icon: "icon.jpg",
            author: "Mr Raccoons",
            description: "Sample feed of raccoons",
            checksum: "?",
        };
        const feedUrl = "https://webfeed-tulips.pages.dev/index.txt";
        const urls = await Webfeed.downloadIndex(feedUrl);
        if (!urls)
            throw "No feed loaded";
        const hat = new Squares.ScrollFeedViewerHat(feed, urls);
        document.body.append(hat.head);
    }
    Cover.coverScrollFeedViewerHat = coverScrollFeedViewerHat;
})(Cover || (Cover = {}));
var Squares;
(function (Squares) {
    const transitionDuration = "0.5s";
    /** */
    class ScrollViewerHat {
        head;
        gridContainer;
        grid;
        pullToRefreshHat;
        selectedGridItem = null;
        /** */
        constructor() {
            this.grid = new Squares.GridHat();
            const borderRadius = (CAPACITOR || DEMO) ? "30px" : 0;
            this.head = raw.div({
                height: (CAPACITOR || DEMO) ? "177.7777vw" : "100%",
                alignSelf: "center",
                borderRadius,
                overflow: "hidden",
            }, this.gridContainer = raw.div("grid-container", {
                height: "100%",
                borderRadius,
                overflow: "hidden",
                transitionDuration,
                transitionProperty: "transform, opacity",
            }), !(CAPACITOR || DEMO) && raw.div(Dock.bottomRight(10), {
                zIndex: 1,
                color: "white",
                borderRadius: "100%",
                padding: "10px",
                width: "50px",
                height: "50px",
                lineHeight: "33px",
                textAlign: "center",
                fontSize: "25px",
                fontWeight: 700,
            }, Squares.Style.backgroundOverlay(), Squares.Style.clickable, t `↻`, raw.on("click", () => this.handleRefreshInner())), raw.get(this.pullToRefreshHat = new Squares.PullToRefreshHat(this.grid.head))({
                position: "absolute",
                bottom: "20px",
                left: 0,
                right: 0,
                margin: "auto",
            }));
            Hat.wear(this);
            this.constructGrid();
            this.showGrid(true);
            this.pullToRefreshHat.onRefresh(() => this.handleRefreshInner());
            this.gridContainer.append(this.grid.head);
        }
        /** */
        async handleRefreshInner() {
            await this.handleRefresh();
            this.grid.tryAppendPosters(1);
        }
        /** */
        constructGrid() {
            this.grid.head.style.borderRadius = "inherit";
            this.grid.handleRender(index => this.getPost(index));
            this.grid.handleSelect(async (e, index) => {
                if (this.selectedGridItem)
                    return;
                this.selectedGridItem = e;
                this.showPage(index);
            });
        }
        /** */
        async showPage(index) {
            const pageInfo = await this.getPageInfo(index);
            const pageHat = new Squares.PageHat(pageInfo.head, pageInfo.sections, pageInfo.feed);
            raw.get(pageHat)(Dock.cover(), {
                transitionDuration,
                transitionProperty: "transform",
                transform: "translateY(110%)",
            }, raw.on("connected", () => setTimeout(async () => {
                for (const e of Query.ancestors(this.head))
                    if (e instanceof HTMLElement)
                        e.classList.add(noOverflowClass);
                await Squares.UI.wait(1);
                pageHat.head.style.transform = "translateY(0)";
                await Squares.UI.waitTransitionEnd(pageHat.head);
                this.gridContainer.style.transitionDuration = "0s";
            })), raw.on(this.grid.head, "scroll", async () => {
                if (pageHat.head.isConnected) {
                    await pageHat.forceRetract();
                    this.showGrid(true);
                }
            }));
            pageHat.onRetract(pct => window.requestAnimationFrame(() => {
                const s = this.gridContainer.style;
                s.transform = translateZ(pct * translateZMax + "px");
                s.opacity = (1 - pct).toString();
            }));
            const disconnected = async () => {
                if (this.selectedGridItem) {
                    const s = this.selectedGridItem.style;
                    s.transitionDuration = "0.75s";
                    s.transitionProperty = "opacity, filter";
                    //! These transitions break after a few openings and
                    //! closings on mobile Safari. Is this a bug in the engine?
                    applyVisitedStyle(this.selectedGridItem);
                }
                this.selectedGridItem = null;
                this.gridContainer.style.transitionDuration = transitionDuration;
                for (const e of Query.ancestors(this.head))
                    if (e instanceof HTMLElement)
                        e.classList.remove(noOverflowClass);
                const info = this.getPost(index);
                if (info)
                    this.handlePostVisited(index);
            };
            pageHat.onDisconnect(disconnected);
            //! Temp fix
            await Squares.UI.wait(100);
            this.gridContainer.after(pageHat.head);
            await Squares.UI.wait(100);
            this.showGrid(false);
        }
        /** */
        showGrid(show) {
            const s = this.gridContainer.style;
            s.transitionDuration = transitionDuration;
            s.transform = translateZ(show ? "0" : translateZMax + "px");
            s.opacity = show ? "1" : "0";
        }
    }
    Squares.ScrollViewerHat = ScrollViewerHat;
    /**
     * A specialization of the ScrollViewerHat that supports scenarios where
     * multiple feeds are multiplexed into a single view.
     */
    class ScrollMuxViewerHat extends ScrollViewerHat {
        scroll;
        /** */
        constructor(scroll) {
            super();
            this.scroll = scroll;
            this.foregroundFetcher = new Squares.ForegroundFetcher();
        }
        foregroundFetcher;
        /** */
        async handleRefresh() {
            await this.foregroundFetcher.fetch();
        }
        /** */
        getPost(index) {
            if (index >= Squares.Data.readScrollPostCount(this.scroll.key))
                return null;
            return (async () => {
                block: {
                    const post = await Squares.Data.readScrollPost(this.scroll.key, index);
                    if (post === null)
                        break block;
                    const url = Hat.over(this, Squares.RootHat).getPostUrl(post);
                    if (!url)
                        break block;
                    const poster = await Webfeed.downloadPoster(url);
                    if (!poster)
                        break block;
                    return post.visited ?
                        applyVisitedStyle(poster) :
                        poster;
                }
                return Webfeed.getErrorPoster();
            })();
        }
        /** */
        async getPageInfo(index) {
            const post = await Squares.Data.readScrollPost(this.scroll.key, index);
            if (!post)
                throw new Error();
            const root = Hat.over(this, Squares.RootHat);
            const postUrl = root.getPostUrl(post) || "";
            const page = await Webfeed.downloadSections(postUrl) || [];
            console.error("Awkward code here... stuff probably doesn't work.");
            const head = []; //page?.head || [];
            const sections = page ?
                page.slice() :
                [await Webfeed.getErrorPoster()];
            const feed = await Squares.Data.readFeedDetail(post.feed.key);
            if (!feed)
                throw new Error();
            return { head, sections, feed };
        }
        /** */
        async handlePostVisited(index) {
            const post = await Squares.Data.readScrollPost(this.scroll.key, index);
            if (post) {
                post.visited = true;
                Squares.Data.writePost(post);
            }
        }
    }
    Squares.ScrollMuxViewerHat = ScrollMuxViewerHat;
    /**
     * A specialization of the ScrollViewerHat that supports scenarios where
     * a single feed is displayed within a single view.
     */
    class ScrollFeedViewerHat extends ScrollViewerHat {
        feed;
        urls;
        /** */
        constructor(feed, urls) {
            super();
            this.feed = feed;
            this.urls = urls;
            (async () => {
                Squares.Data.readFeedPosts(feed.key);
            })();
        }
        /** */
        async handleRefresh() {
        }
        /** */
        getPost(index) {
            if (index < 0 || index >= this.urls.length)
                return null;
            const url = this.urls[index];
            return (async () => {
                const maybePoster = await Webfeed.downloadPoster(url);
                return maybePoster || Webfeed.getErrorPoster();
            })();
        }
        /** */
        async getPageInfo(index) {
            return {
                head: [],
                sections: [],
                feed: this.feed,
            };
        }
        /** */
        handlePostVisited(index) { }
    }
    Squares.ScrollFeedViewerHat = ScrollFeedViewerHat;
    /** */
    function applyVisitedStyle(e) {
        const s = e.style;
        s.filter = "saturate(0) brightness(0.4)";
        return e;
    }
    const translateZ = (amount) => `perspective(10px) translateZ(${amount})`;
    const translateZMax = -3;
    let noOverflowClass = "";
    //const noOverflowClass2 = raw.css({
    //	overflow: "hidden !"
    //});
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /** */
    let Color;
    (function (Color) {
        Color.defaultHue = 215;
        /** */
        function from(values) {
            const h = (Array.isArray(values) ? values.at(0) : values.h) ?? Color.defaultHue;
            const s = (Array.isArray(values) ? values.at(1) : values.s) ?? 50;
            const l = (Array.isArray(values) ? values.at(2) : values.l) ?? 50;
            const a = Array.isArray(values) ? 1 : values.a ?? 1;
            return a === 1 ?
                `hsl(${h}, ${s}%, ${l}%)` :
                `hsla(${h}, ${s}%, ${l}%, ${a})`;
        }
        Color.from = from;
        /** */
        function white(alpha = 1) {
            return alpha === 1 ? "white" : `rgba(255, 255, 255, ${alpha})`;
        }
        Color.white = white;
        /** */
        function black(alpha = 1) {
            return alpha === 1 ? "black" : `rgba(0, 0, 0, ${alpha})`;
        }
        Color.black = black;
        /** */
        function gray(value = 128, alpha = 1) {
            return alpha === 1 ?
                `rgb(${value}, ${value}, ${value})` :
                `rgba(${value}, ${value}, ${value}, ${alpha})`;
        }
        Color.gray = gray;
    })(Color = Squares.Color || (Squares.Color = {}));
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /**
     * Namespace of functions for container query units.
     */
    let Cq;
    (function (Cq) {
        /**
         *
         */
        function width(amount, targetContainerClass) {
            return getProperty("width", "w", amount, targetContainerClass);
        }
        Cq.width = width;
        /**
         *
         */
        function height(amount, targetContainerClass) {
            return getProperty("height", "h", amount, targetContainerClass);
        }
        Cq.height = height;
        /**
         *
         */
        function left(amount, targetContainerClass) {
            return getProperty("left", "w", amount, targetContainerClass);
        }
        Cq.left = left;
        /** */
        function getProperty(property, axis, amount, cls) {
            if (supportsContainerUnits === null)
                supportsContainerUnits = raw.div({ width: "1cqw" }).style.width !== "";
            let container = null;
            return e => raw.on("connected", () => {
                container ||= Query.ancestors(e).find((c) => c instanceof HTMLElement &&
                    c.classList.contains(cls)) || null;
                if (!container)
                    throw "Container not found.";
                if (supportsContainerUnits) {
                    container.style.containerType = "size";
                    e.style.setProperty(property, amount + "cq" + axis);
                }
                else
                    Squares.Resize.watch(container, (w, h) => {
                        const wOrH = axis === "w" ? w : h;
                        const stringified = ((amount / 100) * wOrH).toFixed(3) + "px";
                        e.style.setProperty(property, stringified);
                    }, true);
            });
        }
        let supportsContainerUnits = null;
    })(Cq = Squares.Cq || (Squares.Cq = {}));
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /** */
    let Origin;
    (function (Origin) {
        Origin["topLeft"] = "origin-tl";
        Origin["top"] = "origin-t";
        Origin["topRight"] = "origin-tr";
        Origin["left"] = "origin-l";
        Origin["center"] = "origin-c";
        Origin["right"] = "origin-r";
        Origin["bottomLeft"] = "origin-bl";
        Origin["bottom"] = "origin-b";
        Origin["bottomRight"] = "origin-br";
    })(Origin = Squares.Origin || (Squares.Origin = {}));
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /**
     * A namespace of color values that define the color palette
     * used across the application.
     */
    let Pal;
    (function (Pal) {
        Pal.gray1 = Squares.Color.gray(180);
        Pal.gray2 = Squares.Color.gray(100);
        Pal.gray3 = Squares.Color.gray(60);
    })(Pal = Squares.Pal || (Squares.Pal = {}));
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /** */
    function appendCssReset() {
        document.head.append(raw.style("*", {
            position: "relative",
            padding: 0,
            margin: 0,
            zIndex: 0,
            boxSizing: "border-box",
            webkitFontSmoothing: "antialiased",
            color: "inherit",
            fontSize: "inherit",
        }, ":root", {
            height: "100vh",
            fontSize: "20px",
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, roboto, noto, arial, sans-serif",
            color: "white",
            backgroundColor: "black",
        }, "BODY", {
            height: "inherit",
        }, 
        // Eliminate margin collapsing
        "ADDRESS, ARTICLE, ASIDE, BLOCKQUOTE, DD, DIV, FORM, " +
            "H1, H2, H3, H4, H4, H6, HEADER, HGROUP, OL, UL, P, PRE, SECTION", {
            padding: "0.016px 0"
        }, 
        // No scrollbars anywhere... for now
        "*::-webkit-scrollbar", {
            display: "none"
        }));
    }
    Squares.appendCssReset = appendCssReset;
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    let Resize;
    (function (Resize) {
        /**
         * Observes the resizing of the particular element, and invokes
         * the specified callback when the element is resized.
         */
        function watch(e, callback, runInitially = false) {
            if (typeof ResizeObserver !== "undefined") {
                new ResizeObserver(rec => {
                    if (rec.length === 0)
                        return;
                    const entry = rec[0];
                    if (entry.borderBoxSize?.length > 0) {
                        const size = entry.borderBoxSize[0];
                        callback(size.inlineSize, size.blockSize);
                    }
                    else {
                        const width = e.offsetWidth;
                        const height = e.offsetHeight;
                        callback(width, height);
                    }
                }).observe(e, { box: "border-box" });
            }
            else
                raw.get(e)(raw.on(window, "resize", () => {
                    window.requestAnimationFrame(() => {
                        const width = e.offsetWidth;
                        const height = e.offsetHeight;
                        callback(width, height);
                    });
                }));
            if (runInitially) {
                const exec = () => callback(e.offsetWidth, e.offsetHeight);
                if (e.isConnected)
                    exec();
                else
                    raw.get(e)(raw.on("connected", exec));
            }
        }
        Resize.watch = watch;
    })(Resize = Squares.Resize || (Squares.Resize = {}));
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /**
     * A namespace of functions that produce generic CSS
     * styling values that aren't particular to any theme.
     */
    let Style;
    (function (Style) {
        /** */
        function textTitle1(text) {
            return [
                {
                    fontSize: "30px",
                    fontWeight: 700,
                },
                raw.text(text)
            ];
        }
        Style.textTitle1 = textTitle1;
        /** */
        function textTitle2(text) {
            return [
                {
                    fontSize: "22px",
                    fontWeight: 600,
                },
                raw.text(text)
            ];
        }
        Style.textTitle2 = textTitle2;
        /** */
        function textParagraph(text) {
            return [
                {
                    fontSize: "22px",
                    fontWeight: 500,
                    color: "rgb(210, 210, 210)",
                    lineHeight: 1.3
                },
                raw.text(text)
            ];
        }
        Style.textParagraph = textParagraph;
        /** */
        function backgroundOverlay() {
            return [
                {
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                },
                Style.backdropBlur(5),
            ];
        }
        Style.backgroundOverlay = backgroundOverlay;
        /** */
        function backdropBlur(pixels = 5) {
            const value = pixels > 0 ? `blur(${pixels}px)` : "none";
            return {
                backdropFilter: value,
                webkitBackdropFilter: value,
            };
        }
        Style.backdropBlur = backdropBlur;
        /** */
        Style.unselectable = {
            userSelect: "none",
            webkitUserSelect: "none",
        };
        /** */
        Style.presentational = {
            ...Style.unselectable,
            pointerEvents: "none",
            cursor: "default",
        };
        /** */
        Style.keyable = {
            tabIndex: 0,
            outline: 0,
        };
        /** */
        Style.clickable = {
            ...Style.unselectable,
            cursor: "pointer"
        };
        /**
         * Returns styles that produce a font weight whose value
         * may or may not be perfectly divisible by 100.
         */
        function weight(weight) {
            return {
                fontWeight: weight.toString(),
                ...(weight % 100 === 0 ? {} : { fontVariationSettings: "'wght' " + weight })
            };
        }
        Style.weight = weight;
        /**
         * Displays text at a given font size and weight that
         * defaults to being unselectable.
         */
        function text(label = "", size = 20, weight) {
            return [
                Style.unselectable,
                {
                    fontSize: typeof size === "number" ? size + "px" : size,
                },
                weight ? Style.weight(weight) : null,
                label ? new Text(label) : null,
                e => {
                    // Only apply this weakly. The goal here is to get away from the I-beam,
                    // but other uses of this function could specify a pointer or something else,
                    // so this function shouldn't overwrite that.
                    if (e.style.cursor === "")
                        e.style.cursor = "default";
                }
            ];
        }
        Style.text = text;
        Style.borderRadiusLarge = "30px";
        Style.borderRadiusSmall = "10px";
    })(Style = Squares.Style || (Squares.Style = {}));
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /**
     *
     */
    let UI;
    (function (UI) {
        /** */
        function cornerAbsolute(kind) {
            if (kind === "tl")
                return raw.get(UI.corner("tl"))(cornerStyles, { top: 0, left: 0 });
            if (kind === "tr")
                return raw.get(UI.corner("tr"))(cornerStyles, { top: 0, right: 0 });
            else if (kind === "bl")
                return raw.get(UI.corner("bl"))(cornerStyles, { bottom: 0, left: 0 });
            else if (kind === "br")
                return raw.get(UI.corner("br"))(cornerStyles, { bottom: 0, right: 0 });
        }
        UI.cornerAbsolute = cornerAbsolute;
        const size = parseInt(Squares.Style.borderRadiusLarge);
        const cornerStyles = {
            position: "absolute",
            zIndex: 1,
            width: size + "px",
            height: size + "px",
            pointerEvents: "none",
        };
        /**
         * Renders a single inverted rounded corner piece.
         */
        function corner(kind) {
            let top = 0;
            let right = 0;
            let bottom = 0;
            let left = 0;
            if (kind === "tl")
                bottom = right = -100;
            else if (kind === "tr")
                bottom = left = -100;
            else if (kind === "bl")
                top = right = -100;
            else if (kind === "br")
                top = left = -100;
            return raw.span("corner", {
                overflow: "hidden",
                width: "100px",
                height: "100px",
                clipPath: "inset(0 0)"
            }, raw.span({
                position: "absolute",
                top: top + "%",
                right: right + "%",
                bottom: bottom + "%",
                left: left + "%",
                borderRadius: "100%",
                boxShadow: "0 0 0 1000px black",
            }));
        }
        UI.corner = corner;
        /** */
        function stretch() {
            return [
                { width: "-moz-available" },
                { width: "-webkit-fill-available" },
                { width: "fill-available" },
                { width: "stretch" }
            ];
        }
        UI.stretch = stretch;
        /** */
        function escape(fn) {
            return [
                { tabIndex: 0 },
                raw.on("keydown", ev => {
                    if (ev.key === "Escape")
                        fn();
                })
            ];
        }
        UI.escape = escape;
        /** */
        function click(handlerFn) {
            return [
                e => (e.role = "button"),
                Squares.Style.clickable,
                raw.on("click", handlerFn)
            ];
        }
        UI.click = click;
        /** */
        function wait(ms = 0) {
            return new Promise(r => setTimeout(r, ms));
        }
        UI.wait = wait;
        /** */
        async function waitConnected(e) {
            if (!e.isConnected)
                await new Promise(r => raw.get(e)(raw.on("connected", r)));
            // Wait an additional 1ms so that the element becomes transition-ready
            await new Promise(r => setTimeout(r, 1));
        }
        UI.waitConnected = waitConnected;
        /** */
        async function waitTransitionEnd(e) {
            await new Promise(r => e.addEventListener("transitionend", ev => {
                if (ev.target === e)
                    r();
            }));
        }
        UI.waitTransitionEnd = waitTransitionEnd;
        /** */
        function noScrollBars() {
            return raw.style("*::-webkit-scrollbar", {
                display: "none"
            });
        }
        UI.noScrollBars = noScrollBars;
        /** */
        function hide() {
            const cls = "hide";
            if (!hideHasRun) {
                raw.style("." + cls, { display: "none !" }).attach();
                hideHasRun = true;
            }
            return cls;
        }
        UI.hide = hide;
        let hideHasRun = false;
        /** */
        function visibleWhenAlone() {
            return raw.css(":not(:only-child) !", { display: "none" });
        }
        UI.visibleWhenAlone = visibleWhenAlone;
        /** */
        function visibleWhenNotAlone() {
            return raw.css(":only-child !", { display: "none" });
        }
        UI.visibleWhenNotAlone = visibleWhenNotAlone;
        /** */
        function visibleWhenEmpty(watchTarget) {
            return [
                watchTarget.children.length === 0 ? "" : UI.hide(),
                raw.on("connected", ev => addVisibilityObserver(ev.target, watchTarget, true)),
            ];
        }
        UI.visibleWhenEmpty = visibleWhenEmpty;
        /** */
        function visibleWhenNotEmpty(watchTarget) {
            return [
                watchTarget.children.length === 0 ? UI.hide() : "",
                raw.on("connected", ev => addVisibilityObserver(ev.target, watchTarget, false)),
            ];
        }
        UI.visibleWhenNotEmpty = visibleWhenNotEmpty;
        /** */
        function addVisibilityObserver(visibilityTarget, watchTarget, forEmpty) {
            if (!(visibilityTarget instanceof HTMLElement))
                return;
            const exec = () => {
                const children = Query.children(watchTarget);
                if (forEmpty && children.length > 0)
                    visibilityTarget.classList.add(UI.hide());
                else if (!forEmpty && children.length === 0)
                    visibilityTarget.classList.add(UI.hide());
                else
                    visibilityTarget.classList.remove(UI.hide());
            };
            exec();
            UI.onChildrenChanged(watchTarget, exec);
        }
        /** */
        function onChildrenChanged(e, fn) {
            new MutationObserver(() => fn()).observe(e, { childList: true });
        }
        UI.onChildrenChanged = onChildrenChanged;
        /** */
        async function collapse(e) {
            const height = e.offsetHeight;
            e.style.marginBottom = "0px";
            e.style.clipPath = "inset(0 0 0 0)";
            e.style.transitionProperty = "opacity, margin-bottom, clip-path";
            e.style.transitionDuration = "0.5s";
            await UI.wait();
            e.style.opacity = "0";
            e.style.marginBottom = "-" + height + "px";
            e.style.clipPath = "inset(0 0 100% 0)";
            await UI.waitTransitionEnd(e);
        }
        UI.collapse = collapse;
        /** */
        async function fade(e) {
            e.style.transitionProperty = "opacity";
            e.style.transitionDuration = "0.5s";
            e.style.pointerEvents = "none";
            if (!e.style.opacity)
                e.style.opacity = "1";
            await UI.wait();
            e.style.opacity = "0";
            await UI.waitTransitionEnd(e);
            e.style.visibility = "hidden";
        }
        UI.fade = fade;
    })(UI = Squares.UI || (Squares.UI = {}));
})(Squares || (Squares = {}));
var Squares;
(function (Squares) {
    /** */
    let Widget;
    (function (Widget) {
        /** */
        function fillButton(...params) {
            return raw.div("fill-button", {
                display: "inline-block",
                padding: "10px",
                borderRadius: "5px",
                backgroundColor: "rgba(128, 128, 128, 0.5)",
                fontWeight: 500,
            }, Squares.Style.clickable, Squares.Style.backdropBlur(5), ...params);
        }
        Widget.fillButton = fillButton;
        /** */
        function hollowButton(options) {
            return raw.div("hollow-button", {
                padding: "15px",
                border: "2px solid " + Squares.Pal.gray1,
                borderRadius: "15px",
                color: Squares.Pal.gray1,
                textAlign: "center",
                cursor: "pointer",
                whiteSpace: "nowrap",
            }, options.click && raw.on("click", options.click), Squares.Style.text(options.text, 23, 500));
        }
        Widget.hollowButton = hollowButton;
        /** */
        function attentionButton(text, click, ...params) {
            return raw.a("attention-button", {
                display: "block",
                width: "fit-content",
                padding: "1em 3em",
                borderRadius: "10px",
                outline: 0,
                color: "white",
                textDecoration: "none",
                backgroundColor: "hsl(205, 100%, 50%)",
            }, Squares.Style.text(text, 23, 900), params);
        }
        Widget.attentionButton = attentionButton;
        /** */
        function underlineTextbox(...params) {
            return raw.input({
                outline: 0,
                border: 0,
                padding: "10px 0",
                borderBottom: "2px solid " + Squares.Pal.gray2,
                backgroundColor: "transparent",
                color: "white",
                display: "block",
                fontSize: "inherit",
                spellcheck: false,
            }, Squares.UI.stretch(), params);
        }
        Widget.underlineTextbox = underlineTextbox;
    })(Widget = Squares.Widget || (Squares.Widget = {}));
})(Squares || (Squares = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vY29yZS8hLmNvdmVyLnRzIiwiLi4vY29yZS8hLnRzIiwiLi4vY29yZS9FdmVudHMudHMiLCIuLi9jb3JlL0ZlZWRzRGVmYXVsdC50cyIsIi4uL2NvcmUvSW1hZ2VzLnRzIiwiLi4vY29yZS9TdHJpbmdzLnRzIiwiLi4vY29yZS9iYWNrZW5kL0JhY2tncm91bmRGZXRjaGVyLnRzIiwiLi4vY29yZS9iYWNrZW5kL0RhdGEudHMiLCIuLi9jb3JlL2JhY2tlbmQvRGF0YUluaXRpYWxpemVyLnRzIiwiLi4vY29yZS9iYWNrZW5kL0ZldGNoZXIudHMiLCIuLi9jb3JlL2JhY2tlbmQvRm9sbG93VXRpbC50cyIsIi4uL2NvcmUvYmFja2VuZC9Gb3JlZ3JvdW5kRmV0Y2hlci50cyIsIi4uL2NvcmUvYmFja2VuZC9JRmVlZERldGFpbHMudHMiLCIuLi9jb3JlL2JhY2tlbmQvSVBvc3QudHMiLCIuLi9jb3JlL2JhY2tlbmQvSVNjcm9sbC50cyIsIi4uL2NvcmUvYmFja2VuZC9VdGlsLnRzIiwiLi4vY29yZS9oYXRzL0RvdHNIYXQudHMiLCIuLi9jb3JlL2hhdHMvRmVlZE1ldGFIYXQudHMiLCIuLi9jb3JlL2hhdHMvRm9sbG93ZXJzSGF0LmNvdmVyLnRzIiwiLi4vY29yZS9oYXRzL0ZvbGxvd2Vyc0hhdC50cyIsIi4uL2NvcmUvaGF0cy9HcmlkSGF0LmNvdmVyLnRzIiwiLi4vY29yZS9oYXRzL0dyaWRIYXQudHMiLCIuLi9jb3JlL2hhdHMvUGFnZUhhdC5jb3Zlci50cyIsIi4uL2NvcmUvaGF0cy9QYWdlSGF0LnRzIiwiLi4vY29yZS9oYXRzL1BhbmVTd2lwZXIudHMiLCIuLi9jb3JlL2hhdHMvUHJvZmlsZUhhdC50cyIsIi4uL2NvcmUvaGF0cy9QdWxsVG9SZWZyZXNoSGF0LnRzIiwiLi4vY29yZS9oYXRzL1Jvb3RIYXQudHMiLCIuLi9jb3JlL2hhdHMvU2Nyb2xsQ3JlYXRvckhhdC50cyIsIi4uL2NvcmUvaGF0cy9TY3JvbGxWaWV3ZXJIYXQuY292ZXIudHMiLCIuLi9jb3JlL2hhdHMvU2Nyb2xsVmlld2VySGF0LnRzIiwiLi4vY29yZS9zdHlsZS9Db2xvci50cyIsIi4uL2NvcmUvc3R5bGUvQ3EudHMiLCIuLi9jb3JlL3N0eWxlL09yaWdpbi50cyIsIi4uL2NvcmUvc3R5bGUvUGFsLnRzIiwiLi4vY29yZS9zdHlsZS9SZXNldC50cyIsIi4uL2NvcmUvc3R5bGUvUmVzaXplLnRzIiwiLi4vY29yZS9zdHlsZS9TdHlsZXMudHMiLCIuLi9jb3JlL3N0eWxlL1VJTWFjcm9zLnRzIiwiLi4vY29yZS9zdHlsZS9XaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLElBQVUsS0FBSyxDQW9DZDtBQXBDRCxXQUFVLEtBQUs7SUFFZCxNQUFNO0lBQ0MsS0FBSyxVQUFVLGNBQWM7UUFFbkMsTUFBTSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUhxQixvQkFBYyxpQkFHbkMsQ0FBQTtJQUVELE1BQU07SUFDQyxLQUFLLFVBQVUsc0JBQXNCO1FBRTNDLE1BQU0sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBSHFCLDRCQUFzQix5QkFHM0MsQ0FBQTtJQUVELE1BQU07SUFDQyxLQUFLLFVBQVUsT0FBTztRQUU1QixNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFKcUIsYUFBTyxVQUk1QixDQUFBO0lBRUQsTUFBTTtJQUNDLEtBQUssVUFBVSxlQUFlO1FBRXBDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDNUMsTUFBTSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFK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ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0dXBBc0RlYnVnKClcblx0e1xuXHRcdGF3YWl0IFNxdWFyZXMuc3RhcnR1cCgpO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0dXBBc0RlYnVnV2l0aERhdGEoKVxuXHR7XG5cdFx0YXdhaXQgU3F1YXJlcy5zdGFydHVwKHRydWUpO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0dXAoKVxuXHR7XG5cdFx0T2JqZWN0LmFzc2lnbihnbG9iYWxUaGlzLCB7IERFQlVHOiBmYWxzZSB9KTtcblx0XHRhd2FpdCBTcXVhcmVzLnN0YXJ0dXAoKTtcblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydHVwV2l0aERhdGEoKVxuXHR7XG5cdFx0T2JqZWN0LmFzc2lnbihnbG9iYWxUaGlzLCB7IERFQlVHOiBmYWxzZSB9KTtcblx0XHRhd2FpdCBTcXVhcmVzLnN0YXJ0dXAodHJ1ZSk7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gY292ZXJGb2xsb3coKVxuXHR7XG5cdFx0YXdhaXQgU3F1YXJlcy5zdGFydHVwKCk7XG5cdFx0Y29uc3QgbGluayA9IFwiaHR0cHM6Ly93ZWJmZWVkLXR1bGlwcy5wYWdlcy5kZXYvaW5kZXgudHh0XCI7XG5cdFx0YXdhaXQgU3F1YXJlcy5Gb2xsb3dVdGlsLmZvbGxvd1dlYmZlZWRzKGxpbmspO1xuXHRcdFxuXHR9XG59XG5cbnR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgT2JqZWN0LmFzc2lnbihtb2R1bGUuZXhwb3J0cywgeyBDb3ZlciB9KTtcbiIsIlxuZGVjbGFyZSBjb25zdCBERUJVRzogYm9vbGVhbjtcbmRlY2xhcmUgY29uc3QgRUxFQ1RST046IGJvb2xlYW47XG5kZWNsYXJlIGNvbnN0IFRBVVJJOiBib29sZWFuO1xuZGVjbGFyZSBjb25zdCBNQUM6IGJvb2xlYW47XG5kZWNsYXJlIGNvbnN0IFdJTkRPV1M6IGJvb2xlYW47XG5kZWNsYXJlIGNvbnN0IExJTlVYOiBib29sZWFuO1xuZGVjbGFyZSBjb25zdCBDQVBBQ0lUT1I6IGJvb2xlYW47XG5kZWNsYXJlIGNvbnN0IElPUzogYm9vbGVhbjtcbmRlY2xhcmUgY29uc3QgQU5EUk9JRDogYm9vbGVhbjtcbmRlY2xhcmUgY29uc3QgREVNTzogYm9vbGVhbjtcbmRlY2xhcmUgY29uc3QgTW9kdWxlc3M6IHsgZ2V0UnVubmluZ0Z1bmN0aW9uTmFtZSgpOiBzdHJpbmc7IH1cblxuZGVjbGFyZSBuYW1lc3BhY2UgRWxlY3Ryb25cbntcblx0ZXhwb3J0IGNvbnN0IGZzOiB0eXBlb2YgaW1wb3J0KFwiZnNcIik7XG5cdGV4cG9ydCBjb25zdCBwYXRoOiB0eXBlb2YgaW1wb3J0KFwicGF0aFwiKTtcbn1cblxuZGVjbGFyZSBuYW1lc3BhY2UgVGF1cmlcbntcblx0ZXhwb3J0IGNvbnN0IGZzOiB0eXBlb2YgaW1wb3J0KFwiQHRhdXJpLWFwcHMvYXBpXCIpLmZzO1xuXHRleHBvcnQgY29uc3QgY2xpOiB0eXBlb2YgaW1wb3J0KFwiQHRhdXJpLWFwcHMvYXBpXCIpLmNsaTtcblx0ZXhwb3J0IGNvbnN0IGNsaXBib2FyZDogdHlwZW9mIGltcG9ydChcIkB0YXVyaS1hcHBzL2FwaVwiKS5jbGlwYm9hcmQ7XG5cdGV4cG9ydCBjb25zdCBkaWFsb2c6IHR5cGVvZiBpbXBvcnQoXCJAdGF1cmktYXBwcy9hcGlcIikuZGlhbG9nO1xuXHRleHBvcnQgY29uc3QgZXZlbnQ6IHR5cGVvZiBpbXBvcnQoXCJAdGF1cmktYXBwcy9hcGlcIikuZXZlbnQ7XG5cdGV4cG9ydCBjb25zdCBnbG9iYWxTaG9ydGN1dDogdHlwZW9mIGltcG9ydChcIkB0YXVyaS1hcHBzL2FwaVwiKS5nbG9iYWxTaG9ydGN1dDtcblx0ZXhwb3J0IGNvbnN0IGh0dHA6IHR5cGVvZiBpbXBvcnQoXCJAdGF1cmktYXBwcy9hcGlcIikuaHR0cDtcblx0ZXhwb3J0IGNvbnN0IGludm9rZTogdHlwZW9mIGltcG9ydChcIkB0YXVyaS1hcHBzL2FwaVwiKS5pbnZva2U7XG5cdGV4cG9ydCBjb25zdCBub3RpZmljYXRpb246IHR5cGVvZiBpbXBvcnQoXCJAdGF1cmktYXBwcy9hcGlcIikubm90aWZpY2F0aW9uO1xuXHRleHBvcnQgY29uc3Qgb3M6IHR5cGVvZiBpbXBvcnQoXCJAdGF1cmktYXBwcy9hcGlcIikub3M7XG5cdGV4cG9ydCBjb25zdCBwYXRoOiB0eXBlb2YgaW1wb3J0KFwiQHRhdXJpLWFwcHMvYXBpXCIpLnBhdGg7XG5cdGV4cG9ydCBjb25zdCBwcm9jZXNzOiB0eXBlb2YgaW1wb3J0KFwiQHRhdXJpLWFwcHMvYXBpXCIpLnByb2Nlc3M7XG5cdGV4cG9ydCBjb25zdCBzaGVsbDogdHlwZW9mIGltcG9ydChcIkB0YXVyaS1hcHBzL2FwaVwiKS5zaGVsbDtcblx0ZXhwb3J0IGNvbnN0IHRhdXJpOiB0eXBlb2YgaW1wb3J0KFwiQHRhdXJpLWFwcHMvYXBpXCIpLnRhdXJpO1xuXHRleHBvcnQgY29uc3QgdXBkYXRlcjogdHlwZW9mIGltcG9ydChcIkB0YXVyaS1hcHBzL2FwaVwiKS51cGRhdGVyO1xuXHRleHBvcnQgY29uc3Qgd2luZG93OiB0eXBlb2YgaW1wb3J0KFwiQHRhdXJpLWFwcHMvYXBpXCIpLndpbmRvdztcbn1cblxuZGVjbGFyZSBjb25zdCBDYXBhY2l0b3I6IHR5cGVvZiBpbXBvcnQoXCJAY2FwYWNpdG9yL2NvcmVcIikuQ2FwYWNpdG9yICZcbntcblx0cGxhdGZvcm06IHN0cmluZztcbn1cblxuZGVjbGFyZSBjb25zdCBUb2FzdDogdHlwZW9mIGltcG9ydChcIkBjYXBhY2l0b3IvdG9hc3RcIikuVG9hc3Q7XG5kZWNsYXJlIGNvbnN0IENhcENsaXBib2FyZDogdHlwZW9mIGltcG9ydChcIkBjYXBhY2l0b3IvY2xpcGJvYXJkXCIpLkNsaXBib2FyZDtcbmRlY2xhcmUgY29uc3QgQmFja2dyb3VuZEZldGNoOiB0eXBlb2YgaW1wb3J0KFwiQHRyYW5zaXN0b3Jzb2Z0L2NhcGFjaXRvci1iYWNrZ3JvdW5kLWZldGNoXCIpLkJhY2tncm91bmRGZXRjaDtcbmRlY2xhcmUgY29uc3QgQXBwTGF1bmNoZXI6IHR5cGVvZiBpbXBvcnQoXCJAY2FwYWNpdG9yL2FwcC1sYXVuY2hlclwiKS5BcHBMYXVuY2hlcjtcbmRlY2xhcmUgY29uc3QgQ2FwYWNpdG9yQXBwOiB0eXBlb2YgaW1wb3J0KFwiQGNhcGFjaXRvci9hcHBcIikuQXBwO1xuXG4vLyBUaGUgZ2xvYmFsVGhpcyB2YWx1ZSBpc24ndCBhdmFpbGFibGUgaW4gU2FmYXJpLCBzbyBhIHBvbHlmaWxsIGlzIG5lY2Vzc2FyeTpcbmlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gXCJ1bmRlZmluZWRcIilcblx0KHdpbmRvdyBhcyBhbnkpLmdsb2JhbFRoaXMgPSB3aW5kb3c7XG5cbi8vIElmIHRoZSBERUJVRyBmbGFnIGlzIHVuZGVmaW5lZCwgdGhhdCBtZWFucyB0aGF0IHRoZSBleGVjdXRpbmcgY29kZVxuLy8gaGFzIG5vdCBwYXNzZWQgdGhyb3VnaCB0ZXJzZXIsIGFuZCBzbyB3ZSBhcmUgZWl0aGVyIHJ1bm5pbmcgaW4gYVxuLy8gY292ZXIgZnVuY3Rpb24sIG9yIGluIG9uZSBvZiB0aGUgaG9zdHMgaW4gZGVidWcgbW9kZS4gSW4gdGhpcyBjYXNlLFxuLy8gd2Ugc2V0IHRoZSBjb21waWxhdGlvbiBjb25zdGFudHMgZXhwbGljaXRseSBhdCBydW50aW1lLlxuaWYgKHR5cGVvZiBERUJVRyA9PT0gXCJ1bmRlZmluZWRcIilcblx0T2JqZWN0LmFzc2lnbihnbG9iYWxUaGlzLCB7IERFQlVHOiB0cnVlIH0pO1xuXG5pZiAodHlwZW9mIEVMRUNUUk9OID09PSBcInVuZGVmaW5lZFwiKVxuXHRPYmplY3QuYXNzaWduKGdsb2JhbFRoaXMsIHsgRUxFQ1RST046IHR5cGVvZiBzY3JlZW4gKyB0eXBlb2YgcmVxdWlyZSA9PT0gXCJvYmplY3RmdW5jdGlvblwiIH0pO1xuXG5pZiAodHlwZW9mIFRBVVJJID09PSBcInVuZGVmaW5lZFwiKVxuXHRPYmplY3QuYXNzaWduKGdsb2JhbFRoaXMsIHsgVEFVUkk6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mICh3aW5kb3cgYXMgYW55KS5fX1RBVVJJX18gIT09IFwidW5kZWZpbmVkXCIgfSk7XG5cbmlmICh0eXBlb2YgSU9TID09PSBcInVuZGVmaW5lZFwiKVxuXHRPYmplY3QuYXNzaWduKGdsb2JhbFRoaXMsIHsgSU9TOiB0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmIG5hdmlnYXRvci5wbGF0Zm9ybS5zdGFydHNXaXRoKFwiaVBcIikgfSk7XG5cbmlmICh0eXBlb2YgQU5EUk9JRCA9PT0gXCJ1bmRlZmluZWRcIilcblx0T2JqZWN0LmFzc2lnbihnbG9iYWxUaGlzLCB7IEFORFJPSUQ6IHR5cGVvZiBuYXZpZ2F0b3IgIT09IFwidW5kZWZpbmVkXCIgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcyhcIkFuZHJvaWRcIikgfSk7XG5cbmlmICh0eXBlb2YgREVNTyA9PT0gXCJ1bmRlZmluZWRcIilcbntcblx0Y29uc3QgaG9zdCA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZTtcblx0T2JqZWN0LmFzc2lnbihnbG9iYWxUaGlzLCB7IERFTU86ICEhaG9zdCAmJiAhKE51bWJlcihob3N0LnNwbGl0KFwiLlwiKS5qb2luKFwiXCIpKSA+IDApIH0pO1xufVxuXG5kZWNsYXJlIGNvbnN0IHQ6IHR5cGVvZiByYXdbXCJ0ZXh0XCJdO1xuXG5uYW1lc3BhY2UgU3F1YXJlc1xue1xuXHQvKipcblx0ICogVGhlIG1haW4gZW50cnkgcG9pbnQgb2YgdGhlIGFwcC5cblx0ICogXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGF1dG9tYXRpY2FsbHksIGluIGV2ZXJ5IGVudmlyb25tZW50IChUYXVyaSwgQ2FwYWNpdG9yKSxcblx0ICogZXhjZXB0IHdoZW4gcnVubmluZyBmcm9tIGEgTW9kdWxlc3MgY292ZXIgZnVuY3Rpb24uXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnR1cCh1c2VEZWZhdWx0RGF0YT86IGJvb2xlYW4pXG5cdHtcblx0XHRpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJjb21wbGV0ZVwiKVxuXHRcdHtcblx0XHRcdGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT5cblx0XHRcdHtcblx0XHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInJlYWR5c3RhdGVjaGFuZ2VcIiwgKCkgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpXG5cdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdFxuXHRcdCh3aW5kb3cgYXMgYW55KS50ID0gcmF3LnRleHQuYmluZChyYXcpO1xuXHRcdFxuXHRcdC8vIFRoZSBDQVBBQ0lUT1IgY29uc3RhbnQgbmVlZHMgdG8gYmUgZGVmaW5lZCBhZnRlciB0aGUgZG9jdW1lbnQgaGFzIGxvYWRlZCxcblx0XHQvLyBvdGhlcndpc2UsIHdpbmRvdy5DYXBhY2l0b3Igd2lsbCBiZSB1bmRlZmluZWQgKG9uIEFuZHJvaWQsIGl0IGRvZXNuJ3QgYXBwZWFyXG5cdFx0Ly8gdG8gYmUgaW5qZWN0ZWQgcmlnaHQgYXdheS5cblx0XHRpZiAodHlwZW9mIENBUEFDSVRPUiA9PT0gXCJ1bmRlZmluZWRcIilcblx0XHRcdE9iamVjdC5hc3NpZ24oZ2xvYmFsVGhpcywgeyBDQVBBQ0lUT1I6IHR5cGVvZiBDYXBhY2l0b3IgPT09IFwib2JqZWN0XCIgfSk7XG5cdFx0XG5cdFx0Y29uc3QgZyA9IGdsb2JhbFRoaXMgYXMgYW55O1xuXHRcdFxuXHRcdGlmIChFTEVDVFJPTilcblx0XHR7XG5cdFx0XHRjb25zdCBnID0gZ2xvYmFsVGhpcyBhcyBhbnk7XG5cdFx0XHRnLkVsZWN0cm9uID0gT2JqZWN0LmZyZWV6ZSh7XG5cdFx0XHRcdGFwcDogcmVxdWlyZShcImVsZWN0cm9uXCIpLFxuXHRcdFx0XHRmczogcmVxdWlyZShcImZzXCIpLFxuXHRcdFx0XHRwYXRoOiByZXF1aXJlKFwicGF0aFwiKSxcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRlbHNlIGlmIChUQVVSSSlcblx0XHR7XG5cdFx0XHRjb25zdCBnID0gZ2xvYmFsVGhpcyBhcyBhbnk7XG5cdFx0XHRnLlRhdXJpID0gZy5fX1RBVVJJX187XG5cdFx0fVxuXHRcdGVsc2UgaWYgKENBUEFDSVRPUilcblx0XHR7XG5cdFx0XHRnLkFwcExhdW5jaGVyID0gZy5DYXBhY2l0b3I/LlBsdWdpbnM/LkFwcExhdW5jaGVyO1xuXHRcdFx0Zy5CYWNrZ3JvdW5kRmV0Y2ggPSBnLkNhcGFjaXRvcj8uUGx1Z2lucz8uQmFja2dyb3VuZEZldGNoO1xuXHRcdFx0Zy5DYXBhY2l0b3JBcHAgPSBnLkNhcGFjaXRvcj8uUGx1Z2lucz8uQXBwO1xuXHRcdFx0Zy5DYXBDbGlwYm9hcmQgPSBnLkNhcGFjaXRvcj8uUGx1Z2lucz8uQ2xpcGJvYXJkO1xuXHRcdFx0Zy5Ub2FzdCA9IGcuQ2FwYWNpdG9yPy5QbHVnaW5zPy5Ub2FzdDtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKERFQlVHIHx8IERFTU8pXG5cdFx0XHRhd2FpdCBEYXRhLmNsZWFyKCk7XG5cdFx0XG5cdFx0aWYgKERFQlVHKVxuXHRcdHtcblx0XHRcdGNvbnN0IGRhdGFGb2xkZXIgPSBhd2FpdCBVdGlsLmdldERhdGFGb2xkZXIoKTtcblx0XHRcdGlmICghYXdhaXQgZGF0YUZvbGRlci5leGlzdHMoKSlcblx0XHRcdFx0YXdhaXQgZGF0YUZvbGRlci53cml0ZURpcmVjdG9yeSgpO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoREVCVUcgfHwgREVNTylcblx0XHRcdGlmICh1c2VEZWZhdWx0RGF0YSlcblx0XHRcdFx0YXdhaXQgU3F1YXJlcy5ydW5EYXRhSW5pdGlhbGl6ZXIoU3F1YXJlcy5mZWVkc0RlZmF1bHQpO1xuXHRcdFxuXHRcdFNxdWFyZXMuYXBwZW5kQ3NzUmVzZXQoKTtcblx0XHRTcXVhcmVzLkZvbGxvd1V0aWwuc2V0dXBTeXN0ZW1MaXN0ZW5lcnMoKTtcblx0XHRhd2FpdCBEYXRhLmluaXRpYWxpemUoKTtcblx0XHRcblx0XHRjb25zdCByb290SGF0ID0gbmV3IFJvb3RIYXQoKTtcblx0XHRhd2FpdCByb290SGF0LmNvbnN0cnVjdCgpO1xuXHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kKHJvb3RIYXQuaGVhZCk7XG5cdH1cblx0XG5cdC8vIEF1dG8tcnVuIHRoZSBzdGFydHVwIGZ1bmN0aW9uIGlmIG5vdCBydW5uaW5nIGFzIGEgbW9kdWxlc3MgY292ZXIgZnVuY3Rpb25cblx0aWYgKHR5cGVvZiBNb2R1bGVzcyA9PT0gXCJ1bmRlZmluZWRcIilcblx0XHRzdGFydHVwKCk7XG59XG5cbnR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgT2JqZWN0LmFzc2lnbihtb2R1bGUuZXhwb3J0cywgeyBTcXVhcmVzIH0pOyIsIlxuZGVjbGFyZSBuYW1lc3BhY2UgUmF3XG57XG5cdGludGVyZmFjZSBFdmVudE1hcCBleHRlbmRzIEhUTUxFbGVtZW50RXZlbnRNYXBcblx0e1xuXHRcdFwic3F1YXJlczpmb2xsb3dcIjogQ3VzdG9tRXZlbnQ8eyBmZWVkczogU3F1YXJlcy5JRmVlZERldGFpbFtdIH0+O1xuXHRcdFwic3F1YXJlczp1bmZvbGxvd1wiOiBDdXN0b21FdmVudDx7IGZlZWRLZXk6IG51bWJlciB9Pjtcblx0XHRcInNxdWFyZXM6cGFuZWNoYW5nZWRcIjogRXZlbnQ7XG5cdH1cbn1cblxubmFtZXNwYWNlIFNxdWFyZXNcbntcblx0LyoqICovXG5cdGV4cG9ydCB0eXBlIERldGFpbFR5cGU8SyBleHRlbmRzIGtleW9mIFJhdy5FdmVudE1hcD4gPSBcblx0XHRSYXcuRXZlbnRNYXBbS10gZXh0ZW5kcyBDdXN0b21FdmVudDxpbmZlciBUPiA/IFQgOiB7fTtcblx0XG5cdC8qKlxuXHQgKiBQcm92aWRlcyBhIHdheSB0byBkaXNwYXRjaCBhIGJ1YmJsaW5nIEN1c3RvbUV2ZW50XG5cdCAqIG9iamVjdCB3aXRoIHR5cGUtc2FmZSAuZGV0YWlscyBwcm9wZXJ0eSwgdXNpbmcgYSBjdXN0b21cblx0ICogLmRldGFpbHMgYXJndW1lbnQuIFRoZSBkZXRhaWxzIGFyZ3VtZW50IGlzIHJldHVybmVkLFxuXHQgKiBwb3NzaWJseSBhZnRlciBiZWluZyBtb2RpZmllZCBieSB0aGUgZXZlbnQgaGFuZGxlcnMuXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gZGlzcGF0Y2g8SyBleHRlbmRzIGtleW9mIFJhdy5FdmVudE1hcD4oXG5cdFx0bmFtZTogSyxcblx0XHRkZXRhaWw6IERldGFpbFR5cGU8Sz4sXG5cdFx0dGFyZ2V0OiBIVE1MRWxlbWVudCk6IERldGFpbFR5cGU8Sz47XG5cdC8qKlxuXHQgKiBQcm92aWRlcyBhIHdheSB0byBkaXNwYXRjaCBhIGJ1YmJsaW5nIGEgZ2VuZXJpYyBFdmVudFxuXHQgKiBvYmplY3QsIHdoaWNoIHRhcmdldHMgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoPEsgZXh0ZW5kcyBrZXlvZiBSYXcuRXZlbnRNYXA+KFxuXHRcdG5hbWU6IEssXG5cdFx0dGFyZ2V0OiBIVE1MRWxlbWVudCk6IHZvaWQ7XG5cdC8qKlxuXHQgKiBQcm92aWRlcyBhIHdheSB0byBkaXNwYXRjaCBhIGJ1YmJsaW5nIGEgZ2VuZXJpYyBFdmVudFxuXHQgKiBvYmplY3QsIHdoaWNoIHRhcmdldHMgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoPEsgZXh0ZW5kcyBrZXlvZiBSYXcuRXZlbnRNYXA+KFxuXHRcdG5hbWU6IEssXG5cdFx0ZGV0YWlsOiBEZXRhaWxUeXBlPEs+KTogdm9pZDtcblx0LyoqXG5cdCAqIFByb3ZpZGVzIGEgd2F5IHRvIGRpc3BhdGNoIGEgYnViYmxpbmcgYSBnZW5lcmljIEV2ZW50XG5cdCAqIG9iamVjdCwgd2hpY2ggdGFyZ2V0cyB0aGUgPGJvZHk+IGVsZW1lbnQuXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gZGlzcGF0Y2g8SyBleHRlbmRzIGtleW9mIFJhdy5FdmVudE1hcD4obmFtZTogSyk6IHZvaWQ7XG5cdC8qKlxuXHQgKiBQcm92aWRlcyBhIHdheSB0byBkaXNwYXRjaCBhIGJ1YmJsaW5nIEN1c3RvbUV2ZW50XG5cdCAqIG9iamVjdCB3aXRoIHR5cGUtc2FmZSAuZGV0YWlscyBwcm9wZXJ0eS5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaDxLIGV4dGVuZHMga2V5b2YgUmF3LkV2ZW50TWFwPihuYW1lOiBLLCBhPzogYW55LCBiPzogYW55KVxuXHR7XG5cdFx0Y29uc3QgdGFyZ2V0OiBIVE1MRWxlbWVudCA9IFthLCBiXS5maW5kKGUgPT4gUmF3LmlzLmVsZW1lbnQoZSkpIHx8IGRvY3VtZW50LmJvZHk7XG5cdFx0Y29uc3QgZGV0YWlsOiBEZXRhaWxUeXBlPEs+ID0gW2EsIGJdLmZpbmQoZSA9PiAhIWUgJiYgIVJhdy5pcy5lbGVtZW50KGUpID8gZSA6IG51bGwpIHx8IHt9O1xuXHRcdGNvbnN0IGV2ID0gbmV3IEN1c3RvbUV2ZW50PGFueT4obmFtZSwgeyBidWJibGVzOiB0cnVlLCBkZXRhaWwgfSk7XG5cdFx0dGFyZ2V0LmRpc3BhdGNoRXZlbnQoZXYpO1xuXHRcdHJldHVybiBkZXRhaWw7XG5cdH1cbn1cbiIsIlxubmFtZXNwYWNlIFNxdWFyZXNcbntcblx0Ly9AdHMtaWdub3JlXG5cdGlmICghREVCVUcgJiYgIURFTU8pIHJldHVybjtcblx0XG5cdGV4cG9ydCBjb25zdCBmZWVkc0RlZmF1bHQgPSBbXG5cdFx0XCJodHRwczovL3dlYmZlZWQtdHVsaXBzLnBhZ2VzLmRldi9pbmRleC50eHRcIixcblx0XHRcImh0dHBzOi8vd2ViZmVlZC1iZWFjaGVzLnBhZ2VzLmRldi9pbmRleC50eHRcIixcblx0XTtcbn1cbiIsIlxubmFtZXNwYWNlIFNxdWFyZXNcbntcblx0ZXhwb3J0IGVudW0gSW1hZ2VzXG5cdHtcblx0XHRhcHBMb2dvID0gYDxzdmcgaGVpZ2h0PVwiMTUwXCIgdmlld0JveD1cIjAgMCAxOTAgMTUwXCIgd2lkdGg9XCIxOTBcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCI+PHJhZGlhbEdyYWRpZW50IGlkPVwiYVwiIGN4PVwiODQuNzU4NzIzJVwiIGN5PVwiMTMuNjk4NjQ4JVwiIGdyYWRpZW50VHJhbnNmb3JtPVwibWF0cml4KC0uMzg3OTM4MjMgLjU2MzY3MTQ0IC0uOTIxNjg1MzcgLS4yMzcyNDk4MyAxLjMwMjY1NiAtLjMwODI3NSlcIiByPVwiMTUzLjEwNTcwOCVcIj48c3RvcCBvZmZzZXQ9XCIwXCIgc3RvcC1jb2xvcj1cIiMzNTlhZmZcIi8+PHN0b3Agb2Zmc2V0PVwiMVwiIHN0b3AtY29sb3I9XCIjMDZjXCIvPjwvcmFkaWFsR3JhZGllbnQ+PHJhZGlhbEdyYWRpZW50IGlkPVwiYlwiIGN4PVwiNTguNTQ2OTEyJVwiIGN5PVwiMTguMTQ0MTU5JVwiIGdyYWRpZW50VHJhbnNmb3JtPVwibWF0cml4KC0uMzkyNzgzNDUgLjU2MjE0NjUyIC0uOTE5NjMwOTkgLS4yNDAwOTgzMSAuOTgyMjkxIC0uMTA0MTEzKVwiIHI9XCIxNDUuNjEzMTAyJVwiPjxzdG9wIG9mZnNldD1cIjBcIiBzdG9wLWNvbG9yPVwiI2ZmMzU1NlwiLz48c3RvcCBvZmZzZXQ9XCIxXCIgc3RvcC1jb2xvcj1cIiNhZDFmMzZcIi8+PC9yYWRpYWxHcmFkaWVudD48ZyBmaWxsPVwibm9uZVwiIGZpbGwtcnVsZT1cImV2ZW5vZGRcIiB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoMCAuMDM2MzUpXCI+PHBhdGggZD1cIm0xNzkuOTExNzgxLjAwMDM5NzQxYzUuNTIyNjMyLS4wNDg3MjIyOCAxMC4wMzkxMDggNC4zODg3NTg3OCAxMC4wODc4MyA5LjkxMTM5MTM2bC4wMDAzODkgMTI5LjY0MTE0MzIzYzAgNS41MjI4NDgtNC40NzcxNTMgMTAtMTAgMTBoLTgxLjI5ODAwMmwtLjA1NTcyNS0zMS43MzI3NTljLS4wMDIxODY5LTEuMjQ1MzMxLjc2NTIyNDYtMi4zNjI1MjQgMS45Mjg0MDEtMi44MDczNTRsMTguODQxNTY4LTcuMjA1NTMxYzEuNTQ3NTUtLjU5MTgyNSAyLjMyMjMxNy0yLjMyNjEzIDEuNzMwNDkyLTMuODczNjgtLjAxNTU5MS0uMDQwNzY4LS4wMzIwNjktLjA4MTE5LS4wNDk0MjQtLjEyMTIzOWwtLjc4NzIxNi0xLjgxNjYzMmMtLjYzMzk0Ni0xLjQ2MjkzNy0yLjMwMTQ3My0yLjE3NDQzNTctMy43OTYyNzktMS42MTk3OTJsLTEzLjkzMTcyNiA1LjE2OTMzYy0xLjU1MzM3MS41NzYzNzQtMy4yNzk4NjkzLS4yMTU2MzktMy44NTYyNDMyLTEuNzY5MDA5LS4xMjM5MjU0LS4zMzM5ODgtLjE4NzM3NDMtLjY4NzM3OS0uMTg3Mzc0My0xLjA0MzYxN3YtNTguMjg4MTIzYzAtNS4xOTI0NzkyIDIuMDE5NDM5NS0xMC4xODE0MTg3IDUuNjMxMjk2NS0xMy45MTE4NzgzbDI2LjI1MjUxNi0yNy4xMTQ1NzE5MmMxLjg2MjUwNC0xLjkyMzY2MzE3IDQuNDE4NjYzLTMuMDIwMDUwMyA3LjA5NjEzMi0zLjA0MzY3MTcyem0tMjcuNTU3MiAzNi4xOTM2Mzk5OWMtMS45NTIyMDYtMS45NTAyMDE1LTUuMTE1MjMxLTEuOTUwMjAxNS03LjA2NzQzNiAwbC0xMC42NjA1NzkgMTAuNjQ5NjM2NGMtMS45NTUyNSAxLjk1NzI1NDgtMS45NTM2MjQgNS4xMjMwNzkyIDAgNy4wNzQ2OTc4bDEwLjY2MDU3OSAxMC42NDk2MzY0YzEuOTUyMjA1IDEuOTUwMjAxNSA1LjExNTIzIDEuOTUwMjAxNSA3LjA2NzQzNiAwbDEwLjY2MDU3OS0xMC42NDk2MzY0YzEuOTU1MjQ5LTEuOTU3MjU0NyAxLjk1MzYyMy01LjEyMzA3OTIgMC03LjA3NDY5Nzh6XCIgZmlsbD1cInVybCgjYSlcIi8+PHBhdGggZD1cIm0xMC4wMTY5ODAxLjMzOTEyMzE5IDM4LjYyMDYzOTkuMDY1NTc4NDZjMi41MDg0Mzk4LjAwNDI1OTM3IDQuOTIzNjY3My45NTExMDIxNSA2Ljc2NjY4MSAyLjY1Mjc0NTE2bDI5LjYyNDU0OTggMjcuMzUyMTYxMzljNC4xMDA2MDI0IDMuNzg2MDYwNiA2LjQzMjY3NzcgOS4xMTMzMzQ1IDYuNDMyNjc3NyAxNC42OTQ0ODA5djU3LjU4NDI4NDljMCAuMzY1ODc0LS4wNjY5Mjc0LjcyODY2Mi0uMTk3NDc3NyAxLjA3MDQ1Mi0uNTkxMTk0NyAxLjU0Nzc5MS0yLjMyNTE4NDcgMi4zMjMyNjUtMy44NzI5NzUgMS43MzIwN2wtMTMuMzMyMTc2OC01LjA5MjM2NWMtMS40ODYzOTg1LS41Njc3NDUyLTMuMTU3NDk5LjEyMzcyNi0zLjgwODE1NTcgMS41NzU3NDVsLS44OTQyMzc5IDEuOTk1NjAxYy0uMDI4NTIzNi4wNjM2NTQtLjA1NDgxODUuMTI4MjgzLS4wNzg4MzY3LjE5Mzc3LS41NzA1MTQxIDEuNTU1NTMyLjIyODAwMDcgMy4yNzkwMzMgMS43ODM1MzI2IDMuODQ5NTQ3bDE4LjQwMTQxMDIgNi43NDg5ODZjMS4xODU3MTk2LjQzNDg4IDEuOTcyMTAxMyAxLjU2NTc5IDEuOTY2OTY4MSAyLjgyODczM2wtLjEzMTU3NzYgMzIuMzcyNzM3aC04MS4yOTgwMDJjLTUuNTIyODQ3NSAwLTEwLTQuNDc3MTUyLTEwLTEwbC4wMDAwMTQ0Mi0xMjkuNjQxNTIxNGMuMDA5Mzc3ODctNS41MjI4Mzk1IDQuNDk0MTI2MTgtOS45OTIzODMyOCAxMC4wMTY5NjU2OC05Ljk4MzAwNTQxem0zOC42ODg2NjQgMzYuNDE1NTYxMDFjLTEuOTUyMjA1My0xLjk1MDIwMTUtNS4xMTUyMzA3LTEuOTUwMjAxNS03LjA2NzQzNiAwbC0xMC42NjA1Nzg5IDEwLjY0OTYzNjRjLS4wMDEyMTA5LjAwMTIwOTctLjAwMjQyMTIuMDAyNDItLjAwMzYzMDkuMDAzNjMwOS0xLjk1MTYxODUgMS45NTM2MjM4LTEuOTQ5OTkyOSA1LjExOTQ0ODMuMDAzNjMwOSA3LjA3MTA2NjlsMTAuNjYwNTc4OSAxMC42NDk2MzY0YzEuOTUyMjA1MyAxLjk1MDIwMTUgNS4xMTUyMzA3IDEuOTUwMjAxNSA3LjA2NzQzNiAwbDEwLjY2MDU3ODktMTAuNjQ5NjM2NGMuMDAxMjEwOS0uMDAxMjA5Ny4wMDI0MjEyLS4wMDI0Mi4wMDM2MzA5LS4wMDM2MzA5IDEuOTUxNjE4Ni0xLjk1MzYyMzkgMS45NDk5OTMtNS4xMTk0NDgzLS4wMDM2MzA5LTcuMDcxMDY2OXpcIiBmaWxsPVwidXJsKCNiKVwiLz48L2c+PC9zdmc+YFxuXHR9XG59XG4iLCJcbm5hbWVzcGFjZSBTcXVhcmVzXG57XG5cdGV4cG9ydCBjb25zdCBlbnVtIFN0cmluZ3Ncblx0e1xuXHRcdG9wZW5pbmdUaXRsZSA9IFwiV2VsY29tZSBUbyBTcXVhcmVzXCIsXG5cdFx0b3BlbmluZ01lc3NhZ2UgPSBcIlNxdWFyZXMgaXMgd2hlcmUgeW91IGF2b2lkIHRoZSBjaGFvcyBvZiBzb2NpYWwgbWVkaWEgcGxhdGZvcm1zLiBJdCBkb2VzblxcdTIwMTl0IHNob3cgeW91IGFueXRoaW5nIHVubGVzcyBzb21lb25lIHlvdSBmb2xsb3cgc2hhcmVzIGl0LlwiLFxuXHRcdG9wZW5pbmdBY3Rpb24gPSBcIkZpbmQgZmVlZHMgdG8gZm9sbG93XCIsXG5cdFx0ZmluZEZlZWRzVXJsID0gXCJodHRwczovL3d3dy5zcXVhcmVzYXBwLm9yZy9mZWVkcy9cIixcblx0XHRmb2xsb3dpbmcgPSBcIkZvbGxvd2luZ1wiLFxuXHRcdHVuZm9sbG93ID0gXCJVbmZvbGxvd1wiLFxuXHRcdG5vd0ZvbGxvd2luZyA9IFwiTm93IGZvbGxvd2luZ1wiLFxuXHRcdG5vd0ZvbGxvd2luZ0NvdW50ID0gXCJOb3cgZm9sbG93aW5nID8gZmVlZHNcIixcblx0XHRpbnZhbGlkRm9sbG93VXJsID0gXCJJbnZhbGlkIGZvbGxvdyBVUkxcIixcblx0XHRzaGFyZSA9IFwiU2hhcmVcIixcblx0XHR1bmtub3duQXV0aG9yID0gXCIoQXV0aG9yIFVua25vd24pXCIsXG5cdH1cbn1cbiIsIlxubmFtZXNwYWNlIFNxdWFyZXNcbntcblx0LyoqXG5cdCAqIFxuXHQgKi9cblx0ZXhwb3J0IGNsYXNzIEJhY2tncm91bmRGZXRjaGVyXG5cdHtcblx0XHQvKiogKi9cblx0XHRjb25zdHJ1Y3RvcigpXG5cdFx0e1xuXHRcdFx0Ly8hIE5vdCBpbXBsZW1lbnRlZFxuXHRcdH1cblx0fVxufVxuIiwiXG5uYW1lc3BhY2UgU3F1YXJlcy5EYXRhXG57XG5cdC8qKiAqL1xuXHRleHBvcnQgaW50ZXJmYWNlIElSZWFkQXJyYXlPcHRpb25zXG5cdHtcblx0XHRzdGFydD86IG51bWJlcjtcblx0XHRsaW1pdD86IG51bWJlcjtcblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0aWFsaXplKClcblx0e1xuXHRcdGZvciAoY29uc3QgcG9zdEZpbGEgb2YgYXdhaXQgcmVhZFNjcm9sbEZpbGFzKFwianNvblwiKSlcblx0XHR7XG5cdFx0XHRjb25zdCBrZXkgPSBwYXJzZUludChwb3N0RmlsYS5uYW1lKSB8fCAwO1xuXHRcdFx0Y29uc3QgcG9zdEtleXMgPSBhd2FpdCByZWFkU2Nyb2xsUG9zdEtleXMoa2V5KTtcblx0XHRcdHNjcm9sbFBvc3RDb3VudHMuc2V0KGtleSwgcG9zdEtleXMubGVuZ3RoKTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgdGhlcmUgaXMgYXQgbGVhc3Qgb25lIHNjcm9sbCB3cml0dGVuIHRvIHRoZSBkYXRhIGxheWVyLlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGhhc1Njcm9sbHMoKVxuXHR7XG5cdFx0cmV0dXJuIHNjcm9sbFBvc3RDb3VudHMuc2l6ZSA+IDA7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRleHBvcnQgZnVuY3Rpb24gcmVhZFNjcm9sbFBvc3RDb3VudChzY3JvbGxLZXk6IG51bWJlcilcblx0e1xuXHRcdHJldHVybiBzY3JvbGxQb3N0Q291bnRzLmdldChzY3JvbGxLZXkpIHx8IDA7XG5cdH1cblx0XG5cdGNvbnN0IHNjcm9sbFBvc3RDb3VudHMgPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyPigpO1xuXHRcblx0LyoqICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cml0ZVNjcm9sbChkZWZhdWx0czogUGFydGlhbDxJU2Nyb2xsPilcblx0e1xuXHRcdGNvbnN0IHNjcm9sbDogSVNjcm9sbCA9IE9iamVjdC5hc3NpZ24oXG5cdFx0XHR7XG5cdFx0XHRcdGtleTogVXRpbC5nZXRTYWZlVGlja3MoKSxcblx0XHRcdFx0YW5jaG9ySW5kZXg6IDAsXG5cdFx0XHRcdGZlZWRzOiBbXVxuXHRcdFx0fSxcblx0XHRcdGRlZmF1bHRzXG5cdFx0KTtcblx0XHRcblx0XHRjb25zdCBkaXNrU2Nyb2xsOiBJRGlza1Njcm9sbCA9IHtcblx0XHRcdGFuY2hvckluZGV4OiBzY3JvbGwuYW5jaG9ySW5kZXgsXG5cdFx0XHRmZWVkczogc2Nyb2xsLmZlZWRzLm1hcChzID0+IHMua2V5KSxcblx0XHR9O1xuXHRcdFxuXHRcdGNvbnN0IGtleSA9IHNjcm9sbC5rZXk7XG5cdFx0Y29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGRpc2tTY3JvbGwpO1xuXHRcdGNvbnN0IGZpbGEgPSBhd2FpdCBnZXRTY3JvbGxGaWxlKGtleSk7XG5cdFx0YXdhaXQgZmlsYS53cml0ZVRleHQoanNvbik7XG5cdFx0cmV0dXJuIHNjcm9sbDtcblx0fVxuXHRcblx0LyoqXG5cdCAqIEFkZHMgYSByZWZlcmVuY2UgdG8gYSBwb3N0IHdpdGhpbiBhIHBhcnRpY3VsYXIgc2Nyb2xsLlxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlU2Nyb2xsUG9zdChzY3JvbGxLZXk6IG51bWJlciwgcG9zdDogSVBvc3QpXG5cdHtcblx0XHRjb25zdCBmaWxhID0gYXdhaXQgZ2V0U2Nyb2xsUG9zdHNGaWxlKHNjcm9sbEtleSk7XG5cdFx0Y29uc3Qga2V5cyA9IFtwb3N0LmtleV07XG5cdFx0YXdhaXQgYXBwZW5kQXJyYXlGaWxlKGZpbGEsIGtleXMpO1xuXHRcdHNjcm9sbFBvc3RDb3VudHMuc2V0KHNjcm9sbEtleSwgKHNjcm9sbFBvc3RDb3VudHMuZ2V0KHNjcm9sbEtleSkgfHwgMCkgKyAxKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJlYWQgdGhlIHNjcm9sbCBvYmplY3QgZnJvbSB0aGUgZmlsZSBzeXN0ZW0gd2l0aCB0aGUgc3BlY2lmaWVkIGtleS5cblx0ICogSWYgdGhlIGFyZ3VtZW50IGlzIG9taXR0ZWQsIHRoZSBmaXJzdCBkaXNjb3ZlcmVkIHNjcm9sbCBpcyByZXR1cm5lZC5cblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkU2Nyb2xsKGtleT86IG51bWJlcilcblx0e1xuXHRcdGlmICgha2V5KVxuXHRcdFx0Zm9yIChjb25zdCBmaWxhIG9mIGF3YWl0IHJlYWRTY3JvbGxGaWxhcyhcImpzb25cIikpXG5cdFx0XHRcdGtleSA9IGtleU9mKGZpbGEpO1xuXHRcdFxuXHRcdGlmICgha2V5KVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XG5cdFx0Y29uc3QgZmlsYSA9IGF3YWl0IGdldFNjcm9sbEZpbGUoa2V5KTtcblx0XHRpZiAoIWF3YWl0IGZpbGEuZXhpc3RzKCkpXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcblx0XHRjb25zdCBkaXNrU2Nyb2xsSnNvbiA9IGF3YWl0IGZpbGEucmVhZFRleHQoKTtcblx0XHRjb25zdCBkaXNrU2Nyb2xsOiBJRGlza1Njcm9sbCA9IEpTT04ucGFyc2UoZGlza1Njcm9sbEpzb24pO1xuXHRcdGNvbnN0IGZlZWRzOiBJRmVlZERldGFpbFtdID0gW107XG5cdFx0XG5cdFx0Zm9yIChjb25zdCBmZWVkS2V5IG9mIGRpc2tTY3JvbGwuZmVlZHMpXG5cdFx0e1xuXHRcdFx0Y29uc3QgZmVlZCA9IGF3YWl0IHJlYWRGZWVkRGV0YWlsKGZlZWRLZXkpO1xuXHRcdFx0aWYgKGZlZWQpXG5cdFx0XHRcdGZlZWRzLnB1c2goZmVlZCk7XG5cdFx0fVxuXHRcdFxuXHRcdGNvbnN0IHNjcm9sbDogSVNjcm9sbCA9IHtcblx0XHRcdGFuY2hvckluZGV4OiBkaXNrU2Nyb2xsLmFuY2hvckluZGV4LFxuXHRcdFx0a2V5LFxuXHRcdFx0ZmVlZHMsXG5cdFx0fTtcblx0XHRcblx0XHRyZXR1cm4gc2Nyb2xsO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRTY3JvbGxzKClcblx0e1xuXHRcdGNvbnN0IHNjcm9sbHM6IElTY3JvbGxbXSA9IFtdO1xuXHRcdFxuXHRcdGZvciAoY29uc3QgZmlsYSBvZiBhd2FpdCByZWFkU2Nyb2xsRmlsYXMoXCJqc29uXCIpKVxuXHRcdHtcblx0XHRcdGNvbnN0IGtleSA9IGtleU9mKGZpbGEpO1xuXHRcdFx0Y29uc3Qgc2Nyb2xsID0gYXdhaXQgcmVhZFNjcm9sbChrZXkpO1xuXHRcdFx0aWYgKHNjcm9sbClcblx0XHRcdFx0c2Nyb2xscy5wdXNoKHNjcm9sbCk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBzY3JvbGxzO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0YXN5bmMgZnVuY3Rpb24gcmVhZFNjcm9sbEZpbGFzKHR5cGU6IFwianNvblwiIHwgXCJ0eHRcIilcblx0e1xuXHRcdGNvbnN0IGZvbGRlciA9IGF3YWl0IGdldFNjcm9sbEZvbGRlcigpO1xuXHRcdGlmICghYXdhaXQgZm9sZGVyLmV4aXN0cygpKVxuXHRcdFx0cmV0dXJuIFtdO1xuXHRcdFxuXHRcdGNvbnN0IGZpbGFzID0gYXdhaXQgZm9sZGVyLnJlYWREaXJlY3RvcnkoKTtcblx0XHRjb25zdCByZWcgPSBuZXcgUmVnRXhwKFwiXlswLTldK1xcXFwuXCIgKyB0eXBlICsgXCIkXCIpO1xuXHRcdHJldHVybiBmaWxhcy5maWx0ZXIoZiA9PiByZWcudGVzdChmLm5hbWUpKTtcblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkU2Nyb2xsUG9zdChzY3JvbGxLZXk6IG51bWJlciwgaW5kZXg6IG51bWJlcilcblx0e1xuXHRcdGZvciBhd2FpdCAoY29uc3QgcG9zdCBvZiByZWFkU2Nyb2xsUG9zdHMoc2Nyb2xsS2V5LCB7IHN0YXJ0OiBpbmRleCwgbGltaXQ6IDEgfSkpXG5cdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiAqIHJlYWRTY3JvbGxQb3N0cyhzY3JvbGxLZXk6IG51bWJlciwgb3B0aW9ucz86IElSZWFkQXJyYXlPcHRpb25zKVxuXHR7XG5cdFx0Zm9yIChjb25zdCBwb3N0S2V5IG9mIGF3YWl0IHJlYWRTY3JvbGxQb3N0S2V5cyhzY3JvbGxLZXksIG9wdGlvbnMpKVxuXHRcdHtcblx0XHRcdGNvbnN0IHBvc3QgPSBhd2FpdCByZWFkUG9zdChwb3N0S2V5KTtcblx0XHRcdFxuXHRcdFx0aWYgKHBvc3QpXG5cdFx0XHRcdHlpZWxkIHBvc3Q7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKiogKi9cblx0YXN5bmMgZnVuY3Rpb24gcmVhZFNjcm9sbFBvc3RLZXlzKHNjcm9sbEtleTogbnVtYmVyLCBvcHRpb25zPzogSVJlYWRBcnJheU9wdGlvbnMpXG5cdHtcblx0XHRjb25zdCBmaWxhID0gYXdhaXQgZ2V0U2Nyb2xsUG9zdHNGaWxlKHNjcm9sbEtleSk7XG5cdFx0Y29uc3QgcG9zdEtleXMgPSBhd2FpdCByZWFkQXJyYXlGaWxlKGZpbGEsIG9wdGlvbnMpO1xuXHRcdHJldHVybiBwb3N0S2V5cztcblx0fVxuXHRcblx0LyoqICovXG5cdGFzeW5jIGZ1bmN0aW9uIGdldFNjcm9sbEZvbGRlcigpXG5cdHtcblx0XHRjb25zdCBmaWxhID0gYXdhaXQgVXRpbC5nZXREYXRhRm9sZGVyKCk7XG5cdFx0cmV0dXJuIGZpbGEuZG93bihcInNjcm9sbHNcIik7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRhc3luYyBmdW5jdGlvbiBnZXRTY3JvbGxGaWxlKGtleTogbnVtYmVyKVxuXHR7XG5cdFx0cmV0dXJuIChhd2FpdCBnZXRTY3JvbGxGb2xkZXIoKSkuZG93bihrZXkgKyBcIi5qc29uXCIpO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0YXN5bmMgZnVuY3Rpb24gZ2V0U2Nyb2xsUG9zdHNGaWxlKGtleTogbnVtYmVyKVxuXHR7XG5cdFx0cmV0dXJuIChhd2FpdCBnZXRTY3JvbGxGb2xkZXIoKSkuZG93bihrZXkgKyBcIi50eHRcIik7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IElGZWVkIG9iamVjdCB0byBkaXNrLCBvcHRpb25hbGx5IHBvcHVsYXRlZCB3aXRoIHRoZVxuXHQgKiBzcGVjaWZpZWQgdmFsdWVzLCB3cml0ZXMgaXQgdG8gZGlzaywgYW5kIHJldHVybnMgdGhlIGNvbnN0cnVjdGVkIG9iamVjdC5cblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cml0ZUZlZWQoLi4uZGVmYXVsdHM6IFBhcnRpYWw8SUZlZWREZXRhaWw+W10pXG5cdHtcblx0XHRjb25zdCBrZXkgPSAgVXRpbC5nZXRTYWZlVGlja3MoKTtcblx0XHRjb25zdCBmZWVkOiBJRmVlZERldGFpbCA9IE9iamVjdC5hc3NpZ24oXG5cdFx0XHR7XG5cdFx0XHRcdGtleSxcblx0XHRcdFx0dXJsOiBcIlwiLFxuXHRcdFx0XHRpY29uOiBcIlwiLFxuXHRcdFx0XHRhdXRob3I6IFwiXCIsXG5cdFx0XHRcdGRlc2NyaXB0aW9uOiBcIlwiLFxuXHRcdFx0XHRzaXplOiAwLFxuXHRcdFx0fSxcblx0XHRcdC4uLmRlZmF1bHRzKTtcblx0XHRcblx0XHRpZiAoIWZlZWQudXJsKVxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiLnVybCBwcm9wZXJ0eSBtdXN0IGJlIHBvcHVsYXRlZC5cIik7XG5cdFx0XG5cdFx0Y29uc3QgZGlza0ZlZWQgPSBPYmplY3QuYXNzaWduKHt9LCBmZWVkKSBhcyBJRGlza0ZlZWREZXRhaWw7XG5cdFx0ZGVsZXRlIChkaXNrRmVlZCBhcyBhbnkpLmtleTtcblx0XHRjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZGlza0ZlZWQpO1xuXHRcdGNvbnN0IGZpbGEgPSBhd2FpdCBnZXRGZWVkRGV0YWlsc0ZpbGUoa2V5KTtcblx0XHRhd2FpdCBmaWxhLndyaXRlVGV4dChqc29uKTtcblx0XHRyZXR1cm4gZmVlZDtcblx0fVxuXHRcblx0LyoqICovXG5cdGFzeW5jIGZ1bmN0aW9uIHdyaXRlRmVlZFBvc3QoZmVlZEtleTogbnVtYmVyLCBwb3N0S2V5czogbnVtYmVyW10pXG5cdHtcblx0XHRjb25zdCBmaWxhID0gYXdhaXQgZ2V0RmVlZFBvc3RLZXlzRmlsZShmZWVkS2V5KTtcblx0XHRhd2FpdCBhcHBlbmRBcnJheUZpbGUoZmlsYSwgcG9zdEtleXMpO1xuXHR9XG5cdFxuXHQvKipcblx0ICogXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZEZlZWREZXRhaWwoa2V5OiBudW1iZXIpXG5cdHtcblx0XHRsZXQgZmlsYSA9IGF3YWl0IGdldEZlZWREZXRhaWxzRmlsZShrZXkpO1xuXHRcdGlmICghYXdhaXQgZmlsYS5leGlzdHMoKSlcblx0XHR7XG5cdFx0XHRmaWxhID0gYXdhaXQgZ2V0RmVlZEZpbGVBcmNoaXZlZChrZXkpO1xuXHRcdFx0aWYgKCFhd2FpdCBmaWxhLmV4aXN0cygpKVxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdFx0XG5cdFx0Y29uc3QganNvblRleHQgPSBhd2FpdCBmaWxhLnJlYWRUZXh0KCk7XG5cdFx0Y29uc3QgZmVlZDogSUZlZWREZXRhaWwgPSBKU09OLnBhcnNlKGpzb25UZXh0KTtcblx0XHRmZWVkLmtleSA9IGtleTtcblx0XHRyZXR1cm4gZmVlZDtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJlYWRzIGFsbCBub24tYXJjaGl2ZWQgZmVlZHMgZnJvbSB0aGUgZmlsZSBzeXN0ZW0uXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gKiByZWFkRmVlZERldGFpbHMoKVxuXHR7XG5cdFx0Y29uc3QgZm9sZGVyID0gKGF3YWl0IGdldEZlZWREZXRhaWxzRmlsZSgwKSkudXAoKTtcblx0XHRjb25zdCBmaWxlcyA9IGF3YWl0IGZvbGRlci5yZWFkRGlyZWN0b3J5KCk7XG5cdFx0XG5cdFx0Zm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKVxuXHRcdHtcblx0XHRcdGlmIChmaWxlLmV4dGVuc2lvbiAhPT0gXCIuanNvblwiKVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFxuXHRcdFx0Y29uc3Qga2V5ID0ga2V5T2YoZmlsZSk7XG5cdFx0XHRjb25zdCBmZWVkID0gYXdhaXQgcmVhZEZlZWREZXRhaWwoa2V5KTtcblx0XHRcdGlmIChmZWVkKVxuXHRcdFx0XHR5aWVsZCBmZWVkO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiAqIHJlYWRGZWVkUG9zdHMoZmVlZEtleTogbnVtYmVyKVxuXHR7XG5cdFx0Zm9yIChjb25zdCBwb3N0S2V5IG9mIGF3YWl0IHJlYWRGZWVkUG9zdEtleXMoZmVlZEtleSkpXG5cdFx0e1xuXHRcdFx0Y29uc3QgcG9zdCA9IGF3YWl0IHJlYWRQb3N0KHBvc3RLZXkpO1xuXHRcdFx0aWYgKHBvc3QpXG5cdFx0XHRcdHlpZWxkIHBvc3Q7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKiogKi9cblx0YXN5bmMgZnVuY3Rpb24gcmVhZEZlZWRQb3N0S2V5cyhmZWVkS2V5OiBudW1iZXIpXG5cdHtcblx0XHRjb25zdCBmaWxhID0gYXdhaXQgZ2V0RmVlZFBvc3RLZXlzRmlsZShmZWVkS2V5KTtcblx0XHRjb25zdCBwb3N0S2V5cyA9IGF3YWl0IHJlYWRBcnJheUZpbGUoZmlsYSk7XG5cdFx0cmV0dXJuIHBvc3RLZXlzO1xuXHR9XG5cdFxuXHQvKipcblx0ICogTW92ZXMgdGhlIGZlZWQgZmlsZSB0byB0aGUgYXJjaGl2ZSAod2hpY2ggaXMgdGhlIHVuZm9sbG93IG9wZXJhdGlvbikuXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gYXJjaGl2ZUZlZWQoZmVlZEtleTogbnVtYmVyKVxuXHR7XG5cdFx0Y29uc3Qgc3JjID0gYXdhaXQgZ2V0RmVlZERldGFpbHNGaWxlKGZlZWRLZXkpO1xuXHRcdGNvbnN0IGpzb24gPSBhd2FpdCBzcmMucmVhZFRleHQoKTtcblx0XHRjb25zdCBkc3QgPSBhd2FpdCBnZXRGZWVkRmlsZUFyY2hpdmVkKGZlZWRLZXkpO1xuXHRcdGRzdC53cml0ZVRleHQoanNvbik7XG5cdFx0c3JjLmRlbGV0ZSgpO1xuXHRcdFxuXHRcdC8vIFJlbW92ZSB0aGUgZmVlZCBmcm9tIGFueSBzY3JvbGwgZmlsZXMuXG5cdFx0Zm9yIChjb25zdCBmaWxhIG9mIGF3YWl0IHJlYWRTY3JvbGxGaWxhcyhcImpzb25cIikpXG5cdFx0e1xuXHRcdFx0Y29uc3QgZGlza1Njcm9sbEpzb24gPSBhd2FpdCBmaWxhLnJlYWRUZXh0KCk7XG5cdFx0XHRjb25zdCBkaXNrU2Nyb2xsOiBJRGlza1Njcm9sbCA9IEpTT04ucGFyc2UoZGlza1Njcm9sbEpzb24pO1xuXHRcdFx0XG5cdFx0XHRmb3IgKGxldCBpID0gZGlza1Njcm9sbC5mZWVkcy5sZW5ndGg7IGktLSA+IDA7KVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBrZXkgPSBkaXNrU2Nyb2xsLmZlZWRzW2ldO1xuXHRcdFx0XHRpZiAoa2V5ID09PSBmZWVkS2V5KVxuXHRcdFx0XHRcdGRpc2tTY3JvbGwuZmVlZHMuc3BsaWNlKGksIDEpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRjb25zdCBkaXNrU2Nyb2xsSnNvbk5ldyA9IEpTT04uc3RyaW5naWZ5KGRpc2tTY3JvbGwpO1xuXHRcdFx0ZmlsYS53cml0ZVRleHQoZGlza1Njcm9sbEpzb25OZXcpO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqICovXG5cdGFzeW5jIGZ1bmN0aW9uIGdldEZlZWREZXRhaWxzRmlsZShrZXk6IG51bWJlcilcblx0e1xuXHRcdHJldHVybiAoYXdhaXQgZ2V0RmVlZHNGb2xkZXIoKSkuZG93bihrZXkgKyBcIi5qc29uXCIpO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0YXN5bmMgZnVuY3Rpb24gZ2V0RmVlZFBvc3RLZXlzRmlsZShrZXk6IG51bWJlcilcblx0e1xuXHRcdHJldHVybiAoYXdhaXQgZ2V0RmVlZHNGb2xkZXIoKSkuZG93bihrZXkgKyBcIi50eHRcIik7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRhc3luYyBmdW5jdGlvbiBnZXRGZWVkc0ZvbGRlcigpXG5cdHtcblx0XHRjb25zdCBmaWxhID0gYXdhaXQgVXRpbC5nZXREYXRhRm9sZGVyKCk7XG5cdFx0cmV0dXJuIGZpbGEuZG93bihcImZlZWRzXCIpO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0YXN5bmMgZnVuY3Rpb24gZ2V0RmVlZEZpbGVBcmNoaXZlZChrZXk6IG51bWJlcilcblx0e1xuXHRcdGNvbnN0IGZpbGEgPSBhd2FpdCBVdGlsLmdldERhdGFGb2xkZXIoKTtcblx0XHRyZXR1cm4gZmlsYS5kb3duKFwiYXJjaGl2ZVwiKS5kb3duKGtleSArIFwiLmpzb25cIik7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBXcml0ZXMgdGhlIFVSTHMgY29udGFpbmVkIGluIHRoZSBzcGVjaWZpZWQgdG8gdGhlIGZpbGUgc3lzdGVtLCBpbiB0aGVpciBmdWxsLXF1YWxpZmllZFxuXHQgKiBmb3JtLCBhbmQgcmV0dXJucyBhbiBvYmplY3QgdGhhdCBpbmRpY2F0ZXMgd2hhdCBVUkxzIHdoZXJlIGFkZGVkIGFuZCB3aGljaCBvbmVzXG5cdCAqIHdlcmUgcmVtb3ZlZCBmcm9tIHRoZSBwcmV2aW91cyB0aW1lIHRoYXQgdGhpcyBmdW5jdGlvbiB3YXMgY2FsbGVkLlxuXHQgKiBcblx0ICogVGhlIFVSTHMgYXJlIGV4cGVjdGVkIHRvIGJlIGluIHRoZWlyIGZ1bGx5LXF1YWxpZmllZCBmb3JtLCB3aGljaCBpcyBkaWZmZXJlbnQgZnJvbVxuXHQgKiBob3cgdGhlIFVSTHMgYXJlIHR5cGljYWxseSB3cml0dGVuIGluIHRoZSBmZWVkIHRleHQgZmlsZS5cblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cml0ZUZlZWRVcGRhdGVzKGZlZWQ6IElGZWVkRGV0YWlsLCB1cmxzOiBzdHJpbmdbXSlcblx0e1xuXHRcdGlmICghZmVlZC5rZXkpXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY2FwdHVyZSB0aGlzIGZlZWQgYmVjYXVzZSBpdCBoYXMgbm8ga2V5LlwiKTtcblx0XHRcblx0XHRjb25zdCBhZGRlZDogc3RyaW5nW10gPSBbXTtcblx0XHRjb25zdCByZW1vdmVkOiBzdHJpbmdbXSA9IFtdO1xuXHRcdGNvbnN0IGZpbGFJbmRleCA9IChhd2FpdCBnZXRJbmRleGVzRm9sZGVyKCkpLmRvd24oZmVlZC5rZXkgKyBcIi50eHRcIik7XG5cdFx0XG5cdFx0aWYgKGF3YWl0IGZpbGFJbmRleC5leGlzdHMoKSlcblx0XHR7XG5cdFx0XHRjb25zdCByYXdUZXh0ID0gYXdhaXQgZmlsYUluZGV4LnJlYWRUZXh0KCk7XG5cdFx0XHRjb25zdCByYXdMaW5lcyA9IHJhd1RleHQuc3BsaXQoXCJcXG5cIik7XG5cdFx0XHRjb25zdCByYXdMaW5lc1NldCA9IG5ldyBTZXQocmF3TGluZXMpO1xuXHRcdFx0Y29uc3QgdXJsc1NldCA9IG5ldyBTZXQodXJscyk7XG5cdFx0XHRcblx0XHRcdGZvciAoY29uc3QgdXJsIG9mIHJhd0xpbmVzKVxuXHRcdFx0XHRpZiAoIXVybHNTZXQuaGFzKHVybCkpXG5cdFx0XHRcdFx0cmVtb3ZlZC5wdXNoKHVybCk7XG5cdFx0XHRcblx0XHRcdGZvciAoY29uc3QgdXJsIG9mIHVybHMpXG5cdFx0XHRcdGlmICghcmF3TGluZXNTZXQuaGFzKHVybCkpXG5cdFx0XHRcdFx0YWRkZWQucHVzaCh1cmwpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0YWRkZWQucHVzaCguLi51cmxzKTtcblx0XHR9XG5cdFx0XG5cdFx0Y29uc3QgdGV4dCA9IHVybHMuam9pbihcIlxcblwiKTtcblx0XHRhd2FpdCBmaWxhSW5kZXgud3JpdGVUZXh0KHRleHQpO1xuXHRcdFxuXHRcdHJldHVybiB7IGFkZGVkLCByZW1vdmVkIH07XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRhc3luYyBmdW5jdGlvbiBnZXRJbmRleGVzRm9sZGVyKClcblx0e1xuXHRcdGNvbnN0IGZpbGEgPSBhd2FpdCBVdGlsLmdldERhdGFGb2xkZXIoKTtcblx0XHRyZXR1cm4gZmlsYS5kb3duKFwiaW5kZXhlc1wiKTtcblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkUG9zdChrZXk6IG51bWJlcilcblx0e1xuXHRcdGNvbnN0IHBvc3RzRmlsZSA9IGF3YWl0IGdldFBvc3RzRmlsZShrZXkpO1xuXHRcdGNvbnN0IHBvc3RzT2JqZWN0ID0gYXdhaXQgcmVhZFBvc3RzRmlsZShwb3N0c0ZpbGUpO1xuXHRcdGNvbnN0IGRpc2tQb3N0OiBJRGlza1Bvc3QgPSBwb3N0c09iamVjdFtrZXldO1xuXHRcdGlmICghZGlza1Bvc3QpXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcblx0XHRjb25zdCBmZWVkID0gYXdhaXQgcmVhZEZlZWREZXRhaWwoZGlza1Bvc3QuZmVlZCk7XG5cdFx0aWYgKCFmZWVkKVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XG5cdFx0cmV0dXJuIDxJUG9zdD57XG5cdFx0XHRrZXksXG5cdFx0XHRmZWVkLFxuXHRcdFx0dmlzaXRlZDogZGlza1Bvc3QudmlzaXRlZCxcblx0XHRcdHBhdGg6IGRpc2tQb3N0LnBhdGgsXG5cdFx0fTtcblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cml0ZVBvc3QocG9zdDogUGFydGlhbDxJUG9zdD4pXG5cdHtcblx0XHRpZiAoIXBvc3Qua2V5KVxuXHRcdFx0cG9zdC5rZXkgPSBVdGlsLmdldFNhZmVUaWNrcygpO1xuXHRcdFxuXHRcdGNvbnN0IGZ1bGxQb3N0ID0gcG9zdCBhcyBJUG9zdDtcblx0XHRcblx0XHRjb25zdCBkaXNrUG9zdDogSURpc2tQb3N0ID0ge1xuXHRcdFx0dmlzaXRlZDogZnVsbFBvc3QudmlzaXRlZCB8fCBmYWxzZSxcblx0XHRcdGZlZWQ6IGZ1bGxQb3N0LmZlZWQ/LmtleSB8fCAwLFxuXHRcdFx0cGF0aDogZnVsbFBvc3QucGF0aCB8fCBcIlwiXG5cdFx0fTtcblx0XHRcblx0XHRpZiAoIWRpc2tQb3N0LnBhdGgpXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJQb3N0IGhhcyBubyAucGF0aCBwcm9wZXJ0eS5cIik7XG5cdFx0XG5cdFx0Y29uc3QgcG9zdHNGaWxlID0gYXdhaXQgZ2V0UG9zdHNGaWxlKHBvc3Qua2V5KTtcblx0XHRjb25zdCBwb3N0c09iamVjdCA9IGF3YWl0IHJlYWRQb3N0c0ZpbGUocG9zdHNGaWxlKTtcblx0XHRcblx0XHQvLyBUaGlzIG1heSBlaXRoZXIgb3ZlcnJpZGUgdGhlIHBvc3QgYXQgdGhlIGV4aXN0aW5nIGtleSxcblx0XHQvLyBvciBhc3NpZ24gYSBuZXcgcG9zdCBhdCB0aGUgbmV3IGtleS5cblx0XHRwb3N0c09iamVjdFtwb3N0LmtleV0gPSBkaXNrUG9zdDtcblx0XHRcblx0XHRjb25zdCBwb3N0c09iamVjdEpzb25UZXh0ID0gSlNPTi5zdHJpbmdpZnkocG9zdHNPYmplY3QpO1xuXHRcdGF3YWl0IHBvc3RzRmlsZS53cml0ZVRleHQocG9zdHNPYmplY3RKc29uVGV4dCk7XG5cdFx0XG5cdFx0Ly8gQWRkIHRoZSBwb3N0IHRvIHRoZSBmZWVkXG5cdFx0YXdhaXQgd3JpdGVGZWVkUG9zdChkaXNrUG9zdC5mZWVkLCBbcG9zdC5rZXldKTtcblx0XHRcblx0XHRyZXR1cm4gZnVsbFBvc3Q7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBSZWFkcyB0aGUgY29udGVudHMgb2YgYSBKU09OIGZpbGUgdGhhdCBjb250YWlucyBtdWx0aXBsZSBwb3N0cy5cblx0ICovXG5cdGFzeW5jIGZ1bmN0aW9uIHJlYWRQb3N0c0ZpbGUocG9zdHNGaWxhOiBGaWxhKVxuXHR7XG5cdFx0aWYgKCFhd2FpdCBwb3N0c0ZpbGEuZXhpc3RzKCkpXG5cdFx0XHRyZXR1cm4ge307XG5cdFx0XG5cdFx0Y29uc3QgcG9zdHNKc29uID0gYXdhaXQgcG9zdHNGaWxhLnJlYWRUZXh0KCk7XG5cdFx0Y29uc3QgcG9zdHNPYmplY3QgPSBVdGlsLnRyeVBhcnNlSnNvbihwb3N0c0pzb24pIGFzIElQb3N0RmlsZTtcblx0XHRyZXR1cm4gcG9zdHNPYmplY3Q7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRhc3luYyBmdW5jdGlvbiBnZXRQb3N0c0ZvbGRlcigpXG5cdHtcblx0XHRjb25zdCBmaWxhID0gYXdhaXQgVXRpbC5nZXREYXRhRm9sZGVyKCk7XG5cdFx0cmV0dXJuIGZpbGEuZG93bihcInBvc3RzXCIpO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0YXN5bmMgZnVuY3Rpb24gZ2V0UG9zdHNGaWxlKGtleTogbnVtYmVyKVxuXHR7XG5cdFx0Y29uc3QgZGF0ZSA9IG5ldyBEYXRlKGtleSk7XG5cdFx0Y29uc3QgeSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcblx0XHRjb25zdCBtID0gKFwiMFwiICsgKGRhdGUuZ2V0TW9udGgoKSArIDEpKS5zbGljZSgtMik7XG5cdFx0Y29uc3QgZCA9IChcIjBcIiArIGRhdGUuZ2V0RGF0ZSgpKS5zbGljZSgtMik7XG5cdFx0Y29uc3QgcG9zdHNGaWxlTmFtZSA9IFt5LCBtLCBkXS5qb2luKFwiLVwiKSArIFwiLmpzb25cIjtcblx0XHRyZXR1cm4gKGF3YWl0IGdldFBvc3RzRm9sZGVyKCkpLmRvd24ocG9zdHNGaWxlTmFtZSk7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRmdW5jdGlvbiBrZXlPZihmaWxhOiBGaWxhKVxuXHR7XG5cdFx0cmV0dXJuIE51bWJlcihmaWxhLm5hbWUuc3BsaXQoXCIuXCIpWzBdKSB8fCAwO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0YXN5bmMgZnVuY3Rpb24gcmVhZEFycmF5RmlsZShmaWxhOiBGaWxhLCBvcHRpb25zPzogSVJlYWRBcnJheU9wdGlvbnMpXG5cdHtcblx0XHRpZiAoIWF3YWl0IGZpbGEuZXhpc3RzKCkpXG5cdFx0XHRyZXR1cm4gW107XG5cdFx0XG5cdFx0Y29uc3QgdGV4dCA9IGF3YWl0IGZpbGEucmVhZFRleHQoKTtcblx0XHRjb25zdCBudW1iZXJzOiBudW1iZXJbXSA9IFtdO1xuXHRcdGxldCBsaW5lcyA9IHRleHQuc3BsaXQoXCJcXG5cIik7XG5cdFx0XG5cdFx0Y29uc3Qgc3RhcnQgPSBvcHRpb25zPy5zdGFydCB8fCAwO1xuXHRcdGxpbmVzID0gbGluZXMuc2xpY2Uoc3RhcnQpO1xuXHRcdGxpbmVzID0gbGluZXMuc2xpY2UoMCwgb3B0aW9ucz8ubGltaXQpO1xuXHRcdFxuXHRcdGZvciAoY29uc3QgbGluZSBvZiBsaW5lcylcblx0XHR7XG5cdFx0XHRjb25zdCBuID0gTnVtYmVyKGxpbmUpIHx8IDA7XG5cdFx0XHRpZiAobiA+IDApXG5cdFx0XHRcdG51bWJlcnMucHVzaChuKTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIG51bWJlcnM7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRhc3luYyBmdW5jdGlvbiBhcHBlbmRBcnJheUZpbGUoZmlsYTogRmlsYSwga2V5czogbnVtYmVyW10pXG5cdHtcblx0XHRjb25zdCB0ZXh0ID0ga2V5cy5tYXAoayA9PiBrICsgXCJcXG5cIikuam9pbihcIlwiKTtcblx0XHRhd2FpdCBmaWxhLndyaXRlVGV4dCh0ZXh0LCB7IGFwcGVuZDogdHJ1ZSB9KTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIERlbGV0ZXMgYWxsIGRhdGEgaW4gdGhlIGRhdGEgZm9sZGVyLlxuXHQgKiBJbnRlbmRlZCBvbmx5IGZvciBkZWJ1Z2dpbmcgcHVycG9zZXMuXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXIoKVxuXHR7XG5cdFx0Y29uc3Qgc2Nyb2xsRm9sZGVyID0gYXdhaXQgZ2V0U2Nyb2xsRm9sZGVyKCk7XG5cdFx0Y29uc3QgZmVlZEZvbGRlciA9IGF3YWl0IGdldEZlZWRzRm9sZGVyKCk7XG5cdFx0Y29uc3QgZmVlZFJhd0ZvbGRlciA9IGF3YWl0IGdldEluZGV4ZXNGb2xkZXIoKTtcblx0XHRjb25zdCBwb3N0c0ZvbGRlciA9IGF3YWl0IGdldFBvc3RzRm9sZGVyKCk7XG5cdFx0Y29uc3QgYWxsOiBGaWxhW10gPSBbXTtcblx0XHRcblx0XHRpZiAoYXdhaXQgc2Nyb2xsRm9sZGVyLmV4aXN0cygpKVxuXHRcdFx0YWxsLnB1c2goLi4uYXdhaXQgc2Nyb2xsRm9sZGVyLnJlYWREaXJlY3RvcnkoKSk7XG5cdFx0XG5cdFx0aWYgKGF3YWl0IGZlZWRGb2xkZXIuZXhpc3RzKCkpXG5cdFx0XHRhbGwucHVzaCguLi5hd2FpdCBmZWVkRm9sZGVyLnJlYWREaXJlY3RvcnkoKSk7XG5cdFx0XG5cdFx0aWYgKGF3YWl0IGZlZWRSYXdGb2xkZXIuZXhpc3RzKCkpXG5cdFx0XHRhbGwucHVzaCguLi5hd2FpdCBmZWVkUmF3Rm9sZGVyLnJlYWREaXJlY3RvcnkoKSk7XG5cdFx0XG5cdFx0aWYgKGF3YWl0IHBvc3RzRm9sZGVyLmV4aXN0cygpKVxuXHRcdFx0YWxsLnB1c2goLi4uYXdhaXQgcG9zdHNGb2xkZXIucmVhZERpcmVjdG9yeSgpKTtcblx0XHRcblx0XHRhd2FpdCBQcm9taXNlLmFsbChhbGwubWFwKGZpbGEgPT4gZmlsYS5kZWxldGUoKSkpO1xuXHR9XG59XG4iLCJcbm5hbWVzcGFjZSBTcXVhcmVzXG57XG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgYXBwIHdpdGggYSBsaXN0IG9mIGRlZmF1bHQgZmVlZHMsIGFuZCBwb3B1bGF0ZXNcblx0ICogYSBzaW5nbGUgc2Nyb2xsIHdpdGggdGhlIGNvbnRlbnQgY29udGFpbmVkIHdpdGhpbiB0aG9zZSBmZWVkcy5cblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5EYXRhSW5pdGlhbGl6ZXIoZGVmYXVsdEZlZWRVcmxzOiBzdHJpbmdbXSlcblx0e1xuXHRcdGNvbnN0IGZlZWREZXRhaWxzOiBJRmVlZERldGFpbFtdID0gW107XG5cdFx0Y29uc3QgdXJsTGlzdHM6IHN0cmluZ1tdW10gPSBbXTtcblx0XHRcblx0XHRmb3IgKGNvbnN0IHVybCBvZiBkZWZhdWx0RmVlZFVybHMpXG5cdFx0e1xuXHRcdFx0Y29uc3QgdXJscyA9IGF3YWl0IFdlYmZlZWQuZG93bmxvYWRJbmRleCh1cmwpO1xuXHRcdFx0aWYgKCF1cmxzKVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFxuXHRcdFx0Y29uc3QgY2hlY2tzdW0gPSBhd2FpdCBXZWJmZWVkLnBpbmcodXJsKTtcblx0XHRcdGlmICghY2hlY2tzdW0pXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHR1cmxMaXN0cy5wdXNoKHVybHMpO1xuXHRcdFx0XG5cdFx0XHRjb25zdCBmZWVkRGV0YWlsID0gYXdhaXQgV2ViZmVlZC5kb3dubG9hZEluZGV4KHVybCkgfHwge307XG5cdFx0XHRjb25zdCBmZWVkID0gYXdhaXQgRGF0YS53cml0ZUZlZWQoZmVlZERldGFpbCwgeyB1cmwsIGNoZWNrc3VtIH0pO1xuXHRcdFx0YXdhaXQgRGF0YS53cml0ZUZlZWRVcGRhdGVzKGZlZWQsIHVybHMpO1xuXHRcdFx0ZmVlZERldGFpbHMucHVzaChmZWVkKTtcblx0XHR9XG5cdFx0XG5cdFx0Y29uc3Qgc2Nyb2xsID0gYXdhaXQgRGF0YS53cml0ZVNjcm9sbCh7IGZlZWRzOiBmZWVkRGV0YWlscyB9KTtcblx0XHRjb25zdCBtYXhMZW5ndGggPSB1cmxMaXN0cy5yZWR1Y2UoKGEsIGIpID0+IGEgPiBiLmxlbmd0aCA/IGEgOiBiLmxlbmd0aCwgMCk7XG5cdFx0XG5cdFx0Zm9yIChsZXQgaSA9IC0xOyArK2kgPCBtYXhMZW5ndGggKiB1cmxMaXN0cy5sZW5ndGg7KVxuXHRcdHtcblx0XHRcdGNvbnN0IGluZGV4T2ZMaXN0ID0gaSAlIHVybExpc3RzLmxlbmd0aDtcblx0XHRcdGNvbnN0IHVybExpc3QgPSB1cmxMaXN0c1tpbmRleE9mTGlzdF07XG5cdFx0XHRjb25zdCBpbmRleFdpdGhpbkxpc3QgPSBNYXRoLmZsb29yKGkgLyB1cmxMaXN0cy5sZW5ndGgpO1xuXHRcdFx0XG5cdFx0XHRpZiAodXJsTGlzdC5sZW5ndGggPD0gaW5kZXhXaXRoaW5MaXN0KVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFxuXHRcdFx0Y29uc3QgZmVlZCA9IGZlZWREZXRhaWxzW2luZGV4T2ZMaXN0XTtcblx0XHRcdGNvbnN0IGZlZWREaXJlY3RvcnkgPSBXZWJmZWVkLmdldEZvbGRlck9mKGZlZWQudXJsKSE7XG5cdFx0XHRjb25zdCBwYXRoID0gdXJsTGlzdFtpbmRleFdpdGhpbkxpc3RdLnNsaWNlKGZlZWREaXJlY3RvcnkubGVuZ3RoKTtcblx0XHRcdGNvbnN0IHBvc3QgPSBhd2FpdCBEYXRhLndyaXRlUG9zdCh7IGZlZWQsIHBhdGggfSk7XG5cdFx0XHRhd2FpdCBEYXRhLndyaXRlU2Nyb2xsUG9zdChzY3JvbGwua2V5LCBwb3N0KTtcblx0XHR9XG5cdH1cbn1cbiIsIlxubmFtZXNwYWNlIFNxdWFyZXNcbntcblx0LyoqXG5cdCAqIEEgbmFtZXNwYWNlIG9mIGZ1bmN0aW9ucyB3aGljaCBhcmUgc2hhcmVkIGJldHdlZW5cblx0ICogdGhlIEZvcmVncm91bmRGZXRjaGVyIGFuZCB0aGUgQmFja2dyb3VuZEZldGNoZXIuXG5cdCAqL1xuXHRleHBvcnQgbmFtZXNwYWNlIEZldGNoZXJcblx0e1xuXHRcdC8qKlxuXHRcdCAqIFxuXHRcdCAqL1xuXHRcdGV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVNb2RpZmllZEZlZWRzKG1vZGlmaWVkRmVlZHM6IElGZWVkRGV0YWlsW10pXG5cdFx0e1xuXHRcdFx0Y29uc3Qgc2Nyb2xsID0gYXdhaXQgRGF0YS5yZWFkU2Nyb2xsKCk7XG5cdFx0XHRcblx0XHRcdGZvciAoY29uc3QgZmVlZCBvZiBtb2RpZmllZEZlZWRzKVxuXHRcdFx0e1xuXHRcdFx0XHRXZWJmZWVkLmRvd25sb2FkSW5kZXgoZmVlZC51cmwpLnRoZW4oYXN5bmMgdXJscyA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKCF1cmxzKVxuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGNvbnN0IGZlZWRVcmxGb2xkZXIgPSBXZWJmZWVkLmdldEZvbGRlck9mKGZlZWQudXJsKTtcblx0XHRcdFx0XHRpZiAoIWZlZWRVcmxGb2xkZXIpXG5cdFx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRjb25zdCB7IGFkZGVkLCByZW1vdmVkIH0gPSBhd2FpdCBEYXRhLndyaXRlRmVlZFVwZGF0ZXMoZmVlZCwgdXJscyk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Zm9yIChjb25zdCB1cmwgb2YgYWRkZWQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc3QgcGF0aCA9IHVybC5zbGljZShmZWVkVXJsRm9sZGVyLmxlbmd0aCk7XG5cdFx0XHRcdFx0XHRjb25zdCBwb3N0ID0gYXdhaXQgRGF0YS53cml0ZVBvc3QoeyBmZWVkLCBwYXRoIH0pO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRpZiAoc2Nyb2xsKVxuXHRcdFx0XHRcdFx0XHREYXRhLndyaXRlU2Nyb2xsUG9zdChzY3JvbGwua2V5LCBwb3N0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuIiwiXG5uYW1lc3BhY2UgU3F1YXJlc1xue1xuXHRleHBvcnQgbmFtZXNwYWNlIEZvbGxvd1V0aWxcblx0e1xuXHRcdC8qKiAqL1xuXHRcdGV4cG9ydCBmdW5jdGlvbiBzZXR1cFN5c3RlbUxpc3RlbmVycygpXG5cdFx0e1xuXHRcdFx0aWYgKENBUEFDSVRPUilcblx0XHRcdHtcblx0XHRcdFx0Q2FwYWNpdG9yQXBwLmFkZExpc3RlbmVyKFwiYXBwVXJsT3BlblwiLCBldiA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Zm9sbG93V2ViZmVlZHNGcm9tVW5pdmVyc2FsTGluayhldi51cmwpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKFRBVVJJKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBUaGlzIGNvZGUgbmVlZHMgdG8gc2V0dXAgYSBjbGlwYm9hcmQgbW9uaXRvclxuXHRcdFx0XHQvLyBpbiBvcmRlciB0byBkZXRlcm1pbmUgd2hlbiBmb2xsb3cgbGlua3MgaGF2ZSBiZWVuXG5cdFx0XHRcdC8vIGNvcGllZCB0byB0aGUgY2xpcGJvYXJkLiBUaGUgd2ViZmVlZC1mb2xsb3cgbGlicmFyeVxuXHRcdFx0XHQvLyBuZWVkcyB0byBhZGQgc29tZXRoaW5nIHRvIHRoZSBjbGlwYm9hcmQsIHRoZSBhcHBsaWNhdGlvblxuXHRcdFx0XHQvLyBuZWVkcyB0byBkZXRlY3QgdGhpcywgYW5kIG5lZWRzIHRvIGVyYXNlIHRoZSBkYXRhIGZyb21cblx0XHRcdFx0Ly8gdGhlIGNsaXBib2FyZC4gVGhpcyBkb2Vzbid0IHdvcmsgdmVyeSB3ZWxsIHRob3VnaCxcblx0XHRcdFx0Ly8gYmVjYXVzZSBpZiB0aGUgYXBwIGlzbid0IG9wZW4sIHRoZXJlIHdvbid0IGJlIGFueVxuXHRcdFx0XHQvLyBjbGlwYm9hcmQgbW9uaXRvcmluZyBnb2luZyBvbi4gV2UgbmVlZCB0byB1c2UgY3VzdG9tXG5cdFx0XHRcdC8vIHByb3RvY29scywgYnV0IHRoZXNlIGFyZW4ndCB3aWRlbHkgc3VwcG9ydGVkIGluIGJyb3dzZXJzLFxuXHRcdFx0XHQvLyBpbiBzZWVtcy5cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKEVMRUNUUk9OKVxuXHRcdFx0e1xuXHRcdFx0XHRcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Ly8gSW4gcGxhdGZvcm1zIG90aGVyIHRoYW4gQ2FwYWNpdG9yLCBkcmFnIGFuZCBkcm9wcGluZyBvZiBsaW5rc1xuXHRcdFx0Ly8gZnJvbSB0aGUgYnJvd3NlciBpcyBzdXBwb3J0ZWQuXG5cdFx0XHRpZiAoIUNBUEFDSVRPUilcblx0XHRcdHtcblx0XHRcdFx0cmF3LmdldChkb2N1bWVudC5ib2R5KShcblx0XHRcdFx0XHRyYXcub24oXCJkcmFnb3ZlclwiLCBldiA9PiBldi5wcmV2ZW50RGVmYXVsdCgpKSxcblx0XHRcdFx0XHRyYXcub24oXCJkcm9wXCIsIGV2ID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZXYucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0Zm9yIChjb25zdCBpdGVtIG9mIEFycmF5LmZyb20oZXYuZGF0YVRyYW5zZmVyPy5pdGVtcyB8fCBbXSkpXG5cdFx0XHRcdFx0XHRcdGlmIChpdGVtLmtpbmQgPT09IFwic3RyaW5nXCIgJiYgaXRlbS50eXBlID09PSBcInRleHQvdXJpLWxpc3RcIilcblx0XHRcdFx0XHRcdFx0XHRpdGVtLmdldEFzU3RyaW5nKHN0cmluZyA9PiBmb2xsb3dXZWJmZWVkc0Zyb21Vbml2ZXJzYWxMaW5rKHN0cmluZykpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFxuXHRcdCAqL1xuXHRcdGFzeW5jIGZ1bmN0aW9uIGZvbGxvd1dlYmZlZWRzRnJvbVVuaXZlcnNhbExpbmsodXJsOiBzdHJpbmcpXG5cdFx0e1xuXHRcdFx0Y29uc3Qgd2ViZmVlZFVybHMgPSBwYXJzZVVuaXZlcnNhbEFwcExpbmsodXJsKTtcblx0XHRcdGlmICh3ZWJmZWVkVXJscylcblx0XHRcdFx0YXdhaXQgZm9sbG93V2ViZmVlZHMod2ViZmVlZFVybHMpO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRmdW5jdGlvbiBwYXJzZVVuaXZlcnNhbEFwcExpbmsodXJsVGV4dDogc3RyaW5nKVxuXHRcdHtcblx0XHRcdGlmICghdXJsVGV4dC5zdGFydHNXaXRoKHVuaXZlcnNhbEFwcExpbmtQcmVmaXgpKVxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFxuXHRcdFx0Y29uc3QgcXVlcnlQb3MgPSB1cmxUZXh0LmluZGV4T2YoXCI/XCIpO1xuXHRcdFx0aWYgKHF1ZXJ5UG9zIDwgMClcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcblx0XHRcdGNvbnN0IHF1ZXJ5ID0gdXJsVGV4dC5zbGljZShxdWVyeVBvcyArIDEpO1xuXHRcdFx0Y29uc3QgdXJscyA9IHF1ZXJ5XG5cdFx0XHRcdC5zcGxpdChcIiZcIilcblx0XHRcdFx0Lm1hcChzID0+IGRlY29kZVVSSUNvbXBvbmVudChzKSlcblx0XHRcdFx0Lm1hcChzID0+IFV0aWwudHJ5UGFyc2VVcmwocykgPyBzIDogbnVsbClcblx0XHRcdFx0LmZpbHRlcigocyk6IHMgaXMgc3RyaW5nID0+ICEhcylcblx0XHRcdFx0Lm1hcChzID0+IHMudHJpbSgpKTtcblx0XHRcdFxuXHRcdFx0aWYgKHVybHMubGVuZ3RoID09PSAwKVxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIHVybHM7XG5cdFx0fVxuXHRcdFxuXHRcdGNvbnN0IHVuaXZlcnNhbEFwcExpbmtQcmVmaXggPSBcImh0dHBzOi8vZGVlcGxpbmsuc3F1YXJlc2FwcC5vcmcvZm9sbG93L1wiO1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFxuXHRcdCAqL1xuXHRcdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBmb2xsb3dXZWJmZWVkcyh3ZWJmZWVkVXJsczogc3RyaW5nIHwgc3RyaW5nW10pXG5cdFx0e1xuXHRcdFx0Y29uc3QgZmVlZERldGFpbHM6IElGZWVkRGV0YWlsW10gPSBbXTtcblx0XHRcdFxuXHRcdFx0Zm9yIChjb25zdCB3ZWJmZWVkVXJsIG9mIFV0aWwudG9BcnJheSh3ZWJmZWVkVXJscykpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHVybHMgPSBhd2FpdCBXZWJmZWVkLmRvd25sb2FkSW5kZXgod2ViZmVlZFVybCk7XG5cdFx0XHRcdGlmICghdXJscylcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFxuXHRcdFx0XHRjb25zdCBjaGVja3N1bSA9IGF3YWl0IFdlYmZlZWQucGluZyh3ZWJmZWVkVXJsKTtcblx0XHRcdFx0aWYgKCFjaGVja3N1bSlcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFxuXHRcdFx0XHRjb25zdCBmZWVkRGV0YWlsID0gYXdhaXQgV2ViZmVlZC5kb3dubG9hZERldGFpbHMod2ViZmVlZFVybCkgfHwge307XG5cdFx0XHRcdGNvbnN0IGZlZWQgPSBhd2FpdCBEYXRhLndyaXRlRmVlZChmZWVkRGV0YWlsLCB7IGNoZWNrc3VtLCB1cmw6IHdlYmZlZWRVcmwgfSk7XG5cdFx0XHRcdGF3YWl0IERhdGEud3JpdGVGZWVkVXBkYXRlcyhmZWVkLCB1cmxzKTtcblx0XHRcdFx0ZmVlZERldGFpbHMucHVzaChmZWVkKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0aWYgKGZlZWREZXRhaWxzLmxlbmd0aCA9PT0gMClcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XG5cdFx0XHRpZiAoIURhdGEuaGFzU2Nyb2xscygpKVxuXHRcdFx0XHRhd2FpdCBEYXRhLndyaXRlU2Nyb2xsKHsgZmVlZHM6IGZlZWREZXRhaWxzIH0pO1xuXHRcdFx0XG5cdFx0XHRkaXNwYXRjaChcInNxdWFyZXM6Zm9sbG93XCIsIHsgZmVlZHM6IGZlZWREZXRhaWxzIH0pO1xuXHRcdFx0XG5cdFx0XHRpZiAoQ0FQQUNJVE9SKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCB0ZXh0ID0gd2ViZmVlZFVybHMubGVuZ3RoID4gMSA/XG5cdFx0XHRcdFx0U3RyaW5ncy5ub3dGb2xsb3dpbmdDb3VudC5yZXBsYWNlKFwiP1wiLCBcIlwiICsgd2ViZmVlZFVybHMubGVuZ3RoKSA6XG5cdFx0XHRcdFx0U3RyaW5ncy5ub3dGb2xsb3dpbmcgKyBcIiBcIiArIGZlZWREZXRhaWxzWzBdLmF1dGhvcjtcblx0XHRcdFx0XG5cdFx0XHRcdGF3YWl0IFRvYXN0LnNob3coe1xuXHRcdFx0XHRcdHBvc2l0aW9uOiBcImNlbnRlclwiLFxuXHRcdFx0XHRcdGR1cmF0aW9uOiBcImxvbmdcIixcblx0XHRcdFx0XHR0ZXh0XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuIiwiXG5uYW1lc3BhY2UgU3F1YXJlc1xue1xuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIEZvcmVncm91bmRGZXRjaGVyXG5cdHtcblx0XHQvKiogKi9cblx0XHRjb25zdHJ1Y3RvcigpIHsgfVxuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIEdldHMgd2hldGhlciB0aGVyZSBpcyBhIGZldGNoIG9wZXJhdGlvbiBiZWluZyBjYXJyaWVkIG91dC5cblx0XHQgKi9cblx0XHRnZXQgaXNGZXRjaGluZygpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICEhdGhpcy5mZWVkSXRlcmF0b3I7XG5cdFx0fVxuXHRcdHByaXZhdGUgZmVlZEl0ZXJhdG9yOiBBc3luY0dlbmVyYXRvcjxJRmVlZERldGFpbCwgdm9pZCwgdW5rbm93bj4gfCBudWxsID0gbnVsbDtcblx0XHRcblx0XHQvKiogKi9cblx0XHRhc3luYyBmZXRjaCgpXG5cdFx0e1xuXHRcdFx0dGhpcy5zdG9wRmV0Y2goKTtcblx0XHRcdHRoaXMuZmVlZEl0ZXJhdG9yID0gRGF0YS5yZWFkRmVlZERldGFpbHMoKTtcblx0XHRcdGNvbnN0IHRocmVhZHM6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuXHRcdFx0Y29uc3QgbW9kaWZpZWRGZWVkczogSUZlZWREZXRhaWxbXSA9IFtdO1xuXHRcdFx0XG5cdFx0XHRmb3IgKGxldCBpID0gLTE7ICsraSA8IG1heEZldGNoVGhyZWFkczspXG5cdFx0XHR7XG5cdFx0XHRcdC8vIENyZWF0ZXMgYSBcInRocmVhZFwiIHRoYXQgYXR0ZW1wdHMgdG8gcGluZ1xuXHRcdFx0XHQvLyB0aGUgVVJMIG9mIHRoZSBuZXh0IGZlZWQgaW4gdGhlIGxpbmUuXG5cdFx0XHRcdHRocmVhZHMucHVzaChuZXcgUHJvbWlzZTx2b2lkPihhc3luYyByID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRmb3IgKDs7KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnN0IGZlZWRJdGVyYXRpb24gPSBhd2FpdCB0aGlzLmZlZWRJdGVyYXRvcj8ubmV4dCgpO1xuXHRcdFx0XHRcdFx0aWYgKCFmZWVkSXRlcmF0aW9uIHx8IGZlZWRJdGVyYXRpb24uZG9uZSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly8gSWYgaSBpcyBsZXNzIHRoYW4gdGhlIG51bWJlciBvZiBcInRocmVhZHNcIiBydW5uaW5nLFxuXHRcdFx0XHRcdFx0XHQvLyBhbmQgdGhlIGl0ZXJhdG9yIGhhcyBydW4gb3V0LCB0aGF0IG1lYW5zIHRoZXJlJ3Ncblx0XHRcdFx0XHRcdFx0Ly8gZmV3ZXIgZmVlZHMgdGhhbiB0aGVyZSBhcmUgdGhyZWFkcyAoc28gYXZvaWRcblx0XHRcdFx0XHRcdFx0Ly8gdGVybWluYXRpb24gaW4gdGhpcyBjYXNlKS5cblx0XHRcdFx0XHRcdFx0aWYgKGkgPj0gbWF4RmV0Y2hUaHJlYWRzKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5mZWVkSXRlcmF0b3IgPSBudWxsO1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMuYWJvcnRDb250cm9sbGVycy5jbGVhcigpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcigpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRjb25zdCBmZWVkID0gZmVlZEl0ZXJhdGlvbi52YWx1ZTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0Y29uc3QgY2hlY2tzdW0gPSBhd2FpdCBXZWJmZWVkLnBpbmcoZmVlZC51cmwpO1xuXHRcdFx0XHRcdFx0aWYgKGNoZWNrc3VtICE9PSBmZWVkLmNoZWNrc3VtKVxuXHRcdFx0XHRcdFx0XHRtb2RpZmllZEZlZWRzLnB1c2goZmVlZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGF3YWl0IFByb21pc2UuYWxsKHRocmVhZHMpO1xuXHRcdFx0YXdhaXQgRmV0Y2hlci51cGRhdGVNb2RpZmllZEZlZWRzKG1vZGlmaWVkRmVlZHMpO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRzdG9wRmV0Y2goKVxuXHRcdHtcblx0XHRcdGZvciAoY29uc3QgYWMgb2YgdGhpcy5hYm9ydENvbnRyb2xsZXJzKVxuXHRcdFx0XHRhYy5hYm9ydCgpO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmFib3J0Q29udHJvbGxlcnMuY2xlYXIoKTtcblx0XHRcdHRoaXMuZmVlZEl0ZXJhdG9yPy5yZXR1cm4oKTtcblx0XHR9XG5cdFx0XG5cdFx0cHJpdmF0ZSByZWFkb25seSBhYm9ydENvbnRyb2xsZXJzID0gbmV3IFNldDxBYm9ydENvbnRyb2xsZXI+KCk7XG5cdH1cblx0XG5cdGNvbnN0IG1heEZldGNoVGhyZWFkcyA9IDEwO1xufVxuIiwiXG5uYW1lc3BhY2UgU3F1YXJlc1xue1xuXHQvKipcblx0ICogUmVwcmVzZW50cyB0aGUgSUZlZWQgb2JqZWN0LCBhcyBpdCBpcyBzdG9yZWQgb24gZGlzay5cblx0ICovXG5cdGV4cG9ydCBpbnRlcmZhY2UgSURpc2tGZWVkRGV0YWlsXG5cdHtcblx0XHQvKipcblx0XHQgKiBTdG9yZXMgdGhlIFVSTCBvZiB0aGUgdGV4dCBmaWxlIHRoYXQgY29udGFpbnMgdGhlIGZlZWQgaW5mb3JtYXRpb24uXG5cdFx0ICovXG5cdFx0dXJsOiBzdHJpbmc7XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogU3RvcmVzIHRoZSBsb2NhdGlvbiBvZiB0aGUgYXZhdGFyIGFzc29jaWF0ZWQgd2l0aCB0aGUgZmVlZCwgd2hpY2ggaXNcblx0XHQgKiBleHRyYWN0ZWQgZnJvbSB0aGUgc3RhbmRhcmQgPGxpbmsgcmVsPVwiaWNvblwiPiB0YWcuXG5cdFx0ICovXG5cdFx0aWNvbjogc3RyaW5nO1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFN0b3JlcyB0aGUgaW5mb3JtYXRpb24gdGhhdCB3YXMgZXh0cmFjdGVkIGZyb20gdGhlIDxtZXRhIG5hbWU9XCJhdXRob3JcIj5cblx0XHQgKiB0YWcgdGhhdCB3YXMgZm91bmQgb24gdGhlIFVSTCB0aGF0IHJlZmVyZW5jZWQgdGhlIGZlZWQuXG5cdFx0ICovXG5cdFx0YXV0aG9yOiBzdHJpbmc7XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogU3RvcmVzIGEgZGVzY3JpcHRpb24gb2YgdGhlIGZlZWQsIHdoaWNoIGlzIHR5cGljYWxseSB0aGUgbmFtZSBvZiB0aGUgcGVyc29uXG5cdFx0ICogb3Igb3JnYW5pemF0aW9uIHRoYXQgb3ducyB0aGUgZmVlZC5cblx0XHQgKi9cblx0XHRkZXNjcmlwdGlvbjogc3RyaW5nO1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFN0b3JlcyBhIHZhbHVlIHdoaWNoIGNhbiBiZSB1c2VkIGZvciBjb21wYXJpc29uIHB1cnBvc2VzIHRvIHNlZSBpZiBhXG5cdFx0ICogZmVlZCBoYXMgYmVlbiB1cGRhdGVkLlxuXHRcdCAqL1xuXHRcdGNoZWNrc3VtOiBzdHJpbmc7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRleHBvcnQgaW50ZXJmYWNlIElGZWVkRGV0YWlsIGV4dGVuZHMgSURpc2tGZWVkRGV0YWlsXG5cdHtcblx0XHQvKiogKi9cblx0XHRrZXk6IG51bWJlcjtcblx0fVxufVxuIiwiXG5uYW1lc3BhY2UgU3F1YXJlc1xue1xuXHQvKiogKi9cblx0ZXhwb3J0IGludGVyZmFjZSBJQWJzdHJhY3RQb3N0XG5cdHtcblx0XHQvKipcblx0XHQgKiBcblx0XHQgKi9cblx0XHR2aXNpdGVkOiBib29sZWFuO1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFN0b3JlcyB0aGUgcGF0aCBvZiB0aGUgZmVlZCwgcmVsYXRpdmUgdG8gdGhlIFVSTCBvZiB0aGUgZmVlZCB0ZXh0IGZpbGUuXG5cdFx0ICovXG5cdFx0cGF0aDogc3RyaW5nO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGludGVyZmFjZSBJRGlza1Bvc3QgZXh0ZW5kcyBJQWJzdHJhY3RQb3N0XG5cdHtcblx0XHQvKipcblx0XHQgKiBTdG9yZXMgdGhlIElEIG9mIHRoZSBmZWVkIHRvIHdoaWNoIHRoaXMgcG9zdCBiZWxvbmdzLlxuXHRcdCAqL1xuXHRcdGZlZWQ6IG51bWJlcjtcblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVBvc3QgZXh0ZW5kcyBJQWJzdHJhY3RQb3N0XG5cdHtcblx0XHQvKipcblx0XHQgKiBcblx0XHQgKi9cblx0XHRrZXk6IG51bWJlcjtcblx0XHRcblx0XHQvKipcblx0XHQgKiBBIHJlZmVyZW5jZSB0byB0aGUgZmVlZFxuXHRcdCAqL1xuXHRcdGZlZWQ6IElGZWVkRGV0YWlsO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGludGVyZmFjZSBJUG9zdEZpbGVcblx0e1xuXHRcdFtrZXk6IG51bWJlcl06IElEaXNrUG9zdFxuXHR9XG59XG4iLCJcbm5hbWVzcGFjZSBTcXVhcmVzXG57XG5cdC8qKiAqL1xuXHRleHBvcnQgaW50ZXJmYWNlIElBYnN0cmFjdFNjcm9sbFxuXHR7XG5cdFx0YW5jaG9ySW5kZXg6IG51bWJlcjtcblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBpbnRlcmZhY2UgSURpc2tTY3JvbGwgZXh0ZW5kcyBJQWJzdHJhY3RTY3JvbGxcblx0e1xuXHRcdGZlZWRzOiBudW1iZXJbXTtcblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVNjcm9sbCBleHRlbmRzIElBYnN0cmFjdFNjcm9sbFxuXHR7XG5cdFx0a2V5OiBudW1iZXI7XG5cdFx0ZmVlZHM6IHJlYWRvbmx5IElGZWVkRGV0YWlsW107XG5cdH1cbn1cbiIsIlxubmFtZXNwYWNlIFNxdWFyZXNcbntcblx0ZXhwb3J0IG5hbWVzcGFjZSBVdGlsXG5cdHtcblx0XHQvKipcblx0XHQgKiBSZXR1cm5zIHRoZSBjdXJyZW50IGRhdGUgaW4gdGlja3MgZm9ybSwgYnV0IHdpdGggYW55IGluY3JlbWVudGF0aW9uXG5cdFx0ICogbmVjZXNzYXJ5IHRvIGF2b2lkIHJldHVybmluZyB0aGUgc2FtZSB0aWNrcyB2YWx1ZSB0d2ljZS5cblx0XHQgKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gZ2V0U2FmZVRpY2tzKClcblx0XHR7XG5cdFx0XHRsZXQgbm93ID0gRGF0ZS5ub3coKTtcblx0XHRcdFxuXHRcdFx0aWYgKG5vdyA8PSBsYXN0VGlja3MpXG5cdFx0XHRcdG5vdyA9ICsrbGFzdFRpY2tzO1xuXHRcdFx0XG5cdFx0XHRsYXN0VGlja3MgPSBub3c7XG5cdFx0XHRyZXR1cm4gbm93O1xuXHRcdH1cblx0XHRsZXQgbGFzdFRpY2tzID0gMDtcblx0XHRcblx0XHQvKipcblx0XHQgKiBSZXR1cm5zIHRoZSBmdWxseS1xdWFsaWZpZWQgVVJMIHRvIHRoZSBpY29uIGltYWdlXG5cdFx0ICogc3BlY2lmaWVkIGluIHRoZSBzcGVjaWZpZWQgZmVlZC5cblx0XHQgKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gZ2V0SWNvblVybChmZWVkOiBJRmVlZERldGFpbClcblx0XHR7XG5cdFx0XHRjb25zdCBmb2xkZXIgPSBXZWJmZWVkLmdldEZvbGRlck9mKGZlZWQudXJsKSB8fCBcIlwiO1xuXHRcdFx0cmV0dXJuIG5ldyBVUkwoZmVlZC5pY29uLCBmb2xkZXIpLnRvU3RyaW5nKCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFNhZmVseSBwYXJzZXMgYSBzdHJpbmcgSlNPTiBpbnRvIGFuIG9iamVjdC5cblx0XHQgKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gdHJ5UGFyc2VKc29uPFQgZXh0ZW5kcyBvYmplY3QgPSBvYmplY3Q+KGpzb25UZXh0OiBzdHJpbmcpOiBUIHwgbnVsbFxuXHRcdHtcblx0XHRcdHRyeVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gSlNPTi5wYXJzZShqc29uVGV4dCk7XG5cdFx0XHR9XG5cdFx0XHRjYXRjaCAoZSkgeyB9XG5cdFx0XHRcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0XHRcblx0XHQvKipcblx0XHQgKiBQYXJzZXMgdGhlIHNwZWNpZmllZCBVUkwgc3RyaW5nIGFuZCByZXR1cm5zIGEgVVJMIG9iamVjdCxcblx0XHQgKiBvciBudWxsIGlmIHRoZSBVUkwgZmFpbHMgdG8gcGFyc2UuXG5cdFx0ICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIHRyeVBhcnNlVXJsKHVybDogc3RyaW5nKVxuXHRcdHtcblx0XHRcdHRyeVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gbmV3IFVSTCh1cmwpO1xuXHRcdFx0fVxuXHRcdFx0Y2F0Y2ggKGUpIHsgfVxuXHRcdFx0XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogUmV0dXJucyB0aGUgdmFsdWUgd3JhcHBlZCBpbiBhbiBhcnJheSwgaWYgaXQgaXMgbm90IGFscmVhZHlcblx0XHQgKiBhbiBhcnJheSB0byBiZWdpbiB3aXRoLlxuXHRcdCAqL1xuXHRcdGV4cG9ydCBmdW5jdGlvbiB0b0FycmF5PFQ+KHZhbHVlOiBUIHwgVFtdKTogVFtdXG5cdFx0e1xuXHRcdFx0cmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUgOiBbdmFsdWVdO1xuXHRcdH1cblx0XHRcblx0XHQvKipcblx0XHQgKiBSZXR1cm5zIHRoZSBlbnZpcm9ubWVudC1zcGVjaWZpYyBwYXRoIHRvIHRoZSBhcHBsaWNhdGlvbiBkYXRhIGZvbGRlci5cblx0XHQgKi9cblx0XHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGF0YUZvbGRlcigpXG5cdFx0e1xuXHRcdFx0aWYgKFRBVVJJKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBkaXIgPSBhd2FpdCBUYXVyaS5wYXRoLmFwcERhdGFEaXIoKTtcblx0XHRcdFx0cmV0dXJuIG5ldyBGaWxhKGRpcik7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChFTEVDVFJPTilcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgZmlsYSA9IG5ldyBGaWxhKF9fZGlybmFtZSkuZG93bihERUJVRyA/IFwiK2RhdGFcIiA6IFwiZGF0YVwiKTtcblx0XHRcdFx0YXdhaXQgZmlsYS53cml0ZURpcmVjdG9yeSgpO1xuXHRcdFx0XHRyZXR1cm4gZmlsYTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKENBUEFDSVRPUilcblx0XHRcdHtcblx0XHRcdFx0Ly8gVGhlc2UgdmFsdWVzIGFyZSBkb2N1bWVudGVkIGhlcmU6XG5cdFx0XHRcdC8vIGh0dHBzOi8vY2FwYWNpdG9yanMuY29tL2RvY3MvYXBpcy9maWxlc3lzdGVtI2RpcmVjdG9yeVxuXHRcdFx0XHRjb25zdCBwYXRoID0gREVCVUcgPyBcIkRPQ1VNRU5UU1wiIDogXCJEQVRBXCI7XG5cdFx0XHRcdHJldHVybiBuZXcgRmlsYShwYXRoKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKERFTU8pXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBuZXcgRmlsYSgpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWRcIik7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkQ2xpcGJvYXJkKCk6IFByb21pc2U8c3RyaW5nPlxuXHRcdHtcblx0XHRcdGlmIChFTEVDVFJPTilcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgZWxlY3Ryb24gPSByZXF1aXJlKFwiZWxlY3Ryb25cIik7XG5cdFx0XHRcdHJldHVybiBlbGVjdHJvbi5jbGlwYm9hcmQucmVhZFRleHQoKSB8fCBcIlwiO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoVEFVUkkpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHRleHQgPSBhd2FpdCBUYXVyaS5jbGlwYm9hcmQucmVhZFRleHQoKTtcblx0XHRcdFx0cmV0dXJuIHRleHQgfHwgXCJcIjtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKENBUEFDSVRPUilcblx0XHRcdHtcblx0XHRcdFx0dHJ5XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCB0ZXh0ID0gYXdhaXQgQ2FwQ2xpcGJvYXJkLnJlYWQoKTtcblx0XHRcdFx0XHRyZXR1cm4gdGV4dC52YWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXRjaCAoZSkgeyB9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlQ2xpcGJvYXJkKHRleHQ6IHN0cmluZylcblx0XHR7XG5cdFx0XHRpZiAoQ0FQQUNJVE9SKVxuXHRcdFx0e1xuXHRcdFx0XHRDYXBDbGlwYm9hcmQud3JpdGUoeyBzdHJpbmc6IHRleHQgfSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFJlbW92ZXMgcHJvYmxlbWF0aWMgQ1NTIGF0dHJpYnV0ZXMgZnJvbSB0aGUgc3BlY2lmaWVkIHNlY3Rpb24gdGFnLFxuXHRcdCAqIGFuZCBlbnN1cmVzIHRoYXQgbm8gZXh0ZXJuYWwgQ1NTIGlzIG1vZGlmeWluZyBpdHMgZGlzcGxheSBwcm9wZXJ0XG5cdFx0ICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIGdldFNlY3Rpb25TYW5pdGl6YXRpb25Dc3MoKTogUmF3LlN0eWxlXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0cG9zaXRpb246IFwicmVsYXRpdmUgIVwiLFxuXHRcdFx0XHR6SW5kZXg6IDAsXG5cdFx0XHRcdHdpZHRoOiBcImF1dG8gIVwiLFxuXHRcdFx0XHRoZWlnaHQ6IFwiMTAwJSAhXCIsXG5cdFx0XHRcdG1hcmdpbjogXCIwICFcIixcblx0XHRcdFx0Ym94U2l6aW5nOiBcImJvcmRlci1ib3ggIVwiLFxuXHRcdFx0XHRkaXNwbGF5OiBcImJsb2NrICFcIixcblx0XHRcdFx0ZmxvYXQ6IFwibm9uZSAhXCIsXG5cdFx0XHRcdGNsaXBQYXRoOiBcImluc2V0KDAgMCkgIVwiLFxuXHRcdFx0XHRtYXNrOiBcIm5vbmUgIVwiLFxuXHRcdFx0XHRvcGFjaXR5OiBcIjEgIVwiLFxuXHRcdFx0XHR0cmFuc2Zvcm06IFwibm9uZSAhXCIsXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRcblx0XHQvKipcblx0XHQgKiBcblx0XHQgKi9cblx0XHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gb3BlbldlYkxpbmsodXJsOiBzdHJpbmcpXG5cdFx0e1xuXHRcdFx0aWYgKENBUEFDSVRPUilcblx0XHRcdHtcblx0XHRcdFx0YXdhaXQgQXBwTGF1bmNoZXIub3BlblVybCh7IHVybCB9KTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKFRBVVJJKVxuXHRcdFx0e1xuXHRcdFx0XHRcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0d2luZG93Lm9wZW4odXJsLCBcIl9ibGFua1wiKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiIsIlxubmFtZXNwYWNlIFNxdWFyZXNcbntcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBEb3RzSGF0XG5cdHtcblx0XHRyZWFkb25seSBoZWFkO1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGNvbnN0cnVjdG9yKClcblx0XHR7XG5cdFx0XHR0aGlzLmhlYWQgPSByYXcuZGl2KFxuXHRcdFx0XHRTdHlsZS5iYWNrZ3JvdW5kT3ZlcmxheSgpLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0d2lkdGg6IFwiZml0LWNvbnRlbnRcIixcblx0XHRcdFx0XHRwYWRkaW5nOiBcIjVweCAxMHB4XCIsXG5cdFx0XHRcdFx0Ym9yZGVyUmFkaXVzOiBcIjEwMDBweFwiLFxuXHRcdFx0XHRcdHRleHRBbGlnbjogXCJjZW50ZXJcIixcblx0XHRcdFx0fSxcblx0XHRcdFx0cmF3LmNzcyhcIiA+IFNQQU5cIiwge1xuXHRcdFx0XHRcdGRpc3BsYXk6IFwiaW5saW5lLWJsb2NrXCIsXG5cdFx0XHRcdFx0d2lkdGg6IFwiMTBweFwiLFxuXHRcdFx0XHRcdGhlaWdodDogXCIxMHB4XCIsXG5cdFx0XHRcdFx0bWFyZ2luOiBcIjNweFwiLFxuXHRcdFx0XHRcdGJvcmRlclJhZGl1czogXCIxMDAlXCIsXG5cdFx0XHRcdFx0YmFja2dyb3VuZENvbG9yOiBcInJnYmEoMTI4LCAxMjgsIDEyOClcIixcblx0XHRcdFx0fSksXG5cdFx0XHRcdHJhdy5jc3MoXCIgPiBTUEFOLlwiICsgaGlnaGxpZ2h0Q2xhc3MsIHtcblx0XHRcdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IFwiaHNsKDIwNSwgMTAwJSwgNTAlKVwiLFxuXHRcdFx0XHR9KVxuXHRcdFx0KTtcblx0XHRcdFxuXHRcdFx0SGF0LndlYXIodGhpcyk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGluc2VydChjb3VudDogbnVtYmVyLCBhdCA9IHRoaXMuaGVhZC5jaGlsZEVsZW1lbnRDb3VudClcblx0XHR7XG5cdFx0XHRjb25zdCBzcGFuczogSFRNTFNwYW5FbGVtZW50W10gPSBbXTtcblx0XHRcdFxuXHRcdFx0Zm9yIChsZXQgaSA9IC0xOyArK2kgPCBjb3VudDspXG5cdFx0XHRcdHNwYW5zLnB1c2gocmF3LnNwYW4oKSk7XG5cdFx0XHRcblx0XHRcdGF0ID0gTWF0aC5tYXgoMCwgYXQpO1xuXHRcdFx0YXQgPSBNYXRoLm1pbih0aGlzLmhlYWQuY2hpbGRFbGVtZW50Q291bnQsIGF0KTtcblx0XHRcdFxuXHRcdFx0aWYgKGF0ID49IHRoaXMuaGVhZC5jaGlsZEVsZW1lbnRDb3VudClcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5oZWFkLmFwcGVuZCguLi5zcGFucyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGVsZW1lbnRzID0gQXJyYXkuZnJvbSh0aGlzLmhlYWQuY2hpbGRyZW4pO1xuXHRcdFx0XHRlbGVtZW50c1thdF0uYmVmb3JlKC4uLnNwYW5zKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0aGlnaGxpZ2h0KGluZGV4OiBudW1iZXIpXG5cdFx0e1xuXHRcdFx0aW5kZXggPSBNYXRoLm1heCgwLCBpbmRleCk7XG5cdFx0XHRpbmRleCA9IE1hdGgubWluKHRoaXMuaGVhZC5jaGlsZEVsZW1lbnRDb3VudCAtIDEsIGluZGV4KTtcblx0XHRcdGNvbnN0IGNoaWxkcmVuID0gQXJyYXkuZnJvbSh0aGlzLmhlYWQuY2hpbGRyZW4pO1xuXHRcdFx0Y2hpbGRyZW4uZm9yRWFjaChlID0+IGUuY2xhc3NMaXN0LnJlbW92ZShoaWdobGlnaHRDbGFzcykpO1xuXHRcdFx0Y2hpbGRyZW5baW5kZXhdLmNsYXNzTGlzdC5hZGQoaGlnaGxpZ2h0Q2xhc3MpO1xuXHRcdH1cblx0fVxuXHRcblx0Y29uc3QgaGlnaGxpZ2h0Q2xhc3MgPSBcImhpZ2hsaWdodFwiO1xufVxuIiwiXG5uYW1lc3BhY2UgU3F1YXJlc1xue1xuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIEZlZWRNZXRhSGF0XG5cdHtcblx0XHRyZWFkb25seSBoZWFkO1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGNvbnN0cnVjdG9yKGRhdGE6IElGZWVkRGV0YWlsKVxuXHRcdHtcblx0XHRcdGNvbnN0IGljb25VcmwgPSBVdGlsLmdldEljb25VcmwoZGF0YSk7XG5cdFx0XHRjb25zdCBhdXRob3IgPSBkYXRhLmF1dGhvciB8fCBTdHJpbmdzLnVua25vd25BdXRob3I7XG5cdFx0XHRjb25zdCBpc0ZvbGxvd2luZyA9IGRhdGEua2V5ID4gMDtcblx0XHRcdFxuXHRcdFx0dGhpcy5oZWFkID0gcmF3LmRpdihcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRpc3BsYXk6IFwiZmxleFwiLFxuXHRcdFx0XHRcdGhlaWdodDogXCIxMDAlXCIsXG5cdFx0XHRcdFx0anVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG5cdFx0XHRcdFx0YWxpZ25Db250ZW50OiBcImNlbnRlclwiLFxuXHRcdFx0XHRcdGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJhdy5kaXYoXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZGlzcGxheTogXCJmbGV4XCIsXG5cdFx0XHRcdFx0XHR3aWR0aDogXCIxNDBweFwiLFxuXHRcdFx0XHRcdFx0cGFkZGluZzogXCIyMHB4XCIsXG5cdFx0XHRcdFx0XHRqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcblx0XHRcdFx0XHRcdGFsaWduQ29udGVudDogXCJjZW50ZXJcIixcblx0XHRcdFx0XHRcdGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRyYXcuZGl2KFxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHR3aWR0aDogXCIxMDAlXCIsXG5cdFx0XHRcdFx0XHRcdGFzcGVjdFJhdGlvOiBcIjEvMVwiLFxuXHRcdFx0XHRcdFx0XHRib3JkZXJSYWRpdXM6IFwiMTAwJVwiLFxuXHRcdFx0XHRcdFx0XHRiYWNrZ3JvdW5kSW1hZ2U6IGB1cmwoJHtpY29uVXJsfSlgLFxuXHRcdFx0XHRcdFx0XHRiYWNrZ3JvdW5kU2l6ZTogXCJjb3ZlclwiXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0KSxcblx0XHRcdFx0cmF3LmRpdihcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRmbGV4OiBcIjEgMFwiLFxuXHRcdFx0XHRcdFx0Zm9udFNpemU6IFwiMThweFwiLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cmF3LmNzcyhcIiA+IDpub3QoOmZpcnN0LWNoaWxkKVwiLCB7XG5cdFx0XHRcdFx0XHRtYXJnaW5Ub3A6IFwiMTBweFwiXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0cmF3LmRpdihcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Zm9udFdlaWdodDogNzAwLFxuXHRcdFx0XHRcdFx0XHRkaXNwbGF5OiBcIi13ZWJraXQtYm94XCIsXG5cdFx0XHRcdFx0XHRcdHdlYmtpdEJveE9yaWVudDogXCJ2ZXJ0aWNhbFwiLFxuXHRcdFx0XHRcdFx0XHR3ZWJraXRMaW5lQ2xhbXA6IFwiMVwiLFxuXHRcdFx0XHRcdFx0XHRvdmVyZmxvdzogXCJoaWRkZW5cIixcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRyYXcudGV4dChhdXRob3IpLFxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0ISFkYXRhLmRlc2NyaXB0aW9uICYmIHJhdy5kaXYoXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGZvbnRXZWlnaHQ6IDUwMCxcblx0XHRcdFx0XHRcdFx0ZGlzcGxheTogXCItd2Via2l0LWJveFwiLFxuXHRcdFx0XHRcdFx0XHR3ZWJraXRCb3hPcmllbnQ6IFwidmVydGljYWxcIixcblx0XHRcdFx0XHRcdFx0d2Via2l0TGluZUNsYW1wOiBcIjJcIixcblx0XHRcdFx0XHRcdFx0b3ZlcmZsb3c6IFwiaGlkZGVuXCIsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0cmF3LnRleHQoZGF0YS5kZXNjcmlwdGlvbilcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHRoaXMucmVuZGVyQnV0dG9uKFN0cmluZ3Muc2hhcmUsICgpID0+IHt9KSxcblx0XHRcdFx0XHRpc0ZvbGxvd2luZyAmJiAoZSA9PiB0aGlzLnJlbmRlckJ1dHRvbihTdHJpbmdzLnVuZm9sbG93LCAoKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdEhhdC5vdmVyKHRoaXMsIFBhZ2VIYXQpLmhlYWQuc2Nyb2xsQnkoeyB0b3A6IC0xIH0pO1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2goXCJzcXVhcmVzOnVuZm9sbG93XCIsIHsgZmVlZEtleTogZGF0YS5rZXkgfSk7XG5cdFx0XHRcdFx0XHRVSS5mYWRlKGUpO1xuXHRcdFx0XHRcdH0pKSxcblx0XHRcdFx0KSxcblx0XHRcdCk7XG5cdFx0XHRcblx0XHRcdEhhdC53ZWFyKHRoaXMpO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRwcml2YXRlIHJlbmRlckJ1dHRvbihsYWJlbDogc3RyaW5nLCBjbGlja0ZuOiAoKSA9PiB2b2lkKVxuXHRcdHtcblx0XHRcdHJldHVybiBXaWRnZXQuZmlsbEJ1dHRvbihcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG1hcmdpblJpZ2h0OiBcIjE1cHhcIixcblx0XHRcdFx0fSxcblx0XHRcdFx0cmF3LnRleHQobGFiZWwpLFxuXHRcdFx0XHRyYXcub24oXCJjbGlja1wiLCAoKSA9PiBjbGlja0ZuKCkpXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxufVxuIiwiXG5uYW1lc3BhY2UgU3F1YXJlc1xue1xuXHQvKiogKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGNvdmVyRm9sbG93ZXJzSGF0KClcblx0e1xuXHRcdFNxdWFyZXMuYXBwZW5kQ3NzUmVzZXQoKTtcblx0XHRjb25zdCBoYXQgPSBuZXcgRm9sbG93ZXJzSGF0KCk7XG5cdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmQoaGF0LmhlYWQpO1xuXHR9XG59XG4iLCJcbm5hbWVzcGFjZSBTcXVhcmVzXG57XG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgRm9sbG93ZXJzSGF0XG5cdHtcblx0XHRyZWFkb25seSBoZWFkO1xuXHRcdHByaXZhdGUgcmVhZG9ubHkgZmVlZEVsZW1lbnRzO1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGNvbnN0cnVjdG9yKClcblx0XHR7XG5cdFx0XHR0aGlzLmhlYWQgPSByYXcuZGl2KFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cGFkZGluZzogXCIyMHB4XCIsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJhdy5vbihcImNvbm5lY3RlZFwiLCAoKSA9PiB0aGlzLmNvbnN0cnVjdCgpKSxcblx0XHRcdFx0cmF3LmRpdihcblx0XHRcdFx0XHR7IG1hcmdpbkJvdHRvbTogXCIyMHB4XCIgfSxcblx0XHRcdFx0XHRTdHlsZS50ZXh0VGl0bGUyKFN0cmluZ3MuZm9sbG93aW5nKSxcblx0XHRcdFx0KSxcblx0XHRcdFx0cmF3Lm9uKGRvY3VtZW50LmJvZHksIFwic3F1YXJlczpmb2xsb3dcIiwgZXYgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRoaXMuaGFuZGxlRm9sbG93KGV2LmRldGFpbC5mZWVkcyk7XG5cdFx0XHRcdH0pLFxuXHRcdFx0XHRyYXcub24oZG9jdW1lbnQuYm9keSwgXCJzcXVhcmVzOnVuZm9sbG93XCIsIGV2ID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aGlzLmhhbmRsZVVuZm9sbG93KGV2LmRldGFpbC5mZWVkS2V5KTtcblx0XHRcdFx0fSksXG5cdFx0XHRcdHRoaXMuZmVlZEVsZW1lbnRzID0gcmF3LmRpdigpXG5cdFx0XHQpO1xuXHRcdFx0XG5cdFx0XHRIYXQud2Vhcih0aGlzKTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cHJpdmF0ZSBoYW5kbGVVbmZvbGxvdyhmZWVkS2V5OiBudW1iZXIpXG5cdFx0e1xuXHRcdFx0Y29uc3QgY2xzID0ga2V5UHJlZml4ICsgZmVlZEtleTtcblx0XHRcdEFycmF5LmZyb20odGhpcy5oZWFkLmNoaWxkcmVuKVxuXHRcdFx0XHQuZmlsdGVyKGUgPT4gZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIGUuY2xhc3NMaXN0LmNvbnRhaW5zKGNscykpXG5cdFx0XHRcdC5tYXAoZSA9PiBlLnJlbW92ZSgpKTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cHJpdmF0ZSBoYW5kbGVGb2xsb3coZmVlZHM6IElGZWVkRGV0YWlsW10pXG5cdFx0e1xuXHRcdFx0Zm9yIChjb25zdCBmZWVkIG9mIGZlZWRzKVxuXHRcdFx0XHR0aGlzLmZlZWRFbGVtZW50cy5wcmVwZW5kKHRoaXMucmVuZGVySWRlbnRpdHkoZmVlZCkpO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRwcml2YXRlIGFzeW5jIGNvbnN0cnVjdCgpXG5cdFx0e1xuXHRcdFx0Zm9yIGF3YWl0IChjb25zdCBmZWVkIG9mIERhdGEucmVhZEZlZWREZXRhaWxzKCkpXG5cdFx0XHRcdHRoaXMuZmVlZEVsZW1lbnRzLmFwcGVuZCh0aGlzLnJlbmRlcklkZW50aXR5KGZlZWQpKTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cHJpdmF0ZSByZW5kZXJJZGVudGl0eShmZWVkOiBJRmVlZERldGFpbClcblx0XHR7XG5cdFx0XHRjb25zdCBpY29uVXJsID0gVXRpbC5nZXRJY29uVXJsKGZlZWQpO1xuXHRcdFx0Y29uc3QgYXV0aG9yID0gZmVlZC5hdXRob3IgfHwgU3RyaW5ncy51bmtub3duQXV0aG9yO1xuXHRcdFx0XG5cdFx0XHRjb25zdCBlID0gcmF3LmRpdihcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRpc3BsYXk6IFwiZmxleFwiLFxuXHRcdFx0XHRcdGFsaWduQ29udGVudDogXCJjZW50ZXJcIixcblx0XHRcdFx0XHRhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuXHRcdFx0XHRcdG1hcmdpbkJvdHRvbTogXCIxMHB4XCIsXG5cdFx0XHRcdFx0cGFkZGluZzogXCIxMHB4XCIsXG5cdFx0XHRcdFx0Zm9udFNpemU6IFwiMTVweFwiLFxuXHRcdFx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDEyOCwgMTI4LCAxMjgsIDAuMjUpXCIsXG5cdFx0XHRcdFx0Ym9yZGVyUmFkaXVzOiBTdHlsZS5ib3JkZXJSYWRpdXNTbWFsbCxcblx0XHRcdFx0fSxcblx0XHRcdFx0a2V5UHJlZml4ICsgZmVlZC5rZXksXG5cdFx0XHRcdHJhdy5kaXYoXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0d2lkdGg6IFwiNTBweFwiLFxuXHRcdFx0XHRcdFx0cGFkZGluZzogXCIxMHB4XCIsXG5cdFx0XHRcdFx0XHRtYXJnaW5SaWdodDogXCIyMHB4XCIsXG5cdFx0XHRcdFx0XHRhc3BlY3RSYXRpbzogXCIxLzFcIixcblx0XHRcdFx0XHRcdGJvcmRlclJhZGl1czogXCIxMDAlXCIsXG5cdFx0XHRcdFx0XHRiYWNrZ3JvdW5kSW1hZ2U6IGB1cmwoJHtpY29uVXJsfSlgLFxuXHRcdFx0XHRcdFx0YmFja2dyb3VuZFNpemU6IFwiY292ZXJcIixcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHQpLFxuXHRcdFx0XHRyYXcuZGl2KFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGZvbnRXZWlnaHQ6IDUwMCxcblx0XHRcdFx0XHRcdGZsZXg6IFwiMSAwXCIsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRyYXcudGV4dChhdXRob3IpXG5cdFx0XHRcdCksXG5cdFx0XHRcdFdpZGdldC5maWxsQnV0dG9uKFxuXHRcdFx0XHRcdHJhdy50ZXh0KFN0cmluZ3MudW5mb2xsb3cpLFxuXHRcdFx0XHRcdHJhdy5vbihcImNsaWNrXCIsIGFzeW5jICgpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2goXCJzcXVhcmVzOnVuZm9sbG93XCIsIHsgZmVlZEtleTogZmVlZC5rZXkgfSk7XG5cdFx0XHRcdFx0XHRhd2FpdCBVSS5jb2xsYXBzZShlKTtcblx0XHRcdFx0XHRcdGUucmVtb3ZlKCk7XG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0XHRcblx0XHRcdHJldHVybiBlO1xuXHRcdH1cblx0fVxuXHRcblx0Y29uc3Qga2V5UHJlZml4ID0gXCJpZDpcIjtcbn1cbiIsIlxubmFtZXNwYWNlIENvdmVyXG57XG5cdC8qKiAqL1xuXHRleHBvcnQgZnVuY3Rpb24gY292ZXJUaWxlckhhdCgpXG5cdHtcblx0XHRTcXVhcmVzLmFwcGVuZENzc1Jlc2V0KCk7XG5cdFx0Y29uc3QgZ3JpZEhhdCA9IG5ldyBTcXVhcmVzLkdyaWRIYXQoKTtcblx0XHRcblx0XHRncmlkSGF0LmhhbmRsZVJlbmRlcihpbmRleCA9PlxuXHRcdHtcblx0XHRcdHJldHVybiBnZW5lcmF0ZUZha2VTY2VuZShcIlBvc3QgXCIgKyBpbmRleCk7XG5cdFx0fSk7XG5cdFx0XG5cdFx0Z3JpZEhhdC5oYW5kbGVTZWxlY3QoKGUsIGluZGV4KSA9PlxuXHRcdHtcblx0XHRcdGNvbnNvbGU7XG5cdFx0fSk7XG5cdFx0XG5cdFx0Y29uc3QgY29udGFpbmVyID0gcmF3LmRpdihcblx0XHRcdHtcblx0XHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHRcdFx0dG9wOiAwLFxuXHRcdFx0XHRsZWZ0OiAwLFxuXHRcdFx0XHRib3R0b206IDAsXG5cdFx0XHRcdHJpZ2h0OiAwLFxuXHRcdFx0XHR3aWR0aDogXCI4MHZ3XCIsXG5cdFx0XHRcdGhlaWdodDogXCI4MHZoXCIsXG5cdFx0XHRcdG1hcmdpbjogXCJhdXRvXCIsXG5cdFx0XHRcdG91dGxpbmU6IFwiMTBweCBzb2xpZCB3aGl0ZVwiLFxuXHRcdFx0fSxcblx0XHRcdGdyaWRIYXRcblx0XHQpO1xuXHRcdFxuXHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kKGNvbnRhaW5lcik7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRmdW5jdGlvbiBnZW5lcmF0ZUZha2VTY2VuZSh0ZXh0OiBzdHJpbmcpXG5cdHtcblx0XHRyZXR1cm4gcmF3LmRpdihcblx0XHRcdHtcblx0XHRcdFx0YmFja2dyb3VuZEltYWdlOiBcImxpbmVhci1ncmFkaWVudCg0NWRlZywgb3JhbmdlLCBjcmltc29uKVwiLFxuXHRcdFx0XHRtaW5IZWlnaHQ6IFwiMTAwdmhcIixcblx0XHRcdH0sXG5cdFx0XHRyYXcuZGl2KFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHRcdFx0XHR0b3A6IDAsXG5cdFx0XHRcdFx0bGVmdDogMCxcblx0XHRcdFx0XHRib3R0b206IDAsXG5cdFx0XHRcdFx0cmlnaHQ6IDAsXG5cdFx0XHRcdFx0bWFyZ2luOiBcImF1dG9cIixcblx0XHRcdFx0XHR3aWR0aDogXCJmaXQtY29udGVudFwiLFxuXHRcdFx0XHRcdGhlaWdodDogXCJmaXQtY29udGVudFwiLFxuXHRcdFx0XHRcdGNvbG9yOiBcIndoaXRlXCIsXG5cdFx0XHRcdFx0Zm9udFNpemU6IFwiMjB2bWluXCIsXG5cdFx0XHRcdFx0Zm9udFdlaWdodDogOTAwLFxuXHRcdFx0XHRcdHRleHRBbGlnbjogXCJjZW50ZXJcIixcblx0XHRcdFx0fSxcblx0XHRcdFx0cmF3LnRleHQodGV4dClcblx0XHRcdClcblx0XHQpO1xuXHR9XG59XG4iLCJcbm5hbWVzcGFjZSBTcXVhcmVzXG57XG5cdC8qKlxuXHQgKiBcblx0ICovXG5cdGV4cG9ydCBjbGFzcyBHcmlkSGF0XG5cdHtcblx0XHQvKiogKi9cblx0XHRyZWFkb25seSBoZWFkO1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByaXZhdGUgcmVhZG9ubHkgY29ybmVyc0VsZW1lbnQ7XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0Y29uc3RydWN0b3IoKVxuXHRcdHtcblx0XHRcdGlmIChzaG93Q2xhc3MgPT09IFwiXCIpXG5cdFx0XHR7XG5cdFx0XHRcdHNob3dDbGFzcyA9IHJhdy5jc3Moe1xuXHRcdFx0XHRcdGRpc3BsYXk6IFwiYmxvY2sgIVwiLFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0bWF5YmVBcHBlbmREZWZhdWx0Q3NzKCk7XG5cdFx0XHRcblx0XHRcdHRoaXMuaGVhZCA9IHJhdy5kaXYoXG5cdFx0XHRcdFN0eWxlLnVuc2VsZWN0YWJsZSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG1pbkhlaWdodDogXCIxMDAlXCIsXG5cdFx0XHRcdFx0b3ZlcmZsb3dZOiBcImF1dG9cIixcblx0XHRcdFx0fSxcblx0XHRcdFx0VUkuc3RyZXRjaCgpLFxuXHRcdFx0XHRyYXcuY3NzKFwiPiAuXCIgKyBDbGFzcy5wb3N0ZXIsIHtcblx0XHRcdFx0XHRkaXNwbGF5OiBcIm5vbmVcIixcblx0XHRcdFx0XHRwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuXHRcdFx0XHRcdHdpZHRoOiBcIjEwMCVcIixcblx0XHRcdFx0XHRoZWlnaHQ6IFwiMTAwJVwiLFxuXHRcdFx0XHRcdG92ZXJmbG93OiBcImhpZGRlblwiLFxuXHRcdFx0XHRcdG91dGxpbmU6IFwiMnB4IHNvbGlkIGJsYWNrXCIsXG5cdFx0XHRcdFx0Li4uU3R5bGUuY2xpY2thYmxlLFxuXHRcdFx0XHR9KSxcblx0XHRcdFx0cmF3Lm9uKFwic2Nyb2xsXCIsICgpID0+IHRoaXMudXBkYXRlUG9zdGVyVmlzaWJpbGl0eSh0cnVlKSksXG5cdFx0XHRcdHJhdy5vbihcImNvbm5lY3RlZFwiLCAoKSA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhpcy5zZXRTaXplSW5uZXIoY2FsY3VsYXRlTmF0dXJhbFNpemUoKSk7XG5cdFx0XHRcdFx0dGhpcy5fd2lkdGggPSB0aGlzLmhlYWQub2Zmc2V0V2lkdGg7XG5cdFx0XHRcdFx0dGhpcy5faGVpZ2h0ID0gdGhpcy5oZWFkLm9mZnNldEhlaWdodDtcblx0XHRcdFx0XHRSZXNpemUud2F0Y2godGhpcy5oZWFkLCAodywgaCkgPT4gW3RoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHRdID0gW3csIGhdKTtcblx0XHRcdFx0XHR0aGlzLnRyeUFwcGVuZFBvc3RlcnMoMyk7XG5cdFx0XHRcdH0pLFxuXHRcdFx0XHRcblx0XHRcdFx0KENBUEFDSVRPUiB8fCBERU1PKSAmJiBbXG5cdFx0XHRcdFx0VUkuY29ybmVyQWJzb2x1dGUoXCJ0bFwiKSxcblx0XHRcdFx0XHRVSS5jb3JuZXJBYnNvbHV0ZShcInRyXCIpLFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHRoaXMuY29ybmVyc0VsZW1lbnQgPSByYXcuc3Bhbihcblx0XHRcdFx0XHRcdFwiY29ybmVycy1lbGVtZW50XCIsXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRpc3BsYXk6IFwiYmxvY2tcIixcblx0XHRcdFx0XHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHRcdFx0XHRcdFx0cG9pbnRlckV2ZW50czogXCJub25lXCIsXG5cdFx0XHRcdFx0XHRcdHRvcDogMCxcblx0XHRcdFx0XHRcdFx0bGVmdDogMCxcblx0XHRcdFx0XHRcdFx0cmlnaHQ6IDAsXG5cdFx0XHRcdFx0XHRcdHpJbmRleDogMixcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRVSS5jb3JuZXJBYnNvbHV0ZShcImJsXCIpLFxuXHRcdFx0XHRcdFx0VUkuY29ybmVyQWJzb2x1dGUoXCJiclwiKSxcblx0XHRcdFx0XHQpXG5cdFx0XHRcdF1cblx0XHRcdCk7XG5cdFx0XHRcblx0XHRcdEhhdC53ZWFyKHRoaXMpO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRoYW5kbGVSZW5kZXIoZm46IFJlbmRlckZuKVxuXHRcdHtcblx0XHRcdHRoaXMucmVuZGVyRm4gPSBmbjtcblx0XHR9XG5cdFx0cHJpdmF0ZSByZW5kZXJGbjogUmVuZGVyRm4gPSAoKSA9PiBudWxsO1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGhhbmRsZVNlbGVjdChmbjogU2VsZWN0Rm4pXG5cdFx0e1xuXHRcdFx0dGhpcy5zZWxlY3RGbiA9IGZuO1xuXHRcdH1cblx0XHRwcml2YXRlIHNlbGVjdEZuOiBTZWxlY3RGbiA9ICgpID0+IHt9O1xuXHRcdFxuXHRcdC8vIyBTaXplXG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogR2V0cyB0aGUgcGl4ZWwgd2lkdGggb2YgdGhlIGhlYWQgZWxlbWVudC5cblx0XHQgKi9cblx0XHRnZXQgd2lkdGgoKVxuXHRcdHtcblx0XHRcdHJldHVybiB0aGlzLl93aWR0aDtcblx0XHR9XG5cdFx0cHJpdmF0ZSBfd2lkdGggPSAwO1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIEdldHMgdGhlIHBpeGVsIGhlaWdodCBvZiB0aGUgaGVhZCBlbGVtZW50LlxuXHRcdCAqL1xuXHRcdGdldCBoZWlnaHQoKVxuXHRcdHtcblx0XHRcdHJldHVybiB0aGlzLl9oZWlnaHQ7XG5cdFx0fVxuXHRcdHByaXZhdGUgX2hlaWdodCA9IDA7XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogR2V0cyBvciBzZXRzIHRoZSBudW1iZXIgb2YgcG9zdGVycyBiZWluZyBkaXNwbGF5ZWQgaW4gb25lIGRpbWVuc2lvbi5cblx0XHQgKi9cblx0XHRnZXQgc2l6ZSgpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHRoaXMuX3NpemU7XG5cdFx0fVxuXHRcdHNldCBzaXplKHNpemU6IG51bWJlcilcblx0XHR7XG5cdFx0XHR0aGlzLnNldFNpemVJbm5lcihzaXplKTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cHJpdmF0ZSBzZXRTaXplSW5uZXIoc2l6ZTogbnVtYmVyKVxuXHRcdHtcblx0XHRcdHNpemUgPSBNYXRoLm1heChtaW5TaXplLCBNYXRoLm1pbihzaXplLCBtYXhTaXplKSk7XG5cdFx0XHRpZiAoc2l6ZSA9PT0gdGhpcy5fc2l6ZSlcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XG5cdFx0XHR0aGlzLl9zaXplID0gc2l6ZTtcblx0XHRcdFxuXHRcdFx0Y29uc3QgY2xzID0gc2l6ZUNsYXNzZXMuZ2V0KHNpemUpO1xuXHRcdFx0aWYgKGNscylcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5oZWFkLmNsYXNzTGlzdC5yZW1vdmUoLi4uc2l6ZUNsYXNzZXMudmFsdWVzKCkpO1xuXHRcdFx0XHR0aGlzLmhlYWQuY2xhc3NMaXN0LmFkZChjbHMpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR0aGlzLnVwZGF0ZVBvc3RlclZpc2liaWxpdHkoKTtcblx0XHR9XG5cdFx0XG5cdFx0cHJpdmF0ZSBfc2l6ZSA9IC0xO1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIEdldHMgdGhlIG1heGltdW0gcG9zc2libGUgc2l6ZSBvZiB0aGUgT21uaXZpZXcsIFxuXHRcdCAqIGdpdmVuIHRoZSBudW1iZXIgb2YgcHJldmlld3MgdGhhdCBhcmUgYXZhaWxhYmxlLlxuXHRcdCAqIEEgdmFsdWUgb2YgMCBpbmRpY2F0ZXMgdGhhdCB0aGVyZSBpcyBubyBzaXplIGxpbWl0LlxuXHRcdCAqL1xuXHRcdHByaXZhdGUgc2l6ZUxpbWl0ID0gMDtcblx0XHRcblx0XHQvLyMgUG9zdGVyc1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFJldHVybnMgYW4gYXJyYXkgb2YgSFRNTEVsZW1lbnQgb2JqZWN0cyB0aGF0IGNvbnRhaW4gdGhlIHBvc3RlcnNcblx0XHQgKiB0aGF0IGhhdmUgYXQgbGVhc3QgYSBzaW5nbGUgcGl4ZWwgdmlzaWJsZSBvbiB0aGUgc2NyZWVuLlxuXHRcdCAqL1xuXHRcdGdldFZpc2libGVQb3N0ZXJzKCk6IEhUTUxFbGVtZW50W11cblx0XHR7XG5cdFx0XHRjb25zdCBlbGVtZW50czogSFRNTEVsZW1lbnRbXSA9IFtdO1xuXHRcdFx0XG5cdFx0XHRmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZ2V0QnlDbGFzcyhzaG93Q2xhc3MsIHRoaXMuaGVhZCkpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHRpZiAocmVjdC53aWR0aCA9PT0gMCB8fCByZWN0LmhlaWdodCA9PT0gMClcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChyZWN0LnRvcCA+IHRoaXMuaGVpZ2h0KVxuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcblx0XHRcdFx0ZWxlbWVudHMucHVzaChlbGVtZW50KTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0cmV0dXJuIGVsZW1lbnRzO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRnZXQgcG9zdGVyQ291bnQoKVxuXHRcdHtcblx0XHRcdHJldHVybiB0aGlzLmhlYWQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShDbGFzcy5wb3N0ZXIpLmxlbmd0aDtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0YXN5bmMgdHJ5QXBwZW5kUG9zdGVycyhzY3JlZW5Db3VudDogbnVtYmVyKVxuXHRcdHtcblx0XHRcdGNvbnN0IHB1bGxDb3VudCA9IHRoaXMuc2l6ZSAqIHRoaXMuc2l6ZSAqIHNjcmVlbkNvdW50O1xuXHRcdFx0Y29uc3QgcmFuZ2VTdGFydCA9IHRoaXMucG9zdGVyQ291bnQ7XG5cdFx0XHRjb25zdCByYW5nZUVuZCA9IHJhbmdlU3RhcnQgKyBwdWxsQ291bnQ7XG5cdFx0XHRjb25zdCBtYXliZVByb21pc2VzOiBSZXR1cm5UeXBlPFJlbmRlckZuPltdID0gW107XG5cdFx0XHRsZXQgY2FuQ29udGludWUgPSB0cnVlO1xuXHRcdFx0XG5cdFx0XHRmb3IgKGxldCBpID0gcmFuZ2VTdGFydDsgaSA8IHJhbmdlRW5kOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9IHRoaXMucmVuZGVyRm4oaSk7XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBJZiBudWxsIGlzIHJldHVybmVkLCB0aGlzIG1lYW5zIHRoYXQgdGhlIHN0cmVhbSBoYXMgdGVybWluYXRlZC5cblx0XHRcdFx0aWYgKHJlc3VsdCA9PT0gbnVsbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNhbkNvbnRpbnVlID0gZmFsc2U7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdG1heWJlUHJvbWlzZXMucHVzaChyZXN1bHQpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRjb25zdCBuZXdQb3N0ZXJDb3VudCA9IG1heWJlUHJvbWlzZXMubGVuZ3RoO1xuXHRcdFx0aWYgKG5ld1Bvc3RlckNvdW50ID09PSAwKVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcblx0XHRcdGlmIChyYW5nZVN0YXJ0ID09PSAwICYmIG5ld1Bvc3RlckNvdW50IDwgdGhpcy5zaXplKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBUaGUgY29uc3RyYWluZWQgc2l6ZSBjYW5ub3QgZ28gYmVsb3cgMi4gVGhpcyBtZWFucyB0aGF0IGlmIHRoZXJlXG5cdFx0XHRcdC8vIGlzIG9ubHkgMSBwcmV2aWV3IHJldHVybmVkLCB0aGUgT21uaXZpZXcgaXMgZ29pbmcgdG8gbG9vayBhIGJpdFxuXHRcdFx0XHQvLyBhd2t3YXJkIHdpdGggYSBwcmV2aWV3IG9uIHRoZSBsZWZ0IHNpZGUgb2YgdGhlIHNjcmVlbiwgYW5kIGFuXG5cdFx0XHRcdC8vIGVtcHR5IHNwYWNlIG9uIHRoZSByaWdodC4gSWYgdGhpcyBpcyB1bmRlc2lyYWJsZSwgdGhlIGNvbXBvbmVudFxuXHRcdFx0XHQvLyB0aGF0IG93bnMgdGhlIE9tbml2aWV3IGlzIHJlc3BvbnNpYmxlIGZvciBhdm9pZGluZyB0aGlzIHNpdHVhdGlvblxuXHRcdFx0XHQvLyBieSBpdCdzIG93biBtZWFucy5cblx0XHRcdFx0dGhpcy5zaXplTGltaXQgPSBNYXRoLm1heCgyLCBuZXdQb3N0ZXJDb3VudCk7XG5cdFx0XHRcdHRoaXMuc2V0U2l6ZUlubmVyKHRoaXMuc2l6ZUxpbWl0KTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Y29uc3QgZWxlbWVudHM6IEhUTUxFbGVtZW50W10gPSBbXTtcblx0XHRcdFxuXHRcdFx0Zm9yIChjb25zdCBtYXliZVByb21pc2Ugb2YgbWF5YmVQcm9taXNlcylcblx0XHRcdHtcblx0XHRcdFx0aWYgKCFtYXliZVByb21pc2UpXG5cdFx0XHRcdFx0dGhyb3cgXCI/XCI7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAobWF5YmVQcm9taXNlIGluc3RhbmNlb2YgUHJvbWlzZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0IHNoaW0gPSByYXcuZGl2KFxuXHRcdFx0XHRcdFx0XCJlbGVtZW50LXBsYWNlaG9sZGVyXCIsXG5cdFx0XHRcdFx0XHRnZXREZWZhdWx0QmFja2dyb3VuZCgpKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRlbGVtZW50cy5wdXNoKHNoaW0pO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdG1heWJlUHJvbWlzZS50aGVuKGVsZW1lbnQgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAoZWxlbWVudCA9PT0gbnVsbClcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRmb3IgKGNvbnN0IG4gb2Ygc2hpbS5nZXRBdHRyaWJ1dGVOYW1lcygpKVxuXHRcdFx0XHRcdFx0XHRpZiAobiAhPT0gXCJzdHlsZVwiICYmIG4gIT09IFwiY2xhc3NcIilcblx0XHRcdFx0XHRcdFx0XHRlbGVtZW50LnNldEF0dHJpYnV0ZShuLCBzaGltLmdldEF0dHJpYnV0ZShuKSB8fCBcIlwiKTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0Zm9yIChjb25zdCBkZWZpbmVkUHJvcGVydHkgb2YgQXJyYXkuZnJvbShzaGltLnN0eWxlKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eShcblx0XHRcdFx0XHRcdFx0XHRkZWZpbmVkUHJvcGVydHksXG5cdFx0XHRcdFx0XHRcdFx0c2hpbS5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKGRlZmluZWRQcm9wZXJ0eSkpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRyYXcuZ2V0KGVsZW1lbnQpKFxuXHRcdFx0XHRcdFx0XHQvLyBDbGFzc2VzIHRoYXQgaGF2ZSBiZWVuIHNldCBvbiB0aGUgc2hpbSBzaW5jZSBpdCB3YXMgaW5zZXJ0ZWRcblx0XHRcdFx0XHRcdFx0Ly8gbXVzdCBiZSBjb3BpZWQgb3ZlciB0byB0aGUgZWxlbWVudC5cblx0XHRcdFx0XHRcdFx0QXJyYXkuZnJvbShzaGltLmNsYXNzTGlzdCksIFxuXHRcdFx0XHRcdFx0XHRyYXcub24oXCJjbGlja1wiLCAoKSA9PiB0aGlzLnNlbGVjdEZuKGVsZW1lbnQsIGdldEluZGV4KGVsZW1lbnQpKSlcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdHNoaW0ucmVwbGFjZVdpdGgoZWxlbWVudCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZWxlbWVudHMucHVzaChyYXcuZ2V0KG1heWJlUHJvbWlzZSkoXG5cdFx0XHRcdFx0XHRyYXcub24oXCJjbGlja1wiLCAoKSA9PiB0aGlzLnNlbGVjdEZuKG1heWJlUHJvbWlzZSwgZ2V0SW5kZXgobWF5YmVQcm9taXNlKSkpXG5cdFx0XHRcdFx0KSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Zm9yIChjb25zdCBbaSwgZV0gb2YgZWxlbWVudHMuZW50cmllcygpKVxuXHRcdFx0e1xuXHRcdFx0XHRzZXRJbmRleChlLCB0aGlzLnBvc3RlckNvdW50ICsgaSk7XG5cdFx0XHRcdGUuY2xhc3NMaXN0LmFkZChDbGFzcy5wb3N0ZXIpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR0aGlzLmhlYWQuYXBwZW5kKC4uLmVsZW1lbnRzKTtcblx0XHRcdHRoaXMudXBkYXRlUG9zdGVyVmlzaWJpbGl0eShjYW5Db250aW51ZSk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByaXZhdGUgdXBkYXRlUG9zdGVyVmlzaWJpbGl0eShjYW5Db250aW51ZTogYm9vbGVhbiA9IGZhbHNlKVxuXHRcdHtcblx0XHRcdGlmICghdGhpcy5oZWFkLmlzQ29ubmVjdGVkKVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcblx0XHRcdGxldCBpc05lYXJpbmdCb3R0b20gPSBmYWxzZTtcblx0XHRcdFxuXHRcdFx0aWYgKHRoaXMucG9zdGVyQ291bnQgPiAwKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCB5ID0gdGhpcy5oZWFkLnNjcm9sbFRvcDtcblx0XHRcdFx0Y29uc3Qgcm93SGVpZ2h0ID0gdGhpcy5oZWlnaHQgLyB0aGlzLnNpemU7XG5cdFx0XHRcdGNvbnN0IHJvd0NvdW50ID0gdGhpcy5wb3N0ZXJDb3VudCAvIHRoaXMuc2l6ZTtcblx0XHRcdFx0Y29uc3QgdmlzaWJsZVJvd1N0YXJ0ID0gTWF0aC5mbG9vcih5IC8gcm93SGVpZ2h0KTtcblx0XHRcdFx0Y29uc3QgdmlzaWJsZUl0ZW1TdGFydCA9IHZpc2libGVSb3dTdGFydCAqIHRoaXMuc2l6ZTtcblx0XHRcdFx0Y29uc3QgdmlzaWJsZUl0ZW1FbmQgPSB2aXNpYmxlSXRlbVN0YXJ0ICsgdGhpcy5zaXplICogKHRoaXMuc2l6ZSArIDIpO1xuXHRcdFx0XHRjb25zdCBlbGVtZW50c1dpdGhUb3AgPSBuZXcgU2V0KGdldEJ5Q2xhc3MoQ2xhc3MuaGFzQ3NzVG9wLCB0aGlzLmhlYWQpKTtcblx0XHRcdFx0Y29uc3QgZWxlbWVudHNWaXNpYmxlID0gbmV3IFNldChnZXRCeUNsYXNzKHNob3dDbGFzcywgdGhpcy5oZWFkKSk7XG5cdFx0XHRcdGNvbnN0IGNoaWxkcmVuID0gQXJyYXkuZnJvbSh0aGlzLmhlYWQuY2hpbGRyZW4pLmZpbHRlcihlID0+IGUgaW5zdGFuY2VvZiBIVE1MRGl2RWxlbWVudCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRmb3IgKGxldCBpID0gdmlzaWJsZUl0ZW1TdGFydDsgaSA8IHZpc2libGVJdGVtRW5kOyBpKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCBlID0gY2hpbGRyZW5baV07XG5cdFx0XHRcdFx0aWYgKCEoZSBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50KSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAoaSA+PSBjaGlsZHJlbi5sZW5ndGgpXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Y29uc3QgbXVsID0gZ2V0SW5kZXgoZSkgPiAwID8gMSA6IC0xO1xuXHRcdFx0XHRcdGNvbnN0IHBjdCA9ICgxMDAgKiB0aGlzLnJvd09mKGUpICogbXVsIHx8IDApLnRvRml4ZWQoNSk7XG5cdFx0XHRcdFx0ZS5zdHlsZS50b3AgPSBgY2FsYygke3BjdH0lIC8gdmFyKCR7Q2xhc3Muc2l6ZVZhcn0pKWA7XG5cdFx0XHRcdFx0ZS5jbGFzc0xpc3QuYWRkKENsYXNzLmhhc0Nzc1RvcCwgc2hvd0NsYXNzKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRlbGVtZW50c1dpdGhUb3AuZGVsZXRlKGUpO1xuXHRcdFx0XHRcdGVsZW1lbnRzVmlzaWJsZS5kZWxldGUoZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdGZvciAoY29uc3QgZSBvZiBlbGVtZW50c1dpdGhUb3ApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRlLnN0eWxlLnJlbW92ZVByb3BlcnR5KFwidG9wXCIpO1xuXHRcdFx0XHRcdGUuY2xhc3NMaXN0LnJlbW92ZShDbGFzcy5oYXNDc3NUb3ApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRmb3IgKGNvbnN0IGUgb2YgZWxlbWVudHNWaXNpYmxlKVxuXHRcdFx0XHRcdGUuY2xhc3NMaXN0LnJlbW92ZShzaG93Q2xhc3MpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKHkgIT09IHRoaXMubGFzdFkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aGlzLmxhc3RZID0geTtcblx0XHRcdFx0XHRpc05lYXJpbmdCb3R0b20gPSAoeSArIHRoaXMuaGVpZ2h0KSA+IChyb3dDb3VudCAtIDEpICogKHRoaXMuaGVpZ2h0IC8gdGhpcy5zaXplKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRpZiAoY2FuQ29udGludWUgJiYgaXNOZWFyaW5nQm90dG9tKVxuXHRcdFx0XHR0aGlzLnRyeUFwcGVuZFBvc3RlcnMoMSk7XG5cdFx0XHRcblx0XHRcdGlmIChDQVBBQ0lUT1IgfHwgREVNTylcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgcXVlcnkgPSB0aGlzLmhlYWQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShDbGFzcy5oYXNDc3NUb3ApO1xuXHRcdFx0XHRpZiAocXVlcnkubGVuZ3RoID4gMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0IGxhc3QgPSBxdWVyeS5pdGVtKHF1ZXJ5Lmxlbmd0aCAtIDEpIGFzIEhUTUxFbGVtZW50O1xuXHRcdFx0XHRcdGlmIChsYXN0ICYmIGxhc3QgIT09IHRoaXMubGFzdFZpc2libGVQb3N0ZXIpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dGhpcy5jb3JuZXJzRWxlbWVudCEuc3R5bGUuaGVpZ2h0ID0gKDEgKyBsYXN0Lm9mZnNldFRvcCArIGxhc3Qub2Zmc2V0SGVpZ2h0IC8gdGhpcy5zaXplKSArIFwicHhcIjtcblx0XHRcdFx0XHRcdHRoaXMubGFzdFZpc2libGVQb3N0ZXIgPSBsYXN0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRwcml2YXRlIGxhc3RWaXNpYmxlUG9zdGVyOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXHRcdHByaXZhdGUgbGFzdFkgPSAtMTtcblx0XHRcblx0XHQvKiogKi9cblx0XHRwcml2YXRlIHJvd09mKHByZXZpZXdFbGVtZW50OiBFbGVtZW50KVxuXHRcdHtcblx0XHRcdGNvbnN0IGVJZHggPSBnZXRJbmRleChwcmV2aWV3RWxlbWVudCk7XG5cdFx0XHRjb25zdCByb3dJbmRleCA9IE1hdGguZmxvb3IoZUlkeCAvIHRoaXMuc2l6ZSk7XG5cdFx0XHRyZXR1cm4gcm93SW5kZXg7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKiogKi9cblx0Y29uc3QgZW51bSBDbGFzc1xuXHR7XG5cdFx0cG9zdGVyID0gXCJwb3N0ZXJcIixcblx0XHRib2R5ID0gXCJib2R5XCIsXG5cdFx0aGFzQ3NzVG9wID0gXCJoYXMtdG9wXCIsXG5cdFx0c2l6ZVZhciA9IFwiLS1zaXplXCIsXG5cdH1cblx0XG5cdC8qKiAqL1xuXHRsZXQgZ2V0RGVmYXVsdEJhY2tncm91bmQgPSAoKSA9PlxuXHR7XG5cdFx0Y29uc3QgY2FudmFzID0gcmF3LmNhbnZhcyh7IHdpZHRoOiAzMiwgaGVpZ2h0OiAzMiB9KTtcblx0XHRjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpITtcblx0XHRjb25zdCBncmFkID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIDAsIDMyLCAzMik7XG5cdFx0Z3JhZC5hZGRDb2xvclN0b3AoMCwgXCJyZ2IoNTAsIDUwLCA1MClcIik7XG5cdFx0Z3JhZC5hZGRDb2xvclN0b3AoMSwgXCJyZ2IoMCwgMCwgMClcIik7XG5cdFx0Y3R4LmZpbGxTdHlsZSA9IGdyYWQ7XG5cdFx0Y3R4LmZpbGxSZWN0KDAsIDAsIDMyLCAzMik7XG5cdFx0XG5cdFx0Y29uc3QgY2xzID0gcmF3LmNzcyh7XG5cdFx0XHRiYWNrZ3JvdW5kSW1hZ2U6IGB1cmwoJHtjYW52YXMudG9EYXRhVVJMKCl9KWAsXG5cdFx0XHRiYWNrZ3JvdW5kU2l6ZTogXCIxMDAlIDEwMCVcIixcblx0XHR9KTtcblx0XHRcblx0XHRnZXREZWZhdWx0QmFja2dyb3VuZCA9ICgpID0+IGNscztcblx0fVxuXHRcblx0LyoqICovXG5cdGxldCBtYXliZUFwcGVuZERlZmF1bHRDc3MgPSAoKSA9PlxuXHR7XG5cdFx0bWF5YmVBcHBlbmREZWZhdWx0Q3NzID0gKCkgPT4ge307XG5cdFx0XG5cdFx0cmF3LnN0eWxlKFxuXHRcdFx0XCIuXCIgKyBDbGFzcy5ib2R5LCB7XG5cdFx0XHRcdHBvc2l0aW9uOiBcImZpeGVkXCIsXG5cdFx0XHRcdHRvcDogMCxcblx0XHRcdFx0cmlnaHQ6IDAsXG5cdFx0XHRcdGxlZnQ6IDAsXG5cdFx0XHRcdGJvdHRvbTogMCxcblx0XHRcdFx0ekluZGV4OiAxLFxuXHRcdFx0XHR0cmFuc2Zvcm06IFwidHJhbnNsYXRlWSgwKVwiLFxuXHRcdFx0XHR0cmFuc2l0aW9uUHJvcGVydHk6IFwidHJhbnNmb3JtXCIsXG5cdFx0XHRcdHRyYW5zaXRpb25EdXJhdGlvbjogXCIwLjMzc1wiLFxuXHRcdFx0XHRzY3JvbGxTbmFwVHlwZTogXCJ5IG1hbmRhdG9yeVwiLFxuXHRcdFx0XHRvdmVyZmxvd1k6IFwiYXV0b1wiLFxuXHRcdFx0fSxcblx0XHRcdGAuJHtDbGFzcy5ib2R5fTpiZWZvcmUsIC4ke0NsYXNzLmJvZHl9OmFmdGVyYCwge1xuXHRcdFx0XHRjb250ZW50OiBgXCJcImAsXG5cdFx0XHRcdGRpc3BsYXk6IFwiYmxvY2tcIixcblx0XHRcdFx0aGVpZ2h0OiBcIjFweFwiLFxuXHRcdFx0XHRzY3JvbGxTbmFwU3RvcDogXCJhbHdheXNcIixcblx0XHRcdH0sXG5cdFx0XHRgLiR7Q2xhc3MuYm9keX06YmVmb3JlYCwge1xuXHRcdFx0XHRzY3JvbGxTbmFwQWxpZ246IFwic3RhcnRcIixcblx0XHRcdH0sXG5cdFx0XHRgLiR7Q2xhc3MuYm9keX06YWZ0ZXJgLCB7XG5cdFx0XHRcdHNjcm9sbFNuYXBBbGlnbjogXCJlbmRcIixcblx0XHRcdH0sXG5cdFx0XHRgLiR7Q2xhc3MuYm9keX0gPiAqYCwge1xuXHRcdFx0XHRzY3JvbGxTbmFwQWxpZ246IFwic3RhcnRcIixcblx0XHRcdFx0c2Nyb2xsU25hcFN0b3A6IFwiYWx3YXlzXCIsXG5cdFx0XHRcdGhlaWdodDogXCIxMDAlXCIsXG5cdFx0XHR9LFxuXHRcdFx0Ly8gUGxhY2UgYSBzY3JlZW4gb3ZlciB0aGUgcG9zdGVyIGVsZW1lbnQgdG8ga2lsbCBhbnkgc2VsZWN0aW9uXG5cdFx0XHQvLyBldmVudHMuIFRoaXMgaGFzIHRvIGJlIGRvbmUgaW4gYW5vdGhlciBlbGVtZW50IHJhdGhlciB0aGFuIFxuXHRcdFx0Ly8ganVzdCBkb2luZyBhIHBvaW50ZXItZXZlbnRzOiBub25lIG9uIHRoZSBjaGlsZHJlbiBiZWNhdXNlIHRoZVxuXHRcdFx0Ly8gcG9zdGVyIGVsZW1lbnQncyBjb250ZW50cyBhcmUgd2l0aGluIGEgc2hhZG93IHJvb3QuXG5cdFx0XHRgLiR7Q2xhc3MucG9zdGVyfTpiZWZvcmVgLCB7XG5cdFx0XHRcdGNvbnRlbnQ6IGBcIlwiYCxcblx0XHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHRcdFx0dG9wOiAwLFxuXHRcdFx0XHRyaWdodDogMCxcblx0XHRcdFx0bGVmdDogMCxcblx0XHRcdFx0Ym90dG9tOiAwLFxuXHRcdFx0XHR6SW5kZXg6IDEsXG5cdFx0XHRcdHVzZXJTZWxlY3Q6IFwibm9uZVwiLFxuXHRcdFx0fSxcblx0XHQpLmF0dGFjaCgpO1xuXHRcdFxuXHRcdGNvbnN0IGNsYXNzZXMgPSBuZXcgTWFwPG51bWJlciwgc3RyaW5nPigpO1xuXHRcdGZvciAobGV0IHNpemUgPSBtaW5TaXplOyBzaXplIDw9IG1heFNpemU7IHNpemUrKylcblx0XHR7XG5cdFx0XHRjb25zdCBwYXJhbXM6IChzdHJpbmcgfCBSYXcuU3R5bGUpW10gPSBbXTtcblx0XHRcdGNvbnN0IHNjYWxlID0gMSAvIHNpemU7XG5cdFx0XHRjb25zdCBzaXplQ2xhc3MgPSBcInNpemUtXCIgKyBzaXplO1xuXHRcdFx0Y2xhc3Nlcy5zZXQoc2l6ZSwgc2l6ZUNsYXNzKTtcblx0XHRcdFxuXHRcdFx0cGFyYW1zLnB1c2goXG5cdFx0XHRcdFwiLlwiICsgc2l6ZUNsYXNzLCB7XG5cdFx0XHRcdFx0W0NsYXNzLnNpemVWYXJdOiBzaXplXG5cdFx0XHRcdH0gYXMgYW55XG5cdFx0XHQpO1xuXHRcdFx0XG5cdFx0XHRmb3IgKGxldCBuID0gLTE7ICsrbiA8IHNpemU7KVxuXHRcdFx0e1xuXHRcdFx0XHRwYXJhbXMucHVzaChcblx0XHRcdFx0XHRgIC4ke3NpemVDbGFzc30gPiBESVY6bnRoLW9mLXR5cGUoJHtzaXplfW4gKyAke24gKyAxfSlgLCB7XG5cdFx0XHRcdFx0XHRsZWZ0OiAoc2NhbGUgKiAxMDAgKiBuKSArIFwiJVwiLFxuXHRcdFx0XHRcdFx0dHJhbnNmb3JtOiBgc2NhbGUoJHtzY2FsZS50b0ZpeGVkKDQpfSlgLFxuXHRcdFx0XHRcdFx0dHJhbnNmb3JtT3JpZ2luOiBcIjAgMFwiLFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0cmF3LnN0eWxlKC4uLnBhcmFtcykuYXR0YWNoKCk7XG5cdFx0fVxuXHRcdFxuXHRcdHNpemVDbGFzc2VzID0gY2xhc3Nlcztcblx0fVxuXHRcblx0bGV0IHNpemVDbGFzc2VzOiBSZWFkb25seU1hcDxudW1iZXIsIHN0cmluZz47XG5cdFxuXHQvKipcblx0ICogQ2FsY3VsYXRlcyBhIGNvbWZvcnRhYmxlIHByZXZpZXcgc2l6ZSBiYXNlZCBvbiB0aGUgc2l6ZSBhbmQgcGl4ZWwgZGVuc2l0eVxuXHQgKiBvZiB0aGUgc2NyZWVuLiAoVGhlIHRlY2huaXF1ZSB1c2VkIGlzIHByb2JhYmx5IHF1aXRlIGZhdWx0eSwgYnV0IGdvb2QgZW5vdWdoXG5cdCAqIGZvciBtb3N0IHNjZW5hcmlvcykuXG5cdCAqL1xuXHRmdW5jdGlvbiBjYWxjdWxhdGVOYXR1cmFsU2l6ZSgpXG5cdHtcblx0XHRyZXR1cm4gMztcblx0XHRcblx0XHRjb25zdCBkcDEgPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA9PT0gMTtcblx0XHRjb25zdCBsb2dpY2FsV2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuXHRcdFxuXHRcdGlmIChsb2dpY2FsV2lkdGggPD0gKGRwMSA/IDkwMCA6IDQ1MCkpXG5cdFx0XHRyZXR1cm4gMjtcblx0XHRcblx0XHRpZiAobG9naWNhbFdpZHRoIDw9IChkcDEgPyAxNDAwIDogNzAwKSlcblx0XHRcdHJldHVybiAzO1xuXHRcdFxuXHRcdGlmIChsb2dpY2FsV2lkdGggPD0gMTgwMClcblx0XHRcdHJldHVybiA0O1xuXHRcdFxuXHRcdHJldHVybiA1O1xuXHR9XG5cdFxuXHRjb25zdCBtaW5TaXplID0gMjtcblx0Y29uc3QgbWF4U2l6ZSA9IDc7XG5cdC8vY29uc3QgcmF0aW9YID0gOTtcblx0Ly9jb25zdCByYXRpb1kgPSAxNjtcblx0XG5cdC8qKiAqL1xuXHRmdW5jdGlvbiBnZXRJbmRleChlOiBFbGVtZW50KVxuXHR7XG5cdFx0cmV0dXJuIE51bWJlcigoQXJyYXkuZnJvbShlLmNsYXNzTGlzdClcblx0XHRcdC5maW5kKGNscyA9PiBjbHMuc3RhcnRzV2l0aChpbmRleFByZWZpeCkpIHx8IFwiXCIpXG5cdFx0XHQuc2xpY2UoaW5kZXhQcmVmaXgubGVuZ3RoKSkgfHwgMDtcblx0fVxuXHRcblx0LyoqICovXG5cdGZ1bmN0aW9uIHNldEluZGV4KGU6IEVsZW1lbnQsIGluZGV4OiBudW1iZXIpXG5cdHtcblx0XHRlLmNsYXNzTGlzdC5hZGQoaW5kZXhQcmVmaXggKyBpbmRleCk7XG5cdH1cblx0XG5cdGNvbnN0IGluZGV4UHJlZml4ID0gXCJpbmRleDpcIjtcblx0XG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgcG9zdGVyIEhUTUxFbGVtZW50IGZvciB0aGUgZ2l2ZW4gaW5kZXggaW4gdGhlIHN0cmVhbS5cblx0ICogVGhlIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gbnVsbCB0byBzdG9wIGxvb2tpbmcgZm9yIHBvc3RlcnMgYXQgb3Jcblx0ICogYmV5b25kIHRoZSBzcGVjaWZpZWQgaW5kZXguXG5cdCAqL1xuXHRleHBvcnQgdHlwZSBSZW5kZXJGbiA9IChpbmRleDogbnVtYmVyKSA9PiBQcm9taXNlPEhUTUxFbGVtZW50PiB8IEhUTUxFbGVtZW50IHwgbnVsbDtcblx0XG5cdC8qKiAqL1xuXHRleHBvcnQgdHlwZSBTZWxlY3RGbiA9IChzZWxlY3RlZEVsZW1lbnQ6IEhUTUxFbGVtZW50LCBpbmRleDogbnVtYmVyKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcblx0XG5cdC8vIyBVdGlsaXRpZXNcblx0XG5cdC8qKiAqL1xuXHRsZXQgc2hvd0NsYXNzID0gXCJcIjtcblx0XG5cdC8qKiAqL1xuXHRmdW5jdGlvbiBnZXRCeUNsYXNzKGNsczogc3RyaW5nLCBlbGVtZW50PzogRWxlbWVudClcblx0e1xuXHRcdGNvbnN0IGNvbCA9IChlbGVtZW50IHx8IGRvY3VtZW50KS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNscyk7XG5cdFx0cmV0dXJuIEFycmF5LmZyb20oY29sKSBhcyBIVE1MRWxlbWVudFtdO1xuXHR9XG59XG4iLCJcbm5hbWVzcGFjZSBTcXVhcmVzLkNvdmVyXG57XG5cdC8qKiAqL1xuXHRleHBvcnQgZnVuY3Rpb24gY292ZXJTdG9yeUhhdCgpXG5cdHtcblx0XHRTcXVhcmVzLmFwcGVuZENzc1Jlc2V0KCk7XG5cdFx0XG5cdFx0Y29uc3Qgc2VjdGlvbnMgPSBbXG5cdFx0XHRyYXcuZGl2KFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c2Nyb2xsU25hcFN0b3A6IFwiYWx3YXlzXCIsXG5cdFx0XHRcdFx0c2Nyb2xsU25hcEFsaWduOiBcInN0YXJ0XCIsXG5cdFx0XHRcdFx0YmFja2dyb3VuZENvbG9yOiBcInJlZFwiLFxuXHRcdFx0XHR9XG5cdFx0XHQpLFxuXHRcdFx0cmF3LmRpdihcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNjcm9sbFNuYXBTdG9wOiBcImFsd2F5c1wiLFxuXHRcdFx0XHRcdHNjcm9sbFNuYXBBbGlnbjogXCJzdGFydFwiLFxuXHRcdFx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJncmVlblwiLFxuXHRcdFx0XHR9XG5cdFx0XHQpLFxuXHRcdFx0cmF3LmRpdihcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNjcm9sbFNuYXBTdG9wOiBcImFsd2F5c1wiLFxuXHRcdFx0XHRcdHNjcm9sbFNuYXBBbGlnbjogXCJzdGFydFwiLFxuXHRcdFx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJibHVlXCIsXG5cdFx0XHRcdH1cblx0XHRcdClcblx0XHRdO1xuXHRcdFxuXHRcdGNvbnN0IGZlZWQ6IElGZWVkRGV0YWlsID0ge1xuXHRcdFx0a2V5OiBVdGlsLmdldFNhZmVUaWNrcygpLFxuXHRcdFx0YXV0aG9yOiBcIlBhdWwgR29yZG9uXCIsXG5cdFx0XHR1cmw6IFwiaHR0cDovL2xvY2FsaG9zdDo0MzMzMi9yYWNjb29ucy9pbmRleC50eHRcIixcblx0XHRcdGRlc2NyaXB0aW9uOiBcIkEgZGVzY3JpcHRpb24gb2YgdGhlIGZlZWRcIixcblx0XHRcdGljb246IFwiaHR0cDovL2xvY2FsaG9zdDo0MzMzMi9yYWNjb29ucy9pY29uLmpwZ1wiLFxuXHRcdFx0Y2hlY2tzdW06IFwiP1wiLFxuXHRcdH07XG5cdFx0XG5cdFx0Y29uc3QgaGF0ID0gbmV3IFBhZ2VIYXQoW10sIHNlY3Rpb25zLCBmZWVkKTtcblx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZChoYXQuaGVhZCk7XG5cdH1cbn1cbiIsIlxubmFtZXNwYWNlIFNxdWFyZXNcbntcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBQYWdlSGF0XG5cdHtcblx0XHRyZWFkb25seSBoZWFkO1xuXHRcdHByaXZhdGUgcmVhZG9ubHkgc3dpcGVyO1xuXHRcdHByaXZhdGUgcmVhZG9ubHkgc2Nyb2xsYWJsZTtcblx0XHRcblx0XHRyZWFkb25seSBvbkRpc2Nvbm5lY3Q7XG5cdFx0cHJpdmF0ZSByZWFkb25seSBfb25EaXNjb25uZWN0O1xuXHRcdFxuXHRcdHJlYWRvbmx5IG9uUmV0cmFjdDtcblx0XHRwcml2YXRlIHJlYWRvbmx5IF9vblJldHJhY3Q7XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0Y29uc3RydWN0b3IoXG5cdFx0XHRoZWFkOiBIVE1MRWxlbWVudFtdLFxuXHRcdFx0c2VjdGlvbnM6IEhUTUxFbGVtZW50W10sXG5cdFx0XHRwcml2YXRlIHJlYWRvbmx5IGZlZWQ6IElGZWVkRGV0YWlsKVxuXHRcdHtcblx0XHRcdGlmIChzZWN0aW9ucy5sZW5ndGggPCAxKVxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJNdXN0IGhhdmUgYXQgbGVhc3Qgb25lIHNlY3Rpb24uXCIpO1xuXHRcdFx0XG5cdFx0XHRpZiAoQ0FQQUNJVE9SIHx8IERFTU8pXG5cdFx0XHR7XG5cdFx0XHRcdHJhdy5nZXQoc2VjdGlvbnNbMF0pKHtcblx0XHRcdFx0XHRib3JkZXJUb3BMZWZ0UmFkaXVzOiBTdHlsZS5ib3JkZXJSYWRpdXNMYXJnZSArIFwiICFcIixcblx0XHRcdFx0XHRib3JkZXJUb3BSaWdodFJhZGl1czogU3R5bGUuYm9yZGVyUmFkaXVzTGFyZ2UgKyBcIiAhXCIsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRmb3IgKGNvbnN0IHNlY3Rpb24gb2Ygc2VjdGlvbnMpXG5cdFx0XHR7XG5cdFx0XHRcdHJhdy5nZXQoc2VjdGlvbikoXG5cdFx0XHRcdFx0VXRpbC5nZXRTZWN0aW9uU2FuaXRpemF0aW9uQ3NzKCksXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0c2Nyb2xsU25hcFN0b3A6IFwiYWx3YXlzICFcIixcblx0XHRcdFx0XHRcdHNjcm9sbFNuYXBBbGlnbjogXCJzdGFydFwiLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHRoaXMuc3dpcGVyID0gbmV3IFBhbmVTd2lwZXIoKTtcblx0XHRcdGNvbnN0IG1ldGFIYXRIZWlnaHQgPSAyMDA7XG5cdFx0XHRcblx0XHRcdHRoaXMuaGVhZCA9IHJhdy5kaXYoXG5cdFx0XHRcdFwiaGVhZFwiLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0d2lkdGg6IFwiMTAwJVwiLFxuXHRcdFx0XHRcdGhlaWdodDogXCIxMDAlXCIsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJhdy5vbihcImNvbm5lY3RlZFwiLCAoKSA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhpcy5zd2lwZXIuc2V0VmlzaWJsZVBhbmUoMSk7XG5cdFx0XHRcdFx0dGhpcy5zZXR1cFJldHJhY3Rpb25UcmFja2VyKCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0c2V0VGltZW91dCgoKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnN0IGUgPSB0aGlzLnNjcm9sbGFibGU7XG5cdFx0XHRcdFx0XHRlLnNjcm9sbFRvKDAsIGUub2Zmc2V0SGVpZ2h0ICsgbWV0YUhhdEhlaWdodCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pLFxuXHRcdFx0XHR0aGlzLnN3aXBlclxuXHRcdFx0KTtcblx0XHRcdFxuXHRcdFx0dGhpcy5zY3JvbGxhYmxlID0gcmF3LmRpdihcblx0XHRcdFx0XCJzY3JvbGxhYmxlLWVsZW1lbnRcIixcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNjcm9sbFNuYXBUeXBlOiBcInkgbWFuZGF0b3J5XCIsXG5cdFx0XHRcdFx0b3ZlcmZsb3dZOiBcImF1dG9cIixcblx0XHRcdFx0XHRoZWlnaHQ6IFwiMTAwJVwiLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRyYXcuZGl2KFxuXHRcdFx0XHRcdFwic25hcC10b3BcIixcblx0XHRcdFx0XHRzbmFwLFxuXHRcdFx0XHRcdHsgaGVpZ2h0OiBcIjEwMCVcIiB9LFxuXHRcdFx0XHQpLFxuXHRcdFx0XHRyYXcuZ2V0KG5ldyBGZWVkTWV0YUhhdCh0aGlzLmZlZWQpKShcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRoZWlnaHQ6IChtZXRhSGF0SGVpZ2h0IC0gMTApICsgXCJweFwiLFxuXHRcdFx0XHRcdFx0bWFyZ2luQm90dG9tOiBcIjEwcHhcIixcblx0XHRcdFx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDEyOCwgMTI4LCAxMjgsIDAuMzMpXCIsXG5cdFx0XHRcdFx0XHRib3JkZXJSYWRpdXM6IFN0eWxlLmJvcmRlclJhZGl1c0xhcmdlLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0U3R5bGUuYmFja2Ryb3BCbHVyKDgpLFxuXHRcdFx0XHRcdHNuYXAsXG5cdFx0XHRcdCksXG5cdFx0XHRcdChDQVBBQ0lUT1IgfHwgREVNTykgJiYgcmF3LmRpdihcblx0XHRcdFx0XHRcImNvcm5lcnMtY29udGFpbmVyXCIsXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHRcdFx0XHRcdGxlZnQ6IDAsXG5cdFx0XHRcdFx0XHRyaWdodDogMCxcblx0XHRcdFx0XHRcdHpJbmRleDogMixcblx0XHRcdFx0XHRcdHBvaW50ZXJFdmVudHM6IFwibm9uZVwiLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0W1xuXHRcdFx0XHRcdFx0VUkuY29ybmVyQWJzb2x1dGUoXCJ0bFwiKSxcblx0XHRcdFx0XHRcdFVJLmNvcm5lckFic29sdXRlKFwidHJcIiksXG5cdFx0XHRcdFx0XSxcblx0XHRcdFx0KSxcblx0XHRcdFx0cmF3LmRpdihcblx0XHRcdFx0XHRcInNoYWRvdy1jb250YWluZXJcIixcblx0XHRcdFx0XHR7IGRpc3BsYXk6IFwiY29udGVudHNcIiB9LFxuXHRcdFx0XHRcdHJhdy5zaGFkb3coXG5cdFx0XHRcdFx0XHQuLi5oZWFkLFxuXHRcdFx0XHRcdFx0cmF3LmJvZHkoXG5cdFx0XHRcdFx0XHRcdHsgZGlzcGxheTogXCJjb250ZW50cyAhXCIgfSxcblx0XHRcdFx0XHRcdFx0Li4uc2VjdGlvbnNcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHQpLFxuXHRcdFx0XHRyYXcuZGl2KFxuXHRcdFx0XHRcdFwic25hcC1ib3R0b21cIixcblx0XHRcdFx0XHRzbmFwLFxuXHRcdFx0XHRcdHsgaGVpZ2h0OiBcIjEwMCVcIiB9XG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0XHRcblx0XHRcdHRoaXMuc3dpcGVyLmFkZFBhbmUocmF3LmRpdihcImV4aXQtbGVmdC1lbGVtZW50XCIpKTtcblx0XHRcdHRoaXMuc3dpcGVyLmFkZFBhbmUodGhpcy5zY3JvbGxhYmxlKTtcblx0XHRcdFxuXHRcdFx0W3RoaXMub25SZXRyYWN0LCB0aGlzLl9vblJldHJhY3RdID0gRm9yY2UuY3JlYXRlPChwZXJjZW50OiBudW1iZXIpID0+IHZvaWQ+KCk7XG5cdFx0XHRbdGhpcy5vbkRpc2Nvbm5lY3QsIHRoaXMuX29uRGlzY29ubmVjdF0gPSBGb3JjZS5jcmVhdGU8KCkgPT4gdm9pZD4oKTtcblx0XHRcdHRoaXMub25EaXNjb25uZWN0KCgpID0+IHRoaXMuaGVhZC5yZW1vdmUoKSk7XG5cdFx0XHRcblx0XHRcdEhhdC53ZWFyKHRoaXMpO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRwcml2YXRlIHNldHVwUmV0cmFjdGlvblRyYWNrZXIoKVxuXHRcdHtcblx0XHRcdGNvbnN0IGUgPSB0aGlzLnNjcm9sbGFibGU7XG5cdFx0XHRsZXQgbGFzdFNjcm9sbFRvcCA9IC0xO1xuXHRcdFx0bGV0IGxhc3RTY3JvbGxMZWZ0ID0gLTE7XG5cdFx0XHRsZXQgdGltZW91dElkOiBhbnkgPSAwO1xuXHRcdFx0XG5cdFx0XHRjb25zdCBoYW5kbGVyID0gKCkgPT5cblx0XHRcdHtcblx0XHRcdFx0bGV0IGNsaXBUb3AgPSAwO1xuXHRcdFx0XHRsZXQgY2xpcEJvdHRvbSA9IDA7XG5cdFx0XHRcdGxldCBjbGlwTGVmdCA9IDA7XG5cdFx0XHRcdFxuXHRcdFx0XHRjb25zdCB3ID0gZS5vZmZzZXRXaWR0aDtcblx0XHRcdFx0Y29uc3Qgb2Zmc2V0SGVpZ2h0ID0gZS5vZmZzZXRIZWlnaHQ7XG5cdFx0XHRcdGNvbnN0IHNjcm9sbEhlaWdodCA9IGUuc2Nyb2xsSGVpZ2h0O1xuXHRcdFx0XHRjb25zdCBzY3JvbGxMZWZ0ID0gdGhpcy5zd2lwZXIuaGVhZC5zY3JvbGxMZWZ0O1xuXHRcdFx0XHRjb25zdCBzY3JvbGxUb3AgPSBlLnNjcm9sbFRvcDtcblx0XHRcdFx0XG5cdFx0XHRcdGNsaXBUb3AgPSBvZmZzZXRIZWlnaHQgLSBzY3JvbGxUb3A7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoc2Nyb2xsTGVmdCA8IHcpXG5cdFx0XHRcdFx0Y2xpcExlZnQgPSAxIC0gc2Nyb2xsTGVmdCAvIHc7XG5cdFx0XHRcdFxuXHRcdFx0XHRlbHNlIGlmIChzY3JvbGxUb3AgPiBzY3JvbGxIZWlnaHQgLSBvZmZzZXRIZWlnaHQpXG5cdFx0XHRcdFx0Y2xpcEJvdHRvbSA9IHNjcm9sbFRvcCAtIChzY3JvbGxIZWlnaHQgLSBvZmZzZXRIZWlnaHQpO1xuXHRcdFx0XHRcblx0XHRcdFx0Y2xpcExlZnQgKj0gMTAwOyBcblx0XHRcdFx0dGhpcy5oZWFkLnN0eWxlLmNsaXBQYXRoID0gYGluc2V0KCR7Y2xpcFRvcH1weCAwICR7Y2xpcEJvdHRvbX1weCAke2NsaXBMZWZ0fSUpYDtcblx0XHRcdFx0XG5cdFx0XHRcdC8vIERlYWwgd2l0aCByZXRyYWN0aW9uIG5vdGlmaWNhdGlvblxuXHRcdFx0XHRsZXQgcmV0cmFjdFBjdCA9IC0xO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKHNjcm9sbExlZnQgPCB3KVxuXHRcdFx0XHRcdHJldHJhY3RQY3QgPSBzY3JvbGxMZWZ0IC8gdztcblx0XHRcdFx0XG5cdFx0XHRcdGVsc2UgaWYgKHNjcm9sbFRvcCA8IG9mZnNldEhlaWdodClcblx0XHRcdFx0XHRyZXRyYWN0UGN0ID0gc2Nyb2xsVG9wIC8gb2Zmc2V0SGVpZ2h0O1xuXHRcdFx0XHRcblx0XHRcdFx0ZWxzZSBpZiAoc2Nyb2xsVG9wID49IHNjcm9sbEhlaWdodCAtIG9mZnNldEhlaWdodCAqIDIpXG5cdFx0XHRcdFx0cmV0cmFjdFBjdCA9IChzY3JvbGxIZWlnaHQgLSBvZmZzZXRIZWlnaHQgLSBzY3JvbGxUb3ApIC8gb2Zmc2V0SGVpZ2h0O1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKHJldHJhY3RQY3QgPiAwKVxuXHRcdFx0XHRcdHRoaXMuX29uUmV0cmFjdChyZXRyYWN0UGN0KTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vIFJlbW92ZSB0aGUgZWxlbWVudCBpZiBuZWNlc3Nhcnlcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG5cdFx0XHRcdGlmIChyZXRyYWN0UGN0ID4gMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxhc3RTY3JvbGxMZWZ0ID0gc2Nyb2xsTGVmdDtcblx0XHRcdFx0XHRsYXN0U2Nyb2xsVG9wID0gc2Nyb2xsVG9wO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAoc2Nyb2xsTGVmdCAhPT0gbGFzdFNjcm9sbExlZnQpXG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0aWYgKHNjcm9sbFRvcCAhPT0gbGFzdFNjcm9sbFRvcClcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHQvLyBBIG1vcmUgZWxlZ2FudCB3YXkgdG8gZGVhbCB3aXRoIHRoaXMgd291bGQgYmUgdG8gYW5pbWF0ZVxuXHRcdFx0XHRcdFx0Ly8gaXQgb2ZmIHRoZSBzY3JlZW4uLi4gYnV0IGp1c3QgcmVtb3ZpbmcgaXQgaXMgZ29vZCBlbm91Z2ggZm9yIG5vd1xuXHRcdFx0XHRcdFx0Ly8gYmVjYXVzZSB0aGlzIGlzIGp1c3QgYW4gZWRnZSBjYXNlIHRoYXQgaXNuJ3QgZ29pbmcgdG8gaGFwcGVuXG5cdFx0XHRcdFx0XHQvLyB2ZXJ5IG9mdGVuLlxuXHRcdFx0XHRcdFx0aWYgKHNjcm9sbExlZnQgPD0gMnx8XG5cdFx0XHRcdFx0XHRcdHNjcm9sbFRvcCA8PSAyIHx8XG5cdFx0XHRcdFx0XHRcdHNjcm9sbFRvcCA+PSBzY3JvbGxIZWlnaHQgLSBvZmZzZXRIZWlnaHQgLSAyKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHR0aGlzLl9vbkRpc2Nvbm5lY3QoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdFxuXHRcdFx0ZS5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIGhhbmRsZXIpO1xuXHRcdFx0dGhpcy5zd2lwZXIuaGVhZC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIGhhbmRsZXIpO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRmb3JjZVJldHJhY3QoKVxuXHRcdHtcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPihyID0+XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHNsaWRlQXdheSA9IChheGlzOiBcInhcIiB8IFwieVwiLCBhbW91bnQ6IG51bWJlcikgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0IG1zID0gMTAwO1xuXHRcdFx0XHRcdGNvbnN0IGUgPSB0aGlzLmhlYWQ7XG5cdFx0XHRcdFx0ZS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSBtcyArIFwibXNcIjtcblx0XHRcdFx0XHRlLnN0eWxlLnRyYW5zaXRpb25Qcm9wZXJ0eSA9IFwidHJhbnNmb3JtXCI7XG5cdFx0XHRcdFx0ZS5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlJHtheGlzLnRvTG9jYWxlVXBwZXJDYXNlKCl9KCR7YW1vdW50fXB4KWA7XG5cdFx0XHRcdFx0ZS5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJub25lXCI7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0c2V0VGltZW91dCgoKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHRoaXMuX29uRGlzY29ubmVjdCgpO1xuXHRcdFx0XHRcdFx0cigpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bXMpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRjb25zdCBlID0gdGhpcy5zY3JvbGxhYmxlO1xuXHRcdFx0XHRjb25zdCB3ID0gZS5vZmZzZXRXaWR0aDtcblx0XHRcdFx0Y29uc3Qgb2Zmc2V0SGVpZ2h0ID0gZS5vZmZzZXRIZWlnaHQ7XG5cdFx0XHRcdGNvbnN0IHNjcm9sbExlZnQgPSB0aGlzLnN3aXBlci5oZWFkLnNjcm9sbExlZnQ7XG5cdFx0XHRcdGNvbnN0IHNjcm9sbFRvcCA9IGUuc2Nyb2xsVG9wO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gVGhpcyBjaGVjayB3aWxsIGluZGljYXRlIHdoZXRoZXIgdGhlIHBhZ2VIYXQgaGFzIHJpZ2h0d2FyZFxuXHRcdFx0XHQvLyBzY3JvbGxpbmcgaW5lcnRpYS4gSWYgaXQgZG9lcywgaXQncyBzY3JvbGxpbmcgd2lsbCBoYWx0IGFuZCBpdCB3aWxsIGJlXG5cdFx0XHRcdC8vIG5lY2Vzc2FyeSB0byBhbmltYXRlIHRoZSBwYWdlSGF0IGF3YXkgbWFudWFsbHkuXG5cdFx0XHRcdGlmIChzY3JvbGxMZWZ0ID4gMCAmJiBzY3JvbGxMZWZ0IDwgdylcblx0XHRcdFx0XHRzbGlkZUF3YXkoXCJ4XCIsIHNjcm9sbExlZnQpO1xuXHRcdFx0XHRcblx0XHRcdFx0ZWxzZSBpZiAoc2Nyb2xsVG9wID4gMCAmJiBzY3JvbGxUb3AgPCBvZmZzZXRIZWlnaHQpXG5cdFx0XHRcdFx0c2xpZGVBd2F5KFwieVwiLCBzY3JvbGxUb3ApO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cdFxuXHRjb25zdCBzbmFwOiBSYXcuU3R5bGUgPSB7XG5cdFx0c2Nyb2xsU25hcFN0b3A6IFwiYWx3YXlzXCIsXG5cdFx0c2Nyb2xsU25hcEFsaWduOiBcInN0YXJ0XCIsXG5cdH07XG59XG4iLCJcblxuXG5uYW1lc3BhY2UgU3F1YXJlc1xue1xuXHQvKipcblx0ICogQSBjbGFzcyB0aGF0IGNyZWF0ZXMgYSBzZXJpZXMgb2YgcGFuZXMgdGhhdCBzd2lwZSBob3Jpem9udGFsbHkgb24gbW9iaWxlLlxuXHQgKi9cblx0ZXhwb3J0IGNsYXNzIFBhbmVTd2lwZXJcblx0e1xuXHRcdHJlYWRvbmx5IGhlYWQ7XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0Y29uc3RydWN0b3IoKVxuXHRcdHtcblx0XHRcdHRoaXMuaGVhZCA9IHJhdy5kaXYoXG5cdFx0XHRcdERvY2suY292ZXIoKSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHdoaXRlU3BhY2U6IFwibm93cmFwXCIsXG5cdFx0XHRcdFx0b3ZlcmZsb3dYOiBcImF1dG9cIixcblx0XHRcdFx0XHRvdmVyZmxvd1k6IFwiaGlkZGVuXCIsXG5cdFx0XHRcdFx0c2Nyb2xsU25hcFR5cGU6IFwieCBtYW5kYXRvcnlcIixcblx0XHRcdFx0fSxcblx0XHRcdFx0cmF3LmNzcyhcIiA+IERJVlwiLCB7XG5cdFx0XHRcdFx0ZGlzcGxheTogXCJpbmxpbmUtYmxvY2tcIixcblx0XHRcdFx0XHR3aWR0aDogXCIxMDAlXCIsXG5cdFx0XHRcdFx0aGVpZ2h0OiBcIjEwMCVcIixcblx0XHRcdFx0XHR3aGl0ZVNwYWNlOiBcIm5vcm1hbFwiLFxuXHRcdFx0XHRcdHNjcm9sbFNuYXBBbGlnbjogXCJzdGFydFwiLFxuXHRcdFx0XHRcdHNjcm9sbFNuYXBTdG9wOiBcImFsd2F5c1wiLFxuXHRcdFx0XHRcdG92ZXJmbG93WDogXCJoaWRkZW5cIixcblx0XHRcdFx0XHRvdmVyZmxvd1k6IFwiYXV0b1wiLFxuXHRcdFx0XHR9KSxcblx0XHRcdFx0cmF3Lm9uKFwic2Nyb2xsXCIsICgpID0+IHRoaXMudXBkYXRlVmlzaWJsZVBhbmUoKSksXG5cdFx0XHQpO1xuXHRcdFx0XG5cdFx0XHRIYXQud2Vhcih0aGlzKTtcblx0XHRcdFt0aGlzLnZpc2libGVQYW5lQ2hhbmdlZCwgdGhpcy5fdmlzaWJsZVBhbmVDaGFuZ2VkXSA9IFxuXHRcdFx0XHRGb3JjZS5jcmVhdGU8KHZpc2libGVQYW5lSW5kZXg6IG51bWJlcikgPT4gdm9pZD4oKTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cmVhZG9ubHkgdmlzaWJsZVBhbmVDaGFuZ2VkO1xuXHRcdHByaXZhdGUgcmVhZG9ubHkgX3Zpc2libGVQYW5lQ2hhbmdlZDtcblx0XHRcblx0XHQvKiogKi9cblx0XHRhZGRQYW5lKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBhdDogbnVtYmVyID0gLTApXG5cdFx0e1xuXHRcdFx0Y29uc3QgcGFuZSA9IHJhdy5kaXYoXG5cdFx0XHRcdFwic3dpcGVyLXBhbmVcIixcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGhlaWdodDogXCIxMDAlXCIsXG5cdFx0XHRcdFx0b3ZlcmZsb3dYOiBcImhpZGRlblwiLFxuXHRcdFx0XHRcdG92ZXJmbG93WTogXCJhdXRvXCIsXG5cdFx0XHRcdFx0d2hpdGVTcGFjZTogXCJub3JtYWxcIixcblx0XHRcdFx0fSxcblx0XHRcdFx0ZWxlbWVudFxuXHRcdFx0KTtcblx0XHRcdFxuXHRcdFx0aWYgKGF0ID49IHRoaXMuaGVhZC5jaGlsZEVsZW1lbnRDb3VudCB8fCBPYmplY3QuaXMoYXQsIC0wKSlcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5oZWFkLmFwcGVuZChwYW5lKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGF0IDwgMClcblx0XHRcdHtcblx0XHRcdFx0YXQgPSBNYXRoLm1heCgwLCB0aGlzLmhlYWQuY2hpbGRFbGVtZW50Q291bnQgKyBhdCk7XG5cdFx0XHRcdGNvbnN0IGNoaWxkcmVuID0gQXJyYXkuZnJvbSh0aGlzLmhlYWQuY2hpbGRyZW4pO1xuXHRcdFx0XHRjaGlsZHJlblthdF0uYmVmb3JlKHBhbmUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRzZXRWaXNpYmxlUGFuZShpbmRleDogbnVtYmVyKVxuXHRcdHtcblx0XHRcdGNvbnN0IHcgPSB0aGlzLmhlYWQub2Zmc2V0V2lkdGg7XG5cdFx0XHR0aGlzLmhlYWQuc2Nyb2xsQnkodyAqIGluZGV4LCAwKTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cHJpdmF0ZSB1cGRhdGVWaXNpYmxlUGFuZSgpXG5cdFx0e1xuXHRcdFx0Y29uc3QgdyA9IHRoaXMuaGVhZC5vZmZzZXRXaWR0aDtcblx0XHRcdGNvbnN0IHMgPSB0aGlzLmhlYWQuc2Nyb2xsTGVmdDtcblx0XHRcdGNvbnN0IHBhbmVJbmRleCA9IE1hdGgucm91bmQocyAvIHcpO1xuXHRcdFx0XG5cdFx0XHRpZiAocGFuZUluZGV4ICE9PSB0aGlzLmxhc3RWaXNpYmxlUGFuZSlcblx0XHRcdFx0dGhpcy5fdmlzaWJsZVBhbmVDaGFuZ2VkKHBhbmVJbmRleCk7XG5cdFx0XHRcblx0XHRcdHRoaXMubGFzdFZpc2libGVQYW5lID0gcGFuZUluZGV4O1xuXHRcdH1cblx0XHRcblx0XHRwcml2YXRlIGxhc3RWaXNpYmxlUGFuZSA9IDA7XG5cdFx0XG5cdFx0LyoqIEdldHMgdGhlIG51bWJlciBvZiBwYW5lcyBpbiB0aGUgUGFuZVN3aXBlci4gKi9cblx0XHRnZXQgbGVuZ3RoKClcblx0XHR7XG5cdFx0XHRyZXR1cm4gdGhpcy5oZWFkLmNoaWxkRWxlbWVudENvdW50O1xuXHRcdH1cblx0fVxufVxuIiwiXG5uYW1lc3BhY2UgU3F1YXJlc1xue1xuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIFByb2ZpbGVIYXRcblx0e1xuXHRcdHJlYWRvbmx5IGhlYWQ7XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0Y29uc3RydWN0b3IoKVxuXHRcdHtcblx0XHRcdHRoaXMuaGVhZCA9IHJhdy5kaXYoXG5cdFx0XHRcdFxuXHRcdFx0KTtcblx0XHRcdFxuXHRcdFx0SGF0LndlYXIodGhpcyk7XG5cdFx0fVxuXHR9XG59XG4iLCJcbm5hbWVzcGFjZSBTcXVhcmVzXG57XG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgUHVsbFRvUmVmcmVzaEhhdFxuXHR7XG5cdFx0cmVhZG9ubHkgaGVhZDtcblx0XHRwcml2YXRlIHJlYWRvbmx5IHN5bWJvbDtcblx0XHRwcml2YXRlIHJvdGF0aW9uRGVncmVzcyA9IDA7XG5cdFx0cHJpdmF0ZSBhbmltYXRpb246IEFuaW1hdGlvbiB8IG51bGwgPSBudWxsO1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgdGFyZ2V0OiBIVE1MRWxlbWVudClcblx0XHR7XG5cdFx0XHRjb25zdCBzaXplID0gKHBhcnNlSW50KFN0eWxlLmJvcmRlclJhZGl1c0xhcmdlKSAqIDIpICsgXCJweFwiO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmhlYWQgPSByYXcuZGl2KFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0d2lkdGg6IHNpemUsXG5cdFx0XHRcdFx0aGVpZ2h0OiBzaXplLFxuXHRcdFx0XHRcdHRleHRBbGlnbjogXCJjZW50ZXJcIixcblx0XHRcdFx0XHRib3JkZXJSYWRpdXM6IFwiMTAwJVwiLFxuXHRcdFx0XHRcdHpJbmRleDogMSxcblx0XHRcdFx0XHRvcGFjaXR5OiAwLFxuXHRcdFx0XHRcdHBvaW50ZXJFdmVudHM6IFwibm9uZVwiLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRTdHlsZS5iYWNrZHJvcEJsdXIoKSxcblx0XHRcdFx0cmF3Lm9uKHRhcmdldCwgXCJzY3JvbGxcIiwgKCkgPT4gdGhpcy5oYW5kbGVUYXJnZXRTY3JvbGwoKSksXG5cdFx0XHRcdHRoaXMuc3ltYm9sID0gcmF3LmRpdihcblx0XHRcdFx0XHREb2NrLmNlbnRlcigpLFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHdpZHRoOiBmYWN0b3IgKiA5ICsgXCJweFwiLFxuXHRcdFx0XHRcdFx0aGVpZ2h0OiBmYWN0b3IgKiAxNiArIFwicHhcIixcblx0XHRcdFx0XHRcdGJvcmRlclJhZGl1czogXCI2cHhcIixcblx0XHRcdFx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDEyOCwgMTI4LCAxMjgsIDAuNzUpXCIsXG5cdFx0XHRcdFx0XHR0cmFuc2l0aW9uRHVyYXRpb246IFwiMC4xc1wiLFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0KVxuXHRcdFx0KTtcblx0XHRcdFxuXHRcdFx0SGF0LndlYXIodGhpcyk7XG5cdFx0XHRbdGhpcy5vblJlZnJlc2gsIHRoaXMuX29uUmVmcmVzaF0gPSBGb3JjZS5jcmVhdGU8KCkgPT4gdm9pZD4oKTtcblx0XHR9XG5cdFx0XG5cdFx0cmVhZG9ubHkgb25SZWZyZXNoO1xuXHRcdHByaXZhdGUgcmVhZG9ubHkgX29uUmVmcmVzaDtcblx0XHRcblx0XHQvKiogKi9cblx0XHRwcml2YXRlIGhhbmRsZVRhcmdldFNjcm9sbCgpXG5cdFx0e1xuXHRcdFx0aWYgKHRoaXMuYW5pbWF0aW9uKVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcblx0XHRcdGNvbnN0IGUgPSB0aGlzLnRhcmdldDtcblx0XHRcdGNvbnN0IG92ZXJzY3JvbGxBbW91bnQgPSBNYXRoLm1heCgwLCBlLnNjcm9sbFRvcCArIGUub2Zmc2V0SGVpZ2h0IC0gZS5zY3JvbGxIZWlnaHQpO1xuXHRcdFx0XHRcblx0XHRcdGlmIChvdmVyc2Nyb2xsQW1vdW50IDw9IDApXG5cdFx0XHRcdHRoaXMuc2V0TG9hZGluZ0FuaW1hdGlvbihmYWxzZSk7XG5cdFx0XHRcblx0XHRcdGVsc2UgaWYgKG92ZXJzY3JvbGxBbW91bnQgPCBiZWdpblJlZnJlc2hGcmFtZSlcblx0XHRcdFx0dGhpcy5zZXRBbmltYXRpb25GcmFtZShvdmVyc2Nyb2xsQW1vdW50KTtcblx0XHRcdFxuXHRcdFx0ZWxzZSBpZiAob3ZlcnNjcm9sbEFtb3VudCA+PSBiZWdpblJlZnJlc2hGcmFtZSlcblx0XHRcdFx0dGhpcy5zZXRMb2FkaW5nQW5pbWF0aW9uKHRydWUpO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRwcml2YXRlIHNldEFuaW1hdGlvbkZyYW1lKG46IG51bWJlcilcblx0XHR7XG5cdFx0XHRuID0gTWF0aC5tYXgoMCwgbik7XG5cdFx0XHRjb25zdCBvcGFjaXR5ID0gTWF0aC5taW4oMSwgbiAvIGJlZ2luUmVmcmVzaEZyYW1lKTtcblx0XHRcdHRoaXMucm90YXRpb25EZWdyZXNzID0gTWF0aC5yb3VuZChuICogMS41KTtcblx0XHRcdHRoaXMuaGVhZC5zdHlsZS5vcGFjaXR5ID0gb3BhY2l0eS50b1N0cmluZygpO1xuXHRcdFx0dGhpcy5zeW1ib2wuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZVooJHt0aGlzLnJvdGF0aW9uRGVncmVzc31kZWcpYDtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0c2V0TG9hZGluZ0FuaW1hdGlvbihlbmFibGU6IGJvb2xlYW4pXG5cdFx0e1xuXHRcdFx0aWYgKGVuYWJsZSAmJiAhdGhpcy5hbmltYXRpb24pXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMuaGVhZC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcInJnYmEoMCwgMCwgMCwgMC41KVwiO1xuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5hbmltYXRpb24gPSB0aGlzLnN5bWJvbC5hbmltYXRlKFxuXHRcdFx0XHRcdFtcblx0XHRcdFx0XHRcdHsgdHJhbnNmb3JtOiBgcm90YXRlWigke3RoaXMucm90YXRpb25EZWdyZXNzfWRlZylgIH0sXG5cdFx0XHRcdFx0XHR7IHRyYW5zZm9ybTogYHJvdGF0ZVooJHt0aGlzLnJvdGF0aW9uRGVncmVzcyArIDM2MH1kZWcpYCB9LFxuXHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0aXRlcmF0aW9uczogMTAwMDAsXG5cdFx0XHRcdFx0XHRkdXJhdGlvbjogODAwLFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0KTtcblx0XHRcdFx0XG5cdFx0XHRcdHRoaXMuX29uUmVmcmVzaCgpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoIWVuYWJsZSAmJiB0aGlzLmFuaW1hdGlvbikgKGFzeW5jICgpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGFuaW1hdGlvbiA9IHRoaXMuYW5pbWF0aW9uITtcblx0XHRcdFx0dGhpcy5hbmltYXRpb24gPSBudWxsO1xuXHRcdFx0XHRjb25zdCBzID0gdGhpcy5oZWFkLnN0eWxlO1xuXHRcdFx0XHRzLnRyYW5zaXRpb25EdXJhdGlvbiA9IFwiMC44c1wiO1xuXHRcdFx0XHRzLnRyYW5zaXRpb25Qcm9wZXJ0eSA9IFwidHJhbnNmb3JtXCI7XG5cdFx0XHRcdHMudHJhbnNmb3JtID0gXCJzY2FsZSgxKVwiO1xuXHRcdFx0XHRhd2FpdCBVSS53YWl0KDEpO1xuXHRcdFx0XHRzLnRyYW5zZm9ybSA9IFwic2NhbGUoMClcIjtcblx0XHRcdFx0YXdhaXQgVUkud2FpdFRyYW5zaXRpb25FbmQodGhpcy5oZWFkKTtcblx0XHRcdFx0YW5pbWF0aW9uLmZpbmlzaCgpO1xuXHRcdFx0XHRzLm9wYWNpdHkgPSBcIjBcIjtcblx0XHRcdFx0cy50cmFuc2Zvcm0gPSBcInNjYWxlKDEpXCI7XG5cdFx0XHR9KSgpO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqIFRoZSBmcmFtZSBhdCB3aGljaCB0aGUgUmVmcmVzaEhhdCBiZWNvbWVzIGZ1bGx5IG9wYXF1ZSAqL1xuXHRjb25zdCBiZWdpblJlZnJlc2hGcmFtZSA9IDEwMDtcblx0XG5cdGNvbnN0IGZhY3RvciA9IDI7XG59XG4iLCJcbm5hbWVzcGFjZSBTcXVhcmVzXG57XG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgUm9vdEhhdFxuXHR7XG5cdFx0cmVhZG9ubHkgaGVhZDtcblx0XHRcblx0XHQvKiogKi9cblx0XHRjb25zdHJ1Y3RvcigpXG5cdFx0e1xuXHRcdFx0dGhpcy5oZWFkID0gcmF3LmRpdihcblx0XHRcdFx0VUkubm9TY3JvbGxCYXJzLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aGVpZ2h0OiBcImluaGVyaXRcIixcblx0XHRcdFx0XHR0b3A6IFwiZW52KHNhZmUtYXJlYS1pbnNldC10b3ApXCIsXG5cdFx0XHRcdFx0dGFiSW5kZXg6IDAsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJhdy5vbihkb2N1bWVudC5ib2R5LCBcInNxdWFyZXM6Zm9sbG93XCIsICgpID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aGlzLmNvbnN0cnVjdCgpO1xuXHRcdFx0XHR9KSxcblx0XHRcdFx0cmF3Lm9uKGRvY3VtZW50LmJvZHksIFwic3F1YXJlczp1bmZvbGxvd1wiLCBldiA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0RGF0YS5hcmNoaXZlRmVlZChldi5kZXRhaWwuZmVlZEtleSk7XG5cdFx0XHRcdH0pXG5cdFx0XHQpO1xuXHRcdFx0XG5cdFx0XHRIYXQud2Vhcih0aGlzKTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0YXN5bmMgY29uc3RydWN0KClcblx0XHR7XG5cdFx0XHRjb25zdCBzY3JvbGxzID0gYXdhaXQgRGF0YS5yZWFkU2Nyb2xscygpO1xuXHRcdFx0XG5cdFx0XHRsZXQgZTogSFRNTEVsZW1lbnQ7XG5cdFx0XHRcblx0XHRcdGlmIChzY3JvbGxzLmxlbmd0aCA9PT0gMClcblx0XHRcdHtcblx0XHRcdFx0ZSA9IHRoaXMucmVuZGVyRW1wdHlTdGF0ZSgpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoc2Nyb2xscy5sZW5ndGggPT09IDEgfHwgc2Nyb2xsc1swXS5mZWVkcy5sZW5ndGggPiAxKVxuXHRcdFx0e1xuXHRcdFx0XHRlID0gdGhpcy5yZW5kZXJTY3JvbGxTdGF0ZShzY3JvbGxzKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgZmVlZCA9IHNjcm9sbHNbMF0uZmVlZHNbMF07XG5cdFx0XHRcdGUgPSB0aGlzLnJlbmRlclNpbmdsZUZlZWRTdGF0ZShmZWVkKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dGhpcy5oZWFkLnJlcGxhY2VDaGlsZHJlbihlKTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cHJpdmF0ZSByZW5kZXJFbXB0eVN0YXRlKClcblx0XHR7XG5cdFx0XHRsZXQgZGl2OiBIVE1MRWxlbWVudDtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIHJhdy5kaXYoXG5cdFx0XHRcdFwiZW1wdHktc3RhdGVcIixcblx0XHRcdFx0RG9jay5jb3ZlcigpLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0b3ZlcmZsb3c6IFwiaGlkZGVuXCIsXG5cdFx0XHRcdFx0dG9wOiBcImNhbGMoLTEuNSAqIGVudihzYWZlLWFyZWEtaW5zZXQtdG9wKSlcIiwgLy8gY2VudGVyaW5nXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpdiA9IHJhdy5kaXYoXG5cdFx0XHRcdFx0RG9jay5jZW50ZXIoKSxcblx0XHRcdFx0XHRyYXcuY3NzKFwiID4gKlwiLCB7XG5cdFx0XHRcdFx0XHR0ZXh0QWxpZ246IFwiY2VudGVyXCIsXG5cdFx0XHRcdFx0XHRtYXJnaW46IFwiNDBweCBhdXRvXCIsXG5cdFx0XHRcdFx0XHRvcGFjaXR5OiAwLFxuXHRcdFx0XHRcdFx0dHJhbnNmb3JtOiBcInRyYW5zbGF0ZVkoODBweClcIixcblx0XHRcdFx0XHRcdHRyYW5zaXRpb25Qcm9wZXJ0eTogXCJvcGFjaXR5LCB0cmFuc2Zvcm1cIixcblx0XHRcdFx0XHRcdHRyYW5zaXRpb25EdXJhdGlvbjogXCIxc1wiLFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdHJhdy5kaXYoZSA9PiB7IGUuaW5uZXJIVE1MID0gSW1hZ2VzLmFwcExvZ28gfSksXG5cdFx0XHRcdFx0cmF3LmRpdihcblx0XHRcdFx0XHRcdFN0eWxlLnRleHRUaXRsZTEoU3RyaW5ncy5vcGVuaW5nVGl0bGUpLFxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0cmF3LmRpdihcblx0XHRcdFx0XHRcdHsgbWF4V2lkdGg6IFwiMTdlbVwiIH0sXG5cdFx0XHRcdFx0XHRTdHlsZS50ZXh0UGFyYWdyYXBoKFN0cmluZ3Mub3BlbmluZ01lc3NhZ2UpXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRXaWRnZXQuYXR0ZW50aW9uQnV0dG9uKFN0cmluZ3Mub3BlbmluZ0FjdGlvbiwgKCkgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRVdGlsLm9wZW5XZWJMaW5rKFN0cmluZ3MuZmluZEZlZWRzVXJsKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGhyZWY6IFN0cmluZ3MuZmluZEZlZWRzVXJsLFxuXHRcdFx0XHRcdFx0dGFyZ2V0OiBcIl9ibGFua1wiXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdCksXG5cdFx0XHRcdHJhdy5vbihcImNvbm5lY3RlZFwiLCBhc3luYyAoKSA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YXdhaXQgVUkud2FpdCgxMCk7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBlbGVtZW50IG9mIFF1ZXJ5LmNoaWxkcmVuKGRpdikpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc3QgcyA9IGVsZW1lbnQuc3R5bGU7XG5cdFx0XHRcdFx0XHRzLm9wYWNpdHkgPSBcIjFcIjtcblx0XHRcdFx0XHRcdHMudHJhbnNmb3JtID0gXCJ0cmFuc2xhdGVZKDApXCI7XG5cdFx0XHRcdFx0XHRhd2FpdCBVSS53YWl0KDIwMCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cHJpdmF0ZSByZW5kZXJTaW5nbGVGZWVkU3RhdGUoZmVlZDogSUZlZWREZXRhaWwpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIG5ldyBTY3JvbGxGZWVkVmlld2VySGF0KGZlZWQsIFtdKS5oZWFkO1xuXHRcdH1cblx0XHRcblx0XHQvKipcblx0XHQgKiBSZW5kZXJzIHRoZSBmdWxsIGFwcGxpY2F0aW9uIHN0YXRlIHdoZXJlIHRoZXJlIGlzIGEgXG5cdFx0ICogYXJlIG11bHRpcGxlIGZlZWRzIG11bHRpLXBsZXhlZCB3aXRoaW4gYSBzaW5nbGUgc2Nyb2xsLlxuXHRcdCAqL1xuXHRcdHByaXZhdGUgcmVuZGVyU2Nyb2xsU3RhdGUoc2Nyb2xsczogSVNjcm9sbFtdKVxuXHRcdHtcblx0XHRcdGNvbnN0IHBhbmVTd2lwZXIgPSBuZXcgUGFuZVN3aXBlcigpO1xuXHRcdFx0XHRcblx0XHRcdGZvciAoY29uc3Qgc2Nyb2xsIG9mIHNjcm9sbHMpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHZpZXdlciA9IG5ldyBTY3JvbGxNdXhWaWV3ZXJIYXQoc2Nyb2xsKTtcblx0XHRcdFx0cGFuZVN3aXBlci5hZGRQYW5lKHZpZXdlci5oZWFkKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0aWYgKHBhbmVTd2lwZXIubGVuZ3RoID09PSAwKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBEaXNwbGF5IHRoZSBmaXJzdC1ydW4gZXhwZXJpZW5jZS5cblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0cGFuZVN3aXBlci5hZGRQYW5lKG5ldyBGb2xsb3dlcnNIYXQoKS5oZWFkKTtcblx0XHRcdFx0dGhpcy5oZWFkLmFwcGVuZChwYW5lU3dpcGVyLmhlYWQpO1xuXHRcdFx0XHRcblx0XHRcdFx0Y29uc3QgZG90c0hhdCA9IG5ldyBEb3RzSGF0KCk7XG5cdFx0XHRcdGRvdHNIYXQuaW5zZXJ0KDIpO1xuXHRcdFx0XHRkb3RzSGF0LmhpZ2hsaWdodCgwKTtcblx0XHRcdFx0XG5cdFx0XHRcdHJhdy5nZXQoZG90c0hhdC5oZWFkKSh7XG5cdFx0XHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHRcdFx0XHRsZWZ0OiAwLFxuXHRcdFx0XHRcdHJpZ2h0OiAwLFxuXHRcdFx0XHRcdGJvdHRvbTpcblx0XHRcdFx0XHRcdENBUEFDSVRPUiA/IFwiMTA1cHhcIiA6XG5cdFx0XHRcdFx0XHRERU1PID8gMCA6XG5cdFx0XHRcdFx0XHRcIjE1cHhcIixcblx0XHRcdFx0XHRtYXJnaW46IFwiYXV0b1wiLFxuXHRcdFx0XHR9KTtcblx0XHRcdFx0XG5cdFx0XHRcdHRoaXMuaGVhZC5hcHBlbmQoZG90c0hhdC5oZWFkKTtcblx0XHRcdFx0XG5cdFx0XHRcdFxuXHRcdFx0XHRcblx0XHRcdFx0cGFuZVN3aXBlci52aXNpYmxlUGFuZUNoYW5nZWQoaW5kZXggPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRvdHNIYXQuaGlnaGxpZ2h0KGluZGV4KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHJldHVybiBwYW5lU3dpcGVyLmhlYWQ7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIEdldHMgdGhlIGZ1bGx5IHF1YWxpZmllZCBVUkwgd2hlcmUgdGhlIHBvc3QgcmVzaWRlcywgd2hpY2ggaXMgY2FsY3VsYXRlZFxuXHRcdCAqIGJ5IGNvbmNhdGVuYXRpbmcgdGhlIHBvc3QgcGF0aCB3aXRoIHRoZSBjb250YWluaW5nIGZlZWQgVVJMLlxuXHRcdCAqL1xuXHRcdGdldFBvc3RVcmwocG9zdDogSVBvc3QpXG5cdFx0e1xuXHRcdFx0Y29uc3QgZmVlZEZvbGRlciA9IFdlYmZlZWQuZ2V0Rm9sZGVyT2YocG9zdC5mZWVkLnVybCk7XG5cdFx0XHRyZXR1cm4gZmVlZEZvbGRlciArIHBvc3QucGF0aDtcblx0XHR9XG5cdH1cbn1cbiIsIlxubmFtZXNwYWNlIFNxdWFyZXNcbntcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBTY3JvbGxDcmVhdG9ySGF0XG5cdHtcblx0XHRyZWFkb25seSBoZWFkO1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGNvbnN0cnVjdG9yKClcblx0XHR7XG5cdFx0XHR0aGlzLmhlYWQgPSByYXcuZGl2KFxuXHRcdFx0XHRcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG59XG4iLCJcbm5hbWVzcGFjZSBDb3Zlclxue1xuXHQvKiogKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvdmVyU2Nyb2xsRmVlZFZpZXdlckhhdCgpXG5cdHtcblx0XHRhd2FpdCBTcXVhcmVzLnN0YXJ0dXAoKTtcblx0XHRcblx0XHRjb25zdCBmZWVkOiBTcXVhcmVzLklGZWVkRGV0YWlsID0ge1xuXHRcdFx0a2V5OiAxNjk2OTQ3OTc3MDExLFxuXHRcdFx0dXJsOiBcImh0dHBzOi8vd2ViZmVlZC10dWxpcHMucGFnZXMuZGV2L2luZGV4LnR4dFwiLFxuXHRcdFx0aWNvbjogXCJpY29uLmpwZ1wiLFxuXHRcdFx0YXV0aG9yOiBcIk1yIFJhY2Nvb25zXCIsXG5cdFx0XHRkZXNjcmlwdGlvbjogXCJTYW1wbGUgZmVlZCBvZiByYWNjb29uc1wiLFxuXHRcdFx0Y2hlY2tzdW06IFwiP1wiLFxuXHRcdH07XG5cdFx0XG5cdFx0Y29uc3QgZmVlZFVybCA9IFwiaHR0cHM6Ly93ZWJmZWVkLXR1bGlwcy5wYWdlcy5kZXYvaW5kZXgudHh0XCI7XG5cdFx0Y29uc3QgdXJscyA9IGF3YWl0IFdlYmZlZWQuZG93bmxvYWRJbmRleChmZWVkVXJsKTtcblx0XHRpZiAoIXVybHMpXG5cdFx0XHR0aHJvdyBcIk5vIGZlZWQgbG9hZGVkXCI7XG5cdFx0XG5cdFx0Y29uc3QgaGF0ID0gbmV3IFNxdWFyZXMuU2Nyb2xsRmVlZFZpZXdlckhhdChmZWVkLCB1cmxzKTtcblx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZChoYXQuaGVhZCk7XG5cdH1cbn1cbiIsIlxubmFtZXNwYWNlIFNxdWFyZXNcbntcblx0Y29uc3QgdHJhbnNpdGlvbkR1cmF0aW9uID0gXCIwLjVzXCI7XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGFic3RyYWN0IGNsYXNzIFNjcm9sbFZpZXdlckhhdFxuXHR7XG5cdFx0cmVhZG9ubHkgaGVhZDtcblx0XHRwcml2YXRlIHJlYWRvbmx5IGdyaWRDb250YWluZXI7XG5cdFx0cHJpdmF0ZSByZWFkb25seSBncmlkOiBHcmlkSGF0O1xuXHRcdHByaXZhdGUgcmVhZG9ubHkgcHVsbFRvUmVmcmVzaEhhdDtcblx0XHRwcml2YXRlIHNlbGVjdGVkR3JpZEl0ZW06IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0Y29uc3RydWN0b3IoKVxuXHRcdHtcblx0XHRcdHRoaXMuZ3JpZCA9IG5ldyBHcmlkSGF0KCk7XG5cdFx0XHRjb25zdCBib3JkZXJSYWRpdXMgPSAoQ0FQQUNJVE9SIHx8IERFTU8pID8gXCIzMHB4XCIgOiAwO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmhlYWQgPSByYXcuZGl2KFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aGVpZ2h0OiAoQ0FQQUNJVE9SIHx8IERFTU8pID8gXCIxNzcuNzc3N3Z3XCIgOiBcIjEwMCVcIixcblx0XHRcdFx0XHRhbGlnblNlbGY6IFwiY2VudGVyXCIsXG5cdFx0XHRcdFx0Ym9yZGVyUmFkaXVzLFxuXHRcdFx0XHRcdG92ZXJmbG93OiBcImhpZGRlblwiLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0aGlzLmdyaWRDb250YWluZXIgPSByYXcuZGl2KFxuXHRcdFx0XHRcdFwiZ3JpZC1jb250YWluZXJcIixcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRoZWlnaHQ6IFwiMTAwJVwiLFxuXHRcdFx0XHRcdFx0Ym9yZGVyUmFkaXVzLFxuXHRcdFx0XHRcdFx0b3ZlcmZsb3c6IFwiaGlkZGVuXCIsXG5cdFx0XHRcdFx0XHR0cmFuc2l0aW9uRHVyYXRpb24sXG5cdFx0XHRcdFx0XHR0cmFuc2l0aW9uUHJvcGVydHk6IFwidHJhbnNmb3JtLCBvcGFjaXR5XCIsXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpLFxuXHRcdFx0XHQhKENBUEFDSVRPUiB8fCBERU1PKSAmJiByYXcuZGl2KFxuXHRcdFx0XHRcdERvY2suYm90dG9tUmlnaHQoMTApLFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHpJbmRleDogMSxcblx0XHRcdFx0XHRcdGNvbG9yOiBcIndoaXRlXCIsXG5cdFx0XHRcdFx0XHRib3JkZXJSYWRpdXM6IFwiMTAwJVwiLFxuXHRcdFx0XHRcdFx0cGFkZGluZzogXCIxMHB4XCIsXG5cdFx0XHRcdFx0XHR3aWR0aDogXCI1MHB4XCIsXG5cdFx0XHRcdFx0XHRoZWlnaHQ6IFwiNTBweFwiLFxuXHRcdFx0XHRcdFx0bGluZUhlaWdodDogXCIzM3B4XCIsXG5cdFx0XHRcdFx0XHR0ZXh0QWxpZ246IFwiY2VudGVyXCIsXG5cdFx0XHRcdFx0XHRmb250U2l6ZTogXCIyNXB4XCIsXG5cdFx0XHRcdFx0XHRmb250V2VpZ2h0OiA3MDAsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRTdHlsZS5iYWNrZ3JvdW5kT3ZlcmxheSgpLFxuXHRcdFx0XHRcdFN0eWxlLmNsaWNrYWJsZSxcblx0XHRcdFx0XHR0YOKGu2AsXG5cdFx0XHRcdFx0cmF3Lm9uKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5oYW5kbGVSZWZyZXNoSW5uZXIoKSksXG5cdFx0XHRcdCksXG5cdFx0XHRcdHJhdy5nZXQodGhpcy5wdWxsVG9SZWZyZXNoSGF0ID0gbmV3IFB1bGxUb1JlZnJlc2hIYXQodGhpcy5ncmlkLmhlYWQpKShcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuXHRcdFx0XHRcdFx0Ym90dG9tOiBcIjIwcHhcIixcblx0XHRcdFx0XHRcdGxlZnQ6IDAsXG5cdFx0XHRcdFx0XHRyaWdodDogMCxcblx0XHRcdFx0XHRcdG1hcmdpbjogXCJhdXRvXCIsXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXHRcdFx0XG5cdFx0XHRIYXQud2Vhcih0aGlzKTtcblx0XHRcdHRoaXMuY29uc3RydWN0R3JpZCgpO1xuXHRcdFx0dGhpcy5zaG93R3JpZCh0cnVlKTtcblx0XHRcdHRoaXMucHVsbFRvUmVmcmVzaEhhdC5vblJlZnJlc2goKCkgPT4gdGhpcy5oYW5kbGVSZWZyZXNoSW5uZXIoKSk7XG5cdFx0XHR0aGlzLmdyaWRDb250YWluZXIuYXBwZW5kKHRoaXMuZ3JpZC5oZWFkKTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cHJvdGVjdGVkIGFic3RyYWN0IGdldFBvc3QoaW5kZXg6IG51bWJlcik6IFJldHVyblR5cGU8UmVuZGVyRm4+O1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByb3RlY3RlZCBhYnN0cmFjdCBoYW5kbGVSZWZyZXNoKCk6IFByb21pc2U8dm9pZD47XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cHJpdmF0ZSBhc3luYyBoYW5kbGVSZWZyZXNoSW5uZXIoKVxuXHRcdHtcblx0XHRcdGF3YWl0IHRoaXMuaGFuZGxlUmVmcmVzaCgpO1xuXHRcdFx0dGhpcy5ncmlkLnRyeUFwcGVuZFBvc3RlcnMoMSk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByb3RlY3RlZCBhYnN0cmFjdCBnZXRQYWdlSW5mbyhpbmRleDogbnVtYmVyKTogUHJvbWlzZTx7XG5cdFx0XHRyZWFkb25seSBoZWFkOiBIVE1MRWxlbWVudFtdO1xuXHRcdFx0cmVhZG9ubHkgc2VjdGlvbnM6IEhUTUxFbGVtZW50W107XG5cdFx0XHRyZWFkb25seSBmZWVkOiBJRmVlZERldGFpbDtcblx0XHR9Pjtcblx0XHRcblx0XHQvKiogKi9cblx0XHRwcm90ZWN0ZWQgYWJzdHJhY3QgaGFuZGxlUG9zdFZpc2l0ZWQoaW5kZXg6IG51bWJlcik6IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByaXZhdGUgY29uc3RydWN0R3JpZCgpXG5cdFx0e1xuXHRcdFx0dGhpcy5ncmlkLmhlYWQuc3R5bGUuYm9yZGVyUmFkaXVzID0gXCJpbmhlcml0XCI7XG5cdFx0XHR0aGlzLmdyaWQuaGFuZGxlUmVuZGVyKGluZGV4ID0+IHRoaXMuZ2V0UG9zdChpbmRleCkpO1xuXHRcdFx0dGhpcy5ncmlkLmhhbmRsZVNlbGVjdChhc3luYyAoZSwgaW5kZXgpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGlmICh0aGlzLnNlbGVjdGVkR3JpZEl0ZW0pXG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5zZWxlY3RlZEdyaWRJdGVtID0gZTtcblx0XHRcdFx0dGhpcy5zaG93UGFnZShpbmRleCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cHJpdmF0ZSBhc3luYyBzaG93UGFnZShpbmRleDogbnVtYmVyKVxuXHRcdHtcblx0XHRcdGNvbnN0IHBhZ2VJbmZvID0gYXdhaXQgdGhpcy5nZXRQYWdlSW5mbyhpbmRleCk7XG5cdFx0XHRjb25zdCBwYWdlSGF0ID0gbmV3IFBhZ2VIYXQocGFnZUluZm8uaGVhZCwgcGFnZUluZm8uc2VjdGlvbnMsIHBhZ2VJbmZvLmZlZWQpO1xuXHRcdFx0XG5cdFx0XHRyYXcuZ2V0KHBhZ2VIYXQpKFxuXHRcdFx0XHREb2NrLmNvdmVyKCksXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0cmFuc2l0aW9uRHVyYXRpb24sXG5cdFx0XHRcdFx0dHJhbnNpdGlvblByb3BlcnR5OiBcInRyYW5zZm9ybVwiLFxuXHRcdFx0XHRcdHRyYW5zZm9ybTogXCJ0cmFuc2xhdGVZKDExMCUpXCIsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJhdy5vbihcImNvbm5lY3RlZFwiLCAoKSA9PiBzZXRUaW1lb3V0KGFzeW5jICgpID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGUgb2YgUXVlcnkuYW5jZXN0b3JzKHRoaXMuaGVhZCkpXG5cdFx0XHRcdFx0XHRpZiAoZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuXHRcdFx0XHRcdFx0XHRlLmNsYXNzTGlzdC5hZGQobm9PdmVyZmxvd0NsYXNzKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRhd2FpdCBVSS53YWl0KDEpO1xuXHRcdFx0XHRcdHBhZ2VIYXQuaGVhZC5zdHlsZS50cmFuc2Zvcm0gPSBcInRyYW5zbGF0ZVkoMClcIjtcblx0XHRcdFx0XHRhd2FpdCBVSS53YWl0VHJhbnNpdGlvbkVuZChwYWdlSGF0LmhlYWQpO1xuXHRcdFx0XHRcdHRoaXMuZ3JpZENvbnRhaW5lci5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSBcIjBzXCI7XG5cdFx0XHRcdH0pKSxcblx0XHRcdFx0cmF3Lm9uKHRoaXMuZ3JpZC5oZWFkLCBcInNjcm9sbFwiLCBhc3luYyAoKSA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKHBhZ2VIYXQuaGVhZC5pc0Nvbm5lY3RlZClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRhd2FpdCBwYWdlSGF0LmZvcmNlUmV0cmFjdCgpO1xuXHRcdFx0XHRcdFx0dGhpcy5zaG93R3JpZCh0cnVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHQpO1xuXHRcdFx0XG5cdFx0XHRwYWdlSGF0Lm9uUmV0cmFjdChwY3QgPT4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBzID0gdGhpcy5ncmlkQ29udGFpbmVyLnN0eWxlO1xuXHRcdFx0XHRzLnRyYW5zZm9ybSA9IHRyYW5zbGF0ZVoocGN0ICogdHJhbnNsYXRlWk1heCArIFwicHhcIik7XG5cdFx0XHRcdHMub3BhY2l0eSA9ICgxIC0gcGN0KS50b1N0cmluZygpO1xuXHRcdFx0fSkpO1xuXHRcdFx0XG5cdFx0XHRjb25zdCBkaXNjb25uZWN0ZWQgPSBhc3luYyAoKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRpZiAodGhpcy5zZWxlY3RlZEdyaWRJdGVtKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc3QgcyA9IHRoaXMuc2VsZWN0ZWRHcmlkSXRlbS5zdHlsZTtcblx0XHRcdFx0XHRzLnRyYW5zaXRpb25EdXJhdGlvbiA9IFwiMC43NXNcIjtcblx0XHRcdFx0XHRzLnRyYW5zaXRpb25Qcm9wZXJ0eSA9IFwib3BhY2l0eSwgZmlsdGVyXCI7XG5cdFx0XHRcdFx0Ly8hIFRoZXNlIHRyYW5zaXRpb25zIGJyZWFrIGFmdGVyIGEgZmV3IG9wZW5pbmdzIGFuZFxuXHRcdFx0XHRcdC8vISBjbG9zaW5ncyBvbiBtb2JpbGUgU2FmYXJpLiBJcyB0aGlzIGEgYnVnIGluIHRoZSBlbmdpbmU/XG5cdFx0XHRcdFx0YXBwbHlWaXNpdGVkU3R5bGUodGhpcy5zZWxlY3RlZEdyaWRJdGVtKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5zZWxlY3RlZEdyaWRJdGVtID0gbnVsbDtcblx0XHRcdFx0dGhpcy5ncmlkQ29udGFpbmVyLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IHRyYW5zaXRpb25EdXJhdGlvbjtcblx0XHRcdFx0XG5cdFx0XHRcdGZvciAoY29uc3QgZSBvZiBRdWVyeS5hbmNlc3RvcnModGhpcy5oZWFkKSlcblx0XHRcdFx0XHRpZiAoZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuXHRcdFx0XHRcdFx0ZS5jbGFzc0xpc3QucmVtb3ZlKG5vT3ZlcmZsb3dDbGFzcyk7XG5cdFx0XHRcdFxuXHRcdFx0XHRjb25zdCBpbmZvID0gdGhpcy5nZXRQb3N0KGluZGV4KTtcblx0XHRcdFx0aWYgKGluZm8pXG5cdFx0XHRcdFx0dGhpcy5oYW5kbGVQb3N0VmlzaXRlZChpbmRleCk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHBhZ2VIYXQub25EaXNjb25uZWN0KGRpc2Nvbm5lY3RlZCk7XG5cdFx0XHRcblx0XHRcdC8vISBUZW1wIGZpeFxuXHRcdFx0YXdhaXQgVUkud2FpdCgxMDApO1xuXHRcdFx0dGhpcy5ncmlkQ29udGFpbmVyLmFmdGVyKHBhZ2VIYXQuaGVhZCk7XG5cdFx0XHRhd2FpdCBVSS53YWl0KDEwMCk7XG5cdFx0XHRcblx0XHRcdHRoaXMuc2hvd0dyaWQoZmFsc2UpO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRwcml2YXRlIHNob3dHcmlkKHNob3c6IGJvb2xlYW4pXG5cdFx0e1xuXHRcdFx0Y29uc3QgcyA9IHRoaXMuZ3JpZENvbnRhaW5lci5zdHlsZTtcblx0XHRcdHMudHJhbnNpdGlvbkR1cmF0aW9uID0gdHJhbnNpdGlvbkR1cmF0aW9uO1xuXHRcdFx0cy50cmFuc2Zvcm0gPSB0cmFuc2xhdGVaKHNob3cgPyBcIjBcIiA6IHRyYW5zbGF0ZVpNYXggKyBcInB4XCIpO1xuXHRcdFx0cy5vcGFjaXR5ID0gc2hvdyA/IFwiMVwiIDogXCIwXCI7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKipcblx0ICogQSBzcGVjaWFsaXphdGlvbiBvZiB0aGUgU2Nyb2xsVmlld2VySGF0IHRoYXQgc3VwcG9ydHMgc2NlbmFyaW9zIHdoZXJlXG5cdCAqIG11bHRpcGxlIGZlZWRzIGFyZSBtdWx0aXBsZXhlZCBpbnRvIGEgc2luZ2xlIHZpZXcuXG5cdCAqL1xuXHRleHBvcnQgY2xhc3MgU2Nyb2xsTXV4Vmlld2VySGF0IGV4dGVuZHMgU2Nyb2xsVmlld2VySGF0XG5cdHtcblx0XHQvKiogKi9cblx0XHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHNjcm9sbDogSVNjcm9sbClcblx0XHR7XG5cdFx0XHRzdXBlcigpO1xuXHRcdFx0dGhpcy5mb3JlZ3JvdW5kRmV0Y2hlciA9IG5ldyBGb3JlZ3JvdW5kRmV0Y2hlcigpO1xuXHRcdH1cblx0XHRcblx0XHRwcml2YXRlIHJlYWRvbmx5IGZvcmVncm91bmRGZXRjaGVyO1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByb3RlY3RlZCBhc3luYyBoYW5kbGVSZWZyZXNoKClcblx0XHR7XG5cdFx0XHRhd2FpdCB0aGlzLmZvcmVncm91bmRGZXRjaGVyLmZldGNoKCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByb3RlY3RlZCBnZXRQb3N0KGluZGV4OiBudW1iZXIpXG5cdFx0e1xuXHRcdFx0aWYgKGluZGV4ID49IERhdGEucmVhZFNjcm9sbFBvc3RDb3VudCh0aGlzLnNjcm9sbC5rZXkpKVxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIChhc3luYyAoKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRibG9jazpcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0IHBvc3QgPSBhd2FpdCBEYXRhLnJlYWRTY3JvbGxQb3N0KHRoaXMuc2Nyb2xsLmtleSwgaW5kZXgpO1xuXHRcdFx0XHRcdGlmIChwb3N0ID09PSBudWxsKVxuXHRcdFx0XHRcdFx0YnJlYWsgYmxvY2s7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Y29uc3QgdXJsID0gSGF0Lm92ZXIodGhpcywgUm9vdEhhdCkuZ2V0UG9zdFVybChwb3N0KTtcblx0XHRcdFx0XHRpZiAoIXVybClcblx0XHRcdFx0XHRcdGJyZWFrIGJsb2NrO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGNvbnN0IHBvc3RlciA9IGF3YWl0IFdlYmZlZWQuZG93bmxvYWRQb3N0ZXIodXJsKTtcblx0XHRcdFx0XHRpZiAoIXBvc3Rlcilcblx0XHRcdFx0XHRcdGJyZWFrIGJsb2NrO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHJldHVybiBwb3N0LnZpc2l0ZWQgPyBcblx0XHRcdFx0XHRcdGFwcGx5VmlzaXRlZFN0eWxlKHBvc3RlcikgOlxuXHRcdFx0XHRcdFx0cG9zdGVyO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRyZXR1cm4gV2ViZmVlZC5nZXRFcnJvclBvc3RlcigpO1xuXHRcdFx0fSkoKTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cHJvdGVjdGVkIGFzeW5jIGdldFBhZ2VJbmZvKGluZGV4OiBudW1iZXIpXG5cdFx0e1xuXHRcdFx0Y29uc3QgcG9zdCA9IGF3YWl0IERhdGEucmVhZFNjcm9sbFBvc3QodGhpcy5zY3JvbGwua2V5LCBpbmRleCk7XG5cdFx0XHRpZiAoIXBvc3QpXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcigpO1xuXHRcdFx0XG5cdFx0XHRjb25zdCByb290ID0gSGF0Lm92ZXIodGhpcywgUm9vdEhhdCk7XG5cdFx0XHRjb25zdCBwb3N0VXJsID0gcm9vdC5nZXRQb3N0VXJsKHBvc3QpIHx8IFwiXCI7XG5cdFx0XHRjb25zdCBwYWdlID0gYXdhaXQgV2ViZmVlZC5kb3dubG9hZFNlY3Rpb25zKHBvc3RVcmwpIHx8IFtdO1xuXHRcdFx0Y29uc29sZS5lcnJvcihcIkF3a3dhcmQgY29kZSBoZXJlLi4uIHN0dWZmIHByb2JhYmx5IGRvZXNuJ3Qgd29yay5cIik7XG5cdFx0XHRjb25zdCBoZWFkOiBIVE1MRWxlbWVudFtdID0gW107Ly9wYWdlPy5oZWFkIHx8IFtdO1xuXHRcdFx0Y29uc3Qgc2VjdGlvbnM6IEhUTUxFbGVtZW50W10gPSBwYWdlID9cblx0XHRcdFx0cGFnZS5zbGljZSgpIDpcblx0XHRcdFx0W2F3YWl0IFdlYmZlZWQuZ2V0RXJyb3JQb3N0ZXIoKV07XG5cdFx0XHRcblx0XHRcdGNvbnN0IGZlZWQgPSBhd2FpdCBEYXRhLnJlYWRGZWVkRGV0YWlsKHBvc3QuZmVlZC5rZXkpO1xuXHRcdFx0aWYgKCFmZWVkKVxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKTtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIHsgaGVhZCwgc2VjdGlvbnMsIGZlZWQgfTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cHJvdGVjdGVkIGFzeW5jIGhhbmRsZVBvc3RWaXNpdGVkKGluZGV4OiBudW1iZXIpXG5cdFx0e1xuXHRcdFx0Y29uc3QgcG9zdCA9IGF3YWl0IERhdGEucmVhZFNjcm9sbFBvc3QodGhpcy5zY3JvbGwua2V5LCBpbmRleCk7XG5cdFx0XHRpZiAocG9zdClcblx0XHRcdHtcblx0XHRcdFx0cG9zdC52aXNpdGVkID0gdHJ1ZTtcblx0XHRcdFx0RGF0YS53cml0ZVBvc3QocG9zdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdFxuXHQvKipcblx0ICogQSBzcGVjaWFsaXphdGlvbiBvZiB0aGUgU2Nyb2xsVmlld2VySGF0IHRoYXQgc3VwcG9ydHMgc2NlbmFyaW9zIHdoZXJlXG5cdCAqIGEgc2luZ2xlIGZlZWQgaXMgZGlzcGxheWVkIHdpdGhpbiBhIHNpbmdsZSB2aWV3LlxuXHQgKi9cblx0ZXhwb3J0IGNsYXNzIFNjcm9sbEZlZWRWaWV3ZXJIYXQgZXh0ZW5kcyBTY3JvbGxWaWV3ZXJIYXRcblx0e1xuXHRcdC8qKiAqL1xuXHRcdGNvbnN0cnVjdG9yKFxuXHRcdFx0cHJpdmF0ZSByZWFkb25seSBmZWVkOiBJRmVlZERldGFpbCxcblx0XHRcdHByaXZhdGUgcmVhZG9ubHkgdXJsczogc3RyaW5nW10pXG5cdFx0e1xuXHRcdFx0c3VwZXIoKTtcblx0XHRcdFxuXHRcdFx0KGFzeW5jICgpID0+XG5cdFx0XHR7XG5cdFx0XHRcdERhdGEucmVhZEZlZWRQb3N0cyhmZWVkLmtleSk7XG5cdFx0XHR9KSgpO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRwcm90ZWN0ZWQgYXN5bmMgaGFuZGxlUmVmcmVzaCgpXG5cdFx0e1xuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByb3RlY3RlZCBnZXRQb3N0KGluZGV4OiBudW1iZXIpXG5cdFx0e1xuXHRcdFx0aWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLnVybHMubGVuZ3RoKVxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFxuXHRcdFx0Y29uc3QgdXJsID0gdGhpcy51cmxzW2luZGV4XTtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIChhc3luYyAoKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBtYXliZVBvc3RlciA9IGF3YWl0IFdlYmZlZWQuZG93bmxvYWRQb3N0ZXIodXJsKTtcblx0XHRcdFx0cmV0dXJuIG1heWJlUG9zdGVyIHx8IFdlYmZlZWQuZ2V0RXJyb3JQb3N0ZXIoKTtcblx0XHRcdH0pKCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByb3RlY3RlZCBhc3luYyBnZXRQYWdlSW5mbyhpbmRleDogbnVtYmVyKVxuXHRcdHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGhlYWQ6IFtdLFxuXHRcdFx0XHRzZWN0aW9uczogW10sXG5cdFx0XHRcdGZlZWQ6IHRoaXMuZmVlZCxcblx0XHRcdH07XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByb3RlY3RlZCBoYW5kbGVQb3N0VmlzaXRlZChpbmRleDogbnVtYmVyKSB7IH1cblx0fVxuXHRcblx0LyoqICovXG5cdGZ1bmN0aW9uIGFwcGx5VmlzaXRlZFN0eWxlKGU6IEhUTUxFbGVtZW50KVxuXHR7XG5cdFx0Y29uc3QgcyA9IGUuc3R5bGU7XG5cdFx0cy5maWx0ZXIgPSBcInNhdHVyYXRlKDApIGJyaWdodG5lc3MoMC40KVwiO1xuXHRcdHJldHVybiBlO1xuXHR9XG5cdFxuXHRjb25zdCB0cmFuc2xhdGVaID0gKGFtb3VudDogc3RyaW5nKSA9PiBgcGVyc3BlY3RpdmUoMTBweCkgdHJhbnNsYXRlWigke2Ftb3VudH0pYDtcblx0Y29uc3QgdHJhbnNsYXRlWk1heCA9IC0zO1xuXHRcblx0bGV0IG5vT3ZlcmZsb3dDbGFzcyA9IFwiXCI7XG5cdC8vY29uc3Qgbm9PdmVyZmxvd0NsYXNzMiA9IHJhdy5jc3Moe1xuXHQvL1x0b3ZlcmZsb3c6IFwiaGlkZGVuICFcIlxuXHQvL30pO1xufVxuIiwiXG5uYW1lc3BhY2UgU3F1YXJlc1xue1xuXHQvKiogKi9cblx0ZXhwb3J0IG5hbWVzcGFjZSBDb2xvclxuXHR7XG5cdFx0ZXhwb3J0IGxldCBkZWZhdWx0SHVlID0gMjE1O1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGV4cG9ydCBpbnRlcmZhY2UgSUNvbG9yXG5cdFx0e1xuXHRcdFx0cmVhZG9ubHkgaDogbnVtYmVyO1xuXHRcdFx0cmVhZG9ubHkgczogbnVtYmVyO1xuXHRcdFx0cmVhZG9ubHkgbDogbnVtYmVyO1xuXHRcdFx0cmVhZG9ubHkgYT86IG51bWJlcjtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIGZyb20odmFsdWVzOiBQYXJ0aWFsPElDb2xvcj4pXG5cdFx0e1xuXHRcdFx0Y29uc3QgaCA9IChBcnJheS5pc0FycmF5KHZhbHVlcykgPyB2YWx1ZXMuYXQoMCkgOiB2YWx1ZXMuaCkgPz8gZGVmYXVsdEh1ZTtcblx0XHRcdGNvbnN0IHMgPSAoQXJyYXkuaXNBcnJheSh2YWx1ZXMpID8gdmFsdWVzLmF0KDEpIDogdmFsdWVzLnMpID8/IDUwO1xuXHRcdFx0Y29uc3QgbCA9IChBcnJheS5pc0FycmF5KHZhbHVlcykgPyB2YWx1ZXMuYXQoMikgOiB2YWx1ZXMubCkgPz8gNTA7XG5cdFx0XHRjb25zdCBhID0gQXJyYXkuaXNBcnJheSh2YWx1ZXMpID8gMSA6IHZhbHVlcy5hID8/IDE7XG5cdFx0XHRyZXR1cm4gYSA9PT0gMSA/XG5cdFx0XHRcdGBoc2woJHtofSwgJHtzfSUsICR7bH0lKWAgOlxuXHRcdFx0XHRgaHNsYSgke2h9LCAke3N9JSwgJHtsfSUsICR7YX0pYDtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIHdoaXRlKGFscGhhID0gMSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gYWxwaGEgPT09IDEgPyBcIndoaXRlXCIgOiBgcmdiYSgyNTUsIDI1NSwgMjU1LCAke2FscGhhfSlgO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gYmxhY2soYWxwaGEgPSAxKVxuXHRcdHtcblx0XHRcdHJldHVybiBhbHBoYSA9PT0gMSA/IFwiYmxhY2tcIiA6IGByZ2JhKDAsIDAsIDAsICR7YWxwaGF9KWA7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGV4cG9ydCBmdW5jdGlvbiBncmF5KHZhbHVlID0gMTI4LCBhbHBoYSA9IDEpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGFscGhhID09PSAxID9cblx0XHRcdFx0YHJnYigke3ZhbHVlfSwgJHt2YWx1ZX0sICR7dmFsdWV9KWAgOlxuXHRcdFx0XHRgcmdiYSgke3ZhbHVlfSwgJHt2YWx1ZX0sICR7dmFsdWV9LCAke2FscGhhfSlgO1xuXHRcdH1cblx0fVxufVxuIiwiXG5uYW1lc3BhY2UgU3F1YXJlc1xue1xuXHQvKipcblx0ICogTmFtZXNwYWNlIG9mIGZ1bmN0aW9ucyBmb3IgY29udGFpbmVyIHF1ZXJ5IHVuaXRzLlxuXHQgKi9cblx0ZXhwb3J0IG5hbWVzcGFjZSBDcVxuXHR7XG5cdFx0LyoqXG5cdFx0ICogXG5cdFx0ICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIHdpZHRoKGFtb3VudDogbnVtYmVyLCB0YXJnZXRDb250YWluZXJDbGFzczogc3RyaW5nKVxuXHRcdHtcblx0XHRcdHJldHVybiBnZXRQcm9wZXJ0eShcIndpZHRoXCIsIFwid1wiLCBhbW91bnQsIHRhcmdldENvbnRhaW5lckNsYXNzKTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogXG5cdFx0ICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIGhlaWdodChhbW91bnQ6IG51bWJlciwgdGFyZ2V0Q29udGFpbmVyQ2xhc3M6IHN0cmluZylcblx0XHR7XG5cdFx0XHRyZXR1cm4gZ2V0UHJvcGVydHkoXCJoZWlnaHRcIiwgXCJoXCIsIGFtb3VudCwgdGFyZ2V0Q29udGFpbmVyQ2xhc3MpO1xuXHRcdH1cblx0XHRcblx0XHQvKipcblx0XHQgKiBcblx0XHQgKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gbGVmdChhbW91bnQ6IG51bWJlciwgdGFyZ2V0Q29udGFpbmVyQ2xhc3M6IHN0cmluZylcblx0XHR7XG5cdFx0XHRyZXR1cm4gZ2V0UHJvcGVydHkoXCJsZWZ0XCIsIFwid1wiLCBhbW91bnQsIHRhcmdldENvbnRhaW5lckNsYXNzKTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0ZnVuY3Rpb24gZ2V0UHJvcGVydHkoXG5cdFx0XHRwcm9wZXJ0eTogc3RyaW5nLFxuXHRcdFx0YXhpczogXCJ3XCIgfCBcImhcIixcblx0XHRcdGFtb3VudDogbnVtYmVyLFxuXHRcdFx0Y2xzOiBzdHJpbmcpOiBSYXcuUGFyYW1cblx0XHR7XG5cdFx0XHRpZiAoc3VwcG9ydHNDb250YWluZXJVbml0cyA9PT0gbnVsbClcblx0XHRcdFx0c3VwcG9ydHNDb250YWluZXJVbml0cyA9IHJhdy5kaXYoeyB3aWR0aDogXCIxY3F3XCIgfSkuc3R5bGUud2lkdGggIT09IFwiXCI7XG5cdFx0XHRcblx0XHRcdGxldCBjb250YWluZXI6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cdFx0XHRcblx0XHRcdHJldHVybiBlID0+IHJhdy5vbihcImNvbm5lY3RlZFwiLCAoKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRjb250YWluZXIgfHw9IFF1ZXJ5LmFuY2VzdG9ycyhlKS5maW5kKChjKTogYyBpcyBIVE1MRWxlbWVudCA9PiBcblx0XHRcdFx0XHRjIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiZcblx0XHRcdFx0XHRjLmNsYXNzTGlzdC5jb250YWlucyhjbHMpKSB8fCBudWxsO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKCFjb250YWluZXIpXG5cdFx0XHRcdFx0dGhyb3cgXCJDb250YWluZXIgbm90IGZvdW5kLlwiO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKHN1cHBvcnRzQ29udGFpbmVyVW5pdHMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb250YWluZXIuc3R5bGUuY29udGFpbmVyVHlwZSA9IFwic2l6ZVwiO1xuXHRcdFx0XHRcdGUuc3R5bGUuc2V0UHJvcGVydHkocHJvcGVydHksIGFtb3VudCArIFwiY3FcIiArIGF4aXMpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgUmVzaXplLndhdGNoKGNvbnRhaW5lciwgKHcsIGgpID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCB3T3JIID0gYXhpcyA9PT0gXCJ3XCIgPyB3IDogaDtcblx0XHRcdFx0XHRjb25zdCBzdHJpbmdpZmllZCA9ICgoYW1vdW50IC8gMTAwKSAqIHdPckgpLnRvRml4ZWQoMykgKyBcInB4XCI7XG5cdFx0XHRcdFx0ZS5zdHlsZS5zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgc3RyaW5naWZpZWQpO1xuXHRcdFx0XHR9LCB0cnVlKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRcblx0XHRsZXQgc3VwcG9ydHNDb250YWluZXJVbml0czogYm9vbGVhbiB8IG51bGwgPSBudWxsO1xuXHR9XG59IiwiXG5uYW1lc3BhY2UgU3F1YXJlc1xue1xuXHQvKiogKi9cblx0ZXhwb3J0IGVudW0gT3JpZ2luXG5cdHtcblx0XHR0b3BMZWZ0ID0gXCJvcmlnaW4tdGxcIixcblx0XHR0b3AgPSBcIm9yaWdpbi10XCIsXG5cdFx0dG9wUmlnaHQgPSBcIm9yaWdpbi10clwiLFxuXHRcdGxlZnQgPSBcIm9yaWdpbi1sXCIsXG5cdFx0Y2VudGVyID0gXCJvcmlnaW4tY1wiLFxuXHRcdHJpZ2h0ID0gXCJvcmlnaW4tclwiLFxuXHRcdGJvdHRvbUxlZnQgPSBcIm9yaWdpbi1ibFwiLFxuXHRcdGJvdHRvbSA9IFwib3JpZ2luLWJcIixcblx0XHRib3R0b21SaWdodCA9IFwib3JpZ2luLWJyXCIsXG5cdH1cbn1cbiIsIlxubmFtZXNwYWNlIFNxdWFyZXNcbntcblx0LyoqXG5cdCAqIEEgbmFtZXNwYWNlIG9mIGNvbG9yIHZhbHVlcyB0aGF0IGRlZmluZSB0aGUgY29sb3IgcGFsZXR0ZVxuXHQgKiB1c2VkIGFjcm9zcyB0aGUgYXBwbGljYXRpb24uXG5cdCAqL1xuXHRleHBvcnQgbmFtZXNwYWNlIFBhbFxuXHR7XG5cdFx0ZXhwb3J0IGNvbnN0IGdyYXkxID0gQ29sb3IuZ3JheSgxODApO1xuXHRcdGV4cG9ydCBjb25zdCBncmF5MiA9IENvbG9yLmdyYXkoMTAwKTtcblx0XHRleHBvcnQgY29uc3QgZ3JheTMgPSBDb2xvci5ncmF5KDYwKTtcblx0fVxufVxuIiwiXG5uYW1lc3BhY2UgU3F1YXJlc1xue1xuXHQvKiogKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGFwcGVuZENzc1Jlc2V0KClcblx0e1xuXHRcdGRvY3VtZW50LmhlYWQuYXBwZW5kKFxuXHRcdFx0cmF3LnN0eWxlKFxuXHRcdFx0XHRcIipcIiwge1xuXHRcdFx0XHRcdHBvc2l0aW9uOiBcInJlbGF0aXZlXCIsXG5cdFx0XHRcdFx0cGFkZGluZzogMCxcblx0XHRcdFx0XHRtYXJnaW46IDAsXG5cdFx0XHRcdFx0ekluZGV4OiAwLFxuXHRcdFx0XHRcdGJveFNpemluZzogXCJib3JkZXItYm94XCIsXG5cdFx0XHRcdFx0d2Via2l0Rm9udFNtb290aGluZzogXCJhbnRpYWxpYXNlZFwiLFxuXHRcdFx0XHRcdGNvbG9yOiBcImluaGVyaXRcIixcblx0XHRcdFx0XHRmb250U2l6ZTogXCJpbmhlcml0XCIsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdFwiOnJvb3RcIiwge1xuXHRcdFx0XHRcdGhlaWdodDogXCIxMDB2aFwiLFxuXHRcdFx0XHRcdGZvbnRTaXplOiBcIjIwcHhcIixcblx0XHRcdFx0XHRmb250RmFtaWx5OiBcIkludGVyLCAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIGF2ZW5pciBuZXh0LCBhdmVuaXIsIHNlZ29lIHVpLCBoZWx2ZXRpY2EgbmV1ZSwgaGVsdmV0aWNhLCBVYnVudHUsIHJvYm90bywgbm90bywgYXJpYWwsIHNhbnMtc2VyaWZcIixcblx0XHRcdFx0XHRjb2xvcjogXCJ3aGl0ZVwiLFxuXHRcdFx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJibGFja1wiLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRcIkJPRFlcIiwge1xuXHRcdFx0XHRcdGhlaWdodDogXCJpbmhlcml0XCIsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdC8vIEVsaW1pbmF0ZSBtYXJnaW4gY29sbGFwc2luZ1xuXHRcdFx0XHRcIkFERFJFU1MsIEFSVElDTEUsIEFTSURFLCBCTE9DS1FVT1RFLCBERCwgRElWLCBGT1JNLCBcIitcblx0XHRcdFx0XCJIMSwgSDIsIEgzLCBINCwgSDQsIEg2LCBIRUFERVIsIEhHUk9VUCwgT0wsIFVMLCBQLCBQUkUsIFNFQ1RJT05cIiwgIHtcblx0XHRcdFx0XHRwYWRkaW5nOiBcIjAuMDE2cHggMFwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdC8vIE5vIHNjcm9sbGJhcnMgYW55d2hlcmUuLi4gZm9yIG5vd1xuXHRcdFx0XHRcIio6Oi13ZWJraXQtc2Nyb2xsYmFyXCIsIHtcblx0XHRcdFx0XHRkaXNwbGF5OiBcIm5vbmVcIlxuXHRcdFx0XHR9LFxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cbn1cbiIsIlxubmFtZXNwYWNlIFNxdWFyZXNcbntcblx0ZXhwb3J0IG5hbWVzcGFjZSBSZXNpemVcblx0e1xuXHRcdC8qKlxuXHRcdCAqIE9ic2VydmVzIHRoZSByZXNpemluZyBvZiB0aGUgcGFydGljdWxhciBlbGVtZW50LCBhbmQgaW52b2tlc1xuXHRcdCAqIHRoZSBzcGVjaWZpZWQgY2FsbGJhY2sgd2hlbiB0aGUgZWxlbWVudCBpcyByZXNpemVkLlxuXHRcdCAqL1xuXHRcdGV4cG9ydCBmdW5jdGlvbiB3YXRjaChcblx0XHRcdGU6IEhUTUxFbGVtZW50LFxuXHRcdFx0Y2FsbGJhY2s6ICh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikgPT4gdm9pZCxcblx0XHRcdHJ1bkluaXRpYWxseTogYm9vbGVhbiA9IGZhbHNlKVxuXHRcdHtcblx0XHRcdGlmICh0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgIT09IFwidW5kZWZpbmVkXCIpXG5cdFx0XHR7XG5cdFx0XHRcdG5ldyBSZXNpemVPYnNlcnZlcihyZWMgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChyZWMubGVuZ3RoID09PSAwKVxuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGNvbnN0IGVudHJ5ID0gcmVjWzBdO1xuXHRcdFx0XHRcdGlmIChlbnRyeS5ib3JkZXJCb3hTaXplPy5sZW5ndGggPiAwKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnN0IHNpemUgPSBlbnRyeS5ib3JkZXJCb3hTaXplWzBdO1xuXHRcdFx0XHRcdFx0Y2FsbGJhY2soc2l6ZS5pbmxpbmVTaXplLCBzaXplLmJsb2NrU2l6ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zdCB3aWR0aCA9IGUub2Zmc2V0V2lkdGg7XG5cdFx0XHRcdFx0XHRjb25zdCBoZWlnaHQgPSBlLm9mZnNldEhlaWdodDtcblx0XHRcdFx0XHRcdGNhbGxiYWNrKHdpZHRoLCBoZWlnaHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkub2JzZXJ2ZShlLCB7IGJveDogXCJib3JkZXItYm94XCIgfSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHJhdy5nZXQoZSkocmF3Lm9uKHdpbmRvdywgXCJyZXNpemVcIiwgKCkgPT5cblx0XHRcdHtcblx0XHRcdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc3Qgd2lkdGggPSBlLm9mZnNldFdpZHRoO1xuXHRcdFx0XHRcdGNvbnN0IGhlaWdodCA9IGUub2Zmc2V0SGVpZ2h0O1xuXHRcdFx0XHRcdGNhbGxiYWNrKHdpZHRoLCBoZWlnaHQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pKTtcblx0XHRcdFxuXHRcdFx0aWYgKHJ1bkluaXRpYWxseSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgZXhlYyA9ICgpID0+IGNhbGxiYWNrKGUub2Zmc2V0V2lkdGgsIGUub2Zmc2V0SGVpZ2h0KTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChlLmlzQ29ubmVjdGVkKVxuXHRcdFx0XHRcdGV4ZWMoKTtcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHJhdy5nZXQoZSkocmF3Lm9uKFwiY29ubmVjdGVkXCIsIGV4ZWMpKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiIsIlxubmFtZXNwYWNlIFNxdWFyZXNcbntcblx0LyoqXG5cdCAqIEEgbmFtZXNwYWNlIG9mIGZ1bmN0aW9ucyB0aGF0IHByb2R1Y2UgZ2VuZXJpYyBDU1Ncblx0ICogc3R5bGluZyB2YWx1ZXMgdGhhdCBhcmVuJ3QgcGFydGljdWxhciB0byBhbnkgdGhlbWUuXG5cdCAqL1xuXHRleHBvcnQgbmFtZXNwYWNlIFN0eWxlXG5cdHtcblx0XHQvKiogKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gdGV4dFRpdGxlMSh0ZXh0OiBzdHJpbmcpOiBSYXcuUGFyYW1cblx0XHR7XG5cdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Zm9udFNpemU6IFwiMzBweFwiLFxuXHRcdFx0XHRcdGZvbnRXZWlnaHQ6IDcwMCxcblx0XHRcdFx0fSxcblx0XHRcdFx0cmF3LnRleHQodGV4dClcblx0XHRcdF07XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGV4cG9ydCBmdW5jdGlvbiB0ZXh0VGl0bGUyKHRleHQ6IHN0cmluZyk6IFJhdy5QYXJhbVxuXHRcdHtcblx0XHRcdHJldHVybiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRmb250U2l6ZTogXCIyMnB4XCIsXG5cdFx0XHRcdFx0Zm9udFdlaWdodDogNjAwLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRyYXcudGV4dCh0ZXh0KVxuXHRcdFx0XTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIHRleHRQYXJhZ3JhcGgodGV4dDogc3RyaW5nKTogUmF3LlBhcmFtXG5cdFx0e1xuXHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGZvbnRTaXplOiBcIjIycHhcIixcblx0XHRcdFx0XHRmb250V2VpZ2h0OiA1MDAsXG5cdFx0XHRcdFx0Y29sb3I6IFwicmdiKDIxMCwgMjEwLCAyMTApXCIsXG5cdFx0XHRcdFx0bGluZUhlaWdodDogMS4zXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJhdy50ZXh0KHRleHQpXG5cdFx0XHRdO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gYmFja2dyb3VuZE92ZXJsYXkoKTogUmF3LlBhcmFtXG5cdFx0e1xuXHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDAsIDAsIDAsIDAuNzUpXCIsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdFN0eWxlLmJhY2tkcm9wQmx1cig1KSxcblx0XHRcdF1cblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIGJhY2tkcm9wQmx1cihwaXhlbHMgPSA1KTogUmF3LlN0eWxlXG5cdFx0e1xuXHRcdFx0Y29uc3QgdmFsdWUgPSBwaXhlbHMgPiAwID8gYGJsdXIoJHtwaXhlbHN9cHgpYCA6IFwibm9uZVwiO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0YmFja2Ryb3BGaWx0ZXI6IHZhbHVlLFxuXHRcdFx0XHR3ZWJraXRCYWNrZHJvcEZpbHRlcjogdmFsdWUsXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRleHBvcnQgY29uc3QgdW5zZWxlY3RhYmxlOiBSYXcuU3R5bGUgPSB7XG5cdFx0XHR1c2VyU2VsZWN0OiBcIm5vbmVcIixcblx0XHRcdHdlYmtpdFVzZXJTZWxlY3Q6IFwibm9uZVwiLFxuXHRcdH07XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0ZXhwb3J0IGNvbnN0IHByZXNlbnRhdGlvbmFsOiBSYXcuU3R5bGUgPSB7XG5cdFx0XHQuLi51bnNlbGVjdGFibGUsXG5cdFx0XHRwb2ludGVyRXZlbnRzOiBcIm5vbmVcIixcblx0XHRcdGN1cnNvcjogXCJkZWZhdWx0XCIsXG5cdFx0fTtcblx0XHRcblx0XHQvKiogKi9cblx0XHRleHBvcnQgY29uc3Qga2V5YWJsZTogUmF3LlBhcmFtID0ge1xuXHRcdFx0dGFiSW5kZXg6IDAsXG5cdFx0XHRvdXRsaW5lOiAwLFxuXHRcdH07XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0ZXhwb3J0IGNvbnN0IGNsaWNrYWJsZTogUmF3LlN0eWxlID0ge1xuXHRcdFx0Li4udW5zZWxlY3RhYmxlLFxuXHRcdFx0Y3Vyc29yOiBcInBvaW50ZXJcIlxuXHRcdH0gYXMgY29uc3Q7XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogUmV0dXJucyBzdHlsZXMgdGhhdCBwcm9kdWNlIGEgZm9udCB3ZWlnaHQgd2hvc2UgdmFsdWVcblx0XHQgKiBtYXkgb3IgbWF5IG5vdCBiZSBwZXJmZWN0bHkgZGl2aXNpYmxlIGJ5IDEwMC5cblx0XHQgKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gd2VpZ2h0KHdlaWdodDogbnVtYmVyKTogUmF3LlN0eWxlXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Zm9udFdlaWdodDogd2VpZ2h0LnRvU3RyaW5nKCksXG5cdFx0XHRcdC4uLih3ZWlnaHQgJSAxMDAgPT09IDAgPyB7fSA6IHsgZm9udFZhcmlhdGlvblNldHRpbmdzOiBcIid3Z2h0JyBcIiArIHdlaWdodCB9KVxuXHRcdFx0fTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogRGlzcGxheXMgdGV4dCBhdCBhIGdpdmVuIGZvbnQgc2l6ZSBhbmQgd2VpZ2h0IHRoYXRcblx0XHQgKiBkZWZhdWx0cyB0byBiZWluZyB1bnNlbGVjdGFibGUuXG5cdFx0ICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIHRleHQobGFiZWw6IHN0cmluZyA9IFwiXCIsIHNpemU6IG51bWJlciB8IHN0cmluZyA9IDIwLCB3ZWlnaHQ/OiBudW1iZXIpOiBSYXcuUGFyYW1bXVxuXHRcdHtcblx0XHRcdHJldHVybiBbXG5cdFx0XHRcdFN0eWxlLnVuc2VsZWN0YWJsZSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGZvbnRTaXplOiB0eXBlb2Ygc2l6ZSA9PT0gXCJudW1iZXJcIiA/IHNpemUgKyBcInB4XCIgOiBzaXplLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR3ZWlnaHQgPyBTdHlsZS53ZWlnaHQod2VpZ2h0KSA6IG51bGwsXG5cdFx0XHRcdGxhYmVsID8gbmV3IFRleHQobGFiZWwpIDogbnVsbCxcblx0XHRcdFx0ZSA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gT25seSBhcHBseSB0aGlzIHdlYWtseS4gVGhlIGdvYWwgaGVyZSBpcyB0byBnZXQgYXdheSBmcm9tIHRoZSBJLWJlYW0sXG5cdFx0XHRcdFx0Ly8gYnV0IG90aGVyIHVzZXMgb2YgdGhpcyBmdW5jdGlvbiBjb3VsZCBzcGVjaWZ5IGEgcG9pbnRlciBvciBzb21ldGhpbmcgZWxzZSxcblx0XHRcdFx0XHQvLyBzbyB0aGlzIGZ1bmN0aW9uIHNob3VsZG4ndCBvdmVyd3JpdGUgdGhhdC5cblx0XHRcdFx0XHRpZiAoZS5zdHlsZS5jdXJzb3IgPT09IFwiXCIpXG5cdFx0XHRcdFx0XHRlLnN0eWxlLmN1cnNvciA9IFwiZGVmYXVsdFwiO1xuXHRcdFx0XHR9XG5cdFx0XHRdO1xuXHRcdH1cblx0XHRcblx0XHRleHBvcnQgY29uc3QgYm9yZGVyUmFkaXVzTGFyZ2UgPSBcIjMwcHhcIjtcblx0XHRleHBvcnQgY29uc3QgYm9yZGVyUmFkaXVzU21hbGwgPSBcIjEwcHhcIjtcblx0fVxufVxuIiwiXG5uYW1lc3BhY2UgU3F1YXJlc1xue1xuXHQvKipcblx0ICogXG5cdCAqL1xuXHRleHBvcnQgbmFtZXNwYWNlIFVJXG5cdHtcblx0XHQvKiogKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gY29ybmVyQWJzb2x1dGUoa2luZDogXCJ0bFwiIHwgXCJ0clwiIHwgXCJibFwiIHwgXCJiclwiKVxuXHRcdHtcblx0XHRcdGlmIChraW5kID09PSBcInRsXCIpXG5cdFx0XHRcdHJldHVybiByYXcuZ2V0KFVJLmNvcm5lcihcInRsXCIpKShjb3JuZXJTdHlsZXMsIHsgdG9wOiAwLCBsZWZ0OiAwIH0pO1xuXHRcdFx0XG5cdFx0XHRpZiAoa2luZCA9PT0gXCJ0clwiKVxuXHRcdFx0XHRyZXR1cm4gcmF3LmdldChVSS5jb3JuZXIoXCJ0clwiKSkoY29ybmVyU3R5bGVzLCB7IHRvcDogMCwgcmlnaHQ6IDAgfSk7XG5cdFx0XHRcblx0XHRcdGVsc2UgaWYgKGtpbmQgPT09IFwiYmxcIilcblx0XHRcdFx0cmV0dXJuIHJhdy5nZXQoVUkuY29ybmVyKFwiYmxcIikpKGNvcm5lclN0eWxlcywgeyBib3R0b206IDAsIGxlZnQ6IDAgfSk7XG5cdFx0XHRcblx0XHRcdGVsc2UgaWYgKGtpbmQgPT09IFwiYnJcIilcblx0XHRcdFx0cmV0dXJuIHJhdy5nZXQoVUkuY29ybmVyKFwiYnJcIikpKGNvcm5lclN0eWxlcywgeyBib3R0b206IDAsIHJpZ2h0OiAwIH0pO1xuXHRcdH1cblx0XHRcblx0XHRjb25zdCBzaXplID0gcGFyc2VJbnQoU3R5bGUuYm9yZGVyUmFkaXVzTGFyZ2UpO1xuXHRcdGNvbnN0IGNvcm5lclN0eWxlczogUmF3LlN0eWxlID0ge1xuXHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHRcdHpJbmRleDogMSxcblx0XHRcdHdpZHRoOiBzaXplICsgXCJweFwiLFxuXHRcdFx0aGVpZ2h0OiBzaXplICsgXCJweFwiLFxuXHRcdFx0cG9pbnRlckV2ZW50czogXCJub25lXCIsXG5cdFx0fTtcblx0XHRcblx0XHQvKipcblx0XHQgKiBSZW5kZXJzIGEgc2luZ2xlIGludmVydGVkIHJvdW5kZWQgY29ybmVyIHBpZWNlLlxuXHRcdCAqL1xuXHRcdGV4cG9ydCBmdW5jdGlvbiBjb3JuZXIoa2luZDogXCJ0bFwiIHwgXCJ0clwiIHwgXCJibFwiIHwgXCJiclwiKVxuXHRcdHtcblx0XHRcdGxldCB0b3AgPSAwO1xuXHRcdFx0bGV0IHJpZ2h0ID0gMDtcblx0XHRcdGxldCBib3R0b20gPSAwO1xuXHRcdFx0bGV0IGxlZnQgPSAwXG5cdFx0XHRcblx0XHRcdGlmIChraW5kID09PSBcInRsXCIpXG5cdFx0XHRcdGJvdHRvbSA9IHJpZ2h0ID0gLTEwMDtcblx0XHRcdFxuXHRcdFx0ZWxzZSBpZiAoa2luZCA9PT0gXCJ0clwiKVxuXHRcdFx0XHRib3R0b20gPSBsZWZ0ID0gLTEwMDtcblx0XHRcdFxuXHRcdFx0ZWxzZSBpZiAoa2luZCA9PT0gXCJibFwiKVxuXHRcdFx0XHR0b3AgPSByaWdodCA9IC0xMDA7XG5cdFx0XHRcblx0XHRcdGVsc2UgaWYgKGtpbmQgPT09IFwiYnJcIilcblx0XHRcdFx0dG9wID0gbGVmdCA9IC0xMDA7XG5cdFx0XHRcblx0XHRcdHJldHVybiByYXcuc3Bhbihcblx0XHRcdFx0XCJjb3JuZXJcIixcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG92ZXJmbG93OiBcImhpZGRlblwiLFxuXHRcdFx0XHRcdHdpZHRoOiBcIjEwMHB4XCIsXG5cdFx0XHRcdFx0aGVpZ2h0OiBcIjEwMHB4XCIsXG5cdFx0XHRcdFx0Y2xpcFBhdGg6IFwiaW5zZXQoMCAwKVwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJhdy5zcGFuKHtcblx0XHRcdFx0XHRwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuXHRcdFx0XHRcdHRvcDogdG9wICsgXCIlXCIsXG5cdFx0XHRcdFx0cmlnaHQ6IHJpZ2h0ICsgXCIlXCIsXG5cdFx0XHRcdFx0Ym90dG9tOiBib3R0b20gKyBcIiVcIixcblx0XHRcdFx0XHRsZWZ0OiBsZWZ0ICsgXCIlXCIsXG5cdFx0XHRcdFx0Ym9yZGVyUmFkaXVzOiBcIjEwMCVcIixcblx0XHRcdFx0XHRib3hTaGFkb3c6IFwiMCAwIDAgMTAwMHB4IGJsYWNrXCIsXG5cdFx0XHRcdH0pLFxuXHRcdFx0KTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIHN0cmV0Y2goKTogUmF3LlN0eWxlW11cblx0XHR7XG5cdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHR7IHdpZHRoOiBcIi1tb3otYXZhaWxhYmxlXCIgfSxcblx0XHRcdFx0eyB3aWR0aDogXCItd2Via2l0LWZpbGwtYXZhaWxhYmxlXCIgfSxcblx0XHRcdFx0eyB3aWR0aDogXCJmaWxsLWF2YWlsYWJsZVwiIH0sXG5cdFx0XHRcdHsgd2lkdGg6IFwic3RyZXRjaFwiIH1cblx0XHRcdF07XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGV4cG9ydCBmdW5jdGlvbiBlc2NhcGUoZm46ICgpID0+IHZvaWQpOiBSYXcuUGFyYW1bXVxuXHRcdHtcblx0XHRcdHJldHVybiBbXG5cdFx0XHRcdHsgdGFiSW5kZXg6IDAgfSxcblx0XHRcdFx0cmF3Lm9uKFwia2V5ZG93blwiLCBldiA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKGV2LmtleSA9PT0gXCJFc2NhcGVcIilcblx0XHRcdFx0XHRcdGZuKCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRdO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gY2xpY2soaGFuZGxlckZuOiAoZXY6IEV2ZW50KSA9PiB2b2lkKTogUmF3LlBhcmFtXG5cdFx0e1xuXHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0ZSA9PiAoKGUgYXMgYW55KS5yb2xlID0gXCJidXR0b25cIiksXG5cdFx0XHRcdFN0eWxlLmNsaWNrYWJsZSxcblx0XHRcdFx0cmF3Lm9uKFwiY2xpY2tcIiwgaGFuZGxlckZuKVxuXHRcdFx0XTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIHdhaXQobXMgPSAwKVxuXHRcdHtcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgbXMpKTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdhaXRDb25uZWN0ZWQoZTogSFRNTEVsZW1lbnQpXG5cdFx0e1xuXHRcdFx0aWYgKCFlLmlzQ29ubmVjdGVkKVxuXHRcdFx0XHRhd2FpdCBuZXcgUHJvbWlzZShyID0+IHJhdy5nZXQoZSkocmF3Lm9uKFwiY29ubmVjdGVkXCIsIHIpKSk7XG5cdFx0XHRcblx0XHRcdC8vIFdhaXQgYW4gYWRkaXRpb25hbCAxbXMgc28gdGhhdCB0aGUgZWxlbWVudCBiZWNvbWVzIHRyYW5zaXRpb24tcmVhZHlcblx0XHRcdGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxKSk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGV4cG9ydCBhc3luYyBmdW5jdGlvbiB3YWl0VHJhbnNpdGlvbkVuZChlOiBFbGVtZW50KVxuXHRcdHtcblx0XHRcdGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KHIgPT4gZS5hZGRFdmVudExpc3RlbmVyKFwidHJhbnNpdGlvbmVuZFwiLCBldiA9PlxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoZXYudGFyZ2V0ID09PSBlKVxuXHRcdFx0XHRcdHIoKTtcblx0XHRcdH0pKTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIG5vU2Nyb2xsQmFycygpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHJhdy5zdHlsZShcblx0XHRcdFx0XCIqOjotd2Via2l0LXNjcm9sbGJhclwiLCB7XG5cdFx0XHRcdFx0ZGlzcGxheTogXCJub25lXCJcblx0XHRcdFx0fVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIGhpZGUoKVxuXHRcdHtcblx0XHRcdGNvbnN0IGNscyA9IFwiaGlkZVwiO1xuXHRcdFx0XG5cdFx0XHRpZiAoIWhpZGVIYXNSdW4pXG5cdFx0XHR7XG5cdFx0XHRcdHJhdy5zdHlsZShcIi5cIiArIGNscywgeyBkaXNwbGF5OiBcIm5vbmUgIVwiIH0pLmF0dGFjaCgpO1xuXHRcdFx0XHRoaWRlSGFzUnVuID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0cmV0dXJuIGNscztcblx0XHR9XG5cdFx0bGV0IGhpZGVIYXNSdW4gPSBmYWxzZTtcblx0XHRcblx0XHQvKiogKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gdmlzaWJsZVdoZW5BbG9uZSgpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHJhdy5jc3MoXCI6bm90KDpvbmx5LWNoaWxkKSAhXCIsIHsgZGlzcGxheTogXCJub25lXCIgfSk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGV4cG9ydCBmdW5jdGlvbiB2aXNpYmxlV2hlbk5vdEFsb25lKClcblx0XHR7XG5cdFx0XHRyZXR1cm4gcmF3LmNzcyhcIjpvbmx5LWNoaWxkICFcIiwgeyBkaXNwbGF5OiBcIm5vbmVcIiB9KTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIHZpc2libGVXaGVuRW1wdHkod2F0Y2hUYXJnZXQ6IEhUTUxFbGVtZW50KTogUmF3LlBhcmFtXG5cdFx0e1xuXHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0d2F0Y2hUYXJnZXQuY2hpbGRyZW4ubGVuZ3RoID09PSAwID8gXCJcIiA6IFVJLmhpZGUoKSxcblx0XHRcdFx0cmF3Lm9uKFwiY29ubmVjdGVkXCIsIGV2ID0+IGFkZFZpc2liaWxpdHlPYnNlcnZlcihldi50YXJnZXQsIHdhdGNoVGFyZ2V0LCB0cnVlKSksXG5cdFx0XHRdO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gdmlzaWJsZVdoZW5Ob3RFbXB0eSh3YXRjaFRhcmdldDogSFRNTEVsZW1lbnQpOiBSYXcuUGFyYW1cblx0XHR7XG5cdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHR3YXRjaFRhcmdldC5jaGlsZHJlbi5sZW5ndGggPT09IDAgPyBVSS5oaWRlKCkgOiBcIlwiLFxuXHRcdFx0XHRyYXcub24oXCJjb25uZWN0ZWRcIiwgZXYgPT4gYWRkVmlzaWJpbGl0eU9ic2VydmVyKGV2LnRhcmdldCwgd2F0Y2hUYXJnZXQsIGZhbHNlKSksXG5cdFx0XHRdO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRmdW5jdGlvbiBhZGRWaXNpYmlsaXR5T2JzZXJ2ZXIoXG5cdFx0XHR2aXNpYmlsaXR5VGFyZ2V0OiBOb2RlIHwgbnVsbCxcblx0XHRcdHdhdGNoVGFyZ2V0OiBIVE1MRWxlbWVudCxcblx0XHRcdGZvckVtcHR5OiBib29sZWFuKVxuXHRcdHtcblx0XHRcdGlmICghKHZpc2liaWxpdHlUYXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdFxuXHRcdFx0Y29uc3QgZXhlYyA9ICgpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGNoaWxkcmVuID0gUXVlcnkuY2hpbGRyZW4od2F0Y2hUYXJnZXQpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKGZvckVtcHR5ICYmIGNoaWxkcmVuLmxlbmd0aCA+IDApXG5cdFx0XHRcdFx0dmlzaWJpbGl0eVRhcmdldC5jbGFzc0xpc3QuYWRkKFVJLmhpZGUoKSk7XG5cdFx0XHRcdFxuXHRcdFx0XHRlbHNlIGlmICghZm9yRW1wdHkgJiYgY2hpbGRyZW4ubGVuZ3RoID09PSAwKVxuXHRcdFx0XHRcdHZpc2liaWxpdHlUYXJnZXQuY2xhc3NMaXN0LmFkZChVSS5oaWRlKCkpO1xuXHRcdFx0XHRcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHZpc2liaWxpdHlUYXJnZXQuY2xhc3NMaXN0LnJlbW92ZShVSS5oaWRlKCkpO1xuXHRcdFx0fTtcblx0XHRcdFxuXHRcdFx0ZXhlYygpO1xuXHRcdFx0VUkub25DaGlsZHJlbkNoYW5nZWQod2F0Y2hUYXJnZXQsIGV4ZWMpO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gb25DaGlsZHJlbkNoYW5nZWQoZTogSFRNTEVsZW1lbnQsIGZuOiAoKSA9PiB2b2lkKVxuXHRcdHtcblx0XHRcdG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IGZuKCkpLm9ic2VydmUoZSwgeyBjaGlsZExpc3Q6IHRydWUgfSk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb2xsYXBzZShlOiBIVE1MRWxlbWVudClcblx0XHR7XG5cdFx0XHRjb25zdCBoZWlnaHQgPSBlLm9mZnNldEhlaWdodDtcblx0XHRcdGUuc3R5bGUubWFyZ2luQm90dG9tID0gXCIwcHhcIjtcblx0XHRcdGUuc3R5bGUuY2xpcFBhdGggPSBcImluc2V0KDAgMCAwIDApXCI7XG5cdFx0XHRlLnN0eWxlLnRyYW5zaXRpb25Qcm9wZXJ0eSA9IFwib3BhY2l0eSwgbWFyZ2luLWJvdHRvbSwgY2xpcC1wYXRoXCI7XG5cdFx0XHRlLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IFwiMC41c1wiO1xuXHRcdFx0YXdhaXQgVUkud2FpdCgpO1xuXHRcdFx0ZS5zdHlsZS5vcGFjaXR5ID0gXCIwXCI7XG5cdFx0XHRlLnN0eWxlLm1hcmdpbkJvdHRvbSA9IFwiLVwiICsgaGVpZ2h0ICsgXCJweFwiO1xuXHRcdFx0ZS5zdHlsZS5jbGlwUGF0aCA9IFwiaW5zZXQoMCAwIDEwMCUgMClcIjtcblx0XHRcdGF3YWl0IFVJLndhaXRUcmFuc2l0aW9uRW5kKGUpO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gZmFkZShlOiBIVE1MRWxlbWVudClcblx0XHR7XG5cdFx0XHRlLnN0eWxlLnRyYW5zaXRpb25Qcm9wZXJ0eSA9IFwib3BhY2l0eVwiO1xuXHRcdFx0ZS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSBcIjAuNXNcIjtcblx0XHRcdGUuc3R5bGUucG9pbnRlckV2ZW50cyA9IFwibm9uZVwiO1xuXHRcdFx0XG5cdFx0XHRpZiAoIWUuc3R5bGUub3BhY2l0eSlcblx0XHRcdFx0ZS5zdHlsZS5vcGFjaXR5ID0gXCIxXCI7XG5cdFx0XHRcblx0XHRcdGF3YWl0IFVJLndhaXQoKTtcblx0XHRcdGUuc3R5bGUub3BhY2l0eSA9IFwiMFwiO1xuXHRcdFx0YXdhaXQgVUkud2FpdFRyYW5zaXRpb25FbmQoZSk7XG5cdFx0XHRlLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuXHRcdH1cblx0fVxufVxuIiwiXG5uYW1lc3BhY2UgU3F1YXJlc1xue1xuXHQvKiogKi9cblx0ZXhwb3J0IG5hbWVzcGFjZSBXaWRnZXRcblx0e1xuXHRcdC8qKiAqL1xuXHRcdGV4cG9ydCBmdW5jdGlvbiBmaWxsQnV0dG9uKC4uLnBhcmFtczogUmF3LlBhcmFtW10pXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHJhdy5kaXYoXG5cdFx0XHRcdFwiZmlsbC1idXR0b25cIixcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRpc3BsYXk6IFwiaW5saW5lLWJsb2NrXCIsXG5cdFx0XHRcdFx0cGFkZGluZzogXCIxMHB4XCIsXG5cdFx0XHRcdFx0Ym9yZGVyUmFkaXVzOiBcIjVweFwiLFxuXHRcdFx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDEyOCwgMTI4LCAxMjgsIDAuNSlcIixcblx0XHRcdFx0XHRmb250V2VpZ2h0OiA1MDAsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdFN0eWxlLmNsaWNrYWJsZSxcblx0XHRcdFx0U3R5bGUuYmFja2Ryb3BCbHVyKDUpLFxuXHRcdFx0XHQuLi5wYXJhbXNcblx0XHRcdClcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIGhvbGxvd0J1dHRvbihvcHRpb25zOiB7XG5cdFx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0XHRjbGljaz86IChldjogRXZlbnQpID0+IHZvaWQsXG5cdFx0XHRwYXJhbXM/OiBSYXcuUGFyYW0sXG5cdFx0fSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gcmF3LmRpdihcblx0XHRcdFx0XCJob2xsb3ctYnV0dG9uXCIsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwYWRkaW5nOiBcIjE1cHhcIixcblx0XHRcdFx0XHRib3JkZXI6IFwiMnB4IHNvbGlkIFwiICsgUGFsLmdyYXkxLFxuXHRcdFx0XHRcdGJvcmRlclJhZGl1czogXCIxNXB4XCIsXG5cdFx0XHRcdFx0Y29sb3I6IFBhbC5ncmF5MSxcblx0XHRcdFx0XHR0ZXh0QWxpZ246IFwiY2VudGVyXCIsXG5cdFx0XHRcdFx0Y3Vyc29yOiBcInBvaW50ZXJcIixcblx0XHRcdFx0XHR3aGl0ZVNwYWNlOiBcIm5vd3JhcFwiLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRvcHRpb25zLmNsaWNrICYmIHJhdy5vbihcImNsaWNrXCIsIG9wdGlvbnMuY2xpY2spLFxuXHRcdFx0XHRTdHlsZS50ZXh0KG9wdGlvbnMudGV4dCwgMjMsIDUwMCksXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gYXR0ZW50aW9uQnV0dG9uKFxuXHRcdFx0dGV4dDogc3RyaW5nLFxuXHRcdFx0Y2xpY2s/OiAoZXY6IEV2ZW50KSA9PiB2b2lkLFxuXHRcdFx0Li4ucGFyYW1zOiBSYXcuUGFyYW08UmF3LkFuY2hvckVsZW1lbnRBdHRyaWJ1dGU+W11cblx0XHQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHJhdy5hKFxuXHRcdFx0XHRcImF0dGVudGlvbi1idXR0b25cIixcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRpc3BsYXk6IFwiYmxvY2tcIixcblx0XHRcdFx0XHR3aWR0aDogXCJmaXQtY29udGVudFwiLFxuXHRcdFx0XHRcdHBhZGRpbmc6IFwiMWVtIDNlbVwiLFxuXHRcdFx0XHRcdGJvcmRlclJhZGl1czogXCIxMHB4XCIsXG5cdFx0XHRcdFx0b3V0bGluZTogMCxcblx0XHRcdFx0XHRjb2xvcjogXCJ3aGl0ZVwiLFxuXHRcdFx0XHRcdHRleHREZWNvcmF0aW9uOiBcIm5vbmVcIixcblx0XHRcdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IFwiaHNsKDIwNSwgMTAwJSwgNTAlKVwiLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRTdHlsZS50ZXh0KHRleHQsIDIzLCA5MDApLFxuXHRcdFx0XHRwYXJhbXNcblx0XHRcdCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGV4cG9ydCBmdW5jdGlvbiB1bmRlcmxpbmVUZXh0Ym94KC4uLnBhcmFtczogUmF3LlBhcmFtW10pXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHJhdy5pbnB1dChcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG91dGxpbmU6IDAsXG5cdFx0XHRcdFx0Ym9yZGVyOiAwLFxuXHRcdFx0XHRcdHBhZGRpbmc6IFwiMTBweCAwXCIsXG5cdFx0XHRcdFx0Ym9yZGVyQm90dG9tOiBcIjJweCBzb2xpZCBcIiArIFBhbC5ncmF5Mixcblx0XHRcdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IFwidHJhbnNwYXJlbnRcIixcblx0XHRcdFx0XHRjb2xvcjogXCJ3aGl0ZVwiLFxuXHRcdFx0XHRcdGRpc3BsYXk6IFwiYmxvY2tcIixcblx0XHRcdFx0XHRmb250U2l6ZTogXCJpbmhlcml0XCIsXG5cdFx0XHRcdFx0c3BlbGxjaGVjazogZmFsc2UsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdFVJLnN0cmV0Y2goKSxcblx0XHRcdFx0cGFyYW1zXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxufVxuIl19