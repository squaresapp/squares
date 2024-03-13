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
        return result ? getChecksumFromHeaders(result.headers) : null;
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
        const index = fetchResult.body
            .split("\n")
            .map(s => s.trim())
            .filter(s => !!s && !s.startsWith("#"))
            .filter((s) => !!Webfeed.Url.tryParse(s, feedIndexFolderUrl))
            .map(s => Webfeed.Url.resolve(s, feedIndexFolderUrl));
        const checksum = getChecksumFromHeaders(fetchResult.headers) || Webfeed.Util.hash(index.join(""));
        return { index, checksum };
    }
    Webfeed.downloadIndex = downloadIndex;
    /** */
    function getChecksumFromHeaders(headers) {
        const plain = [
            headers.get("ETag") || "",
            headers.get("Last-Modified") || "",
            headers.get("Content-Length") || "",
        ].join("");
        return plain ? Webfeed.Util.hash(plain) : "";
    }
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
        Http.requestTimeout = 2000;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViZmVlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2NvcmUvQXBpLnRzIiwiLi4vY29yZS9Gb3JlaWduRG9jdW1lbnRSZWFkZXIudHMiLCIuLi9jb3JlL0ZvcmVpZ25Eb2N1bWVudFNhbml0aXplci50cyIsIi4uL2NvcmUvSHR0cC50cyIsIi4uL2NvcmUvUmVvcmdhbml6ZXIudHMiLCIuLi9jb3JlL1VybC50cyIsIi4uL2NvcmUvVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBVSxPQUFPLENBK1BoQjtBQS9QRCxXQUFVLE9BQU87SUFFaEI7OztPQUdHO0lBQ0gsSUFBSSxPQUFPLFFBQVEsS0FBSyxXQUFXLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUNwRTtRQUNDLE1BQU0sY0FBYyxHQUFHLEdBQUcsRUFBRTtZQUUzQixNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQzdFLElBQUksZUFBZTtnQkFDbEIsU0FBUyxFQUFFLENBQUM7UUFDZCxDQUFDLENBQUE7UUFFRCxJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssVUFBVTtZQUNyQyxjQUFjLEVBQUUsQ0FBQTs7WUFFaEIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0tBQzdEO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFnQixTQUFTLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSTtRQUV4RCxRQUFRLEdBQUcsUUFBQSxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN4QyxJQUFJLENBQUMsUUFBUTtZQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFFbEQsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztRQUMzQixNQUFNLFFBQVEs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Q0FBQTtJQUNGLENBQUMsRUF4QmlCLElBQUksR0FBSixZQUFJLEtBQUosWUFBSSxRQXdCckI7QUFBRCxDQUFDLEVBeEJTLE9BQU8sS0FBUCxPQUFPLFFBd0JoQiIsInNvdXJjZXNDb250ZW50IjpbIlxubmFtZXNwYWNlIFdlYmZlZWRcbntcblx0LyoqXG5cdCAqIE1haW4gZW50cnkgcG9pbnQgZm9yIHdoZW4gdGhlIHJlYWxzLmpzIHNjcmlwdCBpcyBcblx0ICogZW1iZWRkZWQgd2l0aGluIGEgd2ViIHBhZ2UuXG5cdCAqL1xuXHRpZiAodHlwZW9mIGRvY3VtZW50ICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpXG5cdHtcblx0XHRjb25zdCBtYXliZUJvb3RzdHJhcCA9ICgpID0+XG5cdFx0e1xuXHRcdFx0Y29uc3Qgc2hvdWxkQm9vdHN0cmFwID0gISFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtd2ViZmVlZC1ib290c3RyYXBdXCIpO1xuXHRcdFx0aWYgKHNob3VsZEJvb3RzdHJhcClcblx0XHRcdFx0Ym9vdHN0cmFwKCk7XG5cdFx0fVxuXHRcdFxuXHRcdGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpXG5cdFx0XHRtYXliZUJvb3RzdHJhcCgpXG5cdFx0ZWxzZVxuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIG1heWJlQm9vdHN0cmFwKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIENvbnZlcnRzIHRoZSA8c2VjdGlvbj4gZWxlbWVudHMgZm91bmQgaW4gdGhlIGRvY3VtZW50J3MgYm9keVxuXHQgKiBpbnRvIHRoZSB3ZWJmZWVkLXNjcm9sbGFibGUgZm9ybWF0LiBUaGlzIGZ1bmN0aW9uIGlzIGludGVuZGVkXG5cdCAqIHRvIGJlIGNhbGxlZCBieSB3ZWJmZWVkIHBhZ2VzIHRoYXQgYXJlIGRpc3BsYXlpbmcgaW4gdGhlIGJyb3dzZXIsXG5cdCAqIHJhdGhlciB0aGFuIGluIGEgd2ViZmVlZCByZWFkZXIuXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gYm9vdHN0cmFwKGJhc2VIcmVmID0gd2luZG93LmxvY2F0aW9uLmhyZWYpXG5cdHtcblx0XHRiYXNlSHJlZiA9IFVybC5mb2xkZXJPZihiYXNlSHJlZikgfHwgXCJcIjtcblx0XHRpZiAoIWJhc2VIcmVmKVxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBiYXNlIFVSTDogXCIgKyBiYXNlSHJlZik7XG5cdFx0XG5cdFx0Y29uc3QgYm9keSA9IGRvY3VtZW50LmJvZHk7XG5cdFx0Y29uc3Qgc2VjdGlvbnMgPSBSZW9yZ2FuaXplci5jb21wb3NlU2VjdGlvbnMoYmFzZUhyZWYsIGJvZHkpO1xuXHRcdGJvZHkuYXBwZW5kKC4uLnNlY3Rpb25zKTtcblx0XHRib2R5LnN0eWxlLmRpc3BsYXkgPSBcImNvbnRlbnRzXCI7XG5cdFx0XG5cdFx0ZG9jdW1lbnQuaGVhZC5hcHBlbmQoXG5cdFx0XHRVdGlsLmNyZWF0ZVNoZWV0KGBIVE1MIHsgaGVpZ2h0OiAxMDAlOyB9YCksXG5cdFx0XHRXZWJmZWVkLmdldFN1cHBvcnRpbmdDc3MoKVxuXHRcdCk7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBQZXJmb3JtcyBhbiBIVFRQIEhFQUQgcmVxdWVzdCBvbiB0aGUgc3BlY2lmaWVkIGZlZWQgaW5kZXggZmlsZVxuXHQgKiBhbmQgcmV0dXJucyBhIHN0cmluZyB0aGF0IGNhbiBiZSB1c2VkIHRvIGRldGVybWluZSBpZiB0aGUgaW5kZXggaGFzXG5cdCAqIGhhcyBiZWVuIG1vZGlmaWVkIHNpbmNlIHRoZSBsYXN0IHBpbmcuXG5cdCAqIFxuXHQgKiBcblx0ICogVGhlIGZ1bmN0aW9uIHJldHVybnMgdGhlIGZpcnN0IEhUVFAgaGVhZGVyIGl0IGZpbmRzLCB0cmF2ZXJzaW5nXG5cdCAqIGluIHRoZSBvcmRlciBvZiBFVGFnLCBMYXN0LU1vZGlmaWVkLCBhbmQgZmluYWxseSBDb250ZW50LUxlbmd0aC5cblx0ICogV2ViIHNlcnZlcnMgYXJlIGV4cGVjdGVkIHRvIHJldHVybiBhdCBsZWFzdCBvbmUgb2YgdGhlc2UgSFRUUFxuXHQgKiBoZWFkZXIgdmFsdWVzIGluIG9yZGVyIHRvIGJlIHdlYmZlZWQtY29tcGxpYW50LlxuXHQgKiBcblx0ICogVGhlIGZ1bmN0aW9uIHJldHVybnMgbnVsbCBpZiB0aGUgc2VydmVyIHdhc24ndCByZWFjaGFibGUsIG9yIGFuXG5cdCAqIGVtcHR5IHN0cmluZyBpZiB0aGUgc2VydmVyIGRpZG4ndCByZXR1cm4gb25lIG9mIHRoZSBleHBlY3RlZCBcblx0ICogaGVhZGVycy5cblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBwaW5nKHVybDogc3RyaW5nKVxuXHR7XG5cdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgSHR0cC5yZXF1ZXN0KHVybCwgeyBtZXRob2Q6IFwiSEVBRFwiLCBxdWlldDogdHJ1ZSB9KTtcblx0XHRyZXR1cm4gcmVzdWx0ID8gZ2V0Q2hlY2tzdW1Gcm9tSGVhZGVycyhyZXN1bHQuaGVhZGVycykgOiBudWxsO1xuXHR9XG5cdFxuXHQvKipcblx0ICogUmVhZHMgdGhlIGluZGV4LnR4dCBmaWxlIGxvY2F0ZWQgYXQgdGhlIHNwZWNpZmllZCBVUkwsXG5cdCAqIGFuZCByZXR1cm5zIGEgbGlzdCBvZiBVUkxzIHdyaXR0ZW4gaW50byB0aGUgZmlsZS5cblx0ICogXG5cdCAqIFJldHVybnMgbnVsbCBpZiB0aGUgVVJMIHdhcyBpbnZhbGlkLCBvciBjb3VsZCBub3QgYmUgcmVhY2hlZC5cblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBkb3dubG9hZEluZGV4KHVybDogc3RyaW5nKVxuXHR7XG5cdFx0Y29uc3QgZmVlZEluZGV4Rm9sZGVyVXJsID0gVXJsLmZvbGRlck9mKHVybCk7XG5cdFx0aWYgKCFmZWVkSW5kZXhGb2xkZXJVcmwpXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcblx0XHRjb25zdCBmZXRjaFJlc3VsdCA9IGF3YWl0IEh0dHAucmVxdWVzdCh1cmwpO1xuXHRcdGlmICghZmV0Y2hSZXN1bHQpXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcblx0XHRjb25zdCB0eXBlID0gKGZldGNoUmVzdWx0LmhlYWRlcnMuZ2V0KFwiQ29udGVudC1UeXBlXCIpIHx8IFwiXCIpLnNwbGl0KFwiO1wiKVswXTtcblx0XHRpZiAodHlwZSAhPT0gXCJ0ZXh0L3BsYWluXCIpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5lcnJvcihcblx0XHRcdFx0XCJGZWVkIGF0IFVSTDogXCIgKyB1cmwgKyBcIndhcyByZXR1cm5lZCB3aXRoIGFuIGluY29ycmVjdCBcIiArXG5cdFx0XHRcdFwibWltZSB0eXBlLiBFeHBlY3RlZCBtaW1lIHR5cGUgaXMgXFxcInRleHQvcGxhaW5cXFwiLCBidXQgdGhlIG1pbWUgdHlwZSBcXFwiXCIgKyBcblx0XHRcdFx0dHlwZSArIFwiXFxcIiB3YXMgcmV0dXJuZWQuXCIpO1xuXHRcdFx0XHRcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0XHRcblx0XHRjb25zdCBpbmRleCA9IGZldGNoUmVzdWx0LmJvZHlcblx0XHRcdC5zcGxpdChcIlxcblwiKVxuXHRcdFx0Lm1hcChzID0+IHMudHJpbSgpKVxuXHRcdFx0LmZpbHRlcihzID0+ICEhcyAmJiAhcy5zdGFydHNXaXRoKFwiI1wiKSlcblx0XHRcdC5maWx0ZXIoKHMpOiBzIGlzIHN0cmluZyA9PiAhIVVybC50cnlQYXJzZShzLCBmZWVkSW5kZXhGb2xkZXJVcmwpKVxuXHRcdFx0Lm1hcChzID0+IFVybC5yZXNvbHZlKHMsIGZlZWRJbmRleEZvbGRlclVybCkpO1xuXHRcdFxuXHRcdGNvbnN0IGNoZWNrc3VtID0gZ2V0Q2hlY2tzdW1Gcm9tSGVhZGVycyhmZXRjaFJlc3VsdC5oZWFkZXJzKSB8fCBVdGlsLmhhc2goaW5kZXguam9pbihcIlwiKSk7XG5cdFx0cmV0dXJuIHsgaW5kZXgsIGNoZWNrc3VtIH07XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRmdW5jdGlvbiBnZXRDaGVja3N1bUZyb21IZWFkZXJzKGhlYWRlcnM6IEhlYWRlcnMpXG5cdHtcblx0XHRjb25zdCBwbGFpbiA9IFtcblx0XHRcdGhlYWRlcnMuZ2V0KFwiRVRhZ1wiKSB8fCBcIlwiLFxuXHRcdFx0aGVhZGVycy5nZXQoXCJMYXN0LU1vZGlmaWVkXCIpIHx8IFwiXCIsXG5cdFx0XHRoZWFkZXJzLmdldChcIkNvbnRlbnQtTGVuZ3RoXCIpIHx8IFwiXCIsXG5cdFx0XS5qb2luKFwiXCIpXG5cdFx0XG5cdFx0cmV0dXJuIHBsYWluID8gVXRpbC5oYXNoKHBsYWluKSA6IFwiXCI7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBSZWFkcyB0aGUgXCJkZXRhaWxzXCIgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQgZmVlZCBpbmRleC5cblx0ICogVGhlIGJlaGF2aW9yIG1pcnJvcnMgdGhlIHdlYmZlZWQgc3BlY2lmaWNhdGlvbjogaXQgbG9va3MgaW4gdGhlXG5cdCAqIHNhbWUgZm9sZGVyIGFzIHRoZSBpbmRleC50eHQgZmlsZSBmb3IgYSBkZWZhdWx0IGRvY3VtZW50LCB3aGljaFxuXHQgKiBpcyBleHBlY3RlZCB0byBiZSBhbiBIVE1MIGZpbGUuIEl0IHBhcnNlcyB0aGUgPGhlYWQ+IHNlY3Rpb24gb2Zcblx0ICogdGhpcyBIVE1MIGZpbGUgdG8gZXh0cmFjdCBvdXQgdGhlIDxtZXRhPiBhbmQgPGxpbms+IHRhZ3Mgb2Zcblx0ICogaW50ZXJlc3QuXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93bmxvYWREZXRhaWxzKGluZGV4VXJsOiBzdHJpbmcpXG5cdHtcblx0XHRjb25zdCBmZWVkSW5kZXhGb2xkZXJVcmwgPSBVcmwuZm9sZGVyT2YoaW5kZXhVcmwpO1xuXHRcdGlmICghZmVlZEluZGV4Rm9sZGVyVXJsKVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XG5cdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgSHR0cC5yZXF1ZXN0KGZlZWRJbmRleEZvbGRlclVybCk7XG5cdFx0aWYgKCFyZXN1bHQpXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcblx0XHRsZXQgZGF0ZSA9IHJlc3VsdC5oZWFkZXJzLmdldChcIkxhc3QtTW9kaWZpZWRcIikgfHwgXCJcIjtcblx0XHRsZXQgYXV0aG9yID0gXCJcIjtcblx0XHRsZXQgZGVzY3JpcHRpb24gPSBcIlwiO1xuXHRcdGxldCBpY29uID0gXCJcIjtcblx0XHRcblx0XHRjb25zdCB7IGJvZHkgfSA9IHJlc3VsdDtcblx0XHRjb25zdCByZWFkZXIgPSBuZXcgRm9yZWlnbkRvY3VtZW50UmVhZGVyKGJvZHkpO1xuXHRcdFxuXHRcdHJlYWRlci50cmFwRWxlbWVudChlbGVtZW50ID0+XG5cdFx0e1xuXHRcdFx0aWYgKGVsZW1lbnQubm9kZU5hbWUgPT09IFwiTUVUQVwiKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBuYW1lID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpPy50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKG5hbWUgPT09IFwiZGVzY3JpcHRpb25cIilcblx0XHRcdFx0XHRkZXNjcmlwdGlvbiA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiY29udGVudFwiKSB8fCBcIlwiO1xuXHRcdFx0XHRcblx0XHRcdFx0ZWxzZSBpZiAobmFtZSA9PT0gXCJhdXRob3JcIilcblx0XHRcdFx0XHRhdXRob3IgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShcImNvbnRlbnRcIikgfHwgXCJcIjtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGVsZW1lbnQubm9kZU5hbWUgPT09IFwiTElOS1wiKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCByZWwgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShcInJlbFwiKT8udG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChyZWwgPT09IFwiaWNvblwiKVxuXHRcdFx0XHRcdGljb24gPSBlbGVtZW50LmdldEF0dHJpYnV0ZShcImhyZWZcIikgfHwgXCJcIjtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRcblx0XHRyZWFkZXIucmVhZCgpO1xuXHRcdFxuXHRcdHJldHVybiB7IGRhdGUsIGF1dGhvciwgZGVzY3JpcHRpb24sIGljb24gfTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIERvd25sb2FkcyBhIHBhZ2UgZnJvbSB0aGUgc3BlY2lmaWVkIHBhZ2UgVVJMLiBSZXR1cm5zIHRoZSBwb3N0ZXIgZWxlbWVudCxcblx0ICogYXMgd2VsbCBhcyB0aGUgZnVsbCBhcnJheSBvZiBzZWN0aW9ucyBvZiB0aGUgcGFnZSAoaW5jbHVkaW5nIHRoZSBwb3N0ZXIpLlxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkUGFnZShwYWdlVXJsOiBzdHJpbmcpXG5cdHtcblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBIdHRwLnJlcXVlc3QocGFnZVVybCk7XG5cdFx0aWYgKCFyZXN1bHQpXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcblx0XHRjb25zdCBiYXNlSHJlZiA9IFVybC5mb2xkZXJPZihwYWdlVXJsKTtcblx0XHRpZiAoIWJhc2VIcmVmKVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XG5cdFx0Y29uc3QgY3JlYXRlRG9jID0gKCkgPT5cblx0XHR7XG5cdFx0XHRjb25zdCBzYW5pdGl6ZXIgPSBuZXcgRm9yZWlnbkRvY3VtZW50U2FuaXRpemVyKHJlc3VsdC5ib2R5LCBwYWdlVXJsKTtcblx0XHRcdGNvbnN0IGRvYyA9IHNhbml0aXplci5yZWFkKCk7XG5cdFx0XHRyZXR1cm4gZG9jO1xuXHRcdH07XG5cdFx0XG5cdFx0Y29uc3QgZG9jQSA9IGNyZWF0ZURvYygpO1xuXHRcdGNvbnN0IGRvY0IgPSBjcmVhdGVEb2MoKTtcblx0XHRjb25zdCBzZWN0aW9ucyA9IFJlb3JnYW5pemVyLmNvbXBvc2VTZWN0aW9ucyhiYXNlSHJlZiwgZG9jQSk7XG5cdFx0Y29uc3QgcG9zdGVyID0gUmVvcmdhbml6ZXIuY29tcG9zZVNlY3Rpb25zKGJhc2VIcmVmLCBkb2NCLCAwLCAxKVswXTtcblx0XHRyZXR1cm4gc2VjdGlvbnMubGVuZ3RoID09PSAwID8gbnVsbCA6IHsgcG9zdGVyLCBzZWN0aW9ucyB9O1xuXHR9XG5cdFxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgVVJMIG9mIHRoZSBjb250YWluaW5nIGZvbGRlciBvZiB0aGUgc3BlY2lmaWVkIFVSTC5cblx0ICogVGhlIHByb3ZpZGVkIFVSTCBtdXN0IGJlIHZhbGlkLCBvciBhbiBleGNlcHRpb24gd2lsbCBiZSB0aHJvd24uXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gZ2V0Rm9sZGVyT2YodXJsOiBzdHJpbmcpXG5cdHtcblx0XHRyZXR1cm4gVXJsLmZvbGRlck9mKHVybCk7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgPHN0eWxlPiB0YWcgdGhhdCBoYXMgdGhlIG1pbmltdW0gcmVxdWlyZWQgQ1NTIHRvXG5cdCAqIHJlbmRlciB0aGUgY2Fyb3VzZWwgdG8gdGhlIHNjcmVlbi5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBnZXRTdXBwb3J0aW5nQ3NzKGZyYW1lU2VsZWN0b3IgPSBcIkhUTUxcIilcblx0e1xuXHRcdHJldHVybiBVdGlsLmNyZWF0ZVNoZWV0KGBcblx0XHRcdCR7ZnJhbWVTZWxlY3Rvcn0ge1xuXHRcdFx0XHRzY3JvbGwtc25hcC10eXBlOiB5IG1hbmRhdG9yeTtcblx0XHRcdH1cblx0XHRcdC4ke3NjZW5lQ2xhc3NOYW1lfSB7XG5cdFx0XHRcdHBvc2l0aW9uOiByZWxhdGl2ZTtcblx0XHRcdFx0b3ZlcmZsb3c6IGhpZGRlbjtcblx0XHRcdFx0aGVpZ2h0OiAxMDAlO1xuXHRcdFx0XHRwYWRkaW5nLXRvcDogMC4wMnB4O1xuXHRcdFx0XHRwYWRkaW5nLWJvdHRvbTogMC4wMnB4O1xuXHRcdFx0XHRzY3JvbGwtc25hcC1hbGlnbjogc3RhcnQ7XG5cdFx0XHRcdHNjcm9sbC1zbmFwLXN0b3A6IGFsd2F5cztcblx0XHRcdH1cblx0XHRgKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJlbmRlcnMgYSBwbGFjZWhvbGRlciBwb3N0ZXIgZm9yIHdoZW4gdGhlIHBhZ2UgY291bGRuJ3QgYmUgbG9hZGVkLlxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEVycm9yUG9zdGVyKClcblx0e1xuXHRcdGNvbnN0IGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHRcdGNvbnN0IHMgPSBlLnN0eWxlO1xuXHRcdHMucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG5cdFx0cy50b3AgPSBcIjBcIjtcblx0XHRzLnJpZ2h0ID0gXCIwXCI7XG5cdFx0cy5ib3R0b20gPSBcIjBcIjtcblx0XHRzLmxlZnQgPSBcIjBcIjtcblx0XHRzLndpZHRoID0gXCJmaXQtY29udGVudFwiO1xuXHRcdHMuaGVpZ2h0ID0gXCJmaXQtY29udGVudFwiO1xuXHRcdHMubWFyZ2luID0gXCJhdXRvXCI7XG5cdFx0cy5mb250U2l6ZSA9IFwiMjB2d1wiO1xuXHRcdHMuZm9udFdlaWdodCA9IFwiOTAwXCI7XG5cdFx0ZS5hcHBlbmQobmV3IFRleHQoXCLinJVcIikpO1xuXHRcdHJldHVybiBlO1xuXHR9XG5cdFxuXHQvKipcblx0ICogVGhlIG5hbWUgb2YgdGhlIGNsYXNzIGFkZGVkIHRvIHRoZSBjb25zdHJ1Y3RlZCA8ZGl2PlxuXHQgKiBlbGVtZW50cyB0aGF0IGNyZWF0ZSB0aGUgc2NlbmVzLlxuXHQgKi9cblx0ZXhwb3J0IGNvbnN0IHNjZW5lQ2xhc3NOYW1lID0gXCItLXNjZW5lXCI7XG5cdFxuXHRkZWNsYXJlIGNvbnN0IG1vZHVsZTogYW55O1xuXHR0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIE9iamVjdC5hc3NpZ24obW9kdWxlLmV4cG9ydHMsIHsgV2ViZmVlZCB9KTtcbn1cbiIsIlxubmFtZXNwYWNlIFdlYmZlZWRcbntcblx0LyoqXG5cdCAqIEEgY2xhc3MgdGhhdCByZWFkcyBhIHJhdyBIVE1MIGRvY3VtZW50LCBhbmQgcHJvdmlkZXNcblx0ICogdGhlIGFiaWxpdHkgdG8gc2NhbiB0aGUgZG9jdW1lbnQgd2l0aCByZWdpc3RlcmVkIFwidHJhcHNcIixcblx0ICogd2hpY2ggYWxsb3cgdGhlIGRvY3VtZW50J3MgY29udGVudCB0byBiZSBtb2RpZmllZC5cblx0ICovXG5cdGV4cG9ydCBjbGFzcyBGb3JlaWduRG9jdW1lbnRSZWFkZXJcblx0e1xuXHRcdC8qKiAqL1xuXHRcdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgcmF3RG9jdW1lbnQ6IHN0cmluZykgeyB9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0dHJhcEVsZW1lbnQoZWxlbWVudEZuOiAoZWxlbWVudDogRWxlbWVudCkgPT4gRWxlbWVudCB8IHZvaWQpXG5cdFx0e1xuXHRcdFx0dGhpcy5lbGVtZW50Rm4gPSBlbGVtZW50Rm47XG5cdFx0fVxuXHRcdHByaXZhdGUgZWxlbWVudEZuID0gKGVsZW1lbnQ6IEVsZW1lbnQpOiBFbGVtZW50IHwgdm9pZCA9PiBlbGVtZW50O1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHRyYXBBdHRyaWJ1dGUoYXR0cmlidXRlRm46IChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIGVsZW1lbnQ6IEVsZW1lbnQpID0+IHN0cmluZyB8IHZvaWQpXG5cdFx0e1xuXHRcdFx0dGhpcy5hdHRyaWJ1dGVGbiA9IGF0dHJpYnV0ZUZuO1xuXHRcdH1cblx0XHRwcml2YXRlIGF0dHJpYnV0ZUZuID0gKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgZWxlbWVudDogRWxlbWVudCk6IHN0cmluZyB8IHZvaWQgPT4gdmFsdWU7XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0dHJhcFByb3BlcnR5KHByb3BlcnR5Rm46IChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpID0+IHN0cmluZylcblx0XHR7XG5cdFx0XHR0aGlzLnByb3BlcnR5Rm4gPSBwcm9wZXJ0eUZuO1xuXHRcdH1cblx0XHRwcml2YXRlIHByb3BlcnR5Rm4gPSAobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSA9PiBuYW1lO1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHJlYWQoKVxuXHRcdHtcblx0XHRcdGNvbnN0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcblx0XHRcdGNvbnN0IGRvYyA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcodGhpcy5yYXdEb2N1bWVudCwgXCJ0ZXh0L2h0bWxcIik7XG5cdFx0XHRjb25zdCB0cmFzaDogRWxlbWVudFtdID0gW107XG5cdFx0XHRcblx0XHRcdGZvciAoY29uc3Qgd2Fsa2VyID0gZG9jLmNyZWF0ZVRyZWVXYWxrZXIoZG9jKTs7KVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKCFub2RlKVxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKCEobm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQpKVxuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcblx0XHRcdFx0bGV0IGVsZW1lbnQgPSBub2RlIGFzIEVsZW1lbnQ7XG5cdFx0XHRcdFxuXHRcdFx0XHRjb25zdCByZXN1bHQgPSB0aGlzLmVsZW1lbnRGbihlbGVtZW50KTtcblx0XHRcdFx0aWYgKCFyZXN1bHQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0cmFzaC5wdXNoKGVsZW1lbnQpO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIE5vZGUgJiYgcmVzdWx0ICE9PSBlbGVtZW50KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZWxlbWVudC5yZXBsYWNlV2l0aChyZXN1bHQpO1xuXHRcdFx0XHRcdGVsZW1lbnQgPSByZXN1bHQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTFN0eWxlRWxlbWVudClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChlbGVtZW50LnNoZWV0KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHRoaXMucmVhZFNoZWV0KGVsZW1lbnQuc2hlZXQpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRjb25zdCBjc3NUZXh0OiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0XHRcdFx0Zm9yIChsZXQgaSA9IC0xLCBsZW4gPSBlbGVtZW50LnNoZWV0LmNzc1J1bGVzLmxlbmd0aDsgKytpIDwgbGVuOylcblx0XHRcdFx0XHRcdFx0Y3NzVGV4dC5wdXNoKGVsZW1lbnQuc2hlZXQuY3NzUnVsZXNbaV0uY3NzVGV4dCk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTFN0eWxlRWxlbWVudClcblx0XHRcdFx0XHRcdFx0ZWxlbWVudC50ZXh0Q29udGVudCA9IGNzc1RleHQuam9pbihcIlxcblwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdGZvciAoY29uc3QgYXR0ciBvZiBBcnJheS5mcm9tKGVsZW1lbnQuYXR0cmlidXRlcykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCBuZXdWYWx1ZSA9IHRoaXMuYXR0cmlidXRlRm4oYXR0ci5uYW1lLCBhdHRyLnZhbHVlLCBlbGVtZW50KTtcblx0XHRcdFx0XHRpZiAobmV3VmFsdWUgPT09IG51bGwgfHwgbmV3VmFsdWUgPT09IHVuZGVmaW5lZClcblx0XHRcdFx0XHRcdGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlTm9kZShhdHRyKTtcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyLm5hbWUsIG5ld1ZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0aWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBlbGVtZW50Lmhhc0F0dHJpYnV0ZShcInN0eWxlXCIpKVxuXHRcdFx0XHRcdHRoaXMucmVhZFN0eWxlKGVsZW1lbnQuc3R5bGUpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRmb3IgKGNvbnN0IGUgb2YgdHJhc2gpXG5cdFx0XHRcdGUucmVtb3ZlKCk7XG5cdFx0XHRcblx0XHRcdHJldHVybiBkb2M7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByaXZhdGUgcmVhZFNoZWV0KHNoZWV0OiBDU1NTdHlsZVNoZWV0KVxuXHRcdHtcblx0XHRcdGNvbnN0IHJlY3Vyc2UgPSAoZ3JvdXA6IENTU0dyb3VwaW5nUnVsZSB8IENTU1N0eWxlU2hlZXQpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGxlbiA9IGdyb3VwLmNzc1J1bGVzLmxlbmd0aDtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IC0xOyArK2kgPCBsZW47KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc3QgcnVsZSA9IGdyb3VwLmNzc1J1bGVzLml0ZW0oaSk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0aWYgKHJ1bGUgaW5zdGFuY2VvZiBDU1NHcm91cGluZ1J1bGUpXG5cdFx0XHRcdFx0XHRyZWN1cnNlKHJ1bGUpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGVsc2UgaWYgKHJ1bGUgaW5zdGFuY2VvZiBDU1NTdHlsZVJ1bGUpXG5cdFx0XHRcdFx0XHR0aGlzLnJlYWRTdHlsZShydWxlLnN0eWxlKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdFxuXHRcdFx0cmVjdXJzZShzaGVldCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByaXZhdGUgcmVhZFN0eWxlKHN0eWxlOiBDU1NTdHlsZURlY2xhcmF0aW9uKVxuXHRcdHtcblx0XHRcdGNvbnN0IG5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0XG5cdFx0XHRmb3IgKGxldCBuID0gLTE7ICsrbiA8IHN0eWxlLmxlbmd0aDspXG5cdFx0XHRcdG5hbWVzLnB1c2goc3R5bGVbbl0pO1xuXHRcdFx0XG5cdFx0XHRmb3IgKGNvbnN0IG5hbWUgb2YgbmFtZXMpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHZhbHVlID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKTtcblx0XHRcdFx0Y29uc3QgcHJpb3JpdHkgPSBzdHlsZS5nZXRQcm9wZXJ0eVByaW9yaXR5KG5hbWUpO1xuXHRcdFx0XHRjb25zdCByZXN1bHRWYWx1ZSA9IHRoaXMucHJvcGVydHlGbihuYW1lLCB2YWx1ZSk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAocmVzdWx0VmFsdWUgIT09IHZhbHVlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gVGhlIHByb3BlcnR5IGhhcyB0byBiZSByZW1vdmVkIGVpdGhlciB3YXksXG5cdFx0XHRcdFx0Ly8gYmVjYXVzZSBpZiB3ZSdyZSBzZXR0aW5nIGEgbmV3IHByb3BlcnR5IHdpdGhcblx0XHRcdFx0XHQvLyBhIGRpZmZlcmVudCBVUkwsIGl0IHdvbid0IGdldCBwcm9wZXJseSByZXBsYWNlZC5cblx0XHRcdFx0XHRzdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAocmVzdWx0VmFsdWUpXG5cdFx0XHRcdFx0XHRzdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCByZXN1bHRWYWx1ZSwgcHJpb3JpdHkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG4iLCJcbm5hbWVzcGFjZSBXZWJmZWVkXG57XG5cdC8qKlxuXHQgKiBAaW50ZXJuYWxcblx0ICogQSBjbGFzcyB0aGF0IHdyYXBzIGEgRm9yZWlnbkRvY3VtZW50UmVhZGVyLCBhbmQgd2hpY2ggY29udmVydHNcblx0ICogdGhlIGNvbnRlbnQgb2YgdGhlIHNwZWNpZmllZCByYXcgSFRNTCBkb2N1bWVudCBpbnRvIGEgZm9ybWF0XG5cdCAqIHdoaWNoIGlzIGFjY2VwdGFibGUgZm9yIGluamVjdGlvbiBpbnRvIGEgYmxvZy5cblx0ICovXG5cdGV4cG9ydCBjbGFzcyBGb3JlaWduRG9jdW1lbnRTYW5pdGl6ZXJcblx0e1xuXHRcdC8qKiAqL1xuXHRcdGNvbnN0cnVjdG9yKFxuXHRcdFx0cHJpdmF0ZSByZWFkb25seSBkb2N1bWVudENvbnRlbnQ6IHN0cmluZyxcblx0XHRcdHByaXZhdGUgcmVhZG9ubHkgYmFzZUhyZWY6IHN0cmluZylcblx0XHR7IH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRyZWFkKClcblx0XHR7XG5cdFx0XHRjb25zdCByZWFkZXIgPSBuZXcgRm9yZWlnbkRvY3VtZW50UmVhZGVyKHRoaXMuZG9jdW1lbnRDb250ZW50KTtcblx0XHRcdFxuXHRcdFx0cmVhZGVyLnRyYXBFbGVtZW50KGUgPT5cblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgdCA9IGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKHQgPT09IFwiZnJhbWVcIiB8fCB0ID09PSBcImZyYW1lc2V0XCIpXG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKHQgPT09IFwic2NyaXB0XCIgfHwgdCA9PT0gXCJpZnJhbWVcIiB8fCB0ID09PSBcInBvcnRhbFwiKVxuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XG5cdFx0XHRcdGlmICh0ID09PSBcIm5vc2NyaXB0XCIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGZvciAoY29uc3QgYXR0ciBvZiBBcnJheS5mcm9tKGRpdi5hdHRyaWJ1dGVzKSlcblx0XHRcdFx0XHRcdGRpdi5zZXRBdHRyaWJ1dGVOb2RlKGF0dHIpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGRpdi5hcHBlbmQoLi4uQXJyYXkuZnJvbShkaXYuY2hpbGRyZW4pKTtcblx0XHRcdFx0XHRyZXR1cm4gZGl2O1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRyZXR1cm4gZTtcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHRyZWFkZXIudHJhcEF0dHJpYnV0ZSgobmFtZSwgdmFsdWUsIGVsZW1lbnQpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGlmIChuYW1lLnN0YXJ0c1dpdGgoXCJvblwiKSlcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFxuXHRcdFx0XHRjb25zdCB0YWcgPSBlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChuYW1lID09PSBcInNyY3NldFwiKVxuXHRcdFx0XHRcdHJldHVybiB0aGlzLnJlc29sdmVTb3VyY2VTZXRVcmxzKHZhbHVlKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChuYW1lID09PSBcImhyZWZcIiB8fCBcblx0XHRcdFx0XHRuYW1lID09PSBcInNyY1wiIHx8XG5cdFx0XHRcdFx0KHRhZyA9PT0gXCJlbWJlZFwiICYmIG5hbWUgPT09IFwic291cmNlXCIpIHx8XG5cdFx0XHRcdFx0KHRhZyA9PT0gXCJ2aWRlb1wiICYmIG5hbWUgPT09IFwicG9zdGVyXCIpIHx8XG5cdFx0XHRcdFx0KHRhZyA9PT0gXCJvYmplY3RcIiAmJiBuYW1lID09PSBcImRhdGFcIikgfHxcblx0XHRcdFx0XHQodGFnID09PSBcImZvcm1cIiAmJiBuYW1lID09PSBcImFjdGlvblwiKSlcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5yZXNvbHZlUGxhaW5VcmwodmFsdWUpO1xuXHRcdFx0XHRcblx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdHJlYWRlci50cmFwUHJvcGVydHkoKG5hbWUsIHZhbHVlKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoIXVybFByb3BlcnRpZXMuaGFzKG5hbWUpKVxuXHRcdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdFx0XG5cdFx0XHRcdHJldHVybiB0aGlzLnJlc29sdmVDc3NVcmxzKHZhbHVlKTtcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4gcmVhZGVyLnJlYWQoKTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cHJpdmF0ZSByZXNvbHZlUGxhaW5VcmwocGxhaW5Vcmw6IHN0cmluZylcblx0XHR7XG5cdFx0XHRpZiAocGxhaW5Vcmwuc3RhcnRzV2l0aChcImRhdGE6XCIpIHx8XG5cdFx0XHRcdHBsYWluVXJsLnN0YXJ0c1dpdGgoXCJodHRwOlwiKSB8fFxuXHRcdFx0XHRwbGFpblVybC5zdGFydHNXaXRoKFwiaHR0cHM6XCIpIHx8XG5cdFx0XHRcdHBsYWluVXJsLnN0YXJ0c1dpdGgoXCIvXCIpIHx8XG5cdFx0XHRcdC9eW2EtelxcLV0rOi9nLnRlc3QocGxhaW5VcmwpKVxuXHRcdFx0XHRyZXR1cm4gcGxhaW5Vcmw7XG5cdFx0XHRcblx0XHRcdHJldHVybiBVcmwucmVzb2x2ZShwbGFpblVybCwgdGhpcy5iYXNlSHJlZik7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdHByaXZhdGUgcmVzb2x2ZUNzc1VybHMoY3NzVmFsdWU6IHN0cmluZylcblx0XHR7XG5cdFx0XHRjb25zdCByZWcgPSAvXFxidXJsXFwoW1wiJ10/KFteXFxzP1wiJyldKykvZ2k7XG5cdFx0XHRjb25zdCByZXBsYWNlZCA9IGNzc1ZhbHVlLnJlcGxhY2UocmVnLCAoc3Vic3RyaW5nLCB1cmwpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGxldCByZXNvbHZlZCA9IHRoaXMucmVzb2x2ZVBsYWluVXJsKHVybCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoc3Vic3RyaW5nLnN0YXJ0c1dpdGgoYHVybChcImApKVxuXHRcdFx0XHRcdHJlc29sdmVkID0gYHVybChcImAgKyByZXNvbHZlZDtcblx0XHRcdFx0XG5cdFx0XHRcdGVsc2UgaWYgKHN1YnN0cmluZy5zdGFydHNXaXRoKGB1cmwoYCkpXG5cdFx0XHRcdFx0cmVzb2x2ZWQgPSBgdXJsKGAgKyByZXNvbHZlZDtcblx0XHRcdFx0XG5cdFx0XHRcdHJldHVybiByZXNvbHZlZDtcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4gcmVwbGFjZWQ7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFJlc29sdmVzIFVSTHMgaW4gYSBzcmNzZXQgYXR0cmlidXRlLCB1c2luZyBhIG1ha2Utc2hpZnQgYWxnb3JpdGhtXG5cdFx0ICogdGhhdCBkb2Vzbid0IHN1cHBvcnQgY29tbWFzIGluIHRoZSBVUkwuXG5cdFx0ICovXG5cdFx0cHJpdmF0ZSByZXNvbHZlU291cmNlU2V0VXJscyhzcmNTZXRVcmxzOiBzdHJpbmcpXG5cdFx0e1xuXHRcdFx0Y29uc3QgcmF3UGFpcnMgPSBzcmNTZXRVcmxzLnNwbGl0KGAsYCk7XG5cdFx0XHRjb25zdCBwYWlycyA9IHJhd1BhaXJzLm1hcChyYXdQYWlyID0+XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHBhaXIgPSByYXdQYWlyLnRyaW0oKS5zcGxpdCgvXFxzKy8pO1xuXHRcdFx0XHRpZiAocGFpci5sZW5ndGggPT09IDEpXG5cdFx0XHRcdFx0cGFpci5wdXNoKFwiXCIpO1xuXHRcdFx0XHRcblx0XHRcdFx0cmV0dXJuIHBhaXIgYXMgW3N0cmluZywgc3RyaW5nXTtcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHRmb3IgKGNvbnN0IHBhaXIgb2YgcGFpcnMpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IFt1cmxdID0gcGFpcjtcblx0XHRcdFx0cGFpclswXSA9IHRoaXMucmVzb2x2ZVBsYWluVXJsKHVybCk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHJldHVybiBwYWlycy5tYXAocGFpciA9PiBwYWlyLmpvaW4oXCIgXCIpKS5qb2luKGAsIGApO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqICovXG5cdGNvbnN0IHVybFByb3BlcnRpZXMgPSBuZXcgU2V0KFtcblx0XHRcImJhY2tncm91bmRcIixcblx0XHRcImJhY2tncm91bmQtaW1hZ2VcIixcblx0XHRcImJvcmRlci1pbWFnZVwiLFxuXHRcdFwiYm9yZGVyLWltYWdlLXNvdXJjZVwiLFxuXHRcdFwibGlzdC1zdHlsZVwiLFxuXHRcdFwibGlzdC1zdHlsZS1pbWFnZVwiLFxuXHRcdFwibWFza1wiLFxuXHRcdFwibWFzay1pbWFnZVwiLFxuXHRcdFwiLXdlYmtpdC1tYXNrXCIsXG5cdFx0XCItd2Via2l0LW1hc2staW1hZ2VcIixcblx0XHRcImNvbnRlbnRcIlxuXHRdKTtcbn1cbiIsIlxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xubmFtZXNwYWNlIFdlYmZlZWQuSHR0cFxue1xuXHQvKipcblx0ICogTWFrZXMgYW4gSFRUUCByZXF1ZXN0IHRvIHRoZSBzcGVjaWZpZWQgVVJJIGFuZCByZXR1cm5zXG5cdCAqIHRoZSBoZWFkZXJzIGFuZCBhIHN0cmluZyBjb250YWluaW5nIHRoZSBib2R5LlxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlcXVlc3QoXG5cdFx0cmVsYXRpdmVVcmk6IHN0cmluZywgXG5cdFx0b3B0aW9uczogSUh0dHBSZXF1ZXN0T3B0aW9ucyA9IHt9KVxuXHR7XG5cdFx0cmVsYXRpdmVVcmkgPSBVcmwucmVzb2x2ZShyZWxhdGl2ZVVyaSwgVXJsLmdldEN1cnJlbnQoKSk7XG5cdFx0XG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0Y29uc3QgYWMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG5cdFx0XHRjb25zdCBpZCA9IHNldFRpbWVvdXQoKCkgPT4gYWMuYWJvcnQoKSwgcmVxdWVzdFRpbWVvdXQpO1xuXHRcdFx0XG5cdFx0XHRjb25zdCBmZXRjaFJlc3VsdCA9IGF3YWl0IHdpbmRvdy5mZXRjaChyZWxhdGl2ZVVyaSwge1xuXHRcdFx0XHRtZXRob2Q6IG9wdGlvbnMubWV0aG9kIHx8IFwiR0VUXCIsXG5cdFx0XHRcdGhlYWRlcnM6IG9wdGlvbnMuaGVhZGVycyB8fCB7fSxcblx0XHRcdFx0bW9kZTogXCJjb3JzXCIsXG5cdFx0XHRcdHNpZ25hbDogYWMuc2lnbmFsLFxuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdGNsZWFyVGltZW91dChpZCk7XG5cdFx0XHRcblx0XHRcdGlmICghZmV0Y2hSZXN1bHQub2spXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoXCJGZXRjaCBmYWlsZWQ6IFwiICsgcmVsYXRpdmVVcmkpO1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0bGV0IGJvZHkgPSBcIlwiO1xuXHRcdFx0XG5cdFx0XHR0cnlcblx0XHRcdHtcblx0XHRcdFx0Ym9keSA9IGF3YWl0IGZldGNoUmVzdWx0LnRleHQoKTtcblx0XHRcdH1cblx0XHRcdGNhdGNoIChlKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoIW9wdGlvbnMucXVpZXQpXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcihcIkZldGNoIGZhaWxlZDogXCIgKyByZWxhdGl2ZVVyaSk7XG5cdFx0XHRcdFxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0aGVhZGVyczogZmV0Y2hSZXN1bHQuaGVhZGVycyxcblx0XHRcdFx0Ym9keSxcblx0XHRcdH07XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblx0XHRcdGlmICghb3B0aW9ucy5xdWlldClcblx0XHRcdFx0Y29uc29sZS5sb2coXCJFcnJvciB3aXRoIHJlcXVlc3Q6IFwiICsgcmVsYXRpdmVVcmkpO1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblx0XG5cdC8qKiBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB3YWl0IGJlZm9yZSBjYW5jZWxsaW5nIGFuIEhUVFAgcmVxdWVzdC4gKi9cblx0ZXhwb3J0IGxldCByZXF1ZXN0VGltZW91dCA9IDIwMDA7XG5cdFxuXHQvKiogKi9cblx0aW50ZXJmYWNlIElIdHRwUmVxdWVzdE9wdGlvbnNcblx0e1xuXHRcdG1ldGhvZD86IHN0cmluZztcblx0XHRoZWFkZXJzPzogSGVhZGVyc0luaXQ7XG5cdFx0cXVpZXQ/OiBib29sZWFuO1xuXHR9XG59XG4iLCJcbi8qKlxuICogQGludGVybmFsXG4gKiBBIG5hbWVzcGFjZSBvZiBmdW5jdGlvbnMgdGhhdCBkZWFsIHdpdGggdGhlIHJlb3JnYW5pemF0aW9uXG4gKiBvZiBkb2N1bWVudHMgaW50byB3ZWxsLWNvbnRyb2xsZWQgPHNlY3Rpb24+IGVsZW1lbnRzLlxuICovXG5uYW1lc3BhY2UgV2ViZmVlZC5SZW9yZ2FuaXplclxue1xuXHQvKipcblx0ICogRXh0cmFjdHMgYW5kIHJlb3JnYW5pemVzICBhIHJhbmdlIG9mIHRvcC1sZXZlbCA8c2VjdGlvbj4gZWxlbWVudHNcblx0ICogcHJlc2VudCBpbiB0aGUgc3BlY2lmaWVkIGRvY3VtZW50LlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGNvbXBvc2VTZWN0aW9ucyhcblx0XHRiYXNlSHJlZjogc3RyaW5nLFxuXHRcdHBhcmVudDogUGFyZW50Tm9kZSxcblx0XHRyYW5nZVN0YXJ0PzogbnVtYmVyLFxuXHRcdHJhbmdlRW5kPzogbnVtYmVyKVxuXHR7XG5cdFx0Y29uc3QgbWV0YUVsZW1lbnRzID0gcXVlcnlFbGVtZW50cyhcIkxJTkssIFNUWUxFLCBNRVRBLCBCQVNFXCIsIHBhcmVudCk7XG5cdFx0bWV0YUVsZW1lbnRzLm1hcChlID0+IGUucmVtb3ZlKCkpO1xuXHRcdFxuXHRcdC8vIElmIHRoZSBwYXJlbnQgaXMgYW4gPGh0bWw+IGVsZW1lbnQsIHRoZW4gd2UgY2hhbmdlIHRoZSBwYXJlbnQgdG8gdGhlXG5cdFx0Ly8gPGJvZHk+IHRhZyB3aXRoaW4gdGhlIDxodG1sPiBlbGVtZW50LCBidXQgZmlyc3QgbWFrZSBzdXJlIHRoZSBkb2N1bWVudFxuXHRcdC8vIGFjdHVhbGx5IGhhcyBhIDxib2R5PiB0YWcuIEl0J3MgcG9zc2libGUgdGhhdCB0aGUgZG9jdW1lbnQgbWF5IG5vdCBoYXZlXG5cdFx0Ly8gYSA8Ym9keT4gdGFnIGlmIHRoZSBkb2N1bWVudCBpcyBiZWluZyBjb25zdHJ1Y3RlZCBpbnNpZGUgc29tZSBzaW11bGF0ZWRcblx0XHQvLyBET00gaW1wbGVtZW50YXRpb24gKGxpa2UgTGlua2VET00gLyBIYXBweURPTSkuXG5cdFx0aWYgKHBhcmVudCBpbnN0YW5jZW9mIEhUTUxIdG1sRWxlbWVudClcblx0XHR7XG5cdFx0XHRjb25zdCBtYXliZUJvZHkgPSBBcnJheS5mcm9tKHBhcmVudC5jaGlsZHJlbilcblx0XHRcdFx0LmZpbmQoKGUpOiBlIGlzIEhUTUxCb2R5RWxlbWVudCA9PiBlIGluc3RhbmNlb2YgSFRNTEJvZHlFbGVtZW50KTtcblx0XHRcdFxuXHRcdFx0aWYgKG1heWJlQm9keSlcblx0XHRcdFx0cGFyZW50ID0gbWF5YmVCb2R5O1xuXHRcdH1cblx0XHRcblx0XHRpZiAocGFyZW50IGluc3RhbmNlb2YgRG9jdW1lbnQpXG5cdFx0XHRwYXJlbnQgPSBwYXJlbnQuYm9keTtcblx0XHRcblx0XHRjb25zdCBzZWN0aW9ucyA9IEFycmF5LmZyb20ocGFyZW50LmNoaWxkcmVuKVxuXHRcdFx0LmZpbHRlcigoZSk6IGUgaXMgSFRNTEVsZW1lbnQgPT4gZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuXHRcdFx0LmZpbHRlcihlID0+IGUudGFnTmFtZSA9PT0gXCJTRUNUSU9OXCIpO1xuXHRcdFxuXHRcdGNvbnN0IHNlY3Rpb25zU2xpY2UgPSBzZWN0aW9ucy5zbGljZShyYW5nZVN0YXJ0LCByYW5nZUVuZCk7XG5cdFx0Y29udmVydEVtYmVkZGVkVXJsc1RvQWJzb2x1dGUocGFyZW50LCBiYXNlSHJlZik7XG5cdFx0Y29uc3Qgc2hhZG93Um9vdHM6IEhUTUxFbGVtZW50W10gPSBbXTtcblx0XHRcblx0XHRmb3IgKGxldCBpID0gLTE7ICsraSA8IHNlY3Rpb25zU2xpY2UubGVuZ3RoOylcblx0XHR7XG5cdFx0XHRjb25zdCBzZWN0aW9uID0gc2VjdGlvbnNTbGljZVtpXTtcblx0XHRcdGNvbnN0IHNlY3Rpb25JbmRleCA9IHNlY3Rpb25zLmZpbmRJbmRleChlID0+IGUgPT09IHNlY3Rpb24pO1xuXHRcdFx0XG5cdFx0XHRpZiAoc2VjdGlvbiA9PT0gc2VjdGlvbnNbMF0pXG5cdFx0XHR7XG5cdFx0XHRcdC8vIFNwZWNpYWwgc2FuaXRpemF0aW9ucyBpcyByZXF1aXJlZCBmb3IgdGhlIHBvc3RlciBzZWN0aW9uXG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGNvbnN0IHNoYWRvd1Jvb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHRcdFx0c2hhZG93Um9vdC5jbGFzc05hbWUgPSBXZWJmZWVkLnNjZW5lQ2xhc3NOYW1lO1xuXHRcdFx0XG5cdFx0XHRjb25zdCBzaGFkb3cgPSBzaGFkb3dSb290LmF0dGFjaFNoYWRvdyh7IG1vZGU6IFwib3BlblwiIH0pO1xuXHRcdFx0Y29uc3QgbWV0YUNsb25lcyA9IG1ldGFFbGVtZW50cy5tYXAoZSA9PiBlLmNsb25lTm9kZSh0cnVlKSk7XG5cdFx0XHRzaGFkb3cuYXBwZW5kKFxuXHRcdFx0XHRVdGlsLmNyZWF0ZVNoZWV0KFwiU0VDVElPTiB7IGhlaWdodDogMTAwJTsgfVwiKSxcblx0XHRcdFx0Li4ubWV0YUNsb25lc1xuXHRcdFx0KTtcblx0XHRcdFxuXHRcdFx0Y29uc3QgZmFrZUJvZHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYm9keVwiKTtcblx0XHRcdGZha2VCb2R5LnN0eWxlLnNldFByb3BlcnR5KFwiZGlzcGxheVwiLCBcImNvbnRlbnRzXCIsIFwiaW1wb3J0YW50XCIpO1xuXHRcdFx0c2hhZG93LmFwcGVuZChmYWtlQm9keSk7XG5cdFx0XHRcblx0XHRcdC8vIEN1dCBvZmYgdGhlIHdoZWVsIGV2ZW50LCBhbmQgdGhlIHRvdWNobW92ZSBldmVudCB3aGljaCBoYXMgYVxuXHRcdFx0Ly8gc2ltaWxhciBlZmZlY3QgYXMgZ2V0dGluZyByaWQgb2Ygb3ZlcmZsb3c6IGF1dG8gb3Igb3ZlcmZsb3c6IHNjcm9sbFxuXHRcdFx0Ly8gb24gZGVza3RvcHMgYW5kIG9uIHRvdWNoIGRldmljZXMuIFRoaXMgaXMgYSBmYWlybHkgYmx1bnQgdG9vbC4gSXRcblx0XHRcdC8vIG1heSBuZWVkIHRvIGdldCBtb3JlIGNyZWF0aXZlIGluIHRoZSBmdXR1cmUgZm9yIGFsbG93aW5nIGNlcnRhaW5cblx0XHRcdC8vIGNhc2VzLiBCdXQgZm9yIG5vdyBpdCBzaG91bGQgc3VmZmljZS5cblx0XHRcdGZha2VCb2R5LmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCBldiA9PiBldi5wcmV2ZW50RGVmYXVsdCgpLCB7IGNhcHR1cmU6IHRydWUgfSk7XG5cdFx0XHRmYWtlQm9keS5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsIGV2ID0+IGV2LnByZXZlbnREZWZhdWx0KCksIHsgY2FwdHVyZTogdHJ1ZSB9KTtcblx0XHRcdFxuXHRcdFx0Zm9yIChsZXQgaSA9IC0xOyArK2kgPCBzZWN0aW9ucy5sZW5ndGg7KVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoaSA9PT0gc2VjdGlvbkluZGV4KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZmFrZUJvZHkuYXBwZW5kKHNlY3Rpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0IHNoaW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHRcdFx0XHRcdHNoaW0uc3R5bGUuc2V0UHJvcGVydHkoXCJkaXNwbGF5XCIsIFwibm9uZVwiLCBcImltcG9ydGFudFwiKTtcblx0XHRcdFx0XHRmYWtlQm9keS5hcHBlbmQoc2hpbSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0c2hhZG93Um9vdHMucHVzaChzaGFkb3dSb290KTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIHNoYWRvd1Jvb3RzO1xuXHR9XG5cdFxuXHQvKipcblx0ICogXG5cdCAqL1xuXHRmdW5jdGlvbiBjb252ZXJ0RW1iZWRkZWRVcmxzVG9BYnNvbHV0ZShwYXJlbnQ6IFBhcmVudE5vZGUsIGJhc2VVcmw6IHN0cmluZylcblx0e1xuXHRcdGNvbnN0IGVsZW1lbnRzID0gcXVlcnlFbGVtZW50cyhzZWxlY3RvckZvclVybHMsIHBhcmVudCk7XG5cdFx0XG5cdFx0aWYgKHBhcmVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuXHRcdFx0ZWxlbWVudHMudW5zaGlmdChwYXJlbnQpO1xuXHRcdFxuXHRcdGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cylcblx0XHR7XG5cdFx0XHRjb25zdCBhdHRycyA9IGF0dHJzV2l0aFVybHNcblx0XHRcdFx0Lm1hcChhID0+IGVsZW1lbnQuZ2V0QXR0cmlidXRlTm9kZShhKSlcblx0XHRcdFx0LmZpbHRlcigoYSk6IGEgaXMgQXR0ciA9PiAhIWEpO1xuXHRcdFx0XG5cdFx0XHRmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBhdHRycylcblx0XHRcdFx0YXR0cmlidXRlLnZhbHVlID0gVXJsLnJlc29sdmUoYXR0cmlidXRlLnZhbHVlLCBiYXNlVXJsKTtcblx0XHRcdFxuXHRcdFx0Zm9yIChjb25zdCBwIG9mIGNzc1Byb3BlcnRpZXNXaXRoVXJscylcblx0XHRcdHtcblx0XHRcdFx0bGV0IHB2ID0gZWxlbWVudC5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHApO1xuXHRcdFx0XHRpZiAocHYgPT09IFwiXCIpXG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFxuXHRcdFx0XHRwdiA9IHB2LnJlcGxhY2UoL1xcYnVybFxcKFwiLis/XCJcXCkvLCBzdWJzdHIgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0IHVud3JhcFVybCA9IHN1YnN0ci5zbGljZSg1LCAtMik7XG5cdFx0XHRcdFx0Y29uc3QgdXJsID0gVXJsLnJlc29sdmUodW53cmFwVXJsLCBiYXNlVXJsKTtcblx0XHRcdFx0XHRyZXR1cm4gYHVybChcIiR7dXJsfVwiKWA7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRcblx0XHRcdFx0ZWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eShwLCBwdik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdFxuXHRjb25zdCBhdHRyc1dpdGhVcmxzID0gW1wiaHJlZlwiLCBcInNyY1wiLCBcImFjdGlvblwiLCBcImRhdGEtc3JjXCJdO1xuXHRjb25zdCBzZWxlY3RvckZvclVybHMgPSBcIkxJTktbaHJlZl0sIEFbaHJlZl0sIElNR1tzcmNdLCBGT1JNW2FjdGlvbl0sIFNDUklQVFtzcmNdLCBbc3R5bGVdXCI7XG5cdGNvbnN0IGNzc1Byb3BlcnRpZXNXaXRoVXJscyA9IFtcblx0XHRcImJhY2tncm91bmRcIixcblx0XHRcImJhY2tncm91bmQtaW1hZ2VcIixcblx0XHRcImJvcmRlci1pbWFnZVwiLFxuXHRcdFwiYm9yZGVyLWltYWdlLXNvdXJjZVwiLFxuXHRcdFwiY29udGVudFwiLFxuXHRcdFwiY3Vyc29yXCIsXG5cdFx0XCJsaXN0LXN0eWxlLWltYWdlXCIsXG5cdFx0XCJtYXNrXCIsXG5cdFx0XCJtYXNrLWltYWdlXCIsXG5cdFx0XCJvZmZzZXQtcGF0aFwiLFxuXHRcdFwic3JjXCIsXG5cdF07XG5cdFxuXHQvKipcblx0ICogUmV0dXJucyBhbiBhcnJheSBvZiBIVE1MRWxlbWVudCBvYmplY3RzIHRoYXQgbWF0Y2ggdGhlIHNwZWNpZmllZCBzZWxlY3Rvcixcblx0ICogb3B0aW9uYWxseSB3aXRoaW4gdGhlIHNwZWNpZmllZCBwYXJlbnQgbm9kZS5cblx0ICovXG5cdGZ1bmN0aW9uIHF1ZXJ5RWxlbWVudHMoc2VsZWN0b3I6IHN0cmluZywgY29udGFpbmVyOiBQYXJlbnROb2RlID0gZG9jdW1lbnQpXG5cdHtcblx0XHRyZXR1cm4gQXJyYXkuZnJvbShjb250YWluZXIucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpIGFzIEhUTUxFbGVtZW50W107XG5cdH1cbn1cbiIsIlxubmFtZXNwYWNlIFdlYmZlZWRcbntcblx0LyoqXG5cdCAqIEBpbnRlcm5hbFxuXHQgKiBBIG5hbWVzcGFjZSBvZiBmdW5jdGlvbnMgdGhhdCBwZXJmb3JtIFVSTCBtYW5pcHVsYXRpb24uXG5cdCAqL1xuXHRleHBvcnQgbmFtZXNwYWNlIFVybFxuXHR7XG5cdFx0LyoqXG5cdFx0ICogUGFyc2VzIHRoZSBzcGVjaWZpZWQgVVJMIHN0cmluZyBhbmQgcmV0dXJucyBhIFVSTCBvYmplY3QsXG5cdFx0ICogb3IgbnVsbCBpZiB0aGUgVVJMIGZhaWxzIHRvIHBhcnNlLlxuXHRcdCAqL1xuXHRcdGV4cG9ydCBmdW5jdGlvbiB0cnlQYXJzZSh1cmw6IHN0cmluZywgYmFzZT86IHN0cmluZylcblx0XHR7XG5cdFx0XHR0cnlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIG5ldyBVUkwodXJsLCBiYXNlKTtcblx0XHRcdH1cblx0XHRcdGNhdGNoIChlKSB7IH1cblx0XHRcdFxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFJldHVybnMgdGhlIFVSTCBvZiB0aGUgY29udGFpbmluZyBmb2xkZXIgb2YgdGhlIHNwZWNpZmllZCBVUkwuXG5cdFx0ICogVGhlIHByb3ZpZGVkIFVSTCBtdXN0IGJlIHZhbGlkLCBvciBhbiBleGNlcHRpb24gd2lsbCBiZSB0aHJvd24uXG5cdFx0ICovXG5cdFx0ZXhwb3J0IGZ1bmN0aW9uIGZvbGRlck9mKHVybDogc3RyaW5nKVxuXHRcdHtcblx0XHRcdGNvbnN0IGxvID0gdHJ5UGFyc2UodXJsKTtcblx0XHRcdGlmICghbG8pXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0XG5cdFx0XHRjb25zdCBwYXJ0cyA9IGxvLnBhdGhuYW1lLnNwbGl0KFwiL1wiKS5maWx0ZXIocyA9PiAhIXMpO1xuXHRcdFx0Y29uc3QgbGFzdCA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuXHRcdFx0XG5cdFx0XHRpZiAoL1xcLlthLXowLTldKyQvaS50ZXN0KGxhc3QpKVxuXHRcdFx0XHRwYXJ0cy5wb3AoKTtcblx0XHRcdFxuXHRcdFx0Y29uc3QgcGF0aCA9IHBhcnRzLmpvaW4oXCIvXCIpICsgXCIvXCI7XG5cdFx0XHRyZXR1cm4gcmVzb2x2ZShwYXRoLCBsby5wcm90b2NvbCArIFwiLy9cIiArIGxvLmhvc3QpO1xuXHRcdH1cblx0XHRcblx0XHQvKipcblx0XHQgKiBSZXR1cm5zIHRoZSBVUkwgcHJvdmlkZWQgaW4gZnVsbHkgcXVhbGlmaWVkIGZvcm0sXG5cdFx0ICogdXNpbmcgdGhlIHNwZWNpZmllZCBiYXNlIFVSTC5cblx0XHQgKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gcmVzb2x2ZShwYXRoOiBzdHJpbmcsIGJhc2U6IHN0cmluZylcblx0XHR7XG5cdFx0XHRpZiAoL15bYS16XSs6Ly50ZXN0KHBhdGgpKVxuXHRcdFx0XHRyZXR1cm4gcGF0aDtcblx0XHRcdFxuXHRcdFx0dHJ5XG5cdFx0XHR7XG5cdFx0XHRcdGlmICghYmFzZS5lbmRzV2l0aChcIi9cIikpXG5cdFx0XHRcdFx0YmFzZSArPSBcIi9cIjtcblx0XHRcdFx0XG5cdFx0XHRcdHJldHVybiBuZXcgVVJMKHBhdGgsIGJhc2UpLnRvU3RyaW5nKCk7XG5cdFx0XHR9XG5cdFx0XHRjYXRjaCAoZSlcblx0XHRcdHtcblx0XHRcdFx0ZGVidWdnZXI7XG5cdFx0XHRcdHJldHVybiBudWxsIGFzIG5ldmVyO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvKipcblx0XHQgKiBHZXRzIHRoZSBiYXNlIFVSTCBvZiB0aGUgZG9jdW1lbnQgbG9hZGVkIGludG8gdGhlIGN1cnJlbnQgYnJvd3NlciB3aW5kb3cuXG5cdFx0ICogQWNjb3VudHMgZm9yIGFueSBIVE1MIDxiYXNlPiB0YWdzIHRoYXQgbWF5IGJlIGRlZmluZWQgd2l0aGluIHRoZSBkb2N1bWVudC5cblx0XHQgKi9cblx0XHRleHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudCgpXG5cdFx0e1xuXHRcdFx0aWYgKHN0b3JlZFVybClcblx0XHRcdFx0cmV0dXJuIHN0b3JlZFVybDtcblx0XHRcdFxuXHRcdFx0bGV0IHVybCA9IFVybC5mb2xkZXJPZihkb2N1bWVudC5VUkwpITtcblx0XHRcdFxuXHRcdFx0Y29uc3QgYmFzZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJiYXNlW2hyZWZdXCIpO1xuXHRcdFx0aWYgKGJhc2UpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGhyZWYgPSBiYXNlLmdldEF0dHJpYnV0ZShcImhyZWZcIikgfHwgXCJcIjtcblx0XHRcdFx0aWYgKGhyZWYpXG5cdFx0XHRcdFx0dXJsID0gVXJsLnJlc29sdmUoaHJlZiwgdXJsKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0cmV0dXJuIHN0b3JlZFVybCA9IHVybDtcblx0XHR9XG5cdFx0bGV0IHN0b3JlZFVybCA9IFwiXCI7XG5cdH1cbn1cbiIsIlxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xubmFtZXNwYWNlIFdlYmZlZWQuVXRpbFxue1xuXHQvKiogKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNoZWV0KGNzc1RleHQ6IHN0cmluZylcblx0e1xuXHRcdGNvbnN0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcblx0XHRjb25zdCBodG1sID0gYDxzdHlsZT4ke2Nzc1RleHR9PC9zdHlsZT5gO1xuXHRcdGNvbnN0IGRvYyA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoaHRtbCwgXCJ0ZXh0L2h0bWxcIik7XG5cdFx0cmV0dXJuIGRvYy5xdWVyeVNlbGVjdG9yKFwic3R5bGVcIikhO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGhhc2goc3RyOiBzdHJpbmcpXG5cdHtcblx0XHRsZXQgaGFzaCA9IDA7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0Y29uc3QgY2hhciA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuXHRcdFx0aGFzaCA9IChoYXNoIDw8IDUpIC0gaGFzaCArIGNoYXI7XG5cdFx0XHRoYXNoICY9IGhhc2g7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBuZXcgVWludDMyQXJyYXkoW2hhc2hdKVswXS50b1N0cmluZygzNik7XG5cdH1cbn1cbiJdfQ==