"use strict";
var Force;
(function (Force) {
    /**
     * Creates and returns a pair of force functions that handle the
     * arguments as specified in the type parameter.
     * The first function is used to retain callback functions that
     * are triggered when the second function is invoked,
     */
    function create() {
        const fo = new ForceObject();
        return [fo.connectorFn, fo.executorFn];
    }
    Force.create = create;
    /** */
    class ForceObject {
        callbacks = [];
        /** */
        connectorFn = Object.assign((callback) => this.callbacks.push(callback), { off: (callback) => this.callbacks.splice(this.callbacks.indexOf(callback), 1) });
        /** */
        executorFn = (...data) => {
            for (const callback of this.callbacks)
                callback(...data);
        };
    }
})(Force || (Force = {}));
//@ts-ignore
if (typeof module === "object")
    Object.assign(module.exports, { Force });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9yY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9Gb3JjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBVSxLQUFLLENBc0NkO0FBdENELFdBQVUsS0FBSztJQUVkOzs7OztPQUtHO0lBQ0gsU0FBZ0IsTUFBTTtRQUlyQixNQUFNLEVBQUUsR0FBRyxJQUFJLFdBQVcsRUFBVyxDQUFDO1FBRXRDLE9BQU8sQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBR3BDLENBQUM7SUFDSCxDQUFDO0lBVmUsWUFBTSxTQVVyQixDQUFBO0lBRUQsTUFBTTtJQUNOLE1BQU0sV0FBVztRQUVDLFNBQVMsR0FBYyxFQUFFLENBQUM7UUFFM0MsTUFBTTtRQUNHLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUNuQyxDQUFDLFFBQWlCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUNwRCxFQUFFLEdBQUcsRUFBRSxDQUFDLFFBQWlCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQzFGLENBQUM7UUFFRixNQUFNO1FBQ0csVUFBVSxHQUFHLENBQUMsR0FBRyxJQUF5QixFQUFFLEVBQUU7WUFFdEQsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsU0FBUztnQkFDcEMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDcEIsQ0FBQyxDQUFDO0tBQ0Y7QUFDRixDQUFDLEVBdENTLEtBQUssS0FBTCxLQUFLLFFBc0NkO0FBRUQsWUFBWTtBQUNaLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUTtJQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcbm5hbWVzcGFjZSBGb3JjZVxue1xuXHQvKipcblx0ICogQ3JlYXRlcyBhbmQgcmV0dXJucyBhIHBhaXIgb2YgZm9yY2UgZnVuY3Rpb25zIHRoYXQgaGFuZGxlIHRoZVxuXHQgKiBhcmd1bWVudHMgYXMgc3BlY2lmaWVkIGluIHRoZSB0eXBlIHBhcmFtZXRlci5cblx0ICogVGhlIGZpcnN0IGZ1bmN0aW9uIGlzIHVzZWQgdG8gcmV0YWluIGNhbGxiYWNrIGZ1bmN0aW9ucyB0aGF0XG5cdCAqIGFyZSB0cmlnZ2VyZWQgd2hlbiB0aGUgc2Vjb25kIGZ1bmN0aW9uIGlzIGludm9rZWQsXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gY3JlYXRlPFRGb3JtYXQgZXh0ZW5kcyAoLi4uYXJnczogYW55W10pID0+IHZvaWQgPSAoKSA9PiB2b2lkPigpXG5cdHtcblx0XHR0eXBlIFRFeGVjdXRvciA9ICguLi5kYXRhOiBQYXJhbWV0ZXJzPFRGb3JtYXQ+KSA9PiB2b2lkO1xuXHRcdHR5cGUgVENvbm5lY3RvciA9ICgoY2FsbGJhY2s6IFRGb3JtYXQpID0+IHZvaWQpICYgeyBvZmYoY2FsbGJhY2s6IFRGb3JtYXQpOiB2b2lkIH07XG5cdFx0Y29uc3QgZm8gPSBuZXcgRm9yY2VPYmplY3Q8VEZvcm1hdD4oKTtcblx0XHRcblx0XHRyZXR1cm4gW2ZvLmNvbm5lY3RvckZuLCBmby5leGVjdXRvckZuXSBhcyBhbnkgYXMgW1xuXHRcdFx0VENvbm5lY3Rvcixcblx0XHRcdFRFeGVjdXRvcixcblx0XHRdO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0Y2xhc3MgRm9yY2VPYmplY3Q8VEZvcm1hdCBleHRlbmRzICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZD5cblx0e1xuXHRcdHByaXZhdGUgcmVhZG9ubHkgY2FsbGJhY2tzOiBURm9ybWF0W10gPSBbXTtcblx0XHRcblx0XHQvKiogKi9cblx0XHRyZWFkb25seSBjb25uZWN0b3JGbiA9IE9iamVjdC5hc3NpZ24oXG5cdFx0XHQoY2FsbGJhY2s6IFRGb3JtYXQpID0+IHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spLFxuXHRcdFx0eyBvZmY6IChjYWxsYmFjazogVEZvcm1hdCkgPT4gdGhpcy5jYWxsYmFja3Muc3BsaWNlKHRoaXMuY2FsbGJhY2tzLmluZGV4T2YoY2FsbGJhY2spLCAxKSB9XG5cdFx0KTtcblx0XHRcblx0XHQvKiogKi9cblx0XHRyZWFkb25seSBleGVjdXRvckZuID0gKC4uLmRhdGE6IFBhcmFtZXRlcnM8VEZvcm1hdD4pID0+XG5cdFx0e1xuXHRcdFx0Zm9yIChjb25zdCBjYWxsYmFjayBvZiB0aGlzLmNhbGxiYWNrcylcblx0XHRcdFx0Y2FsbGJhY2soLi4uZGF0YSk7XG5cdFx0fTtcblx0fVxufVxuXG4vL0B0cy1pZ25vcmVcbmlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiKSBPYmplY3QuYXNzaWduKG1vZHVsZS5leHBvcnRzLCB7IEZvcmNlIH0pOyJdfQ==