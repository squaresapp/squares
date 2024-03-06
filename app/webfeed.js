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
     * Downloads a page from the specified page URL. Returns the poster element,
     * as well as the full array of sections of the page (including the poster).
     */
    async function downloadPage(pageUrl) {
        const result = await Webfeed.Http.request(pageUrl);
        if (!result)
            return null;
        const baseHref = Webfeed.Url.folderOf(pageUrl);
        if (!baseHref)
            return null;
        const createDoc = () => {
            const sanitizer = new Webfeed.ForeignDocumentSanitizer(result.body, pageUrl);
            const doc = sanitizer.read();
            return doc;
        };
        const docA = createDoc();
        const docB = createDoc();
        const sections = Webfeed.Reorganizer.composeSections(baseHref, docA);
        const poster = Webfeed.Reorganizer.composeSections(baseHref, docB, 0, 1)[0];
        return sections.length === 0 ? null : { poster, sections };
    }
    Webfeed.downloadPage = downloadPage;
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
        documentContent;
        baseHref;
        /** */
        constructor(documentContent, baseHref) {
            this.documentContent = documentContent;
            this.baseHref = baseHref;
        }
        /** */
        read() {
            const reader = new Webfeed.ForeignDocumentReader(this.documentContent);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViZmVlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2NvcmUvQXBpLnRzIiwiLi4vY29yZS9Gb3JlaWduRG9jdW1lbnRSZWFkZXIudHMiLCIuLi9jb3JlL0ZvcmVpZ25Eb2N1bWVudFNhbml0aXplci50cyIsIi4uL2NvcmUvSHR0cC50cyIsIi4uL2NvcmUvUmVvcmdhbml6ZXIudHMiLCIuLi9jb3JlL1VybC50cyIsIi4uL2NvcmUvVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBVSxPQUFPLENBdVBoQjtBQXZQRCxXQUFVLE9BQU87SUFFaEI7OztPQUdHO0lBQ0gsSUFBSSxPQUFPLFFBQVEsS0FBSyxXQUFXLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUNwRTtRQUNDLE1BQU0sY0FBYyxHQUFHLEdBQUcsRUFBRTtZQUUzQixNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQzdFLElBQUksZUFBZTtnQkFDbEIsU0FBUyxFQUFFLENBQUM7UUFDZCxDQUFDLENBQUE7UUFFRCxJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssVUFBVTtZQUNyQyxjQUFjLEVBQUUsQ0FBQTs7WUFFaEIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0tBQzdEO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFnQixTQUFTLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSTtRQUV4RCxRQUFRLEdBQUcsUUFBQSxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN4QyxJQUFJLENBQUMsUUFBUTtZQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFFbEQsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztRQUMzQixNQUFNLFFBQVEs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QUFPLFVBQVUsQ0FBQztZQUN6QyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN0RCxPQUFPLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFFLENBQUM7UUFDcEMsQ0FBQztRQU5lLGdCQUFXLGNBTTFCLENBQUE7UUFFRCxNQUFNO1FBQ04sU0FBZ0IsSUFBSSxDQUFDLEdBQVc7WUFFL0IsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQ2IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQ25DO2dCQUNDLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDO2dCQUNqQyxJQUFJLElBQUksSUFBSSxDQUFDO2FBQ2I7WUFFRCxPQUFPLElBQUksV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQVhlLFNBQUksT0FXbkIsQ0FBQTtJQUNGLENBQUMsRUF4QmlCLElBQUksR0FBSixZQUFJLEtBQUosWUFBSSxRQXdCckI7QUFBRCxDQUFDLEVBeEJTLE9BQU8sS0FBUCxPQUFPLFFBd0JoQiIsInNvdXJjZXNDb250ZW50IjpbIlxubmFtZXNwYWNlIFdlYmZlZWRcbntcblx0LyoqXG5cdCAqIE1haW4gZW50cnkgcG9pbnQgZm9yIHdoZW4gdGhlIHJlYWxzLmpzIHNjcmlwdCBpcyBcblx0ICogZW1iZWRkZWQgd2l0aGluIGEgd2ViIHBhZ2UuXG5cdCAqL1xuXHRpZiAodHlwZW9mIGRvY3VtZW50ICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpXG5cdHtcblx0XHRjb25zdCBtYXliZUJvb3RzdHJhcCA9ICgpID0+XG5cdFx0e1xuXHRcdFx0Y29uc3Qgc2hvdWxkQm9vdHN0cmFwID0gISFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtd2ViZmVlZC1ib290c3RyYXBdXCIpO1xuXHRcdFx0aWYgKHNob3VsZEJvb3RzdHJhcClcblx0XHRcdFx0Ym9vdHN0cmFwKCk7XG5cdFx0fVxuXHRcdFxuXHRcdGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpXG5cdFx0XHRtYXliZUJvb3RzdHJhcCgpXG5cdFx0ZWxzZVxuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIG1heWJlQm9vdHN0cmFwKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIENvbnZlcnRzIHRoZSA8c2VjdGlvbj4gZWxlbWVudHMgZm91bmQgaW4gdGhlIGRvY3VtZW50J3MgYm9keVxuXHQgKiBpbnRvIHRoZSB3ZWJmZWVkLXNjcm9sbGFibGUgZm9ybWF0LiBUaGlzIGZ1bmN0aW9uIGlzIGludGVuZGVkXG5cdCAqIHRvIGJlIGNhbGxlZCBieSB3ZWJmZWVkIHBhZ2VzIHRoYXQgYXJlIGRpc3BsYXlpbmcgaW4gdGhlIGJyb3dzZXIsXG5cdCAqIHJhdGhlciB0aGFuIGluIGEgd2ViZmVlZCByZWFkZXIuXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gYm9vdHN0cmFwKGJhc2VIcmVmID0gd2luZG93LmxvY2F0aW9uLmhyZWYpXG5cdHtcblx0XHRiYXNlSHJlZiA9IFVybC5mb2xkZXJPZihiYXNlSHJlZikgfHwgXCJcIjtcblx0XHRpZiAoIWJhc2VIcmVmKVxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBiYXNlIFVSTDogXCIgKyBiYXNlSHJlZik7XG5cdFx0XG5cdFx0Y29uc3QgYm9keSA9IGRvY3VtZW50LmJvZHk7XG5cdFx0Y29uc3Qgc2VjdGlvbnMgPSBSZW9yZ2FuaXplci5jb21wb3NlU2VjdGlvbnMoYmFzZUhyZWYsIGJvZHkpO1xuXHRcdGJvZHkuYXBwZW5kKC4uLnNlY3Rpb25zKTtcblx0XHRib2R5LnN0eWxlLmRpc3BsYXkgPSBcImNvbnRlbnRzXCI7XG5cdFx0XG5cdFx0ZG9jdW1lbnQuaGVhZC5hcHBlbmQoXG5cdFx0XHRVdGlsLmNyZWF0ZVNoZWV0KGBIVE1MIHsgaGVpZ2h0OiAxMDAlOyB9YCksXG5cdFx0XHRXZWJmZWVkLmdldFN1cHBvcnRpbmdDc3MoKVxuXHRcdCk7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBQZXJmb3JtcyBhbiBIVFRQIEhFQUQgcmVxdWVzdCBvbiB0aGUgc3BlY2lmaWVkIGZlZWQgaW5kZXggZmlsZVxuXHQgKiBhbmQgcmV0dXJucyBhIHN0cmluZyB0aGF0IGNhbiBiZSB1c2VkIHRvIGRldGVybWluZSBpZiB0aGUgaW5kZXggaGFzXG5cdCAqIGhhcyBiZWVuIG1vZGlmaWVkIHNpbmNlIHRoZSBsYXN0IHBpbmcuXG5cdCAqIFxuXHQgKiBcblx0ICogVGhlIGZ1bmN0aW9uIHJldHVybnMgdGhlIGZpcnN0IEhUVFAgaGVhZGVyIGl0IGZpbmRzLCB0cmF2ZXJzaW5nXG5cdCAqIGluIHRoZSBvcmRlciBvZiBFVGFnLCBMYXN0LU1vZGlmaWVkLCBhbmQgZmluYWxseSBDb250ZW50LUxlbmd0aC5cblx0ICogV2ViIHNlcnZlcnMgYXJlIGV4cGVjdGVkIHRvIHJldHVybiBhdCBsZWFzdCBvbmUgb2YgdGhlc2UgSFRUUFxuXHQgKiBoZWFkZXIgdmFsdWVzIGluIG9yZGVyIHRvIGJlIHdlYmZlZWQtY29tcGxpYW50LlxuXHQgKiBcblx0ICogVGhlIGZ1bmN0aW9uIHJldHVybnMgbnVsbCBpZiB0aGUgc2VydmVyIHdhc24ndCByZWFjaGFibGUsIG9yIGFuXG5cdCAqIGVtcHR5IHN0cmluZyBpZiB0aGUgc2VydmVyIGRpZG4ndCByZXR1cm4gb25lIG9mIHRoZSBleHBlY3RlZCBcblx0ICogaGVhZGVycy5cblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBwaW5nKHVybDogc3RyaW5nKVxuXHR7XG5cdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgSHR0cC5yZXF1ZXN0KHVybCwgeyBtZXRob2Q6IFwiSEVBRFwiLCBxdWlldDogdHJ1ZSB9KTtcblx0XHRpZiAoIXJlc3VsdClcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdFxuXHRcdHJldHVybiBVdGlsLmhhc2goW1xuXHRcdFx0cmVzdWx0LmhlYWRlcnMuZ2V0KFwiZXRhZ1wiKSB8fCBcIlwiLFxuXHRcdFx0cmVzdWx0LmhlYWRlcnMuZ2V0KFwibGFzdC1tb2RpZmllZFwiKSB8fCBcIlwiLFxuXHRcdFx0cmVzdWx0LmhlYWRlcnMuZ2V0KFwiY29udGVudC1sZW5ndGhcIikgfHwgXCJcIixcblx0XHRdLmpvaW4oKSk7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBSZWFkcyB0aGUgaW5kZXgudHh0IGZpbGUgbG9jYXRlZCBhdCB0aGUgc3BlY2lmaWVkIFVSTCxcblx0ICogYW5kIHJldHVybnMgYSBsaXN0IG9mIFVSTHMgd3JpdHRlbiBpbnRvIHRoZSBmaWxlLlxuXHQgKiBcblx0ICogUmV0dXJucyBudWxsIGlmIHRoZSBVUkwgd2FzIGludmFsaWQsIG9yIGNvdWxkIG5vdCBiZSByZWFjaGVkLlxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkSW5kZXgodXJsOiBzdHJpbmcpXG5cdHtcblx0XHRjb25zdCBmZWVkSW5kZXhGb2xkZXJVcmwgPSBVcmwuZm9sZGVyT2YodXJsKTtcblx0XHRpZiAoIWZlZWRJbmRleEZvbGRlclVybClcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdFxuXHRcdGNvbnN0IGZldGNoUmVzdWx0ID0gYXdhaXQgSHR0cC5yZXF1ZXN0KHVybCk7XG5cdFx0aWYgKCFmZXRjaFJlc3VsdClcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdFxuXHRcdGNvbnN0IHR5cGUgPSAoZmV0Y2hSZXN1bHQuaGVhZGVycy5nZXQoXCJDb250ZW50LVR5cGVcIikgfHwgXCJcIikuc3BsaXQoXCI7XCIpWzBdO1xuXHRcdGlmICh0eXBlICE9PSBcInRleHQvcGxhaW5cIilcblx0XHR7XG5cdFx0XHRjb25zb2xlLmVycm9yKFxuXHRcdFx0XHRcIkZlZWQgYXQgVVJMOiBcIiArIHVybCArIFwid2FzIHJldHVybmVkIHdpdGggYW4gaW5jb3JyZWN0IFwiICtcblx0XHRcdFx0XCJtaW1lIHR5cGUuIEV4cGVjdGVkIG1pbWUgdHlwZSBpcyBcXFwidGV4dC9wbGFpblxcXCIsIGJ1dCB0aGUgbWltZSB0eXBlIFxcXCJcIiArIFxuXHRcdFx0XHR0eXBlICsgXCJcXFwiIHdhcyByZXR1cm5lZC5cIik7XG5cdFx0XHRcdFxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBmZXRjaFJlc3VsdC5ib2R5XG5cdFx0XHQuc3BsaXQoXCJcXG5cIilcblx0XHRcdC5tYXAocyA9PiBzLnRyaW0oKSlcblx0XHRcdC5maWx0ZXIocyA9PiAhIXMgJiYgIXMuc3RhcnRzV2l0aChcIiNcIikpXG5cdFx0XHQuZmlsdGVyKChzKTogcyBpcyBzdHJpbmcgPT4gISFVcmwudHJ5UGFyc2UocywgZmVlZEluZGV4Rm9sZGVyVXJsKSlcblx0XHRcdC5tYXAocyA9PiBVcmwucmVzb2x2ZShzLCBmZWVkSW5kZXhGb2xkZXJVcmwpKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJlYWRzIHRoZSBcImRldGFpbHNcIiBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBmZWVkIGluZGV4LlxuXHQgKiBUaGUgYmVoYXZpb3IgbWlycm9ycyB0aGUgd2ViZmVlZCBzcGVjaWZpY2F0aW9uOiBpdCBsb29rcyBpbiB0aGVcblx0ICogc2FtZSBmb2xkZXIgYXMgdGhlIGluZGV4LnR4dCBmaWxlIGZvciBhIGRlZmF1bHQgZG9jdW1lbnQsIHdoaWNoXG5cdCAqIGlzIGV4cGVjdGVkIHRvIGJlIGFuIEhUTUwgZmlsZS4gSXQgcGFyc2VzIHRoZSA8aGVhZD4gc2VjdGlvbiBvZlxuXHQgKiB0aGlzIEhUTUwgZmlsZSB0byBleHRyYWN0IG91dCB0aGUgPG1ldGE+IGFuZCA8bGluaz4gdGFncyBvZlxuXHQgKiBpbnRlcmVzdC5cblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBkb3dubG9hZERldGFpbHMoaW5kZXhVcmw6IHN0cmluZylcblx0e1xuXHRcdGNvbnN0IGZlZWRJbmRleEZvbGRlclVybCA9IFVybC5mb2xkZXJPZihpbmRleFVybCk7XG5cdFx0aWYgKCFmZWVkSW5kZXhGb2xkZXJVcmwpXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBIdHRwLnJlcXVlc3QoZmVlZEluZGV4Rm9sZGVyVXJsKTtcblx0XHRpZiAoIXJlc3VsdClcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdFxuXHRcdGxldCBkYXRlID0gcmVzdWx0LmhlYWRlcnMuZ2V0KFwiTGFzdC1Nb2RpZmllZFwiKSB8fCBcIlwiO1xuXHRcdGxldCBhdXRob3IgPSBcIlwiO1xuXHRcdGxldCBkZXNjcmlwdGlvbiA9IFwiXCI7XG5cdFx0bGV0IGljb24gPSBcIlwiO1xuXHRcdFxuXHRcdGNvbnN0IHsgYm9keSB9ID0gcmVzdWx0O1xuXHRcdGNvbnN0IHJlYWRlciA9IG5ldyBGb3JlaWduRG9jdW1lbnRSZWFkZXIoYm9keSk7XG5cdFx0XG5cdFx0cmVhZGVyLnRyYXBFbGVtZW50KGVsZW1lbnQgPT5cblx0XHR7XG5cdFx0XHRpZiAoZWxlbWVudC5ub2RlTmFtZSA9PT0gXCJNRVRBXCIpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IG5hbWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShcIm5hbWVcIik/LnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAobmFtZSA9PT0gXCJkZXNjcmlwdGlvblwiKVxuXHRcdFx0XHRcdGRlc2NyaXB0aW9uID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjb250ZW50XCIpIHx8IFwiXCI7XG5cdFx0XHRcdFxuXHRcdFx0XHRlbHNlIGlmIChuYW1lID09PSBcImF1dGhvclwiKVxuXHRcdFx0XHRcdGF1dGhvciA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiY29udGVudFwiKSB8fCBcIlwiO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoZWxlbWVudC5ub2RlTmFtZSA9PT0gXCJMSU5LXCIpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHJlbCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwicmVsXCIpPy50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKHJlbCA9PT0gXCJpY29uXCIpXG5cdFx0XHRcdFx0aWNvbiA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiaHJlZlwiKSB8fCBcIlwiO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdFxuXHRcdHJlYWRlci5yZWFkKCk7XG5cdFx0XG5cdFx0cmV0dXJuIHsgZGF0ZSwgYXV0aG9yLCBkZXNjcmlwdGlvbiwgaWNvbiB9O1xuXHR9XG5cdFxuXHQvKipcblx0ICogRG93bmxvYWRzIGEgcGFnZSBmcm9tIHRoZSBzcGVjaWZpZWQgcGFnZSBVUkwuIFJldHVybnMgdGhlIHBvc3RlciBlbGVtZW50LFxuXHQgKiBhcyB3ZWxsIGFzIHRoZSBmdWxsIGFycmF5IG9mIHNlY3Rpb25zIG9mIHRoZSBwYWdlIChpbmNsdWRpbmcgdGhlIHBvc3RlcikuXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93bmxvYWRQYWdlKHBhZ2VVcmw6IHN0cmluZylcblx0e1xuXHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IEh0dHAucmVxdWVzdChwYWdlVXJsKTtcblx0XHRpZiAoIXJlc3VsdClcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdFxuXHRcdGNvbnN0IGJhc2VIcmVmID0gVXJsLmZvbGRlck9mKHBhZ2VVcmwpO1xuXHRcdGlmICghYmFzZUhyZWYpXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcblx0XHRjb25zdCBjcmVhdGVEb2MgPSAoKSA9PlxuXHRcdHtcblx0XHRcdGNvbnN0IHNhbml0aXplciA9IG5ldyBGb3JlaWduRG9jdW1lbnRTYW5pdGl6ZXIocmVzdWx0LmJvZHksIHBhZ2VVcmwpO1xuXHRcdFx0Y29uc3QgZG9jID0gc2FuaXRpemVyLnJlYWQoKTtcblx0XHRcdHJldHVybiBkb2M7XG5cdFx0fTtcblx0XHRcblx0XHRjb25zdCBkb2NBID0gY3JlYXRlRG9jKCk7XG5cdFx0Y29uc3QgZG9jQiA9IGNyZWF0ZURvYygpO1xuXHRcdGNvbnN0IHNlY3Rpb25zID0gUmVvcmdhbml6ZXIuY29tcG9zZVNlY3Rpb25zKGJhc2VIcmVmLCBkb2NBKTtcblx0XHRjb25zdCBwb3N0ZXIgPSBSZW9yZ2FuaXplci5jb21wb3NlU2VjdGlvbnMoYmFzZUhyZWYsIGRvY0IsIDAsIDEpWzBdO1xuXHRcdHJldHVybiBzZWN0aW9ucy5sZW5ndGggPT09IDAgPyBudWxsIDogeyBwb3N0ZXIsIHNlY3Rpb25zIH07XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBVUkwgb2YgdGhlIGNvbnRhaW5pbmcgZm9sZGVyIG9mIHRoZSBzcGVjaWZpZWQgVVJMLlxuXHQgKiBUaGUgcHJvdmlkZWQgVVJMIG11c3QgYmUgdmFsaWQsIG9yIGFuIGV4Y2VwdGlvbiB3aWxsIGJlIHRocm93bi5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBnZXRGb2xkZXJPZih1cmw6IHN0cmluZylcblx0e1xuXHRcdHJldHVybiBVcmwuZm9sZGVyT2YodXJsKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJldHVybnMgYSA8c3R5bGU+IHRhZyB0aGF0IGhhcyB0aGUgbWluaW11bSByZXF1aXJlZCBDU1MgdG9cblx0ICogcmVuZGVyIHRoZSBjYXJvdXNlbCB0byB0aGUgc2NyZWVuLlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGdldFN1cHBvcnRpbmdDc3MoZnJhbWVTZWxlY3RvciA9IFwiSFRNTFwiKVxuXHR7XG5cdFx0cmV0dXJuIFV0aWwuY3JlYXRlU2hlZXQoYFxuXHRcdFx0JHtmcmFtZVNlbGVjdG9yfSB7XG5cdFx0XHRcdHNjcm9sbC1zbmFwLXR5cGU6IHkgbWFuZGF0b3J5O1xuXHRcdFx0fVxuXHRcdFx0LiR7c2NlbmVDbGFzc05hbWV9IHtcblx0XHRcdFx0cG9zaXRpb246IHJlbGF0aXZlO1xuXHRcdFx0XHRvdmVyZmxvdzogaGlkZGVuO1xuXHRcdFx0XHRoZWlnaHQ6IDEwMCU7XG5cdFx0XHRcdHBhZGRpbmctdG9wOiAwLjAycHg7XG5cdFx0XHRcdHBhZGRpbmctYm90dG9tOiAwLjAycHg7XG5cdFx0XHRcdHNjcm9sbC1zbmFwLWFsaWduOiBzdGFydDtcblx0XHRcdFx0c2Nyb2xsLXNuYXAtc3RvcDogYWx3YXlzO1xuXHRcdFx0fVxuXHRcdGApO1xuXHR9XG5cdFxuXHQvKipcblx0ICogUmVuZGVycyBhIHBsYWNlaG9sZGVyIHBvc3RlciBmb3Igd2hlbiB0aGUgcGFnZSBjb3VsZG4ndCBiZSBsb2FkZWQuXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RXJyb3JQb3N0ZXIoKVxuXHR7XG5cdFx0Y29uc3QgZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cdFx0Y29uc3QgcyA9IGUuc3R5bGU7XG5cdFx0cy5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcblx0XHRzLnRvcCA9IFwiMFwiO1xuXHRcdHMucmlnaHQgPSBcIjBcIjtcblx0XHRzLmJvdHRvbSA9IFwiMFwiO1xuXHRcdHMubGVmdCA9IFwiMFwiO1xuXHRcdHMud2lkdGggPSBcImZpdC1jb250ZW50XCI7XG5cdFx0cy5oZWlnaHQgPSBcImZpdC1jb250ZW50XCI7XG5cdFx0cy5tYXJnaW4gPSBcImF1dG9cIjtcblx0XHRzLmZvbnRTaXplID0gXCIyMHZ3XCI7XG5cdFx0cy5mb250V2VpZ2h0ID0gXCI5MDBcIjtcblx0XHRlLmFwcGVuZChuZXcgVGV4dChcIuKclVwiKSk7XG5cdFx0cmV0dXJuIGU7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBUaGUgbmFtZSBvZiB0aGUgY2xhc3MgYWRkZWQgdG8gdGhlIGNvbnN0cnVjdGVkIDxkaXY+XG5cdCAqIGVsZW1lbnRzIHRoYXQgY3JlYXRlIHRoZSBzY2VuZXMuXG5cdCAqL1xuXHRleHBvcnQgY29uc3Qgc2NlbmVDbGFzc05hbWUgPSBcIi0tc2NlbmVcIjtcblx0XG5cdGRlY2xhcmUgY29uc3QgbW9kdWxlOiBhbnk7XG5cdHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgT2JqZWN0LmFzc2lnbihtb2R1bGUuZXhwb3J0cywgeyBXZWJmZWVkIH0pO1xufVxuIiwiXG5uYW1lc3BhY2UgV2ViZmVlZFxue1xuXHQvKipcblx0ICogQSBjbGFzcyB0aGF0IHJlYWRzIGEgcmF3IEhUTUwgZG9jdW1lbnQsIGFuZCBwcm92aWRlc1xuXHQgKiB0aGUgYWJpbGl0eSB0byBzY2FuIHRoZSBkb2N1bWVudCB3aXRoIHJlZ2lzdGVyZWQgXCJ0cmFwc1wiLFxuXHQgKiB3aGljaCBhbGxvdyB0aGUgZG9jdW1lbnQncyBjb250ZW50IHRvIGJlIG1vZGlmaWVkLlxuXHQgKi9cblx0ZXhwb3J0IGNsYXNzIEZvcmVpZ25Eb2N1bWVudFJlYWRlclxuXHR7XG5cdFx0LyoqICovXG5cdFx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSByYXdEb2N1bWVudDogc3RyaW5nKSB7IH1cblx0XHRcblx0XHQvKiogKi9cblx0XHR0cmFwRWxlbWVudChlbGVtZW50Rm46IChlbGVtZW50OiBFbGVtZW50KSA9PiBFbGVtZW50IHwgdm9pZClcblx0XHR7XG5cdFx0XHR0aGlzLmVsZW1lbnRGbiA9IGVsZW1lbnRGbjtcblx0XHR9XG5cdFx0cHJpdmF0ZSBlbGVtZW50Rm4gPSAoZWxlbWVudDogRWxlbWVudCk6IEVsZW1lbnQgfCB2b2lkID0+IGVsZW1lbnQ7XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0dHJhcEF0dHJpYnV0ZShhdHRyaWJ1dGVGbjogKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgZWxlbWVudDogRWxlbWVudCkgPT4gc3RyaW5nIHwgdm9pZClcblx0XHR7XG5cdFx0XHR0aGlzLmF0dHJpYnV0ZUZuID0gYXR0cmlidXRlRm47XG5cdFx0fVxuXHRcdHByaXZhdGUgYXR0cmlidXRlRm4gPSAobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBlbGVtZW50OiBFbGVtZW50KTogc3RyaW5nIHwgdm9pZCA9PiB2YWx1ZTtcblx0XHRcblx0XHQvKiogKi9cblx0XHR0cmFwUHJvcGVydHkocHJvcGVydHlGbjogKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZykgPT4gc3RyaW5nKVxuXHRcdHtcblx0XHRcdHRoaXMucHJvcGVydHlGbiA9IHByb3BlcnR5Rm47XG5cdFx0fVxuXHRcdHByaXZhdGUgcHJvcGVydHlGbiA9IChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpID0+IG5hbWU7XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cmVhZCgpXG5cdFx0e1xuXHRcdFx0Y29uc3QgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuXHRcdFx0Y29uc3QgZG9jID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyh0aGlzLnJhd0RvY3VtZW50LCBcInRleHQvaHRtbFwiKTtcblx0XHRcdGNvbnN0IHRyYXNoOiBFbGVtZW50W10gPSBbXTtcblx0XHRcdFxuXHRcdFx0Zm9yIChjb25zdCB3YWxrZXIgPSBkb2MuY3JlYXRlVHJlZVdhbGtlcihkb2MpOzspXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBub2RlID0gd2Fsa2VyLm5leHROb2RlKCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoIW5vZGUpXG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoIShub2RlIGluc3RhbmNlb2YgRWxlbWVudCkpXG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFxuXHRcdFx0XHRsZXQgZWxlbWVudCA9IG5vZGUgYXMgRWxlbWVudDtcblx0XHRcdFx0XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9IHRoaXMuZWxlbWVudEZuKGVsZW1lbnQpO1xuXHRcdFx0XHRpZiAoIXJlc3VsdClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRyYXNoLnB1c2goZWxlbWVudCk7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAocmVzdWx0IGluc3RhbmNlb2YgTm9kZSAmJiByZXN1bHQgIT09IGVsZW1lbnQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRlbGVtZW50LnJlcGxhY2VXaXRoKHJlc3VsdCk7XG5cdFx0XHRcdFx0ZWxlbWVudCA9IHJlc3VsdDtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0aWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MU3R5bGVFbGVtZW50KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKGVsZW1lbnQuc2hlZXQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dGhpcy5yZWFkU2hlZXQoZWxlbWVudC5zaGVldCk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGNvbnN0IGNzc1RleHQ6IHN0cmluZ1tdID0gW107XG5cdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gLTEsIGxlbiA9IGVsZW1lbnQuc2hlZXQuY3NzUnVsZXMubGVuZ3RoOyArK2kgPCBsZW47KVxuXHRcdFx0XHRcdFx0XHRjc3NUZXh0LnB1c2goZWxlbWVudC5zaGVldC5jc3NSdWxlc1tpXS5jc3NUZXh0KTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0aWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MU3R5bGVFbGVtZW50KVxuXHRcdFx0XHRcdFx0XHRlbGVtZW50LnRleHRDb250ZW50ID0gY3NzVGV4dC5qb2luKFwiXFxuXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Zm9yIChjb25zdCBhdHRyIG9mIEFycmF5LmZyb20oZWxlbWVudC5hdHRyaWJ1dGVzKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5hdHRyaWJ1dGVGbihhdHRyLm5hbWUsIGF0dHIudmFsdWUsIGVsZW1lbnQpO1xuXHRcdFx0XHRcdGlmIChuZXdWYWx1ZSA9PT0gbnVsbCB8fCBuZXdWYWx1ZSA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRcdFx0ZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGVOb2RlKGF0dHIpO1xuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHIubmFtZSwgbmV3VmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIGVsZW1lbnQuaGFzQXR0cmlidXRlKFwic3R5bGVcIikpXG5cdFx0XHRcdFx0dGhpcy5yZWFkU3R5bGUoZWxlbWVudC5zdHlsZSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGZvciAoY29uc3QgZSBvZiB0cmFzaClcblx0XHRcdFx0ZS5yZW1vdmUoKTtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIGRvYztcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cHJpdmF0ZSByZWFkU2hlZXQoc2hlZXQ6IENTU1N0eWxlU2hlZXQpXG5cdFx0e1xuXHRcdFx0Y29uc3QgcmVjdXJzZSA9IChncm91cDogQ1NTR3JvdXBpbmdSdWxlIHwgQ1NTU3R5bGVTaGVldCkgPT5cblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgbGVuID0gZ3JvdXAuY3NzUnVsZXMubGVuZ3RoO1xuXHRcdFx0XHRmb3IgKGxldCBpID0gLTE7ICsraSA8IGxlbjspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCBydWxlID0gZ3JvdXAuY3NzUnVsZXMuaXRlbShpKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAocnVsZSBpbnN0YW5jZW9mIENTU0dyb3VwaW5nUnVsZSlcblx0XHRcdFx0XHRcdHJlY3Vyc2UocnVsZSk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0ZWxzZSBpZiAocnVsZSBpbnN0YW5jZW9mIENTU1N0eWxlUnVsZSlcblx0XHRcdFx0XHRcdHRoaXMucmVhZFN0eWxlKHJ1bGUuc3R5bGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0XG5cdFx0XHRyZWN1cnNlKHNoZWV0KTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cHJpdmF0ZSByZWFkU3R5bGUoc3R5bGU6IENTU1N0eWxlRGVjbGFyYXRpb24pXG5cdFx0e1xuXHRcdFx0Y29uc3QgbmFtZXM6IHN0cmluZ1tdID0gW107XG5cdFx0XHRcblx0XHRcdGZvciAobGV0IG4gPSAtMTsgKytuIDwgc3R5bGUubGVuZ3RoOylcblx0XHRcdFx0bmFtZXMucHVzaChzdHlsZVtuXSk7XG5cdFx0XHRcblx0XHRcdGZvciAoY29uc3QgbmFtZSBvZiBuYW1lcylcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKG5hbWUpO1xuXHRcdFx0XHRjb25zdCBwcmlvcml0eSA9IHN0eWxlLmdldFByb3BlcnR5UHJpb3JpdHkobmFtZSk7XG5cdFx0XHRcdGNvbnN0IHJlc3VsdFZhbHVlID0gdGhpcy5wcm9wZXJ0eUZuKG5hbWUsIHZhbHVlKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChyZXN1bHRWYWx1ZSAhPT0gdmFsdWUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBUaGUgcHJvcGVydHkgaGFzIHRvIGJlIHJlbW92ZWQgZWl0aGVyIHdheSxcblx0XHRcdFx0XHQvLyBiZWNhdXNlIGlmIHdlJ3JlIHNldHRpbmcgYSBuZXcgcHJvcGVydHkgd2l0aFxuXHRcdFx0XHRcdC8vIGEgZGlmZmVyZW50IFVSTCwgaXQgd29uJ3QgZ2V0IHByb3Blcmx5IHJlcGxhY2VkLlxuXHRcdFx0XHRcdHN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGlmIChyZXN1bHRWYWx1ZSlcblx0XHRcdFx0XHRcdHN0eWxlLnNldFByb3BlcnR5KG5hbWUsIHJlc3VsdFZhbHVlLCBwcmlvcml0eSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiIsIlxubmFtZXNwYWNlIFdlYmZlZWRcbntcblx0LyoqXG5cdCAqIEBpbnRlcm5hbFxuXHQgKiBBIGNsYXNzIHRoYXQgd3JhcHMgYSBGb3JlaWduRG9jdW1lbnRSZWFkZXIsIGFuZCB3aGljaCBjb252ZXJ0c1xuXHQgKiB0aGUgY29udGVudCBvZiB0aGUgc3BlY2lmaWVkIHJhdyBIVE1MIGRvY3VtZW50IGludG8gYSBmb3JtYXRcblx0ICogd2hpY2ggaXMgYWNjZXB0YWJsZSBmb3IgaW5qZWN0aW9uIGludG8gYSBibG9nLlxuXHQgKi9cblx0ZXhwb3J0IGNsYXNzIEZvcmVpZ25Eb2N1bWVudFNhbml0aXplclxuXHR7XG5cdFx0LyoqICovXG5cdFx0Y29uc3RydWN0b3IoXG5cdFx0XHRwcml2YXRlIHJlYWRvbmx5IGRvY3VtZW50Q29udGVudDogc3RyaW5nLFxuXHRcdFx0cHJpdmF0ZSByZWFkb25seSBiYXNlSHJlZjogc3RyaW5nKVxuXHRcdHsgfVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHJlYWQoKVxuXHRcdHtcblx0XHRcdGNvbnN0IHJlYWRlciA9IG5ldyBGb3JlaWduRG9jdW1lbnRSZWFkZXIodGhpcy5kb2N1bWVudENvbnRlbnQpO1xuXHRcdFx0XG5cdFx0XHRyZWFkZXIudHJhcEVsZW1lbnQoZSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCB0ID0gZS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAodCA9PT0gXCJmcmFtZVwiIHx8IHQgPT09IFwiZnJhbWVzZXRcIilcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAodCA9PT0gXCJzY3JpcHRcIiB8fCB0ID09PSBcImlmcmFtZVwiIHx8IHQgPT09IFwicG9ydGFsXCIpXG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKHQgPT09IFwibm9zY3JpcHRcIilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBhdHRyIG9mIEFycmF5LmZyb20oZGl2LmF0dHJpYnV0ZXMpKVxuXHRcdFx0XHRcdFx0ZGl2LnNldEF0dHJpYnV0ZU5vZGUoYXR0cik7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0ZGl2LmFwcGVuZCguLi5BcnJheS5mcm9tKGRpdi5jaGlsZHJlbikpO1xuXHRcdFx0XHRcdHJldHVybiBkaXY7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdHJldHVybiBlO1xuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdHJlYWRlci50cmFwQXR0cmlidXRlKChuYW1lLCB2YWx1ZSwgZWxlbWVudCkgPT5cblx0XHRcdHtcblx0XHRcdFx0aWYgKG5hbWUuc3RhcnRzV2l0aChcIm9uXCIpKVxuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XG5cdFx0XHRcdGNvbnN0IHRhZyA9IGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKG5hbWUgPT09IFwic3Jjc2V0XCIpXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMucmVzb2x2ZVNvdXJjZVNldFVybHModmFsdWUpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKG5hbWUgPT09IFwiaHJlZlwiIHx8IFxuXHRcdFx0XHRcdG5hbWUgPT09IFwic3JjXCIgfHxcblx0XHRcdFx0XHQodGFnID09PSBcImVtYmVkXCIgJiYgbmFtZSA9PT0gXCJzb3VyY2VcIikgfHxcblx0XHRcdFx0XHQodGFnID09PSBcInZpZGVvXCIgJiYgbmFtZSA9PT0gXCJwb3N0ZXJcIikgfHxcblx0XHRcdFx0XHQodGFnID09PSBcIm9iamVjdFwiICYmIG5hbWUgPT09IFwiZGF0YVwiKSB8fFxuXHRcdFx0XHRcdCh0YWcgPT09IFwiZm9ybVwiICYmIG5hbWUgPT09IFwiYWN0aW9uXCIpKVxuXHRcdFx0XHRcdHJldHVybiB0aGlzLnJlc29sdmVQbGFpblVybCh2YWx1ZSk7XG5cdFx0XHRcdFxuXHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0cmVhZGVyLnRyYXBQcm9wZXJ0eSgobmFtZSwgdmFsdWUpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGlmICghdXJsUHJvcGVydGllcy5oYXMobmFtZSkpXG5cdFx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0XHRcblx0XHRcdFx0cmV0dXJuIHRoaXMucmVzb2x2ZUNzc1VybHModmFsdWUpO1xuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdHJldHVybiByZWFkZXIucmVhZCgpO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRwcml2YXRlIHJlc29sdmVQbGFpblVybChwbGFpblVybDogc3RyaW5nKVxuXHRcdHtcblx0XHRcdGlmIChwbGFpblVybC5zdGFydHNXaXRoKFwiZGF0YTpcIikgfHxcblx0XHRcdFx0cGxhaW5Vcmwuc3RhcnRzV2l0aChcImh0dHA6XCIpIHx8XG5cdFx0XHRcdHBsYWluVXJsLnN0YXJ0c1dpdGgoXCJodHRwczpcIikgfHxcblx0XHRcdFx0cGxhaW5Vcmwuc3RhcnRzV2l0aChcIi9cIikgfHxcblx0XHRcdFx0L15bYS16XFwtXSs6L2cudGVzdChwbGFpblVybCkpXG5cdFx0XHRcdHJldHVybiBwbGFpblVybDtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIFVybC5yZXNvbHZlKHBsYWluVXJsLCB0aGlzLmJhc2VIcmVmKTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cHJpdmF0ZSByZXNvbHZlQ3NzVXJscyhjc3NWYWx1ZTogc3RyaW5nKVxuXHRcdHtcblx0XHRcdGNvbnN0IHJlZyA9IC9cXGJ1cmxcXChbXCInXT8oW15cXHM/XCInKV0rKS9naTtcblx0XHRcdGNvbnN0IHJlcGxhY2VkID0gY3NzVmFsdWUucmVwbGFjZShyZWcsIChzdWJzdHJpbmcsIHVybCkgPT5cblx0XHRcdHtcblx0XHRcdFx0bGV0IHJlc29sdmVkID0gdGhpcy5yZXNvbHZlUGxhaW5VcmwodXJsKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChzdWJzdHJpbmcuc3RhcnRzV2l0aChgdXJsKFwiYCkpXG5cdFx0XHRcdFx0cmVzb2x2ZWQgPSBgdXJsKFwiYCArIHJlc29sdmVkO1xuXHRcdFx0XHRcblx0XHRcdFx0ZWxzZSBpZiAoc3Vic3RyaW5nLnN0YXJ0c1dpdGgoYHVybChgKSlcblx0XHRcdFx0XHRyZXNvbHZlZCA9IGB1cmwoYCArIHJlc29sdmVkO1xuXHRcdFx0XHRcblx0XHRcdFx0cmV0dXJuIHJlc29sdmVkO1xuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdHJldHVybiByZXBsYWNlZDtcblx0XHR9XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogUmVzb2x2ZXMgVVJMcyBpbiBhIHNyY3NldCBhdHRyaWJ1dGUsIHVzaW5nIGEgbWFrZS1zaGlmdCBhbGdvcml0aG1cblx0XHQgKiB0aGF0IGRvZXNuJ3Qgc3VwcG9ydCBjb21tYXMgaW4gdGhlIFVSTC5cblx0XHQgKi9cblx0XHRwcml2YXRlIHJlc29sdmVTb3VyY2VTZXRVcmxzKHNyY1NldFVybHM6IHN0cmluZylcblx0XHR7XG5cdFx0XHRjb25zdCByYXdQYWlycyA9IHNyY1NldFVybHMuc3BsaXQoYCxgKTtcblx0XHRcdGNvbnN0IHBhaXJzID0gcmF3UGFpcnMubWFwKHJhd1BhaXIgPT5cblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgcGFpciA9IHJhd1BhaXIudHJpbSgpLnNwbGl0KC9cXHMrLyk7XG5cdFx0XHRcdGlmIChwYWlyLmxlbmd0aCA9PT0gMSlcblx0XHRcdFx0XHRwYWlyLnB1c2goXCJcIik7XG5cdFx0XHRcdFxuXHRcdFx0XHRyZXR1cm4gcGFpciBhcyBbc3RyaW5nLCBzdHJpbmddO1xuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdGZvciAoY29uc3QgcGFpciBvZiBwYWlycylcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgW3VybF0gPSBwYWlyO1xuXHRcdFx0XHRwYWlyWzBdID0gdGhpcy5yZXNvbHZlUGxhaW5VcmwodXJsKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0cmV0dXJuIHBhaXJzLm1hcChwYWlyID0+IHBhaXIuam9pbihcIiBcIikpLmpvaW4oYCwgYCk7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKiogKi9cblx0Y29uc3QgdXJsUHJvcGVydGllcyA9IG5ldyBTZXQoW1xuXHRcdFwiYmFja2dyb3VuZFwiLFxuXHRcdFwiYmFja2dyb3VuZC1pbWFnZVwiLFxuXHRcdFwiYm9yZGVyLWltYWdlXCIsXG5cdFx0XCJib3JkZXItaW1hZ2Utc291cmNlXCIsXG5cdFx0XCJsaXN0LXN0eWxlXCIsXG5cdFx0XCJsaXN0LXN0eWxlLWltYWdlXCIsXG5cdFx0XCJtYXNrXCIsXG5cdFx0XCJtYXNrLWltYWdlXCIsXG5cdFx0XCItd2Via2l0LW1hc2tcIixcblx0XHRcIi13ZWJraXQtbWFzay1pbWFnZVwiLFxuXHRcdFwiY29udGVudFwiXG5cdF0pO1xufVxuIiwiXG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5uYW1lc3BhY2UgV2ViZmVlZC5IdHRwXG57XG5cdC8qKlxuXHQgKiBNYWtlcyBhbiBIVFRQIHJlcXVlc3QgdG8gdGhlIHNwZWNpZmllZCBVUkkgYW5kIHJldHVybnNcblx0ICogdGhlIGhlYWRlcnMgYW5kIGEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGJvZHkuXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVxdWVzdChcblx0XHRyZWxhdGl2ZVVyaTogc3RyaW5nLCBcblx0XHRvcHRpb25zOiBJSHR0cFJlcXVlc3RPcHRpb25zID0ge30pXG5cdHtcblx0XHRyZWxhdGl2ZVVyaSA9IFVybC5yZXNvbHZlKHJlbGF0aXZlVXJpLCBVcmwuZ2V0Q3VycmVudCgpKTtcblx0XHRcblx0XHR0cnlcblx0XHR7XG5cdFx0XHRjb25zdCBhYyA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcblx0XHRcdGNvbnN0IGlkID0gc2V0VGltZW91dCgoKSA9PiBhYy5hYm9ydCgpLCByZXF1ZXN0VGltZW91dCk7XG5cdFx0XHRcblx0XHRcdGNvbnN0IGZldGNoUmVzdWx0ID0gYXdhaXQgd2luZG93LmZldGNoKHJlbGF0aXZlVXJpLCB7XG5cdFx0XHRcdG1ldGhvZDogb3B0aW9ucy5tZXRob2QgfHwgXCJHRVRcIixcblx0XHRcdFx0aGVhZGVyczogb3B0aW9ucy5oZWFkZXJzIHx8IHt9LFxuXHRcdFx0XHRtb2RlOiBcImNvcnNcIixcblx0XHRcdFx0c2lnbmFsOiBhYy5zaWduYWwsXG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0Y2xlYXJUaW1lb3V0KGlkKTtcblx0XHRcdFxuXHRcdFx0aWYgKCFmZXRjaFJlc3VsdC5vaylcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS5lcnJvcihcIkZldGNoIGZhaWxlZDogXCIgKyByZWxhdGl2ZVVyaSk7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRsZXQgYm9keSA9IFwiXCI7XG5cdFx0XHRcblx0XHRcdHRyeVxuXHRcdFx0e1xuXHRcdFx0XHRib2R5ID0gYXdhaXQgZmV0Y2hSZXN1bHQudGV4dCgpO1xuXHRcdFx0fVxuXHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHR7XG5cdFx0XHRcdGlmICghb3B0aW9ucy5xdWlldClcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKFwiRmV0Y2ggZmFpbGVkOiBcIiArIHJlbGF0aXZlVXJpKTtcblx0XHRcdFx0XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRoZWFkZXJzOiBmZXRjaFJlc3VsdC5oZWFkZXJzLFxuXHRcdFx0XHRib2R5LFxuXHRcdFx0fTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXHRcdFx0aWYgKCFvcHRpb25zLnF1aWV0KVxuXHRcdFx0XHRjb25zb2xlLmxvZyhcIkVycm9yIHdpdGggcmVxdWVzdDogXCIgKyByZWxhdGl2ZVVyaSk7XG5cdFx0XHRcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIGNhbmNlbGxpbmcgYW4gSFRUUCByZXF1ZXN0LiAqL1xuXHRleHBvcnQgbGV0IHJlcXVlc3RUaW1lb3V0ID0gNTAwO1xuXHRcblx0LyoqICovXG5cdGludGVyZmFjZSBJSHR0cFJlcXVlc3RPcHRpb25zXG5cdHtcblx0XHRtZXRob2Q/OiBzdHJpbmc7XG5cdFx0aGVhZGVycz86IEhlYWRlcnNJbml0O1xuXHRcdHF1aWV0PzogYm9vbGVhbjtcblx0fVxufVxuIiwiXG4vKipcbiAqIEBpbnRlcm5hbFxuICogQSBuYW1lc3BhY2Ugb2YgZnVuY3Rpb25zIHRoYXQgZGVhbCB3aXRoIHRoZSByZW9yZ2FuaXphdGlvblxuICogb2YgZG9jdW1lbnRzIGludG8gd2VsbC1jb250cm9sbGVkIDxzZWN0aW9uPiBlbGVtZW50cy5cbiAqL1xubmFtZXNwYWNlIFdlYmZlZWQuUmVvcmdhbml6ZXJcbntcblx0LyoqXG5cdCAqIEV4dHJhY3RzIGFuZCByZW9yZ2FuaXplcyAgYSByYW5nZSBvZiB0b3AtbGV2ZWwgPHNlY3Rpb24+IGVsZW1lbnRzXG5cdCAqIHByZXNlbnQgaW4gdGhlIHNwZWNpZmllZCBkb2N1bWVudC5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBjb21wb3NlU2VjdGlvbnMoXG5cdFx0YmFzZUhyZWY6IHN0cmluZyxcblx0XHRwYXJlbnQ6IFBhcmVudE5vZGUsXG5cdFx0cmFuZ2VTdGFydD86IG51bWJlcixcblx0XHRyYW5nZUVuZD86IG51bWJlcilcblx0e1xuXHRcdGNvbnN0IG1ldGFFbGVtZW50cyA9IHF1ZXJ5RWxlbWVudHMoXCJMSU5LLCBTVFlMRSwgTUVUQSwgQkFTRVwiLCBwYXJlbnQpO1xuXHRcdG1ldGFFbGVtZW50cy5tYXAoZSA9PiBlLnJlbW92ZSgpKTtcblx0XHRcblx0XHQvLyBJZiB0aGUgcGFyZW50IGlzIGFuIDxodG1sPiBlbGVtZW50LCB0aGVuIHdlIGNoYW5nZSB0aGUgcGFyZW50IHRvIHRoZVxuXHRcdC8vIDxib2R5PiB0YWcgd2l0aGluIHRoZSA8aHRtbD4gZWxlbWVudCwgYnV0IGZpcnN0IG1ha2Ugc3VyZSB0aGUgZG9jdW1lbnRcblx0XHQvLyBhY3R1YWxseSBoYXMgYSA8Ym9keT4gdGFnLiBJdCdzIHBvc3NpYmxlIHRoYXQgdGhlIGRvY3VtZW50IG1heSBub3QgaGF2ZVxuXHRcdC8vIGEgPGJvZHk+IHRhZyBpZiB0aGUgZG9jdW1lbnQgaXMgYmVpbmcgY29uc3RydWN0ZWQgaW5zaWRlIHNvbWUgc2ltdWxhdGVkXG5cdFx0Ly8gRE9NIGltcGxlbWVudGF0aW9uIChsaWtlIExpbmtlRE9NIC8gSGFwcHlET00pLlxuXHRcdGlmIChwYXJlbnQgaW5zdGFuY2VvZiBIVE1MSHRtbEVsZW1lbnQpXG5cdFx0e1xuXHRcdFx0Y29uc3QgbWF5YmVCb2R5ID0gQXJyYXkuZnJvbShwYXJlbnQuY2hpbGRyZW4pXG5cdFx0XHRcdC5maW5kKChlKTogZSBpcyBIVE1MQm9keUVsZW1lbnQgPT4gZSBpbnN0YW5jZW9mIEhUTUxCb2R5RWxlbWVudCk7XG5cdFx0XHRcblx0XHRcdGlmIChtYXliZUJvZHkpXG5cdFx0XHRcdHBhcmVudCA9IG1heWJlQm9keTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKHBhcmVudCBpbnN0YW5jZW9mIERvY3VtZW50KVxuXHRcdFx0cGFyZW50ID0gcGFyZW50LmJvZHk7XG5cdFx0XG5cdFx0Y29uc3Qgc2VjdGlvbnMgPSBBcnJheS5mcm9tKHBhcmVudC5jaGlsZHJlbilcblx0XHRcdC5maWx0ZXIoKGUpOiBlIGlzIEhUTUxFbGVtZW50ID0+IGUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcblx0XHRcdC5maWx0ZXIoZSA9PiBlLnRhZ05hbWUgPT09IFwiU0VDVElPTlwiKTtcblx0XHRcblx0XHRjb25zdCBzZWN0aW9uc1NsaWNlID0gc2VjdGlvbnMuc2xpY2UocmFuZ2VTdGFydCwgcmFuZ2VFbmQpO1xuXHRcdGNvbnZlcnRFbWJlZGRlZFVybHNUb0Fic29sdXRlKHBhcmVudCwgYmFzZUhyZWYpO1xuXHRcdGNvbnN0IHNoYWRvd1Jvb3RzOiBIVE1MRWxlbWVudFtdID0gW107XG5cdFx0XG5cdFx0Zm9yIChsZXQgaSA9IC0xOyArK2kgPCBzZWN0aW9uc1NsaWNlLmxlbmd0aDspXG5cdFx0e1xuXHRcdFx0Y29uc3Qgc2VjdGlvbiA9IHNlY3Rpb25zU2xpY2VbaV07XG5cdFx0XHRjb25zdCBzZWN0aW9uSW5kZXggPSBzZWN0aW9ucy5maW5kSW5kZXgoZSA9PiBlID09PSBzZWN0aW9uKTtcblx0XHRcdFxuXHRcdFx0aWYgKHNlY3Rpb24gPT09IHNlY3Rpb25zWzBdKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBTcGVjaWFsIHNhbml0aXphdGlvbnMgaXMgcmVxdWlyZWQgZm9yIHRoZSBwb3N0ZXIgc2VjdGlvblxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRjb25zdCBzaGFkb3dSb290ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblx0XHRcdHNoYWRvd1Jvb3QuY2xhc3NOYW1lID0gV2ViZmVlZC5zY2VuZUNsYXNzTmFtZTtcblx0XHRcdFxuXHRcdFx0Y29uc3Qgc2hhZG93ID0gc2hhZG93Um9vdC5hdHRhY2hTaGFkb3coeyBtb2RlOiBcIm9wZW5cIiB9KTtcblx0XHRcdGNvbnN0IG1ldGFDbG9uZXMgPSBtZXRhRWxlbWVudHMubWFwKGUgPT4gZS5jbG9uZU5vZGUodHJ1ZSkpO1xuXHRcdFx0c2hhZG93LmFwcGVuZChcblx0XHRcdFx0VXRpbC5jcmVhdGVTaGVldChcIlNFQ1RJT04geyBoZWlnaHQ6IDEwMCU7IH1cIiksXG5cdFx0XHRcdC4uLm1ldGFDbG9uZXNcblx0XHRcdCk7XG5cdFx0XHRcblx0XHRcdGNvbnN0IGZha2VCb2R5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJvZHlcIik7XG5cdFx0XHRmYWtlQm9keS5zdHlsZS5zZXRQcm9wZXJ0eShcImRpc3BsYXlcIiwgXCJjb250ZW50c1wiLCBcImltcG9ydGFudFwiKTtcblx0XHRcdHNoYWRvdy5hcHBlbmQoZmFrZUJvZHkpO1xuXHRcdFx0XG5cdFx0XHQvLyBDdXQgb2ZmIHRoZSB3aGVlbCBldmVudCwgYW5kIHRoZSB0b3VjaG1vdmUgZXZlbnQgd2hpY2ggaGFzIGFcblx0XHRcdC8vIHNpbWlsYXIgZWZmZWN0IGFzIGdldHRpbmcgcmlkIG9mIG92ZXJmbG93OiBhdXRvIG9yIG92ZXJmbG93OiBzY3JvbGxcblx0XHRcdC8vIG9uIGRlc2t0b3BzIGFuZCBvbiB0b3VjaCBkZXZpY2VzLiBUaGlzIGlzIGEgZmFpcmx5IGJsdW50IHRvb2wuIEl0XG5cdFx0XHQvLyBtYXkgbmVlZCB0byBnZXQgbW9yZSBjcmVhdGl2ZSBpbiB0aGUgZnV0dXJlIGZvciBhbGxvd2luZyBjZXJ0YWluXG5cdFx0XHQvLyBjYXNlcy4gQnV0IGZvciBub3cgaXQgc2hvdWxkIHN1ZmZpY2UuXG5cdFx0XHRmYWtlQm9keS5hZGRFdmVudExpc3RlbmVyKFwid2hlZWxcIiwgZXYgPT4gZXYucHJldmVudERlZmF1bHQoKSwgeyBjYXB0dXJlOiB0cnVlIH0pO1xuXHRcdFx0ZmFrZUJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLCBldiA9PiBldi5wcmV2ZW50RGVmYXVsdCgpLCB7IGNhcHR1cmU6IHRydWUgfSk7XG5cdFx0XHRcblx0XHRcdGZvciAobGV0IGkgPSAtMTsgKytpIDwgc2VjdGlvbnMubGVuZ3RoOylcblx0XHRcdHtcblx0XHRcdFx0aWYgKGkgPT09IHNlY3Rpb25JbmRleClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGZha2VCb2R5LmFwcGVuZChzZWN0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCBzaGltID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblx0XHRcdFx0XHRzaGltLnN0eWxlLnNldFByb3BlcnR5KFwiZGlzcGxheVwiLCBcIm5vbmVcIiwgXCJpbXBvcnRhbnRcIik7XG5cdFx0XHRcdFx0ZmFrZUJvZHkuYXBwZW5kKHNoaW0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHNoYWRvd1Jvb3RzLnB1c2goc2hhZG93Um9vdCk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBzaGFkb3dSb290cztcblx0fVxuXHRcblx0LyoqXG5cdCAqIFxuXHQgKi9cblx0ZnVuY3Rpb24gY29udmVydEVtYmVkZGVkVXJsc1RvQWJzb2x1dGUocGFyZW50OiBQYXJlbnROb2RlLCBiYXNlVXJsOiBzdHJpbmcpXG5cdHtcblx0XHRjb25zdCBlbGVtZW50cyA9IHF1ZXJ5RWxlbWVudHMoc2VsZWN0b3JGb3JVcmxzLCBwYXJlbnQpO1xuXHRcdFxuXHRcdGlmIChwYXJlbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcblx0XHRcdGVsZW1lbnRzLnVuc2hpZnQocGFyZW50KTtcblx0XHRcblx0XHRmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpXG5cdFx0e1xuXHRcdFx0Y29uc3QgYXR0cnMgPSBhdHRyc1dpdGhVcmxzXG5cdFx0XHRcdC5tYXAoYSA9PiBlbGVtZW50LmdldEF0dHJpYnV0ZU5vZGUoYSkpXG5cdFx0XHRcdC5maWx0ZXIoKGEpOiBhIGlzIEF0dHIgPT4gISFhKTtcblx0XHRcdFxuXHRcdFx0Zm9yIChjb25zdCBhdHRyaWJ1dGUgb2YgYXR0cnMpXG5cdFx0XHRcdGF0dHJpYnV0ZS52YWx1ZSA9IFVybC5yZXNvbHZlKGF0dHJpYnV0ZS52YWx1ZSwgYmFzZVVybCk7XG5cdFx0XHRcblx0XHRcdGZvciAoY29uc3QgcCBvZiBjc3NQcm9wZXJ0aWVzV2l0aFVybHMpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBwdiA9IGVsZW1lbnQuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShwKTtcblx0XHRcdFx0aWYgKHB2ID09PSBcIlwiKVxuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcblx0XHRcdFx0cHYgPSBwdi5yZXBsYWNlKC9cXGJ1cmxcXChcIi4rP1wiXFwpLywgc3Vic3RyID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCB1bndyYXBVcmwgPSBzdWJzdHIuc2xpY2UoNSwgLTIpO1xuXHRcdFx0XHRcdGNvbnN0IHVybCA9IFVybC5yZXNvbHZlKHVud3JhcFVybCwgYmFzZVVybCk7XG5cdFx0XHRcdFx0cmV0dXJuIGB1cmwoXCIke3VybH1cIilgO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0XG5cdFx0XHRcdGVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkocCwgcHYpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRcblx0Y29uc3QgYXR0cnNXaXRoVXJscyA9IFtcImhyZWZcIiwgXCJzcmNcIiwgXCJhY3Rpb25cIiwgXCJkYXRhLXNyY1wiXTtcblx0Y29uc3Qgc2VsZWN0b3JGb3JVcmxzID0gXCJMSU5LW2hyZWZdLCBBW2hyZWZdLCBJTUdbc3JjXSwgRk9STVthY3Rpb25dLCBTQ1JJUFRbc3JjXSwgW3N0eWxlXVwiO1xuXHRjb25zdCBjc3NQcm9wZXJ0aWVzV2l0aFVybHMgPSBbXG5cdFx0XCJiYWNrZ3JvdW5kXCIsXG5cdFx0XCJiYWNrZ3JvdW5kLWltYWdlXCIsXG5cdFx0XCJib3JkZXItaW1hZ2VcIixcblx0XHRcImJvcmRlci1pbWFnZS1zb3VyY2VcIixcblx0XHRcImNvbnRlbnRcIixcblx0XHRcImN1cnNvclwiLFxuXHRcdFwibGlzdC1zdHlsZS1pbWFnZVwiLFxuXHRcdFwibWFza1wiLFxuXHRcdFwibWFzay1pbWFnZVwiLFxuXHRcdFwib2Zmc2V0LXBhdGhcIixcblx0XHRcInNyY1wiLFxuXHRdO1xuXHRcblx0LyoqXG5cdCAqIFJldHVybnMgYW4gYXJyYXkgb2YgSFRNTEVsZW1lbnQgb2JqZWN0cyB0aGF0IG1hdGNoIHRoZSBzcGVjaWZpZWQgc2VsZWN0b3IsXG5cdCAqIG9wdGlvbmFsbHkgd2l0aGluIHRoZSBzcGVjaWZpZWQgcGFyZW50IG5vZGUuXG5cdCAqL1xuXHRmdW5jdGlvbiBxdWVyeUVsZW1lbnRzKHNlbGVjdG9yOiBzdHJpbmcsIGNvbnRhaW5lcjogUGFyZW50Tm9kZSA9IGRvY3VtZW50KVxuXHR7XG5cdFx0cmV0dXJuIEFycmF5LmZyb20oY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKSBhcyBIVE1MRWxlbWVudFtdO1xuXHR9XG59XG4iLCJcbm5hbWVzcGFjZSBXZWJmZWVkXG57XG5cdC8qKlxuXHQgKiBAaW50ZXJuYWxcblx0ICogQSBuYW1lc3BhY2Ugb2YgZnVuY3Rpb25zIHRoYXQgcGVyZm9ybSBVUkwgbWFuaXB1bGF0aW9uLlxuXHQgKi9cblx0ZXhwb3J0IG5hbWVzcGFjZSBVcmxcblx0e1xuXHRcdC8qKlxuXHRcdCAqIFBhcnNlcyB0aGUgc3BlY2lmaWVkIFVSTCBzdHJpbmcgYW5kIHJldHVybnMgYSBVUkwgb2JqZWN0LFxuXHRcdCAqIG9yIG51bGwgaWYgdGhlIFVSTCBmYWlscyB0byBwYXJzZS5cblx0XHQgKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gdHJ5UGFyc2UodXJsOiBzdHJpbmcsIGJhc2U/OiBzdHJpbmcpXG5cdFx0e1xuXHRcdFx0dHJ5XG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBuZXcgVVJMKHVybCwgYmFzZSk7XG5cdFx0XHR9XG5cdFx0XHRjYXRjaCAoZSkgeyB9XG5cdFx0XHRcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0XHRcblx0XHQvKipcblx0XHQgKiBSZXR1cm5zIHRoZSBVUkwgb2YgdGhlIGNvbnRhaW5pbmcgZm9sZGVyIG9mIHRoZSBzcGVjaWZpZWQgVVJMLlxuXHRcdCAqIFRoZSBwcm92aWRlZCBVUkwgbXVzdCBiZSB2YWxpZCwgb3IgYW4gZXhjZXB0aW9uIHdpbGwgYmUgdGhyb3duLlxuXHRcdCAqL1xuXHRcdGV4cG9ydCBmdW5jdGlvbiBmb2xkZXJPZih1cmw6IHN0cmluZylcblx0XHR7XG5cdFx0XHRjb25zdCBsbyA9IHRyeVBhcnNlKHVybCk7XG5cdFx0XHRpZiAoIWxvKVxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFxuXHRcdFx0Y29uc3QgcGFydHMgPSBsby5wYXRobmFtZS5zcGxpdChcIi9cIikuZmlsdGVyKHMgPT4gISFzKTtcblx0XHRcdGNvbnN0IGxhc3QgPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXTtcblx0XHRcdFxuXHRcdFx0aWYgKC9cXC5bYS16MC05XSskL2kudGVzdChsYXN0KSlcblx0XHRcdFx0cGFydHMucG9wKCk7XG5cdFx0XHRcblx0XHRcdGNvbnN0IHBhdGggPSBwYXJ0cy5qb2luKFwiL1wiKSArIFwiL1wiO1xuXHRcdFx0cmV0dXJuIHJlc29sdmUocGF0aCwgbG8ucHJvdG9jb2wgKyBcIi8vXCIgKyBsby5ob3N0KTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogUmV0dXJucyB0aGUgVVJMIHByb3ZpZGVkIGluIGZ1bGx5IHF1YWxpZmllZCBmb3JtLFxuXHRcdCAqIHVzaW5nIHRoZSBzcGVjaWZpZWQgYmFzZSBVUkwuXG5cdFx0ICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmUocGF0aDogc3RyaW5nLCBiYXNlOiBzdHJpbmcpXG5cdFx0e1xuXHRcdFx0aWYgKC9eW2Etel0rOi8udGVzdChwYXRoKSlcblx0XHRcdFx0cmV0dXJuIHBhdGg7XG5cdFx0XHRcblx0XHRcdHRyeVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoIWJhc2UuZW5kc1dpdGgoXCIvXCIpKVxuXHRcdFx0XHRcdGJhc2UgKz0gXCIvXCI7XG5cdFx0XHRcdFxuXHRcdFx0XHRyZXR1cm4gbmV3IFVSTChwYXRoLCBiYXNlKS50b1N0cmluZygpO1xuXHRcdFx0fVxuXHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHR7XG5cdFx0XHRcdGRlYnVnZ2VyO1xuXHRcdFx0XHRyZXR1cm4gbnVsbCBhcyBuZXZlcjtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogR2V0cyB0aGUgYmFzZSBVUkwgb2YgdGhlIGRvY3VtZW50IGxvYWRlZCBpbnRvIHRoZSBjdXJyZW50IGJyb3dzZXIgd2luZG93LlxuXHRcdCAqIEFjY291bnRzIGZvciBhbnkgSFRNTCA8YmFzZT4gdGFncyB0aGF0IG1heSBiZSBkZWZpbmVkIHdpdGhpbiB0aGUgZG9jdW1lbnQuXG5cdFx0ICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbnQoKVxuXHRcdHtcblx0XHRcdGlmIChzdG9yZWRVcmwpXG5cdFx0XHRcdHJldHVybiBzdG9yZWRVcmw7XG5cdFx0XHRcblx0XHRcdGxldCB1cmwgPSBVcmwuZm9sZGVyT2YoZG9jdW1lbnQuVVJMKSE7XG5cdFx0XHRcblx0XHRcdGNvbnN0IGJhc2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYmFzZVtocmVmXVwiKTtcblx0XHRcdGlmIChiYXNlKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBocmVmID0gYmFzZS5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpIHx8IFwiXCI7XG5cdFx0XHRcdGlmIChocmVmKVxuXHRcdFx0XHRcdHVybCA9IFVybC5yZXNvbHZlKGhyZWYsIHVybCk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHJldHVybiBzdG9yZWRVcmwgPSB1cmw7XG5cdFx0fVxuXHRcdGxldCBzdG9yZWRVcmwgPSBcIlwiO1xuXHR9XG59XG4iLCJcbi8qKlxuICogQGludGVybmFsXG4gKi9cbm5hbWVzcGFjZSBXZWJmZWVkLlV0aWxcbntcblx0LyoqICovXG5cdGV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTaGVldChjc3NUZXh0OiBzdHJpbmcpXG5cdHtcblx0XHRjb25zdCBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG5cdFx0Y29uc3QgaHRtbCA9IGA8c3R5bGU+JHtjc3NUZXh0fTwvc3R5bGU+YDtcblx0XHRjb25zdCBkb2MgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKGh0bWwsIFwidGV4dC9odG1sXCIpO1xuXHRcdHJldHVybiBkb2MucXVlcnlTZWxlY3RvcihcInN0eWxlXCIpITtcblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBmdW5jdGlvbiBoYXNoKHN0cjogc3RyaW5nKVxuXHR7XG5cdFx0bGV0IGhhc2ggPSAwO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdGNvbnN0IGNoYXIgPSBzdHIuY2hhckNvZGVBdChpKTtcblx0XHRcdGhhc2ggPSAoaGFzaCA8PCA1KSAtIGhhc2ggKyBjaGFyO1xuXHRcdFx0aGFzaCAmPSBoYXNoO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gbmV3IFVpbnQzMkFycmF5KFtoYXNoXSlbMF0udG9TdHJpbmcoMzYpO1xuXHR9XG59XG4iXX0=