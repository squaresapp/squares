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
     * Marks the specified class as a Hat, and returns a chainable
     * function to allow the Hat to respond to signaling functions.
     */
    function wear(hat) {
        const names = getConstructorClassNames(hat);
        const hatsArray = hats.get(hat.head) || [];
        hatsArray.push(hat);
        hats.set(hat.head, hatsArray);
        hat.head._hat = hat;
        hat.head.classList.add(...names);
        const result = {
            wear(signal, handler) {
                const name = getSignalClassName(signal);
                const signalsArray = signals.get(hat.head) || [];
                signalsArray.push([signal, handler.bind(hat)]);
                signals.set(hat.head, signalsArray);
                hat.head.classList.add(name);
                return result;
            }
        };
        return result;
    }
    Hat.wear = wear;
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
    if (typeof module === "object")
        Object.assign(module.exports, { Hat });
})(Hat || (Hat = {}));
//@ts-ignore
if (typeof module === "object")
    Object.assign(module.exports, { Hat });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vSGF0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7R0FFRztBQUNILElBQVUsR0FBRyxDQW1mWjtBQXRmRDs7R0FFRztBQUNILFdBQVUsR0FBRztJQWFaOzs7T0FHRztJQUNILFNBQWdCLElBQUksQ0FBQyxHQUFTO1FBRTdCLE1BQU0sS0FBSyxHQUFHLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMzQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM3QixHQUFHLENBQUMsSUFBWSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7UUFDN0IsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFFakMsTUFBTSxNQUFNLEdBQUc7WUFDZCxJQUFJLENBQWtELE1BQVMsRUFBRSxPQUFVO2dCQUUxRSxNQUFNLElBQUksR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDeEMsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNqRCxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQ3BDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FB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RSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiXG4vKipcbiAqIFxuICovXG5uYW1lc3BhY2UgSGF0XG57XG5cdC8qKiAqL1xuXHRleHBvcnQgaW50ZXJmYWNlIElIYXRcblx0e1xuXHRcdHJlYWRvbmx5IGhlYWQ6IEVsZW1lbnQ7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHR0eXBlIENvbnN0cnVjdG9yPFQgPSBhbnk+ID0gXG5cdFx0KGFic3RyYWN0IG5ldyAoLi4uYXJnczogYW55KSA9PiBUKSB8IFxuXHRcdChuZXcgKC4uLmFyZ3M6IGFueSkgPT4gVCk7XG5cdFxuXHQvKipcblx0ICogTWFya3MgdGhlIHNwZWNpZmllZCBjbGFzcyBhcyBhIEhhdCwgYW5kIHJldHVybnMgYSBjaGFpbmFibGVcblx0ICogZnVuY3Rpb24gdG8gYWxsb3cgdGhlIEhhdCB0byByZXNwb25kIHRvIHNpZ25hbGluZyBmdW5jdGlvbnMuXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gd2VhcihoYXQ6IElIYXQpXG5cdHtcblx0XHRjb25zdCBuYW1lcyA9IGdldENvbnN0cnVjdG9yQ2xhc3NOYW1lcyhoYXQpO1xuXHRcdGNvbnN0IGhhdHNBcnJheSA9IGhhdHMuZ2V0KGhhdC5oZWFkKSB8fCBbXTtcblx0XHRoYXRzQXJyYXkucHVzaChoYXQpO1xuXHRcdGhhdHMuc2V0KGhhdC5oZWFkLCBoYXRzQXJyYXkpO1xuXHRcdChoYXQuaGVhZCBhcyBhbnkpLl9oYXQgPSBoYXQ7XG5cdFx0aGF0LmhlYWQuY2xhc3NMaXN0LmFkZCguLi5uYW1lcyk7XG5cdFx0XG5cdFx0Y29uc3QgcmVzdWx0ID0ge1xuXHRcdFx0d2VhcjxIIGV4dGVuZHMgRiwgRiBleHRlbmRzICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZD4oc2lnbmFsOiBGLCBoYW5kbGVyOiBIKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBuYW1lID0gZ2V0U2lnbmFsQ2xhc3NOYW1lKHNpZ25hbCk7XG5cdFx0XHRcdGNvbnN0IHNpZ25hbHNBcnJheSA9IHNpZ25hbHMuZ2V0KGhhdC5oZWFkKSB8fCBbXTtcblx0XHRcdFx0c2lnbmFsc0FycmF5LnB1c2goW3NpZ25hbCwgaGFuZGxlci5iaW5kKGhhdCldKTtcblx0XHRcdFx0c2lnbmFscy5zZXQoaGF0LmhlYWQsIHNpZ25hbHNBcnJheSk7XG5cdFx0XHRcdGhhdC5oZWFkLmNsYXNzTGlzdC5hZGQobmFtZSk7XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cdFxuXHQvKipcblx0ICogU2VuZHMgYSBjYWxsIHNpZ25hbCB0byBhbGwgSGF0cyBpbiB0aGUgZG9jdW1lbnQgdGhhdCBoYXZlIHN1YnNjcmliZWRcblx0ICogdG8gaW52b2thdGlvbnMgb2YgdGhlIHNwZWNpZmllZCBzaWduYWwgZnVuY3Rpb24uXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gc2lnbmFsPEEgZXh0ZW5kcyBhbnlbXSwgRiBleHRlbmRzICguLi5hcmdzOiBBKSA9PiB2b2lkPihyZWY6IEYsIC4uLmFyZ3M6IEEpXG5cdHtcblx0XHRjb25zdCBjbHMgPSBnZXRTaWduYWxDbGFzc05hbWUocmVmKTtcblx0XHRjb25zdCBlbGVtZW50cyA9IGRvY3VtZW50LmJvZHkuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjbHMpO1xuXHRcdFxuXHRcdGZvciAobGV0IGkgPSAtMTsgKytpIDwgZWxlbWVudHMubGVuZ3RoOylcblx0XHR7XG5cdFx0XHRjb25zdCBlID0gZWxlbWVudHMuaXRlbShpKTtcblx0XHRcdGlmICghZSlcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcblx0XHRcdGNvbnN0IHNpZ25hbHNBcnJheSA9IHNpZ25hbHMuZ2V0KGUpIHx8IFtdO1xuXHRcdFx0Zm9yIChjb25zdCBbc2lnbmFsRnVuY3Rpb24sIGJvdW5kRnVuY3Rpb25dIG9mIHNpZ25hbHNBcnJheSlcblx0XHRcdFx0aWYgKHNpZ25hbEZ1bmN0aW9uID09PSByZWYpXG5cdFx0XHRcdFx0Ym91bmRGdW5jdGlvbiguLi5hcmdzKTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRmdW5jdGlvbiBnZXRTaWduYWxDbGFzc05hbWUoZm46ICguLi5hcmdzOiBhbnkpID0+IHZvaWQpXG5cdHtcblx0XHRpZiAoIWZuLm5hbWUpXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgdXNlIGFuIHVubmFtZWQgZnVuY3Rpb24gYXMgc2lnbmFsZXJcIik7XG5cdFx0XG5cdFx0cmV0dXJuIHNpZ25hbFByZWZpeCArIGZuLm5hbWU7XG5cdH1cblx0XG5cdGNvbnN0IHNpZ25hbFByZWZpeCA9IFwic2lnbmFsOlwiO1xuXHRcblx0LyoqXG5cdCAqIEByZXR1cm5zIEFuIGFycmF5IHRoYXQgY29udGFpbnMgYWxsIHRoYXQgaGF0cyB0aGF0IGhhdmUgYmVlbiBhc3NpZ25lZCB0b1xuXHQgKiB0aGUgc3BlY2lmaWVkIE5vZGUuXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gb2Y8VCBleHRlbmRzIElIYXQ+KGU6IE5vZGUgfCBudWxsIHwgdW5kZWZpbmVkKTogVFtdO1xuXHQvKipcblx0ICogQHJldHVybnMgVGhlIEhhdCBvZiB0aGUgc3BlY2lmaWVkIE5vZGUgd2l0aCB0aGUgc3BlY2lmaWVkIEhhdCB0eXBlLFxuXHQgKiBvciBudWxsIGluIHRoZSBjYXNlIHdoZW4gdGhlIE5vZGUgaXMgbm90IHdlYXJpbmcgYSBIYXQgb2YgdGhlIHNwZWNpZmllZCB0eXBlLlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIG9mPFQgZXh0ZW5kcyBJSGF0PihlOiBOb2RlIHwgbnVsbCB8IHVuZGVmaW5lZCwgdHlwZTogQ29uc3RydWN0b3I8VD4pOiBUIHwgbnVsbDtcblx0ZXhwb3J0IGZ1bmN0aW9uIG9mPFQgZXh0ZW5kcyBJSGF0PihlOiBOb2RlIHwgbnVsbCB8IHVuZGVmaW5lZCwgdHlwZT86IENvbnN0cnVjdG9yPFQ+KVxuXHR7XG5cdFx0aWYgKCFlKVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XG5cdFx0aWYgKCF0eXBlKVxuXHRcdFx0cmV0dXJuIChoYXRzLmdldChlIGFzIEVsZW1lbnQpIHx8IFtdKS5zbGljZSgpO1xuXHRcdFxuXHRcdGxldCBjdXJyZW50OiBOb2RlIHwgbnVsbCA9IGU7XG5cdFx0XG5cdFx0Zm9yICg7Oylcblx0XHR7XG5cdFx0XHRjb25zdCBhcnJheSA9IGhhdHMuZ2V0KGN1cnJlbnQgYXMgRWxlbWVudCk7XG5cdFx0XHRcblx0XHRcdGlmIChhcnJheSlcblx0XHRcdFx0Zm9yIChjb25zdCBvYmogb2YgYXJyYXkpXG5cdFx0XHRcdFx0aWYgKG9iaiBpbnN0YW5jZW9mIHR5cGUpXG5cdFx0XHRcdFx0XHRyZXR1cm4gb2JqO1xuXHRcdFx0XG5cdFx0XHRpZiAoIShjdXJyZW50LnBhcmVudEVsZW1lbnQgaW5zdGFuY2VvZiBFbGVtZW50KSlcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcblx0XHRcdGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnQ7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdFxuXHQvKipcblx0ICogU2NhbnMgdXB3YXJkIHRocm91Z2ggdGhlIERPTSwgc3RhcnRpbmcgYXQgdGhlIHNwZWNpZmllZCBvYmplY3QsXG5cdCAqIGFuZCBwZXJmb3JtcyBhIGxvb2stZG93biBhdCBlYWNoIGxheWVyIGluIG9yZGVyIHRvIGZpbmQgYSBIYXQgb2Zcblx0ICogdGhlIHNwZWNpZmllZCB0eXBlLCB3aGljaCBpcyBuZWFyZXN0IGluIHRoZSBET00gdG8gdGhlIHNwZWNpZmllZFxuXHQgKiBOb2RlIG9yIEhhdC5cblx0ICogXG5cdCAqIEByZXR1cm5zIEEgcmVmZXJlbmNlIHRvIHRoZSBIYXQgdGhhdCBpcyBuZWFyZXN0IHRvIHRoZSBzcGVjaWZpZWRcblx0ICogb2JqZWN0LlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIG5lYXJlc3Q8VCBleHRlbmRzIElIYXQ+KFxuXHRcdHZpYTogTm9kZSB8IElIYXQsXG5cdFx0dHlwZTogQ29uc3RydWN0b3I8VD4pXG5cdHtcblx0XHRsZXQgY3VycmVudDogTm9kZSB8IG51bGwgPSB2aWEgaW5zdGFuY2VvZiBOb2RlID8gdmlhIDogdmlhLmhlYWQ7XG5cdFx0XG5cdFx0d2hpbGUgKGN1cnJlbnQgaW5zdGFuY2VvZiBOb2RlKVxuXHRcdHtcblx0XHRcdGlmIChjdXJyZW50IGluc3RhbmNlb2YgRWxlbWVudClcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgbWF5YmUgPSBIYXQuZG93bihjdXJyZW50LCB0eXBlKTtcblx0XHRcdFx0aWYgKG1heWJlKVxuXHRcdFx0XHRcdHJldHVybiBtYXliZTtcblx0XHRcdH1cblx0XHRcdGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnQ7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdFxuXHQvKipcblx0ICogU2NhbnMgdXB3YXJkIHRocm91Z2ggdGhlIERPTSwgc3RhcnRpbmcgYXQgdGhlIHNwZWNpZmllZCBOb2RlLCBcblx0ICogbG9va2luZyBmb3IgdGhlIGZpcnN0IGVsZW1lbnQgd2VhcmluZyBhIEhhdCBvZiB0aGUgc3BlY2lmaWVkIHR5cGUuXG5cdCAqIFxuXHQgKiBAcmV0dXJucyBBIHJlZmVyZW5jZSB0byB0aGUgSGF0IHRoYXQgZXhpc3RzIGFib3ZlIHRoZSBzcGVjaWZpZWQgTm9kZVxuXHQgKiBpbiB0aGUgRE9NLCBvciBudWxsIGlmIG5vIHN1Y2ggSGF0IHdhcyBmb3VuZC5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiB1cDxUIGV4dGVuZHMgSUhhdD4oXG5cdFx0dmlhOiBOb2RlIHwgSUhhdCxcblx0XHR0eXBlOiBDb25zdHJ1Y3RvcjxUPilcblx0e1xuXHRcdGxldCBjdXJyZW50OiBOb2RlIHwgbnVsbCA9IHZpYSBpbnN0YW5jZW9mIE5vZGUgPyB2aWEgOiB2aWEuaGVhZDtcblx0XHRcblx0XHR3aGlsZSAoY3VycmVudCBpbnN0YW5jZW9mIE5vZGUpXG5cdFx0e1xuXHRcdFx0aWYgKGN1cnJlbnQgaW5zdGFuY2VvZiBFbGVtZW50KVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBoYXQgPSBIYXQub2YoY3VycmVudCwgdHlwZSk7XG5cdFx0XHRcdGlmIChoYXQpXG5cdFx0XHRcdFx0cmV0dXJuIGhhdDtcblx0XHRcdH1cblx0XHRcdGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnQ7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdFxuXHQvKipcblx0ICogRmluZHMgdGhlIGZpcnN0IGRlc2NlbmRlbnQgZWxlbWVudCB0aGF0IGhhcyBhbiBhdHRhY2hlZCBIYXQgb2YgdGhlXG5cdCAqIHNwZWNpZmllZCB0eXBlLCB0aGF0IGV4aXN0cyB1bmRlcm5lYXRoIHRoZSBzcGVjaWZpZWQgTm9kZSBvciBIYXQuXG5cdCAqIFxuXHQgKiBAcmV0dXJucyBUaGUgSGF0IGFzc29jaWF0ZWQgd2l0aCB0aGUgZGVzY2VuZGVudCBlbGVtZW50LCBvclxuXHQgKiBudWxsIGlmIG5vIHN1Y2ggSGF0IGlzIGZvdW5kLlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGRvd248VCBleHRlbmRzIElIYXQ+KHZpYTogTm9kZSB8IElIYXQsIHR5cGU6IENvbnN0cnVjdG9yPFQ+KVxuXHR7XG5cdFx0Y29uc3QgaGF0cyA9IHdpdGhpbih2aWEsIHR5cGUsIHRydWUpO1xuXHRcdHJldHVybiBoYXRzLmxlbmd0aCA+IDAgPyBoYXRzWzBdIDogbnVsbDtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFNjYW5zIHVwd2FyZCB0aHJvdWdoIHRoZSBET00sIHN0YXJ0aW5nIGF0IHRoZSBzcGVjaWZpZWQgTm9kZSwgXG5cdCAqIGxvb2tpbmcgZm9yIHRoZSBmaXJzdCBlbGVtZW50IHdlYXJpbmcgYSBIYXQgb2YgdGhlIHNwZWNpZmllZCB0eXBlLlxuXHQgKiBcblx0ICogQHRocm93cyBBbiBleGNlcHRpb24gaWYgbm8gSGF0IG9mIHRoZSBzcGVjaWZpZWQgdHlwZSBpcyBmb3VuZC5cblx0ICogQHJldHVybnMgVGhlIGFuY2VzdG9yIEhhdCBvZiB0aGUgc3BlY2lmaWVkIHR5cGUuXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gb3ZlcjxUIGV4dGVuZHMgSUhhdD4oXG5cdFx0dmlhOiBOb2RlIHwgSUhhdCxcblx0XHR0eXBlOiBDb25zdHJ1Y3RvcjxUPilcblx0e1xuXHRcdGNvbnN0IGhhdCA9IHVwKHZpYSwgdHlwZSk7XG5cdFx0aWYgKCFoYXQpXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJIYXQgbm90IGZvdW5kLlwiKTtcblx0XHRcblx0XHRyZXR1cm4gaGF0O1xuXHR9XG5cdFxuXHQvKipcblx0ICogRmluZHMgYWxsIGRlc2NlbmRlbnQgZWxlbWVudHMgdGhhdCBoYXZlIGFuIGF0dGFjaGVkIEhhdCBvZiB0aGVcblx0ICogc3BlY2lmaWVkIHR5cGUsIHRoYXQgZXhpc3QgdW5kZXJuZWF0aCB0aGUgc3BlY2lmaWVkIE5vZGUgb3IgSGF0LlxuXHQgKiBcblx0ICogQHJldHVybnMgQW4gYXJyYXkgb2YgSGF0cyB3aG9zZSB0eXBlIG1hdGNoZXMgdGhlIHR5cGUgc3BlY2lmaWVkLlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIHVuZGVyPFQgZXh0ZW5kcyBJSGF0Pih2aWE6IE5vZGUgfCBJSGF0LCB0eXBlOiBDb25zdHJ1Y3RvcjxUPilcblx0e1xuXHRcdHJldHVybiB3aXRoaW4odmlhLCB0eXBlLCBmYWxzZSk7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIGFycmF5IG9mIEhhdHMgb2YgdGhlIHNwZWNpZmllZCB0eXBlLFxuXHQgKiB3aGljaCBhcmUgZXh0cmFjdGVkIGZyb20gdGhlIHNwZWNpZmllZCBhcnJheSBvZiBlbGVtZW50cy5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBtYXA8VCBleHRlbmRzIElIYXQ+KGVsZW1lbnRzOiBFbGVtZW50W10sIHR5cGU6IENvbnN0cnVjdG9yPFQ+KTogVFtdO1xuXHRleHBvcnQgZnVuY3Rpb24gbWFwPFQgZXh0ZW5kcyBJSGF0PihlbGVtZW50Q29udGFpbmVyOiBFbGVtZW50IHwgSUhhdCwgdHlwZTogQ29uc3RydWN0b3I8VD4pOiBUW107XG5cdGV4cG9ydCBmdW5jdGlvbiBtYXA8VCBleHRlbmRzIElIYXQ+KGU6IElIYXQgfCBFbGVtZW50IHwgRWxlbWVudFtdLCB0eXBlOiBDb25zdHJ1Y3RvcjxUPik6IFRbXVxuXHR7XG5cdFx0ZSA9ICghKGUgaW5zdGFuY2VvZiBFbGVtZW50KSAmJiAhd2luZG93LkFycmF5LmlzQXJyYXkoZSkpID8gZS5oZWFkIDogZTtcblx0XHRjb25zdCBlbGVtZW50cyA9IGUgaW5zdGFuY2VvZiBFbGVtZW50ID8gd2luZG93LkFycmF5LmZyb20oZS5jaGlsZHJlbikgOiBlO1xuXHRcdHJldHVybiBlbGVtZW50c1xuXHRcdFx0Lm1hcChlID0+IG9mKGUsIHR5cGUpKVxuXHRcdFx0LmZpbHRlcigobyk6IG8gaXMgVCA9PiBvIGluc3RhbmNlb2YgdHlwZSk7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBlbGVtZW50IHN1Y2NlZWRpbmcgdGhlIHNwZWNpZmllZCBlbGVtZW50IGluXG5cdCAqIHRoZSBET00gdGhhdCBpcyBjb25uZWN0ZWQgdG8gYSBoYXQgb2YgdGhlIHNwZWNpZmllZCB0eXBlLlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIG5leHQ8VCBleHRlbmRzIElIYXQ+KHZpYTogRWxlbWVudCB8IElIYXQsIHR5cGU6IENvbnN0cnVjdG9yPFQ+KTogVCB8IG51bGxcblx0e1xuXHRcdHZpYSA9IHZpYSBpbnN0YW5jZW9mIEVsZW1lbnQgPyB2aWEgOiB2aWEuaGVhZDtcblx0XHRcblx0XHRmb3IgKDs7KVxuXHRcdHtcblx0XHRcdHZpYSA9IHZpYS5uZXh0RWxlbWVudFNpYmxpbmcgYXMgRWxlbWVudDtcblx0XHRcdGlmICghKHZpYSBpbnN0YW5jZW9mIEVsZW1lbnQpKVxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFxuXHRcdFx0Y29uc3QgaGF0ID0gb2YodmlhLCB0eXBlKTtcblx0XHRcdGlmIChoYXQpXG5cdFx0XHRcdHJldHVybiBoYXQ7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgZWxlbWVudCBwcmVjZWVkaW5nIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBpbiB0aGUgRE9NXG5cdCAqIHRoYXQgaXMgY29ubmVjdGVkIHRvIGEgaGF0IG9mIHRoZSBzcGVjaWZpZWQgdHlwZS5cblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBwcmV2aW91czxUIGV4dGVuZHMgSUhhdD4odmlhOiBFbGVtZW50IHwgSUhhdCwgdHlwZTogQ29uc3RydWN0b3I8VD4pOiBUIHwgbnVsbFxuXHR7XG5cdFx0dmlhID0gdmlhIGluc3RhbmNlb2YgRWxlbWVudCA/IHZpYSA6IHZpYS5oZWFkO1xuXHRcdFxuXHRcdGZvciAoOzspXG5cdFx0e1xuXHRcdFx0dmlhID0gdmlhLnByZXZpb3VzRWxlbWVudFNpYmxpbmcgYXMgRWxlbWVudDtcblx0XHRcdGlmICghKHZpYSBpbnN0YW5jZW9mIEVsZW1lbnQpKVxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFxuXHRcdFx0Y29uc3QgaGF0ID0gb2YodmlhLCB0eXBlKTtcblx0XHRcdGlmIChoYXQpXG5cdFx0XHRcdHJldHVybiBoYXQ7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKiogKi9cblx0ZnVuY3Rpb24gd2l0aGluPFQgZXh0ZW5kcyBJSGF0Pih2aWE6IE5vZGUgfCBJSGF0LCB0eXBlOiBDb25zdHJ1Y3RvcjxUPiwgb25lOiBib29sZWFuKVxuXHR7XG5cdFx0Y29uc3QgZSA9IFxuXHRcdFx0dmlhIGluc3RhbmNlb2YgRWxlbWVudCA/IHZpYSA6IFxuXHRcdFx0dmlhIGluc3RhbmNlb2YgTm9kZSA/IHZpYS5wYXJlbnRFbGVtZW50IDpcblx0XHRcdHZpYS5oZWFkO1xuXHRcdFxuXHRcdGlmICghZSlcblx0XHRcdHRocm93IFwiQ2Fubm90IHBlcmZvcm0gdGhpcyBtZXRob2QgdXNpbmcgdGhlIHNwZWNpZmllZCBub2RlLlwiO1xuXHRcdFxuXHRcdGNvbnN0IG5hbWVzID0gY3Rvck5hbWVzLmdldCh0eXBlKTtcblx0XHRcblx0XHQvLyBJZiB0aGVyZSBpcyBubyBjbGFzcyBuYW1lIGZvdW5kIGZvciB0aGUgc3BlY2lmaWVkIGhhdCB0eXBlLFxuXHRcdC8vIHRoaXMgY291bGQgcG9zc2libHkgYmUgYW4gZXJyb3IgKG1lYW5pbmcgdGhhdCB0aGUgaGF0IHR5cGVcblx0XHQvLyB3YXNuJ3QgcmVnaXN0ZXJlZCkuIEJ1dCBpdCBjb3VsZCBhbHNvIGJlIGEgbGVnaXRpbWF0ZSBjYXNlIG9mIHRoZVxuXHRcdC8vIGhhdCBzaW1wbHkgbm90IGhhdmluZyBiZWVuIHJlZ2lzdGVyZWQgYXQgdGhlIHRpbWUgb2YgdGhpc1xuXHRcdC8vIGZ1bmN0aW9uIGJlaW5nIGNhbGxlZC5cblx0XHRpZiAoIW5hbWVzIHx8IG5hbWVzLmxlbmd0aCA9PT0gMClcblx0XHRcdHJldHVybiBbXTtcblx0XHRcblx0XHRjb25zdCBkZXNjZW5kZW50cyA9IG5hbWVzLmxlbmd0aCA9PT0gMSA/IFxuXHRcdFx0ZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKG5hbWVzWzBdKSA6XG5cdFx0XHRlLnF1ZXJ5U2VsZWN0b3JBbGwobmFtZXMubWFwKG4gPT4gXCIuXCIgKyBuKS5qb2luKCkpO1xuXHRcdFxuXHRcdGNvbnN0IGhhdHM6IFRbXSA9IFtdO1xuXHRcdGNvbnN0IGxlbiA9IG9uZSAmJiBkZXNjZW5kZW50cy5sZW5ndGggPiAwID8gMSA6IGRlc2NlbmRlbnRzLmxlbmd0aDtcblx0XHRcblx0XHRmb3IgKGxldCBpID0gLTE7ICsraSA8IGxlbjspXG5cdFx0e1xuXHRcdFx0Y29uc3QgZGVzY2VuZGVudCA9IGRlc2NlbmRlbnRzW2ldO1xuXHRcdFx0Y29uc3QgaGF0ID0gSGF0Lm9mKGRlc2NlbmRlbnQsIHR5cGUpO1xuXHRcdFx0aWYgKGhhdClcblx0XHRcdFx0aGF0cy5wdXNoKGhhdCk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBoYXRzO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0ZnVuY3Rpb24gY2hpbGRyZW5PZjxUIGV4dGVuZHMgSUhhdD4oZTogRWxlbWVudCwgaGF0VHlwZT86IENvbnN0cnVjdG9yPFQ+KVxuXHR7XG5cdFx0bGV0IGNoaWxkcmVuID0gZ2xvYmFsVGhpcy5BcnJheS5mcm9tKGUuY2hpbGRyZW4pO1xuXHRcdFxuXHRcdGlmIChoYXRUeXBlKVxuXHRcdFx0Y2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoZSA9PiBIYXQub2YoZSwgaGF0VHlwZSkpO1xuXHRcdFxuXHRcdHJldHVybiBjaGlsZHJlbjtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFJldHVybnMgYSB1bmlxdWUgQ1NTIGNsYXNzIG5hbWUgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgdHlwZVxuXHQgKiBvZiB0aGUgb2JqZWN0LlxuXHQgKi9cblx0ZnVuY3Rpb24gZ2V0Q29uc3RydWN0b3JDbGFzc05hbWVzKG9iamVjdDogb2JqZWN0KVxuXHR7XG5cdFx0Y29uc3QgZXhpc3RpbmdOYW1lcyA9IGN0b3JOYW1lcy5nZXQob2JqZWN0LmNvbnN0cnVjdG9yKTtcblx0XHRpZiAoZXhpc3RpbmdOYW1lcylcblx0XHRcdHJldHVybiBleGlzdGluZ05hbWVzO1xuXHRcdFxuXHRcdGNvbnN0IGN0b3JzOiBhbnlbXSA9IFtvYmplY3QuY29uc3RydWN0b3JdO1xuXHRcdGNvbnN0IG5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFxuXHRcdGZvciAoOzspXG5cdFx0e1xuXHRcdFx0Y29uc3QgY3RvciA9IGN0b3JzW2N0b3JzLmxlbmd0aCAtIDFdO1xuXHRcdFx0Y29uc3QgbmV4dCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjdG9yKTtcblx0XHRcdGlmIChuZXh0ID09PSBudWxsIHx8IG5leHQgPT09IE9iamVjdCB8fCBuZXh0ID09PSBGdW5jdGlvbilcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcblx0XHRcdGN0b3JzLnB1c2gobmV4dCk7XG5cdFx0fVxuXHRcdFxuXHRcdGZvciAoY29uc3QgY3RvciBvZiBjdG9ycylcblx0XHR7XG5cdFx0XHRsZXQgbmFtZSA9IGN0b3IubmFtZSB8fCBcIlwiO1xuXHRcdFx0XG5cdFx0XHRpZiAobmFtZS5sZW5ndGggPCAzKVxuXHRcdFx0XHRuYW1lID0gXCJfaGF0X1wiICsgbmFtZSArICgrK2luYyk7XG5cdFx0XHRcblx0XHRcdG5hbWVzLnB1c2gobmFtZSk7XG5cdFx0fVxuXHRcdFxuXHRcdGZvciAobGV0IGkgPSBjdG9ycy5sZW5ndGg7IGktLSA+IDA7KVxuXHRcdHtcblx0XHRcdGNvbnN0IGN0b3IgPSBjdG9yc1tpXTtcblx0XHRcdGlmICghY3Rvck5hbWVzLmhhcyhjdG9yKSlcblx0XHRcdFx0Y3Rvck5hbWVzLnNldChjdG9yLCBuYW1lcy5zbGljZShpKSk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBuYW1lcztcblx0fVxuXHRcblx0Y29uc3QgY3Rvck5hbWVzID0gbmV3IFdlYWtNYXA8RnVuY3Rpb24sIHN0cmluZ1tdPigpO1xuXHRjb25zdCBoYXRzID0gbmV3IFdlYWtNYXA8RWxlbWVudCwgb2JqZWN0W10+KCk7XG5cdGNvbnN0IHNpZ25hbHMgPSBuZXcgV2Vha01hcDxvYmplY3QsIFtGdW5jdGlvbiwgRnVuY3Rpb25dW10+KCk7XG5cdGxldCBpbmMgPSAwO1xuXHRcblx0LyoqXG5cdCAqIFxuXHQgKi9cblx0ZXhwb3J0IGNsYXNzIEFycmF5PFRIYXQgZXh0ZW5kcyBJSGF0ID0gSUhhdD5cblx0e1xuXHRcdC8qKiAqL1xuXHRcdGNvbnN0cnVjdG9yKFxuXHRcdFx0cHJpdmF0ZSByZWFkb25seSBwYXJlbnRFbGVtZW50OiBFbGVtZW50LFxuXHRcdFx0cHJpdmF0ZSByZWFkb25seSBoYXRUeXBlOiBDb25zdHJ1Y3RvcjxUSGF0Pilcblx0XHR7XG5cdFx0XHR0aGlzLm1hcmtlciA9IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoXCJcIik7XG5cdFx0XHRwYXJlbnRFbGVtZW50LmFwcGVuZCh0aGlzLm1hcmtlcik7XG5cdFx0fVxuXHRcdFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgbWFya2VyOiBDb21tZW50O1xuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdCogW1N5bWJvbC5pdGVyYXRvcl0oKVxuXHRcdHtcblx0XHRcdGZvciAobGV0IGkgPSAtMTsgKytpIDwgdGhpcy5wYXJlbnRFbGVtZW50LmNoaWxkcmVuLmxlbmd0aDspXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGNoaWxkID0gdGhpcy5wYXJlbnRFbGVtZW50LmNoaWxkcmVuLml0ZW0oaSk7XG5cdFx0XHRcdGlmIChjaGlsZClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0IGhhdCA9IEhhdC5vZihjaGlsZCwgdGhpcy5oYXRUeXBlKTtcblx0XHRcdFx0XHRpZiAoaGF0KVxuXHRcdFx0XHRcdFx0eWllbGQgaGF0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdC8qKiAqL1xuXHRcdG1hcCgpOiBUSGF0W107XG5cdFx0bWFwPFQ+KG1hcEZuOiAodmFsdWU6IFRIYXQsIGluZGV4OiBudW1iZXIsIGFycmF5OiBUSGF0W10pID0+IFQpOiBUW107XG5cdFx0bWFwKG1hcEZuPzogKHZhbHVlOiBUSGF0LCBpbmRleDogbnVtYmVyLCBhcnJheTogVEhhdFtdKSA9PiBhbnkpXG5cdFx0e1xuXHRcdFx0Y29uc3QgZWxlbWVudHMgPSBjaGlsZHJlbk9mKHRoaXMucGFyZW50RWxlbWVudCwgdGhpcy5oYXRUeXBlKTtcblx0XHRcdGNvbnN0IGhhdHMgPSBIYXQubWFwKGVsZW1lbnRzLCB0aGlzLmhhdFR5cGUpO1xuXHRcdFx0cmV0dXJuIG1hcEZuID8gaGF0cy5tYXAobWFwRm4pIDogaGF0cztcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0YXQoaW5kZXg6IG51bWJlcilcblx0XHR7XG5cdFx0XHRyZXR1cm4gdGhpcy5tYXAoKS5hdChpbmRleCkgfHwgbnVsbDtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0aW5zZXJ0KC4uLmhhdHM6IFRIYXRbXSk6IG51bWJlcjtcblx0XHRpbnNlcnQoaW5kZXg6IG51bWJlciwgLi4uaGF0czogVEhhdFtdKTogbnVtYmVyO1xuXHRcdGluc2VydChhOiBudW1iZXIgfCBUSGF0LCAuLi5uZXdIYXRzOiBUSGF0W10pXG5cdFx0e1xuXHRcdFx0Y29uc3QgaW5kZXggPSB0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IChhIHx8IDApIDogLTE7XG5cdFx0XHRjb25zdCBleGlzdGluZ0hhdHMgPSB0aGlzLm1hcCgpO1xuXHRcdFx0XG5cdFx0XHRpZiAodHlwZW9mIGEgPT09IFwib2JqZWN0XCIpXG5cdFx0XHRcdG5ld0hhdHMudW5zaGlmdChhKTtcblx0XHRcdFxuXHRcdFx0aWYgKG5ld0hhdHMubGVuZ3RoID09PSAwKVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcblx0XHRcdGlmIChleGlzdGluZ0hhdHMubGVuZ3RoID09PSAwKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLnBhcmVudEVsZW1lbnQucHJlcGVuZCguLi5uZXdIYXRzLm1hcChjID0+IGMuaGVhZCkpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCB0YXJnZXQgPSBpbmRleCA+PSBleGlzdGluZ0hhdHMubGVuZ3RoID8gXG5cdFx0XHRcdFx0KGV4aXN0aW5nSGF0cy5hdChpbmRleCkgYXMgSUhhdCkuaGVhZCA6XG5cdFx0XHRcdFx0dGhpcy5tYXJrZXI7XG5cdFx0XHRcdFxuXHRcdFx0XHRmb3IgKGNvbnN0IGhhdCBvZiBuZXdIYXRzKVxuXHRcdFx0XHRcdHRoaXMucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoaGF0LmhlYWQsIHRhcmdldCk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHJldHVybiBpbmRleCA8IDAgPyBleGlzdGluZ0hhdHMubGVuZ3RoICsgbmV3SGF0cy5sZW5ndGggOiBpbmRleDtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0bW92ZShmcm9tSW5kZXg6IG51bWJlciwgdG9JbmRleDogbnVtYmVyKVxuXHRcdHtcblx0XHRcdGNvbnN0IGNoaWxkcmVuID0gY2hpbGRyZW5PZih0aGlzLnBhcmVudEVsZW1lbnQsIHRoaXMuaGF0VHlwZSk7XG5cdFx0XHRjb25zdCB0YXJnZXQgPSBjaGlsZHJlbi5hdCh0b0luZGV4KTtcblx0XHRcdGNvbnN0IHNvdXJjZSA9IGNoaWxkcmVuLmF0KGZyb21JbmRleCk7XG5cdFx0XHRcblx0XHRcdGlmIChzb3VyY2UgJiYgdGFyZ2V0KVxuXHRcdFx0XHR0YXJnZXQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYmVmb3JlYmVnaW5cIiwgc291cmNlKTtcblx0XHR9XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0aW5kZXhPZihoYXQ6IFRIYXQpXG5cdFx0e1xuXHRcdFx0Y29uc3QgY2hpbGRyZW4gPSBjaGlsZHJlbk9mKHRoaXMucGFyZW50RWxlbWVudCwgdGhpcy5oYXRUeXBlKTtcblx0XHRcdGZvciAobGV0IGkgPSAtMTsgKytpIDwgY2hpbGRyZW4ubGVuZ3RoOylcblx0XHRcdFx0aWYgKGNoaWxkcmVuW2ldID09PSBoYXQuaGVhZClcblx0XHRcdFx0XHRyZXR1cm4gaTtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIC0xO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRnZXQgbGVuZ3RoKClcblx0XHR7XG5cdFx0XHRyZXR1cm4gY2hpbGRyZW5PZih0aGlzLnBhcmVudEVsZW1lbnQsIHRoaXMuaGF0VHlwZSkubGVuZ3RoO1xuXHRcdH1cblx0XHRcblx0XHQvKiogKi9cblx0XHRvYnNlcnZlKGNhbGxiYWNrOiAobXV0OiBNdXRhdGlvblJlY29yZCkgPT4gdm9pZClcblx0XHR7XG5cdFx0XHRpZiAodGhpcy5vYnNlcnZlcnMubGVuZ3RoID09PSAwKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBtbyA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKG11dGF0aW9ucyA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBtdXQgb2YgbXV0YXRpb25zKVxuXHRcdFx0XHRcdFx0Zm9yIChjb25zdCBmbiBvZiB0aGlzLm9ic2VydmVycylcblx0XHRcdFx0XHRcdFx0Zm4obXV0KTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdFxuXHRcdFx0XHRtby5vYnNlcnZlKHRoaXMucGFyZW50RWxlbWVudCwgeyBjaGlsZExpc3Q6IHRydWUgfSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHRoaXMub2JzZXJ2ZXJzLnB1c2goY2FsbGJhY2spO1xuXHRcdH1cblx0XHRcblx0XHRwcml2YXRlIHJlYWRvbmx5IG9ic2VydmVyczogKChtdXQ6IE11dGF0aW9uUmVjb3JkKSA9PiB2b2lkKVtdID0gW107XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cHJpdmF0ZSB0b0pTT04oKVxuXHRcdHtcblx0XHRcdHJldHVybiB0aGlzLm1hcCgpO1xuXHRcdH1cblx0fVxuXHRcblx0ZGVjbGFyZSB2YXIgbW9kdWxlOiBhbnk7XG5cdGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiKVxuXHRcdE9iamVjdC5hc3NpZ24obW9kdWxlLmV4cG9ydHMsIHsgSGF0IH0pO1xufVxuXG4vL0B0cy1pZ25vcmVcbmlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiKSBPYmplY3QuYXNzaWduKG1vZHVsZS5leHBvcnRzLCB7IEhhdCB9KTsiXX0=