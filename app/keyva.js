"use strict";
class Keyva {
    /**
     * An IDBKeyRange that has no upper or lower bounding.
     */
    static unbound = IDBKeyRange.lowerBound(Number.MIN_SAFE_INTEGER);
    /**
     * Returns an IDBKeyRange that matches all keys that start
     * with the specified string prefix.
     */
    static prefix(prefix) {
        return IDBKeyRange.bound(prefix, prefix + "\uFFFF");
    }
    /**
     * @returns An array of strings that contain the names of all
     * Keyva-created IndexedDB databases.
     */
    static async each() {
        const databases = await indexedDB.databases();
        return databases
            .map(db => db.name)
            .filter((s) => !!s && s.startsWith(this.kvPrefix));
    }
    /**
     * Deletes Keyva-created IndexedDB databases with the
     * specified names.
     *
     * @param names The names of the databases to delete.
     * If no names are provided, all Keyva IndexedDB databases
     * are deleted.
     */
    static async delete(...names) {
        names = names.length ?
            names.map(n => n.startsWith(this.kvPrefix) ? n : this.kvPrefix + n) :
            await this.each();
        Promise.all(names.map(n => this.asPromise(indexedDB.deleteDatabase(n))));
    }
    /** Stores the prefix that is added to every IndexedDB database created by Keyva. */
    static kvPrefix = "-keyva-";
    /**
     * Creates a new IndexedDB-backed database
     */
    constructor(options = {}) {
        const idx = options.indexes || [];
        this.indexes = (Array.isArray(idx) ? idx : [idx]).sort();
        this.name = Keyva.kvPrefix + (options.name || "");
    }
    indexes;
    name;
    /** */
    async get(k) {
        const store = await this.getStore("readonly");
        return Array.isArray(k) ?
            Promise.all(k.map(key => Keyva.asPromise(store.get(key)))) :
            Keyva.asPromise(store.get(k));
    }
    /** */
    async each(options = {}, only) {
        const store = await this.getStore("readonly");
        const target = options.index ? store.index(options.index) : store;
        const limit = options.limit;
        const range = options.range;
        if (only === "keys")
            return Keyva.asPromise(target.getAllKeys(range, limit));
        if (only === "values")
            return Keyva.asPromise(target.getAll(range, limit));
        let keys = [];
        let values = [];
        await Promise.allSettled([
            new Promise(async (r) => {
                const results = await Keyva.asPromise(target.getAllKeys(range, limit));
                keys.push(...results);
                r();
            }),
            new Promise(async (r) => {
                const results = await Keyva.asPromise(target.getAll(range, limit));
                values.push(...results);
                r();
            }),
        ]);
        const tuples = [];
        for (let i = -1; ++i < keys.length;)
            tuples.push([keys[i], values[i]]);
        return tuples;
    }
    async set(a, b) {
        const store = await this.getStore("readwrite");
        if (Array.isArray(a)) {
            for (const entry of a)
                store.put(entry[1], entry[0]);
            return Keyva.asPromise(store.transaction);
        }
        store.put(b, a);
        return Keyva.asPromise(store.transaction);
    }
    async delete(arg) {
        const store = await this.getStore("readwrite");
        arg ??= Keyva.unbound;
        if (Array.isArray(arg)) {
            for (const key of arg)
                store.delete(key);
        }
        else
            store.delete(arg);
        return Keyva.asPromise(store.transaction);
    }
    /** */
    async getStore(mode) {
        const db = await this.getDatabase();
        return db.transaction(this.name, mode).objectStore(this.name);
    }
    /** */
    async getDatabase() {
        if (!this.database) {
            await this.maybeFixSafari();
            let quit = false;
            let version;
            let indexNamesAdded = [];
            let indexNamesRemoved = [];
            for (;;) {
                const request = indexedDB.open(this.name, version);
                request.onupgradeneeded = () => {
                    const db = request.result;
                    const tx = request.transaction;
                    const store = tx.objectStoreNames.contains(this.name) ?
                        tx.objectStore(this.name) :
                        db.createObjectStore(this.name);
                    for (const index of indexNamesAdded)
                        store.createIndex(index, index);
                    for (const index of indexNamesRemoved)
                        store.deleteIndex(index);
                };
                this.database = await Keyva.asPromise(request);
                if (quit)
                    break;
                const tx = this.database.transaction(this.name, "readonly");
                const store = tx.objectStore(this.name);
                const indexNames = Array.from(store.indexNames).sort();
                tx.abort();
                indexNamesAdded = this.indexes.filter(n => !indexNames.includes(n));
                indexNamesRemoved = indexNames.filter(n => !this.indexes.includes(n));
                if (indexNamesAdded.length + indexNamesRemoved.length === 0)
                    break;
                quit = true;
                this.database.close();
                version = this.database.version + 1;
            }
        }
        return this.database;
    }
    database = null;
    /**
     * Works around a Safari 14 bug.
     *
     * Safari has a bug where IDB requests can hang while the browser is
     * starting up. https://bugs.webkit.org/show_bug.cgi?id=226547
     * The only solution is to keep nudging it until it's awake.
     */
    async maybeFixSafari() {
        if (!/Version\/14\.\d*\s*Safari\//.test(navigator.userAgent))
            return;
        let id = 0;
        return new Promise(resolve => {
            const hit = () => indexedDB.databases().finally(resolve);
            id = setInterval(hit, 50);
            hit();
        })
            .finally(() => clearInterval(id));
    }
    /** */
    static asPromise(request) {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            request.oncomplete = request.onsuccess = () => resolve(request.result);
            // @ts-ignore
            request.onabort = request.onerror = () => reject(request.error);
        });
    }
}
//@ts-ignore CommonJS compatibility
if (typeof module === "object")
    Object.assign(module.exports, { Keyva });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5dmEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9jb3JlL0tleXZhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxNQUFNLEtBQUs7SUFFVjs7T0FFRztJQUNILE1BQU0sQ0FBVSxPQUFPLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUUxRTs7O09BR0c7SUFDSCxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQWM7UUFFM0IsT0FBTyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLEdBQUcsUUFBUSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVEOzs7T0FHRztJQUNILE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSTtRQUVoQixNQUFNLFNBQVMsR0FBRyxNQUFNLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUM5QyxPQUFPLFNBQVM7YUFDZCxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO2FBQ2xCLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFlO1FBRXJDLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRSxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUs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LEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFFekMsYUFBYTtZQUNiLE9BQU8sQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFNBQVMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXZFLGFBQWE7WUFDVCxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyRSxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7O0FBeUNGLG1DQUFtQztBQUNuQyxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVE7SUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiXG5jbGFzcyBLZXl2YVxue1xuXHQvKipcblx0ICogQW4gSURCS2V5UmFuZ2UgdGhhdCBoYXMgbm8gdXBwZXIgb3IgbG93ZXIgYm91bmRpbmcuXG5cdCAqL1xuXHRzdGF0aWMgcmVhZG9ubHkgdW5ib3VuZCA9IElEQktleVJhbmdlLmxvd2VyQm91bmQoTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIpO1xuXHRcblx0LyoqXG5cdCAqIFJldHVybnMgYW4gSURCS2V5UmFuZ2UgdGhhdCBtYXRjaGVzIGFsbCBrZXlzIHRoYXQgc3RhcnRcblx0ICogd2l0aCB0aGUgc3BlY2lmaWVkIHN0cmluZyBwcmVmaXguXG5cdCAqL1xuXHRzdGF0aWMgcHJlZml4KHByZWZpeDogc3RyaW5nKVxuXHR7XG5cdFx0cmV0dXJuIElEQktleVJhbmdlLmJvdW5kKHByZWZpeCwgcHJlZml4ICsgXCJcXHVGRkZGXCIpO1xuXHR9XG5cdFxuXHQvKipcblx0ICogQHJldHVybnMgQW4gYXJyYXkgb2Ygc3RyaW5ncyB0aGF0IGNvbnRhaW4gdGhlIG5hbWVzIG9mIGFsbCBcblx0ICogS2V5dmEtY3JlYXRlZCBJbmRleGVkREIgZGF0YWJhc2VzLlxuXHQgKi9cblx0c3RhdGljIGFzeW5jIGVhY2goKVxuXHR7XG5cdFx0Y29uc3QgZGF0YWJhc2VzID0gYXdhaXQgaW5kZXhlZERCLmRhdGFiYXNlcygpO1xuXHRcdHJldHVybiBkYXRhYmFzZXNcblx0XHRcdC5tYXAoZGIgPT4gZGIubmFtZSlcblx0XHRcdC5maWx0ZXIoKHMpOiBzIGlzIHN0cmluZyA9PiAhIXMgJiYgcy5zdGFydHNXaXRoKHRoaXMua3ZQcmVmaXgpKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIERlbGV0ZXMgS2V5dmEtY3JlYXRlZCBJbmRleGVkREIgZGF0YWJhc2VzIHdpdGggdGhlIFxuXHQgKiBzcGVjaWZpZWQgbmFtZXMuXG5cdCAqIFxuXHQgKiBAcGFyYW0gbmFtZXMgVGhlIG5hbWVzIG9mIHRoZSBkYXRhYmFzZXMgdG8gZGVsZXRlLiBcblx0ICogSWYgbm8gbmFtZXMgYXJlIHByb3ZpZGVkLCBhbGwgS2V5dmEgSW5kZXhlZERCIGRhdGFiYXNlcyBcblx0ICogYXJlIGRlbGV0ZWQuXG5cdCAqL1xuXHRzdGF0aWMgYXN5bmMgZGVsZXRlKC4uLm5hbWVzOiBzdHJpbmdbXSlcblx0e1xuXHRcdG5hbWVzID0gbmFtZXMubGVuZ3RoID8gXG5cdFx0XHRuYW1lcy5tYXAobiA9PiBuLnN0YXJ0c1dpdGgodGhpcy5rdlByZWZpeCkgPyBuIDogdGhpcy5rdlByZWZpeCArIG4pIDogXG5cdFx0XHRhd2FpdCB0aGlzLmVhY2goKTtcblx0XHRcblx0XHRQcm9taXNlLmFsbChuYW1lcy5tYXAobiA9PiB0aGlzLmFzUHJvbWlzZShpbmRleGVkREIuZGVsZXRlRGF0YWJhc2UobikpKSk7XG5cdH1cblx0XG5cdC8qKiBTdG9yZXMgdGhlIHByZWZpeCB0aGF0IGlzIGFkZGVkIHRvIGV2ZXJ5IEluZGV4ZWREQiBkYXRhYmFzZSBjcmVhdGVkIGJ5IEtleXZhLiAqL1xuXHRwcml2YXRlIHN0YXRpYyByZWFkb25seSBrdlByZWZpeCA9IFwiLWtleXZhLVwiO1xuXHRcblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgSW5kZXhlZERCLWJhY2tlZCBkYXRhYmFzZSBcblx0ICovXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IEtleXZhLklDb25zdHJ1Y3Rvck9wdGlvbnMgPSB7fSlcblx0e1xuXHRcdGNvbnN0IGlkeCA9IG9wdGlvbnMuaW5kZXhlcyB8fCBbXTtcblx0XHR0aGlzLmluZGV4ZXMgPSAoQXJyYXkuaXNBcnJheShpZHgpID8gaWR4IDogW2lkeF0pLnNvcnQoKTtcblx0XHR0aGlzLm5hbWUgPSBLZXl2YS5rdlByZWZpeCArIChvcHRpb25zLm5hbWUgfHwgXCJcIik7XG5cdH1cblx0XG5cdHByaXZhdGUgcmVhZG9ubHkgaW5kZXhlczogc3RyaW5nW107XG5cdHByaXZhdGUgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuXHRcblx0LyoqXG5cdCAqIEdldCBhIHZhbHVlIGJ5IGl0cyBrZXkuXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuXHQgKi9cblx0Z2V0PFQgPSBhbnk+KGtleTogS2V5dmEuS2V5KTogUHJvbWlzZTxUPjtcblx0LyoqXG5cdCAqIEdldCBhIHNlcmllcyBvZiB2YWx1ZXMgZnJvbSB0aGUga2V5cyBzcGVjaWZpZWQuXG5cdCAqIEBwYXJhbSBrZXlzIFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cblx0ICovXG5cdGdldDxUID0gYW55PihrZXlzOiBLZXl2YS5LZXlbXSk6IFByb21pc2U8VFtdPjtcblx0LyoqICovXG5cdGFzeW5jIGdldChrOiBLZXl2YS5LZXkgfCBLZXl2YS5LZXlbXSlcblx0e1xuXHRcdGNvbnN0IHN0b3JlID0gYXdhaXQgdGhpcy5nZXRTdG9yZShcInJlYWRvbmx5XCIpO1xuXHRcdFxuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KGspID9cblx0XHRcdFByb21pc2UuYWxsKGsubWFwKGtleSA9PiBLZXl2YS5hc1Byb21pc2Uoc3RvcmUuZ2V0KGtleSkpKSkgOlxuXHRcdFx0S2V5dmEuYXNQcm9taXNlKHN0b3JlLmdldChrKSk7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBHZXRzIGFsbCBrZXlzIGFuZCB2YWx1ZXMgZnJvbSB0aGUgS2V5dmEgZGF0YWJhc2UuXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuXHQgKi9cblx0ZWFjaDxUID0gYW55PigpOiBQcm9taXNlPFtLZXl2YS5LZXksIFRdW10+O1xuXHQvKipcblx0ICogR2V0cyBhIHNlcmllcyBvZiBrZXlzIGFuZCB2YWx1ZXMgdGhhdCBtYXRjaCB0aGUgc3BlY2lmaWVkXG5cdCAqIHNldCBvZiBvcHRpb25zLlxuXHQgKi9cblx0ZWFjaDxUID0gYW55PihvcHRpb25zOiBLZXl2YS5JUXVlcnkpOiBQcm9taXNlPFtLZXl2YS5LZXksIFRdW10+O1xuXHQvKipcblx0ICogR2V0cyBhIHNlcmllcyBvZiBrZXlzIG9ubHkgdGhhdCBtYXRjaCB0aGUgc3BlY2lmaWVkIHNldCBvZiBvcHRpb25zLlxuXHQgKi9cblx0ZWFjaChvcHRpb25zOiBLZXl2YS5JUXVlcnksIG9ubHk6IFwia2V5c1wiKTogUHJvbWlzZTxLZXl2YS5LZXlbXT47XG5cdC8qKlxuXHQgKiBHZXRzIGEgc2VyaWVzIG9mIHZhbHVlcyBvbmx5IHRoYXQgbWF0Y2ggdGhlIHNwZWNpZmllZCBzZXQgb2Ygb3B0aW9ucy5cblx0ICovXG5cdGVhY2g8VCA9IGFueT4ob3B0aW9uczogS2V5dmEuSVF1ZXJ5LCBvbmx5OiBcInZhbHVlc1wiKTogUHJvbWlzZTxUW10+O1xuXHQvKiogKi9cblx0YXN5bmMgZWFjaChvcHRpb25zOiBLZXl2YS5JUXVlcnkgPSB7fSwgb25seT86IFwia2V5c1wiIHwgXCJ2YWx1ZXNcIik6IFByb21pc2U8YW55PlxuXHR7XG5cdFx0Y29uc3Qgc3RvcmUgPSBhd2FpdCB0aGlzLmdldFN0b3JlKFwicmVhZG9ubHlcIik7XG5cdFx0Y29uc3QgdGFyZ2V0ID0gb3B0aW9ucy5pbmRleCA/IHN0b3JlLmluZGV4KG9wdGlvbnMuaW5kZXgpIDogc3RvcmU7XG5cdFx0Y29uc3QgbGltaXQgPSBvcHRpb25zLmxpbWl0O1xuXHRcdGNvbnN0IHJhbmdlID0gb3B0aW9ucy5yYW5nZTtcblx0XHRcblx0XHRpZiAob25seSA9PT0gXCJrZXlzXCIpXG5cdFx0XHRyZXR1cm4gS2V5dmEuYXNQcm9taXNlKHRhcmdldC5nZXRBbGxLZXlzKHJhbmdlLCBsaW1pdCkpO1xuXHRcdFxuXHRcdGlmIChvbmx5ID09PSBcInZhbHVlc1wiKVxuXHRcdFx0cmV0dXJuIEtleXZhLmFzUHJvbWlzZSh0YXJnZXQuZ2V0QWxsKHJhbmdlLCBsaW1pdCkpO1xuXHRcdFxuXHRcdGxldCBrZXlzOiBLZXl2YS5LZXlbXSA9IFtdO1xuXHRcdGxldCB2YWx1ZXM6IGFueVtdID0gW107XG5cdFx0XG5cdFx0YXdhaXQgUHJvbWlzZS5hbGxTZXR0bGVkKFtcblx0XHRcdG5ldyBQcm9taXNlPHZvaWQ+KGFzeW5jIHIgPT5cblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgcmVzdWx0cyA9IGF3YWl0IEtleXZhLmFzUHJvbWlzZSh0YXJnZXQuZ2V0QWxsS2V5cyhyYW5nZSwgbGltaXQpKTtcblx0XHRcdFx0a2V5cy5wdXNoKC4uLnJlc3VsdHMgYXMgS2V5dmEuS2V5W10pO1xuXHRcdFx0XHRyKCk7XG5cdFx0XHR9KSxcblx0XHRcdG5ldyBQcm9taXNlPHZvaWQ+KGFzeW5jIHIgPT5cblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgcmVzdWx0cyA9IGF3YWl0IEtleXZhLmFzUHJvbWlzZSh0YXJnZXQuZ2V0QWxsKHJhbmdlLCBsaW1pdCkpO1xuXHRcdFx0XHR2YWx1ZXMucHVzaCguLi5yZXN1bHRzKTtcblx0XHRcdFx0cigpO1xuXHRcdFx0fSksXG5cdFx0XSk7XG5cdFx0XG5cdFx0Y29uc3QgdHVwbGVzOiBbS2V5dmEuS2V5LCBhbnldW10gPSBbXTtcblx0XHRcblx0XHRmb3IgKGxldCBpID0gLTE7ICsraSA8IGtleXMubGVuZ3RoOylcblx0XHRcdHR1cGxlcy5wdXNoKFtrZXlzW2ldLCB2YWx1ZXNbaV1dKTtcblx0XHRcblx0XHRyZXR1cm4gdHVwbGVzO1xuXHR9XG5cdFxuXHQvKipcblx0ICogU2V0IGEgdmFsdWUgd2l0aCBhIGtleS5cblx0ICovXG5cdGFzeW5jIHNldChrZXk6IEtleXZhLktleSwgdmFsdWU6IGFueSk6IFByb21pc2U8dm9pZD47XG5cdC8qKlxuXHQgKiBTZXQgbXVsdGlwbGUgdmFsdWVzIGF0IG9uY2UuIFRoaXMgaXMgZmFzdGVyIHRoYW4gY2FsbGluZyBzZXQoKSBtdWx0aXBsZSB0aW1lcy5cblx0ICogSXQncyBhbHNvIGF0b21pYyDigJMgaWYgb25lIG9mIHRoZSBwYWlycyBjYW4ndCBiZSBhZGRlZCwgbm9uZSB3aWxsIGJlIGFkZGVkLlxuXHQgKiBAcGFyYW0gZW50cmllcyBBcnJheSBvZiBlbnRyaWVzLCB3aGVyZSBlYWNoIGVudHJ5IGlzIGFuIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gLlxuXHQgKi9cblx0YXN5bmMgc2V0KGVudHJpZXM6IFtLZXl2YS5LZXksIGFueV1bXSk6IFByb21pc2U8dm9pZD47XG5cdGFzeW5jIHNldChhOiBhbnksIGI/OiBhbnkpXG5cdHtcblx0XHRjb25zdCBzdG9yZSA9IGF3YWl0IHRoaXMuZ2V0U3RvcmUoXCJyZWFkd3JpdGVcIik7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoYSkpXG5cdFx0e1xuXHRcdFx0Zm9yIChjb25zdCBlbnRyeSBvZiAoYSBhcyBbS2V5dmEuS2V5LCBhbnldW10pKVxuXHRcdFx0XHRzdG9yZS5wdXQoZW50cnlbMV0sIGVudHJ5WzBdKTtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIEtleXZhLmFzUHJvbWlzZShzdG9yZS50cmFuc2FjdGlvbik7XG5cdFx0fVxuXHRcdFxuXHRcdHN0b3JlLnB1dChiLCBhKTtcblx0XHRyZXR1cm4gS2V5dmEuYXNQcm9taXNlKHN0b3JlLnRyYW5zYWN0aW9uKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIERlbGV0ZXMgYWxsIG9iamVjdHMgZnJvbSB0aGlzIEtleXZhIGRhdGFiYXNlIFxuXHQgKiAoYnV0IGtlZXBzIHRoZSBLZXl2YSBkYXRhYmFzZSBpdHNlbGYgaXMga2VwdCkuXG5cdCAqL1xuXHRhc3luYyBkZWxldGUoKTogUHJvbWlzZTx2b2lkPjtcblx0LyoqXG5cdCAqIERlbGV0ZSBhIHNpbmdsZSBvYmplY3QgZnJvbSB0aGUgc3RvcmUgd2l0aCB0aGUgc3BlY2lmaWVkIGtleS5cblx0ICovXG5cdGFzeW5jIGRlbGV0ZShyYW5nZTogSURCS2V5UmFuZ2UpOiBQcm9taXNlPHZvaWQ+O1xuXHQvKipcblx0ICogRGVsZXRlIGEgc2luZ2xlIG9iamVjdCBmcm9tIHRoZSBzdG9yZSB3aXRoIHRoZSBzcGVjaWZpZWQga2V5LlxuXHQgKi9cblx0YXN5bmMgZGVsZXRlKGtleTogS2V5dmEuS2V5KTogUHJvbWlzZTx2b2lkPjtcblx0LyoqXG5cdCAqIERlbGV0ZSBhIHNlcmllcyBvZiBvYmplY3RzIGZyb20gdGhlIHN0b3JlwqBhdCBvbmNlLCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5cy5cblx0ICovXG5cdGFzeW5jIGRlbGV0ZShrZXlzOiBLZXl2YS5LZXlbXSk6IFByb21pc2U8dm9pZD47XG5cdGFzeW5jIGRlbGV0ZShhcmc/OiBLZXl2YS5LZXkgfCBLZXl2YS5LZXlbXSB8IElEQktleVJhbmdlKVxuXHR7XG5cdFx0Y29uc3Qgc3RvcmUgPSBhd2FpdCB0aGlzLmdldFN0b3JlKFwicmVhZHdyaXRlXCIpO1xuXHRcdGFyZyA/Pz0gS2V5dmEudW5ib3VuZDtcblx0XHRcblx0XHRpZiAoQXJyYXkuaXNBcnJheShhcmcpKVxuXHRcdHtcblx0XHRcdGZvciAoY29uc3Qga2V5IG9mIGFyZylcblx0XHRcdFx0c3RvcmUuZGVsZXRlKGtleSk7XG5cdFx0fVxuXHRcdGVsc2Ugc3RvcmUuZGVsZXRlKGFyZyk7XG5cdFx0XHRcblx0XHRyZXR1cm4gS2V5dmEuYXNQcm9taXNlKHN0b3JlLnRyYW5zYWN0aW9uKTtcblx0fVxuXHRcblx0LyoqICovXG5cdHByaXZhdGUgYXN5bmMgZ2V0U3RvcmUobW9kZTogSURCVHJhbnNhY3Rpb25Nb2RlKVxuXHR7XG5cdFx0Y29uc3QgZGIgPSBhd2FpdCB0aGlzLmdldERhdGFiYXNlKCk7XG5cdFx0cmV0dXJuIGRiLnRyYW5zYWN0aW9uKHRoaXMubmFtZSwgbW9kZSkub2JqZWN0U3RvcmUodGhpcy5uYW1lKTtcblx0fVxuXHRcblx0LyoqICovXG5cdHByaXZhdGUgYXN5bmMgZ2V0RGF0YWJhc2UoKVxuXHR7XG5cdFx0aWYgKCF0aGlzLmRhdGFiYXNlKVxuXHRcdHtcblx0XHRcdGF3YWl0IHRoaXMubWF5YmVGaXhTYWZhcmkoKTtcblx0XHRcdGxldCBxdWl0ID0gZmFsc2U7XG5cdFx0XHRsZXQgdmVyc2lvbjogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXHRcdFx0bGV0IGluZGV4TmFtZXNBZGRlZDogc3RyaW5nW10gPSBbXTtcblx0XHRcdGxldCBpbmRleE5hbWVzUmVtb3ZlZDogc3RyaW5nW10gPSBbXTtcblx0XHRcdFxuXHRcdFx0Zm9yICg7Oylcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgcmVxdWVzdCA9IGluZGV4ZWREQi5vcGVuKHRoaXMubmFtZSwgdmVyc2lvbik7XG5cdFx0XHRcdHJlcXVlc3Qub251cGdyYWRlbmVlZGVkID0gKCkgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0IGRiID0gcmVxdWVzdC5yZXN1bHQ7XG5cdFx0XHRcdFx0Y29uc3QgdHggPSByZXF1ZXN0LnRyYW5zYWN0aW9uITtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRjb25zdCBzdG9yZSA9IHR4Lm9iamVjdFN0b3JlTmFtZXMuY29udGFpbnModGhpcy5uYW1lKSA/IFxuXHRcdFx0XHRcdFx0dHgub2JqZWN0U3RvcmUodGhpcy5uYW1lKSA6XG5cdFx0XHRcdFx0XHRkYi5jcmVhdGVPYmplY3RTdG9yZSh0aGlzLm5hbWUpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGZvciAoY29uc3QgaW5kZXggb2YgaW5kZXhOYW1lc0FkZGVkKVxuXHRcdFx0XHRcdFx0c3RvcmUuY3JlYXRlSW5kZXgoaW5kZXgsIGluZGV4KTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGluZGV4IG9mIGluZGV4TmFtZXNSZW1vdmVkKVxuXHRcdFx0XHRcdFx0c3RvcmUuZGVsZXRlSW5kZXgoaW5kZXgpO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHR0aGlzLmRhdGFiYXNlID0gYXdhaXQgS2V5dmEuYXNQcm9taXNlKHJlcXVlc3QpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKHF1aXQpXG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFxuXHRcdFx0XHRjb25zdCB0eCA9IHRoaXMuZGF0YWJhc2UudHJhbnNhY3Rpb24odGhpcy5uYW1lLCBcInJlYWRvbmx5XCIpO1xuXHRcdFx0XHRjb25zdCBzdG9yZSA9IHR4Lm9iamVjdFN0b3JlKHRoaXMubmFtZSk7XG5cdFx0XHRcdGNvbnN0IGluZGV4TmFtZXMgPSBBcnJheS5mcm9tKHN0b3JlLmluZGV4TmFtZXMpLnNvcnQoKTtcblx0XHRcdFx0dHguYWJvcnQoKTtcblx0XHRcdFx0XG5cdFx0XHRcdGluZGV4TmFtZXNBZGRlZCA9IHRoaXMuaW5kZXhlcy5maWx0ZXIobiA9PiAhaW5kZXhOYW1lcy5pbmNsdWRlcyhuKSk7XG5cdFx0XHRcdGluZGV4TmFtZXNSZW1vdmVkID0gaW5kZXhOYW1lcy5maWx0ZXIobiA9PiAhdGhpcy5pbmRleGVzLmluY2x1ZGVzKG4pKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChpbmRleE5hbWVzQWRkZWQubGVuZ3RoICsgaW5kZXhOYW1lc1JlbW92ZWQubGVuZ3RoID09PSAwKVxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcblx0XHRcdFx0cXVpdCA9IHRydWU7XG5cdFx0XHRcdHRoaXMuZGF0YWJhc2UuY2xvc2UoKTtcblx0XHRcdFx0dmVyc2lvbiA9IHRoaXMuZGF0YWJhc2UudmVyc2lvbiArIDE7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiB0aGlzLmRhdGFiYXNlO1xuXHR9XG5cdHByaXZhdGUgZGF0YWJhc2U6IElEQkRhdGFiYXNlIHwgbnVsbCA9IG51bGw7XG5cdFxuXHQvKipcblx0ICogV29ya3MgYXJvdW5kIGEgU2FmYXJpIDE0IGJ1Zy5cblx0ICogXG5cdCAqIFNhZmFyaSBoYXMgYSBidWcgd2hlcmUgSURCIHJlcXVlc3RzIGNhbiBoYW5nIHdoaWxlIHRoZSBicm93c2VyIGlzIFxuXHQgKiBzdGFydGluZyB1cC4gaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTIyNjU0N1xuXHQgKiBUaGUgb25seSBzb2x1dGlvbiBpcyB0byBrZWVwIG51ZGdpbmcgaXQgdW50aWwgaXQncyBhd2FrZS5cblx0ICovXG5cdHByaXZhdGUgYXN5bmMgbWF5YmVGaXhTYWZhcmkoKVxuXHR7XG5cdFx0aWYgKCEvVmVyc2lvblxcLzE0XFwuXFxkKlxccypTYWZhcmlcXC8vLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpXG5cdFx0XHRyZXR1cm47XG5cdFx0XG5cdFx0bGV0IGlkOiBhbnkgPSAwO1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+XG5cdFx0e1xuXHRcdFx0Y29uc3QgaGl0ID0gKCkgPT4gaW5kZXhlZERCLmRhdGFiYXNlcygpLmZpbmFsbHkocmVzb2x2ZSk7XG5cdFx0XHRpZCA9IHNldEludGVydmFsKGhpdCwgNTApO1xuXHRcdFx0aGl0KCk7XG4gIFx0XHR9KVxuXHRcdC5maW5hbGx5KCgpID0+IGNsZWFySW50ZXJ2YWwoaWQpKTtcblx0fVxuXHRcblx0LyoqICovXG5cdHByaXZhdGUgc3RhdGljIGFzUHJvbWlzZTxUID0gdW5kZWZpbmVkPihyZXF1ZXN0OiBJREJSZXF1ZXN0PFQ+IHwgSURCVHJhbnNhY3Rpb24pXG5cdHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT5cblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRyZXF1ZXN0Lm9uY29tcGxldGUgPSByZXF1ZXN0Lm9uc3VjY2VzcyA9ICgpID0+IHJlc29sdmUocmVxdWVzdC5yZXN1bHQpO1xuXHRcdFx0XG5cdFx0XHQvLyBAdHMtaWdub3JlXG4gICAgXHRcdFx0cmVxdWVzdC5vbmFib3J0ID0gcmVxdWVzdC5vbmVycm9yID0gKCkgPT4gcmVqZWN0KHJlcXVlc3QuZXJyb3IpO1xuXHRcdH0pO1xuXHR9XG59XG5cbm5hbWVzcGFjZSBLZXl2YVxue1xuXHQvKiogKi9cblx0ZXhwb3J0IGludGVyZmFjZSBJQ29uc3RydWN0b3JPcHRpb25zXG5cdHtcblx0XHQvKipcblx0XHQgKiBEZWZpbmVzIHRoZSBuYW1lIG9mIHRoZSBJbmRleGVkREIgZGF0YWJhc2UgYXMgaXQgaXMgc3RvcmVkIGluIHRoZSBicm93c2VyLlxuXHRcdCAqIE5vdGUgdGhhdCB0aGUgbmFtZSBpcyBwcmVmaXhlZCB3aXRoIHRoZSBLZXl2YSBkYXRhYmFzZSBwcmVmaXggY29uc3RhbnQuXG5cdFx0ICovXG5cdFx0bmFtZT86IHN0cmluZyB8IG51bWJlcjtcblx0XHRcblx0XHQvKipcblx0XHQgKiBEZWZpbmVzIHRoZSBuYW1lIG9yIG5hbWVzIG9mIHRoZSBpbmRleCBvciBpbmRleGVzIHRvIGRlZmluZSBvbiB0aGUgZGF0YWJhc2UuXG5cdFx0ICovXG5cdFx0aW5kZXhlcz86IHN0cmluZyB8IHN0cmluZ1tdO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGludGVyZmFjZSBJUXVlcnlcblx0e1xuXHRcdC8qKlxuXHRcdCAqIEEgc3RhbmRhcmQgSURCS2V5UmFuZ2UgdG8gdXNlIGZvciB0aGUgcXVlcnkuIFdvcnRoIG5vdGluZyB0aGF0IHRoZSAgbWV0aG9kc1xuXHRcdCAqIGluIHRoZSBzdGF0aWMgS2V5dmEuKiBuYW1lc3BhY2UgY29udGFpbiB1dGlsaXR5IGZ1bmN0aW9ucyB0byBlYXNlIHRoZSBjcmVhdGlvblxuXHRcdCAqIG9mIElEQktleVJhbmdlIG9iamVjdHMuXG5cdFx0ICovXG5cdFx0cmFuZ2U/OiBJREJLZXlSYW5nZTtcblx0XHRcblx0XHQvKiogVGhlIG5hbWUgb2YgdGhlIGluZGV4IHRvIHVzZSBmb3IgdGhlIHF1ZXJ5LiAqL1xuXHRcdGluZGV4Pzogc3RyaW5nO1xuXHRcdFxuXHRcdC8qKiBBIG51bWJlciB3aGljaCBpbmRpY2F0ZXMgdGhlIG1heGltdW0gbnVtYmVyIG9mIG9iamVjdHMgdG8gcmV0dXJuIGZyb20gYSBxdWVyeS4gKi9cblx0XHRsaW1pdD86IG51bWJlcjtcblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCB0eXBlIEtleSA9IHN0cmluZyB8IG51bWJlciB8IERhdGUgfCBCdWZmZXJTb3VyY2U7XG59XG5cbi8vQHRzLWlnbm9yZSBDb21tb25KUyBjb21wYXRpYmlsaXR5XG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIikgT2JqZWN0LmFzc2lnbihtb2R1bGUuZXhwb3J0cywgeyBLZXl2YSB9KTtcblxuLy8gRW5hYmxlIHR5cGVvZiBpbXBvcnQoXCJAc3F1YXJlc2FwcC9yYXdqc1wiKVxuZGVjbGFyZSBtb2R1bGUgXCJrZXl2YWpzXCJcbntcblx0Y29uc3QgX19leHBvcnQ6IEtleXZhO1xuXHRleHBvcnQgPSBfX2V4cG9ydDtcbn1cbiJdfQ==