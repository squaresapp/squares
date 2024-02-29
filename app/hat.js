"use strict";
/**
 *
 */
var Hat;
/**
 *
 */
(function (Hat) {
    /**
     * Marks an object as a Hat. (Or formally–an "Anonymous Controller Class").
     */
    function wear(hat) {
        const names = getConstructorClassNames(hat);
        const hatsArray = hats.get(hat.head) || [];
        hatsArray.push(hat);
        hats.set(hat.head, hatsArray);
        hat.head._hat = hat;
        hat.head.classList.add(...names);
    }
    Hat.wear = wear;
    /**
     * Enables a hat to have the ability to respond to signaling functions.
     * Marks the hat argument as a hat, if it has not been done so already.
     */
    function watch(hat, signal, handler) {
        if ((hats.get(hat.head) || []).length === 0)
            Hat.wear(hat);
        const name = getSignalClassName(signal);
        const signalsArray = signals.get(hat.head) || [];
        signalsArray.push([signal, handler.bind(hat)]);
        signals.set(hat.head, signalsArray);
        hat.head.classList.add(name);
    }
    Hat.watch = watch;
    /**
     * Sends a call signal to all Hats in the document that have subscribed
     * to invokations of the specified signal function.
     */
    function signal(ref, ...args) {
        const cls = getSignalClassName(ref);
        const elements = document.body.getElementsByClassName(cls);
        for (let i = -1; ++i < elements.length;) {
            const e = elements.item(i);
            if (!e)
                continue;
            const signalsArray = signals.get(e) || [];
            for (const [signalFunction, boundFunction] of signalsArray)
                if (signalFunction === ref)
                    boundFunction(...args);
        }
    }
    Hat.signal = signal;
    /** */
    function getSignalClassName(fn) {
        if (!fn.name)
            throw new Error("Cannot use an unnamed function as signaler");
        return signalPrefix + fn.name;
    }
    const signalPrefix = "signal:";
    function of(e, type) {
        if (!e)
            return null;
        if (!type)
            return (hats.get(e) || []).slice();
        let current = e;
        for (;;) {
            const array = hats.get(current);
            if (array)
                for (const obj of array)
                    if (obj instanceof type)
                        return obj;
            if (!(current.parentElement instanceof Element))
                break;
            current = current.parentElement;
        }
        return null;
    }
    Hat.of = of;
    /**
     * Scans upward through the DOM, starting at the specified object,
     * and performs a look-down at each layer in order to find a Hat of
     * the specified type, which is nearest in the DOM to the specified
     * Node or Hat.
     *
     * @returns A reference to the Hat that is nearest to the specified
     * object.
     */
    function nearest(via, type) {
        let current = via instanceof Node ? via : via.head;
        while (current instanceof Node) {
            if (current instanceof Element) {
                const maybe = Hat.down(current, type);
                if (maybe)
                    return maybe;
            }
            current = current.parentElement;
        }
        return null;
    }
    Hat.nearest = nearest;
    /**
     * Scans upward through the DOM, starting at the specified Node,
     * looking for the first element wearing a Hat of the specified type.
     *
     * @returns A reference to the Hat that exists above the specified Node
     * in the DOM, or null if no such Hat was found.
     */
    function up(via, type) {
        let current = via instanceof Node ? via : via.head;
        while (current instanceof Node) {
            if (current instanceof Element) {
                const hat = Hat.of(current, type);
                if (hat)
                    return hat;
            }
            current = current.parentElement;
        }
        return null;
    }
    Hat.up = up;
    /**
     * Finds the first descendent element that has an attached Hat of the
     * specified type, that exists underneath the specified Node or Hat.
     *
     * @returns The Hat associated with the descendent element, or
     * null if no such Hat is found.
     */
    function down(via, type) {
        const hats = within(via, type, true);
        return hats.length > 0 ? hats[0] : null;
    }
    Hat.down = down;
    /**
     * Scans upward through the DOM, starting at the specified Node,
     * looking for the first element wearing a Hat of the specified type.
     *
     * @throws An exception if no Hat of the specified type is found.
     * @returns The ancestor Hat of the specified type.
     */
    function over(via, type) {
        const hat = up(via, type);
        if (!hat)
            throw new Error("Hat not found.");
        return hat;
    }
    Hat.over = over;
    /**
     * Finds all descendent elements that have an attached Hat of the
     * specified type, that exist underneath the specified Node or Hat.
     *
     * @returns An array of Hats whose type matches the type specified.
     */
    function under(via, type) {
        return within(via, type, false);
    }
    Hat.under = under;
    function map(e, type) {
        e = (!(e instanceof Element) && !window.Array.isArray(e)) ? e.head : e;
        const elements = e instanceof Element ? window.Array.from(e.children) : e;
        return elements
            .map(e => of(e, type))
            .filter((o) => o instanceof type);
    }
    Hat.map = map;
    /**
     * Returns the element succeeding the specified element in
     * the DOM that is connected to a hat of the specified type.
     */
    function next(via, type) {
        via = via instanceof Element ? via : via.head;
        for (;;) {
            via = via.nextElementSibling;
            if (!(via instanceof Element))
                return null;
            const hat = of(via, type);
            if (hat)
                return hat;
        }
    }
    Hat.next = next;
    /**
     * Returns the element preceeding the specified element in the DOM
     * that is connected to a hat of the specified type.
     */
    function previous(via, type) {
        via = via instanceof Element ? via : via.head;
        for (;;) {
            via = via.previousElementSibling;
            if (!(via instanceof Element))
                return null;
            const hat = of(via, type);
            if (hat)
                return hat;
        }
    }
    Hat.previous = previous;
    /** */
    function within(via, type, one) {
        const e = via instanceof Element ? via :
            via instanceof Node ? via.parentElement :
                via.head;
        if (!e)
            throw "Cannot perform this method using the specified node.";
        const names = ctorNames.get(type);
        // If there is no class name found for the specified hat type,
        // this could possibly be an error (meaning that the hat type
        // wasn't registered). But it could also be a legitimate case of the
        // hat simply not having been registered at the time of this
        // function being called.
        if (!names || names.length === 0)
            return [];
        const descendents = names.length === 1 ?
            e.getElementsByClassName(names[0]) :
            e.querySelectorAll(names.map(n => "." + n).join());
        const hats = [];
        const len = one && descendents.length > 0 ? 1 : descendents.length;
        for (let i = -1; ++i < len;) {
            const descendent = descendents[i];
            const hat = Hat.of(descendent, type);
            if (hat)
                hats.push(hat);
        }
        return hats;
    }
    /** */
    function childrenOf(e, hatType) {
        let children = globalThis.Array.from(e.children);
        if (hatType)
            children = children.filter(e => Hat.of(e, hatType));
        return children;
    }
    /**
     * Returns a unique CSS class name that corresponds to the type
     * of the object.
     */
    function getConstructorClassNames(object) {
        const existingNames = ctorNames.get(object.constructor);
        if (existingNames)
            return existingNames;
        const ctors = [object.constructor];
        const names = [];
        for (;;) {
            const ctor = ctors[ctors.length - 1];
            const next = Object.getPrototypeOf(ctor);
            if (next === null || next === Object || next === Function)
                break;
            ctors.push(next);
        }
        for (const ctor of ctors) {
            let name = ctor.name || "";
            if (name.length < 3)
                name = "_hat_" + name + (++inc);
            names.push(name);
        }
        for (let i = ctors.length; i-- > 0;) {
            const ctor = ctors[i];
            if (!ctorNames.has(ctor))
                ctorNames.set(ctor, names.slice(i));
        }
        return names;
    }
    const ctorNames = new WeakMap();
    const hats = new WeakMap();
    const signals = new WeakMap();
    let inc = 0;
    /**
     *
     */
    class Array {
        parentElement;
        hatType;
        /** */
        constructor(parentElement, hatType) {
            this.parentElement = parentElement;
            this.hatType = hatType;
            this.marker = document.createComment("");
            parentElement.append(this.marker);
        }
        marker;
        /** */
        *[Symbol.iterator]() {
            for (let i = -1; ++i < this.parentElement.children.length;) {
                const child = this.parentElement.children.item(i);
                if (child) {
                    const hat = Hat.of(child, this.hatType);
                    if (hat)
                        yield hat;
                }
            }
        }
        map(mapFn) {
            const elements = childrenOf(this.parentElement, this.hatType);
            const hats = Hat.map(elements, this.hatType);
            return mapFn ? hats.map(mapFn) : hats;
        }
        /** */
        at(index) {
            return this.map().at(index) || null;
        }
        insert(a, ...newHats) {
            const index = typeof a === "number" ? (a || 0) : -1;
            const existingHats = this.map();
            if (typeof a === "object")
                newHats.unshift(a);
            if (newHats.length === 0)
                return;
            if (existingHats.length === 0) {
                this.parentElement.prepend(...newHats.map(c => c.head));
            }
            else {
                const target = index >= existingHats.length ?
                    existingHats.at(index).head :
                    this.marker;
                for (const hat of newHats)
                    this.parentElement.insertBefore(hat.head, target);
            }
            return index < 0 ? existingHats.length + newHats.length : index;
        }
        /** */
        move(fromIndex, toIndex) {
            const children = childrenOf(this.parentElement, this.hatType);
            const target = children.at(toIndex);
            const source = children.at(fromIndex);
            if (source && target)
                target.insertAdjacentElement("beforebegin", source);
        }
        /** */
        indexOf(hat) {
            const children = childrenOf(this.parentElement, this.hatType);
            for (let i = -1; ++i < children.length;)
                if (children[i] === hat.head)
                    return i;
            return -1;
        }
        /** */
        get length() {
            return childrenOf(this.parentElement, this.hatType).length;
        }
        /** */
        observe(callback) {
            if (this.observers.length === 0) {
                const mo = new MutationObserver(mutations => {
                    for (const mut of mutations)
                        for (const fn of this.observers)
                            fn(mut);
                });
                mo.observe(this.parentElement, { childList: true });
            }
            this.observers.push(callback);
        }
        observers = [];
        /** */
        toJSON() {
            return this.map();
        }
    }
    Hat.Array = Array;
})(Hat || (Hat = {}));
//@ts-ignore CommonJS compatibility
if (typeof module === "object")
    Object.assign(module.exports, { Hat });
// The comment and + prefix is removed during npm run bundle
//+ export { Hat }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vSGF0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7R0FFRztBQUNILElBQVUsR0FBRyxDQWdmWjtBQW5mRDs7R0FFRztBQUNILFdBQVUsR0FBRztJQWFaOztPQUVHO0lBQ0gsU0FBZ0IsSUFBSSxDQUFDLEdBQVM7UUFFN0IsTUFBTSxLQUFLLEdBQUcsd0JBQXdCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzNDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzdCLEdBQUcsQ0FBQyxJQUFZLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUM3QixHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBUmUsUUFBSSxPQVFuQixDQUFBO0lBRUQ7OztPQUdHO0lBQ0gsU0FBZ0IsS0FBSyxDQUFrRCxHQUFTLEVBQUUsTUFBUyxFQUFFLE9BQVU7UUFFdEcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQzFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFZixNQUFNLElBQUksR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakQsWUFBWSxDQUFDLElBQUksQ0FBQyxD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QUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFTdkUsNERBQTREO0FBQzVELGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbIlxuLyoqXG4gKiBcbiAqL1xubmFtZXNwYWNlIEhhdFxue1xuXHQvKiogKi9cblx0ZXhwb3J0IGludGVyZmFjZSBJSGF0XG5cdHtcblx0XHRyZWFkb25seSBoZWFkOiBFbGVtZW50O1xuXHR9XG5cdFxuXHQvKiogKi9cblx0dHlwZSBDb25zdHJ1Y3RvcjxUID0gYW55PiA9IFxuXHRcdChhYnN0cmFjdCBuZXcgKC4uLmFyZ3M6IGFueSkgPT4gVCkgfCBcblx0XHQobmV3ICguLi5hcmdzOiBhbnkpID0+IFQpO1xuXHRcblx0LyoqXG5cdCAqIE1hcmtzIGFuIG9iamVjdCBhcyBhIEhhdC4gKE9yIGZvcm1hbGx54oCTYW4gXCJBbm9ueW1vdXMgQ29udHJvbGxlciBDbGFzc1wiKS5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiB3ZWFyKGhhdDogSUhhdClcblx0e1xuXHRcdGNvbnN0IG5hbWVzID0gZ2V0Q29uc3RydWN0b3JDbGFzc05hbWVzKGhhdCk7XG5cdFx0Y29uc3QgaGF0c0FycmF5ID0gaGF0cy5nZXQoaGF0LmhlYWQpIHx8IFtdO1xuXHRcdGhhdHNBcnJheS5wdXNoKGhhdCk7XG5cdFx0aGF0cy5zZXQoaGF0LmhlYWQsIGhhdHNBcnJheSk7XG5cdFx0KGhhdC5oZWFkIGFzIGFueSkuX2hhdCA9IGhhdDtcblx0XHRoYXQuaGVhZC5jbGFzc0xpc3QuYWRkKC4uLm5hbWVzKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIEVuYWJsZXMgYSBoYXQgdG8gaGF2ZSB0aGUgYWJpbGl0eSB0byByZXNwb25kIHRvIHNpZ25hbGluZyBmdW5jdGlvbnMuXG5cdCAqIE1hcmtzIHRoZSBoYXQgYXJndW1lbnQgYXMgYSBoYXQsIGlmIGl0IGhhcyBub3QgYmVlbiBkb25lIHNvIGFscmVhZHkuXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gd2F0Y2g8SCBleHRlbmRzIEYsIEYgZXh0ZW5kcyAoLi4uYXJnczogYW55W10pID0+IHZvaWQ+KGhhdDogSUhhdCwgc2lnbmFsOiBGLCBoYW5kbGVyOiBIKVxuXHR7XG5cdFx0aWYgKChoYXRzLmdldChoYXQuaGVhZCkgfHwgW10pLmxlbmd0aCA9PT0gMClcblx0XHRcdEhhdC53ZWFyKGhhdCk7XG5cdFx0XG5cdFx0Y29uc3QgbmFtZSA9IGdldFNpZ25hbENsYXNzTmFtZShzaWduYWwpO1xuXHRcdGNvbnN0IHNpZ25hbHNBcnJheSA9IHNpZ25hbHMuZ2V0KGhhdC5oZWFkKSB8fCBbXTtcblx0XHRzaWduYWxzQXJyYXkucHVzaChbc2lnbmFsLCBoYW5kbGVyLmJpbmQoaGF0KV0pO1xuXHRcdHNpZ25hbHMuc2V0KGhhdC5oZWFkLCBzaWduYWxzQXJyYXkpO1xuXHRcdGhhdC5oZWFkLmNsYXNzTGlzdC5hZGQobmFtZSk7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBTZW5kcyBhIGNhbGwgc2lnbmFsIHRvIGFsbCBIYXRzIGluIHRoZSBkb2N1bWVudCB0aGF0IGhhdmUgc3Vic2NyaWJlZFxuXHQgKiB0byBpbnZva2F0aW9ucyBvZiB0aGUgc3BlY2lmaWVkIHNpZ25hbCBmdW5jdGlvbi5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBzaWduYWw8QSBleHRlbmRzIGFueVtdLCBGIGV4dGVuZHMgKC4uLmFyZ3M6IEEpID0+IHZvaWQ+KHJlZjogRiwgLi4uYXJnczogQSlcblx0e1xuXHRcdGNvbnN0IGNscyA9IGdldFNpZ25hbENsYXNzTmFtZShyZWYpO1xuXHRcdGNvbnN0IGVsZW1lbnRzID0gZG9jdW1lbnQuYm9keS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNscyk7XG5cdFx0XG5cdFx0Zm9yIChsZXQgaSA9IC0xOyArK2kgPCBlbGVtZW50cy5sZW5ndGg7KVxuXHRcdHtcblx0XHRcdGNvbnN0IGUgPSBlbGVtZW50cy5pdGVtKGkpO1xuXHRcdFx0aWYgKCFlKVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFxuXHRcdFx0Y29uc3Qgc2lnbmFsc0FycmF5ID0gc2lnbmFscy5nZXQoZSkgfHwgW107XG5cdFx0XHRmb3IgKGNvbnN0IFtzaWduYWxGdW5jdGlvbiwgYm91bmRGdW5jdGlvbl0gb2Ygc2lnbmFsc0FycmF5KVxuXHRcdFx0XHRpZiAoc2lnbmFsRnVuY3Rpb24gPT09IHJlZilcblx0XHRcdFx0XHRib3VuZEZ1bmN0aW9uKC4uLmFyZ3MpO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqICovXG5cdGZ1bmN0aW9uIGdldFNpZ25hbENsYXNzTmFtZShmbjogKC4uLmFyZ3M6IGFueSkgPT4gdm9pZClcblx0e1xuXHRcdGlmICghZm4ubmFtZSlcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCB1c2UgYW4gdW5uYW1lZCBmdW5jdGlvbiBhcyBzaWduYWxlclwiKTtcblx0XHRcblx0XHRyZXR1cm4gc2lnbmFsUHJlZml4ICsgZm4ubmFtZTtcblx0fVxuXHRcblx0Y29uc3Qgc2lnbmFsUHJlZml4ID0gXCJzaWduYWw6XCI7XG5cdFxuXHQvKipcblx0ICogQHJldHVybnMgQW4gYXJyYXkgdGhhdCBjb250YWlucyBhbGwgdGhhdCBoYXRzIHRoYXQgaGF2ZSBiZWVuIGFzc2lnbmVkIHRvXG5cdCAqIHRoZSBzcGVjaWZpZWQgTm9kZS5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBvZjxUIGV4dGVuZHMgSUhhdD4oZTogTm9kZSB8IG51bGwgfCB1bmRlZmluZWQpOiBUW107XG5cdC8qKlxuXHQgKiBAcmV0dXJucyBUaGUgSGF0IG9mIHRoZSBzcGVjaWZpZWQgTm9kZSB3aXRoIHRoZSBzcGVjaWZpZWQgSGF0IHR5cGUsXG5cdCAqIG9yIG51bGwgaW4gdGhlIGNhc2Ugd2hlbiB0aGUgTm9kZSBpcyBub3Qgd2VhcmluZyBhIEhhdCBvZiB0aGUgc3BlY2lmaWVkIHR5cGUuXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gb2Y8VCBleHRlbmRzIElIYXQ+KGU6IE5vZGUgfCBudWxsIHwgdW5kZWZpbmVkLCB0eXBlOiBDb25zdHJ1Y3RvcjxUPik6IFQgfCBudWxsO1xuXHRleHBvcnQgZnVuY3Rpb24gb2Y8VCBleHRlbmRzIElIYXQ+KGU6IE5vZGUgfCBudWxsIHwgdW5kZWZpbmVkLCB0eXBlPzogQ29uc3RydWN0b3I8VD4pXG5cdHtcblx0XHRpZiAoIWUpXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcblx0XHRpZiAoIXR5cGUpXG5cdFx0XHRyZXR1cm4gKGhhdHMuZ2V0KGUgYXMgRWxlbWVudCkgfHwgW10pLnNsaWNlKCk7XG5cdFx0XG5cdFx0bGV0IGN1cnJlbnQ6IE5vZGUgfCBudWxsID0gZTtcblx0XHRcblx0XHRmb3IgKDs7KVxuXHRcdHtcblx0XHRcdGNvbnN0IGFycmF5ID0gaGF0cy5nZXQoY3VycmVudCBhcyBFbGVtZW50KTtcblx0XHRcdFxuXHRcdFx0aWYgKGFycmF5KVxuXHRcdFx0XHRmb3IgKGNvbnN0IG9iaiBvZiBhcnJheSlcblx0XHRcdFx0XHRpZiAob2JqIGluc3RhbmNlb2YgdHlwZSlcblx0XHRcdFx0XHRcdHJldHVybiBvYmo7XG5cdFx0XHRcblx0XHRcdGlmICghKGN1cnJlbnQucGFyZW50RWxlbWVudCBpbnN0YW5jZW9mIEVsZW1lbnQpKVxuXHRcdFx0XHRicmVhaztcblx0XHRcdFxuXHRcdFx0Y3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudDtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBTY2FucyB1cHdhcmQgdGhyb3VnaCB0aGUgRE9NLCBzdGFydGluZyBhdCB0aGUgc3BlY2lmaWVkIG9iamVjdCxcblx0ICogYW5kIHBlcmZvcm1zIGEgbG9vay1kb3duIGF0IGVhY2ggbGF5ZXIgaW4gb3JkZXIgdG8gZmluZCBhIEhhdCBvZlxuXHQgKiB0aGUgc3BlY2lmaWVkIHR5cGUsIHdoaWNoIGlzIG5lYXJlc3QgaW4gdGhlIERPTSB0byB0aGUgc3BlY2lmaWVkXG5cdCAqIE5vZGUgb3IgSGF0LlxuXHQgKiBcblx0ICogQHJldHVybnMgQSByZWZlcmVuY2UgdG8gdGhlIEhhdCB0aGF0IGlzIG5lYXJlc3QgdG8gdGhlIHNwZWNpZmllZFxuXHQgKiBvYmplY3QuXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gbmVhcmVzdDxUIGV4dGVuZHMgSUhhdD4oXG5cdFx0dmlhOiBOb2RlIHwgSUhhdCxcblx0XHR0eXBlOiBDb25zdHJ1Y3RvcjxUPilcblx0e1xuXHRcdGxldCBjdXJyZW50OiBOb2RlIHwgbnVsbCA9IHZpYSBpbnN0YW5jZW9mIE5vZGUgPyB2aWEgOiB2aWEuaGVhZDtcblx0XHRcblx0XHR3aGlsZSAoY3VycmVudCBpbnN0YW5jZW9mIE5vZGUpXG5cdFx0e1xuXHRcdFx0aWYgKGN1cnJlbnQgaW5zdGFuY2VvZiBFbGVtZW50KVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBtYXliZSA9IEhhdC5kb3duKGN1cnJlbnQsIHR5cGUpO1xuXHRcdFx0XHRpZiAobWF5YmUpXG5cdFx0XHRcdFx0cmV0dXJuIG1heWJlO1xuXHRcdFx0fVxuXHRcdFx0Y3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudDtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBTY2FucyB1cHdhcmQgdGhyb3VnaCB0aGUgRE9NLCBzdGFydGluZyBhdCB0aGUgc3BlY2lmaWVkIE5vZGUsIFxuXHQgKiBsb29raW5nIGZvciB0aGUgZmlyc3QgZWxlbWVudCB3ZWFyaW5nIGEgSGF0IG9mIHRoZSBzcGVjaWZpZWQgdHlwZS5cblx0ICogXG5cdCAqIEByZXR1cm5zIEEgcmVmZXJlbmNlIHRvIHRoZSBIYXQgdGhhdCBleGlzdHMgYWJvdmUgdGhlIHNwZWNpZmllZCBOb2RlXG5cdCAqIGluIHRoZSBET00sIG9yIG51bGwgaWYgbm8gc3VjaCBIYXQgd2FzIGZvdW5kLlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIHVwPFQgZXh0ZW5kcyBJSGF0Pihcblx0XHR2aWE6IE5vZGUgfCBJSGF0LFxuXHRcdHR5cGU6IENvbnN0cnVjdG9yPFQ+KVxuXHR7XG5cdFx0bGV0IGN1cnJlbnQ6IE5vZGUgfCBudWxsID0gdmlhIGluc3RhbmNlb2YgTm9kZSA/IHZpYSA6IHZpYS5oZWFkO1xuXHRcdFxuXHRcdHdoaWxlIChjdXJyZW50IGluc3RhbmNlb2YgTm9kZSlcblx0XHR7XG5cdFx0XHRpZiAoY3VycmVudCBpbnN0YW5jZW9mIEVsZW1lbnQpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGhhdCA9IEhhdC5vZihjdXJyZW50LCB0eXBlKTtcblx0XHRcdFx0aWYgKGhhdClcblx0XHRcdFx0XHRyZXR1cm4gaGF0O1xuXHRcdFx0fVxuXHRcdFx0Y3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudDtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBGaW5kcyB0aGUgZmlyc3QgZGVzY2VuZGVudCBlbGVtZW50IHRoYXQgaGFzIGFuIGF0dGFjaGVkIEhhdCBvZiB0aGVcblx0ICogc3BlY2lmaWVkIHR5cGUsIHRoYXQgZXhpc3RzIHVuZGVybmVhdGggdGhlIHNwZWNpZmllZCBOb2RlIG9yIEhhdC5cblx0ICogXG5cdCAqIEByZXR1cm5zIFRoZSBIYXQgYXNzb2NpYXRlZCB3aXRoIHRoZSBkZXNjZW5kZW50IGVsZW1lbnQsIG9yXG5cdCAqIG51bGwgaWYgbm8gc3VjaCBIYXQgaXMgZm91bmQuXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gZG93bjxUIGV4dGVuZHMgSUhhdD4odmlhOiBOb2RlIHwgSUhhdCwgdHlwZTogQ29uc3RydWN0b3I8VD4pXG5cdHtcblx0XHRjb25zdCBoYXRzID0gd2l0aGluKHZpYSwgdHlwZSwgdHJ1ZSk7XG5cdFx0cmV0dXJuIGhhdHMubGVuZ3RoID4gMCA/IGhhdHNbMF0gOiBudWxsO1xuXHR9XG5cdFxuXHQvKipcblx0ICogU2NhbnMgdXB3YXJkIHRocm91Z2ggdGhlIERPTSwgc3RhcnRpbmcgYXQgdGhlIHNwZWNpZmllZCBOb2RlLCBcblx0ICogbG9va2luZyBmb3IgdGhlIGZpcnN0IGVsZW1lbnQgd2VhcmluZyBhIEhhdCBvZiB0aGUgc3BlY2lmaWVkIHR5cGUuXG5cdCAqIFxuXHQgKiBAdGhyb3dzIEFuIGV4Y2VwdGlvbiBpZiBubyBIYXQgb2YgdGhlIHNwZWNpZmllZCB0eXBlIGlzIGZvdW5kLlxuXHQgKiBAcmV0dXJucyBUaGUgYW5jZXN0b3IgSGF0IG9mIHRoZSBzcGVjaWZpZWQgdHlwZS5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBvdmVyPFQgZXh0ZW5kcyBJSGF0Pihcblx0XHR2aWE6IE5vZGUgfCBJSGF0LFxuXHRcdHR5cGU6IENvbnN0cnVjdG9yPFQ+KVxuXHR7XG5cdFx0Y29uc3QgaGF0ID0gdXAodmlhLCB0eXBlKTtcblx0XHRpZiAoIWhhdClcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkhhdCBub3QgZm91bmQuXCIpO1xuXHRcdFxuXHRcdHJldHVybiBoYXQ7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBGaW5kcyBhbGwgZGVzY2VuZGVudCBlbGVtZW50cyB0aGF0IGhhdmUgYW4gYXR0YWNoZWQgSGF0IG9mIHRoZVxuXHQgKiBzcGVjaWZpZWQgdHlwZSwgdGhhdCBleGlzdCB1bmRlcm5lYXRoIHRoZSBzcGVjaWZpZWQgTm9kZSBvciBIYXQuXG5cdCAqIFxuXHQgKiBAcmV0dXJucyBBbiBhcnJheSBvZiBIYXRzIHdob3NlIHR5cGUgbWF0Y2hlcyB0aGUgdHlwZSBzcGVjaWZpZWQuXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gdW5kZXI8VCBleHRlbmRzIElIYXQ+KHZpYTogTm9kZSB8IElIYXQsIHR5cGU6IENvbnN0cnVjdG9yPFQ+KVxuXHR7XG5cdFx0cmV0dXJuIHdpdGhpbih2aWEsIHR5cGUsIGZhbHNlKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJldHVybnMgYW4gYXJyYXkgb2YgSGF0cyBvZiB0aGUgc3BlY2lmaWVkIHR5cGUsXG5cdCAqIHdoaWNoIGFyZSBleHRyYWN0ZWQgZnJvbSB0aGUgc3BlY2lmaWVkIGFycmF5IG9mIGVsZW1lbnRzLlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIG1hcDxUIGV4dGVuZHMgSUhhdD4oZWxlbWVudHM6IEVsZW1lbnRbXSwgdHlwZTogQ29uc3RydWN0b3I8VD4pOiBUW107XG5cdGV4cG9ydCBmdW5jdGlvbiBtYXA8VCBleHRlbmRzIElIYXQ+KGVsZW1lbnRDb250YWluZXI6IEVsZW1lbnQgfCBJSGF0LCB0eXBlOiBDb25zdHJ1Y3RvcjxUPik6IFRbXTtcblx0ZXhwb3J0IGZ1bmN0aW9uIG1hcDxUIGV4dGVuZHMgSUhhdD4oZTogSUhhdCB8IEVsZW1lbnQgfCBFbGVtZW50W10sIHR5cGU6IENvbnN0cnVjdG9yPFQ+KTogVFtdXG5cdHtcblx0XHRlID0gKCEoZSBpbnN0YW5jZW9mIEVsZW1lbnQpICYmICF3aW5kb3cuQXJyYXkuaXNBcnJheShlKSkgPyBlLmhlYWQgOiBlO1xuXHRcdGNvbnN0IGVsZW1lbnRzID0gZSBpbnN0YW5jZW9mIEVsZW1lbnQgPyB3aW5kb3cuQXJyYXkuZnJvbShlLmNoaWxkcmVuKSA6IGU7XG5cdFx0cmV0dXJuIGVsZW1lbnRzXG5cdFx0XHQubWFwKGUgPT4gb2YoZSwgdHlwZSkpXG5cdFx0XHQuZmlsdGVyKChvKTogbyBpcyBUID0+IG8gaW5zdGFuY2VvZiB0eXBlKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGVsZW1lbnQgc3VjY2VlZGluZyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgaW5cblx0ICogdGhlIERPTSB0aGF0IGlzIGNvbm5lY3RlZCB0byBhIGhhdCBvZiB0aGUgc3BlY2lmaWVkIHR5cGUuXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gbmV4dDxUIGV4dGVuZHMgSUhhdD4odmlhOiBFbGVtZW50IHwgSUhhdCwgdHlwZTogQ29uc3RydWN0b3I8VD4pOiBUIHwgbnVsbFxuXHR7XG5cdFx0dmlhID0gdmlhIGluc3RhbmNlb2YgRWxlbWVudCA/IHZpYSA6IHZpYS5oZWFkO1xuXHRcdFxuXHRcdGZvciAoOzspXG5cdFx0e1xuXHRcdFx0dmlhID0gdmlhLm5leHRFbGVtZW50U2libGluZyBhcyBFbGVtZW50O1xuXHRcdFx0aWYgKCEodmlhIGluc3RhbmNlb2YgRWxlbWVudCkpXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0XG5cdFx0XHRjb25zdCBoYXQgPSBvZih2aWEsIHR5cGUpO1xuXHRcdFx0aWYgKGhhdClcblx0XHRcdFx0cmV0dXJuIGhhdDtcblx0XHR9XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBlbGVtZW50IHByZWNlZWRpbmcgdGhlIHNwZWNpZmllZCBlbGVtZW50IGluIHRoZSBET01cblx0ICogdGhhdCBpcyBjb25uZWN0ZWQgdG8gYSBoYXQgb2YgdGhlIHNwZWNpZmllZCB0eXBlLlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIHByZXZpb3VzPFQgZXh0ZW5kcyBJSGF0Pih2aWE6IEVsZW1lbnQgfCBJSGF0LCB0eXBlOiBDb25zdHJ1Y3RvcjxUPik6IFQgfCBudWxsXG5cdHtcblx0XHR2aWEgPSB2aWEgaW5zdGFuY2VvZiBFbGVtZW50ID8gdmlhIDogdmlhLmhlYWQ7XG5cdFx0XG5cdFx0Zm9yICg7Oylcblx0XHR7XG5cdFx0XHR2aWEgPSB2aWEucHJldmlvdXNFbGVtZW50U2libGluZyBhcyBFbGVtZW50O1xuXHRcdFx0aWYgKCEodmlhIGluc3RhbmNlb2YgRWxlbWVudCkpXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0XG5cdFx0XHRjb25zdCBoYXQgPSBvZih2aWEsIHR5cGUpO1xuXHRcdFx0aWYgKGhhdClcblx0XHRcdFx0cmV0dXJuIGhhdDtcblx0XHR9XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRmdW5jdGlvbiB3aXRoaW48VCBleHRlbmRzIElIYXQ+KHZpYTogTm9kZSB8IElIYXQsIHR5cGU6IENvbnN0cnVjdG9yPFQ+LCBvbmU6IGJvb2xlYW4pXG5cdHtcblx0XHRjb25zdCBlID0gXG5cdFx0XHR2aWEgaW5zdGFuY2VvZiBFbGVtZW50ID8gdmlhIDogXG5cdFx0XHR2aWEgaW5zdGFuY2VvZiBOb2RlID8gdmlhLnBhcmVudEVsZW1lbnQgOlxuXHRcdFx0dmlhLmhlYWQ7XG5cdFx0XG5cdFx0aWYgKCFlKVxuXHRcdFx0dGhyb3cgXCJDYW5ub3QgcGVyZm9ybSB0aGlzIG1ldGhvZCB1c2luZyB0aGUgc3BlY2lmaWVkIG5vZGUuXCI7XG5cdFx0XG5cdFx0Y29uc3QgbmFtZXMgPSBjdG9yTmFtZXMuZ2V0KHR5cGUpO1xuXHRcdFxuXHRcdC8vIElmIHRoZXJlIGlzIG5vIGNsYXNzIG5hbWUgZm91bmQgZm9yIHRoZSBzcGVjaWZpZWQgaGF0IHR5cGUsXG5cdFx0Ly8gdGhpcyBjb3VsZCBwb3NzaWJseSBiZSBhbiBlcnJvciAobWVhbmluZyB0aGF0IHRoZSBoYXQgdHlwZVxuXHRcdC8vIHdhc24ndCByZWdpc3RlcmVkKS4gQnV0IGl0IGNvdWxkIGFsc28gYmUgYSBsZWdpdGltYXRlIGNhc2Ugb2YgdGhlXG5cdFx0Ly8gaGF0IHNpbXBseSBub3QgaGF2aW5nIGJlZW4gcmVnaXN0ZXJlZCBhdCB0aGUgdGltZSBvZiB0aGlzXG5cdFx0Ly8gZnVuY3Rpb24gYmVpbmcgY2FsbGVkLlxuXHRcdGlmICghbmFtZXMgfHwgbmFtZXMubGVuZ3RoID09PSAwKVxuXHRcdFx0cmV0dXJuIFtdO1xuXHRcdFxuXHRcdGNvbnN0IGRlc2NlbmRlbnRzID0gbmFtZXMubGVuZ3RoID09PSAxID8gXG5cdFx0XHRlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUobmFtZXNbMF0pIDpcblx0XHRcdGUucXVlcnlTZWxlY3RvckFsbChuYW1lcy5tYXAobiA9PiBcIi5cIiArIG4pLmpvaW4oKSk7XG5cdFx0XG5cdFx0Y29uc3QgaGF0czogVFtdID0gW107XG5cdFx0Y29uc3QgbGVuID0gb25lICYmIGRlc2NlbmRlbnRzLmxlbmd0aCA+IDAgPyAxIDogZGVzY2VuZGVudHMubGVuZ3RoO1xuXHRcdFxuXHRcdGZvciAobGV0IGkgPSAtMTsgKytpIDwgbGVuOylcblx0XHR7XG5cdFx0XHRjb25zdCBkZXNjZW5kZW50ID0gZGVzY2VuZGVudHNbaV07XG5cdFx0XHRjb25zdCBoYXQgPSBIYXQub2YoZGVzY2VuZGVudCwgdHlwZSk7XG5cdFx0XHRpZiAoaGF0KVxuXHRcdFx0XHRoYXRzLnB1c2goaGF0KTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIGhhdHM7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRmdW5jdGlvbiBjaGlsZHJlbk9mPFQgZXh0ZW5kcyBJSGF0PihlOiBFbGVtZW50LCBoYXRUeXBlPzogQ29uc3RydWN0b3I8VD4pXG5cdHtcblx0XHRsZXQgY2hpbGRyZW4gPSBnbG9iYWxUaGlzLkFycmF5LmZyb20oZS5jaGlsZHJlbik7XG5cdFx0XG5cdFx0aWYgKGhhdFR5cGUpXG5cdFx0XHRjaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlcihlID0+IEhhdC5vZihlLCBoYXRUeXBlKSk7XG5cdFx0XG5cdFx0cmV0dXJuIGNoaWxkcmVuO1xuXHR9XG5cdFxuXHQvKipcblx0ICogUmV0dXJucyBhIHVuaXF1ZSBDU1MgY2xhc3MgbmFtZSB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSB0eXBlXG5cdCAqIG9mIHRoZSBvYmplY3QuXG5cdCAqL1xuXHRmdW5jdGlvbiBnZXRDb25zdHJ1Y3RvckNsYXNzTmFtZXMob2JqZWN0OiBvYmplY3QpXG5cdHtcblx0XHRjb25zdCBleGlzdGluZ05hbWVzID0gY3Rvck5hbWVzLmdldChvYmplY3QuY29uc3RydWN0b3IpO1xuXHRcdGlmIChleGlzdGluZ05hbWVzKVxuXHRcdFx0cmV0dXJuIGV4aXN0aW5nTmFtZXM7XG5cdFx0XG5cdFx0Y29uc3QgY3RvcnM6IGFueVtdID0gW29iamVjdC5jb25zdHJ1Y3Rvcl07XG5cdFx0Y29uc3QgbmFtZXM6IHN0cmluZ1tdID0gW107XG5cdFx0XG5cdFx0Zm9yICg7Oylcblx0XHR7XG5cdFx0XHRjb25zdCBjdG9yID0gY3RvcnNbY3RvcnMubGVuZ3RoIC0gMV07XG5cdFx0XHRjb25zdCBuZXh0ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGN0b3IpO1xuXHRcdFx0aWYgKG5leHQgPT09IG51bGwgfHwgbmV4dCA9PT0gT2JqZWN0IHx8IG5leHQgPT09IEZ1bmN0aW9uKVxuXHRcdFx0XHRicmVhaztcblx0XHRcdFxuXHRcdFx0Y3RvcnMucHVzaChuZXh0KTtcblx0XHR9XG5cdFx0XG5cdFx0Zm9yIChjb25zdCBjdG9yIG9mIGN0b3JzKVxuXHRcdHtcblx0XHRcdGxldCBuYW1lID0gY3Rvci5uYW1lIHx8IFwiXCI7XG5cdFx0XHRcblx0XHRcdGlmIChuYW1lLmxlbmd0aCA8IDMpXG5cdFx0XHRcdG5hbWUgPSBcIl9oYXRfXCIgKyBuYW1lICsgKCsraW5jKTtcblx0XHRcdFxuXHRcdFx0bmFtZXMucHVzaChuYW1lKTtcblx0XHR9XG5cdFx0XG5cdFx0Zm9yIChsZXQgaSA9IGN0b3JzLmxlbmd0aDsgaS0tID4gMDspXG5cdFx0e1xuXHRcdFx0Y29uc3QgY3RvciA9IGN0b3JzW2ldO1xuXHRcdFx0aWYgKCFjdG9yTmFtZXMuaGFzKGN0b3IpKVxuXHRcdFx0XHRjdG9yTmFtZXMuc2V0KGN0b3IsIG5hbWVzLnNsaWNlKGkpKTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIG5hbWVzO1xuXHR9XG5cdFxuXHRjb25zdCBjdG9yTmFtZXMgPSBuZXcgV2Vha01hcDxGdW5jdGlvbiwgc3RyaW5nW10+KCk7XG5cdGNvbnN0IGhhdHMgPSBuZXcgV2Vha01hcDxFbGVtZW50LCBvYmplY3RbXT4oKTtcblx0Y29uc3Qgc2lnbmFscyA9IG5ldyBXZWFrTWFwPG9iamVjdCwgW0Z1bmN0aW9uLCBGdW5jdGlvbl1bXT4oKTtcblx0bGV0IGluYyA9IDA7XG5cdFxuXHQvKipcblx0ICogXG5cdCAqL1xuXHRleHBvcnQgY2xhc3MgQXJyYXk8VEhhdCBleHRlbmRzIElIYXQgPSBJSGF0PlxuXHR7XG5cdFx0LyoqICovXG5cdFx0Y29uc3RydWN0b3IoXG5cdFx0XHRwcml2YXRlIHJlYWRvbmx5IHBhcmVudEVsZW1lbnQ6IEVsZW1lbnQsXG5cdFx0XHRwcml2YXRlIHJlYWRvbmx5IGhhdFR5cGU6IENvbnN0cnVjdG9yPFRIYXQ+KVxuXHRcdHtcblx0XHRcdHRoaXMubWFya2VyID0gZG9jdW1lbnQuY3JlYXRlQ29tbWVudChcIlwiKTtcblx0XHRcdHBhcmVudEVsZW1lbnQuYXBwZW5kKHRoaXMubWFya2VyKTtcblx0XHR9XG5cdFx0XG5cdFx0cHJpdmF0ZSByZWFkb25seSBtYXJrZXI6IENvbW1lbnQ7XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0KiBbU3ltYm9sLml0ZXJhdG9yXSgpXG5cdFx0e1xuXHRcdFx0Zm9yIChsZXQgaSA9IC0xOyArK2kgPCB0aGlzLnBhcmVudEVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoOylcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgY2hpbGQgPSB0aGlzLnBhcmVudEVsZW1lbnQuY2hpbGRyZW4uaXRlbShpKTtcblx0XHRcdFx0aWYgKGNoaWxkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc3QgaGF0ID0gSGF0Lm9mKGNoaWxkLCB0aGlzLmhhdFR5cGUpO1xuXHRcdFx0XHRcdGlmIChoYXQpXG5cdFx0XHRcdFx0XHR5aWVsZCBoYXQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0bWFwKCk6IFRIYXRbXTtcblx0XHRtYXA8VD4obWFwRm46ICh2YWx1ZTogVEhhdCwgaW5kZXg6IG51bWJlciwgYXJyYXk6IFRIYXRbXSkgPT4gVCk6IFRbXTtcblx0XHRtYXAobWFwRm4/OiAodmFsdWU6IFRIYXQsIGluZGV4OiBudW1iZXIsIGFycmF5OiBUSGF0W10pID0+IGFueSlcblx0XHR7XG5cdFx0XHRjb25zdCBlbGVtZW50cyA9IGNoaWxkcmVuT2YodGhpcy5wYXJlbnRFbGVtZW50LCB0aGlzLmhhdFR5cGUpO1xuXHRcdFx0Y29uc3QgaGF0cyA9IEhhdC5tYXAoZWxlbWVudHMsIHRoaXMuaGF0VHlwZSk7XG5cdFx0XHRyZXR1cm4gbWFwRm4gPyBoYXRzLm1hcChtYXBGbikgOiBoYXRzO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRhdChpbmRleDogbnVtYmVyKVxuXHRcdHtcblx0XHRcdHJldHVybiB0aGlzLm1hcCgpLmF0KGluZGV4KSB8fCBudWxsO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRpbnNlcnQoLi4uaGF0czogVEhhdFtdKTogbnVtYmVyO1xuXHRcdGluc2VydChpbmRleDogbnVtYmVyLCAuLi5oYXRzOiBUSGF0W10pOiBudW1iZXI7XG5cdFx0aW5zZXJ0KGE6IG51bWJlciB8IFRIYXQsIC4uLm5ld0hhdHM6IFRIYXRbXSlcblx0XHR7XG5cdFx0XHRjb25zdCBpbmRleCA9IHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gKGEgfHwgMCkgOiAtMTtcblx0XHRcdGNvbnN0IGV4aXN0aW5nSGF0cyA9IHRoaXMubWFwKCk7XG5cdFx0XHRcblx0XHRcdGlmICh0eXBlb2YgYSA9PT0gXCJvYmplY3RcIilcblx0XHRcdFx0bmV3SGF0cy51bnNoaWZ0KGEpO1xuXHRcdFx0XG5cdFx0XHRpZiAobmV3SGF0cy5sZW5ndGggPT09IDApXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdFxuXHRcdFx0aWYgKGV4aXN0aW5nSGF0cy5sZW5ndGggPT09IDApXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMucGFyZW50RWxlbWVudC5wcmVwZW5kKC4uLm5ld0hhdHMubWFwKGMgPT4gYy5oZWFkKSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHRhcmdldCA9IGluZGV4ID49IGV4aXN0aW5nSGF0cy5sZW5ndGggPyBcblx0XHRcdFx0XHQoZXhpc3RpbmdIYXRzLmF0KGluZGV4KSBhcyBJSGF0KS5oZWFkIDpcblx0XHRcdFx0XHR0aGlzLm1hcmtlcjtcblx0XHRcdFx0XG5cdFx0XHRcdGZvciAoY29uc3QgaGF0IG9mIG5ld0hhdHMpXG5cdFx0XHRcdFx0dGhpcy5wYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShoYXQuaGVhZCwgdGFyZ2V0KTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0cmV0dXJuIGluZGV4IDwgMCA/IGV4aXN0aW5nSGF0cy5sZW5ndGggKyBuZXdIYXRzLmxlbmd0aCA6IGluZGV4O1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRtb3ZlKGZyb21JbmRleDogbnVtYmVyLCB0b0luZGV4OiBudW1iZXIpXG5cdFx0e1xuXHRcdFx0Y29uc3QgY2hpbGRyZW4gPSBjaGlsZHJlbk9mKHRoaXMucGFyZW50RWxlbWVudCwgdGhpcy5oYXRUeXBlKTtcblx0XHRcdGNvbnN0IHRhcmdldCA9IGNoaWxkcmVuLmF0KHRvSW5kZXgpO1xuXHRcdFx0Y29uc3Qgc291cmNlID0gY2hpbGRyZW4uYXQoZnJvbUluZGV4KTtcblx0XHRcdFxuXHRcdFx0aWYgKHNvdXJjZSAmJiB0YXJnZXQpXG5cdFx0XHRcdHRhcmdldC5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmViZWdpblwiLCBzb3VyY2UpO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRpbmRleE9mKGhhdDogVEhhdClcblx0XHR7XG5cdFx0XHRjb25zdCBjaGlsZHJlbiA9IGNoaWxkcmVuT2YodGhpcy5wYXJlbnRFbGVtZW50LCB0aGlzLmhhdFR5cGUpO1xuXHRcdFx0Zm9yIChsZXQgaSA9IC0xOyArK2kgPCBjaGlsZHJlbi5sZW5ndGg7KVxuXHRcdFx0XHRpZiAoY2hpbGRyZW5baV0gPT09IGhhdC5oZWFkKVxuXHRcdFx0XHRcdHJldHVybiBpO1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4gLTE7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdGdldCBsZW5ndGgoKVxuXHRcdHtcblx0XHRcdHJldHVybiBjaGlsZHJlbk9mKHRoaXMucGFyZW50RWxlbWVudCwgdGhpcy5oYXRUeXBlKS5sZW5ndGg7XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdG9ic2VydmUoY2FsbGJhY2s6IChtdXQ6IE11dGF0aW9uUmVjb3JkKSA9PiB2b2lkKVxuXHRcdHtcblx0XHRcdGlmICh0aGlzLm9ic2VydmVycy5sZW5ndGggPT09IDApXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IG1vID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIobXV0YXRpb25zID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRmb3IgKGNvbnN0IG11dCBvZiBtdXRhdGlvbnMpXG5cdFx0XHRcdFx0XHRmb3IgKGNvbnN0IGZuIG9mIHRoaXMub2JzZXJ2ZXJzKVxuXHRcdFx0XHRcdFx0XHRmbihtdXQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0XG5cdFx0XHRcdG1vLm9ic2VydmUodGhpcy5wYXJlbnRFbGVtZW50LCB7IGNoaWxkTGlzdDogdHJ1ZSB9KTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dGhpcy5vYnNlcnZlcnMucHVzaChjYWxsYmFjayk7XG5cdFx0fVxuXHRcdFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgb2JzZXJ2ZXJzOiAoKG11dDogTXV0YXRpb25SZWNvcmQpID0+IHZvaWQpW10gPSBbXTtcblx0XHRcblx0XHQvKiogKi9cblx0XHRwcml2YXRlIHRvSlNPTigpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHRoaXMubWFwKCk7XG5cdFx0fVxuXHR9XG59XG5cbi8vQHRzLWlnbm9yZSBDb21tb25KUyBjb21wYXRpYmlsaXR5XG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIikgT2JqZWN0LmFzc2lnbihtb2R1bGUuZXhwb3J0cywgeyBIYXQgfSk7XG5cbi8vIEVTIG1vZHVsZSBjb21wYXRpYmlsaXR5XG5kZWNsYXJlIG1vZHVsZSBcImhhdGpzXCJcbntcblx0Y29uc3QgX19leHBvcnQ6IHsgSGF0OiB0eXBlb2YgSGF0IH07XG5cdGV4cG9ydCA9IF9fZXhwb3J0O1xufVxuXG4vLyBUaGUgY29tbWVudCBhbmQgKyBwcmVmaXggaXMgcmVtb3ZlZCBkdXJpbmcgbnBtIHJ1biBidW5kbGVcbi8vKyBleHBvcnQgeyBIYXQgfVxuIl19