/**
 * Namespace of functions containing generic DOM querying functions
 */
declare namespace Query {
    /** */
    type Constructor<T = any> = (abstract new (...args: any) => T) | (new (...args: any) => T);
    /**
     * Returns the first element with the specified class name,
     * optionally as children of the specified element.
     */
    export function find(cssClass: string, container?: Element): HTMLElement | null;
    /**
     * Iterates over the element children of the specified element,
     * optionally with the specified type filter.
     */
    export function children<T extends Element = HTMLElement>(target: Node, type?: Constructor<T>): T[];
    /**
     * Iterates over the element siblings of the specified element,
     * optionally with the specified type filter.
     */
    export function siblings<T extends Element = HTMLElement>(element: Element, type?: Constructor<T>): T[];
    /**
     * Returns the element ancestors of the specified node.
     */
    export function ancestors(node: Node | EventTarget | null, until?: Element): Node[];
    /**
     * Return the ancestor of the specified target node that is an instance
     * of the specified type.
     */
    export function ancestor<T extends Element = HTMLElement>(targetNode: Node | EventTarget | null, targetType: Constructor<T>): T | null;
    /**
     * Returns the position of the specified node in it's container.
     */
    export function indexOf(node: Node): number;
    /** */
    export function recurse(...parents: Node[]): Generator<Node, void, undefined>;
    export {};
}
//# sourceMappingURL=query.d.ts.map