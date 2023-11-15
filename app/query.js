"use strict";
/**
 * Namespace of functions containing generic DOM querying functions
 */
var Query;
/**
 * Namespace of functions containing generic DOM querying functions
 */
(function (Query) {
    /**
     * Returns the first element with the specified class name,
     * optionally as children of the specified element.
     */
    function find(cssClass, container) {
        const parent = container || document;
        return parent.getElementsByClassName(cssClass).item(0);
    }
    Query.find = find;
    /**
     * Iterates over the element children of the specified element,
     * optionally with the specified type filter.
     */
    function children(target, type) {
        const children = [];
        if (target instanceof Element) {
            const ctor = type || HTMLElement;
            for (let i = -1; ++i < target.children.length;) {
                const child = target.children[i];
                if (child instanceof ctor)
                    children.push(child);
            }
        }
        return children;
    }
    Query.children = children;
    /**
     * Iterates over the element siblings of the specified element,
     * optionally with the specified type filter.
     */
    function siblings(element, type) {
        return element.parentNode ?
            Query.children(element.parentNode, type) :
            [];
    }
    Query.siblings = siblings;
    /**
     * Returns the element ancestors of the specified node.
     */
    function ancestors(node, until) {
        const ancestors = [];
        let current = node;
        while (current instanceof Node) {
            if (until && current === until)
                break;
            ancestors.push(current);
            current = current.parentNode;
        }
        return ancestors;
    }
    Query.ancestors = ancestors;
    /**
     * Return the ancestor of the specified target node that is an instance
     * of the specified type.
     */
    function ancestor(targetNode, targetType) {
        const elements = ancestors(targetNode);
        return elements.find(e => e instanceof targetType);
    }
    Query.ancestor = ancestor;
    /**
     * Returns the position of the specified node in it's container.
     */
    function indexOf(node) {
        const parent = node.parentNode;
        if (!parent)
            return 0;
        const length = parent.childNodes.length;
        for (let i = -1; ++i < length;)
            if (parent.childNodes.item(i) === node)
                return i;
        return -1;
    }
    Query.indexOf = indexOf;
    /** */
    function* recurse(...parents) {
        function* recurse(node) {
            yield node;
            for (const child of Array.from(node.childNodes))
                yield* recurse(child);
        }
        for (const parent of parents)
            yield* recurse(parent);
    }
    Query.recurse = recurse;
})(Query || (Query = {}));
//@ts-ignore
if (typeof module === "object")
    Object.assign(module.exports, { Query });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9RdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0E7O0dBRUc7QUFDSCxJQUFVLEtBQUssQ0FtSGQ7QUF0SEQ7O0dBRUc7QUFDSCxXQUFVLEtBQUs7SUFPZDs7O09BR0c7SUFDSCxTQUFnQixJQUFJLENBQUMsUUFBZ0IsRUFBRSxTQUFtQjtRQUV6RCxNQUFNLE1BQU0sR0FBRyxTQUFTLElBQUksUUFBUSxDQUFDO1FBQ3JDLE9BQU8sTUFBTSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQXVCLENBQUM7SUFDOUUsQ0FBQztJQUplLFVBQUksT0FJbkIsQ0FBQTtJQUVEOzs7T0FHRztJQUNILFNBQWdCLFFBQVEsQ0FDdkIsTUFBWSxFQUNaLElBQXFCO1FBRXJCLE1BQU0sUUFBUSxHQUFRLEVBQUUsQ0FBQztRQUN6QixJQUFJLE1BQU0sWUFBWSxPQUFPLEVBQzdCO1lBQ0MsTUFBTSxJQUFJLEdBQVEsSUFBSSxJQUFJLFdBQVcsQ0FBQztZQUN0QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUM3QztnQkFDQyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxJQUFJLEtBQUssWUFBWSxJQUFJO29CQUN4QixRQUFRLENBQUMsSUFBSSxDQUFDLEtBQVUsQ0FBQyxDQUFDO2FBQzNCO1NBQ0Q7UUFDRCxPQUFPLFFBQVEsQ0FBQztJQUNqQixDQUFDO0lBaEJlLGNBQVEsV0FnQnZCLENBQUE7SUFFRDs7O09BR0c7SUFDSCxTQUFnQixRQUFRLENBQ3ZCLE9BQWdCLEVBQ2hCLElBQXFCO1FBRXJCLE9BQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzFCLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzFDLEVBQUUsQ0FBQztJQUNMLENBQUM7SUFQZSxjQUFRLFdBT3ZCLENBQUE7SUFFRDs7T0FFRztJQUNILFNBQWdCLFNBQVMsQ0FBQyxJQUErQixFQUFFLEtBQWU7UUFFekUsTUFBTSxTQUFTLEdBQVcsRUFBRSxDQUFDO1FBQzdCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQztRQUVuQixPQUFPLE9BQU8sWUFBWSxJQUFJLEVBQzlCO1lBQ0MsSUFBSSxLQUFLLElBQUksT0FBTyxLQUFLLEtBQUs7Z0JBQzdCLE1BQU07WUFFUCxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hCLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO1NBQzdCO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQWZlLGVBQVMsWUFleEIsQ0FBQTtJQUVEOzs7T0FHRztJQUNILFNBQWdCLFFBQVEsQ0FDdkIsVUFBcUMsRUFDckMsVUFBMEI7UUFFMUIsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsWUFBWSxVQUFVLENBQU0sQ0FBQztJQUN6RCxDQUFDO0lBTmUsY0FBUSxXQU12QixDQUFBO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixPQUFPLENBQUMsSUFBVTtRQUVqQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQy9CLElBQUksQ0FBQyxNQUFNO1lBQ1YsT0FBTyxDQUFDLENBQUM7UUFFVixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQztRQUN4QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLE1BQU07WUFDNUIsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJO2dCQUNyQyxPQUFPLENBQUMsQ0FBQztRQUVYLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBWmUsYUFBTyxVQVl0QixDQUFBO0lBRUQsTUFBTTtJQUNOLFFBQWdCLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxPQUFlO1FBRTNDLFFBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFVO1lBRTVCLE1BQU0sSUFBSSxDQUFDO1lBRVgsS0FBSyxNQUFNLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQzlDLEtBQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBRUQsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPO1lBQzNCLEtBQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBWmlCLGFBQU8sVUFZeEIsQ0FBQTtBQUNGLENBQUMsRUFuSFMsS0FBSyxLQUFMLEtBQUssUUFtSGQ7QUFFRCxZQUFZO0FBQ1osSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRO0lBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIlxuLyoqXG4gKiBOYW1lc3BhY2Ugb2YgZnVuY3Rpb25zIGNvbnRhaW5pbmcgZ2VuZXJpYyBET00gcXVlcnlpbmcgZnVuY3Rpb25zXG4gKi9cbm5hbWVzcGFjZSBRdWVyeVxue1xuXHQvKiogKi9cblx0dHlwZSBDb25zdHJ1Y3RvcjxUID0gYW55PiA9IFxuXHRcdChhYnN0cmFjdCBuZXcgKC4uLmFyZ3M6IGFueSkgPT4gVCkgfCBcblx0XHQobmV3ICguLi5hcmdzOiBhbnkpID0+IFQpO1xuXHRcblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGZpcnN0IGVsZW1lbnQgd2l0aCB0aGUgc3BlY2lmaWVkIGNsYXNzIG5hbWUsIFxuXHQgKiBvcHRpb25hbGx5IGFzIGNoaWxkcmVuIG9mIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBmaW5kKGNzc0NsYXNzOiBzdHJpbmcsIGNvbnRhaW5lcj86IEVsZW1lbnQpXG5cdHtcblx0XHRjb25zdCBwYXJlbnQgPSBjb250YWluZXIgfHwgZG9jdW1lbnQ7XG5cdFx0cmV0dXJuIHBhcmVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNzc0NsYXNzKS5pdGVtKDApIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcblx0fVxuXHRcblx0LyoqXG5cdCAqIEl0ZXJhdGVzIG92ZXIgdGhlIGVsZW1lbnQgY2hpbGRyZW4gb2YgdGhlIHNwZWNpZmllZCBlbGVtZW50LFxuXHQgKiBvcHRpb25hbGx5IHdpdGggdGhlIHNwZWNpZmllZCB0eXBlIGZpbHRlci5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBjaGlsZHJlbjxUIGV4dGVuZHMgRWxlbWVudCA9IEhUTUxFbGVtZW50Pihcblx0XHR0YXJnZXQ6IE5vZGUsXG5cdFx0dHlwZT86IENvbnN0cnVjdG9yPFQ+KVxuXHR7XG5cdFx0Y29uc3QgY2hpbGRyZW46IFRbXSA9IFtdO1xuXHRcdGlmICh0YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50KVxuXHRcdHtcdFx0XG5cdFx0XHRjb25zdCBjdG9yOiBhbnkgPSB0eXBlIHx8IEhUTUxFbGVtZW50O1xuXHRcdFx0Zm9yIChsZXQgaSA9IC0xOyArK2kgPCB0YXJnZXQuY2hpbGRyZW4ubGVuZ3RoOylcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgY2hpbGQgPSB0YXJnZXQuY2hpbGRyZW5baV07XG5cdFx0XHRcdGlmIChjaGlsZCBpbnN0YW5jZW9mIGN0b3IpXG5cdFx0XHRcdFx0Y2hpbGRyZW4ucHVzaChjaGlsZCBhcyBUKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGNoaWxkcmVuO1xuXHR9XG5cdFxuXHQvKipcblx0ICogSXRlcmF0ZXMgb3ZlciB0aGUgZWxlbWVudCBzaWJsaW5ncyBvZiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQsXG5cdCAqIG9wdGlvbmFsbHkgd2l0aCB0aGUgc3BlY2lmaWVkIHR5cGUgZmlsdGVyLlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIHNpYmxpbmdzPFQgZXh0ZW5kcyBFbGVtZW50ID0gSFRNTEVsZW1lbnQ+KFxuXHRcdGVsZW1lbnQ6IEVsZW1lbnQsXG5cdFx0dHlwZT86IENvbnN0cnVjdG9yPFQ+KVxuXHR7XG5cdFx0cmV0dXJuIGVsZW1lbnQucGFyZW50Tm9kZSA/IFxuXHRcdFx0UXVlcnkuY2hpbGRyZW4oZWxlbWVudC5wYXJlbnROb2RlLCB0eXBlKSA6XG5cdFx0XHRbXTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGVsZW1lbnQgYW5jZXN0b3JzIG9mIHRoZSBzcGVjaWZpZWQgbm9kZS5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBhbmNlc3RvcnMobm9kZTogTm9kZSB8IEV2ZW50VGFyZ2V0IHwgbnVsbCwgdW50aWw/OiBFbGVtZW50KVxuXHR7XG5cdFx0Y29uc3QgYW5jZXN0b3JzOiBOb2RlW10gPSBbXTtcblx0XHRsZXQgY3VycmVudCA9IG5vZGU7XG5cdFx0XG5cdFx0d2hpbGUgKGN1cnJlbnQgaW5zdGFuY2VvZiBOb2RlKVxuXHRcdHtcblx0XHRcdGlmICh1bnRpbCAmJiBjdXJyZW50ID09PSB1bnRpbClcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcblx0XHRcdGFuY2VzdG9ycy5wdXNoKGN1cnJlbnQpO1xuXHRcdFx0Y3VycmVudCA9IGN1cnJlbnQucGFyZW50Tm9kZTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIGFuY2VzdG9ycztcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJldHVybiB0aGUgYW5jZXN0b3Igb2YgdGhlIHNwZWNpZmllZCB0YXJnZXQgbm9kZSB0aGF0IGlzIGFuIGluc3RhbmNlIFxuXHQgKiBvZiB0aGUgc3BlY2lmaWVkIHR5cGUuXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gYW5jZXN0b3I8VCBleHRlbmRzIEVsZW1lbnQgPSBIVE1MRWxlbWVudD4oXG5cdFx0dGFyZ2V0Tm9kZTogTm9kZSB8IEV2ZW50VGFyZ2V0IHwgbnVsbCxcblx0XHR0YXJnZXRUeXBlOiBDb25zdHJ1Y3RvcjxUPik6IFQgfCBudWxsXG5cdHtcblx0XHRjb25zdCBlbGVtZW50cyA9IGFuY2VzdG9ycyh0YXJnZXROb2RlKTtcblx0XHRyZXR1cm4gZWxlbWVudHMuZmluZChlID0+IGUgaW5zdGFuY2VvZiB0YXJnZXRUeXBlKSBhcyBUO1xuXHR9XG5cdFxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgcG9zaXRpb24gb2YgdGhlIHNwZWNpZmllZCBub2RlIGluIGl0J3MgY29udGFpbmVyLlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGluZGV4T2Yobm9kZTogTm9kZSlcblx0e1xuXHRcdGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcblx0XHRpZiAoIXBhcmVudClcblx0XHRcdHJldHVybiAwO1xuXHRcdFxuXHRcdGNvbnN0IGxlbmd0aCA9IHBhcmVudC5jaGlsZE5vZGVzLmxlbmd0aDtcblx0XHRmb3IgKGxldCBpID0gLTE7ICsraSA8IGxlbmd0aDspXG5cdFx0XHRpZiAocGFyZW50LmNoaWxkTm9kZXMuaXRlbShpKSA9PT0gbm9kZSlcblx0XHRcdFx0cmV0dXJuIGk7XG5cdFx0XG5cdFx0cmV0dXJuIC0xO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGZ1bmN0aW9uICogcmVjdXJzZSguLi5wYXJlbnRzOiBOb2RlW10pXG5cdHtcblx0XHRmdW5jdGlvbiAqIHJlY3Vyc2Uobm9kZTogTm9kZSk6IEl0ZXJhYmxlSXRlcmF0b3I8Tm9kZT5cblx0XHR7XG5cdFx0XHR5aWVsZCBub2RlO1xuXHRcdFx0XG5cdFx0XHRmb3IgKGNvbnN0IGNoaWxkIG9mIEFycmF5LmZyb20obm9kZS5jaGlsZE5vZGVzKSlcblx0XHRcdFx0eWllbGQgKiByZWN1cnNlKGNoaWxkKTtcblx0XHR9XG5cdFx0XG5cdFx0Zm9yIChjb25zdCBwYXJlbnQgb2YgcGFyZW50cylcblx0XHRcdHlpZWxkICogcmVjdXJzZShwYXJlbnQpO1xuXHR9XG59XG5cbi8vQHRzLWlnbm9yZVxuaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIpIE9iamVjdC5hc3NpZ24obW9kdWxlLmV4cG9ydHMsIHsgUXVlcnkgfSk7XG4iXX0=