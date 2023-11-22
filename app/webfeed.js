"use strict";
var Webfeed;
(function (Webfeed) {
    /**
     * A class that reads a raw HTML document, and provides
     * the ability to scan the document with registered "traps",
     * which allow the document's content to be modified.
     */
    class ForeignDocumentReader {
        rawDocument;
        /** */
        constructor(rawDocument) {
            this.rawDocument = rawDocument;
        }
        /** */
        trapElement(elementFn) {
            this.elementFn = elementFn;
        }
        elementFn = (element) => element;
        /** */
        trapAttribute(attributeFn) {
            this.attributeFn = attributeFn;
        }
        attributeFn = (name, value, element) => value;
        /** */
        trapProperty(propertyFn) {
            this.propertyFn = propertyFn;
        }
        propertyFn = (name, value) => name;
        /** */
        read() {
            const parser = new DOMParser();
            const doc = parser.parseFromString(this.rawDocument, "text/html");
            const trash = [];
            for (const walker = doc.createTreeWalker(doc);;) {
                let node = walker.nextNode();
                if (!node)
                    break;
                if (!(node instanceof Element))
                    continue;
                let element = node;
                const result = this.elementFn(element);
                if (!result) {
                    trash.push(element);
                    continue;
                }
                else if (result instanceof Node && result !== element) {
                    element.replaceWith(result);
                    element = result;
                }
                if (element instanceof HTMLStyleElement) {
                    if (element.sheet) {
                        this.readSheet(element.sheet);
                        const cssText = [];
                        for (let i = -1, len = element.sheet.cssRules.length; ++i < len;)
                            cssText.push(element.sheet.cssRules[i].cssText);
                        if (element instanceof HTMLStyleElement)
                            element.textContent = cssText.join("\n");
                    }
                }
                for (const attr of Array.from(element.attributes)) {
                    const newValue = this.attributeFn(attr.name, attr.value, element);
                    if (newValue === null || newValue === undefined)
                        element.removeAttributeNode(attr);
                    else
                        element.setAttribute(attr.name, newValue);
                }
                if (element instanceof HTMLElement && element.hasAttribute("style"))
                    this.readStyle(element.style);
            }
            for (const e of trash)
                e.remove();
            return doc;
        }
        /** */
        readSheet(sheet) {
            const recurse = (group) => {
                const len = group.cssRules.length;
                for (let i = -1; ++i < len;) {
                    const rule = group.cssRules.item(i);
                    if (rule instanceof CSSGroupingRule)
                        recurse(rule);
                    else if (rule instanceof CSSStyleRule)
                        this.readStyle(rule.style);
                }
            };
            recurse(sheet);
        }
        /** */
        readStyle(style) {
            const names = [];
            for (let n = -1; ++n < style.length;)
                names.push(style[n]);
            for (const name of names) {
                const value = style.getPropertyValue(name);
                const priority = style.getPropertyPriority(name);
                const resultValue = this.propertyFn(name, value);
                if (resultValue !== value) {
                    // The property has to be removed either way,
                    // because if we're setting a new property with
                    // a different URL, it won't get properly replaced.
                    style.removeProperty(name);
                    if (resultValue)
                        style.setProperty(name, resultValue, priority);
                }
            }
        }
    }
    Webfeed.ForeignDocumentReader = ForeignDocumentReader;
})(Webfeed || (Webfeed = {}));
var Webfeed;
(function (Webfeed) {
    /**
     * A class that wraps a ForeignDocumentReader, and which converts
     * the content of the specified raw HTML document into a format
     * which is acceptable for injection into a blog.
     */
    class ForeignDocumentSanitizer {
        rawDocument;
        baseHref;
        /** */
        constructor(rawDocument, baseHref) {
            this.rawDocument = rawDocument;
            this.baseHref = baseHref;
        }
        /** */
        read() {
            const reader = new Webfeed.ForeignDocumentReader(this.rawDocument);
            reader.trapElement(e => {
                const t = e.tagName.toLowerCase();
                if (t === "frame" || t === "frameset")
                    return;
                if (t === "script" || t === "iframe" || t === "portal")
                    return;
                if (t === "noscript") {
                    return Raw.div(Array.from(e.attributes), Array.from(e.children));
                }
                return e;
            });
            reader.trapAttribute((name, value, element) => {
                if (name.startsWith("on"))
                    return;
                const tag = element.tagName.toLowerCase();
                if (name === "srcset")
                    return this.resolveSourceSetUrls(value);
                if (name === "href" ||
                    name === "src" ||
                    (tag === "embed" && name === "source") ||
                    (tag === "video" && name === "poster") ||
                    (tag === "object" && name === "data") ||
                    (tag === "form" && name === "action"))
                    return this.resolvePlainUrl(value);
                return value;
            });
            reader.trapProperty((name, value) => {
                if (!urlProperties.has(name))
                    return value;
                return this.resolveCssUrls(value);
            });
            return reader.read();
        }
        /** */
        resolvePlainUrl(plainUrl) {
            if (plainUrl.startsWith("data:") ||
                plainUrl.startsWith("http:") ||
                plainUrl.startsWith("https:") ||
                plainUrl.startsWith("/") ||
                /^[a-z\-]+:/g.test(plainUrl))
                return plainUrl;
            return Webfeed.Url.resolve(plainUrl, this.baseHref);
        }
        /** */
        resolveCssUrls(cssValue) {
            const reg = /\burl\(["']?([^\s?"')]+)/gi;
            const replaced = cssValue.replace(reg, (substring, url) => {
                let resolved = this.resolvePlainUrl(url);
                if (substring.startsWith(`url("`))
                    resolved = `url("` + resolved;
                else if (substring.startsWith(`url(`))
                    resolved = `url(` + resolved;
                return resolved;
            });
            return replaced;
        }
        /**
         * Resolves URLs in a srcset attribute, using a make-shift algorithm
         * that doesn't support commas in the URL.
         */
        resolveSourceSetUrls(srcSetUrls) {
            const rawPairs = srcSetUrls.split(`,`);
            const pairs = rawPairs.map(rawPair => {
                const pair = rawPair.trim().split(/\s+/);
                if (pair.length === 1)
                    pair.push("");
                return pair;
            });
            for (const pair of pairs) {
                const [url] = pair;
                pair[0] = this.resolvePlainUrl(url);
            }
            return pairs.map(pair => pair.join(" ")).join(`, `);
        }
    }
    Webfeed.ForeignDocumentSanitizer = ForeignDocumentSanitizer;
    /** */
    const urlProperties = new Set([
        "background",
        "background-image",
        "border-image",
        "border-image-source",
        "list-style",
        "list-style-image",
        "mask",
        "mask-image",
        "-webkit-mask",
        "-webkit-mask-image",
        "content"
    ]);
})(Webfeed || (Webfeed = {}));
var Webfeed;
(function (Webfeed) {
    /**
     * A library which operates over the browser-supplied history.pushState()
     * methods. This library allows the usage of the browser's back and forward
     * buttons to be independently tracked. All history manipulation in the app
     * should pass through this layer rather than using the history.* methods
     * directly.
     */
    let History;
    (function (History) {
        /** */
        function back() {
            if (stackPosition < 0)
                return;
            disableEvents(() => {
                history.back();
                stackPosition--;
            });
        }
        History.back = back;
        /** */
        function forward() {
            if (stackPosition >= stack.length)
                return;
            disableEvents(() => {
                history.forward();
                stackPosition++;
            });
        }
        History.forward = forward;
        /** */
        function push(slug) {
            stack.length = stackPosition + 1;
            stackPosition = stack.length;
            const entry = { slug, stackPosition };
            stack.push(entry);
            history.pushState(entry, "", slug);
        }
        History.push = push;
        /** */
        function disableEvents(callback) {
            if (History.triggerProgrammaticEvents)
                disconnectHandler();
            try {
                callback();
            }
            catch (e) { }
            finally {
                maybeConnectHandler();
            }
        }
        /**
         * Indicates whether programmatic calls to history.back and history.forward()
         * should result in the back and forward events being triggered.
         */
        History.triggerProgrammaticEvents = false;
        /**
         * Installs an event handler that invokes when the
         * user presses either the back or forward button.
         */
        function on(event, fn) {
            maybeConnectHandler();
            event === "back" ?
                backHandlers.push(fn) :
                forwardHandlers.push(fn);
        }
        History.on = on;
        /** */
        function maybeConnectHandler() {
            if (!hasConnectedHandler) {
                window.addEventListener("popstate", handler);
                hasConnectedHandler = true;
            }
        }
        /** */
        function disconnectHandler() {
            window.removeEventListener("popstate", handler);
            hasConnectedHandler = false;
        }
        let hasConnectedHandler = false;
        /** */
        function handler(ev) {
            setTimeout(() => {
                const state = history.state;
                const newStackPosition = state?.stackPosition || -1;
                const handlers = newStackPosition > stackPosition ?
                    forwardHandlers :
                    backHandlers;
                for (const handler of handlers)
                    handler(ev);
            });
        }
        const backHandlers = [];
        const forwardHandlers = [];
        const stack = [];
        let stackPosition = -1;
    })(History = Webfeed.History || (Webfeed.History = {}));
})(Webfeed || (Webfeed = {}));
var Webfeed;
(function (Webfeed) {
    /**
     * Returns an Omniview class that gets populated with the
     * posters from the specified URLs.
     */
    function getOmniviewFromFeed(urls, omniviewOptions) {
        if (typeof Omniview === "undefined")
            throw new Error("Omniview library not found.");
        const raw = new Raw();
        const defaultOptions = {
            getPoster: index => {
                if (index >= urls.length)
                    return null;
                return new Promise(async (resolve) => {
                    const poster = await Webfeed.getPosterFromUrl(urls[index]);
                    resolve(poster || Webfeed.getErrorPoster());
                });
            },
            fillBody: async (fillElement, selectedElement, index) => {
                const url = urls[index];
                const reel = await Webfeed.getPageFromUrl(url);
                if (!reel)
                    return selectedElement.append(Webfeed.getErrorPoster());
                fillElement.append(Webfeed.getSandboxedElement([...reel.head, ...reel.sections], reel.url));
            }
        };
        const mergedOptions = Object.assign(omniviewOptions, defaultOptions);
        const omniview = new Omniview.Class(mergedOptions);
        raw.get(omniview)(raw.on("connected", () => omniview.gotoPosters()));
        return omniview;
    }
    Webfeed.getOmniviewFromFeed = getOmniviewFromFeed;
})(Webfeed || (Webfeed = {}));
var Webfeed;
(function (Webfeed) {
    /**
     * Returns an array of remote <section> elements that exist underneath
     * the specified container element. Defaults to the <body> element in the
     * current document if the container argument is omitted.
     */
    function getRemoteSectionElements(container = document.body) {
        return Webfeed.getElements("SECTION[src], SECTION[data-src]", container);
    }
    Webfeed.getRemoteSectionElements = getRemoteSectionElements;
    /**
     * Returns a fully-qualified version of the URI specified as the source
     * of the content in a <section> element.
     */
    function getRemoteSectionSource(section, documentUrl = Webfeed.Url.getCurrent()) {
        const src = section.getAttribute("src") || section.getAttribute("data-src") || "";
        return src ? Webfeed.Url.resolve(src, documentUrl) : "";
    }
    Webfeed.getRemoteSectionSource = getRemoteSectionSource;
    /**
     * Loads the content of any remote <section> elements
     * defined within the specified container element.
     */
    async function resolveRemoteSections(container = document, documentUrl = Webfeed.Url.getCurrent()) {
        const remoteSections = Webfeed.getRemoteSectionElements(container);
        for (const remoteSection of remoteSections) {
            block: {
                const remoteUrl = Webfeed.getRemoteSectionSource(remoteSection, documentUrl);
                if (!remoteUrl)
                    break block;
                const poster = await Webfeed.getPosterFromUrl(remoteUrl);
                if (!poster)
                    break block;
                remoteSection.replaceWith(poster);
                continue;
            }
            remoteSection.remove();
        }
    }
    Webfeed.resolveRemoteSections = resolveRemoteSections;
})(Webfeed || (Webfeed = {}));
var Webfeed;
(function (Webfeed) {
    Webfeed.standardCss = `
		HTML
		{
			scroll-snap-type: y mandatory;
		}
		HTML, BODY
		{
			margin: 0;
			padding: 0;
			height: 100%;
		}
		HTML
		{
			overflow-y: auto;
			height: 100%;
		}
		SECTION
		{
			position: relative;
			scroll-snap-align: start;
			scroll-snap-stop: always;
			height: 100%;
		}
	`.replace(/[\r\n\t]/g, "");
    //@ts-ignore
    if (typeof document === "undefined")
        return;
    /**
     * Returns the standard CSS embedded within a <style> element.
     * This <style> element should be inserted somewhere into the document
     * in order for it to be visible.
     */
    function getStandardCss() {
        const style = document.createElement("style");
        style.textContent = Webfeed.standardCss;
        return style;
    }
    Webfeed.getStandardCss = getStandardCss;
})(Webfeed || (Webfeed = {}));
var Webfeed;
(function (Webfeed) {
    /**
     * Main entry point for when the reals.js script is
     * embedded within a web page.
     */
    if (typeof document !== "undefined" &&
        typeof window !== "undefined" &&
        document.readyState !== "complete") {
        window.addEventListener("DOMContentLoaded", () => startup());
    }
    /** */
    async function startup() {
        Webfeed.resolveRemoteSections();
        let last = document.querySelector("BODY > SECTION:last-of-type");
        if (!(last instanceof HTMLElement))
            return;
        const feedInfos = Webfeed.getFeedsFromDocument();
        for (const feedInfo of feedInfos) {
            if (!feedInfo.visible)
                continue;
            const urls = await Webfeed.getFeedUrls(feedInfo.href);
            if (!urls)
                continue;
            const omniview = Webfeed.getEmbeddedOmniviewFromFeed(urls);
            last.insertAdjacentElement("afterend", omniview);
            last = omniview;
        }
    }
    typeof module === "object" && Object.assign(module.exports, { Webfeed });
})(Webfeed || (Webfeed = {}));
var Webfeed;
(function (Webfeed) {
    /**
     * A namespace of functions that perform URL manipulation.
     */
    let Url;
    (function (Url) {
        /**
         * Returns the URL of the containing folder of the specified URL.
         * The provided URL must be valid, or an exception will be thrown.
         */
        function folderOf(url) {
            const lo = new URL(url);
            const parts = lo.pathname.split("/").filter(s => !!s);
            const last = parts[parts.length - 1];
            if (/\.[a-z0-9]+$/i.test(last))
                parts.pop();
            const path = parts.join("/") + "/";
            return resolve(path, lo.protocol + "//" + lo.host);
        }
        Url.folderOf = folderOf;
        /**
         * Returns the URL provided in fully qualified form,
         * using the specified base URL.
         */
        function resolve(path, base) {
            if (/^[a-z]+:/.test(path))
                return path;
            try {
                if (!base.endsWith("/"))
                    base += "/";
                return new URL(path, base).toString();
            }
            catch (e) {
                debugger;
                return null;
            }
        }
        Url.resolve = resolve;
        /**
         * Gets the base URL of the document loaded into the current browser window.
         * Accounts for any HTML <base> tags that may be defined within the document.
         */
        function getCurrent() {
            if (storedUrl)
                return storedUrl;
            let url = Url.folderOf(document.URL);
            const base = document.querySelector("base[href]");
            if (base) {
                const href = base.getAttribute("href") || "";
                if (href)
                    url = Url.resolve(href, url);
            }
            return storedUrl = url;
        }
        Url.getCurrent = getCurrent;
        let storedUrl = "";
    })(Url = Webfeed.Url || (Webfeed.Url = {}));
})(Webfeed || (Webfeed = {}));
var Webfeed;
(function (Webfeed) {
    //# Pages
    /**
     * Organizes the specified element or elements into the
     * shadow root of a newly created <div> element.
     */
    function getSandboxedElement(contents, baseUrl) {
        const container = document.createElement("div");
        const head = [Webfeed.getStandardCss()];
        const body = [];
        const shadow = container.attachShadow({ mode: "open" });
        for (const element of Array.isArray(contents) ? contents : [contents]) {
            const n = element.nodeName;
            if (n === "SECTION")
                body.push(element);
            else if (n === "LINK" || n === "STYLE")
                head.push(element);
        }
        shadow.append(...head, ...body);
        baseUrl = Webfeed.Url.folderOf(baseUrl);
        convertEmbeddedUrlsToAbsolute(shadow, baseUrl);
        return container;
    }
    Webfeed.getSandboxedElement = getSandboxedElement;
    /**
     *
     */
    function convertEmbeddedUrlsToAbsolute(parent, baseUrl) {
        const elements = getElements(selectorForUrls, parent);
        if (parent instanceof HTMLElement)
            elements.unshift(parent);
        for (const element of elements) {
            const attrs = attrsWithUrls
                .map(a => element.getAttributeNode(a))
                .filter((a) => !!a);
            for (const attribute of attrs)
                attribute.value = Webfeed.Url.resolve(attribute.value, baseUrl);
            for (const p of cssPropertiesWithUrls) {
                let pv = element.style.getPropertyValue(p);
                if (pv === "")
                    continue;
                pv = pv.replace(/\burl\(".+?"\)/, substr => {
                    const unwrapUrl = substr.slice(5, -2);
                    const url = Webfeed.Url.resolve(unwrapUrl, baseUrl);
                    return `url("${url}")`;
                });
                element.style.setProperty(p, pv);
            }
        }
    }
    const attrsWithUrls = ["href", "src", "action", "data-src"];
    const selectorForUrls = "LINK[href], A[href], IMG[src], FORM[action], SCRIPT[src], [style]";
    const cssPropertiesWithUrls = [
        "background",
        "background-image",
        "border-image",
        "border-image-source",
        "content",
        "cursor",
        "list-style-image",
        "mask",
        "mask-image",
        "offset-path",
        "src",
    ];
    /**
     * Reads an HTML page from the specified URL, and returns an
     * object that contains the relevant content.
     */
    async function getPageFromUrl(url) {
        const baseUrl = Webfeed.Url.folderOf(url);
        const doc = await getDocumentFromUrl(url);
        if (!doc)
            return null;
        const sections = getElements("BODY > SECTION", doc);
        const feeds = getFeedsFromDocument(doc);
        const feedsUrls = feeds.map(f => f.href);
        const head = getElements("LINK, STYLE", doc.head)
            .filter(e => !feedsUrls.includes(e.getAttribute("href") || ""));
        for (const element of [...head, ...sections])
            convertEmbeddedUrlsToAbsolute(element, baseUrl);
        return {
            url,
            document: doc,
            head,
            feeds,
            sections,
        };
    }
    Webfeed.getPageFromUrl = getPageFromUrl;
    /**
     * Scans a document for <link> tags that refer to the feeds defined
     * within the specified document.
     */
    function getFeedsFromDocument(doc = document) {
        const feeds = [];
        const fe = getElements("LINK[rel=feed]", doc);
        for (const e of fe) {
            const href = e.getAttribute("href");
            if (!href)
                continue;
            const visibleAttr = e.getAttribute("disabled")?.toLowerCase();
            const visible = typeof visibleAttr === "string" && visibleAttr !== "false";
            const subscribableAttr = e.getAttribute("type")?.toLowerCase();
            const subscribable = subscribableAttr === "text/feed";
            feeds.push({ visible, subscribable, href });
        }
        return feeds;
    }
    Webfeed.getFeedsFromDocument = getFeedsFromDocument;
    /**
     * Reads a DOM Document object stored at the specified URL,
     * and returns a sanitized version of it.
     */
    async function getDocumentFromUrl(url) {
        const result = await getHttpContent(url);
        return result ? sanitizeDocument(url, result.text) : null;
    }
    Webfeed.getDocumentFromUrl = getDocumentFromUrl;
    /**
     * Removes all unsafe HTML from the specified HTML code, and patches all
     * <form> elements so that its submission operation results in the response
     * being patched within the document, rather than a redirect occuring.
     */
    async function sanitizeDocument(url, html) {
        const docUri = Webfeed.Url.folderOf(url);
        const sanitizer = new Webfeed.ForeignDocumentSanitizer(html, docUri);
        const doc = sanitizer.read();
        for (const form of Array.from(doc.getElementsByTagName("form"))) {
            if (patchedForms.has(form))
                continue;
            const action = (form.action || "").trim();
            const containingSection = getContainingSection(form);
            if (!containingSection)
                continue;
            const target = form.target.replace(/"/g, `\\"`);
            const targetElement = containingSection.querySelector(`[id="${target}"]`) || form;
            form.addEventListener("submit", async (ev) => {
                ev.preventDefault();
                if (action === "")
                    return;
                const content = await Webfeed.getHttpContent(action, {
                    method: form.method,
                    quiet: true,
                });
                if (content === null) {
                    for (const fn of submitFailureFns)
                        fn(form);
                }
                else {
                    const html = content.text;
                    const doc = await sanitizeDocument(url, html);
                    const replacements = Array.from(doc.body.children);
                    if (targetElement.tagName === "SECTION" &&
                        targetElement.parentElement?.tagName === "BODY" &&
                        replacements.some(e => e.tagName !== "SECTION")) {
                        targetElement.replaceChildren(...replacements);
                    }
                    else {
                        targetElement.replaceWith(...replacements);
                    }
                }
            });
            patchedForms.add(form);
        }
        return doc;
    }
    /**
     * Gets the <section> element defined at the root level
     * that contains the specified HTMLElement.
     */
    function getContainingSection(e) {
        let current = e;
        for (;;) {
            const closest = current.parentElement?.closest("section");
            if (!closest)
                return current === e ? null : e;
            current = closest;
        }
    }
    const patchedForms = new WeakSet();
    /**
     * Specifies a function to invoke when the  form submission fails.
     */
    function handleSubmitFailure(fn) {
        submitFailureFns.push(fn);
    }
    Webfeed.handleSubmitFailure = handleSubmitFailure;
    const submitFailureFns = [];
    //# Feeds
    /**
     * Returns a fully-qualified version of a feed URL defined within the specified
     * Node. If the within argument is omitted, the current document is used.
     */
    function getFeedUrl(within = document) {
        const link = within.querySelector(`LINK[rel="feed"][href]`);
        const href = link instanceof HTMLElement ? link.getAttribute("href") : "";
        return href ? Webfeed.Url.resolve(href, Webfeed.Url.getCurrent()) : "";
    }
    Webfeed.getFeedUrl = getFeedUrl;
    /**
     * Reads the URLs defined in the feed file located at the specified
     * URL. The function accepts a startingByte argument to allow for
     * partial downloads containing only the new content in the feed.
     */
    async function getFeedUrls(feedUrl) {
        const urls = [];
        const fetchResult = await getHttpContent(feedUrl);
        if (!fetchResult)
            return null;
        let bytesRead = -1;
        const type = (fetchResult.headers.get("Content-Type") || "").split(";")[0];
        if (type !== "text/plain") {
            console.error("Feed at URL: " + feedUrl + "was returned with an incorrect " +
                "mime type. Expected mime type is \"text/plain\", but the mime type \"" +
                type + "\" was returned.");
            return null;
        }
        else {
            urls.push(...fetchResult.text
                .split("\n")
                .map(s => s.trim())
                .filter(s => !!s)
                .filter(s => !s.startsWith("#"))
                .map(s => Webfeed.Url.resolve(s, Webfeed.Url.folderOf(feedUrl))));
            bytesRead = fetchResult.text.length || 0;
        }
        return urls;
    }
    Webfeed.getFeedUrls = getFeedUrls;
    /**
     * Finds the meta data associated with the feed at the specified URL.
     * The algorithm used is a upscan of the folder structure of the specified URL,
     * starting at it's base directory, and scanning upwards until the root
     * domain is reached.
     */
    async function getFeedMetaData(feedUrl) {
        let currentUrl = Webfeed.Url.folderOf(feedUrl);
        let author = "";
        let description = "";
        let icon = "";
        for (let safety = 1000; safety-- > 0;) {
            const httpContent = await Webfeed.getHttpContent(currentUrl, { quiet: true });
            if (httpContent) {
                const htmlContent = httpContent.text;
                const reader = new Webfeed.ForeignDocumentReader(htmlContent);
                reader.trapElement(element => {
                    if (element.nodeName === "META") {
                        const name = element.getAttribute("name")?.toLowerCase();
                        if (name === "description")
                            description = element.getAttribute("content") || "";
                        else if (name === "author")
                            author = element.getAttribute("content") || "";
                    }
                    else if (element.nodeName === "LINK") {
                        const rel = element.getAttribute("rel")?.toLowerCase();
                        if (rel === "icon")
                            icon = element.getAttribute("href") || "";
                    }
                });
                reader.read();
                if (author || description || icon)
                    break;
            }
            const url = new URL("..", currentUrl);
            if (currentUrl === url.toString())
                break;
            currentUrl = url.toString();
        }
        return { url: feedUrl, author, description, icon };
    }
    Webfeed.getFeedMetaData = getFeedMetaData;
    /**
     * Reads the poster <section> stored in the page at the specified URL.
     */
    async function getPosterFromUrl(pageUrl) {
        const page = await getPageFromUrl(pageUrl);
        return page?.sections.length ?
            Webfeed.getSandboxedElement([...page.head, page.sections[0]], page.url) :
            null;
    }
    Webfeed.getPosterFromUrl = getPosterFromUrl;
    /**
     * Reads posters from a feed text file located at the specified URL.
     *
     * @returns An async generator function that iterates through
     * every page specified in the specified feed URL, and returns
     * the poster associated with each page.
     */
    async function* getPostersFromFeed(feedUrl) {
        const urls = await Webfeed.getFeedUrls(feedUrl);
        if (!urls)
            return;
        for (const url of urls) {
            const page = await Webfeed.getPageFromUrl(url);
            const poster = page?.sections.length ?
                Webfeed.getSandboxedElement([...page.head, page.sections[0]], page.url) :
                null;
            if (poster)
                yield { poster, url };
        }
    }
    Webfeed.getPostersFromFeed = getPostersFromFeed;
    /**
     * Returns an Omniview that is automatically populated with the
     * posters from the specified URLs. The Omniview is wrapped inside
     * and element that makes the Omniview suitable for embedding on
     * a public website.
     */
    function getEmbeddedOmniviewFromFeed(urls, omniviewOptions = {}) {
        if (typeof Omniview === "undefined")
            throw new Error("Omniview library not found.");
        const raw = new Raw();
        const omniview = Webfeed.getOmniviewFromFeed(urls, omniviewOptions);
        const out = raw.div("omniview-container", {
            position: "relative",
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
            minHeight: "200vh",
        }, 
        // This overrides the "position: fixed" setting which is the
        // default for an omniview. The omniview's default fixed
        // setting does seem a bit broken. Further investigation
        // is needed to determine if this is appropriate.
        raw.get(omniview)({ position: "relative" }), 
        // Places an extra div at the bottom of the posters list
        // so that scroll-snapping works better.
        raw.div({
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            scrollSnapAlign: "end",
            scrollSnapStop: "always",
        }));
        const head = omniview.head;
        let lastY = -1;
        let lastDirection = 0;
        window.addEventListener("scroll", () => window.requestAnimationFrame(() => {
            if (omniview.mode !== 1 /* Omniview.OmniviewMode.posters */)
                return;
            const y = window.scrollY;
            if (y === lastY)
                return;
            const direction = y > lastY ? 1 : -1;
            let omniviewVisible = head.getBoundingClientRect().top <= 0;
            if (omniviewVisible) {
                if (direction === 1)
                    omniview.scrollingAncestor.style.scrollSnapType = "none";
                else if (direction === -1 && lastDirection === 1)
                    omniview.scrollingAncestor.style.removeProperty("scroll-snap-type");
            }
            lastDirection = direction;
            lastY = y;
            // Expand the size of the omniview container, in order to push the
            // footer snapper div downward so that it aligns with the bottom
            // of the omniview posters.
            const rows = Math.ceil(omniview.posterCount / omniview.size);
            const vh = rows * (100 / omniview.size);
            out.style.minHeight = vh + "vh";
        }));
        return out;
    }
    Webfeed.getEmbeddedOmniviewFromFeed = getEmbeddedOmniviewFromFeed;
    /**
     * Renders a placeholder poster for when the item couldn't be loaded.
     */
    function getErrorPoster() {
        const div = document.createElement("div");
        const s = div.style;
        s.position = "absolute";
        s.top = "0";
        s.right = "0";
        s.bottom = "0";
        s.left = "0";
        s.width = "fit-content";
        s.height = "fit-content";
        s.margin = "auto";
        s.fontSize = "20vw";
        s.fontWeight = "900";
        div.append(new Text("✕"));
        return div;
    }
    Webfeed.getErrorPoster = getErrorPoster;
    //# Generic
    /**
     * Makes an HTTP request to the specified URI and returns
     * the headers and a string containing the body.
     */
    async function getHttpContent(relativeUri, options = {}) {
        relativeUri = Webfeed.Url.resolve(relativeUri, Webfeed.Url.getCurrent());
        try {
            const fetchResult = await window.fetch(relativeUri, {
                method: options.method || "GET",
                headers: options.headers || {},
                mode: "cors",
            });
            if (!fetchResult.ok) {
                console.error("Fetch failed: " + relativeUri);
                return null;
            }
            let text = "";
            try {
                text = await fetchResult.text();
            }
            catch (e) {
                if (!options.quiet)
                    console.error("Fetch failed: " + relativeUri);
                return null;
            }
            return {
                headers: fetchResult.headers,
                text,
            };
        }
        catch (e) {
            if (!options.quiet)
                console.log("Error with request: " + relativeUri);
            return null;
        }
    }
    Webfeed.getHttpContent = getHttpContent;
    /**
     * Returns an array of HTMLElement objects that match the specified selector,
     * optionally within the specified parent node.
     */
    function getElements(selector, container = document) {
        return Array.from(container.querySelectorAll(selector));
    }
    Webfeed.getElements = getElements;
})(Webfeed || (Webfeed = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGliZmVlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2NvcmUvRm9yZWlnbkRvY3VtZW50UmVhZGVyLnRzIiwiLi4vY29yZS9Gb3JlaWduRG9jdW1lbnRTYW5pdGl6ZXIudHMiLCIuLi9jb3JlL0hpc3RvcnkudHMiLCIuLi9jb3JlL09tbml2aWV3LnRzIiwiLi4vY29yZS9SZW1vdGUudHMiLCIuLi9jb3JlL1N0YW5kYXJkQ3NzLnRzIiwiLi4vY29yZS9TdGFydHVwLnRzIiwiLi4vY29yZS9VcmwudHMiLCIuLi9jb3JlL1V0aWxpdGllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBVSxPQUFPLENBa0poQjtBQWxKRCxXQUFVLE9BQU87SUFFaEI7Ozs7T0FJRztJQUNILE1BQWEscUJBQXFCO1FBR0o7UUFEN0IsTUFBTTtRQUNOLFlBQTZCLFdBQW1CO1lBQW5CLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQUksQ0FBQztRQUVyRCxNQUFNO1FBQ04sV0FBVyxDQUFDLFNBQStDO1lBRTFELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzVCLENBQUM7UUFDTyxTQUFTLEdBQUcsQ0FBQyxPQUFnQixFQUFrQixFQUFFLENBQUMsT0FBTyxDQUFDO1FBRWxFLE1BQU07UUFDTixhQUFhLENBQUMsV0FBNkU7WUFFMUYsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDaEMsQ0FBQztRQUNPLFdBQVcsR0FBRyxDQUFDLElBQVksRUFBRSxLQUFhLEVBQUUsT0FBZ0IsRUFBaUIsRUFBRSxDQUFDLEtBQUssQ0FBQztRQUU5RixNQUFNO1FBQ04sWUFBWSxDQUFDLFVBQW1EO1lBRS9ELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzlCLENBQUM7UUFDTyxVQUFVLEdBQUcsQ0FBQyxJQUFZLEVBQUUsS0FBYSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUM7UUFFM0QsTUFBTTtRQUNOLElBQUk7WUFFSCxNQUFNLE1B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d0IsUUFBUTtRQUU3RSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFrQixDQUFDO0lBQzFFLENBQUM7SUFIZSxtQkFBVyxjQUcxQixDQUFBO0FBQ0YsQ0FBQyxFQS9rQlMsT0FBTyxLQUFQLE9BQU8sUUEra0JoQiIsInNvdXJjZXNDb250ZW50IjpbIlxubmFtZXNwYWNlIExpYmZlZWRcbntcblx0LyoqXG5cdCAqIEEgY2xhc3MgdGhhdCByZWFkcyBhIHJhdyBIVE1MIGRvY3VtZW50LCBhbmQgcHJvdmlkZXNcblx0ICogdGhlIGFiaWxpdHkgdG8gc2NhbiB0aGUgZG9jdW1lbnQgd2l0aCByZWdpc3RlcmVkIFwidHJhcHNcIixcblx0ICogd2hpY2ggYWxsb3cgdGhlIGRvY3VtZW50J3MgY29udGVudCB0byBiZSBtb2RpZmllZC5cblx0ICovXG5cdGV4cG9ydCBjbGFzcyBGb3JlaWduRG9jdW1lbnRSZWFkZXJcblx0e1xuXHRcdC8qKiAqL1xuXHRcdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgcmF3RG9jdW1lbnQ6IHN0cmluZykgeyB9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0dHJhcEVsZW1lbnQoZWxlbWVudEZuOiAoZWxlbWVudDogRWxlbWVudCkgPT4gRWxlbWVudCB8IHZvaWQpXG5cdFx0e1xuXHRcdFx0dGhpcy5lbGVtZW50Rm4gPSBlbGVtZW50Rm47XG5cdFx0fVxuXHRcdHByaXZhdGUgZWxlbWVudEZuID0gKGVsZW1lbnQ6IEVsZW1lbnQpOiBFbGVtZW50IHwgdm9pZCA9PiBlbGVtZW50O1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHRyYXBBdHRyaWJ1dGUoYXR0cmlidXRlRm46IChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIGVsZW1lbnQ6IEVsZW1lbnQpID0+IHN0cmluZyB8IHZvaWQpXG5cdFx0e1xuXHRcdFx0dGhpcy5hdHRyaWJ1dGVGbiA9IGF0dHJpYnV0ZUZuO1xuXHRcdH1cblx0XHRwcml2YXRlIGF0dHJpYnV0ZUZuID0gKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgZWxlbWVudDogRWxlbWVudCk6IHN0cmluZyB8IHZvaWQgPT4gdmFsdWU7XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0dHJhcFByb3BlcnR5KHByb3BlcnR5Rm46IChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpID0+IHN0cmluZylcblx0XHR7XG5cdFx0XHR0aGlzLnByb3BlcnR5Rm4gPSBwcm9wZXJ0eUZuO1xuXHRcdH1cblx0XHRwcml2YXRlIHByb3BlcnR5Rm4gPSAobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSA9PiBuYW1lO1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHJlYWQoKVxuXHRcdHtcblx0XHRcdGNvbnN0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcblx0XHRcdGNvbnN0IGRvYyA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcodGhpcy5yYXdEb2N1bWVudCwgXCJ0ZXh0L2h0bWxcIik7XG5cdFx0XHRjb25zdCB0cmFzaDogRWxlbWVudFtdID0gW107XG5cdFx0XHRcblx0XHRcdGZvciAoY29uc3Qgd2Fsa2VyID0gZG9jLmNyZWF0ZVRyZWVXYWxrZXIoZG9jKTs7KVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKCFub2RlKVxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKCEobm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQpKVxuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcblx0XHRcdFx0bGV0IGVsZW1lbnQgPSBub2RlIGFzIEVsZW1lbnQ7XG5cdFx0XHRcdFxuXHRcdFx0XHRjb25zdCByZXN1bHQgPSB0aGlzLmVsZW1lbnRGbihlbGVtZW50KTtcblx0XHRcdFx0aWYgKCFyZXN1bHQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0cmFzaC5wdXNoKGVsZW1lbnQpO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIE5vZGUgJiYgcmVzdWx0ICE9PSBlbGVtZW50KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZWxlbWVudC5yZXBsYWNlV2l0aChyZXN1bHQpO1xuXHRcdFx0XHRcdGVsZW1lbnQgPSByZXN1bHQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTFN0eWxlRWxlbWVudClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChlbGVtZW50LnNoZWV0KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHRoaXMucmVhZFNoZWV0KGVsZW1lbnQuc2hlZXQpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRjb25zdCBjc3NUZXh0OiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0XHRcdFx0Zm9yIChsZXQgaSA9IC0xLCBsZW4gPSBlbGVtZW50LnNoZWV0LmNzc1J1bGVzLmxlbmd0aDsgKytpIDwgbGVuOylcblx0XHRcdFx0XHRcdFx0Y3NzVGV4dC5wdXNoKGVsZW1lbnQuc2hlZXQuY3NzUnVsZXNbaV0uY3NzVGV4dCk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTFN0eWxlRWxlbWVudClcblx0XHRcdFx0XHRcdFx0ZWxlbWVudC50ZXh0Q29udGVudCA9IGNzc1RleHQuam9pbihcIlxcblwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdGZvciAoY29uc3QgYXR0ciBvZiBBcnJheS5mcm9tKGVsZW1lbnQuYXR0cmlidXRlcykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCBuZXdWYWx1ZSA9IHRoaXMuYXR0cmlidXRlRm4oYXR0ci5uYW1lLCBhdHRyLnZhbHVlLCBlbGVtZW50KTtcblx0XHRcdFx0XHRpZiAobmV3VmFsdWUgPT09IG51bGwgfHwgbmV3VmFsdWUgPT09IHVuZGVmaW5lZClcblx0XHRcdFx0XHRcdGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlTm9kZShhdHRyKTtcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyLm5hbWUsIG5ld1ZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0aWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBlbGVtZW50Lmhhc0F0dHJpYnV0ZShcInN0eWxlXCIpKVxuXHRcdFx0XHRcdHRoaXMucmVhZFN0eWxlKGVsZW1lbnQuc3R5bGUpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRmb3IgKGNvbnN0IGUgb2YgdHJhc2gpXG5cdFx0XHRcdGUucmVtb3ZlKCk7XG5cdFx0XHRcblx0XHRcdHJldHVybiBkb2M7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByaXZhdGUgcmVhZFNoZWV0KHNoZWV0OiBDU1NTdHlsZVNoZWV0KVxuXHRcdHtcblx0XHRcdGNvbnN0IHJlY3Vyc2UgPSAoZ3JvdXA6IENTU0dyb3VwaW5nUnVsZSB8IENTU1N0eWxlU2hlZXQpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGxlbiA9IGdyb3VwLmNzc1J1bGVzLmxlbmd0aDtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IC0xOyArK2kgPCBsZW47KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc3QgcnVsZSA9IGdyb3VwLmNzc1J1bGVzLml0ZW0oaSk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0aWYgKHJ1bGUgaW5zdGFuY2VvZiBDU1NHcm91cGluZ1J1bGUpXG5cdFx0XHRcdFx0XHRyZWN1cnNlKHJ1bGUpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGVsc2UgaWYgKHJ1bGUgaW5zdGFuY2VvZiBDU1NTdHlsZVJ1bGUpXG5cdFx0XHRcdFx0XHR0aGlzLnJlYWRTdHlsZShydWxlLnN0eWxlKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdFxuXHRcdFx0cmVjdXJzZShzaGVldCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByaXZhdGUgcmVhZFN0eWxlKHN0eWxlOiBDU1NTdHlsZURlY2xhcmF0aW9uKVxuXHRcdHtcblx0XHRcdGNvbnN0IG5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0XG5cdFx0XHRmb3IgKGxldCBuID0gLTE7ICsrbiA8IHN0eWxlLmxlbmd0aDspXG5cdFx0XHRcdG5hbWVzLnB1c2goc3R5bGVbbl0pO1xuXHRcdFx0XG5cdFx0XHRmb3IgKGNvbnN0IG5hbWUgb2YgbmFtZXMpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHZhbHVlID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKTtcblx0XHRcdFx0Y29uc3QgcHJpb3JpdHkgPSBzdHlsZS5nZXRQcm9wZXJ0eVByaW9yaXR5KG5hbWUpO1xuXHRcdFx0XHRjb25zdCByZXN1bHRWYWx1ZSA9IHRoaXMucHJvcGVydHlGbihuYW1lLCB2YWx1ZSk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAocmVzdWx0VmFsdWUgIT09IHZhbHVlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gVGhlIHByb3BlcnR5IGhhcyB0byBiZSByZW1vdmVkIGVpdGhlciB3YXksXG5cdFx0XHRcdFx0Ly8gYmVjYXVzZSBpZiB3ZSdyZSBzZXR0aW5nIGEgbmV3IHByb3BlcnR5IHdpdGhcblx0XHRcdFx0XHQvLyBhIGRpZmZlcmVudCBVUkwsIGl0IHdvbid0IGdldCBwcm9wZXJseSByZXBsYWNlZC5cblx0XHRcdFx0XHRzdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAocmVzdWx0VmFsdWUpXG5cdFx0XHRcdFx0XHRzdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCByZXN1bHRWYWx1ZSwgcHJpb3JpdHkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG4iLCJcbm5hbWVzcGFjZSBMaWJmZWVkXG57XG5cdC8qKlxuXHQgKiBBIGNsYXNzIHRoYXQgd3JhcHMgYSBGb3JlaWduRG9jdW1lbnRSZWFkZXIsIGFuZCB3aGljaCBjb252ZXJ0c1xuXHQgKiB0aGUgY29udGVudCBvZiB0aGUgc3BlY2lmaWVkIHJhdyBIVE1MIGRvY3VtZW50IGludG8gYSBmb3JtYXRcblx0ICogd2hpY2ggaXMgYWNjZXB0YWJsZSBmb3IgaW5qZWN0aW9uIGludG8gYSBibG9nLlxuXHQgKi9cblx0ZXhwb3J0IGNsYXNzIEZvcmVpZ25Eb2N1bWVudFNhbml0aXplclxuXHR7XG5cdFx0LyoqICovXG5cdFx0Y29uc3RydWN0b3IoXG5cdFx0XHRwcml2YXRlIHJlYWRvbmx5IHJhd0RvY3VtZW50OiBzdHJpbmcsXG5cdFx0XHRwcml2YXRlIHJlYWRvbmx5IGJhc2VIcmVmOiBzdHJpbmcpXG5cdFx0eyB9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cmVhZCgpXG5cdFx0e1xuXHRcdFx0Y29uc3QgcmVhZGVyID0gbmV3IEZvcmVpZ25Eb2N1bWVudFJlYWRlcih0aGlzLnJhd0RvY3VtZW50KTtcblx0XHRcdFxuXHRcdFx0cmVhZGVyLnRyYXBFbGVtZW50KGUgPT5cblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgdCA9IGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKHQgPT09IFwiZnJhbWVcIiB8fCB0ID09PSBcImZyYW1lc2V0XCIpXG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKHQgPT09IFwic2NyaXB0XCIgfHwgdCA9PT0gXCJpZnJhbWVcIiB8fCB0ID09PSBcInBvcnRhbFwiKVxuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XG5cdFx0XHRcdGlmICh0ID09PSBcIm5vc2NyaXB0XCIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gUmF3LmRpdihcblx0XHRcdFx0XHRcdEFycmF5LmZyb20oZS5hdHRyaWJ1dGVzKSxcblx0XHRcdFx0XHRcdEFycmF5LmZyb20oZS5jaGlsZHJlbiksXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0cmV0dXJuIGU7XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0cmVhZGVyLnRyYXBBdHRyaWJ1dGUoKG5hbWUsIHZhbHVlLCBlbGVtZW50KSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRpZiAobmFtZS5zdGFydHNXaXRoKFwib25cIikpXG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcblx0XHRcdFx0Y29uc3QgdGFnID0gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAobmFtZSA9PT0gXCJzcmNzZXRcIilcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5yZXNvbHZlU291cmNlU2V0VXJscyh2YWx1ZSk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAobmFtZSA9PT0gXCJocmVmXCIgfHwgXG5cdFx0XHRcdFx0bmFtZSA9PT0gXCJzcmNcIiB8fFxuXHRcdFx0XHRcdCh0YWcgPT09IFwiZW1iZWRcIiAmJiBuYW1lID09PSBcInNvdXJjZVwiKSB8fFxuXHRcdFx0XHRcdCh0YWcgPT09IFwidmlkZW9cIiAmJiBuYW1lID09PSBcInBvc3RlclwiKSB8fFxuXHRcdFx0XHRcdCh0YWcgPT09IFwib2JqZWN0XCIgJiYgbmFtZSA9PT0gXCJkYXRhXCIpIHx8XG5cdFx0XHRcdFx0KHRhZyA9PT0gXCJmb3JtXCIgJiYgbmFtZSA9PT0gXCJhY3Rpb25cIikpXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMucmVzb2x2ZVBsYWluVXJsKHZhbHVlKTtcblx0XHRcdFx0XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHRyZWFkZXIudHJhcFByb3BlcnR5KChuYW1lLCB2YWx1ZSkgPT5cblx0XHRcdHtcblx0XHRcdFx0aWYgKCF1cmxQcm9wZXJ0aWVzLmhhcyhuYW1lKSlcblx0XHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHRcdFxuXHRcdFx0XHRyZXR1cm4gdGhpcy5yZXNvbHZlQ3NzVXJscyh2YWx1ZSk7XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIHJlYWRlci5yZWFkKCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByaXZhdGUgcmVzb2x2ZVBsYWluVXJsKHBsYWluVXJsOiBzdHJpbmcpXG5cdFx0e1xuXHRcdFx0aWYgKHBsYWluVXJsLnN0YXJ0c1dpdGgoXCJkYXRhOlwiKSB8fFxuXHRcdFx0XHRwbGFpblVybC5zdGFydHNXaXRoKFwiaHR0cDpcIikgfHxcblx0XHRcdFx0cGxhaW5Vcmwuc3RhcnRzV2l0aChcImh0dHBzOlwiKSB8fFxuXHRcdFx0XHRwbGFpblVybC5zdGFydHNXaXRoKFwiL1wiKSB8fFxuXHRcdFx0XHQvXlthLXpcXC1dKzovZy50ZXN0KHBsYWluVXJsKSlcblx0XHRcdFx0cmV0dXJuIHBsYWluVXJsO1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4gVXJsLnJlc29sdmUocGxhaW5VcmwsIHRoaXMuYmFzZUhyZWYpO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRwcml2YXRlIHJlc29sdmVDc3NVcmxzKGNzc1ZhbHVlOiBzdHJpbmcpXG5cdFx0e1xuXHRcdFx0Y29uc3QgcmVnID0gL1xcYnVybFxcKFtcIiddPyhbXlxccz9cIicpXSspL2dpO1xuXHRcdFx0Y29uc3QgcmVwbGFjZWQgPSBjc3NWYWx1ZS5yZXBsYWNlKHJlZywgKHN1YnN0cmluZywgdXJsKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgcmVzb2x2ZWQgPSB0aGlzLnJlc29sdmVQbGFpblVybCh1cmwpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKHN1YnN0cmluZy5zdGFydHNXaXRoKGB1cmwoXCJgKSlcblx0XHRcdFx0XHRyZXNvbHZlZCA9IGB1cmwoXCJgICsgcmVzb2x2ZWQ7XG5cdFx0XHRcdFxuXHRcdFx0XHRlbHNlIGlmIChzdWJzdHJpbmcuc3RhcnRzV2l0aChgdXJsKGApKVxuXHRcdFx0XHRcdHJlc29sdmVkID0gYHVybChgICsgcmVzb2x2ZWQ7XG5cdFx0XHRcdFxuXHRcdFx0XHRyZXR1cm4gcmVzb2x2ZWQ7XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIHJlcGxhY2VkO1xuXHRcdH1cblx0XHRcblx0XHQvKipcblx0XHQgKiBSZXNvbHZlcyBVUkxzIGluIGEgc3Jjc2V0IGF0dHJpYnV0ZSwgdXNpbmcgYSBtYWtlLXNoaWZ0IGFsZ29yaXRobVxuXHRcdCAqIHRoYXQgZG9lc24ndCBzdXBwb3J0IGNvbW1hcyBpbiB0aGUgVVJMLlxuXHRcdCAqL1xuXHRcdHByaXZhdGUgcmVzb2x2ZVNvdXJjZVNldFVybHMoc3JjU2V0VXJsczogc3RyaW5nKVxuXHRcdHtcblx0XHRcdGNvbnN0IHJhd1BhaXJzID0gc3JjU2V0VXJscy5zcGxpdChgLGApO1xuXHRcdFx0Y29uc3QgcGFpcnMgPSByYXdQYWlycy5tYXAocmF3UGFpciA9PlxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBwYWlyID0gcmF3UGFpci50cmltKCkuc3BsaXQoL1xccysvKTtcblx0XHRcdFx0aWYgKHBhaXIubGVuZ3RoID09PSAxKVxuXHRcdFx0XHRcdHBhaXIucHVzaChcIlwiKTtcblx0XHRcdFx0XG5cdFx0XHRcdHJldHVybiBwYWlyIGFzIFtzdHJpbmcsIHN0cmluZ107XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0Zm9yIChjb25zdCBwYWlyIG9mIHBhaXJzKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBbdXJsXSA9IHBhaXI7XG5cdFx0XHRcdHBhaXJbMF0gPSB0aGlzLnJlc29sdmVQbGFpblVybCh1cmwpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRyZXR1cm4gcGFpcnMubWFwKHBhaXIgPT4gcGFpci5qb2luKFwiIFwiKSkuam9pbihgLCBgKTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRjb25zdCB1cmxQcm9wZXJ0aWVzID0gbmV3IFNldChbXG5cdFx0XCJiYWNrZ3JvdW5kXCIsXG5cdFx0XCJiYWNrZ3JvdW5kLWltYWdlXCIsXG5cdFx0XCJib3JkZXItaW1hZ2VcIixcblx0XHRcImJvcmRlci1pbWFnZS1zb3VyY2VcIixcblx0XHRcImxpc3Qtc3R5bGVcIixcblx0XHRcImxpc3Qtc3R5bGUtaW1hZ2VcIixcblx0XHRcIm1hc2tcIixcblx0XHRcIm1hc2staW1hZ2VcIixcblx0XHRcIi13ZWJraXQtbWFza1wiLFxuXHRcdFwiLXdlYmtpdC1tYXNrLWltYWdlXCIsXG5cdFx0XCJjb250ZW50XCJcblx0XSk7XG59XG4iLCJcbm5hbWVzcGFjZSBMaWJmZWVkXG57XG5cdC8qKlxuXHQgKiBBIGxpYnJhcnkgd2hpY2ggb3BlcmF0ZXMgb3ZlciB0aGUgYnJvd3Nlci1zdXBwbGllZCBoaXN0b3J5LnB1c2hTdGF0ZSgpXG5cdCAqIG1ldGhvZHMuIFRoaXMgbGlicmFyeSBhbGxvd3MgdGhlIHVzYWdlIG9mIHRoZSBicm93c2VyJ3MgYmFjayBhbmQgZm9yd2FyZFxuXHQgKiBidXR0b25zIHRvIGJlIGluZGVwZW5kZW50bHkgdHJhY2tlZC4gQWxsIGhpc3RvcnkgbWFuaXB1bGF0aW9uIGluIHRoZSBhcHBcblx0ICogc2hvdWxkIHBhc3MgdGhyb3VnaCB0aGlzIGxheWVyIHJhdGhlciB0aGFuIHVzaW5nIHRoZSBoaXN0b3J5LiogbWV0aG9kc1xuXHQgKiBkaXJlY3RseS5cblx0ICovXG5cdGV4cG9ydCBuYW1lc3BhY2UgSGlzdG9yeVxuXHR7XG5cdFx0LyoqICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIGJhY2soKVxuXHRcdHtcblx0XHRcdGlmIChzdGFja1Bvc2l0aW9uIDwgMClcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XG5cdFx0XHRkaXNhYmxlRXZlbnRzKCgpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGhpc3RvcnkuYmFjaygpO1xuXHRcdFx0XHRzdGFja1Bvc2l0aW9uLS07XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIGZvcndhcmQoKVxuXHRcdHtcblx0XHRcdGlmIChzdGFja1Bvc2l0aW9uID49IHN0YWNrLmxlbmd0aClcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XG5cdFx0XHRkaXNhYmxlRXZlbnRzKCgpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGhpc3RvcnkuZm9yd2FyZCgpO1xuXHRcdFx0XHRzdGFja1Bvc2l0aW9uKys7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIHB1c2goc2x1Zzogc3RyaW5nKVxuXHRcdHtcblx0XHRcdHN0YWNrLmxlbmd0aCA9IHN0YWNrUG9zaXRpb24gKyAxO1xuXHRcdFx0c3RhY2tQb3NpdGlvbiA9IHN0YWNrLmxlbmd0aDtcblx0XHRcdGNvbnN0IGVudHJ5OiBUSGlzdG9yeUVudHJ5ID0geyBzbHVnLCBzdGFja1Bvc2l0aW9uIH07XG5cdFx0XHRzdGFjay5wdXNoKGVudHJ5KTtcblx0XHRcdGhpc3RvcnkucHVzaFN0YXRlKGVudHJ5LCBcIlwiLCBzbHVnKTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0ZnVuY3Rpb24gZGlzYWJsZUV2ZW50cyhjYWxsYmFjazogKCkgPT4gdm9pZClcblx0XHR7XG5cdFx0XHRpZiAodHJpZ2dlclByb2dyYW1tYXRpY0V2ZW50cylcblx0XHRcdFx0ZGlzY29ubmVjdEhhbmRsZXIoKTtcblx0XHRcdFxuXHRcdFx0dHJ5XG5cdFx0XHR7XG5cdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHR9XG5cdFx0XHRjYXRjaCAoZSkgeyB9XG5cdFx0XHRmaW5hbGx5XG5cdFx0XHR7XG5cdFx0XHRcdG1heWJlQ29ubmVjdEhhbmRsZXIoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogSW5kaWNhdGVzIHdoZXRoZXIgcHJvZ3JhbW1hdGljIGNhbGxzIHRvIGhpc3RvcnkuYmFjayBhbmQgaGlzdG9yeS5mb3J3YXJkKClcblx0XHQgKiBzaG91bGQgcmVzdWx0IGluIHRoZSBiYWNrIGFuZCBmb3J3YXJkIGV2ZW50cyBiZWluZyB0cmlnZ2VyZWQuXG5cdFx0ICovXG5cdFx0ZXhwb3J0IGxldCB0cmlnZ2VyUHJvZ3JhbW1hdGljRXZlbnRzID0gZmFsc2U7XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogSW5zdGFsbHMgYW4gZXZlbnQgaGFuZGxlciB0aGF0IGludm9rZXMgd2hlbiB0aGVcblx0XHQgKiB1c2VyIHByZXNzZXMgZWl0aGVyIHRoZSBiYWNrIG9yIGZvcndhcmQgYnV0dG9uLlxuXHRcdCAqL1xuXHRcdGV4cG9ydCBmdW5jdGlvbiBvbihldmVudDogXCJiYWNrXCIgfCBcImZvcndhcmRcIiwgZm46ICgpID0+IHZvaWQpXG5cdFx0e1xuXHRcdFx0bWF5YmVDb25uZWN0SGFuZGxlcigpO1xuXHRcdFx0XG5cdFx0XHRldmVudCA9PT0gXCJiYWNrXCIgP1xuXHRcdFx0XHRiYWNrSGFuZGxlcnMucHVzaChmbikgOlxuXHRcdFx0XHRmb3J3YXJkSGFuZGxlcnMucHVzaChmbik7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGZ1bmN0aW9uIG1heWJlQ29ubmVjdEhhbmRsZXIoKVxuXHRcdHtcblx0XHRcdGlmICghaGFzQ29ubmVjdGVkSGFuZGxlcilcblx0XHRcdHtcblx0XHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLCBoYW5kbGVyKTtcblx0XHRcdFx0aGFzQ29ubmVjdGVkSGFuZGxlciA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGZ1bmN0aW9uIGRpc2Nvbm5lY3RIYW5kbGVyKClcblx0XHR7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsIGhhbmRsZXIpO1xuXHRcdFx0aGFzQ29ubmVjdGVkSGFuZGxlciA9IGZhbHNlO1xuXHRcdH1cblx0XHRcblx0XHRsZXQgaGFzQ29ubmVjdGVkSGFuZGxlciA9IGZhbHNlO1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGZ1bmN0aW9uIGhhbmRsZXIoZXY6IFBvcFN0YXRlRXZlbnQpXG5cdFx0e1xuXHRcdFx0c2V0VGltZW91dCgoKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBzdGF0ZSA9IChoaXN0b3J5LnN0YXRlIGFzIFRIaXN0b3J5RW50cnkgfCBudWxsKTtcblx0XHRcdFx0Y29uc3QgbmV3U3RhY2tQb3NpdGlvbiA9IHN0YXRlPy5zdGFja1Bvc2l0aW9uIHx8IC0xO1xuXHRcdFx0XHRjb25zdCBoYW5kbGVycyA9IG5ld1N0YWNrUG9zaXRpb24gPiBzdGFja1Bvc2l0aW9uID9cblx0XHRcdFx0XHRmb3J3YXJkSGFuZGxlcnMgOlxuXHRcdFx0XHRcdGJhY2tIYW5kbGVycztcblx0XHRcdFx0XG5cdFx0XHRcdGZvciAoY29uc3QgaGFuZGxlciBvZiBoYW5kbGVycylcblx0XHRcdFx0XHRoYW5kbGVyKGV2KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRcblx0XHR0eXBlIFRIaXN0b3J5RW50cnkgPSB7IHNsdWc6IHN0cmluZywgc3RhY2tQb3NpdGlvbjogbnVtYmVyIH07XG5cdFx0Y29uc3QgYmFja0hhbmRsZXJzOiAoKGV2OiBQb3BTdGF0ZUV2ZW50KSA9PiB2b2lkKVtdID0gW107XG5cdFx0Y29uc3QgZm9yd2FyZEhhbmRsZXJzOiAoKGV2OiBQb3BTdGF0ZUV2ZW50KSA9PiB2b2lkKVtdID0gW107XG5cdFx0Y29uc3Qgc3RhY2s6IFRIaXN0b3J5RW50cnlbXSA9IFtdO1xuXHRcdGxldCBzdGFja1Bvc2l0aW9uID0gLTE7XG5cdH1cbn1cbiIsIlxubmFtZXNwYWNlIExpYmZlZWRcbntcblx0LyoqXG5cdCAqIFJldHVybnMgYW4gT21uaXZpZXcgY2xhc3MgdGhhdCBnZXRzIHBvcHVsYXRlZCB3aXRoIHRoZVxuXHQgKiBwb3N0ZXJzIGZyb20gdGhlIHNwZWNpZmllZCBVUkxzLlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGdldE9tbml2aWV3RnJvbUZlZWQoXG5cdFx0dXJsczogc3RyaW5nW10sXG5cdFx0b21uaXZpZXdPcHRpb25zOiBQYXJ0aWFsPElPbW5pdmlld09wdGlvbnM+KTogdW5rbm93blxuXHR7XG5cdFx0aWYgKHR5cGVvZiBPbW5pdmlldyA9PT0gXCJ1bmRlZmluZWRcIilcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk9tbml2aWV3IGxpYnJhcnkgbm90IGZvdW5kLlwiKTtcblx0XHRcblx0XHRjb25zdCByYXcgPSBuZXcgUmF3KCk7XG5cdFx0XG5cdFx0Y29uc3QgZGVmYXVsdE9wdGlvbnM6IElPbW5pdmlld09wdGlvbnMgPSB7XG5cdFx0XHRnZXRQb3N0ZXI6IGluZGV4ID0+XG5cdFx0XHR7XG5cdFx0XHRcdGlmIChpbmRleCA+PSB1cmxzLmxlbmd0aClcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0XG5cdFx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShhc3luYyByZXNvbHZlID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCBwb3N0ZXIgPSBhd2FpdCBMaWJmZWVkLmdldFBvc3RlckZyb21VcmwodXJsc1tpbmRleF0pO1xuXHRcdFx0XHRcdHJlc29sdmUocG9zdGVyIHx8IGdldEVycm9yUG9zdGVyKCkpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0sXG5cdFx0XHRmaWxsQm9keTogYXN5bmMgKGZpbGxFbGVtZW50LCBzZWxlY3RlZEVsZW1lbnQsIGluZGV4KSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCB1cmwgPSB1cmxzW2luZGV4XTtcblx0XHRcdFx0Y29uc3QgcmVlbCA9IGF3YWl0IExpYmZlZWQuZ2V0UGFnZUZyb21VcmwodXJsKTtcblx0XHRcdFx0aWYgKCFyZWVsKVxuXHRcdFx0XHRcdHJldHVybiBzZWxlY3RlZEVsZW1lbnQuYXBwZW5kKGdldEVycm9yUG9zdGVyKCkpO1xuXHRcdFx0XHRcblx0XHRcdFx0ZmlsbEVsZW1lbnQuYXBwZW5kKFxuXHRcdFx0XHRcdExpYmZlZWQuZ2V0U2FuZGJveGVkRWxlbWVudChbLi4ucmVlbC5oZWFkLCAuLi5yZWVsLnNlY3Rpb25zXSwgcmVlbC51cmwpXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRcblx0XHRjb25zdCBtZXJnZWRPcHRpb25zID0gT2JqZWN0LmFzc2lnbihvbW5pdmlld09wdGlvbnMsIGRlZmF1bHRPcHRpb25zKTtcblx0XHRjb25zdCBvbW5pdmlldyA9IG5ldyBPbW5pdmlldy5DbGFzcyhtZXJnZWRPcHRpb25zKTtcblx0XHRcblx0XHRyYXcuZ2V0KG9tbml2aWV3KShcblx0XHRcdHJhdy5vbihcImNvbm5lY3RlZFwiLCAoKSA9PiBvbW5pdmlldy5nb3RvUG9zdGVycygpKVxuXHRcdCk7XG5cdFx0XG5cdFx0cmV0dXJuIG9tbml2aWV3O1xuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGludGVyZmFjZSBJT21uaXZpZXdPcHRpb25zXG5cdHtcblx0XHQvKipcblx0XHQgKiBTcGVjaWZpZXMgdGhlIGluZGV4IG9mIHRoZSB0b3Btb3N0IGFuZCBsZWZ0bW9zdCBwb3N0ZXIgaW4gdGhlIHBvc3RlclxuXHRcdCAqIGxpc3Qgd2hlbiB0aGUgT21uaXZpZXcgaXMgZmlyc3QgcmVuZGVyZWQuIE51bWJlcnMgZ3JlYXRlciB0aGFuIHplcm9cblx0XHQgKiBhbGxvdyBiYWNrLXRyYWNraW5nLlxuXHRcdCAqL1xuXHRcdGFuY2hvckluZGV4PzogbnVtYmVyO1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIEEgcmVxdWlyZWQgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBwb3N0ZXIgZnJhbWUgZm9yIGEgZ2l2ZW4gcG9zaXRpb25cblx0XHQgKiBpbiB0aGUgT21uaXZpZXcuXG5cdFx0ICovXG5cdFx0Z2V0UG9zdGVyOiBHZXRQb3N0ZXJGbjtcblx0XHRcblx0XHQvKipcblx0XHQgKiBBIHJlcXVpcmVkIGZ1bmN0aW9uIHRoYXQgY2F1c2VzIGJvZGllcyB0byBiZSBmaWxsZWQgd2l0aCBjb250ZW50XG5cdFx0ICogd2hlbiB0aGUgcG9zdGVyIGlzIHNlbGVjdGVkLlxuXHRcdCAqL1xuXHRcdGZpbGxCb2R5OiBGaWxsRm47XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogQWxsb3dzIEFQSSBjb25zdW1lcnMgdG8gc3VwcGx5IHRoZWlyIG93biBjb250YWluZXIgZWxlbWVudCBmb3IgYm9kaWVzXG5cdFx0ICogdG8gYmUgcGxhY2VkIGluIGN1c3RvbSBsb2NhdGlvbnMuXG5cdFx0ICovXG5cdFx0Z2V0Qm9keUNvbnRhaW5lcj86ICgpID0+IEhUTUxFbGVtZW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBwb3N0ZXIgSFRNTEVsZW1lbnQgZm9yIHRoZSBnaXZlbiBpbmRleCBpbiB0aGUgc3RyZWFtLlxuXHQgKiBUaGUgZnVuY3Rpb24gc2hvdWxkIHJldHVybiBudWxsIHRvIHN0b3AgbG9va2luZyBmb3IgcG9zdGVycyBhdCBvclxuXHQgKiBiZXlvbmQgdGhlIHNwZWNpZmllZCBpbmRleC5cblx0ICovXG5cdGV4cG9ydCB0eXBlIEdldFBvc3RlckZuID0gKGluZGV4OiBudW1iZXIpID0+IFByb21pc2U8SFRNTEVsZW1lbnQ+IHwgSFRNTEVsZW1lbnQgfCBudWxsO1xuXHRcblx0LyoqICovXG5cdGV4cG9ydCB0eXBlIEZpbGxGbiA9IChmaWxsRWxlbWVudDogSFRNTEVsZW1lbnQsIHNlbGVjdGVkRWxlbWVudDogSFRNTEVsZW1lbnQsIGluZGV4OiBudW1iZXIpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xuXHRcbn1cbiIsIlxubmFtZXNwYWNlIExpYmZlZWRcbntcblx0LyoqXG5cdCAqIFJldHVybnMgYW4gYXJyYXkgb2YgcmVtb3RlIDxzZWN0aW9uPiBlbGVtZW50cyB0aGF0IGV4aXN0IHVuZGVybmVhdGhcblx0ICogdGhlIHNwZWNpZmllZCBjb250YWluZXIgZWxlbWVudC4gRGVmYXVsdHMgdG8gdGhlIDxib2R5PiBlbGVtZW50IGluIHRoZVxuXHQgKiBjdXJyZW50IGRvY3VtZW50IGlmIHRoZSBjb250YWluZXIgYXJndW1lbnQgaXMgb21pdHRlZC5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBnZXRSZW1vdGVTZWN0aW9uRWxlbWVudHMoY29udGFpbmVyOiBQYXJlbnROb2RlID0gZG9jdW1lbnQuYm9keSlcblx0e1xuXHRcdHJldHVybiBnZXRFbGVtZW50cyhcIlNFQ1RJT05bc3JjXSwgU0VDVElPTltkYXRhLXNyY11cIiwgY29udGFpbmVyKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJldHVybnMgYSBmdWxseS1xdWFsaWZpZWQgdmVyc2lvbiBvZiB0aGUgVVJJIHNwZWNpZmllZCBhcyB0aGUgc291cmNlXG5cdCAqIG9mIHRoZSBjb250ZW50IGluIGEgPHNlY3Rpb24+IGVsZW1lbnQuXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gZ2V0UmVtb3RlU2VjdGlvblNvdXJjZShcblx0XHRzZWN0aW9uOiBIVE1MRWxlbWVudCxcblx0XHRkb2N1bWVudFVybCA9IFVybC5nZXRDdXJyZW50KCkpXG5cdHtcblx0XHRjb25zdCBzcmMgPSBzZWN0aW9uLmdldEF0dHJpYnV0ZShcInNyY1wiKSB8fCBzZWN0aW9uLmdldEF0dHJpYnV0ZShcImRhdGEtc3JjXCIpIHx8IFwiXCI7XG5cdFx0cmV0dXJuIHNyYyA/IFVybC5yZXNvbHZlKHNyYywgZG9jdW1lbnRVcmwpIDogXCJcIjtcblx0fVxuXHRcblx0LyoqXG5cdCAqIExvYWRzIHRoZSBjb250ZW50IG9mIGFueSByZW1vdGUgPHNlY3Rpb24+IGVsZW1lbnRzXG5cdCAqIGRlZmluZWQgd2l0aGluIHRoZSBzcGVjaWZpZWQgY29udGFpbmVyIGVsZW1lbnQuXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzb2x2ZVJlbW90ZVNlY3Rpb25zKFxuXHRcdGNvbnRhaW5lcjogUGFyZW50Tm9kZSA9IGRvY3VtZW50LFxuXHRcdGRvY3VtZW50VXJsID0gVXJsLmdldEN1cnJlbnQoKSlcblx0e1xuXHRcdGNvbnN0IHJlbW90ZVNlY3Rpb25zID0gTGliZmVlZC5nZXRSZW1vdGVTZWN0aW9uRWxlbWVudHMoY29udGFpbmVyKTtcblx0XHRmb3IgKGNvbnN0IHJlbW90ZVNlY3Rpb24gb2YgcmVtb3RlU2VjdGlvbnMpXG5cdFx0e1xuXHRcdFx0YmxvY2s6XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHJlbW90ZVVybCA9IExpYmZlZWQuZ2V0UmVtb3RlU2VjdGlvblNvdXJjZShyZW1vdGVTZWN0aW9uLCBkb2N1bWVudFVybCk7XG5cdFx0XHRcdGlmICghcmVtb3RlVXJsKVxuXHRcdFx0XHRcdGJyZWFrIGJsb2NrO1xuXHRcdFx0XHRcblx0XHRcdFx0Y29uc3QgcG9zdGVyID0gYXdhaXQgTGliZmVlZC5nZXRQb3N0ZXJGcm9tVXJsKHJlbW90ZVVybCk7XG5cdFx0XHRcdGlmICghcG9zdGVyKVxuXHRcdFx0XHRcdGJyZWFrIGJsb2NrO1xuXHRcdFx0XHRcblx0XHRcdFx0cmVtb3RlU2VjdGlvbi5yZXBsYWNlV2l0aChwb3N0ZXIpO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0cmVtb3RlU2VjdGlvbi5yZW1vdmUoKTtcblx0XHR9XG5cdH1cbn1cbiIsIlxubmFtZXNwYWNlIExpYmZlZWRcbntcblx0ZXhwb3J0IGNvbnN0IHN0YW5kYXJkQ3NzID0gYFxuXHRcdEhUTUxcblx0XHR7XG5cdFx0XHRzY3JvbGwtc25hcC10eXBlOiB5IG1hbmRhdG9yeTtcblx0XHR9XG5cdFx0SFRNTCwgQk9EWVxuXHRcdHtcblx0XHRcdG1hcmdpbjogMDtcblx0XHRcdHBhZGRpbmc6IDA7XG5cdFx0XHRoZWlnaHQ6IDEwMCU7XG5cdFx0fVxuXHRcdEhUTUxcblx0XHR7XG5cdFx0XHRvdmVyZmxvdy15OiBhdXRvO1xuXHRcdFx0aGVpZ2h0OiAxMDAlO1xuXHRcdH1cblx0XHRTRUNUSU9OXG5cdFx0e1xuXHRcdFx0cG9zaXRpb246IHJlbGF0aXZlO1xuXHRcdFx0c2Nyb2xsLXNuYXAtYWxpZ246IHN0YXJ0O1xuXHRcdFx0c2Nyb2xsLXNuYXAtc3RvcDogYWx3YXlzO1xuXHRcdFx0aGVpZ2h0OiAxMDAlO1xuXHRcdH1cblx0YC5yZXBsYWNlKC9bXFxyXFxuXFx0XS9nLCBcIlwiKTtcblx0XG5cdC8vQHRzLWlnbm9yZVxuXHRpZiAodHlwZW9mIGRvY3VtZW50ID09PSBcInVuZGVmaW5lZFwiKSByZXR1cm47XG5cdFxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgc3RhbmRhcmQgQ1NTIGVtYmVkZGVkIHdpdGhpbiBhIDxzdHlsZT4gZWxlbWVudC5cblx0ICogVGhpcyA8c3R5bGU+IGVsZW1lbnQgc2hvdWxkIGJlIGluc2VydGVkIHNvbWV3aGVyZSBpbnRvIHRoZSBkb2N1bWVudFxuXHQgKiBpbiBvcmRlciBmb3IgaXQgdG8gYmUgdmlzaWJsZS5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBnZXRTdGFuZGFyZENzcygpXG5cdHtcblx0XHRjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcblx0XHRzdHlsZS50ZXh0Q29udGVudCA9IHN0YW5kYXJkQ3NzO1xuXHRcdHJldHVybiBzdHlsZTtcblx0fVxufVxuIiwiXG5uYW1lc3BhY2UgTGliZmVlZFxue1xuXHQvKipcblx0ICogTWFpbiBlbnRyeSBwb2ludCBmb3Igd2hlbiB0aGUgcmVhbHMuanMgc2NyaXB0IGlzIFxuXHQgKiBlbWJlZGRlZCB3aXRoaW4gYSB3ZWIgcGFnZS5cblx0ICovXG5cdGlmICh0eXBlb2YgZG9jdW1lbnQgIT09IFwidW5kZWZpbmVkXCIgJiYgXG5cdFx0dHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuXHRcdGRvY3VtZW50LnJlYWR5U3RhdGUgIT09IFwiY29tcGxldGVcIilcblx0e1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiBzdGFydHVwKCkpO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0YXN5bmMgZnVuY3Rpb24gc3RhcnR1cCgpXG5cdHtcblx0XHRMaWJmZWVkLnJlc29sdmVSZW1vdGVTZWN0aW9ucygpO1xuXHRcdFxuXHRcdGxldCBsYXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIkJPRFkgPiBTRUNUSU9OOmxhc3Qtb2YtdHlwZVwiKSE7XG5cdFx0aWYgKCEobGFzdCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSlcblx0XHRcdHJldHVybjtcblx0XHRcblx0XHRjb25zdCBmZWVkSW5mb3MgPSBMaWJmZWVkLmdldEZlZWRzRnJvbURvY3VtZW50KCk7XG5cdFx0Zm9yIChjb25zdCBmZWVkSW5mbyBvZiBmZWVkSW5mb3MpXG5cdFx0e1xuXHRcdFx0aWYgKCFmZWVkSW5mby52aXNpYmxlKVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFxuXHRcdFx0Y29uc3QgdXJscyA9IGF3YWl0IExpYmZlZWQuZ2V0RmVlZFVybHMoZmVlZEluZm8uaHJlZik7XG5cdFx0XHRpZiAoIXVybHMpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHRjb25zdCBvbW5pdmlldyA9IExpYmZlZWQuZ2V0RW1iZWRkZWRPbW5pdmlld0Zyb21GZWVkKHVybHMpO1xuXHRcdFx0bGFzdC5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJhZnRlcmVuZFwiLCBvbW5pdmlldyk7XG5cdFx0XHRsYXN0ID0gb21uaXZpZXc7XG5cdFx0fVxuXHR9XG5cdFxuXHRkZWNsYXJlIGNvbnN0IG1vZHVsZTogYW55O1xuXHR0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIE9iamVjdC5hc3NpZ24obW9kdWxlLmV4cG9ydHMsIHsgTGliZmVlZCB9KTtcbn1cbiIsIlxubmFtZXNwYWNlIExpYmZlZWRcbntcblx0LyoqXG5cdCAqIEEgbmFtZXNwYWNlIG9mIGZ1bmN0aW9ucyB0aGF0IHBlcmZvcm0gVVJMIG1hbmlwdWxhdGlvbi5cblx0ICovXG5cdGV4cG9ydCBuYW1lc3BhY2UgVXJsXG5cdHtcblx0XHQvKipcblx0XHQgKiBSZXR1cm5zIHRoZSBVUkwgb2YgdGhlIGNvbnRhaW5pbmcgZm9sZGVyIG9mIHRoZSBzcGVjaWZpZWQgVVJMLlxuXHRcdCAqIFRoZSBwcm92aWRlZCBVUkwgbXVzdCBiZSB2YWxpZCwgb3IgYW4gZXhjZXB0aW9uIHdpbGwgYmUgdGhyb3duLlxuXHRcdCAqL1xuXHRcdGV4cG9ydCBmdW5jdGlvbiBmb2xkZXJPZih1cmw6IHN0cmluZylcblx0XHR7XG5cdFx0XHRjb25zdCBsbyA9IG5ldyBVUkwodXJsKTtcblx0XHRcdGNvbnN0IHBhcnRzID0gbG8ucGF0aG5hbWUuc3BsaXQoXCIvXCIpLmZpbHRlcihzID0+ICEhcyk7XG5cdFx0XHRjb25zdCBsYXN0ID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV07XG5cdFx0XHRcblx0XHRcdGlmICgvXFwuW2EtejAtOV0rJC9pLnRlc3QobGFzdCkpXG5cdFx0XHRcdHBhcnRzLnBvcCgpO1xuXHRcdFx0XG5cdFx0XHRjb25zdCBwYXRoID0gcGFydHMuam9pbihcIi9cIikgKyBcIi9cIjtcblx0XHRcdHJldHVybiByZXNvbHZlKHBhdGgsIGxvLnByb3RvY29sICsgXCIvL1wiICsgbG8uaG9zdCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFJldHVybnMgdGhlIFVSTCBwcm92aWRlZCBpbiBmdWxseSBxdWFsaWZpZWQgZm9ybSxcblx0XHQgKiB1c2luZyB0aGUgc3BlY2lmaWVkIGJhc2UgVVJMLlxuXHRcdCAqL1xuXHRcdGV4cG9ydCBmdW5jdGlvbiByZXNvbHZlKHBhdGg6IHN0cmluZywgYmFzZTogc3RyaW5nKVxuXHRcdHtcblx0XHRcdGlmICgvXlthLXpdKzovLnRlc3QocGF0aCkpXG5cdFx0XHRcdHJldHVybiBwYXRoO1xuXHRcdFx0XG5cdFx0XHR0cnlcblx0XHRcdHtcblx0XHRcdFx0aWYgKCFiYXNlLmVuZHNXaXRoKFwiL1wiKSlcblx0XHRcdFx0XHRiYXNlICs9IFwiL1wiO1xuXHRcdFx0XHRcblx0XHRcdFx0cmV0dXJuIG5ldyBVUkwocGF0aCwgYmFzZSkudG9TdHJpbmcoKTtcblx0XHRcdH1cblx0XHRcdGNhdGNoIChlKVxuXHRcdFx0e1xuXHRcdFx0XHRkZWJ1Z2dlcjtcblx0XHRcdFx0cmV0dXJuIG51bGwgYXMgbmV2ZXI7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIEdldHMgdGhlIGJhc2UgVVJMIG9mIHRoZSBkb2N1bWVudCBsb2FkZWQgaW50byB0aGUgY3VycmVudCBicm93c2VyIHdpbmRvdy5cblx0XHQgKiBBY2NvdW50cyBmb3IgYW55IEhUTUwgPGJhc2U+IHRhZ3MgdGhhdCBtYXkgYmUgZGVmaW5lZCB3aXRoaW4gdGhlIGRvY3VtZW50LlxuXHRcdCAqL1xuXHRcdGV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50KClcblx0XHR7XG5cdFx0XHRpZiAoc3RvcmVkVXJsKVxuXHRcdFx0XHRyZXR1cm4gc3RvcmVkVXJsO1xuXHRcdFx0XG5cdFx0XHRsZXQgdXJsID0gVXJsLmZvbGRlck9mKGRvY3VtZW50LlVSTCk7XG5cdFx0XHRcblx0XHRcdGNvbnN0IGJhc2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYmFzZVtocmVmXVwiKTtcblx0XHRcdGlmIChiYXNlKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBocmVmID0gYmFzZS5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpIHx8IFwiXCI7XG5cdFx0XHRcdGlmIChocmVmKVxuXHRcdFx0XHRcdHVybCA9IFVybC5yZXNvbHZlKGhyZWYsIHVybCk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHJldHVybiBzdG9yZWRVcmwgPSB1cmw7XG5cdFx0fVxuXHRcdGxldCBzdG9yZWRVcmwgPSBcIlwiO1xuXHR9XG59XG4iLCJcbm5hbWVzcGFjZSBMaWJmZWVkXG57XG5cdC8vIyBQYWdlc1xuXHRcblx0LyoqXG5cdCAqIE9yZ2FuaXplcyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgb3IgZWxlbWVudHMgaW50byB0aGVcblx0ICogc2hhZG93IHJvb3Qgb2YgYSBuZXdseSBjcmVhdGVkIDxkaXY+IGVsZW1lbnQuXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gZ2V0U2FuZGJveGVkRWxlbWVudChcblx0XHRjb250ZW50czogSFRNTEVsZW1lbnQgfCBIVE1MRWxlbWVudFtdLFxuXHRcdGJhc2VVcmw6IHN0cmluZylcblx0e1xuXHRcdGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cdFx0Y29uc3QgaGVhZDogSFRNTEVsZW1lbnRbXSA9IFtMaWJmZWVkLmdldFN0YW5kYXJkQ3NzKCldO1xuXHRcdGNvbnN0IGJvZHk6IEhUTUxFbGVtZW50W10gPSBbXTtcblx0XHRjb25zdCBzaGFkb3cgPSBjb250YWluZXIuYXR0YWNoU2hhZG93KHsgbW9kZTogXCJvcGVuXCIgfSk7XG5cdFx0XG5cdFx0Zm9yIChjb25zdCBlbGVtZW50IG9mIEFycmF5LmlzQXJyYXkoY29udGVudHMpID8gY29udGVudHMgOiBbY29udGVudHNdKVxuXHRcdHtcblx0XHRcdGNvbnN0IG4gPSBlbGVtZW50Lm5vZGVOYW1lO1xuXHRcdFx0XG5cdFx0XHRpZiAobiA9PT0gXCJTRUNUSU9OXCIpXG5cdFx0XHRcdGJvZHkucHVzaChlbGVtZW50KTtcblx0XHRcdFxuXHRcdFx0ZWxzZSBpZiAobiA9PT0gXCJMSU5LXCIgfHwgbiA9PT0gXCJTVFlMRVwiKVxuXHRcdFx0XHRoZWFkLnB1c2goZWxlbWVudCk7XG5cdFx0fVxuXHRcdFxuXHRcdHNoYWRvdy5hcHBlbmQoLi4uaGVhZCwgLi4uYm9keSk7XG5cdFx0YmFzZVVybCA9IFVybC5mb2xkZXJPZihiYXNlVXJsKTtcblx0XHRjb252ZXJ0RW1iZWRkZWRVcmxzVG9BYnNvbHV0ZShzaGFkb3csIGJhc2VVcmwpO1xuXHRcdHJldHVybiBjb250YWluZXI7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBcblx0ICovXG5cdGZ1bmN0aW9uIGNvbnZlcnRFbWJlZGRlZFVybHNUb0Fic29sdXRlKHBhcmVudDogUGFyZW50Tm9kZSwgYmFzZVVybDogc3RyaW5nKVxuXHR7XG5cdFx0Y29uc3QgZWxlbWVudHMgPSBnZXRFbGVtZW50cyhzZWxlY3RvckZvclVybHMsIHBhcmVudCk7XG5cdFx0XG5cdFx0aWYgKHBhcmVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuXHRcdFx0ZWxlbWVudHMudW5zaGlmdChwYXJlbnQpO1xuXHRcdFxuXHRcdGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cylcblx0XHR7XG5cdFx0XHRjb25zdCBhdHRycyA9IGF0dHJzV2l0aFVybHNcblx0XHRcdFx0Lm1hcChhID0+IGVsZW1lbnQuZ2V0QXR0cmlidXRlTm9kZShhKSlcblx0XHRcdFx0LmZpbHRlcigoYSk6IGEgaXMgQXR0ciA9PiAhIWEpO1xuXHRcdFx0XG5cdFx0XHRmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBhdHRycylcblx0XHRcdFx0YXR0cmlidXRlLnZhbHVlID0gVXJsLnJlc29sdmUoYXR0cmlidXRlLnZhbHVlLCBiYXNlVXJsKTtcblx0XHRcdFxuXHRcdFx0Zm9yIChjb25zdCBwIG9mIGNzc1Byb3BlcnRpZXNXaXRoVXJscylcblx0XHRcdHtcblx0XHRcdFx0bGV0IHB2ID0gZWxlbWVudC5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHApO1xuXHRcdFx0XHRpZiAocHYgPT09IFwiXCIpXG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFxuXHRcdFx0XHRwdiA9IHB2LnJlcGxhY2UoL1xcYnVybFxcKFwiLis/XCJcXCkvLCBzdWJzdHIgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0IHVud3JhcFVybCA9IHN1YnN0ci5zbGljZSg1LCAtMik7XG5cdFx0XHRcdFx0Y29uc3QgdXJsID0gVXJsLnJlc29sdmUodW53cmFwVXJsLCBiYXNlVXJsKTtcblx0XHRcdFx0XHRyZXR1cm4gYHVybChcIiR7dXJsfVwiKWA7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRcblx0XHRcdFx0ZWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eShwLCBwdik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdFxuXHRjb25zdCBhdHRyc1dpdGhVcmxzID0gW1wiaHJlZlwiLCBcInNyY1wiLCBcImFjdGlvblwiLCBcImRhdGEtc3JjXCJdO1xuXHRjb25zdCBzZWxlY3RvckZvclVybHMgPSBcIkxJTktbaHJlZl0sIEFbaHJlZl0sIElNR1tzcmNdLCBGT1JNW2FjdGlvbl0sIFNDUklQVFtzcmNdLCBbc3R5bGVdXCI7XG5cdGNvbnN0IGNzc1Byb3BlcnRpZXNXaXRoVXJscyA9IFtcblx0XHRcImJhY2tncm91bmRcIixcblx0XHRcImJhY2tncm91bmQtaW1hZ2VcIixcblx0XHRcImJvcmRlci1pbWFnZVwiLFxuXHRcdFwiYm9yZGVyLWltYWdlLXNvdXJjZVwiLFxuXHRcdFwiY29udGVudFwiLFxuXHRcdFwiY3Vyc29yXCIsXG5cdFx0XCJsaXN0LXN0eWxlLWltYWdlXCIsXG5cdFx0XCJtYXNrXCIsXG5cdFx0XCJtYXNrLWltYWdlXCIsXG5cdFx0XCJvZmZzZXQtcGF0aFwiLFxuXHRcdFwic3JjXCIsXG5cdF07XG5cdFxuXHQvKipcblx0ICogUmVhZHMgYW4gSFRNTCBwYWdlIGZyb20gdGhlIHNwZWNpZmllZCBVUkwsIGFuZCByZXR1cm5zIGFuXG5cdCAqIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSByZWxldmFudCBjb250ZW50LlxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBhZ2VGcm9tVXJsKHVybDogc3RyaW5nKVxuXHR7XG5cdFx0Y29uc3QgYmFzZVVybCA9IFVybC5mb2xkZXJPZih1cmwpO1xuXHRcdGNvbnN0IGRvYyA9IGF3YWl0IGdldERvY3VtZW50RnJvbVVybCh1cmwpO1xuXHRcdGlmICghZG9jKVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XG5cdFx0Y29uc3Qgc2VjdGlvbnMgPSBnZXRFbGVtZW50cyhcIkJPRFkgPiBTRUNUSU9OXCIsIGRvYyk7XG5cdFx0Y29uc3QgZmVlZHMgPSBnZXRGZWVkc0Zyb21Eb2N1bWVudChkb2MpO1xuXHRcdGNvbnN0IGZlZWRzVXJscyA9IGZlZWRzLm1hcChmID0+IGYuaHJlZik7XG5cdFx0Y29uc3QgaGVhZCA9IGdldEVsZW1lbnRzKFwiTElOSywgU1RZTEVcIiwgZG9jLmhlYWQpXG5cdFx0XHQuZmlsdGVyKGUgPT4gIWZlZWRzVXJscy5pbmNsdWRlcyhlLmdldEF0dHJpYnV0ZShcImhyZWZcIikgfHwgXCJcIikpO1xuXHRcdFxuXHRcdGZvciAoY29uc3QgZWxlbWVudCBvZiBbLi4uaGVhZCwgLi4uc2VjdGlvbnNdKVxuXHRcdFx0Y29udmVydEVtYmVkZGVkVXJsc1RvQWJzb2x1dGUoZWxlbWVudCwgYmFzZVVybCk7XG5cdFx0XG5cdFx0cmV0dXJuIHtcblx0XHRcdHVybCxcblx0XHRcdGRvY3VtZW50OiBkb2MsXG5cdFx0XHRoZWFkLFxuXHRcdFx0ZmVlZHMsXG5cdFx0XHRzZWN0aW9ucyxcblx0XHR9O1xuXHR9XG5cdFxuXHQvKipcblx0ICogU2NhbnMgYSBkb2N1bWVudCBmb3IgPGxpbms+IHRhZ3MgdGhhdCByZWZlciB0byB0aGUgZmVlZHMgZGVmaW5lZFxuXHQgKiB3aXRoaW4gdGhlIHNwZWNpZmllZCBkb2N1bWVudC5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBnZXRGZWVkc0Zyb21Eb2N1bWVudChkb2MgPSBkb2N1bWVudClcblx0e1xuXHRcdGNvbnN0IGZlZWRzOiBJRmVlZEluZm9bXSA9IFtdO1xuXHRcdGNvbnN0IGZlID0gZ2V0RWxlbWVudHMoXCJMSU5LW3JlbD1mZWVkXVwiLCBkb2MpO1xuXHRcdFxuXHRcdGZvciAoY29uc3QgZSBvZiBmZSlcblx0XHR7XG5cdFx0XHRjb25zdCBocmVmID0gZS5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpO1xuXHRcdFx0aWYgKCFocmVmKVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFxuXHRcdFx0Y29uc3QgdmlzaWJsZUF0dHIgPSBlLmdldEF0dHJpYnV0ZShcImRpc2FibGVkXCIpPy50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0Y29uc3QgdmlzaWJsZSA9IHR5cGVvZiB2aXNpYmxlQXR0ciA9PT0gXCJzdHJpbmdcIiAmJiB2aXNpYmxlQXR0ciAhPT0gXCJmYWxzZVwiO1xuXHRcdFx0Y29uc3Qgc3Vic2NyaWJhYmxlQXR0ciA9IGUuZ2V0QXR0cmlidXRlKFwidHlwZVwiKT8udG9Mb3dlckNhc2UoKTtcblx0XHRcdGNvbnN0IHN1YnNjcmliYWJsZSA9IHN1YnNjcmliYWJsZUF0dHIgPT09IFwidGV4dC9mZWVkXCI7XG5cdFx0XHRmZWVkcy5wdXNoKHsgdmlzaWJsZSwgc3Vic2NyaWJhYmxlLCBocmVmIH0pO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gZmVlZHM7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBTdG9yZXMgdGhlIGluZm9ybWF0aW9uIGFib3V0IGEgZmVlZCBkZWZpbmVkIGJ5IGEgPGxpbms+IHRhZyBpbiBhIHBhZ2UuXG5cdCAqL1xuXHRleHBvcnQgaW50ZXJmYWNlIElGZWVkSW5mb1xuXHR7XG5cdFx0cmVhZG9ubHkgc3Vic2NyaWJhYmxlOiBib29sZWFuO1xuXHRcdHJlYWRvbmx5IHZpc2libGU6IGJvb2xlYW47XG5cdFx0cmVhZG9ubHkgaHJlZjogc3RyaW5nO1xuXHR9XG5cdFxuXHQvKipcblx0ICogUmVhZHMgYSBET00gRG9jdW1lbnQgb2JqZWN0IHN0b3JlZCBhdCB0aGUgc3BlY2lmaWVkIFVSTCxcblx0ICogYW5kIHJldHVybnMgYSBzYW5pdGl6ZWQgdmVyc2lvbiBvZiBpdC5cblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREb2N1bWVudEZyb21VcmwodXJsOiBzdHJpbmcpXG5cdHtcblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBnZXRIdHRwQ29udGVudCh1cmwpO1xuXHRcdHJldHVybiByZXN1bHQgPyBzYW5pdGl6ZURvY3VtZW50KHVybCwgcmVzdWx0LnRleHQpIDogbnVsbDtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJlbW92ZXMgYWxsIHVuc2FmZSBIVE1MIGZyb20gdGhlIHNwZWNpZmllZCBIVE1MIGNvZGUsIGFuZCBwYXRjaGVzIGFsbFxuXHQgKiA8Zm9ybT4gZWxlbWVudHMgc28gdGhhdCBpdHMgc3VibWlzc2lvbiBvcGVyYXRpb24gcmVzdWx0cyBpbiB0aGUgcmVzcG9uc2Vcblx0ICogYmVpbmcgcGF0Y2hlZCB3aXRoaW4gdGhlIGRvY3VtZW50LCByYXRoZXIgdGhhbiBhIHJlZGlyZWN0IG9jY3VyaW5nLlxuXHQgKi9cblx0YXN5bmMgZnVuY3Rpb24gc2FuaXRpemVEb2N1bWVudCh1cmw6IHN0cmluZywgaHRtbDogc3RyaW5nKVxuXHR7XG5cdFx0Y29uc3QgZG9jVXJpID0gVXJsLmZvbGRlck9mKHVybCk7XG5cdFx0Y29uc3Qgc2FuaXRpemVyID0gbmV3IEZvcmVpZ25Eb2N1bWVudFNhbml0aXplcihodG1sLCBkb2NVcmkpO1xuXHRcdGNvbnN0IGRvYyA9IHNhbml0aXplci5yZWFkKCk7XG5cdFx0XG5cdFx0Zm9yIChjb25zdCBmb3JtIG9mIEFycmF5LmZyb20oZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiZm9ybVwiKSkpXG5cdFx0e1xuXHRcdFx0aWYgKHBhdGNoZWRGb3Jtcy5oYXMoZm9ybSkpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHRjb25zdCBhY3Rpb24gPSAoZm9ybS5hY3Rpb24gfHwgXCJcIikudHJpbSgpO1xuXHRcdFx0Y29uc3QgY29udGFpbmluZ1NlY3Rpb24gPSBnZXRDb250YWluaW5nU2VjdGlvbihmb3JtKTtcblx0XHRcdGlmICghY29udGFpbmluZ1NlY3Rpb24pXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHRjb25zdCB0YXJnZXQgPSBmb3JtLnRhcmdldC5yZXBsYWNlKC9cIi9nLCBgXFxcXFwiYCk7XG5cdFx0XHRjb25zdCB0YXJnZXRFbGVtZW50ID0gY29udGFpbmluZ1NlY3Rpb24ucXVlcnlTZWxlY3RvcihgW2lkPVwiJHt0YXJnZXR9XCJdYCkgfHwgZm9ybTtcblx0XHRcdFxuXHRcdFx0Zm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGFzeW5jIGV2ID0+XG5cdFx0XHR7XG5cdFx0XHRcdGV2LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoYWN0aW9uID09PSBcIlwiKVxuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XG5cdFx0XHRcdGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBMaWJmZWVkLmdldEh0dHBDb250ZW50KGFjdGlvbiwge1xuXHRcdFx0XHRcdG1ldGhvZDogZm9ybS5tZXRob2QsXG5cdFx0XHRcdFx0cXVpZXQ6IHRydWUsXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKGNvbnRlbnQgPT09IG51bGwpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGZuIG9mIHN1Ym1pdEZhaWx1cmVGbnMpXG5cdFx0XHRcdFx0XHRmbihmb3JtKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCBodG1sID0gY29udGVudC50ZXh0O1xuXHRcdFx0XHRcdGNvbnN0IGRvYyA9IGF3YWl0IHNhbml0aXplRG9jdW1lbnQodXJsLCBodG1sKTtcblx0XHRcdFx0XHRjb25zdCByZXBsYWNlbWVudHMgPSBBcnJheS5mcm9tKGRvYy5ib2R5LmNoaWxkcmVuKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAodGFyZ2V0RWxlbWVudC50YWdOYW1lID09PSBcIlNFQ1RJT05cIiAmJlxuXHRcdFx0XHRcdFx0dGFyZ2V0RWxlbWVudC5wYXJlbnRFbGVtZW50Py50YWdOYW1lID09PSBcIkJPRFlcIiAmJlxuXHRcdFx0XHRcdFx0cmVwbGFjZW1lbnRzLnNvbWUoZSA9PiBlLnRhZ05hbWUgIT09IFwiU0VDVElPTlwiKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR0YXJnZXRFbGVtZW50LnJlcGxhY2VDaGlsZHJlbiguLi5yZXBsYWNlbWVudHMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dGFyZ2V0RWxlbWVudC5yZXBsYWNlV2l0aCguLi5yZXBsYWNlbWVudHMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdHBhdGNoZWRGb3Jtcy5hZGQoZm9ybSk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBkb2M7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBHZXRzIHRoZSA8c2VjdGlvbj4gZWxlbWVudCBkZWZpbmVkIGF0IHRoZSByb290IGxldmVsXG5cdCAqIHRoYXQgY29udGFpbnMgdGhlIHNwZWNpZmllZCBIVE1MRWxlbWVudC5cblx0ICovXG5cdGZ1bmN0aW9uIGdldENvbnRhaW5pbmdTZWN0aW9uKGU6IEhUTUxFbGVtZW50KVxuXHR7XG5cdFx0bGV0IGN1cnJlbnQgPSBlO1xuXHRcdFxuXHRcdGZvciAoOzspXG5cdFx0e1xuXHRcdFx0Y29uc3QgY2xvc2VzdCA9IGN1cnJlbnQucGFyZW50RWxlbWVudD8uY2xvc2VzdChcInNlY3Rpb25cIik7XG5cdFx0XHRpZiAoIWNsb3Nlc3QpXG5cdFx0XHRcdHJldHVybiBjdXJyZW50ID09PSBlID8gbnVsbCA6IGU7XG5cdFx0XHRcblx0XHRcdGN1cnJlbnQgPSBjbG9zZXN0O1xuXHRcdH1cblx0fVxuXHRcblx0Y29uc3QgcGF0Y2hlZEZvcm1zID0gbmV3IFdlYWtTZXQ8SFRNTEZvcm1FbGVtZW50PigpO1xuXHRcblx0LyoqXG5cdCAqIFNwZWNpZmllcyBhIGZ1bmN0aW9uIHRvIGludm9rZSB3aGVuIHRoZSAgZm9ybSBzdWJtaXNzaW9uIGZhaWxzLlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZVN1Ym1pdEZhaWx1cmUoZm46IChmb3JtOiBIVE1MRm9ybUVsZW1lbnQpID0+IHZvaWQpXG5cdHtcblx0XHRzdWJtaXRGYWlsdXJlRm5zLnB1c2goZm4pO1xuXHR9XG5cdGNvbnN0IHN1Ym1pdEZhaWx1cmVGbnM6ICgoZm9ybTogSFRNTEZvcm1FbGVtZW50KSA9PiB2b2lkKVtdID0gW107XG5cdFxuXHQvLyMgRmVlZHNcblx0XG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgZnVsbHktcXVhbGlmaWVkIHZlcnNpb24gb2YgYSBmZWVkIFVSTCBkZWZpbmVkIHdpdGhpbiB0aGUgc3BlY2lmaWVkXG5cdCAqIE5vZGUuIElmIHRoZSB3aXRoaW4gYXJndW1lbnQgaXMgb21pdHRlZCwgdGhlIGN1cnJlbnQgZG9jdW1lbnQgaXMgdXNlZC5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBnZXRGZWVkVXJsKHdpdGhpbjogUGFyZW50Tm9kZSA9IGRvY3VtZW50KVxuXHR7XG5cdFx0Y29uc3QgbGluayA9IHdpdGhpbi5xdWVyeVNlbGVjdG9yKGBMSU5LW3JlbD1cImZlZWRcIl1baHJlZl1gKTtcblx0XHRjb25zdCBocmVmID0gbGluayBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ID8gbGluay5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpIDogXCJcIjtcblx0XHRyZXR1cm4gaHJlZiA/IFVybC5yZXNvbHZlKGhyZWYsIFVybC5nZXRDdXJyZW50KCkpIDogXCJcIjtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJlYWRzIHRoZSBVUkxzIGRlZmluZWQgaW4gdGhlIGZlZWQgZmlsZSBsb2NhdGVkIGF0IHRoZSBzcGVjaWZpZWRcblx0ICogVVJMLiBUaGUgZnVuY3Rpb24gYWNjZXB0cyBhIHN0YXJ0aW5nQnl0ZSBhcmd1bWVudCB0byBhbGxvdyBmb3Jcblx0ICogcGFydGlhbCBkb3dubG9hZHMgY29udGFpbmluZyBvbmx5IHRoZSBuZXcgY29udGVudCBpbiB0aGUgZmVlZC5cblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRGZWVkVXJscyhmZWVkVXJsOiBzdHJpbmcpXG5cdHtcblx0XHRjb25zdCB1cmxzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdGNvbnN0IGZldGNoUmVzdWx0ID0gYXdhaXQgZ2V0SHR0cENvbnRlbnQoZmVlZFVybCk7XG5cdFx0XG5cdFx0aWYgKCFmZXRjaFJlc3VsdClcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdFxuXHRcdGxldCBieXRlc1JlYWQgPSAtMTtcblx0XHRjb25zdCB0eXBlID0gKGZldGNoUmVzdWx0LmhlYWRlcnMuZ2V0KFwiQ29udGVudC1UeXBlXCIpIHx8IFwiXCIpLnNwbGl0KFwiO1wiKVswXTtcblx0XHRpZiAodHlwZSAhPT0gXCJ0ZXh0L3BsYWluXCIpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5lcnJvcihcblx0XHRcdFx0XCJGZWVkIGF0IFVSTDogXCIgKyBmZWVkVXJsICsgXCJ3YXMgcmV0dXJuZWQgd2l0aCBhbiBpbmNvcnJlY3QgXCIgK1xuXHRcdFx0XHRcIm1pbWUgdHlwZS4gRXhwZWN0ZWQgbWltZSB0eXBlIGlzIFxcXCJ0ZXh0L3BsYWluXFxcIiwgYnV0IHRoZSBtaW1lIHR5cGUgXFxcIlwiICsgXG5cdFx0XHRcdHR5cGUgKyBcIlxcXCIgd2FzIHJldHVybmVkLlwiKTtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR1cmxzLnB1c2goLi4uZmV0Y2hSZXN1bHQudGV4dFxuXHRcdFx0XHQuc3BsaXQoXCJcXG5cIilcblx0XHRcdFx0Lm1hcChzID0+IHMudHJpbSgpKVxuXHRcdFx0XHQuZmlsdGVyKHMgPT4gISFzKVxuXHRcdFx0XHQuZmlsdGVyKHMgPT4gIXMuc3RhcnRzV2l0aChcIiNcIikpXG5cdFx0XHRcdC5tYXAocyA9PiBVcmwucmVzb2x2ZShzLCBVcmwuZm9sZGVyT2YoZmVlZFVybCkpKSk7XG5cdFx0XHRcblx0XHRcdGJ5dGVzUmVhZCA9IGZldGNoUmVzdWx0LnRleHQubGVuZ3RoIHx8IDA7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiB1cmxzO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGludGVyZmFjZSBJRmVlZENvbnRlbnRzXG5cdHtcblx0XHRyZWFkb25seSB1cmxzOiBzdHJpbmdbXTtcblx0XHRyZWFkb25seSBieXRlc1JlYWQ6IG51bWJlcjtcblx0fVxuXHRcblx0LyoqXG5cdCAqIEZpbmRzIHRoZSBtZXRhIGRhdGEgYXNzb2NpYXRlZCB3aXRoIHRoZSBmZWVkIGF0IHRoZSBzcGVjaWZpZWQgVVJMLlxuXHQgKiBUaGUgYWxnb3JpdGhtIHVzZWQgaXMgYSB1cHNjYW4gb2YgdGhlIGZvbGRlciBzdHJ1Y3R1cmUgb2YgdGhlIHNwZWNpZmllZCBVUkwsXG5cdCAqIHN0YXJ0aW5nIGF0IGl0J3MgYmFzZSBkaXJlY3RvcnksIGFuZCBzY2FubmluZyB1cHdhcmRzIHVudGlsIHRoZSByb290XG5cdCAqIGRvbWFpbiBpcyByZWFjaGVkLlxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEZlZWRNZXRhRGF0YShmZWVkVXJsOiBzdHJpbmcpOiBQcm9taXNlPElGZWVkTWV0YURhdGE+XG5cdHtcblx0XHRsZXQgY3VycmVudFVybCA9IFVybC5mb2xkZXJPZihmZWVkVXJsKTtcblx0XHRcblx0XHRsZXQgYXV0aG9yID0gXCJcIjtcblx0XHRsZXQgZGVzY3JpcHRpb24gPSBcIlwiO1xuXHRcdGxldCBpY29uID0gXCJcIjtcblx0XHRcblx0XHRmb3IgKGxldCBzYWZldHkgPSAxMDAwOyBzYWZldHktLSA+IDA7KVxuXHRcdHtcblx0XHRcdGNvbnN0IGh0dHBDb250ZW50ID0gYXdhaXQgTGliZmVlZC5nZXRIdHRwQ29udGVudChjdXJyZW50VXJsLCB7IHF1aWV0OiB0cnVlIH0pO1xuXHRcdFx0aWYgKGh0dHBDb250ZW50KVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBodG1sQ29udGVudCA9IGh0dHBDb250ZW50LnRleHQ7XG5cdFx0XHRcdGNvbnN0IHJlYWRlciA9IG5ldyBGb3JlaWduRG9jdW1lbnRSZWFkZXIoaHRtbENvbnRlbnQpO1xuXHRcdFx0XHRcblx0XHRcdFx0cmVhZGVyLnRyYXBFbGVtZW50KGVsZW1lbnQgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChlbGVtZW50Lm5vZGVOYW1lID09PSBcIk1FVEFcIilcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zdCBuYW1lID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpPy50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRpZiAobmFtZSA9PT0gXCJkZXNjcmlwdGlvblwiKVxuXHRcdFx0XHRcdFx0XHRkZXNjcmlwdGlvbiA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiY29udGVudFwiKSB8fCBcIlwiO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRlbHNlIGlmIChuYW1lID09PSBcImF1dGhvclwiKVxuXHRcdFx0XHRcdFx0XHRhdXRob3IgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShcImNvbnRlbnRcIikgfHwgXCJcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoZWxlbWVudC5ub2RlTmFtZSA9PT0gXCJMSU5LXCIpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc3QgcmVsID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJyZWxcIik/LnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGlmIChyZWwgPT09IFwiaWNvblwiKVxuXHRcdFx0XHRcdFx0XHRpY29uID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpIHx8IFwiXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0XG5cdFx0XHRcdHJlYWRlci5yZWFkKCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoYXV0aG9yIHx8IGRlc2NyaXB0aW9uIHx8IGljb24pXG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XG5cdFx0XHRjb25zdCB1cmwgPSBuZXcgVVJMKFwiLi5cIiwgY3VycmVudFVybCk7XG5cdFx0XHRpZiAoY3VycmVudFVybCA9PT0gdXJsLnRvU3RyaW5nKCkpXG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0XG5cdFx0XHRjdXJyZW50VXJsID0gdXJsLnRvU3RyaW5nKCk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiB7IHVybDogZmVlZFVybCwgYXV0aG9yLCBkZXNjcmlwdGlvbiwgaWNvbiB9O1xuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGludGVyZmFjZSBJRmVlZE1ldGFEYXRhXG5cdHtcblx0XHRyZWFkb25seSB1cmw6IHN0cmluZztcblx0XHRyZWFkb25seSBhdXRob3I6IHN0cmluZztcblx0XHRyZWFkb25seSBkZXNjcmlwdGlvbjogc3RyaW5nO1xuXHRcdHJlYWRvbmx5IGljb246IHN0cmluZztcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJlYWRzIHRoZSBwb3N0ZXIgPHNlY3Rpb24+IHN0b3JlZCBpbiB0aGUgcGFnZSBhdCB0aGUgc3BlY2lmaWVkIFVSTC5cblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQb3N0ZXJGcm9tVXJsKHBhZ2VVcmw6IHN0cmluZyk6IFByb21pc2U8SFRNTEVsZW1lbnQgfCBudWxsPlxuXHR7XG5cdFx0Y29uc3QgcGFnZSA9IGF3YWl0IGdldFBhZ2VGcm9tVXJsKHBhZ2VVcmwpO1xuXHRcdHJldHVybiBwYWdlPy5zZWN0aW9ucy5sZW5ndGggP1xuXHRcdFx0TGliZmVlZC5nZXRTYW5kYm94ZWRFbGVtZW50KFsuLi5wYWdlLmhlYWQsIHBhZ2Uuc2VjdGlvbnNbMF1dLCBwYWdlLnVybCkgOlxuXHRcdFx0bnVsbDtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJlYWRzIHBvc3RlcnMgZnJvbSBhIGZlZWQgdGV4dCBmaWxlIGxvY2F0ZWQgYXQgdGhlIHNwZWNpZmllZCBVUkwuXG5cdCAqIFxuXHQgKiBAcmV0dXJucyBBbiBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gdGhhdCBpdGVyYXRlcyB0aHJvdWdoXG5cdCAqIGV2ZXJ5IHBhZ2Ugc3BlY2lmaWVkIGluIHRoZSBzcGVjaWZpZWQgZmVlZCBVUkwsIGFuZCByZXR1cm5zXG5cdCAqIHRoZSBwb3N0ZXIgYXNzb2NpYXRlZCB3aXRoIGVhY2ggcGFnZS5cblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiAqIGdldFBvc3RlcnNGcm9tRmVlZChmZWVkVXJsOiBzdHJpbmcpXG5cdHtcblx0XHRjb25zdCB1cmxzID0gYXdhaXQgTGliZmVlZC5nZXRGZWVkVXJscyhmZWVkVXJsKTtcblx0XHRpZiAoIXVybHMpXG5cdFx0XHRyZXR1cm47XG5cdFx0XG5cdFx0Zm9yIChjb25zdCB1cmwgb2YgdXJscylcblx0XHR7XG5cdFx0XHRjb25zdCBwYWdlID0gYXdhaXQgTGliZmVlZC5nZXRQYWdlRnJvbVVybCh1cmwpO1xuXHRcdFx0Y29uc3QgcG9zdGVyID0gcGFnZT8uc2VjdGlvbnMubGVuZ3RoID9cblx0XHRcdFx0TGliZmVlZC5nZXRTYW5kYm94ZWRFbGVtZW50KFsuLi5wYWdlLmhlYWQsIHBhZ2Uuc2VjdGlvbnNbMF1dLCBwYWdlLnVybCkgOlxuXHRcdFx0XHRudWxsO1xuXHRcdFx0XG5cdFx0XHRpZiAocG9zdGVyKVxuXHRcdFx0XHR5aWVsZCB7IHBvc3RlciwgdXJsIH07XG5cdFx0fVxuXHR9XG5cdFxuXHQvKipcblx0ICogUmV0dXJucyBhbiBPbW5pdmlldyB0aGF0IGlzIGF1dG9tYXRpY2FsbHkgcG9wdWxhdGVkIHdpdGggdGhlXG5cdCAqIHBvc3RlcnMgZnJvbSB0aGUgc3BlY2lmaWVkIFVSTHMuIFRoZSBPbW5pdmlldyBpcyB3cmFwcGVkIGluc2lkZVxuXHQgKiBhbmQgZWxlbWVudCB0aGF0IG1ha2VzIHRoZSBPbW5pdmlldyBzdWl0YWJsZSBmb3IgZW1iZWRkaW5nIG9uXG5cdCAqIGEgcHVibGljIHdlYnNpdGUuXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gZ2V0RW1iZWRkZWRPbW5pdmlld0Zyb21GZWVkKFxuXHRcdHVybHM6IHN0cmluZ1tdLFxuXHRcdG9tbml2aWV3T3B0aW9uczogUGFydGlhbDxJT21uaXZpZXdPcHRpb25zPiA9IHt9KVxuXHR7XG5cdFx0aWYgKHR5cGVvZiBPbW5pdmlldyA9PT0gXCJ1bmRlZmluZWRcIilcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk9tbml2aWV3IGxpYnJhcnkgbm90IGZvdW5kLlwiKTtcblx0XHRcblx0XHRjb25zdCByYXcgPSBuZXcgUmF3KCk7XG5cdFx0Y29uc3Qgb21uaXZpZXcgPSBnZXRPbW5pdmlld0Zyb21GZWVkKHVybHMsIG9tbml2aWV3T3B0aW9ucykgYXMgT21uaXZpZXcuQ2xhc3M7XG5cdFx0XG5cdFx0Y29uc3Qgb3V0ID0gcmF3LmRpdihcblx0XHRcdFwib21uaXZpZXctY29udGFpbmVyXCIsXG5cdFx0XHR7XG5cdFx0XHRcdHBvc2l0aW9uOiBcInJlbGF0aXZlXCIsXG5cdFx0XHRcdHNjcm9sbFNuYXBBbGlnbjogXCJzdGFydFwiLFxuXHRcdFx0XHRzY3JvbGxTbmFwU3RvcDogXCJhbHdheXNcIixcblx0XHRcdFx0bWluSGVpZ2h0OiBcIjIwMHZoXCIsXG5cdFx0XHR9LFxuXHRcdFx0Ly8gVGhpcyBvdmVycmlkZXMgdGhlIFwicG9zaXRpb246IGZpeGVkXCIgc2V0dGluZyB3aGljaCBpcyB0aGVcblx0XHRcdC8vIGRlZmF1bHQgZm9yIGFuIG9tbml2aWV3LiBUaGUgb21uaXZpZXcncyBkZWZhdWx0IGZpeGVkXG5cdFx0XHQvLyBzZXR0aW5nIGRvZXMgc2VlbSBhIGJpdCBicm9rZW4uIEZ1cnRoZXIgaW52ZXN0aWdhdGlvblxuXHRcdFx0Ly8gaXMgbmVlZGVkIHRvIGRldGVybWluZSBpZiB0aGlzIGlzIGFwcHJvcHJpYXRlLlxuXHRcdFx0cmF3LmdldChvbW5pdmlldykoeyBwb3NpdGlvbjogXCJyZWxhdGl2ZVwiIH0pLFxuXHRcdFx0Ly8gUGxhY2VzIGFuIGV4dHJhIGRpdiBhdCB0aGUgYm90dG9tIG9mIHRoZSBwb3N0ZXJzIGxpc3Rcblx0XHRcdC8vIHNvIHRoYXQgc2Nyb2xsLXNuYXBwaW5nIHdvcmtzIGJldHRlci5cblx0XHRcdHJhdy5kaXYoXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuXHRcdFx0XHRcdGxlZnQ6IDAsXG5cdFx0XHRcdFx0cmlnaHQ6IDAsXG5cdFx0XHRcdFx0Ym90dG9tOiAwLFxuXHRcdFx0XHRcdHNjcm9sbFNuYXBBbGlnbjogXCJlbmRcIixcblx0XHRcdFx0XHRzY3JvbGxTbmFwU3RvcDogXCJhbHdheXNcIixcblx0XHRcdFx0fVxuXHRcdFx0KSxcblx0XHQpO1xuXHRcdFxuXHRcdGNvbnN0IGhlYWQgPSBvbW5pdmlldy5oZWFkO1xuXHRcdGxldCBsYXN0WSA9IC0xO1xuXHRcdGxldCBsYXN0RGlyZWN0aW9uID0gMDtcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCAoKSA9PiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+XG5cdFx0e1xuXHRcdFx0aWYgKG9tbml2aWV3Lm1vZGUgIT09IE9tbml2aWV3Lk9tbml2aWV3TW9kZS5wb3N0ZXJzKVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcblx0XHRcdGNvbnN0IHkgPSB3aW5kb3cuc2Nyb2xsWTtcblx0XHRcdGlmICh5ID09PSBsYXN0WSlcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XG5cdFx0XHRjb25zdCBkaXJlY3Rpb24gPSB5ID4gbGFzdFkgPyAxIDogLTE7XG5cdFx0XHRsZXQgb21uaXZpZXdWaXNpYmxlID0gaGVhZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgPD0gMDtcblx0XHRcdFxuXHRcdFx0aWYgKG9tbml2aWV3VmlzaWJsZSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKGRpcmVjdGlvbiA9PT0gMSlcblx0XHRcdFx0XHRvbW5pdmlldy5zY3JvbGxpbmdBbmNlc3Rvci5zdHlsZS5zY3JvbGxTbmFwVHlwZSA9IFwibm9uZVwiO1xuXHRcdFx0XHRcblx0XHRcdFx0ZWxzZSBpZiAoZGlyZWN0aW9uID09PSAtMSAmJiBsYXN0RGlyZWN0aW9uID09PSAxKVxuXHRcdFx0XHRcdG9tbml2aWV3LnNjcm9sbGluZ0FuY2VzdG9yLnN0eWxlLnJlbW92ZVByb3BlcnR5KFwic2Nyb2xsLXNuYXAtdHlwZVwiKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0bGFzdERpcmVjdGlvbiA9IGRpcmVjdGlvbjtcblx0XHRcdGxhc3RZID0geTtcblx0XHRcdFxuXHRcdFx0Ly8gRXhwYW5kIHRoZSBzaXplIG9mIHRoZSBvbW5pdmlldyBjb250YWluZXIsIGluIG9yZGVyIHRvIHB1c2ggdGhlXG5cdFx0XHQvLyBmb290ZXIgc25hcHBlciBkaXYgZG93bndhcmQgc28gdGhhdCBpdCBhbGlnbnMgd2l0aCB0aGUgYm90dG9tXG5cdFx0XHQvLyBvZiB0aGUgb21uaXZpZXcgcG9zdGVycy5cblx0XHRcdGNvbnN0IHJvd3MgPSBNYXRoLmNlaWwob21uaXZpZXcucG9zdGVyQ291bnQgLyBvbW5pdmlldy5zaXplKTtcblx0XHRcdGNvbnN0IHZoID0gcm93cyAqICgxMDAgLyBvbW5pdmlldy5zaXplKTtcblx0XHRcdG91dC5zdHlsZS5taW5IZWlnaHQgPSB2aCArIFwidmhcIjtcblx0XHR9KSk7XG5cdFx0XG5cdFx0cmV0dXJuIG91dDtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJlbmRlcnMgYSBwbGFjZWhvbGRlciBwb3N0ZXIgZm9yIHdoZW4gdGhlIGl0ZW0gY291bGRuJ3QgYmUgbG9hZGVkLlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGdldEVycm9yUG9zdGVyKClcblx0e1xuXHRcdGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cdFx0Y29uc3QgcyA9IGRpdi5zdHlsZTtcblx0XHRzLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuXHRcdHMudG9wID0gXCIwXCI7XG5cdFx0cy5yaWdodCA9IFwiMFwiO1xuXHRcdHMuYm90dG9tID0gXCIwXCI7XG5cdFx0cy5sZWZ0ID0gXCIwXCI7XG5cdFx0cy53aWR0aCA9IFwiZml0LWNvbnRlbnRcIjtcblx0XHRzLmhlaWdodCA9IFwiZml0LWNvbnRlbnRcIjtcblx0XHRzLm1hcmdpbiA9IFwiYXV0b1wiO1xuXHRcdHMuZm9udFNpemUgPSBcIjIwdndcIjtcblx0XHRzLmZvbnRXZWlnaHQgPSBcIjkwMFwiO1xuXHRcdGRpdi5hcHBlbmQobmV3IFRleHQoXCLinJVcIikpO1xuXHRcdHJldHVybiBkaXY7XG5cdH1cblx0XG5cdC8vIyBHZW5lcmljXG5cdFxuXHQvKipcblx0ICogTWFrZXMgYW4gSFRUUCByZXF1ZXN0IHRvIHRoZSBzcGVjaWZpZWQgVVJJIGFuZCByZXR1cm5zXG5cdCAqIHRoZSBoZWFkZXJzIGFuZCBhIHN0cmluZyBjb250YWluaW5nIHRoZSBib2R5LlxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEh0dHBDb250ZW50KFxuXHRcdHJlbGF0aXZlVXJpOiBzdHJpbmcsIFxuXHRcdG9wdGlvbnM6IElHZXRIdHRwQ29udGVudE9wdGlvbnMgPSB7fSlcblx0e1xuXHRcdHJlbGF0aXZlVXJpID0gVXJsLnJlc29sdmUocmVsYXRpdmVVcmksIFVybC5nZXRDdXJyZW50KCkpO1xuXHRcdFxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdGNvbnN0IGZldGNoUmVzdWx0ID0gYXdhaXQgd2luZG93LmZldGNoKHJlbGF0aXZlVXJpLCB7XG5cdFx0XHRcdG1ldGhvZDogb3B0aW9ucy5tZXRob2QgfHwgXCJHRVRcIixcblx0XHRcdFx0aGVhZGVyczogb3B0aW9ucy5oZWFkZXJzIHx8IHt9LFxuXHRcdFx0XHRtb2RlOiBcImNvcnNcIixcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHRpZiAoIWZldGNoUmVzdWx0Lm9rKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKFwiRmV0Y2ggZmFpbGVkOiBcIiArIHJlbGF0aXZlVXJpKTtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGxldCB0ZXh0ID0gXCJcIjtcblx0XHRcdFxuXHRcdFx0dHJ5XG5cdFx0XHR7XG5cdFx0XHRcdHRleHQgPSBhd2FpdCBmZXRjaFJlc3VsdC50ZXh0KCk7XG5cdFx0XHR9XG5cdFx0XHRjYXRjaCAoZSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKCFvcHRpb25zLnF1aWV0KVxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoXCJGZXRjaCBmYWlsZWQ6IFwiICsgcmVsYXRpdmVVcmkpO1xuXHRcdFx0XHRcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGhlYWRlcnM6IGZldGNoUmVzdWx0LmhlYWRlcnMsXG5cdFx0XHRcdHRleHQsXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cdFx0XHRpZiAoIW9wdGlvbnMucXVpZXQpXG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiRXJyb3Igd2l0aCByZXF1ZXN0OiBcIiArIHJlbGF0aXZlVXJpKTtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKiogKi9cblx0aW50ZXJmYWNlIElHZXRIdHRwQ29udGVudE9wdGlvbnNcblx0e1xuXHRcdG1ldGhvZD86IHN0cmluZztcblx0XHRoZWFkZXJzPzogSGVhZGVyc0luaXQ7XG5cdFx0cXVpZXQ/OiBib29sZWFuO1xuXHR9XG5cdFxuXHQvKipcblx0ICogUmV0dXJucyBhbiBhcnJheSBvZiBIVE1MRWxlbWVudCBvYmplY3RzIHRoYXQgbWF0Y2ggdGhlIHNwZWNpZmllZCBzZWxlY3Rvcixcblx0ICogb3B0aW9uYWxseSB3aXRoaW4gdGhlIHNwZWNpZmllZCBwYXJlbnQgbm9kZS5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50cyhzZWxlY3Rvcjogc3RyaW5nLCBjb250YWluZXI6IFBhcmVudE5vZGUgPSBkb2N1bWVudClcblx0e1xuXHRcdHJldHVybiBBcnJheS5mcm9tKGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSkgYXMgSFRNTEVsZW1lbnRbXTtcblx0fVxufVxuIl19