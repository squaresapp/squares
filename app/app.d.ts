declare namespace Cover {
    /** */
    function startupAsDebug(): Promise<void>;
    /** */
    function startupAsDebugWithData(): Promise<void>;
    /** */
    function startup(): Promise<void>;
    /** */
    function startupWithData(): Promise<void>;
    /** */
    function coverFollow(): Promise<void>;
}
declare const DEBUG: boolean;
declare const ELECTRON: boolean;
declare const TAURI: boolean;
declare const MAC: boolean;
declare const WINDOWS: boolean;
declare const LINUX: boolean;
declare const CAPACITOR: boolean;
declare const IOS: boolean;
declare const ANDROID: boolean;
declare const DEMO: boolean;
declare const Moduless: {
    getRunningFunctionName(): string;
};
declare namespace Electron {
    const fs: typeof import("fs");
    const path: typeof import("path");
}
declare namespace Tauri {
    const fs: typeof import("@tauri-apps/api").fs;
    const cli: typeof import("@tauri-apps/api").cli;
    const clipboard: typeof import("@tauri-apps/api").clipboard;
    const dialog: typeof import("@tauri-apps/api").dialog;
    const event: typeof import("@tauri-apps/api").event;
    const globalShortcut: typeof import("@tauri-apps/api").globalShortcut;
    const http: typeof import("@tauri-apps/api").http;
    const invoke: typeof import("@tauri-apps/api").invoke;
    const notification: typeof import("@tauri-apps/api").notification;
    const os: typeof import("@tauri-apps/api").os;
    const path: typeof import("@tauri-apps/api").path;
    const process: typeof import("@tauri-apps/api").process;
    const shell: typeof import("@tauri-apps/api").shell;
    const tauri: typeof import("@tauri-apps/api").tauri;
    const updater: typeof import("@tauri-apps/api").updater;
    const window: typeof import("@tauri-apps/api").window;
}
declare const Capacitor: typeof import("@capacitor/core").Capacitor & {
    platform: string;
};
declare const Toast: typeof import("@capacitor/toast").Toast;
declare const CapClipboard: typeof import("@capacitor/clipboard").Clipboard;
declare const BackgroundFetch: typeof import("@transistorsoft/capacitor-background-fetch").BackgroundFetch;
declare const AppLauncher: typeof import("@capacitor/app-launcher").AppLauncher;
declare const CapacitorApp: typeof import("@capacitor/app").App;
declare const t: typeof raw["text"];
declare namespace Squares {
    /**
     * The main entry point of the app.
     *
     * This function is called automatically, in every environment (Tauri, Capacitor),
     * except when running from a Moduless cover function.
     */
    function startup(useDefaultData?: boolean): Promise<void>;
}
declare namespace Raw {
    interface EventMap extends HTMLElementEventMap {
        "squares:follow": CustomEvent<{
            feeds: Squares.IFeedDetail[];
        }>;
        "squares:unfollow": CustomEvent<{
            feedKey: number;
        }>;
        "squares:panechanged": Event;
    }
}
declare namespace Squares {
    /** */
    type DetailType<K extends keyof Raw.EventMap> = Raw.EventMap[K] extends CustomEvent<infer T> ? T : {};
    /**
     * Provides a way to dispatch a bubbling CustomEvent
     * object with type-safe .details property, using a custom
     * .details argument. The details argument is returned,
     * possibly after being modified by the event handlers.
     */
    function dispatch<K extends keyof Raw.EventMap>(name: K, detail: DetailType<K>, target: HTMLElement): DetailType<K>;
    /**
     * Provides a way to dispatch a bubbling a generic Event
     * object, which targets the specified element.
     */
    function dispatch<K extends keyof Raw.EventMap>(name: K, target: HTMLElement): void;
    /**
     * Provides a way to dispatch a bubbling a generic Event
     * object, which targets the specified element.
     */
    function dispatch<K extends keyof Raw.EventMap>(name: K, detail: DetailType<K>): void;
    /**
     * Provides a way to dispatch a bubbling a generic Event
     * object, which targets the <body> element.
     */
    function dispatch<K extends keyof Raw.EventMap>(name: K): void;
}
declare namespace Squares {
    const feedsDefault: string[];
}
declare namespace Squares {
    enum Images {
        appLogo = "<svg height=\"150\" viewBox=\"0 0 190 150\" width=\"190\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><radialGradient id=\"a\" cx=\"84.758723%\" cy=\"13.698648%\" gradientTransform=\"matrix(-.38793823 .56367144 -.92168537 -.23724983 1.302656 -.308275)\" r=\"153.105708%\"><stop offset=\"0\" stop-color=\"#359aff\"/><stop offset=\"1\" stop-color=\"#06c\"/></radialGradient><radialGradient id=\"b\" cx=\"58.546912%\" cy=\"18.144159%\" gradientTransform=\"matrix(-.39278345 .56214652 -.91963099 -.24009831 .982291 -.104113)\" r=\"145.613102%\"><stop offset=\"0\" stop-color=\"#ff3556\"/><stop offset=\"1\" stop-color=\"#ad1f36\"/></radialGradient><g fill=\"none\" fill-rule=\"evenodd\" transform=\"translate(0 .03635)\"><path d=\"m179.911781.00039741c5.522632-.04872228 10.039108 4.38875878 10.08783 9.91139136l.000389 129.64114323c0 5.522848-4.477153 10-10 10h-81.298002l-.055725-31.732759c-.0021869-1.245331.7652246-2.362524 1.928401-2.807354l18.841568-7.205531c1.54755-.591825 2.322317-2.32613 1.730492-3.87368-.015591-.040768-.032069-.08119-.049424-.121239l-.787216-1.816632c-.633946-1.462937-2.301473-2.1744357-3.796279-1.619792l-13.931726 5.16933c-1.553371.576374-3.2798693-.215639-3.8562432-1.769009-.1239254-.333988-.1873743-.687379-.1873743-1.043617v-58.288123c0-5.1924792 2.0194395-10.1814187 5.6312965-13.9118783l26.252516-27.11457192c1.862504-1.92366317 4.418663-3.0200503 7.096132-3.04367172zm-27.5572 36.19363999c-1.952206-1.9502015-5.115231-1.9502015-7.067436 0l-10.660579 10.6496364c-1.95525 1.9572548-1.953624 5.1230792 0 7.0746978l10.660579 10.6496364c1.952205 1.9502015 5.11523 1.9502015 7.067436 0l10.660579-10.6496364c1.955249-1.9572547 1.953623-5.1230792 0-7.0746978z\" fill=\"url(#a)\"/><path d=\"m10.0169801.33912319 38.6206399.06557846c2.5084398.00425937 4.9236673.95110215 6.766681 2.65274516l29.6245498 27.35216139c4.1006024 3.7860606 6.4326777 9.1133345 6.4326777 14.6944809v57.5842849c0 .365874-.0669274.728662-.1974777 1.070452-.5911947 1.547791-2.3251847 2.323265-3.872975 1.73207l-13.3321768-5.092365c-1.4863985-.5677452-3.157499.123726-3.8081557 1.575745l-.8942379 1.995601c-.0285236.063654-.0548185.128283-.0788367.19377-.5705141 1.555532.2280007 3.279033 1.7835326 3.849547l18.4014102 6.748986c1.1857196.43488 1.9721013 1.56579 1.9669681 2.828733l-.1315776 32.372737h-81.298002c-5.5228475 0-10-4.477152-10-10l.00001442-129.6415214c.00937787-5.5228395 4.49412618-9.99238328 10.01696568-9.98300541zm38.688664 36.41556101c-1.9522053-1.9502015-5.1152307-1.9502015-7.067436 0l-10.6605789 10.6496364c-.0012109.0012097-.0024212.00242-.0036309.0036309-1.9516185 1.9536238-1.9499929 5.1194483.0036309 7.0710669l10.6605789 10.6496364c1.9522053 1.9502015 5.1152307 1.9502015 7.067436 0l10.6605789-10.6496364c.0012109-.0012097.0024212-.00242.0036309-.0036309 1.9516186-1.9536239 1.949993-5.1194483-.0036309-7.0710669z\" fill=\"url(#b)\"/></g></svg>"
    }
}
declare namespace Squares {
    const enum Strings {
        openingTitle = "Welcome To Squares",
        openingMessage = "Squares is where you avoid the chaos of social media platforms. It doesn\u2019t show you anything unless someone you follow shares it.",
        openingAction = "Find feeds to follow",
        findFeedsUrl = "https://www.squaresapp.org/feeds/",
        following = "Following",
        unfollow = "Unfollow",
        nowFollowing = "Now following",
        nowFollowingCount = "Now following ? feeds",
        invalidFollowUrl = "Invalid follow URL",
        share = "Share",
        unknownAuthor = "(Author Unknown)"
    }
}
declare namespace Squares {
    /**
     *
     */
    class BackgroundFetcher {
        /** */
        constructor();
    }
}
declare namespace Squares.Data {
    /** */
    interface IReadArrayOptions {
        start?: number;
        limit?: number;
    }
    /** */
    function initialize(): Promise<void>;
    /**
     * Returns whether there is at least one scroll written to the data layer.
     */
    function hasScrolls(): boolean;
    /** */
    function readScrollPostCount(scrollKey: number): number;
    /** */
    function writeScroll(defaults: Partial<IScroll>): Promise<IScroll>;
    /**
     * Adds a reference to a post within a particular scroll.
     */
    function writeScrollPost(scrollKey: number, post: IPost): Promise<void>;
    /**
     * Read the scroll object from the file system with the specified key.
     * If the argument is omitted, the first discovered scroll is returned.
     */
    function readScroll(key?: number): Promise<IScroll | null>;
    /** */
    function readScrolls(): Promise<IScroll[]>;
    /** */
    function readScrollPost(scrollKey: number, index: number): Promise<IPost | null>;
    /** */
    function readScrollPosts(scrollKey: number, options?: IReadArrayOptions): AsyncGenerator<IPost, void, unknown>;
    /**
     * Creates a new IFeed object to disk, optionally populated with the
     * specified values, writes it to disk, and returns the constructed object.
     */
    function writeFeed(...defaults: Partial<IFeedDetail>[]): Promise<IFeedDetail>;
    /**
     *
     */
    function readFeedDetail(key: number): Promise<IFeedDetail | null>;
    /**
     * Reads all non-archived feeds from the file system.
     */
    function readFeedDetails(): AsyncGenerator<IFeedDetail, void, unknown>;
    /** */
    function readFeedPosts(feedKey: number): AsyncGenerator<IPost, void, unknown>;
    /**
     * Moves the feed file to the archive (which is the unfollow operation).
     */
    function archiveFeed(feedKey: number): Promise<void>;
    /**
     * Writes the URLs contained in the specified to the file system, in their full-qualified
     * form, and returns an object that indicates what URLs where added and which ones
     * were removed from the previous time that this function was called.
     *
     * The URLs are expected to be in their fully-qualified form, which is different from
     * how the URLs are typically written in the feed text file.
     */
    function writeFeedUpdates(feed: IFeedDetail, urls: string[]): Promise<{
        added: string[];
        removed: string[];
    }>;
    /** */
    function readPost(key: number): Promise<IPost | null>;
    /** */
    function writePost(post: Partial<IPost>): Promise<IPost>;
    /**
     * Deletes all data in the data folder.
     * Intended only for debugging purposes.
     */
    function clear(): Promise<void>;
}
declare namespace Squares {
    /**
     * Initializes the app with a list of default feeds, and populates
     * a single scroll with the content contained within those feeds.
     */
    function runDataInitializer(defaultFeedUrls: string[]): Promise<void>;
}
declare namespace Squares {
    /**
     * A namespace of functions which are shared between
     * the ForegroundFetcher and the BackgroundFetcher.
     */
    namespace Fetcher {
        /**
         *
         */
        function updateModifiedFeeds(modifiedFeeds: IFeedDetail[]): Promise<void>;
    }
}
declare namespace Squares {
    namespace FollowUtil {
        /** */
        function setupSystemListeners(): void;
        /**
         *
         */
        function followWebfeeds(webfeedUrls: string | string[]): Promise<void>;
    }
}
declare namespace Squares {
    /** */
    class ForegroundFetcher {
        /** */
        constructor();
        /**
         * Gets whether there is a fetch operation being carried out.
         */
        get isFetching(): boolean;
        private feedIterator;
        /** */
        fetch(): Promise<void>;
        /** */
        stopFetch(): void;
        private readonly abortControllers;
    }
}
declare namespace Squares {
    /**
     * Represents the IFeed object, as it is stored on disk.
     */
    interface IDiskFeedDetail {
        /**
         * Stores the URL of the text file that contains the feed information.
         */
        url: string;
        /**
         * Stores the location of the avatar associated with the feed, which is
         * extracted from the standard <link rel="icon"> tag.
         */
        icon: string;
        /**
         * Stores the information that was extracted from the <meta name="author">
         * tag that was found on the URL that referenced the feed.
         */
        author: string;
        /**
         * Stores a description of the feed, which is typically the name of the person
         * or organization that owns the feed.
         */
        description: string;
        /**
         * Stores a value which can be used for comparison purposes to see if a
         * feed has been updated.
         */
        checksum: string;
    }
    /** */
    interface IFeedDetail extends IDiskFeedDetail {
        /** */
        key: number;
    }
}
declare namespace Squares {
    /** */
    interface IAbstractPost {
        /**
         *
         */
        visited: boolean;
        /**
         * Stores the path of the feed, relative to the URL of the feed text file.
         */
        path: string;
    }
    /** */
    interface IDiskPost extends IAbstractPost {
        /**
         * Stores the ID of the feed to which this post belongs.
         */
        feed: number;
    }
    /** */
    interface IPost extends IAbstractPost {
        /**
         *
         */
        key: number;
        /**
         * A reference to the feed
         */
        feed: IFeedDetail;
    }
    /** */
    interface IPostFile {
        [key: number]: IDiskPost;
    }
}
declare namespace Squares {
    /** */
    interface IAbstractScroll {
        anchorIndex: number;
    }
    /** */
    interface IDiskScroll extends IAbstractScroll {
        feeds: number[];
    }
    /** */
    interface IScroll extends IAbstractScroll {
        key: number;
        feeds: readonly IFeedDetail[];
    }
}
declare namespace Squares {
    namespace Util {
        /**
         * Returns the current date in ticks form, but with any incrementation
         * necessary to avoid returning the same ticks value twice.
         */
        function getSafeTicks(): number;
        /**
         * Returns the fully-qualified URL to the icon image
         * specified in the specified feed.
         */
        function getIconUrl(feed: IFeedDetail): string;
        /**
         * Safely parses a string JSON into an object.
         */
        function tryParseJson<T extends object = object>(jsonText: string): T | null;
        /**
         * Parses the specified URL string and returns a URL object,
         * or null if the URL fails to parse.
         */
        function tryParseUrl(url: string): URL | null;
        /**
         * Returns the value wrapped in an array, if it is not already
         * an array to begin with.
         */
        function toArray<T>(value: T | T[]): T[];
        /**
         * Returns the environment-specific path to the application data folder.
         */
        function getDataFolder(): Promise<Fila>;
        /** */
        function readClipboard(): Promise<string>;
        /** */
        function writeClipboard(text: string): Promise<void>;
        /**
         * Removes problematic CSS attributes from the specified section tag,
         * and ensures that no external CSS is modifying its display propert
         */
        function getSectionSanitizationCss(): Raw.Style;
        /**
         *
         */
        function openWebLink(url: string): Promise<void>;
    }
}
declare namespace Squares {
    /** */
    class DotsHat {
        readonly head: HTMLDivElement;
        /** */
        constructor();
        /** */
        insert(count: number, at?: number): void;
        /** */
        highlight(index: number): void;
    }
}
declare namespace Squares {
    /** */
    class FeedMetaHat {
        readonly head: HTMLDivElement;
        /** */
        constructor(data: IFeedDetail);
        /** */
        private renderButton;
    }
}
declare namespace Squares {
    /** */
    function coverFollowersHat(): void;
}
declare namespace Squares {
    /** */
    class FollowersHat {
        readonly head: HTMLDivElement;
        private readonly feedElements;
        /** */
        constructor();
        /** */
        private handleUnfollow;
        /** */
        private handleFollow;
        /** */
        private construct;
        /** */
        private renderIdentity;
    }
}
declare namespace Cover {
    /** */
    function coverTilerHat(): void;
}
declare namespace Squares {
    /**
     *
     */
    class GridHat {
        /** */
        readonly head: HTMLDivElement;
        /** */
        private readonly cornersElement;
        /** */
        constructor();
        /** */
        handleRender(fn: RenderFn): void;
        private renderFn;
        /** */
        handleSelect(fn: SelectFn): void;
        private selectFn;
        /**
         * Gets the pixel width of the head element.
         */
        get width(): number;
        private _width;
        /**
         * Gets the pixel height of the head element.
         */
        get height(): number;
        private _height;
        /**
         * Gets or sets the number of posters being displayed in one dimension.
         */
        get size(): number;
        set size(size: number);
        /** */
        private setSizeInner;
        private _size;
        /**
         * Gets the maximum possible size of the Omniview,
         * given the number of previews that are available.
         * A value of 0 indicates that there is no size limit.
         */
        private sizeLimit;
        /**
         * Returns an array of HTMLElement objects that contain the posters
         * that have at least a single pixel visible on the screen.
         */
        getVisiblePosters(): HTMLElement[];
        /** */
        get posterCount(): number;
        /** */
        tryAppendPosters(screenCount: number): Promise<void>;
        /** */
        private updatePosterVisibility;
        private lastVisiblePoster;
        private lastY;
        /** */
        private rowOf;
    }
    /**
     * Returns a poster HTMLElement for the given index in the stream.
     * The function should return null to stop looking for posters at or
     * beyond the specified index.
     */
    type RenderFn = (index: number) => Promise<HTMLElement> | HTMLElement | null;
    /** */
    type SelectFn = (selectedElement: HTMLElement, index: number) => void | Promise<void>;
}
declare namespace Squares.Cover {
    /** */
    function coverStoryHat(): void;
}
declare namespace Squares {
    /** */
    class PageHat {
        private readonly feed;
        readonly head: HTMLDivElement;
        private readonly swiper;
        private readonly scrollable;
        readonly onDisconnect: ((callback: () => void) => void) & {
            off(callback: () => void): void;
        };
        private readonly _onDisconnect;
        readonly onRetract: ((callback: (percent: number) => void) => void) & {
            off(callback: (percent: number) => void): void;
        };
        private readonly _onRetract;
        /** */
        constructor(head: HTMLElement[], sections: HTMLElement[], feed: IFeedDetail);
        /** */
        private setupRetractionTracker;
        /** */
        forceRetract(): Promise<void>;
    }
}
declare namespace Squares {
    /**
     * A class that creates a series of panes that swipe horizontally on mobile.
     */
    class PaneSwiper {
        readonly head: HTMLDivElement;
        /** */
        constructor();
        /** */
        readonly visiblePaneChanged: ((callback: (visiblePaneIndex: number) => void) => void) & {
            off(callback: (visiblePaneIndex: number) => void): void;
        };
        private readonly _visiblePaneChanged;
        /** */
        addPane(element: HTMLElement, at?: number): void;
        /** */
        setVisiblePane(index: number): void;
        /** */
        private updateVisiblePane;
        private lastVisiblePane;
        /** Gets the number of panes in the PaneSwiper. */
        get length(): number;
    }
}
declare namespace Squares {
    /** */
    class ProfileHat {
        readonly head: HTMLDivElement;
        /** */
        constructor();
    }
}
declare namespace Squares {
    /** */
    class PullToRefreshHat {
        private readonly target;
        readonly head: HTMLDivElement;
        private readonly symbol;
        private rotationDegress;
        private animation;
        /** */
        constructor(target: HTMLElement);
        readonly onRefresh: ((callback: () => void) => void) & {
            off(callback: () => void): void;
        };
        private readonly _onRefresh;
        /** */
        private handleTargetScroll;
        /** */
        private setAnimationFrame;
        /** */
        setLoadingAnimation(enable: boolean): void;
    }
}
declare namespace Squares {
    /** */
    class RootHat {
        readonly head: HTMLDivElement;
        /** */
        constructor();
        /** */
        construct(): Promise<void>;
        /** */
        private renderEmptyState;
        /** */
        private renderSingleFeedState;
        /**
         * Renders the full application state where there is a
         * are multiple feeds multi-plexed within a single scroll.
         */
        private renderScrollState;
        /**
         * Gets the fully qualified URL where the post resides, which is calculated
         * by concatenating the post path with the containing feed URL.
         */
        getPostUrl(post: IPost): string;
    }
}
declare namespace Squares {
    /** */
    class ScrollCreatorHat {
        readonly head: HTMLDivElement;
        /** */
        constructor();
    }
}
declare namespace Cover {
    /** */
    function coverScrollFeedViewerHat(): Promise<void>;
}
declare namespace Squares {
    /** */
    abstract class ScrollViewerHat {
        readonly head: HTMLDivElement;
        private readonly gridContainer;
        private readonly grid;
        private readonly pullToRefreshHat;
        private selectedGridItem;
        /** */
        constructor();
        /** */
        protected abstract getPost(index: number): ReturnType<RenderFn>;
        /** */
        protected abstract handleRefresh(): Promise<void>;
        /** */
        private handleRefreshInner;
        /** */
        protected abstract getPageInfo(index: number): Promise<{
            readonly head: HTMLElement[];
            readonly sections: HTMLElement[];
            readonly feed: IFeedDetail;
        }>;
        /** */
        protected abstract handlePostVisited(index: number): void | Promise<void>;
        /** */
        private constructGrid;
        /** */
        private showPage;
        /** */
        private showGrid;
    }
    /**
     * A specialization of the ScrollViewerHat that supports scenarios where
     * multiple feeds are multiplexed into a single view.
     */
    class ScrollMuxViewerHat extends ScrollViewerHat {
        private readonly scroll;
        /** */
        constructor(scroll: IScroll);
        private readonly foregroundFetcher;
        /** */
        protected handleRefresh(): Promise<void>;
        /** */
        protected getPost(index: number): Promise<HTMLElement> | null;
        /** */
        protected getPageInfo(index: number): Promise<{
            head: HTMLElement[];
            sections: HTMLElement[];
            feed: IFeedDetail;
        }>;
        /** */
        protected handlePostVisited(index: number): Promise<void>;
    }
    /**
     * A specialization of the ScrollViewerHat that supports scenarios where
     * a single feed is displayed within a single view.
     */
    class ScrollFeedViewerHat extends ScrollViewerHat {
        private readonly feed;
        private readonly urls;
        /** */
        constructor(feed: IFeedDetail, urls: string[]);
        /** */
        protected handleRefresh(): Promise<void>;
        /** */
        protected getPost(index: number): Promise<HTMLElement | HTMLDivElement> | null;
        /** */
        protected getPageInfo(index: number): Promise<{
            head: never[];
            sections: never[];
            feed: IFeedDetail;
        }>;
        /** */
        protected handlePostVisited(index: number): void;
    }
}
declare namespace Squares {
    /** */
    namespace Color {
        let defaultHue: number;
        /** */
        interface IColor {
            readonly h: number;
            readonly s: number;
            readonly l: number;
            readonly a?: number;
        }
        /** */
        function from(values: Partial<IColor>): string;
        /** */
        function white(alpha?: number): string;
        /** */
        function black(alpha?: number): string;
        /** */
        function gray(value?: number, alpha?: number): string;
    }
}
declare namespace Squares {
    /**
     * Namespace of functions for container query units.
     */
    namespace Cq {
        /**
         *
         */
        function width(amount: number, targetContainerClass: string): Raw.Param<Raw.ElementAttribute>;
        /**
         *
         */
        function height(amount: number, targetContainerClass: string): Raw.Param<Raw.ElementAttribute>;
        /**
         *
         */
        function left(amount: number, targetContainerClass: string): Raw.Param<Raw.ElementAttribute>;
    }
}
declare namespace Squares {
    /** */
    enum Origin {
        topLeft = "origin-tl",
        top = "origin-t",
        topRight = "origin-tr",
        left = "origin-l",
        center = "origin-c",
        right = "origin-r",
        bottomLeft = "origin-bl",
        bottom = "origin-b",
        bottomRight = "origin-br"
    }
}
declare namespace Squares {
    /**
     * A namespace of color values that define the color palette
     * used across the application.
     */
    namespace Pal {
        const gray1: string;
        const gray2: string;
        const gray3: string;
    }
}
declare namespace Squares {
    /** */
    function appendCssReset(): void;
}
declare namespace Squares {
    namespace Resize {
        /**
         * Observes the resizing of the particular element, and invokes
         * the specified callback when the element is resized.
         */
        function watch(e: HTMLElement, callback: (width: number, height: number) => void, runInitially?: boolean): void;
    }
}
declare namespace Squares {
    /**
     * A namespace of functions that produce generic CSS
     * styling values that aren't particular to any theme.
     */
    namespace Style {
        /** */
        function textTitle1(text: string): Raw.Param;
        /** */
        function textTitle2(text: string): Raw.Param;
        /** */
        function textParagraph(text: string): Raw.Param;
        /** */
        function backgroundOverlay(): Raw.Param;
        /** */
        function backdropBlur(pixels?: number): Raw.Style;
        /** */
        const unselectable: Raw.Style;
        /** */
        const presentational: Raw.Style;
        /** */
        const keyable: Raw.Param;
        /** */
        const clickable: Raw.Style;
        /**
         * Returns styles that produce a font weight whose value
         * may or may not be perfectly divisible by 100.
         */
        function weight(weight: number): Raw.Style;
        /**
         * Displays text at a given font size and weight that
         * defaults to being unselectable.
         */
        function text(label?: string, size?: number | string, weight?: number): Raw.Param[];
        const borderRadiusLarge = "30px";
        const borderRadiusSmall = "10px";
    }
}
declare namespace Squares {
    /**
     *
     */
    namespace UI {
        /** */
        function cornerAbsolute(kind: "tl" | "tr" | "bl" | "br"): HTMLSpanElement | undefined;
        /**
         * Renders a single inverted rounded corner piece.
         */
        function corner(kind: "tl" | "tr" | "bl" | "br"): HTMLSpanElement;
        /** */
        function stretch(): Raw.Style[];
        /** */
        function escape(fn: () => void): Raw.Param[];
        /** */
        function click(handlerFn: (ev: Event) => void): Raw.Param;
        /** */
        function wait(ms?: number): Promise<unknown>;
        /** */
        function waitConnected(e: HTMLElement): Promise<void>;
        /** */
        function waitTransitionEnd(e: Element): Promise<void>;
        /** */
        function noScrollBars(): Raw.HTMLRawStyleElement;
        /** */
        function hide(): string;
        /** */
        function visibleWhenAlone(): string;
        /** */
        function visibleWhenNotAlone(): string;
        /** */
        function visibleWhenEmpty(watchTarget: HTMLElement): Raw.Param;
        /** */
        function visibleWhenNotEmpty(watchTarget: HTMLElement): Raw.Param;
        /** */
        function onChildrenChanged(e: HTMLElement, fn: () => void): void;
        /** */
        function collapse(e: HTMLElement): Promise<void>;
        /** */
        function fade(e: HTMLElement): Promise<void>;
    }
}
declare namespace Squares {
    /** */
    namespace Widget {
        /** */
        function fillButton(...params: Raw.Param[]): HTMLDivElement;
        /** */
        function hollowButton(options: {
            text: string;
            click?: (ev: Event) => void;
            params?: Raw.Param;
        }): HTMLDivElement;
        /** */
        function attentionButton(text: string, click?: (ev: Event) => void, ...params: Raw.Param<Raw.AnchorElementAttribute>[]): HTMLAnchorElement;
        /** */
        function underlineTextbox(...params: Raw.Param[]): HTMLInputElement;
    }
}
//# sourceMappingURL=app.d.ts.map