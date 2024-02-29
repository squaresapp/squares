"use strict";
var Webfeed;
(function (Webfeed) {
    /**
     * Main entry point for when the reals.js script is
     * embedded within a web page.
     */
    if (typeof document !== "undefined" && typeof window !== "undefined") {
        const maybeBootstrap = () => {
            const shouldBootstrap = !!document.querySelector("[data-webfeed-bootstrap]");
            if (shouldBootstrap)
                bootstrap();
        };
        if (document.readyState === "complete")
            maybeBootstrap();
        else
            window.addEventListener("DOMContentLoaded", maybeBootstrap);
    }
    /**
     * Converts the <section> elements found in the document's body
     * into the webfeed-scrollable format. This function is intended
     * to be called by webfeed pages that are displaying in the browser,
     * rather than in a webfeed reader.
     */
    function bootstrap(baseHref = window.location.href) {
        baseHref = Webfeed.Url.folderOf(baseHref) || "";
        if (!baseHref)
            throw new Error("Invalid base URL: " + baseHref);
        const body = document.body;
        const sections = Webfeed.Reorganizer.composeSections(baseHref, body);
        body.append(...sections);
        body.style.display = "contents";
        document.head.append(Webfeed.Util.createSheet(`HTML { height: 100%; }`), Webfeed.getSupportingCss());
    }
    Webfeed.bootstrap = bootstrap;
    /**
     * Performs an HTTP HEAD request on the specified feed index file
     * and returns a string that can be used to determine if the index has
     * has been modified since the last ping.
     *
     *
     * The function returns the first HTTP header it finds, traversing
     * in the order of ETag, Last-Modified, and finally Content-Length.
     * Web servers are expected to return at least one of these HTTP
     * header values in order to be webfeed-compliant.
     *
     * The function returns null if the server wasn't reachable, or an
     * empty string if the server didn't return one of the expected
     * headers.
     */
    async function ping(url) {
        const result = await Webfeed.Http.request(url, { method: "HEAD", quiet: true });
        if (!result)
            return null;
        return Webfeed.Util.hash([
            result.headers.get("etag") || "",
            result.headers.get("last-modified") || "",
            result.headers.get("content-length") || "",
        ].join());
    }
    Webfeed.ping = ping;
    /**
     * Reads the index.txt file located at the specified URL,
     * and returns a list of URLs written into the file.
     *
     * Returns null if the URL was invalid, or could not be reached.
     */
    async function downloadIndex(url) {
        const feedIndexFolderUrl = Webfeed.Url.folderOf(url);
        if (!feedIndexFolderUrl)
            return null;
        const fetchResult = await Webfeed.Http.request(url);
        if (!fetchResult)
            return null;
        const type = (fetchResult.headers.get("Content-Type") || "").split(";")[0];
        if (type !== "text/plain") {
            console.error("Feed at URL: " + url + "was returned with an incorrect " +
                "mime type. Expected mime type is \"text/plain\", but the mime type \"" +
                type + "\" was returned.");
            return null;
        }
        return fetchResult.body
            .split("\n")
            .map(s => s.trim())
            .filter(s => !!s && !s.startsWith("#"))
            .filter((s) => !!Webfeed.Url.tryParse(s, feedIndexFolderUrl))
            .map(s => Webfeed.Url.resolve(s, feedIndexFolderUrl));
    }
    Webfeed.downloadIndex = downloadIndex;
    /**
     * Reads the "details" associated with the specified feed index.
     * The behavior mirrors the webfeed specification: it looks in the
     * same folder as the index.txt file for a default document, which
     * is expected to be an HTML file. It parses the <head> section of
     * this HTML file to extract out the <meta> and <link> tags of
     * interest.
     */
    async function downloadDetails(indexUrl) {
        const feedIndexFolderUrl = Webfeed.Url.folderOf(indexUrl);
        if (!feedIndexFolderUrl)
            return null;
        const result = await Webfeed.Http.request(feedIndexFolderUrl);
        if (!result)
            return null;
        let date = result.headers.get("Last-Modified") || "";
        let author = "";
        let description = "";
        let icon = "";
        const { body } = result;
        const reader = new Webfeed.ForeignDocumentReader(body);
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
        return { date, author, description, icon };
    }
    Webfeed.downloadDetails = downloadDetails;
    /**
     * Reads the first <section> (referred to as the "poster" section)
     * from the specified URL. The URL is expected to be a
     * webfeed-compatible page.
     */
    async function downloadPoster(pageUrl) {
        const sections = await downloadSections(pageUrl, 0, 1);
        return sections?.length ? sections[0] : null;
    }
    Webfeed.downloadPoster = downloadPoster;
    /**
     * Downloads the top-level <section> elements found in the specified
     * webfeed-compatible page.
     *
     * Returns null if the URL could not be loaded, or if the pageUrl
     * argument does not form a valid fully-qualified URL.
     */
    async function downloadSections(pageUrl, rangeStart, rangeEnd) {
        const result = await Webfeed.Http.request(pageUrl);
        if (!result)
            return null;
        const baseHref = Webfeed.Url.folderOf(pageUrl);
        if (!baseHref)
            return null;
        const sanitizer = new Webfeed.ForeignDocumentSanitizer(result.body, pageUrl);
        const doc = sanitizer.read();
        return Webfeed.Reorganizer.composeSections(baseHref, doc, rangeStart, rangeEnd);
    }
    Webfeed.downloadSections = downloadSections;
    /**
     * Returns the URL of the containing folder of the specified URL.
     * The provided URL must be valid, or an exception will be thrown.
     */
    function getFolderOf(url) {
        return Webfeed.Url.folderOf(url);
    }
    Webfeed.getFolderOf = getFolderOf;
    /**
     * Returns a <style> tag that has the minimum required CSS to
     * render the carousel to the screen.
     */
    function getSupportingCss(frameSelector = "HTML") {
        return Webfeed.Util.createSheet(`
			${frameSelector} {
				scroll-snap-type: y mandatory;
			}
			.${Webfeed.sceneClassName} {
				position: relative;
				overflow: hidden;
				height: 100%;
				padding-top: 0.02px;
				padding-bottom: 0.02px;
				scroll-snap-align: start;
				scroll-snap-stop: always;
			}
		`);
    }
    Webfeed.getSupportingCss = getSupportingCss;
    /**
     * Renders a placeholder poster for when the page couldn't be loaded.
     */
    async function getErrorPoster() {
        const e = document.createElement("div");
        const s = e.style;
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
        e.append(new Text("✕"));
        return e;
    }
    Webfeed.getErrorPoster = getErrorPoster;
    /**
     * The name of the class added to the constructed <div>
     * elements that create the scenes.
     */
    Webfeed.sceneClassName = "--scene";
    typeof module === "object" && Object.assign(module.exports, { Webfeed });
})(Webfeed || (Webfeed = {}));
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
     * @internal
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
                    const div = document.createElement("div");
                    for (const attr of Array.from(div.attributes))
                        div.setAttributeNode(attr);
                    div.append(...Array.from(div.children));
                    return div;
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
/**
 * @internal
 */
var Webfeed;
/**
 * @internal
 */
(function (Webfeed) {
    var Http;
    (function (Http) {
        /**
         * Makes an HTTP request to the specified URI and returns
         * the headers and a string containing the body.
         */
        async function request(relativeUri, options = {}) {
            relativeUri = Webfeed.Url.resolve(relativeUri, Webfeed.Url.getCurrent());
            try {
                const ac = new AbortController();
                const id = setTimeout(() => ac.abort(), Http.requestTimeout);
                const fetchResult = await window.fetch(relativeUri, {
                    method: options.method || "GET",
                    headers: options.headers || {},
                    mode: "cors",
                    signal: ac.signal,
                });
                clearTimeout(id);
                if (!fetchResult.ok) {
                    console.error("Fetch failed: " + relativeUri);
                    return null;
                }
                let body = "";
                try {
                    body = await fetchResult.text();
                }
                catch (e) {
                    if (!options.quiet)
                        console.error("Fetch failed: " + relativeUri);
                    return null;
                }
                return {
                    headers: fetchResult.headers,
                    body,
                };
            }
            catch (e) {
                if (!options.quiet)
                    console.log("Error with request: " + relativeUri);
                return null;
            }
        }
        Http.request = request;
        /** The number of milliseconds to wait before cancelling an HTTP request. */
        Http.requestTimeout = 500;
    })(Http = Webfeed.Http || (Webfeed.Http = {}));
})(Webfeed || (Webfeed = {}));
/**
 * @internal
 * A namespace of functions that deal with the reorganization
 * of documents into well-controlled <section> elements.
 */
var Webfeed;
/**
 * @internal
 * A namespace of functions that deal with the reorganization
 * of documents into well-controlled <section> elements.
 */
(function (Webfeed) {
    var Reorganizer;
    (function (Reorganizer) {
        /**
         * Extracts and reorganizes  a range of top-level <section> elements
         * present in the specified document.
         */
        function composeSections(baseHref, parent, rangeStart, rangeEnd) {
            const metaElements = queryElements("LINK, STYLE, META, BASE", parent);
            metaElements.map(e => e.remove());
            // If the parent is an <html> element, then we change the parent to the
            // <body> tag within the <html> element, but first make sure the document
            // actually has a <body> tag. It's possible that the document may not have
            // a <body> tag if the document is being constructed inside some simulated
            // DOM implementation (like LinkeDOM / HappyDOM).
            if (parent instanceof HTMLHtmlElement) {
                const maybeBody = Array.from(parent.children)
                    .find((e) => e instanceof HTMLBodyElement);
                if (maybeBody)
                    parent = maybeBody;
            }
            if (parent instanceof Document)
                parent = parent.body;
            const sections = Array.from(parent.children)
                .filter((e) => e instanceof HTMLElement)
                .filter(e => e.tagName === "SECTION");
            const sectionsSlice = sections.slice(rangeStart, rangeEnd);
            convertEmbeddedUrlsToAbsolute(parent, baseHref);
            const shadowRoots = [];
            for (let i = -1; ++i < sectionsSlice.length;) {
                const section = sectionsSlice[i];
                const sectionIndex = sections.findIndex(e => e === section);
                if (section === sections[0]) {
                    // Special sanitizations is required for the poster section
                }
                const shadowRoot = document.createElement("div");
                shadowRoot.className = Webfeed.sceneClassName;
                const shadow = shadowRoot.attachShadow({ mode: "open" });
                const metaClones = metaElements.map(e => e.cloneNode(true));
                shadow.append(Webfeed.Util.createSheet("SECTION { height: 100%; }"), ...metaClones);
                const fakeBody = document.createElement("body");
                fakeBody.style.setProperty("display", "contents", "important");
                shadow.append(fakeBody);
                // Cut off the wheel event, and the touchmove event which has a
                // similar effect as getting rid of overflow: auto or overflow: scroll
                // on desktops and on touch devices. This is a fairly blunt tool. It
                // may need to get more creative in the future for allowing certain
                // cases. But for now it should suffice.
                fakeBody.addEventListener("wheel", ev => ev.preventDefault(), { capture: true });
                fakeBody.addEventListener("touchmove", ev => ev.preventDefault(), { capture: true });
                for (let i = -1; ++i < sections.length;) {
                    if (i === sectionIndex) {
                        fakeBody.append(section);
                    }
                    else {
                        const shim = document.createElement("div");
                        shim.style.setProperty("display", "none", "important");
                        fakeBody.append(shim);
                    }
                }
                shadowRoots.push(shadowRoot);
            }
            return shadowRoots;
        }
        Reorganizer.composeSections = composeSections;
        /**
         *
         */
        function convertEmbeddedUrlsToAbsolute(parent, baseUrl) {
            const elements = queryElements(selectorForUrls, parent);
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
         * Returns an array of HTMLElement objects that match the specified selector,
         * optionally within the specified parent node.
         */
        function queryElements(selector, container = document) {
            return Array.from(container.querySelectorAll(selector));
        }
    })(Reorganizer = Webfeed.Reorganizer || (Webfeed.Reorganizer = {}));
})(Webfeed || (Webfeed = {}));
var Webfeed;
(function (Webfeed) {
    /**
     * @internal
     * A namespace of functions that perform URL manipulation.
     */
    let Url;
    (function (Url) {
        /**
         * Parses the specified URL string and returns a URL object,
         * or null if the URL fails to parse.
         */
        function tryParse(url, base) {
            try {
                return new URL(url, base);
            }
            catch (e) { }
            return null;
        }
        Url.tryParse = tryParse;
        /**
         * Returns the URL of the containing folder of the specified URL.
         * The provided URL must be valid, or an exception will be thrown.
         */
        function folderOf(url) {
            const lo = tryParse(url);
            if (!lo)
                return null;
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
/**
 * @internal
 */
var Webfeed;
/**
 * @internal
 */
(function (Webfeed) {
    var Util;
    (function (Util) {
        /** */
        function createSheet(cssText) {
            const parser = new DOMParser();
            const html = `<style>${cssText}</style>`;
            const doc = parser.parseFromString(html, "text/html");
            return doc.querySelector("style");
        }
        Util.createSheet = createSheet;
        /** */
        function hash(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = (hash << 5) - hash + char;
                hash &= hash;
            }
            return new Uint32Array([hash])[0].toString(36);
        }
        Util.hash = hash;
    })(Util = Webfeed.Util || (Webfeed.Util = {}));
})(Webfeed || (Webfeed = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViZmVlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2NvcmUvQXBpLnRzIiwiLi4vY29yZS9Gb3JlaWduRG9jdW1lbnRSZWFkZXIudHMiLCIuLi9jb3JlL0ZvcmVpZ25Eb2N1bWVudFNhbml0aXplci50cyIsIi4uL2NvcmUvSHR0cC50cyIsIi4uL2NvcmUvUmVvcmdhbml6ZXIudHMiLCIuLi9jb3JlL1VybC50cyIsIi4uL2NvcmUvVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBVSxPQUFPLENBK1BoQjtBQS9QRCxXQUFVLE9BQU87SUFFaEI7OztPQUdHO0lBQ0gsSUFBSSxPQUFPLFFBQVEsS0FBSyxXQUFXLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUNwRTtRQUNDLE1BQU0sY0FBYyxHQUFHLEdBQUcsRUFBRTtZQUUzQixNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQzdFLElBQUksZUFBZTtnQkFDbEIsU0FBUyxFQUFFLENBQUM7UUFDZCxDQUFDLENBQUE7UUFFRCxJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssVUFBVTtZQUNyQyxjQUFjLEVBQUUsQ0FBQTs7WUFFaEIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0tBQzdEO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFnQixTQUFTLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSTtRQUV4RCxRQUFRLEdBQUcsUUFBQSxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN4QyxJQUFJLENBQUMsUUFBUTtZQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFFbEQsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztRQUMzQixNQUFNLFFBQVEs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QVcsQ0FBQyxDQUFDO1lBQ3RELE9BQU8sR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUUsQ0FBQztRQUNwQyxDQUFDO1FBTmUsZ0JBQVcsY0FNMUIsQ0FBQTtRQUVELE1BQU07UUFDTixTQUFnQixJQUFJLENBQUMsR0FBVztZQUUvQixJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7WUFDYixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFDbkM7Z0JBQ0MsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQ2pDLElBQUksSUFBSSxJQUFJLENBQUM7YUFDYjtZQUVELE9BQU8sSUFBSSxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBWGUsU0FBSSxPQVduQixDQUFBO0lBQ0YsQ0FBQyxFQXhCaUIsSUFBSSxHQUFKLFlBQUksS0FBSixZQUFJLFFBd0JyQjtBQUFELENBQUMsRUF4QlMsT0FBTyxLQUFQLE9BQU8sUUF3QmhCIiwic291cmNlc0NvbnRlbnQiOlsiXG5uYW1lc3BhY2UgV2ViZmVlZFxue1xuXHQvKipcblx0ICogTWFpbiBlbnRyeSBwb2ludCBmb3Igd2hlbiB0aGUgcmVhbHMuanMgc2NyaXB0IGlzIFxuXHQgKiBlbWJlZGRlZCB3aXRoaW4gYSB3ZWIgcGFnZS5cblx0ICovXG5cdGlmICh0eXBlb2YgZG9jdW1lbnQgIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIilcblx0e1xuXHRcdGNvbnN0IG1heWJlQm9vdHN0cmFwID0gKCkgPT5cblx0XHR7XG5cdFx0XHRjb25zdCBzaG91bGRCb290c3RyYXAgPSAhIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbZGF0YS13ZWJmZWVkLWJvb3RzdHJhcF1cIik7XG5cdFx0XHRpZiAoc2hvdWxkQm9vdHN0cmFwKVxuXHRcdFx0XHRib290c3RyYXAoKTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIilcblx0XHRcdG1heWJlQm9vdHN0cmFwKClcblx0XHRlbHNlXG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgbWF5YmVCb290c3RyYXApO1xuXHR9XG5cdFxuXHQvKipcblx0ICogQ29udmVydHMgdGhlIDxzZWN0aW9uPiBlbGVtZW50cyBmb3VuZCBpbiB0aGUgZG9jdW1lbnQncyBib2R5XG5cdCAqIGludG8gdGhlIHdlYmZlZWQtc2Nyb2xsYWJsZSBmb3JtYXQuIFRoaXMgZnVuY3Rpb24gaXMgaW50ZW5kZWRcblx0ICogdG8gYmUgY2FsbGVkIGJ5IHdlYmZlZWQgcGFnZXMgdGhhdCBhcmUgZGlzcGxheWluZyBpbiB0aGUgYnJvd3Nlcixcblx0ICogcmF0aGVyIHRoYW4gaW4gYSB3ZWJmZWVkIHJlYWRlci5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBib290c3RyYXAoYmFzZUhyZWYgPSB3aW5kb3cubG9jYXRpb24uaHJlZilcblx0e1xuXHRcdGJhc2VIcmVmID0gVXJsLmZvbGRlck9mKGJhc2VIcmVmKSB8fCBcIlwiO1xuXHRcdGlmICghYmFzZUhyZWYpXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGJhc2UgVVJMOiBcIiArIGJhc2VIcmVmKTtcblx0XHRcblx0XHRjb25zdCBib2R5ID0gZG9jdW1lbnQuYm9keTtcblx0XHRjb25zdCBzZWN0aW9ucyA9IFJlb3JnYW5pemVyLmNvbXBvc2VTZWN0aW9ucyhiYXNlSHJlZiwgYm9keSk7XG5cdFx0Ym9keS5hcHBlbmQoLi4uc2VjdGlvbnMpO1xuXHRcdGJvZHkuc3R5bGUuZGlzcGxheSA9IFwiY29udGVudHNcIjtcblx0XHRcblx0XHRkb2N1bWVudC5oZWFkLmFwcGVuZChcblx0XHRcdFV0aWwuY3JlYXRlU2hlZXQoYEhUTUwgeyBoZWlnaHQ6IDEwMCU7IH1gKSxcblx0XHRcdFdlYmZlZWQuZ2V0U3VwcG9ydGluZ0NzcygpXG5cdFx0KTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFBlcmZvcm1zIGFuIEhUVFAgSEVBRCByZXF1ZXN0IG9uIHRoZSBzcGVjaWZpZWQgZmVlZCBpbmRleCBmaWxlXG5cdCAqIGFuZCByZXR1cm5zIGEgc3RyaW5nIHRoYXQgY2FuIGJlIHVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZSBpbmRleCBoYXNcblx0ICogaGFzIGJlZW4gbW9kaWZpZWQgc2luY2UgdGhlIGxhc3QgcGluZy5cblx0ICogXG5cdCAqIFxuXHQgKiBUaGUgZnVuY3Rpb24gcmV0dXJucyB0aGUgZmlyc3QgSFRUUCBoZWFkZXIgaXQgZmluZHMsIHRyYXZlcnNpbmdcblx0ICogaW4gdGhlIG9yZGVyIG9mIEVUYWcsIExhc3QtTW9kaWZpZWQsIGFuZCBmaW5hbGx5IENvbnRlbnQtTGVuZ3RoLlxuXHQgKiBXZWIgc2VydmVycyBhcmUgZXhwZWN0ZWQgdG8gcmV0dXJuIGF0IGxlYXN0IG9uZSBvZiB0aGVzZSBIVFRQXG5cdCAqIGhlYWRlciB2YWx1ZXMgaW4gb3JkZXIgdG8gYmUgd2ViZmVlZC1jb21wbGlhbnQuXG5cdCAqIFxuXHQgKiBUaGUgZnVuY3Rpb24gcmV0dXJucyBudWxsIGlmIHRoZSBzZXJ2ZXIgd2Fzbid0IHJlYWNoYWJsZSwgb3IgYW5cblx0ICogZW1wdHkgc3RyaW5nIGlmIHRoZSBzZXJ2ZXIgZGlkbid0IHJldHVybiBvbmUgb2YgdGhlIGV4cGVjdGVkIFxuXHQgKiBoZWFkZXJzLlxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBpbmcodXJsOiBzdHJpbmcpXG5cdHtcblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBIdHRwLnJlcXVlc3QodXJsLCB7IG1ldGhvZDogXCJIRUFEXCIsIHF1aWV0OiB0cnVlIH0pO1xuXHRcdGlmICghcmVzdWx0KVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XG5cdFx0cmV0dXJuIFV0aWwuaGFzaChbXG5cdFx0XHRyZXN1bHQuaGVhZGVycy5nZXQoXCJldGFnXCIpIHx8IFwiXCIsXG5cdFx0XHRyZXN1bHQuaGVhZGVycy5nZXQoXCJsYXN0LW1vZGlmaWVkXCIpIHx8IFwiXCIsXG5cdFx0XHRyZXN1bHQuaGVhZGVycy5nZXQoXCJjb250ZW50LWxlbmd0aFwiKSB8fCBcIlwiLFxuXHRcdF0uam9pbigpKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJlYWRzIHRoZSBpbmRleC50eHQgZmlsZSBsb2NhdGVkIGF0IHRoZSBzcGVjaWZpZWQgVVJMLFxuXHQgKiBhbmQgcmV0dXJucyBhIGxpc3Qgb2YgVVJMcyB3cml0dGVuIGludG8gdGhlIGZpbGUuXG5cdCAqIFxuXHQgKiBSZXR1cm5zIG51bGwgaWYgdGhlIFVSTCB3YXMgaW52YWxpZCwgb3IgY291bGQgbm90IGJlIHJlYWNoZWQuXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93bmxvYWRJbmRleCh1cmw6IHN0cmluZylcblx0e1xuXHRcdGNvbnN0IGZlZWRJbmRleEZvbGRlclVybCA9IFVybC5mb2xkZXJPZih1cmwpO1xuXHRcdGlmICghZmVlZEluZGV4Rm9sZGVyVXJsKVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XG5cdFx0Y29uc3QgZmV0Y2hSZXN1bHQgPSBhd2FpdCBIdHRwLnJlcXVlc3QodXJsKTtcblx0XHRpZiAoIWZldGNoUmVzdWx0KVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XG5cdFx0Y29uc3QgdHlwZSA9IChmZXRjaFJlc3VsdC5oZWFkZXJzLmdldChcIkNvbnRlbnQtVHlwZVwiKSB8fCBcIlwiKS5zcGxpdChcIjtcIilbMF07XG5cdFx0aWYgKHR5cGUgIT09IFwidGV4dC9wbGFpblwiKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoXG5cdFx0XHRcdFwiRmVlZCBhdCBVUkw6IFwiICsgdXJsICsgXCJ3YXMgcmV0dXJuZWQgd2l0aCBhbiBpbmNvcnJlY3QgXCIgK1xuXHRcdFx0XHRcIm1pbWUgdHlwZS4gRXhwZWN0ZWQgbWltZSB0eXBlIGlzIFxcXCJ0ZXh0L3BsYWluXFxcIiwgYnV0IHRoZSBtaW1lIHR5cGUgXFxcIlwiICsgXG5cdFx0XHRcdHR5cGUgKyBcIlxcXCIgd2FzIHJldHVybmVkLlwiKTtcblx0XHRcdFx0XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIGZldGNoUmVzdWx0LmJvZHlcblx0XHRcdC5zcGxpdChcIlxcblwiKVxuXHRcdFx0Lm1hcChzID0+IHMudHJpbSgpKVxuXHRcdFx0LmZpbHRlcihzID0+ICEhcyAmJiAhcy5zdGFydHNXaXRoKFwiI1wiKSlcblx0XHRcdC5maWx0ZXIoKHMpOiBzIGlzIHN0cmluZyA9PiAhIVVybC50cnlQYXJzZShzLCBmZWVkSW5kZXhGb2xkZXJVcmwpKVxuXHRcdFx0Lm1hcChzID0+IFVybC5yZXNvbHZlKHMsIGZlZWRJbmRleEZvbGRlclVybCkpO1xuXHR9XG5cdFxuXHQvKipcblx0ICogUmVhZHMgdGhlIFwiZGV0YWlsc1wiIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIGZlZWQgaW5kZXguXG5cdCAqIFRoZSBiZWhhdmlvciBtaXJyb3JzIHRoZSB3ZWJmZWVkIHNwZWNpZmljYXRpb246IGl0IGxvb2tzIGluIHRoZVxuXHQgKiBzYW1lIGZvbGRlciBhcyB0aGUgaW5kZXgudHh0IGZpbGUgZm9yIGEgZGVmYXVsdCBkb2N1bWVudCwgd2hpY2hcblx0ICogaXMgZXhwZWN0ZWQgdG8gYmUgYW4gSFRNTCBmaWxlLiBJdCBwYXJzZXMgdGhlIDxoZWFkPiBzZWN0aW9uIG9mXG5cdCAqIHRoaXMgSFRNTCBmaWxlIHRvIGV4dHJhY3Qgb3V0IHRoZSA8bWV0YT4gYW5kIDxsaW5rPiB0YWdzIG9mXG5cdCAqIGludGVyZXN0LlxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkRGV0YWlscyhpbmRleFVybDogc3RyaW5nKVxuXHR7XG5cdFx0Y29uc3QgZmVlZEluZGV4Rm9sZGVyVXJsID0gVXJsLmZvbGRlck9mKGluZGV4VXJsKTtcblx0XHRpZiAoIWZlZWRJbmRleEZvbGRlclVybClcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdFxuXHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IEh0dHAucmVxdWVzdChmZWVkSW5kZXhGb2xkZXJVcmwpO1xuXHRcdGlmICghcmVzdWx0KVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XG5cdFx0bGV0IGRhdGUgPSByZXN1bHQuaGVhZGVycy5nZXQoXCJMYXN0LU1vZGlmaWVkXCIpIHx8IFwiXCI7XG5cdFx0bGV0IGF1dGhvciA9IFwiXCI7XG5cdFx0bGV0IGRlc2NyaXB0aW9uID0gXCJcIjtcblx0XHRsZXQgaWNvbiA9IFwiXCI7XG5cdFx0XG5cdFx0Y29uc3QgeyBib2R5IH0gPSByZXN1bHQ7XG5cdFx0Y29uc3QgcmVhZGVyID0gbmV3IEZvcmVpZ25Eb2N1bWVudFJlYWRlcihib2R5KTtcblx0XHRcblx0XHRyZWFkZXIudHJhcEVsZW1lbnQoZWxlbWVudCA9PlxuXHRcdHtcblx0XHRcdGlmIChlbGVtZW50Lm5vZGVOYW1lID09PSBcIk1FVEFcIilcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgbmFtZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwibmFtZVwiKT8udG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChuYW1lID09PSBcImRlc2NyaXB0aW9uXCIpXG5cdFx0XHRcdFx0ZGVzY3JpcHRpb24gPSBlbGVtZW50LmdldEF0dHJpYnV0ZShcImNvbnRlbnRcIikgfHwgXCJcIjtcblx0XHRcdFx0XG5cdFx0XHRcdGVsc2UgaWYgKG5hbWUgPT09IFwiYXV0aG9yXCIpXG5cdFx0XHRcdFx0YXV0aG9yID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjb250ZW50XCIpIHx8IFwiXCI7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChlbGVtZW50Lm5vZGVOYW1lID09PSBcIkxJTktcIilcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgcmVsID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJyZWxcIik/LnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAocmVsID09PSBcImljb25cIilcblx0XHRcdFx0XHRpY29uID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpIHx8IFwiXCI7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0XG5cdFx0cmVhZGVyLnJlYWQoKTtcblx0XHRcblx0XHRyZXR1cm4geyBkYXRlLCBhdXRob3IsIGRlc2NyaXB0aW9uLCBpY29uIH07XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBSZWFkcyB0aGUgZmlyc3QgPHNlY3Rpb24+IChyZWZlcnJlZCB0byBhcyB0aGUgXCJwb3N0ZXJcIiBzZWN0aW9uKVxuXHQgKiBmcm9tIHRoZSBzcGVjaWZpZWQgVVJMLiBUaGUgVVJMIGlzIGV4cGVjdGVkIHRvIGJlIGFcblx0ICogd2ViZmVlZC1jb21wYXRpYmxlIHBhZ2UuXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93bmxvYWRQb3N0ZXIocGFnZVVybDogc3RyaW5nKVxuXHR7XG5cdFx0Y29uc3Qgc2VjdGlvbnMgPSBhd2FpdCBkb3dubG9hZFNlY3Rpb25zKHBhZ2VVcmwsIDAsIDEpO1xuXHRcdHJldHVybiBzZWN0aW9ucz8ubGVuZ3RoID8gc2VjdGlvbnNbMF0gOiBudWxsO1xuXHR9XG5cdFxuXHQvKipcblx0ICogRG93bmxvYWRzIHRoZSB0b3AtbGV2ZWwgPHNlY3Rpb24+IGVsZW1lbnRzIGZvdW5kIGluIHRoZSBzcGVjaWZpZWRcblx0ICogd2ViZmVlZC1jb21wYXRpYmxlIHBhZ2UuIFxuXHQgKiBcblx0ICogUmV0dXJucyBudWxsIGlmIHRoZSBVUkwgY291bGQgbm90IGJlIGxvYWRlZCwgb3IgaWYgdGhlIHBhZ2VVcmxcblx0ICogYXJndW1lbnQgZG9lcyBub3QgZm9ybSBhIHZhbGlkIGZ1bGx5LXF1YWxpZmllZCBVUkwuXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93bmxvYWRTZWN0aW9ucyhcblx0XHRwYWdlVXJsOiBzdHJpbmcsXG5cdFx0cmFuZ2VTdGFydD86IG51bWJlcixcblx0XHRyYW5nZUVuZD86IG51bWJlcilcblx0e1xuXHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IEh0dHAucmVxdWVzdChwYWdlVXJsKTtcblx0XHRpZiAoIXJlc3VsdClcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdFxuXHRcdGNvbnN0IGJhc2VIcmVmID0gVXJsLmZvbGRlck9mKHBhZ2VVcmwpO1xuXHRcdGlmICghYmFzZUhyZWYpXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcblx0XHRjb25zdCBzYW5pdGl6ZXIgPSBuZXcgRm9yZWlnbkRvY3VtZW50U2FuaXRpemVyKHJlc3VsdC5ib2R5LCBwYWdlVXJsKTtcblx0XHRjb25zdCBkb2MgPSBzYW5pdGl6ZXIucmVhZCgpO1xuXHRcdHJldHVybiBSZW9yZ2FuaXplci5jb21wb3NlU2VjdGlvbnMoYmFzZUhyZWYsIGRvYywgcmFuZ2VTdGFydCwgcmFuZ2VFbmQpO1xuXHR9XG5cdFxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgVVJMIG9mIHRoZSBjb250YWluaW5nIGZvbGRlciBvZiB0aGUgc3BlY2lmaWVkIFVSTC5cblx0ICogVGhlIHByb3ZpZGVkIFVSTCBtdXN0IGJlIHZhbGlkLCBvciBhbiBleGNlcHRpb24gd2lsbCBiZSB0aHJvd24uXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gZ2V0Rm9sZGVyT2YodXJsOiBzdHJpbmcpXG5cdHtcblx0XHRyZXR1cm4gVXJsLmZvbGRlck9mKHVybCk7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgPHN0eWxlPiB0YWcgdGhhdCBoYXMgdGhlIG1pbmltdW0gcmVxdWlyZWQgQ1NTIHRvXG5cdCAqIHJlbmRlciB0aGUgY2Fyb3VzZWwgdG8gdGhlIHNjcmVlbi5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBnZXRTdXBwb3J0aW5nQ3NzKGZyYW1lU2VsZWN0b3IgPSBcIkhUTUxcIilcblx0e1xuXHRcdHJldHVybiBVdGlsLmNyZWF0ZVNoZWV0KGBcblx0XHRcdCR7ZnJhbWVTZWxlY3Rvcn0ge1xuXHRcdFx0XHRzY3JvbGwtc25hcC10eXBlOiB5IG1hbmRhdG9yeTtcblx0XHRcdH1cblx0XHRcdC4ke3NjZW5lQ2xhc3NOYW1lfSB7XG5cdFx0XHRcdHBvc2l0aW9uOiByZWxhdGl2ZTtcblx0XHRcdFx0b3ZlcmZsb3c6IGhpZGRlbjtcblx0XHRcdFx0aGVpZ2h0OiAxMDAlO1xuXHRcdFx0XHRwYWRkaW5nLXRvcDogMC4wMnB4O1xuXHRcdFx0XHRwYWRkaW5nLWJvdHRvbTogMC4wMnB4O1xuXHRcdFx0XHRzY3JvbGwtc25hcC1hbGlnbjogc3RhcnQ7XG5cdFx0XHRcdHNjcm9sbC1zbmFwLXN0b3A6IGFsd2F5cztcblx0XHRcdH1cblx0XHRgKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJlbmRlcnMgYSBwbGFjZWhvbGRlciBwb3N0ZXIgZm9yIHdoZW4gdGhlIHBhZ2UgY291bGRuJ3QgYmUgbG9hZGVkLlxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEVycm9yUG9zdGVyKClcblx0e1xuXHRcdGNvbnN0IGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHRcdGNvbnN0IHMgPSBlLnN0eWxlO1xuXHRcdHMucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG5cdFx0cy50b3AgPSBcIjBcIjtcblx0XHRzLnJpZ2h0ID0gXCIwXCI7XG5cdFx0cy5ib3R0b20gPSBcIjBcIjtcblx0XHRzLmxlZnQgPSBcIjBcIjtcblx0XHRzLndpZHRoID0gXCJmaXQtY29udGVudFwiO1xuXHRcdHMuaGVpZ2h0ID0gXCJmaXQtY29udGVudFwiO1xuXHRcdHMubWFyZ2luID0gXCJhdXRvXCI7XG5cdFx0cy5mb250U2l6ZSA9IFwiMjB2d1wiO1xuXHRcdHMuZm9udFdlaWdodCA9IFwiOTAwXCI7XG5cdFx0ZS5hcHBlbmQobmV3IFRleHQoXCLinJVcIikpO1xuXHRcdHJldHVybiBlO1xuXHR9XG5cdFxuXHQvKipcblx0ICogVGhlIG5hbWUgb2YgdGhlIGNsYXNzIGFkZGVkIHRvIHRoZSBjb25zdHJ1Y3RlZCA8ZGl2PlxuXHQgKiBlbGVtZW50cyB0aGF0IGNyZWF0ZSB0aGUgc2NlbmVzLlxuXHQgKi9cblx0ZXhwb3J0IGNvbnN0IHNjZW5lQ2xhc3NOYW1lID0gXCItLXNjZW5lXCI7XG5cdFxuXHRkZWNsYXJlIGNvbnN0IG1vZHVsZTogYW55O1xuXHR0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIE9iamVjdC5hc3NpZ24obW9kdWxlLmV4cG9ydHMsIHsgV2ViZmVlZCB9KTtcbn1cbiIsIlxubmFtZXNwYWNlIFdlYmZlZWRcbntcblx0LyoqXG5cdCAqIEEgY2xhc3MgdGhhdCByZWFkcyBhIHJhdyBIVE1MIGRvY3VtZW50LCBhbmQgcHJvdmlkZXNcblx0ICogdGhlIGFiaWxpdHkgdG8gc2NhbiB0aGUgZG9jdW1lbnQgd2l0aCByZWdpc3RlcmVkIFwidHJhcHNcIixcblx0ICogd2hpY2ggYWxsb3cgdGhlIGRvY3VtZW50J3MgY29udGVudCB0byBiZSBtb2RpZmllZC5cblx0ICovXG5cdGV4cG9ydCBjbGFzcyBGb3JlaWduRG9jdW1lbnRSZWFkZXJcblx0e1xuXHRcdC8qKiAqL1xuXHRcdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgcmF3RG9jdW1lbnQ6IHN0cmluZykgeyB9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0dHJhcEVsZW1lbnQoZWxlbWVudEZuOiAoZWxlbWVudDogRWxlbWVudCkgPT4gRWxlbWVudCB8IHZvaWQpXG5cdFx0e1xuXHRcdFx0dGhpcy5lbGVtZW50Rm4gPSBlbGVtZW50Rm47XG5cdFx0fVxuXHRcdHByaXZhdGUgZWxlbWVudEZuID0gKGVsZW1lbnQ6IEVsZW1lbnQpOiBFbGVtZW50IHwgdm9pZCA9PiBlbGVtZW50O1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHRyYXBBdHRyaWJ1dGUoYXR0cmlidXRlRm46IChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIGVsZW1lbnQ6IEVsZW1lbnQpID0+IHN0cmluZyB8IHZvaWQpXG5cdFx0e1xuXHRcdFx0dGhpcy5hdHRyaWJ1dGVGbiA9IGF0dHJpYnV0ZUZuO1xuXHRcdH1cblx0XHRwcml2YXRlIGF0dHJpYnV0ZUZuID0gKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgZWxlbWVudDogRWxlbWVudCk6IHN0cmluZyB8IHZvaWQgPT4gdmFsdWU7XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0dHJhcFByb3BlcnR5KHByb3BlcnR5Rm46IChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpID0+IHN0cmluZylcblx0XHR7XG5cdFx0XHR0aGlzLnByb3BlcnR5Rm4gPSBwcm9wZXJ0eUZuO1xuXHRcdH1cblx0XHRwcml2YXRlIHByb3BlcnR5Rm4gPSAobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSA9PiBuYW1lO1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHJlYWQoKVxuXHRcdHtcblx0XHRcdGNvbnN0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcblx0XHRcdGNvbnN0IGRvYyA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcodGhpcy5yYXdEb2N1bWVudCwgXCJ0ZXh0L2h0bWxcIik7XG5cdFx0XHRjb25zdCB0cmFzaDogRWxlbWVudFtdID0gW107XG5cdFx0XHRcblx0XHRcdGZvciAoY29uc3Qgd2Fsa2VyID0gZG9jLmNyZWF0ZVRyZWVXYWxrZXIoZG9jKTs7KVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKCFub2RlKVxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKCEobm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQpKVxuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcblx0XHRcdFx0bGV0IGVsZW1lbnQgPSBub2RlIGFzIEVsZW1lbnQ7XG5cdFx0XHRcdFxuXHRcdFx0XHRjb25zdCByZXN1bHQgPSB0aGlzLmVsZW1lbnRGbihlbGVtZW50KTtcblx0XHRcdFx0aWYgKCFyZXN1bHQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0cmFzaC5wdXNoKGVsZW1lbnQpO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIE5vZGUgJiYgcmVzdWx0ICE9PSBlbGVtZW50KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZWxlbWVudC5yZXBsYWNlV2l0aChyZXN1bHQpO1xuXHRcdFx0XHRcdGVsZW1lbnQgPSByZXN1bHQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTFN0eWxlRWxlbWVudClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChlbGVtZW50LnNoZWV0KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHRoaXMucmVhZFNoZWV0KGVsZW1lbnQuc2hlZXQpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRjb25zdCBjc3NUZXh0OiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0XHRcdFx0Zm9yIChsZXQgaSA9IC0xLCBsZW4gPSBlbGVtZW50LnNoZWV0LmNzc1J1bGVzLmxlbmd0aDsgKytpIDwgbGVuOylcblx0XHRcdFx0XHRcdFx0Y3NzVGV4dC5wdXNoKGVsZW1lbnQuc2hlZXQuY3NzUnVsZXNbaV0uY3NzVGV4dCk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTFN0eWxlRWxlbWVudClcblx0XHRcdFx0XHRcdFx0ZWxlbWVudC50ZXh0Q29udGVudCA9IGNzc1RleHQuam9pbihcIlxcblwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdGZvciAoY29uc3QgYXR0ciBvZiBBcnJheS5mcm9tKGVsZW1lbnQuYXR0cmlidXRlcykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCBuZXdWYWx1ZSA9IHRoaXMuYXR0cmlidXRlRm4oYXR0ci5uYW1lLCBhdHRyLnZhbHVlLCBlbGVtZW50KTtcblx0XHRcdFx0XHRpZiAobmV3VmFsdWUgPT09IG51bGwgfHwgbmV3VmFsdWUgPT09IHVuZGVmaW5lZClcblx0XHRcdFx0XHRcdGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlTm9kZShhdHRyKTtcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyLm5hbWUsIG5ld1ZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0aWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBlbGVtZW50Lmhhc0F0dHJpYnV0ZShcInN0eWxlXCIpKVxuXHRcdFx0XHRcdHRoaXMucmVhZFN0eWxlKGVsZW1lbnQuc3R5bGUpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRmb3IgKGNvbnN0IGUgb2YgdHJhc2gpXG5cdFx0XHRcdGUucmVtb3ZlKCk7XG5cdFx0XHRcblx0XHRcdHJldHVybiBkb2M7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByaXZhdGUgcmVhZFNoZWV0KHNoZWV0OiBDU1NTdHlsZVNoZWV0KVxuXHRcdHtcblx0XHRcdGNvbnN0IHJlY3Vyc2UgPSAoZ3JvdXA6IENTU0dyb3VwaW5nUnVsZSB8IENTU1N0eWxlU2hlZXQpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGxlbiA9IGdyb3VwLmNzc1J1bGVzLmxlbmd0aDtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IC0xOyArK2kgPCBsZW47KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc3QgcnVsZSA9IGdyb3VwLmNzc1J1bGVzLml0ZW0oaSk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0aWYgKHJ1bGUgaW5zdGFuY2VvZiBDU1NHcm91cGluZ1J1bGUpXG5cdFx0XHRcdFx0XHRyZWN1cnNlKHJ1bGUpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGVsc2UgaWYgKHJ1bGUgaW5zdGFuY2VvZiBDU1NTdHlsZVJ1bGUpXG5cdFx0XHRcdFx0XHR0aGlzLnJlYWRTdHlsZShydWxlLnN0eWxlKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdFxuXHRcdFx0cmVjdXJzZShzaGVldCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByaXZhdGUgcmVhZFN0eWxlKHN0eWxlOiBDU1NTdHlsZURlY2xhcmF0aW9uKVxuXHRcdHtcblx0XHRcdGNvbnN0IG5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0XG5cdFx0XHRmb3IgKGxldCBuID0gLTE7ICsrbiA8IHN0eWxlLmxlbmd0aDspXG5cdFx0XHRcdG5hbWVzLnB1c2goc3R5bGVbbl0pO1xuXHRcdFx0XG5cdFx0XHRmb3IgKGNvbnN0IG5hbWUgb2YgbmFtZXMpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHZhbHVlID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKTtcblx0XHRcdFx0Y29uc3QgcHJpb3JpdHkgPSBzdHlsZS5nZXRQcm9wZXJ0eVByaW9yaXR5KG5hbWUpO1xuXHRcdFx0XHRjb25zdCByZXN1bHRWYWx1ZSA9IHRoaXMucHJvcGVydHlGbihuYW1lLCB2YWx1ZSk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAocmVzdWx0VmFsdWUgIT09IHZhbHVlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gVGhlIHByb3BlcnR5IGhhcyB0byBiZSByZW1vdmVkIGVpdGhlciB3YXksXG5cdFx0XHRcdFx0Ly8gYmVjYXVzZSBpZiB3ZSdyZSBzZXR0aW5nIGEgbmV3IHByb3BlcnR5IHdpdGhcblx0XHRcdFx0XHQvLyBhIGRpZmZlcmVudCBVUkwsIGl0IHdvbid0IGdldCBwcm9wZXJseSByZXBsYWNlZC5cblx0XHRcdFx0XHRzdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAocmVzdWx0VmFsdWUpXG5cdFx0XHRcdFx0XHRzdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCByZXN1bHRWYWx1ZSwgcHJpb3JpdHkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG4iLCJcbm5hbWVzcGFjZSBXZWJmZWVkXG57XG5cdC8qKlxuXHQgKiBAaW50ZXJuYWxcblx0ICogQSBjbGFzcyB0aGF0IHdyYXBzIGEgRm9yZWlnbkRvY3VtZW50UmVhZGVyLCBhbmQgd2hpY2ggY29udmVydHNcblx0ICogdGhlIGNvbnRlbnQgb2YgdGhlIHNwZWNpZmllZCByYXcgSFRNTCBkb2N1bWVudCBpbnRvIGEgZm9ybWF0XG5cdCAqIHdoaWNoIGlzIGFjY2VwdGFibGUgZm9yIGluamVjdGlvbiBpbnRvIGEgYmxvZy5cblx0ICovXG5cdGV4cG9ydCBjbGFzcyBGb3JlaWduRG9jdW1lbnRTYW5pdGl6ZXJcblx0e1xuXHRcdC8qKiAqL1xuXHRcdGNvbnN0cnVjdG9yKFxuXHRcdFx0cHJpdmF0ZSByZWFkb25seSByYXdEb2N1bWVudDogc3RyaW5nLFxuXHRcdFx0cHJpdmF0ZSByZWFkb25seSBiYXNlSHJlZjogc3RyaW5nKVxuXHRcdHsgfVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHJlYWQoKVxuXHRcdHtcblx0XHRcdGNvbnN0IHJlYWRlciA9IG5ldyBGb3JlaWduRG9jdW1lbnRSZWFkZXIodGhpcy5yYXdEb2N1bWVudCk7XG5cdFx0XHRcblx0XHRcdHJlYWRlci50cmFwRWxlbWVudChlID0+XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHQgPSBlLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmICh0ID09PSBcImZyYW1lXCIgfHwgdCA9PT0gXCJmcmFtZXNldFwiKVxuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XG5cdFx0XHRcdGlmICh0ID09PSBcInNjcmlwdFwiIHx8IHQgPT09IFwiaWZyYW1lXCIgfHwgdCA9PT0gXCJwb3J0YWxcIilcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAodCA9PT0gXCJub3NjcmlwdFwiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGF0dHIgb2YgQXJyYXkuZnJvbShkaXYuYXR0cmlidXRlcykpXG5cdFx0XHRcdFx0XHRkaXYuc2V0QXR0cmlidXRlTm9kZShhdHRyKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRkaXYuYXBwZW5kKC4uLkFycmF5LmZyb20oZGl2LmNoaWxkcmVuKSk7XG5cdFx0XHRcdFx0cmV0dXJuIGRpdjtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0cmV0dXJuIGU7XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0cmVhZGVyLnRyYXBBdHRyaWJ1dGUoKG5hbWUsIHZhbHVlLCBlbGVtZW50KSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRpZiAobmFtZS5zdGFydHNXaXRoKFwib25cIikpXG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcblx0XHRcdFx0Y29uc3QgdGFnID0gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAobmFtZSA9PT0gXCJzcmNzZXRcIilcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5yZXNvbHZlU291cmNlU2V0VXJscyh2YWx1ZSk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAobmFtZSA9PT0gXCJocmVmXCIgfHwgXG5cdFx0XHRcdFx0bmFtZSA9PT0gXCJzcmNcIiB8fFxuXHRcdFx0XHRcdCh0YWcgPT09IFwiZW1iZWRcIiAmJiBuYW1lID09PSBcInNvdXJjZVwiKSB8fFxuXHRcdFx0XHRcdCh0YWcgPT09IFwidmlkZW9cIiAmJiBuYW1lID09PSBcInBvc3RlclwiKSB8fFxuXHRcdFx0XHRcdCh0YWcgPT09IFwib2JqZWN0XCIgJiYgbmFtZSA9PT0gXCJkYXRhXCIpIHx8XG5cdFx0XHRcdFx0KHRhZyA9PT0gXCJmb3JtXCIgJiYgbmFtZSA9PT0gXCJhY3Rpb25cIikpXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMucmVzb2x2ZVBsYWluVXJsKHZhbHVlKTtcblx0XHRcdFx0XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHRyZWFkZXIudHJhcFByb3BlcnR5KChuYW1lLCB2YWx1ZSkgPT5cblx0XHRcdHtcblx0XHRcdFx0aWYgKCF1cmxQcm9wZXJ0aWVzLmhhcyhuYW1lKSlcblx0XHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHRcdFxuXHRcdFx0XHRyZXR1cm4gdGhpcy5yZXNvbHZlQ3NzVXJscyh2YWx1ZSk7XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIHJlYWRlci5yZWFkKCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByaXZhdGUgcmVzb2x2ZVBsYWluVXJsKHBsYWluVXJsOiBzdHJpbmcpXG5cdFx0e1xuXHRcdFx0aWYgKHBsYWluVXJsLnN0YXJ0c1dpdGgoXCJkYXRhOlwiKSB8fFxuXHRcdFx0XHRwbGFpblVybC5zdGFydHNXaXRoKFwiaHR0cDpcIikgfHxcblx0XHRcdFx0cGxhaW5Vcmwuc3RhcnRzV2l0aChcImh0dHBzOlwiKSB8fFxuXHRcdFx0XHRwbGFpblVybC5zdGFydHNXaXRoKFwiL1wiKSB8fFxuXHRcdFx0XHQvXlthLXpcXC1dKzovZy50ZXN0KHBsYWluVXJsKSlcblx0XHRcdFx0cmV0dXJuIHBsYWluVXJsO1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4gVXJsLnJlc29sdmUocGxhaW5VcmwsIHRoaXMuYmFzZUhyZWYpO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRwcml2YXRlIHJlc29sdmVDc3NVcmxzKGNzc1ZhbHVlOiBzdHJpbmcpXG5cdFx0e1xuXHRcdFx0Y29uc3QgcmVnID0gL1xcYnVybFxcKFtcIiddPyhbXlxccz9cIicpXSspL2dpO1xuXHRcdFx0Y29uc3QgcmVwbGFjZWQgPSBjc3NWYWx1ZS5yZXBsYWNlKHJlZywgKHN1YnN0cmluZywgdXJsKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgcmVzb2x2ZWQgPSB0aGlzLnJlc29sdmVQbGFpblVybCh1cmwpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKHN1YnN0cmluZy5zdGFydHNXaXRoKGB1cmwoXCJgKSlcblx0XHRcdFx0XHRyZXNvbHZlZCA9IGB1cmwoXCJgICsgcmVzb2x2ZWQ7XG5cdFx0XHRcdFxuXHRcdFx0XHRlbHNlIGlmIChzdWJzdHJpbmcuc3RhcnRzV2l0aChgdXJsKGApKVxuXHRcdFx0XHRcdHJlc29sdmVkID0gYHVybChgICsgcmVzb2x2ZWQ7XG5cdFx0XHRcdFxuXHRcdFx0XHRyZXR1cm4gcmVzb2x2ZWQ7XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIHJlcGxhY2VkO1xuXHRcdH1cblx0XHRcblx0XHQvKipcblx0XHQgKiBSZXNvbHZlcyBVUkxzIGluIGEgc3Jjc2V0IGF0dHJpYnV0ZSwgdXNpbmcgYSBtYWtlLXNoaWZ0IGFsZ29yaXRobVxuXHRcdCAqIHRoYXQgZG9lc24ndCBzdXBwb3J0IGNvbW1hcyBpbiB0aGUgVVJMLlxuXHRcdCAqL1xuXHRcdHByaXZhdGUgcmVzb2x2ZVNvdXJjZVNldFVybHMoc3JjU2V0VXJsczogc3RyaW5nKVxuXHRcdHtcblx0XHRcdGNvbnN0IHJhd1BhaXJzID0gc3JjU2V0VXJscy5zcGxpdChgLGApO1xuXHRcdFx0Y29uc3QgcGFpcnMgPSByYXdQYWlycy5tYXAocmF3UGFpciA9PlxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBwYWlyID0gcmF3UGFpci50cmltKCkuc3BsaXQoL1xccysvKTtcblx0XHRcdFx0aWYgKHBhaXIubGVuZ3RoID09PSAxKVxuXHRcdFx0XHRcdHBhaXIucHVzaChcIlwiKTtcblx0XHRcdFx0XG5cdFx0XHRcdHJldHVybiBwYWlyIGFzIFtzdHJpbmcsIHN0cmluZ107XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0Zm9yIChjb25zdCBwYWlyIG9mIHBhaXJzKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBbdXJsXSA9IHBhaXI7XG5cdFx0XHRcdHBhaXJbMF0gPSB0aGlzLnJlc29sdmVQbGFpblVybCh1cmwpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRyZXR1cm4gcGFpcnMubWFwKHBhaXIgPT4gcGFpci5qb2luKFwiIFwiKSkuam9pbihgLCBgKTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRjb25zdCB1cmxQcm9wZXJ0aWVzID0gbmV3IFNldChbXG5cdFx0XCJiYWNrZ3JvdW5kXCIsXG5cdFx0XCJiYWNrZ3JvdW5kLWltYWdlXCIsXG5cdFx0XCJib3JkZXItaW1hZ2VcIixcblx0XHRcImJvcmRlci1pbWFnZS1zb3VyY2VcIixcblx0XHRcImxpc3Qtc3R5bGVcIixcblx0XHRcImxpc3Qtc3R5bGUtaW1hZ2VcIixcblx0XHRcIm1hc2tcIixcblx0XHRcIm1hc2staW1hZ2VcIixcblx0XHRcIi13ZWJraXQtbWFza1wiLFxuXHRcdFwiLXdlYmtpdC1tYXNrLWltYWdlXCIsXG5cdFx0XCJjb250ZW50XCJcblx0XSk7XG59XG4iLCJcbi8qKlxuICogQGludGVybmFsXG4gKi9cbm5hbWVzcGFjZSBXZWJmZWVkLkh0dHBcbntcblx0LyoqXG5cdCAqIE1ha2VzIGFuIEhUVFAgcmVxdWVzdCB0byB0aGUgc3BlY2lmaWVkIFVSSSBhbmQgcmV0dXJuc1xuXHQgKiB0aGUgaGVhZGVycyBhbmQgYSBzdHJpbmcgY29udGFpbmluZyB0aGUgYm9keS5cblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXF1ZXN0KFxuXHRcdHJlbGF0aXZlVXJpOiBzdHJpbmcsIFxuXHRcdG9wdGlvbnM6IElIdHRwUmVxdWVzdE9wdGlvbnMgPSB7fSlcblx0e1xuXHRcdHJlbGF0aXZlVXJpID0gVXJsLnJlc29sdmUocmVsYXRpdmVVcmksIFVybC5nZXRDdXJyZW50KCkpO1xuXHRcdFxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdGNvbnN0IGFjID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuXHRcdFx0Y29uc3QgaWQgPSBzZXRUaW1lb3V0KCgpID0+IGFjLmFib3J0KCksIHJlcXVlc3RUaW1lb3V0KTtcblx0XHRcdFxuXHRcdFx0Y29uc3QgZmV0Y2hSZXN1bHQgPSBhd2FpdCB3aW5kb3cuZmV0Y2gocmVsYXRpdmVVcmksIHtcblx0XHRcdFx0bWV0aG9kOiBvcHRpb25zLm1ldGhvZCB8fCBcIkdFVFwiLFxuXHRcdFx0XHRoZWFkZXJzOiBvcHRpb25zLmhlYWRlcnMgfHwge30sXG5cdFx0XHRcdG1vZGU6IFwiY29yc1wiLFxuXHRcdFx0XHRzaWduYWw6IGFjLnNpZ25hbCxcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHRjbGVhclRpbWVvdXQoaWQpO1xuXHRcdFx0XG5cdFx0XHRpZiAoIWZldGNoUmVzdWx0Lm9rKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKFwiRmV0Y2ggZmFpbGVkOiBcIiArIHJlbGF0aXZlVXJpKTtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGxldCBib2R5ID0gXCJcIjtcblx0XHRcdFxuXHRcdFx0dHJ5XG5cdFx0XHR7XG5cdFx0XHRcdGJvZHkgPSBhd2FpdCBmZXRjaFJlc3VsdC50ZXh0KCk7XG5cdFx0XHR9XG5cdFx0XHRjYXRjaCAoZSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKCFvcHRpb25zLnF1aWV0KVxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoXCJGZXRjaCBmYWlsZWQ6IFwiICsgcmVsYXRpdmVVcmkpO1xuXHRcdFx0XHRcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGhlYWRlcnM6IGZldGNoUmVzdWx0LmhlYWRlcnMsXG5cdFx0XHRcdGJvZHksXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cdFx0XHRpZiAoIW9wdGlvbnMucXVpZXQpXG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiRXJyb3Igd2l0aCByZXF1ZXN0OiBcIiArIHJlbGF0aXZlVXJpKTtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKiogVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gd2FpdCBiZWZvcmUgY2FuY2VsbGluZyBhbiBIVFRQIHJlcXVlc3QuICovXG5cdGV4cG9ydCBsZXQgcmVxdWVzdFRpbWVvdXQgPSA1MDA7XG5cdFxuXHQvKiogKi9cblx0aW50ZXJmYWNlIElIdHRwUmVxdWVzdE9wdGlvbnNcblx0e1xuXHRcdG1ldGhvZD86IHN0cmluZztcblx0XHRoZWFkZXJzPzogSGVhZGVyc0luaXQ7XG5cdFx0cXVpZXQ/OiBib29sZWFuO1xuXHR9XG59XG4iLCJcbi8qKlxuICogQGludGVybmFsXG4gKiBBIG5hbWVzcGFjZSBvZiBmdW5jdGlvbnMgdGhhdCBkZWFsIHdpdGggdGhlIHJlb3JnYW5pemF0aW9uXG4gKiBvZiBkb2N1bWVudHMgaW50byB3ZWxsLWNvbnRyb2xsZWQgPHNlY3Rpb24+IGVsZW1lbnRzLlxuICovXG5uYW1lc3BhY2UgV2ViZmVlZC5SZW9yZ2FuaXplclxue1xuXHQvKipcblx0ICogRXh0cmFjdHMgYW5kIHJlb3JnYW5pemVzICBhIHJhbmdlIG9mIHRvcC1sZXZlbCA8c2VjdGlvbj4gZWxlbWVudHNcblx0ICogcHJlc2VudCBpbiB0aGUgc3BlY2lmaWVkIGRvY3VtZW50LlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGNvbXBvc2VTZWN0aW9ucyhcblx0XHRiYXNlSHJlZjogc3RyaW5nLFxuXHRcdHBhcmVudDogUGFyZW50Tm9kZSxcblx0XHRyYW5nZVN0YXJ0PzogbnVtYmVyLFxuXHRcdHJhbmdlRW5kPzogbnVtYmVyKVxuXHR7XG5cdFx0Y29uc3QgbWV0YUVsZW1lbnRzID0gcXVlcnlFbGVtZW50cyhcIkxJTkssIFNUWUxFLCBNRVRBLCBCQVNFXCIsIHBhcmVudCk7XG5cdFx0bWV0YUVsZW1lbnRzLm1hcChlID0+IGUucmVtb3ZlKCkpO1xuXHRcdFxuXHRcdC8vIElmIHRoZSBwYXJlbnQgaXMgYW4gPGh0bWw+IGVsZW1lbnQsIHRoZW4gd2UgY2hhbmdlIHRoZSBwYXJlbnQgdG8gdGhlXG5cdFx0Ly8gPGJvZHk+IHRhZyB3aXRoaW4gdGhlIDxodG1sPiBlbGVtZW50LCBidXQgZmlyc3QgbWFrZSBzdXJlIHRoZSBkb2N1bWVudFxuXHRcdC8vIGFjdHVhbGx5IGhhcyBhIDxib2R5PiB0YWcuIEl0J3MgcG9zc2libGUgdGhhdCB0aGUgZG9jdW1lbnQgbWF5IG5vdCBoYXZlXG5cdFx0Ly8gYSA8Ym9keT4gdGFnIGlmIHRoZSBkb2N1bWVudCBpcyBiZWluZyBjb25zdHJ1Y3RlZCBpbnNpZGUgc29tZSBzaW11bGF0ZWRcblx0XHQvLyBET00gaW1wbGVtZW50YXRpb24gKGxpa2UgTGlua2VET00gLyBIYXBweURPTSkuXG5cdFx0aWYgKHBhcmVudCBpbnN0YW5jZW9mIEhUTUxIdG1sRWxlbWVudClcblx0XHR7XG5cdFx0XHRjb25zdCBtYXliZUJvZHkgPSBBcnJheS5mcm9tKHBhcmVudC5jaGlsZHJlbilcblx0XHRcdFx0LmZpbmQoKGUpOiBlIGlzIEhUTUxCb2R5RWxlbWVudCA9PiBlIGluc3RhbmNlb2YgSFRNTEJvZHlFbGVtZW50KTtcblx0XHRcdFxuXHRcdFx0aWYgKG1heWJlQm9keSlcblx0XHRcdFx0cGFyZW50ID0gbWF5YmVCb2R5O1xuXHRcdH1cblx0XHRcblx0XHRpZiAocGFyZW50IGluc3RhbmNlb2YgRG9jdW1lbnQpXG5cdFx0XHRwYXJlbnQgPSBwYXJlbnQuYm9keTtcblx0XHRcblx0XHRjb25zdCBzZWN0aW9ucyA9IEFycmF5LmZyb20ocGFyZW50LmNoaWxkcmVuKVxuXHRcdFx0LmZpbHRlcigoZSk6IGUgaXMgSFRNTEVsZW1lbnQgPT4gZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuXHRcdFx0LmZpbHRlcihlID0+IGUudGFnTmFtZSA9PT0gXCJTRUNUSU9OXCIpO1xuXHRcdFxuXHRcdGNvbnN0IHNlY3Rpb25zU2xpY2UgPSBzZWN0aW9ucy5zbGljZShyYW5nZVN0YXJ0LCByYW5nZUVuZCk7XG5cdFx0Y29udmVydEVtYmVkZGVkVXJsc1RvQWJzb2x1dGUocGFyZW50LCBiYXNlSHJlZik7XG5cdFx0Y29uc3Qgc2hhZG93Um9vdHM6IEhUTUxFbGVtZW50W10gPSBbXTtcblx0XHRcblx0XHRmb3IgKGxldCBpID0gLTE7ICsraSA8IHNlY3Rpb25zU2xpY2UubGVuZ3RoOylcblx0XHR7XG5cdFx0XHRjb25zdCBzZWN0aW9uID0gc2VjdGlvbnNTbGljZVtpXTtcblx0XHRcdGNvbnN0IHNlY3Rpb25JbmRleCA9IHNlY3Rpb25zLmZpbmRJbmRleChlID0+IGUgPT09IHNlY3Rpb24pO1xuXHRcdFx0XG5cdFx0XHRpZiAoc2VjdGlvbiA9PT0gc2VjdGlvbnNbMF0pXG5cdFx0XHR7XG5cdFx0XHRcdC8vIFNwZWNpYWwgc2FuaXRpemF0aW9ucyBpcyByZXF1aXJlZCBmb3IgdGhlIHBvc3RlciBzZWN0aW9uXG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGNvbnN0IHNoYWRvd1Jvb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHRcdFx0c2hhZG93Um9vdC5jbGFzc05hbWUgPSBXZWJmZWVkLnNjZW5lQ2xhc3NOYW1lO1xuXHRcdFx0XG5cdFx0XHRjb25zdCBzaGFkb3cgPSBzaGFkb3dSb290LmF0dGFjaFNoYWRvdyh7IG1vZGU6IFwib3BlblwiIH0pO1xuXHRcdFx0Y29uc3QgbWV0YUNsb25lcyA9IG1ldGFFbGVtZW50cy5tYXAoZSA9PiBlLmNsb25lTm9kZSh0cnVlKSk7XG5cdFx0XHRzaGFkb3cuYXBwZW5kKFxuXHRcdFx0XHRVdGlsLmNyZWF0ZVNoZWV0KFwiU0VDVElPTiB7IGhlaWdodDogMTAwJTsgfVwiKSxcblx0XHRcdFx0Li4ubWV0YUNsb25lc1xuXHRcdFx0KTtcblx0XHRcdFxuXHRcdFx0Y29uc3QgZmFrZUJvZHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYm9keVwiKTtcblx0XHRcdGZha2VCb2R5LnN0eWxlLnNldFByb3BlcnR5KFwiZGlzcGxheVwiLCBcImNvbnRlbnRzXCIsIFwiaW1wb3J0YW50XCIpO1xuXHRcdFx0c2hhZG93LmFwcGVuZChmYWtlQm9keSk7XG5cdFx0XHRcblx0XHRcdC8vIEN1dCBvZmYgdGhlIHdoZWVsIGV2ZW50LCBhbmQgdGhlIHRvdWNobW92ZSBldmVudCB3aGljaCBoYXMgYVxuXHRcdFx0Ly8gc2ltaWxhciBlZmZlY3QgYXMgZ2V0dGluZyByaWQgb2Ygb3ZlcmZsb3c6IGF1dG8gb3Igb3ZlcmZsb3c6IHNjcm9sbFxuXHRcdFx0Ly8gb24gZGVza3RvcHMgYW5kIG9uIHRvdWNoIGRldmljZXMuIFRoaXMgaXMgYSBmYWlybHkgYmx1bnQgdG9vbC4gSXRcblx0XHRcdC8vIG1heSBuZWVkIHRvIGdldCBtb3JlIGNyZWF0aXZlIGluIHRoZSBmdXR1cmUgZm9yIGFsbG93aW5nIGNlcnRhaW5cblx0XHRcdC8vIGNhc2VzLiBCdXQgZm9yIG5vdyBpdCBzaG91bGQgc3VmZmljZS5cblx0XHRcdGZha2VCb2R5LmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCBldiA9PiBldi5wcmV2ZW50RGVmYXVsdCgpLCB7IGNhcHR1cmU6IHRydWUgfSk7XG5cdFx0XHRmYWtlQm9keS5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsIGV2ID0+IGV2LnByZXZlbnREZWZhdWx0KCksIHsgY2FwdHVyZTogdHJ1ZSB9KTtcblx0XHRcdFxuXHRcdFx0Zm9yIChsZXQgaSA9IC0xOyArK2kgPCBzZWN0aW9ucy5sZW5ndGg7KVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoaSA9PT0gc2VjdGlvbkluZGV4KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZmFrZUJvZHkuYXBwZW5kKHNlY3Rpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0IHNoaW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHRcdFx0XHRcdHNoaW0uc3R5bGUuc2V0UHJvcGVydHkoXCJkaXNwbGF5XCIsIFwibm9uZVwiLCBcImltcG9ydGFudFwiKTtcblx0XHRcdFx0XHRmYWtlQm9keS5hcHBlbmQoc2hpbSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0c2hhZG93Um9vdHMucHVzaChzaGFkb3dSb290KTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIHNoYWRvd1Jvb3RzO1xuXHR9XG5cdFxuXHQvKipcblx0ICogXG5cdCAqL1xuXHRmdW5jdGlvbiBjb252ZXJ0RW1iZWRkZWRVcmxzVG9BYnNvbHV0ZShwYXJlbnQ6IFBhcmVudE5vZGUsIGJhc2VVcmw6IHN0cmluZylcblx0e1xuXHRcdGNvbnN0IGVsZW1lbnRzID0gcXVlcnlFbGVtZW50cyhzZWxlY3RvckZvclVybHMsIHBhcmVudCk7XG5cdFx0XG5cdFx0aWYgKHBhcmVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuXHRcdFx0ZWxlbWVudHMudW5zaGlmdChwYXJlbnQpO1xuXHRcdFxuXHRcdGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cylcblx0XHR7XG5cdFx0XHRjb25zdCBhdHRycyA9IGF0dHJzV2l0aFVybHNcblx0XHRcdFx0Lm1hcChhID0+IGVsZW1lbnQuZ2V0QXR0cmlidXRlTm9kZShhKSlcblx0XHRcdFx0LmZpbHRlcigoYSk6IGEgaXMgQXR0ciA9PiAhIWEpO1xuXHRcdFx0XG5cdFx0XHRmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBhdHRycylcblx0XHRcdFx0YXR0cmlidXRlLnZhbHVlID0gVXJsLnJlc29sdmUoYXR0cmlidXRlLnZhbHVlLCBiYXNlVXJsKTtcblx0XHRcdFxuXHRcdFx0Zm9yIChjb25zdCBwIG9mIGNzc1Byb3BlcnRpZXNXaXRoVXJscylcblx0XHRcdHtcblx0XHRcdFx0bGV0IHB2ID0gZWxlbWVudC5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHApO1xuXHRcdFx0XHRpZiAocHYgPT09IFwiXCIpXG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFxuXHRcdFx0XHRwdiA9IHB2LnJlcGxhY2UoL1xcYnVybFxcKFwiLis/XCJcXCkvLCBzdWJzdHIgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0IHVud3JhcFVybCA9IHN1YnN0ci5zbGljZSg1LCAtMik7XG5cdFx0XHRcdFx0Y29uc3QgdXJsID0gVXJsLnJlc29sdmUodW53cmFwVXJsLCBiYXNlVXJsKTtcblx0XHRcdFx0XHRyZXR1cm4gYHVybChcIiR7dXJsfVwiKWA7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRcblx0XHRcdFx0ZWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eShwLCBwdik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdFxuXHRjb25zdCBhdHRyc1dpdGhVcmxzID0gW1wiaHJlZlwiLCBcInNyY1wiLCBcImFjdGlvblwiLCBcImRhdGEtc3JjXCJdO1xuXHRjb25zdCBzZWxlY3RvckZvclVybHMgPSBcIkxJTktbaHJlZl0sIEFbaHJlZl0sIElNR1tzcmNdLCBGT1JNW2FjdGlvbl0sIFNDUklQVFtzcmNdLCBbc3R5bGVdXCI7XG5cdGNvbnN0IGNzc1Byb3BlcnRpZXNXaXRoVXJscyA9IFtcblx0XHRcImJhY2tncm91bmRcIixcblx0XHRcImJhY2tncm91bmQtaW1hZ2VcIixcblx0XHRcImJvcmRlci1pbWFnZVwiLFxuXHRcdFwiYm9yZGVyLWltYWdlLXNvdXJjZVwiLFxuXHRcdFwiY29udGVudFwiLFxuXHRcdFwiY3Vyc29yXCIsXG5cdFx0XCJsaXN0LXN0eWxlLWltYWdlXCIsXG5cdFx0XCJtYXNrXCIsXG5cdFx0XCJtYXNrLWltYWdlXCIsXG5cdFx0XCJvZmZzZXQtcGF0aFwiLFxuXHRcdFwic3JjXCIsXG5cdF07XG5cdFxuXHQvKipcblx0ICogUmV0dXJucyBhbiBhcnJheSBvZiBIVE1MRWxlbWVudCBvYmplY3RzIHRoYXQgbWF0Y2ggdGhlIHNwZWNpZmllZCBzZWxlY3Rvcixcblx0ICogb3B0aW9uYWxseSB3aXRoaW4gdGhlIHNwZWNpZmllZCBwYXJlbnQgbm9kZS5cblx0ICovXG5cdGZ1bmN0aW9uIHF1ZXJ5RWxlbWVudHMoc2VsZWN0b3I6IHN0cmluZywgY29udGFpbmVyOiBQYXJlbnROb2RlID0gZG9jdW1lbnQpXG5cdHtcblx0XHRyZXR1cm4gQXJyYXkuZnJvbShjb250YWluZXIucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpIGFzIEhUTUxFbGVtZW50W107XG5cdH1cbn1cbiIsIlxubmFtZXNwYWNlIFdlYmZlZWRcbntcblx0LyoqXG5cdCAqIEBpbnRlcm5hbFxuXHQgKiBBIG5hbWVzcGFjZSBvZiBmdW5jdGlvbnMgdGhhdCBwZXJmb3JtIFVSTCBtYW5pcHVsYXRpb24uXG5cdCAqL1xuXHRleHBvcnQgbmFtZXNwYWNlIFVybFxuXHR7XG5cdFx0LyoqXG5cdFx0ICogUGFyc2VzIHRoZSBzcGVjaWZpZWQgVVJMIHN0cmluZyBhbmQgcmV0dXJucyBhIFVSTCBvYmplY3QsXG5cdFx0ICogb3IgbnVsbCBpZiB0aGUgVVJMIGZhaWxzIHRvIHBhcnNlLlxuXHRcdCAqL1xuXHRcdGV4cG9ydCBmdW5jdGlvbiB0cnlQYXJzZSh1cmw6IHN0cmluZywgYmFzZT86IHN0cmluZylcblx0XHR7XG5cdFx0XHR0cnlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIG5ldyBVUkwodXJsLCBiYXNlKTtcblx0XHRcdH1cblx0XHRcdGNhdGNoIChlKSB7IH1cblx0XHRcdFxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFJldHVybnMgdGhlIFVSTCBvZiB0aGUgY29udGFpbmluZyBmb2xkZXIgb2YgdGhlIHNwZWNpZmllZCBVUkwuXG5cdFx0ICogVGhlIHByb3ZpZGVkIFVSTCBtdXN0IGJlIHZhbGlkLCBvciBhbiBleGNlcHRpb24gd2lsbCBiZSB0aHJvd24uXG5cdFx0ICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIGZvbGRlck9mKHVybDogc3RyaW5nKVxuXHRcdHtcblx0XHRcdGNvbnN0IGxvID0gdHJ5UGFyc2UodXJsKTtcblx0XHRcdGlmICghbG8pXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0XG5cdFx0XHRjb25zdCBwYXJ0cyA9IGxvLnBhdGhuYW1lLnNwbGl0KFwiL1wiKS5maWx0ZXIocyA9PiAhIXMpO1xuXHRcdFx0Y29uc3QgbGFzdCA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuXHRcdFx0XG5cdFx0XHRpZiAoL1xcLlthLXowLTldKyQvaS50ZXN0KGxhc3QpKVxuXHRcdFx0XHRwYXJ0cy5wb3AoKTtcblx0XHRcdFxuXHRcdFx0Y29uc3QgcGF0aCA9IHBhcnRzLmpvaW4oXCIvXCIpICsgXCIvXCI7XG5cdFx0XHRyZXR1cm4gcmVzb2x2ZShwYXRoLCBsby5wcm90b2NvbCArIFwiLy9cIiArIGxvLmhvc3QpO1xuXHRcdH1cblx0XHRcblx0XHQvKipcblx0XHQgKiBSZXR1cm5zIHRoZSBVUkwgcHJvdmlkZWQgaW4gZnVsbHkgcXVhbGlmaWVkIGZvcm0sXG5cdFx0ICogdXNpbmcgdGhlIHNwZWNpZmllZCBiYXNlIFVSTC5cblx0XHQgKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gcmVzb2x2ZShwYXRoOiBzdHJpbmcsIGJhc2U6IHN0cmluZylcblx0XHR7XG5cdFx0XHRpZiAoL15bYS16XSs6Ly50ZXN0KHBhdGgpKVxuXHRcdFx0XHRyZXR1cm4gcGF0aDtcblx0XHRcdFxuXHRcdFx0dHJ5XG5cdFx0XHR7XG5cdFx0XHRcdGlmICghYmFzZS5lbmRzV2l0aChcIi9cIikpXG5cdFx0XHRcdFx0YmFzZSArPSBcIi9cIjtcblx0XHRcdFx0XG5cdFx0XHRcdHJldHVybiBuZXcgVVJMKHBhdGgsIGJhc2UpLnRvU3RyaW5nKCk7XG5cdFx0XHR9XG5cdFx0XHRjYXRjaCAoZSlcblx0XHRcdHtcblx0XHRcdFx0ZGVidWdnZXI7XG5cdFx0XHRcdHJldHVybiBudWxsIGFzIG5ldmVyO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvKipcblx0XHQgKiBHZXRzIHRoZSBiYXNlIFVSTCBvZiB0aGUgZG9jdW1lbnQgbG9hZGVkIGludG8gdGhlIGN1cnJlbnQgYnJvd3NlciB3aW5kb3cuXG5cdFx0ICogQWNjb3VudHMgZm9yIGFueSBIVE1MIDxiYXNlPiB0YWdzIHRoYXQgbWF5IGJlIGRlZmluZWQgd2l0aGluIHRoZSBkb2N1bWVudC5cblx0XHQgKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudCgpXG5cdFx0e1xuXHRcdFx0aWYgKHN0b3JlZFVybClcblx0XHRcdFx0cmV0dXJuIHN0b3JlZFVybDtcblx0XHRcdFxuXHRcdFx0bGV0IHVybCA9IFVybC5mb2xkZXJPZihkb2N1bWVudC5VUkwpITtcblx0XHRcdFxuXHRcdFx0Y29uc3QgYmFzZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJiYXNlW2hyZWZdXCIpO1xuXHRcdFx0aWYgKGJhc2UpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGhyZWYgPSBiYXNlLmdldEF0dHJpYnV0ZShcImhyZWZcIikgfHwgXCJcIjtcblx0XHRcdFx0aWYgKGhyZWYpXG5cdFx0XHRcdFx0dXJsID0gVXJsLnJlc29sdmUoaHJlZiwgdXJsKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0cmV0dXJuIHN0b3JlZFVybCA9IHVybDtcblx0XHR9XG5cdFx0bGV0IHN0b3JlZFVybCA9IFwiXCI7XG5cdH1cbn1cbiIsIlxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xubmFtZXNwYWNlIFdlYmZlZWQuVXRpbFxue1xuXHQvKiogKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNoZWV0KGNzc1RleHQ6IHN0cmluZylcblx0e1xuXHRcdGNvbnN0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcblx0XHRjb25zdCBodG1sID0gYDxzdHlsZT4ke2Nzc1RleHR9PC9zdHlsZT5gO1xuXHRcdGNvbnN0IGRvYyA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoaHRtbCwgXCJ0ZXh0L2h0bWxcIik7XG5cdFx0cmV0dXJuIGRvYy5xdWVyeVNlbGVjdG9yKFwic3R5bGVcIikhO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGhhc2goc3RyOiBzdHJpbmcpXG5cdHtcblx0XHRsZXQgaGFzaCA9IDA7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0Y29uc3QgY2hhciA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuXHRcdFx0aGFzaCA9IChoYXNoIDw8IDUpIC0gaGFzaCArIGNoYXI7XG5cdFx0XHRoYXNoICY9IGhhc2g7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBuZXcgVWludDMyQXJyYXkoW2hhc2hdKVswXS50b1N0cmluZygzNik7XG5cdH1cbn1cbiJdfQ==