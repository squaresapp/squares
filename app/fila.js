"use strict";
class Fila {
    components;
    /**
     * Call this method with a particular Fila backend on the left-hand side to
     * force it to be the default Fila form. For example FilaNode.use();
     */
    static use() { }
    /** */
    static setDefaults(backend, sep, cwd, temp) {
        this._backend = backend;
        this._sep = sep;
        this._cwd = cwd;
        this._temporary = temp;
    }
    /**
     * Assigns the file system backend that is used by all Fila objects.
     * This should be set once during initialization.
     */
    static get backend() {
        if (!this._backend)
            throw new Error("Backend not set.");
        return this._backend;
    }
    static _backend;
    /**
     * Path separator.
     */
    static get sep() {
        return this._sep;
    }
    static _sep = "/";
    /**
     * Gets the current working directory of the process.
     */
    static get cwd() {
        if (typeof this._cwd === "string")
            return this._cwd = Fila.new(this._cwd);
        return this._cwd;
    }
    static _cwd = "";
    /**
     *
     */
    static get temporary() {
        if (typeof this._temporary === "string")
            return this._temporary = Fila.new(this._temporary);
        return this._temporary;
    }
    static _temporary = "";
    /**
     * Returns a Fila instance from the specified path in the case when
     * a string is provided, or returns the Fila instance as-is when a Fila
     * object is provided.
     */
    static from(via) {
        return typeof via === "string" ? Fila.new(via) : via;
    }
    /**
     * Creates a new Fila instance that represents a file system object
     * at the specified path.
     */
    static new(...pathComponents) {
        const backend = Fila.backend;
        if (!backend)
            throw new Error("Fila backend not set.");
        pathComponents = pathComponents.filter(s => !!s);
        if (pathComponents.join("") === "/")
            return new backend(["/"]);
        if (pathComponents.length === 0 || pathComponents[0].startsWith("."))
            pathComponents.unshift(this.cwd.path);
        for (let i = -1; ++i < pathComponents.length;)
            pathComponents.splice(i, 1, ...pathComponents[i].split(this.sep));
        pathComponents = pathComponents.filter(s => !!s);
        pathComponents = Fila.normalize(pathComponents.join(this.sep)).split(this.sep);
        return new backend(pathComponents);
    }
    /** */
    constructor(components) {
        this.components = components;
    }
    /** */
    watch(a, b) {
        const recursive = a === "recursive";
        const callbackFn = b || a;
        return this.watchProtected(recursive, callbackFn);
    }
    /**
     * In the case when this Fila object represents a file, this method returns a
     * Fila object that represents the directory that contains said file.
     *
     * In the case when this Fila object represents a directory, this method
     * returns the current Fila object as-is.
     */
    async getDirectory() {
        if (await this.isDirectory())
            return this;
        return Fila.new(...this.up().components);
    }
    /**
     * Gets the file or directory name of the file system object being
     * represented by this Fila object.
     */
    get name() {
        return this.components.at(-1) || "";
    }
    /**
     * Get the file extension of the file being represented by this
     * Fila object, with the "." character.
     */
    get extension() {
        const name = this.name;
        const lastDot = name.lastIndexOf(".");
        return lastDot < 0 ? "" : name.slice(lastDot);
    }
    /**
     * Gets the fully-qualified path, including any file name to the
     * file system object being represented by this Fila object.
     */
    get path() {
        return Fila.sep + Fila.join(...this.components);
    }
    /**
     * Returns a Fila object that represents the first or nth containing
     * directory of the object that this Fila object represents.
     * Returns the this reference in the case when the
     */
    up(count = 1) {
        if (this.components.length < 2)
            return this;
        const parentComponents = this.components.slice(0, -count);
        return parentComponents.length > 0 ?
            Fila.new(...parentComponents) :
            Fila.new("/");
    }
    /**
     * Searches upward through the file system ancestry for a nested file.
     */
    async upscan(relativeFileName) {
        let ancestry = this;
        do {
            const maybe = ancestry.down(relativeFileName);
            if (await maybe.exists())
                return maybe;
            if (ancestry.components.length === 1)
                break;
            ancestry = ancestry.up();
        } while (ancestry.components.length > 0);
        return null;
    }
    /**
     * Returns a Fila object that represents a file or directory nested
     * within the current Fila object (which must be a directory).
     */
    down(...additionalComponents) {
        return Fila.new(...this.components, ...additionalComponents);
    }
}
(function (Fila) {
    /** */
    function join(...args) {
        if (args.length === 0)
            return ".";
        let joined;
        for (let i = 0; i < args.length; ++i) {
            let arg = args[i];
            if (arg.length > 0) {
                if (joined === undefined)
                    joined = arg;
                else
                    joined += "/" + arg;
            }
        }
        if (joined === undefined)
            return ".";
        return normalize(joined);
    }
    Fila.join = join;
    /** */
    function normalize(path) {
        if (path.length === 0)
            return ".";
        const isAbsolute = path.charCodeAt(0) === 47 /* Char.slash */;
        const trailingSeparator = path.charCodeAt(path.length - 1) === 47 /* Char.slash */;
        // Normalize the path
        path = normalizeStringPosix(path, !isAbsolute);
        if (path.length === 0 && !isAbsolute)
            path = ".";
        if (path.length > 0 && trailingSeparator)
            path += Fila.sep;
        if (isAbsolute)
            return Fila.sep + path;
        return path;
    }
    Fila.normalize = normalize;
    /** */
    function normalizeStringPosix(path, allowAboveRoot) {
        let res = "";
        let lastSegmentLength = 0;
        let lastSlash = -1;
        let dots = 0;
        let code;
        for (let i = 0; i <= path.length; ++i) {
            if (i < path.length)
                code = path.charCodeAt(i);
            else if (code === 47 /* Char.slash */)
                break;
            else
                code = 47 /* Char.slash */;
            if (code === 47 /* Char.slash */) {
                if (lastSlash === i - 1 || dots === 1) {
                    // NOOP
                }
                else if (lastSlash !== i - 1 && dots === 2) {
                    if (res.length < 2 ||
                        lastSegmentLength !== 2 ||
                        res.charCodeAt(res.length - 1) !== 46 /* Char.dot */ ||
                        res.charCodeAt(res.length - 2) !== 46 /* Char.dot */) {
                        if (res.length > 2) {
                            let lastSlashIndex = res.lastIndexOf(Fila.sep);
                            if (lastSlashIndex !== res.length - 1) {
                                if (lastSlashIndex === -1) {
                                    res = "";
                                    lastSegmentLength = 0;
                                }
                                else {
                                    res = res.slice(0, lastSlashIndex);
                                    lastSegmentLength = res.length - 1 - res.lastIndexOf(Fila.sep);
                                }
                                lastSlash = i;
                                dots = 0;
                                continue;
                            }
                        }
                        else if (res.length === 2 || res.length === 1) {
                            res = "";
                            lastSegmentLength = 0;
                            lastSlash = i;
                            dots = 0;
                            continue;
                        }
                    }
                    if (allowAboveRoot) {
                        if (res.length > 0)
                            res += "/..";
                        else
                            res = "..";
                        lastSegmentLength = 2;
                    }
                }
                else {
                    if (res.length > 0)
                        res += Fila.sep + path.slice(lastSlash + 1, i);
                    else
                        res = path.slice(lastSlash + 1, i);
                    lastSegmentLength = i - lastSlash - 1;
                }
                lastSlash = i;
                dots = 0;
            }
            else if (code === 46 /* Char.dot */ && dots !== -1) {
                ++dots;
            }
            else
                dots = -1;
        }
        return res;
    }
    /** */
    function relative(from, to) {
        if (from === to)
            return "";
        from = posix.resolve(from instanceof Fila ? from.path : from);
        to = posix.resolve(to instanceof Fila ? to.path : to);
        if (from === to)
            return "";
        // Trim any leading backslashes
        var fromStart = 1;
        for (; fromStart < from.length; ++fromStart)
            if (from.charCodeAt(fromStart) !== 47 /*/*/)
                break;
        var fromEnd = from.length;
        var fromLen = fromEnd - fromStart;
        // Trim any leading backslashes
        var toStart = 1;
        for (; toStart < to.length; ++toStart)
            if (to.charCodeAt(toStart) !== 47 /*/*/)
                break;
        var toEnd = to.length;
        var toLen = toEnd - toStart;
        // Compare paths to find the longest common path from root
        var length = fromLen < toLen ? fromLen : toLen;
        var lastCommonSep = -1;
        var i = 0;
        for (; i <= length; ++i) {
            if (i === length) {
                if (toLen > length) {
                    if (to.charCodeAt(toStart + i) === 47 /*/*/) {
                        // We get here if `from` is the exact base path for `to`.
                        // For example: from="/foo/bar"; to="/foo/bar/baz"
                        return to.slice(toStart + i + 1);
                    }
                    else if (i === 0) {
                        // We get here if `from` is the root
                        // For example: from="/"; to="/foo"
                        return to.slice(toStart + i);
                    }
                }
                else if (fromLen > length) {
                    if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
                        // We get here if `to` is the exact base path for `from`.
                        // For example: from="/foo/bar/baz"; to="/foo/bar"
                        lastCommonSep = i;
                    }
                    else if (i === 0) {
                        // We get here if `to` is the root.
                        // For example: from="/foo"; to="/"
                        lastCommonSep = 0;
                    }
                }
                break;
            }
            var fromCode = from.charCodeAt(fromStart + i);
            var toCode = to.charCodeAt(toStart + i);
            if (fromCode !== toCode)
                break;
            else if (fromCode === 47 /*/*/)
                lastCommonSep = i;
        }
        var out = "";
        // Generate the relative path based on the path difference between `to`
        // and `from`
        for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
            if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
                if (out.length === 0)
                    out += "..";
                else
                    out += "/..";
            }
        }
        // Lastly, append the rest of the destination (`to`) path that comes after
        // the common path parts
        if (out.length > 0)
            return out + to.slice(toStart + lastCommonSep);
        toStart += lastCommonSep;
        if (to.charCodeAt(toStart) === 47 /*/*/)
            ++toStart;
        return to.slice(toStart);
    }
    Fila.relative = relative;
    const posix = {
        resolve(...args) {
            var resolvedPath = "";
            var resolvedAbsolute = false;
            var cwd;
            for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
                var path;
                if (i >= 0)
                    path = args[i];
                else {
                    if (cwd === undefined && typeof process === "object")
                        cwd = process.cwd();
                    path = cwd;
                }
                // Skip empty entries
                if (path.length === 0)
                    continue;
                resolvedPath = path + "/" + resolvedPath;
                resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
            }
            // At this point the path should be resolved to a full absolute path, but
            // handle relative paths to be safe (might happen when process.cwd() fails)
            // Normalize the path
            resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);
            if (resolvedAbsolute) {
                if (resolvedPath.length > 0)
                    return "/" + resolvedPath;
                else
                    return "/";
            }
            else if (resolvedPath.length > 0)
                return resolvedPath;
            return ".";
        },
    };
    /** */
    let Char;
    (function (Char) {
        Char[Char["dot"] = 46] = "dot";
        Char[Char["slash"] = 47] = "slash";
    })(Char || (Char = {}));
    /** */
    let Event;
    (function (Event) {
        Event["create"] = "create";
        Event["modify"] = "modify";
        Event["delete"] = "delete";
    })(Event = Fila.Event || (Fila.Event = {}));
})(Fila || (Fila = {}));
//@ts-ignore
typeof module === "object" && Object.assign(module.exports, { Fila });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL0ZpbGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLE1BQWUsSUFBSTtJQXlHYTtJQXZHL0I7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBRWhCLE1BQU07SUFDSSxNQUFNLENBQUMsV0FBVyxDQUMzQixPQUFvQixFQUNwQixHQUFXLEVBQ1gsR0FBVyxFQUNYLElBQVk7UUFFWixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUN4QixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNoQixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNoQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUN4QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSxLQUFLLE9BQU87UUFFakIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRO1lBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUVyQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdEIsQ0FBQztJQUNPLE1BQU0sQ0FBQyxRQUFRLENBQXVCO0lBRTlDOztPQUVHO0lBQ0gsTUFBTSxLQUFLLEdBQUc7UUFFYixPQUFPLElBQUksQ0FBQyxJQUFrQixDQUFDO0lBQ2hDLENBQUM7SUFDTyxNQUFNLENBQUMsSUFBSSxHQUFXLEdBQUcsQ0FBQztJQUVsQzs7T0FFRztJQUNILE1BQU0sS0FBSyxHQUFHO1FBRWIsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUTtZQUNoQyxPQUFPLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFeEMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ2xCLENBQUM7SUFDTyxNQUFNLENBQUMsSUFBSSxHQUFrQixFQUFFLENBQUM7SUFF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QUMsRUFKVSxJQUFJLEtBQUosSUFBSSxRQUlkO0lBRUQsTUFBTTtJQUNOLElBQWtCLEtBS2pCO0lBTEQsV0FBa0IsS0FBSztRQUV0QiwwQkFBaUIsQ0FBQTtRQUNqQiwwQkFBaUIsQ0FBQTtRQUNqQiwwQkFBaUIsQ0FBQTtJQUNsQixDQUFDLEVBTGlCLEtBQUssR0FBTCxVQUFLLEtBQUwsVUFBSyxRQUt0QjtBQUNGLENBQUMsRUFuVVMsSUFBSSxLQUFKLElBQUksUUFtVWI7QUFFRCxZQUFZO0FBQ1osT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmFic3RyYWN0IGNsYXNzIEZpbGFcbntcblx0LyoqXG5cdCAqIENhbGwgdGhpcyBtZXRob2Qgd2l0aCBhIHBhcnRpY3VsYXIgRmlsYSBiYWNrZW5kIG9uIHRoZSBsZWZ0LWhhbmQgc2lkZSB0b1xuXHQgKiBmb3JjZSBpdCB0byBiZSB0aGUgZGVmYXVsdCBGaWxhIGZvcm0uIEZvciBleGFtcGxlIEZpbGFOb2RlLnVzZSgpO1xuXHQgKi9cblx0c3RhdGljIHVzZSgpIHsgfVxuXHRcblx0LyoqICovXG5cdHByb3RlY3RlZCBzdGF0aWMgc2V0RGVmYXVsdHMoXG5cdFx0YmFja2VuZDogdHlwZW9mIEZpbGEsXG5cdFx0c2VwOiBzdHJpbmcsXG5cdFx0Y3dkOiBzdHJpbmcsXG5cdFx0dGVtcDogc3RyaW5nKVxuXHR7XG5cdFx0dGhpcy5fYmFja2VuZCA9IGJhY2tlbmQ7XG5cdFx0dGhpcy5fc2VwID0gc2VwO1xuXHRcdHRoaXMuX2N3ZCA9IGN3ZDtcblx0XHR0aGlzLl90ZW1wb3JhcnkgPSB0ZW1wO1xuXHR9XG5cdFxuXHQvKipcblx0ICogQXNzaWducyB0aGUgZmlsZSBzeXN0ZW0gYmFja2VuZCB0aGF0IGlzIHVzZWQgYnkgYWxsIEZpbGEgb2JqZWN0cy5cblx0ICogVGhpcyBzaG91bGQgYmUgc2V0IG9uY2UgZHVyaW5nIGluaXRpYWxpemF0aW9uLlxuXHQgKi9cblx0c3RhdGljIGdldCBiYWNrZW5kKClcblx0e1xuXHRcdGlmICghdGhpcy5fYmFja2VuZClcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkJhY2tlbmQgbm90IHNldC5cIik7XG5cdFx0XG5cdFx0cmV0dXJuIHRoaXMuX2JhY2tlbmQ7XG5cdH1cblx0cHJpdmF0ZSBzdGF0aWMgX2JhY2tlbmQ6ICh0eXBlb2YgRmlsYSkgfCBudWxsO1xuXHRcblx0LyoqXG5cdCAqIFBhdGggc2VwYXJhdG9yLlxuXHQgKi9cblx0c3RhdGljIGdldCBzZXAoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3NlcCBhcyBcIlxcXFxcIiB8IFwiL1wiO1xuXHR9XG5cdHByaXZhdGUgc3RhdGljIF9zZXA6IHN0cmluZyA9IFwiL1wiO1xuXHRcblx0LyoqXG5cdCAqIEdldHMgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3Rvcnkgb2YgdGhlIHByb2Nlc3MuXG5cdCAqL1xuXHRzdGF0aWMgZ2V0IGN3ZCgpXG5cdHtcblx0XHRpZiAodHlwZW9mIHRoaXMuX2N3ZCA9PT0gXCJzdHJpbmdcIilcblx0XHRcdHJldHVybiB0aGlzLl9jd2QgPSBGaWxhLm5ldyh0aGlzLl9jd2QpO1xuXHRcdFxuXHRcdHJldHVybiB0aGlzLl9jd2Q7XG5cdH1cblx0cHJpdmF0ZSBzdGF0aWMgX2N3ZDogRmlsYSB8IHN0cmluZyA9IFwiXCI7XG5cdFxuXHQvKipcblx0ICogXG5cdCAqL1xuXHRzdGF0aWMgZ2V0IHRlbXBvcmFyeSgpXG5cdHtcblx0XHRpZiAodHlwZW9mIHRoaXMuX3RlbXBvcmFyeSA9PT0gXCJzdHJpbmdcIilcblx0XHRcdHJldHVybiB0aGlzLl90ZW1wb3JhcnkgPSBGaWxhLm5ldyh0aGlzLl90ZW1wb3JhcnkpO1xuXHRcdFxuXHRcdHJldHVybiB0aGlzLl90ZW1wb3Jhcnk7XG5cdH1cblx0cHJpdmF0ZSBzdGF0aWMgX3RlbXBvcmFyeTogRmlsYSB8IHN0cmluZyA9IFwiXCI7XG5cdFxuXHQvKipcblx0ICogUmV0dXJucyBhIEZpbGEgaW5zdGFuY2UgZnJvbSB0aGUgc3BlY2lmaWVkIHBhdGggaW4gdGhlIGNhc2Ugd2hlblxuXHQgKiBhIHN0cmluZyBpcyBwcm92aWRlZCwgb3IgcmV0dXJucyB0aGUgRmlsYSBpbnN0YW5jZSBhcy1pcyB3aGVuIGEgRmlsYVxuXHQgKiBvYmplY3QgaXMgcHJvdmlkZWQuXG5cdCAqL1xuXHRzdGF0aWMgZnJvbSh2aWE6IHN0cmluZyB8IEZpbGEpXG5cdHtcblx0XHRyZXR1cm4gdHlwZW9mIHZpYSA9PT0gXCJzdHJpbmdcIiA/IEZpbGEubmV3KHZpYSkgOiB2aWE7XG5cdH1cblx0XG5cdC8qKiBcblx0ICogQ3JlYXRlcyBhIG5ldyBGaWxhIGluc3RhbmNlIHRoYXQgcmVwcmVzZW50cyBhIGZpbGUgc3lzdGVtIG9iamVjdFxuXHQgKiBhdCB0aGUgc3BlY2lmaWVkIHBhdGguXG5cdCAqL1xuXHRzdGF0aWMgbmV3KC4uLnBhdGhDb21wb25lbnRzOiBzdHJpbmdbXSlcblx0e1xuXHRcdGNvbnN0IGJhY2tlbmQgPSBGaWxhLmJhY2tlbmQgYXMgYW55IGFzIG5ldyhwYXRoQ29tcG9uZW50czogc3RyaW5nW10pID0+IEZpbGE7XG5cdFx0aWYgKCFiYWNrZW5kKVxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRmlsYSBiYWNrZW5kIG5vdCBzZXQuXCIpO1xuXHRcdFxuXHRcdHBhdGhDb21wb25lbnRzID0gcGF0aENvbXBvbmVudHMuZmlsdGVyKHMgPT4gISFzKTtcblx0XHRcblx0XHRpZiAocGF0aENvbXBvbmVudHMuam9pbihcIlwiKSA9PT0gXCIvXCIpXG5cdFx0XHRyZXR1cm4gbmV3IGJhY2tlbmQoW1wiL1wiXSk7XG5cdFx0XG5cdFx0aWYgKHBhdGhDb21wb25lbnRzLmxlbmd0aCA9PT0gMCB8fCBwYXRoQ29tcG9uZW50c1swXS5zdGFydHNXaXRoKFwiLlwiKSlcblx0XHRcdHBhdGhDb21wb25lbnRzLnVuc2hpZnQodGhpcy5jd2QucGF0aCk7XG5cdFx0XG5cdFx0Zm9yIChsZXQgaSA9IC0xOyArK2kgPCBwYXRoQ29tcG9uZW50cy5sZW5ndGg7KVxuXHRcdFx0cGF0aENvbXBvbmVudHMuc3BsaWNlKGksIDEsIC4uLnBhdGhDb21wb25lbnRzW2ldLnNwbGl0KHRoaXMuc2VwKSk7XG5cdFx0XG5cdFx0cGF0aENvbXBvbmVudHMgPSBwYXRoQ29tcG9uZW50cy5maWx0ZXIocyA9PiAhIXMpO1xuXHRcdHBhdGhDb21wb25lbnRzID0gRmlsYS5ub3JtYWxpemUocGF0aENvbXBvbmVudHMuam9pbih0aGlzLnNlcCkpLnNwbGl0KHRoaXMuc2VwKTtcblx0XHRcblx0XHRyZXR1cm4gbmV3IGJhY2tlbmQocGF0aENvbXBvbmVudHMpO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0cHJvdGVjdGVkIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGNvbXBvbmVudHM6IHN0cmluZ1tdKSB7IH1cblx0XG5cdC8qKiAqL1xuXHRhYnN0cmFjdCByZWFkVGV4dCgpOiBQcm9taXNlPHN0cmluZz47XG5cdFxuXHQvKiogKi9cblx0YWJzdHJhY3QgcmVhZEJpbmFyeSgpOiBQcm9taXNlPEFycmF5QnVmZmVyPjtcblx0XG5cdC8qKiAqL1xuXHRhYnN0cmFjdCByZWFkRGlyZWN0b3J5KCk6IFByb21pc2U8RmlsYVtdPjtcblx0XG5cdC8qKiAqL1xuXHRhYnN0cmFjdCB3cml0ZVRleHQodGV4dDogc3RyaW5nLCBvcHRpb25zPzogRmlsYS5JV3JpdGVUZXh0T3B0aW9ucyk6IFByb21pc2U8dm9pZD47XG5cdFxuXHQvKiogKi9cblx0YWJzdHJhY3Qgd3JpdGVCaW5hcnkoYnVmZmVyOiBBcnJheUJ1ZmZlcik6IFByb21pc2U8dm9pZD47XG5cdFxuXHQvKiogKi9cblx0YWJzdHJhY3Qgd3JpdGVEaXJlY3RvcnkoKTogUHJvbWlzZTx2b2lkPjtcblx0XG5cdC8qKlxuXHQgKiBXcml0ZXMgYSBzeW1saW5rIGZpbGUgYXQgdGhlIGxvY2F0aW9uIHJlcHJlc2VudGVkIGJ5IHRoZSBzcGVjaWZpZWRcblx0ICogRmlsYSBvYmplY3QsIHRvIHRoZSBsb2NhdGlvbiBzcGVjaWZpZWQgYnkgdGhlIGN1cnJlbnQgRmlsYSBvYmplY3QuXG5cdCAqL1xuXHRhYnN0cmFjdCB3cml0ZVN5bWxpbmsoYXQ6IEZpbGEpOiBQcm9taXNlPHZvaWQ+O1xuXHRcblx0LyoqXG5cdCAqIERlbGV0ZXMgdGhlIGZpbGUgb3IgZGlyZWN0b3J5IHRoYXQgdGhpcyBGaWxhIG9iamVjdCByZXByZXNlbnRzLlxuXHQgKi9cblx0YWJzdHJhY3QgZGVsZXRlKCk6IFByb21pc2U8RXJyb3IgfCB2b2lkPjtcblx0XG5cdC8qKiAqL1xuXHRhYnN0cmFjdCBtb3ZlKHRhcmdldDogRmlsYSk6IFByb21pc2U8dm9pZD47XG5cdFxuXHQvKipcblx0ICogQ29waWVzIHRoZSBmaWxlIHRvIHRoZSBzcGVjaWZpZWQgbG9jYXRpb24sIGFuZCBjcmVhdGVzIGFueVxuXHQgKiBuZWNlc3NhcnkgZGlyZWN0b3JpZXMgYWxvbmcgdGhlIHdheS5cblx0ICovXG5cdGFic3RyYWN0IGNvcHkodGFyZ2V0OiBGaWxhKTogUHJvbWlzZTx2b2lkPjtcblx0XG5cdC8qKlxuXHQgKiBSZWN1cnNpdmVseSB3YXRjaGVzIHRoaXMgZm9sZGVyLCBhbmQgYWxsIG5lc3RlZCBmaWxlcyBjb250YWluZWRcblx0ICogd2l0aGluIGFsbCBzdWJmb2xkZXJzLiBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB0ZXJtaW5hdGVzXG5cdCAqIHRoZSB3YXRjaCBzZXJ2aWNlIHdoZW4gY2FsbGVkLlxuXHQgKi9cblx0d2F0Y2goXG5cdFx0cmVjdXJzaXZlOiBcInJlY3Vyc2l2ZVwiLFxuXHRcdGNhbGxiYWNrRm46IChldmVudDogRmlsYS5FdmVudCwgZmlsYTogRmlsYSkgPT4gdm9pZCk6ICgpID0+IHZvaWQ7XG5cdC8qKlxuXHQgKiBXYXRjaGVzIGZvciBjaGFuZ2VzIHRvIHRoZSBzcGVjaWZpZWQgZmlsZSBvciBmb2xkZXIuIFJldHVybnNcblx0ICogYSBmdW5jdGlvbiB0aGF0IHRlcm1pbmF0ZXMgdGhlIHdhdGNoIHNlcnZpY2Ugd2hlbiBjYWxsZWQuXG5cdCAqL1xuXHR3YXRjaChcblx0XHRjYWxsYmFja0ZuOiAoZXZlbnQ6IEZpbGEuRXZlbnQsIGZpbGE6IEZpbGEpID0+IHZvaWQpOiAoKSA9PiB2b2lkO1xuXHQvKiogKi9cblx0d2F0Y2goYTogYW55LCBiPzogKGV2ZW50OiBGaWxhLkV2ZW50LCBmaWxhOiBGaWxhKSA9PiB2b2lkKVxuXHR7XG5cdFx0Y29uc3QgcmVjdXJzaXZlID0gYSA9PT0gXCJyZWN1cnNpdmVcIjtcblx0XHRjb25zdCBjYWxsYmFja0ZuID0gYiB8fCBhO1xuXHRcdHJldHVybiB0aGlzLndhdGNoUHJvdGVjdGVkKHJlY3Vyc2l2ZSwgY2FsbGJhY2tGbik7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRwcm90ZWN0ZWQgYWJzdHJhY3Qgd2F0Y2hQcm90ZWN0ZWQoXG5cdFx0cmVjdXJzaXZlOiBib29sZWFuLCBcblx0XHRjYWxsYmFja0ZuOiAoZXZlbnQ6IEZpbGEuRXZlbnQsIGZpbGE6IEZpbGEpID0+IHZvaWQpOiAoKSA9PiB2b2lkO1xuXHRcblx0LyoqICovXG5cdGFic3RyYWN0IHJlbmFtZShuZXdOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+O1xuXHRcblx0LyoqICovXG5cdGFic3RyYWN0IGV4aXN0cygpOiBQcm9taXNlPGJvb2xlYW4+O1xuXHRcblx0LyoqICovXG5cdGFic3RyYWN0IGdldFNpemUoKTogUHJvbWlzZTxudW1iZXI+O1xuXHRcblx0LyoqICovXG5cdGFic3RyYWN0IGdldE1vZGlmaWVkVGlja3MoKTogUHJvbWlzZTxudW1iZXI+O1xuXHRcblx0LyoqICovXG5cdGFic3RyYWN0IGdldENyZWF0ZWRUaWNrcygpOiBQcm9taXNlPG51bWJlcj47XG5cdFxuXHQvKiogKi9cblx0YWJzdHJhY3QgZ2V0QWNjZXNzZWRUaWNrcygpOiBQcm9taXNlPG51bWJlcj47XG5cdFxuXHQvKiogKi9cblx0YWJzdHJhY3QgaXNEaXJlY3RvcnkoKTogUHJvbWlzZTxib29sZWFuPjtcblx0XG5cdC8qKlxuXHQgKiBJbiB0aGUgY2FzZSB3aGVuIHRoaXMgRmlsYSBvYmplY3QgcmVwcmVzZW50cyBhIGZpbGUsIHRoaXMgbWV0aG9kIHJldHVybnMgYSBcblx0ICogRmlsYSBvYmplY3QgdGhhdCByZXByZXNlbnRzIHRoZSBkaXJlY3RvcnkgdGhhdCBjb250YWlucyBzYWlkIGZpbGUuXG5cdCAqIFxuXHQgKiBJbiB0aGUgY2FzZSB3aGVuIHRoaXMgRmlsYSBvYmplY3QgcmVwcmVzZW50cyBhIGRpcmVjdG9yeSwgdGhpcyBtZXRob2Rcblx0ICogcmV0dXJucyB0aGUgY3VycmVudCBGaWxhIG9iamVjdCBhcy1pcy5cblx0ICovXG5cdGFzeW5jIGdldERpcmVjdG9yeSgpOiBQcm9taXNlPEZpbGE+XG5cdHtcblx0XHRpZiAoYXdhaXQgdGhpcy5pc0RpcmVjdG9yeSgpKVxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0XG5cdFx0cmV0dXJuIEZpbGEubmV3KC4uLnRoaXMudXAoKS5jb21wb25lbnRzKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIEdldHMgdGhlIGZpbGUgb3IgZGlyZWN0b3J5IG5hbWUgb2YgdGhlIGZpbGUgc3lzdGVtIG9iamVjdCBiZWluZ1xuXHQgKiByZXByZXNlbnRlZCBieSB0aGlzIEZpbGEgb2JqZWN0LlxuXHQgKi9cblx0Z2V0IG5hbWUoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5hdCgtMSkgfHwgXCJcIjtcblx0fVxuXHRcblx0LyoqXG5cdCAqIEdldCB0aGUgZmlsZSBleHRlbnNpb24gb2YgdGhlIGZpbGUgYmVpbmcgcmVwcmVzZW50ZWQgYnkgdGhpc1xuXHQgKiBGaWxhIG9iamVjdCwgd2l0aCB0aGUgXCIuXCIgY2hhcmFjdGVyLlxuXHQgKi9cblx0Z2V0IGV4dGVuc2lvbigpXG5cdHtcblx0XHRjb25zdCBuYW1lID0gdGhpcy5uYW1lO1xuXHRcdGNvbnN0IGxhc3REb3QgPSBuYW1lLmxhc3RJbmRleE9mKFwiLlwiKTtcblx0XHRyZXR1cm4gbGFzdERvdCA8IDAgPyBcIlwiIDogbmFtZS5zbGljZShsYXN0RG90KTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIEdldHMgdGhlIGZ1bGx5LXF1YWxpZmllZCBwYXRoLCBpbmNsdWRpbmcgYW55IGZpbGUgbmFtZSB0byB0aGVcblx0ICogZmlsZSBzeXN0ZW0gb2JqZWN0IGJlaW5nIHJlcHJlc2VudGVkIGJ5IHRoaXMgRmlsYSBvYmplY3QuXG5cdCAqL1xuXHRnZXQgcGF0aCgpXG5cdHtcblx0XHRyZXR1cm4gRmlsYS5zZXAgKyBGaWxhLmpvaW4oLi4udGhpcy5jb21wb25lbnRzKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJldHVybnMgYSBGaWxhIG9iamVjdCB0aGF0IHJlcHJlc2VudHMgdGhlIGZpcnN0IG9yIG50aCBjb250YWluaW5nXG5cdCAqIGRpcmVjdG9yeSBvZiB0aGUgb2JqZWN0IHRoYXQgdGhpcyBGaWxhIG9iamVjdCByZXByZXNlbnRzLlxuXHQgKiBSZXR1cm5zIHRoZSB0aGlzIHJlZmVyZW5jZSBpbiB0aGUgY2FzZSB3aGVuIHRoZSBcblx0ICovXG5cdHVwKGNvdW50ID0gMSlcblx0e1xuXHRcdGlmICh0aGlzLmNvbXBvbmVudHMubGVuZ3RoIDwgMilcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFxuXHRcdGNvbnN0IHBhcmVudENvbXBvbmVudHMgPSB0aGlzLmNvbXBvbmVudHMuc2xpY2UoMCwgLWNvdW50KTtcblx0XHRyZXR1cm4gcGFyZW50Q29tcG9uZW50cy5sZW5ndGggPiAwID9cblx0XHRcdEZpbGEubmV3KC4uLnBhcmVudENvbXBvbmVudHMpIDpcblx0XHRcdEZpbGEubmV3KFwiL1wiKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFNlYXJjaGVzIHVwd2FyZCB0aHJvdWdoIHRoZSBmaWxlIHN5c3RlbSBhbmNlc3RyeSBmb3IgYSBuZXN0ZWQgZmlsZS5cblx0ICovXG5cdGFzeW5jIHVwc2NhbihyZWxhdGl2ZUZpbGVOYW1lOiBzdHJpbmcpXG5cdHtcblx0XHRsZXQgYW5jZXN0cnkgPSB0aGlzIGFzIEZpbGE7XG5cdFx0XG5cdFx0ZG9cblx0XHR7XG5cdFx0XHRjb25zdCBtYXliZSA9IGFuY2VzdHJ5LmRvd24ocmVsYXRpdmVGaWxlTmFtZSk7XG5cdFx0XHRpZiAoYXdhaXQgbWF5YmUuZXhpc3RzKCkpXG5cdFx0XHRcdHJldHVybiBtYXliZTtcblx0XHRcdFxuXHRcdFx0aWYgKGFuY2VzdHJ5LmNvbXBvbmVudHMubGVuZ3RoID09PSAxKVxuXHRcdFx0XHRicmVhaztcblx0XHRcdFxuXHRcdFx0YW5jZXN0cnkgPSBhbmNlc3RyeS51cCgpO1xuXHRcdH1cblx0XHR3aGlsZSAoYW5jZXN0cnkuY29tcG9uZW50cy5sZW5ndGggPiAwKTtcblx0XHRcblx0XHRyZXR1cm4gbnVsbCBhcyBhbnkgYXMgRmlsYSB8IG51bGw7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgRmlsYSBvYmplY3QgdGhhdCByZXByZXNlbnRzIGEgZmlsZSBvciBkaXJlY3RvcnkgbmVzdGVkXG5cdCAqIHdpdGhpbiB0aGUgY3VycmVudCBGaWxhIG9iamVjdCAod2hpY2ggbXVzdCBiZSBhIGRpcmVjdG9yeSkuXG5cdCAqL1xuXHRkb3duKC4uLmFkZGl0aW9uYWxDb21wb25lbnRzOiBzdHJpbmdbXSlcblx0e1xuXHRcdHJldHVybiBGaWxhLm5ldyguLi50aGlzLmNvbXBvbmVudHMsIC4uLmFkZGl0aW9uYWxDb21wb25lbnRzKTtcblx0fVxufVxuXG5uYW1lc3BhY2UgRmlsYVxue1xuXHQvKiogKi9cblx0ZXhwb3J0IGludGVyZmFjZSBJV3JpdGVUZXh0T3B0aW9uc1xuXHR7XG5cdFx0cmVhZG9ubHkgYXBwZW5kOiBib29sZWFuO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGpvaW4oLi4uYXJnczogc3RyaW5nW10pXG5cdHtcblx0XHRpZiAoYXJncy5sZW5ndGggPT09IDApXG5cdFx0XHRyZXR1cm4gXCIuXCI7XG5cdFx0XG5cdFx0bGV0IGpvaW5lZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRcdFxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7ICsraSlcblx0XHR7XG5cdFx0XHRsZXQgYXJnID0gYXJnc1tpXTtcblx0XHRcdFxuXHRcdFx0aWYgKGFyZy5sZW5ndGggPiAwKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoam9pbmVkID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdFx0am9pbmVkID0gYXJnO1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0am9pbmVkICs9IFwiL1wiICsgYXJnO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRpZiAoam9pbmVkID09PSB1bmRlZmluZWQpXG5cdFx0XHRyZXR1cm4gXCIuXCI7XG5cdFx0XG5cdFx0cmV0dXJuIG5vcm1hbGl6ZShqb2luZWQpO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShwYXRoOiBzdHJpbmcpXG5cdHtcblx0XHRpZiAocGF0aC5sZW5ndGggPT09IDApXG5cdFx0XHRyZXR1cm4gXCIuXCI7XG5cdFx0XG5cdFx0Y29uc3QgaXNBYnNvbHV0ZSA9IHBhdGguY2hhckNvZGVBdCgwKSA9PT0gQ2hhci5zbGFzaDtcblx0XHRjb25zdCB0cmFpbGluZ1NlcGFyYXRvciA9IHBhdGguY2hhckNvZGVBdChwYXRoLmxlbmd0aCAtIDEpID09PSBDaGFyLnNsYXNoO1xuXHRcdFxuXHRcdC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuXHRcdHBhdGggPSBub3JtYWxpemVTdHJpbmdQb3NpeChwYXRoLCAhaXNBYnNvbHV0ZSk7XG5cdFx0XG5cdFx0aWYgKHBhdGgubGVuZ3RoID09PSAwICYmICFpc0Fic29sdXRlKVxuXHRcdFx0cGF0aCA9IFwiLlwiO1xuXHRcdFxuXHRcdGlmIChwYXRoLmxlbmd0aCA+IDAgJiYgdHJhaWxpbmdTZXBhcmF0b3IpXG5cdFx0XHRwYXRoICs9IEZpbGEuc2VwO1xuXHRcdFxuXHRcdGlmIChpc0Fic29sdXRlKVxuXHRcdFx0cmV0dXJuIEZpbGEuc2VwICsgcGF0aDtcblx0XHRcblx0XHRyZXR1cm4gcGF0aDtcblx0fVxuXHRcblx0LyoqICovXG5cdGZ1bmN0aW9uIG5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHBhdGg6IHN0cmluZywgYWxsb3dBYm92ZVJvb3Q6IGJvb2xlYW4pXG5cdHtcblx0XHRsZXQgcmVzID0gXCJcIjtcblx0XHRsZXQgbGFzdFNlZ21lbnRMZW5ndGggPSAwO1xuXHRcdGxldCBsYXN0U2xhc2ggPSAtMTtcblx0XHRsZXQgZG90cyA9IDA7XG5cdFx0bGV0IGNvZGU7XG5cdFx0XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPD0gcGF0aC5sZW5ndGg7ICsraSlcblx0XHR7XG5cdFx0XHRpZiAoaSA8IHBhdGgubGVuZ3RoKVxuXHRcdFx0XHRjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuXHRcdFx0XG5cdFx0XHRlbHNlIGlmIChjb2RlID09PSBDaGFyLnNsYXNoKVxuXHRcdFx0XHRicmVhaztcblx0XHRcdFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRjb2RlID0gQ2hhci5zbGFzaDtcblx0XHRcdFxuXHRcdFx0aWYgKGNvZGUgPT09IENoYXIuc2xhc2gpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChsYXN0U2xhc2ggPT09IGkgLSAxIHx8IGRvdHMgPT09IDEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBOT09QXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAobGFzdFNsYXNoICE9PSBpIC0gMSAmJiBkb3RzID09PSAyKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKHJlcy5sZW5ndGggPCAyIHx8IFxuXHRcdFx0XHRcdFx0bGFzdFNlZ21lbnRMZW5ndGggIT09IDIgfHwgXG5cdFx0XHRcdFx0XHRyZXMuY2hhckNvZGVBdChyZXMubGVuZ3RoIC0gMSkgIT09IENoYXIuZG90IHx8XG5cdFx0XHRcdFx0XHRyZXMuY2hhckNvZGVBdChyZXMubGVuZ3RoIC0gMikgIT09IENoYXIuZG90KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmIChyZXMubGVuZ3RoID4gMilcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IGxhc3RTbGFzaEluZGV4ID0gcmVzLmxhc3RJbmRleE9mKEZpbGEuc2VwKTtcblx0XHRcdFx0XHRcdFx0aWYgKGxhc3RTbGFzaEluZGV4ICE9PSByZXMubGVuZ3RoIC0gMSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGlmIChsYXN0U2xhc2hJbmRleCA9PT0gLTEpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0cmVzID0gXCJcIjtcblx0XHRcdFx0XHRcdFx0XHRcdGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHJlcyA9IHJlcy5zbGljZSgwLCBsYXN0U2xhc2hJbmRleCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRsYXN0U2VnbWVudExlbmd0aCA9IHJlcy5sZW5ndGggLSAxIC0gcmVzLmxhc3RJbmRleE9mKEZpbGEuc2VwKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0bGFzdFNsYXNoID0gaTtcblx0XHRcdFx0XHRcdFx0XHRkb3RzID0gMDtcblx0XHRcdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAocmVzLmxlbmd0aCA9PT0gMiB8fCByZXMubGVuZ3RoID09PSAxKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRyZXMgPSBcIlwiO1xuXHRcdFx0XHRcdFx0XHRsYXN0U2VnbWVudExlbmd0aCA9IDA7XG5cdFx0XHRcdFx0XHRcdGxhc3RTbGFzaCA9IGk7XG5cdFx0XHRcdFx0XHRcdGRvdHMgPSAwO1xuXHRcdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGFsbG93QWJvdmVSb290KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmIChyZXMubGVuZ3RoID4gMClcblx0XHRcdFx0XHRcdFx0cmVzICs9IFwiLy4uXCI7XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHJlcyA9IFwiLi5cIjtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0bGFzdFNlZ21lbnRMZW5ndGggPSAyO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAocmVzLmxlbmd0aCA+IDApXG5cdFx0XHRcdFx0XHRyZXMgKz0gRmlsYS5zZXAgKyBwYXRoLnNsaWNlKGxhc3RTbGFzaCArIDEsIGkpO1xuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHJlcyA9IHBhdGguc2xpY2UobGFzdFNsYXNoICsgMSwgaSk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0bGFzdFNlZ21lbnRMZW5ndGggPSBpIC0gbGFzdFNsYXNoIC0gMTtcblx0XHRcdFx0fVxuXHRcdFx0XHRsYXN0U2xhc2ggPSBpO1xuXHRcdFx0XHRkb3RzID0gMDtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGNvZGUgPT09IENoYXIuZG90ICYmIGRvdHMgIT09IC0xKVxuXHRcdFx0e1xuXHRcdFx0XHQrK2RvdHM7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGRvdHMgPSAtMTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlcztcblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBmdW5jdGlvbiByZWxhdGl2ZShmcm9tOiBzdHJpbmcgfCBGaWxhLCB0bzogc3RyaW5nIHwgRmlsYSlcblx0e1xuXHRcdGlmIChmcm9tID09PSB0bylcblx0XHRcdHJldHVybiBcIlwiO1xuXHRcdFxuXHRcdGZyb20gPSBwb3NpeC5yZXNvbHZlKGZyb20gaW5zdGFuY2VvZiBGaWxhID8gZnJvbS5wYXRoIDogZnJvbSk7XG5cdFx0dG8gPSBwb3NpeC5yZXNvbHZlKHRvIGluc3RhbmNlb2YgRmlsYSA/IHRvLnBhdGggOiB0byk7XG5cdFx0XG5cdFx0aWYgKGZyb20gPT09IHRvKVxuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0XG5cdFx0Ly8gVHJpbSBhbnkgbGVhZGluZyBiYWNrc2xhc2hlc1xuXHRcdHZhciBmcm9tU3RhcnQgPSAxO1xuXHRcdGZvciAoOyBmcm9tU3RhcnQgPCBmcm9tLmxlbmd0aDsgKytmcm9tU3RhcnQpIFxuXHRcdFx0aWYgKGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQpICE9PSA0NyAvKi8qLylcblx0XHRcdFx0YnJlYWs7XG5cdFx0XG5cdFx0dmFyIGZyb21FbmQgPSBmcm9tLmxlbmd0aDtcblx0XHR2YXIgZnJvbUxlbiA9IGZyb21FbmQgLSBmcm9tU3RhcnQ7XG5cdFx0XG5cdFx0Ly8gVHJpbSBhbnkgbGVhZGluZyBiYWNrc2xhc2hlc1xuXHRcdHZhciB0b1N0YXJ0ID0gMTtcblx0XHRmb3IgKDsgdG9TdGFydCA8IHRvLmxlbmd0aDsgKyt0b1N0YXJ0KVxuXHRcdFx0aWYgKHRvLmNoYXJDb2RlQXQodG9TdGFydCkgIT09IDQ3IC8qLyovKVxuXHRcdFx0XHRicmVhaztcblx0XHRcblx0XHR2YXIgdG9FbmQgPSB0by5sZW5ndGg7XG5cdFx0dmFyIHRvTGVuID0gdG9FbmQgLSB0b1N0YXJ0O1xuXHRcdFxuXHRcdC8vIENvbXBhcmUgcGF0aHMgdG8gZmluZCB0aGUgbG9uZ2VzdCBjb21tb24gcGF0aCBmcm9tIHJvb3Rcblx0XHR2YXIgbGVuZ3RoID0gZnJvbUxlbiA8IHRvTGVuID8gZnJvbUxlbiA6IHRvTGVuO1xuXHRcdHZhciBsYXN0Q29tbW9uU2VwID0gLTE7XG5cdFx0dmFyIGkgPSAwO1xuXHRcdGZvciAoOyBpIDw9IGxlbmd0aDsgKytpKVxuXHRcdHtcblx0XHRcdGlmIChpID09PSBsZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdGlmICh0b0xlbiA+IGxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICh0by5jaGFyQ29kZUF0KHRvU3RhcnQgKyBpKSA9PT0gNDcgLyovKi8gKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIFdlIGdldCBoZXJlIGlmIGBmcm9tYCBpcyB0aGUgZXhhY3QgYmFzZSBwYXRoIGZvciBgdG9gLlxuXHRcdFx0XHRcdFx0Ly8gRm9yIGV4YW1wbGU6IGZyb209XCIvZm9vL2JhclwiOyB0bz1cIi9mb28vYmFyL2JhelwiXG5cdFx0XHRcdFx0XHRyZXR1cm4gdG8uc2xpY2UodG9TdGFydCArIGkgKyAxKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoaSA9PT0gMClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBXZSBnZXQgaGVyZSBpZiBgZnJvbWAgaXMgdGhlIHJvb3Rcblx0XHRcdFx0XHRcdC8vIEZvciBleGFtcGxlOiBmcm9tPVwiL1wiOyB0bz1cIi9mb29cIlxuXHRcdFx0XHRcdFx0cmV0dXJuIHRvLnNsaWNlKHRvU3RhcnQgKyBpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAoZnJvbUxlbiA+IGxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0ICsgaSkgPT09IDQ3IC8qLyovIClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBXZSBnZXQgaGVyZSBpZiBgdG9gIGlzIHRoZSBleGFjdCBiYXNlIHBhdGggZm9yIGBmcm9tYC5cblx0XHRcdFx0XHRcdC8vIEZvciBleGFtcGxlOiBmcm9tPVwiL2Zvby9iYXIvYmF6XCI7IHRvPVwiL2Zvby9iYXJcIlxuXHRcdFx0XHRcdFx0bGFzdENvbW1vblNlcCA9IGk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKGkgPT09IDApXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gV2UgZ2V0IGhlcmUgaWYgYHRvYCBpcyB0aGUgcm9vdC5cblx0XHRcdFx0XHRcdC8vIEZvciBleGFtcGxlOiBmcm9tPVwiL2Zvb1wiOyB0bz1cIi9cIlxuXHRcdFx0XHRcdFx0bGFzdENvbW1vblNlcCA9IDA7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR2YXIgZnJvbUNvZGUgPSBmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0ICsgaSk7XG5cdFx0XHR2YXIgdG9Db2RlID0gdG8uY2hhckNvZGVBdCh0b1N0YXJ0ICsgaSk7XG5cdFx0XHRcblx0XHRcdGlmIChmcm9tQ29kZSAhPT0gdG9Db2RlKVxuXHRcdFx0XHRicmVhaztcblx0XHRcdFxuXHRcdFx0ZWxzZSBpZiAoZnJvbUNvZGUgPT09IDQ3IC8qLyovIClcblx0XHRcdFx0bGFzdENvbW1vblNlcCA9IGk7XG5cdFx0fVxuXHRcdFxuXHRcdHZhciBvdXQgPSBcIlwiO1xuXHRcdC8vIEdlbmVyYXRlIHRoZSByZWxhdGl2ZSBwYXRoIGJhc2VkIG9uIHRoZSBwYXRoIGRpZmZlcmVuY2UgYmV0d2VlbiBgdG9gXG5cdFx0Ly8gYW5kIGBmcm9tYFxuXHRcdGZvciAoaSA9IGZyb21TdGFydCArIGxhc3RDb21tb25TZXAgKyAxOyBpIDw9IGZyb21FbmQ7ICsraSlcblx0XHR7XG5cdFx0XHRpZiAoaSA9PT0gZnJvbUVuZCB8fCBmcm9tLmNoYXJDb2RlQXQoaSkgPT09IDQ3IC8qLyovIClcblx0XHRcdHtcblx0XHRcdFx0aWYgKG91dC5sZW5ndGggPT09IDApXG5cdFx0XHRcdFx0b3V0ICs9IFwiLi5cIjtcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdG91dCArPSBcIi8uLlwiO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBMYXN0bHksIGFwcGVuZCB0aGUgcmVzdCBvZiB0aGUgZGVzdGluYXRpb24gKGB0b2ApIHBhdGggdGhhdCBjb21lcyBhZnRlclxuXHRcdC8vIHRoZSBjb21tb24gcGF0aCBwYXJ0c1xuXHRcdGlmIChvdXQubGVuZ3RoID4gMClcblx0XHRcdHJldHVybiBvdXQgKyB0by5zbGljZSh0b1N0YXJ0ICsgbGFzdENvbW1vblNlcCk7XG5cdFx0XG5cdFx0dG9TdGFydCArPSBsYXN0Q29tbW9uU2VwO1xuXHRcdGlmICh0by5jaGFyQ29kZUF0KHRvU3RhcnQpID09PSA0NyAvKi8qLyApXG5cdFx0XHQrK3RvU3RhcnQ7XG5cdFx0XG5cdFx0cmV0dXJuIHRvLnNsaWNlKHRvU3RhcnQpO1xuXHR9XG5cdFxuXHRjb25zdCBwb3NpeCA9IHtcblx0XHRyZXNvbHZlKC4uLmFyZ3M6IHN0cmluZ1tdKVxuXHRcdHtcblx0XHRcdHZhciByZXNvbHZlZFBhdGggPSBcIlwiO1xuXHRcdFx0dmFyIHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcblx0XHRcdHZhciBjd2Q7XG5cdFx0XHRcblx0XHRcdGZvciAodmFyIGkgPSBhcmdzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSlcblx0XHRcdHtcblx0XHRcdFx0dmFyIHBhdGg7XG5cdFx0XHRcdGlmIChpID49IDApXG5cdFx0XHRcdFx0cGF0aCA9IGFyZ3NbaV07XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChjd2QgPT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIilcblx0XHRcdFx0XHRcdGN3ZCA9IHByb2Nlc3MuY3dkKCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0cGF0aCA9IGN3ZDtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gU2tpcCBlbXB0eSBlbnRyaWVzXG5cdFx0XHRcdGlmIChwYXRoLmxlbmd0aCA9PT0gMClcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XG5cdFx0XHRcdHJlc29sdmVkUGF0aCA9IHBhdGggKyBcIi9cIiArIHJlc29sdmVkUGF0aDtcblx0XHRcdFx0cmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckNvZGVBdCgwKSA9PT0gNDcgLyovKi87XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vIEF0IHRoaXMgcG9pbnQgdGhlIHBhdGggc2hvdWxkIGJlIHJlc29sdmVkIHRvIGEgZnVsbCBhYnNvbHV0ZSBwYXRoLCBidXRcblx0XHRcdC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRocyB0byBiZSBzYWZlIChtaWdodCBoYXBwZW4gd2hlbiBwcm9jZXNzLmN3ZCgpIGZhaWxzKVxuXHRcdFx0XG5cdFx0XHQvLyBOb3JtYWxpemUgdGhlIHBhdGhcblx0XHRcdHJlc29sdmVkUGF0aCA9IG5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHJlc29sdmVkUGF0aCwgIXJlc29sdmVkQWJzb2x1dGUpO1xuXHRcdFx0XG5cdFx0XHRpZiAocmVzb2x2ZWRBYnNvbHV0ZSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKHJlc29sdmVkUGF0aC5sZW5ndGggPiAwKVxuXHRcdFx0XHRcdHJldHVybiBcIi9cIiArIHJlc29sdmVkUGF0aDtcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHJldHVybiBcIi9cIjtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHJlc29sdmVkUGF0aC5sZW5ndGggPiAwKVxuXHRcdFx0XHRyZXR1cm4gcmVzb2x2ZWRQYXRoO1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4gXCIuXCI7XG5cdFx0fSxcblx0fTtcblx0XG5cdGRlY2xhcmUgY29uc3QgcHJvY2VzczogYW55O1xuXHRcblx0LyoqICovXG5cdGNvbnN0IGVudW0gQ2hhclxuXHR7XG5cdFx0ZG90ID0gNDYsXG5cdFx0c2xhc2ggPSA0Nyxcblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBjb25zdCBlbnVtIEV2ZW50XG5cdHtcblx0XHRjcmVhdGUgPSBcImNyZWF0ZVwiLFxuXHRcdG1vZGlmeSA9IFwibW9kaWZ5XCIsXG5cdFx0ZGVsZXRlID0gXCJkZWxldGVcIixcblx0fVxufVxuXG4vL0B0cy1pZ25vcmVcbnR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgT2JqZWN0LmFzc2lnbihtb2R1bGUuZXhwb3J0cywgeyBGaWxhIH0pO1xuIl19