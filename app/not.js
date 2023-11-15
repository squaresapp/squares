"use strict";
/**
 * Utility class for performing basic guarding.
 */
var Not;
/**
 * Utility class for performing basic guarding.
 */
(function (Not) {
    /**
     * @returns The argument as specified, but throws an
     * exception in the case when it's null or undefined.
     */
    function nullable(param) {
        if (param === null || param === undefined) {
            debugger;
            throw new ReferenceError();
        }
        return param;
    }
    Not.nullable = nullable;
    /**
     * @returns The argument as specified, but throws an
     * exception in the case when the value provided equates
     * to a JavaScript-falsey value.
     */
    function falsey(value) {
        if (!value) {
            debugger;
            throw new TypeError();
        }
        return value;
    }
    Not.falsey = falsey;
    /**
     * Used to mark out areas of the code that are not implemented.
     */
    function implemented() {
        debugger;
    }
    Not.implemented = implemented;
    /**
     *
     */
    function reachable() {
        debugger;
        throw new TypeError();
    }
    Not.reachable = reachable;
})(Not || (Not = {}));
//@ts-ignore
if (typeof module === "object")
    Object.assign(module.exports, { Not });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vTm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7R0FFRztBQUNILElBQVUsR0FBRyxDQWlEWjtBQXBERDs7R0FFRztBQUNILFdBQVUsR0FBRztJQUVaOzs7T0FHRztJQUNILFNBQWdCLFFBQVEsQ0FBSSxLQUFRO1FBRW5DLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssU0FBUyxFQUN6QztZQUNDLFFBQVEsQ0FBQztZQUNULE1BQU0sSUFBSSxjQUFjLEVBQUUsQ0FBQztTQUMzQjtRQUVELE9BQU8sS0FBdUIsQ0FBQztJQUNoQyxDQUFDO0lBVGUsWUFBUSxXQVN2QixDQUFBO0lBRUQ7Ozs7T0FJRztJQUNILFNBQWdCLE1BQU0sQ0FBSSxLQUFRO1FBRWpDLElBQUksQ0FBQyxLQUFLLEVBQ1Y7WUFDQyxRQUFRLENBQUM7WUFDVCxNQUFNLElBQUksU0FBUyxFQUFFLENBQUM7U0FDdEI7UUFFRCxPQUFPLEtBQVksQ0FBQztJQUNyQixDQUFDO0lBVGUsVUFBTSxTQVNyQixDQUFBO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixXQUFXO1FBRTFCLFFBQVEsQ0FBQztJQUNWLENBQUM7SUFIZSxlQUFXLGNBRzFCLENBQUE7SUFFRDs7T0FFRztJQUNILFNBQWdCLFNBQVM7UUFFeEIsUUFBUSxDQUFDO1FBQ1QsTUFBTSxJQUFJLFNBQVMsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFKZSxhQUFTLFlBSXhCLENBQUE7QUFDRixDQUFDLEVBakRTLEdBQUcsS0FBSCxHQUFHLFFBaURaO0FBRUQsWUFBWTtBQUNaLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUTtJQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qKlxuICogVXRpbGl0eSBjbGFzcyBmb3IgcGVyZm9ybWluZyBiYXNpYyBndWFyZGluZy5cbiAqL1xubmFtZXNwYWNlIE5vdFxue1xuXHQvKipcblx0ICogQHJldHVybnMgVGhlIGFyZ3VtZW50IGFzIHNwZWNpZmllZCwgYnV0IHRocm93cyBhblxuXHQgKiBleGNlcHRpb24gaW4gdGhlIGNhc2Ugd2hlbiBpdCdzIG51bGwgb3IgdW5kZWZpbmVkLlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIG51bGxhYmxlPFQ+KHBhcmFtOiBUKVxuXHR7XG5cdFx0aWYgKHBhcmFtID09PSBudWxsIHx8IHBhcmFtID09PSB1bmRlZmluZWQpXG5cdFx0e1xuXHRcdFx0ZGVidWdnZXI7XG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoKTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIHBhcmFtIGFzIE5vbk51bGxhYmxlPFQ+O1xuXHR9XG5cdFxuXHQvKipcblx0ICogQHJldHVybnMgVGhlIGFyZ3VtZW50IGFzIHNwZWNpZmllZCwgYnV0IHRocm93cyBhblxuXHQgKiBleGNlcHRpb24gaW4gdGhlIGNhc2Ugd2hlbiB0aGUgdmFsdWUgcHJvdmlkZWQgZXF1YXRlc1xuXHQgKiB0byBhIEphdmFTY3JpcHQtZmFsc2V5IHZhbHVlLlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGZhbHNleTxUPih2YWx1ZTogVCk6IE5vbk51bGxhYmxlPFQ+XG5cdHtcblx0XHRpZiAoIXZhbHVlKVxuXHRcdHtcblx0XHRcdGRlYnVnZ2VyO1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gdmFsdWUgYXMgYW55O1xuXHR9XG5cdFxuXHQvKipcblx0ICogVXNlZCB0byBtYXJrIG91dCBhcmVhcyBvZiB0aGUgY29kZSB0aGF0IGFyZSBub3QgaW1wbGVtZW50ZWQuXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gaW1wbGVtZW50ZWQoKVxuXHR7XG5cdFx0ZGVidWdnZXI7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBcblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiByZWFjaGFibGUoKTogbmV2ZXJcblx0e1xuXHRcdGRlYnVnZ2VyO1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoKTtcblx0fVxufVxuXG4vL0B0cy1pZ25vcmVcbmlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiKSBPYmplY3QuYXNzaWduKG1vZHVsZS5leHBvcnRzLCB7IE5vdCB9KTsiXX0=