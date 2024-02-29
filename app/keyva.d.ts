declare class Keyva {
    /**
     * An IDBKeyRange that has no upper or lower bounding.
     */
    static readonly unbound: IDBKeyRange;
    /**
     * Returns an IDBKeyRange that matches all keys that start
     * with the specified string prefix.
     */
    static prefix(prefix: string): IDBKeyRange;
    /**
     * @returns An array of strings that contain the names of all
     * Keyva-created IndexedDB databases.
     */
    static each(): Promise<string[]>;
    /**
     * Deletes Keyva-created IndexedDB databases with the
     * specified names.
     *
     * @param names The names of the databases to delete.
     * If no names are provided, all Keyva IndexedDB databases
     * are deleted.
     */
    static delete(...names: string[]): Promise<void>;
    /** Stores the prefix that is added to every IndexedDB database created by Keyva. */
    private static readonly kvPrefix;
    /**
     * Creates a new IndexedDB-backed database
     */
    constructor(options?: Keyva.IConstructorOptions);
    private readonly indexes;
    private readonly name;
    /**
     * Get a value by its key.
     * @param key The key of the value to get.
     */
    get<T = any>(key: Keyva.Key): Promise<T>;
    /**
     * Get a series of values from the keys specified.
     * @param keys The key of the value to get.
     */
    get<T = any>(keys: Keyva.Key[]): Promise<T[]>;
    /**
     * Gets all keys and values from the Keyva database.
     * @param key The key of the value to get.
     */
    each<T = any>(): Promise<[Keyva.Key, T][]>;
    /**
     * Gets a series of keys and values that match the specified
     * set of options.
     */
    each<T = any>(options: Keyva.IQuery): Promise<[Keyva.Key, T][]>;
    /**
     * Gets a series of keys only that match the specified set of options.
     */
    each(options: Keyva.IQuery, only: "keys"): Promise<Keyva.Key[]>;
    /**
     * Gets a series of values only that match the specified set of options.
     */
    each<T = any>(options: Keyva.IQuery, only: "values"): Promise<T[]>;
    /**
     * Set a value with a key.
     */
    set(key: Keyva.Key, value: any): Promise<void>;
    /**
     * Set multiple values at once. This is faster than calling set() multiple times.
     * It's also atomic – if one of the pairs can't be added, none will be added.
     * @param entries Array of entries, where each entry is an array of `[key, value]`.
     */
    set(entries: [Keyva.Key, any][]): Promise<void>;
    /**
     * Deletes all objects from this Keyva database
     * (but keeps the Keyva database itself is kept).
     */
    delete(): Promise<void>;
    /**
     * Delete a single object from the store with the specified key.
     */
    delete(range: IDBKeyRange): Promise<void>;
    /**
     * Delete a single object from the store with the specified key.
     */
    delete(key: Keyva.Key): Promise<void>;
    /**
     * Delete a series of objects from the store at once, with the specified keys.
     */
    delete(keys: Keyva.Key[]): Promise<void>;
    /** */
    private getStore;
    /** */
    private getDatabase;
    private database;
    /**
     * Works around a Safari 14 bug.
     *
     * Safari has a bug where IDB requests can hang while the browser is
     * starting up. https://bugs.webkit.org/show_bug.cgi?id=226547
     * The only solution is to keep nudging it until it's awake.
     */
    private maybeFixSafari;
    /** */
    private static asPromise;
}
declare namespace Keyva {
    /** */
    interface IConstructorOptions {
        /**
         * Defines the name of the IndexedDB database as it is stored in the browser.
         * Note that the name is prefixed with the Keyva database prefix constant.
         */
        name?: string | number;
        /**
         * Defines the name or names of the index or indexes to define on the database.
         */
        indexes?: string | string[];
    }
    /** */
    interface IQuery {
        /**
         * A standard IDBKeyRange to use for the query. Worth noting that the  methods
         * in the static Keyva.* namespace contain utility functions to ease the creation
         * of IDBKeyRange objects.
         */
        range?: IDBKeyRange;
        /** The name of the index to use for the query. */
        index?: string;
        /** A number which indicates the maximum number of objects to return from a query. */
        limit?: number;
    }
    /** */
    type Key = string | number | Date | BufferSource;
}
declare module "keyvajs" {
    const __export: Keyva;
    export = __export;
}
//# sourceMappingURL=keyva.d.ts.map