"use strict";
var FilaKeyva;
(function (FilaKeyva_1) {
    function use() {
        class FilaKeyva extends Fila {
            /** */
            static _ = (() => {
                if (typeof Keyva === "undefined")
                    throw "Cannot use FileKeyva because Keyva library was not found";
                Fila.setDefaults(FilaKeyva, "/", "/", "/__temp/");
            })();
            static keyva;
            /** */
            constructor(components) {
                super(components);
                FilaKeyva.keyva ||= new Keyva({ name: "fila" });
            }
            /** */
            async readText() {
                return await FilaKeyva.keyva.get(this.path);
            }
            /** */
            async readBinary() {
                const value = await FilaKeyva.keyva.get(this.path);
                return value instanceof ArrayBuffer ?
                    value :
                    new TextEncoder().encode(value);
            }
            /** */
            async readDirectory() {
                const filas = [];
                const range = Keyva.prefix(this.path + "/");
                const contents = await FilaKeyva.keyva.each({ range }, "keys");
                for (const key of contents)
                    if (typeof key === "string")
                        filas.push(Fila.new(key));
                return filas;
            }
            /** */
            async writeText(text, options) {
                let current = this.up();
                const missingFolders = [];
                for (;;) {
                    if (await current.exists())
                        break;
                    missingFolders.push(current);
                    if (current.up().path === current.path)
                        break;
                    current = current.up();
                }
                for (const folder of missingFolders)
                    await folder.writeDirectory();
                if (options?.append)
                    text = ("" + (await FilaKeyva.keyva.get(this.path) || "")) + text;
                await FilaKeyva.keyva.set(this.path, text);
            }
            /** */
            async writeBinary(arrayBuffer) {
                await FilaKeyva.keyva.set(this.path, arrayBuffer);
            }
            /** */
            async writeDirectory() {
                if (await this.isDirectory())
                    return;
                if (await this.exists())
                    throw new Error("A file already exists at this location.");
                await FilaKeyva.keyva.set(this.path, null);
            }
            /**
             * Writes a symlink file at the location represented by the specified
             * Fila object, to the location specified by the current Fila object.
             */
            async writeSymlink(at) {
                throw new Error("Not implemented");
            }
            /**
             * Deletes the file or directory that this Fila object represents.
             */
            async delete() {
                if (await this.isDirectory()) {
                    const range = Keyva.prefix(this.path + "/");
                    await FilaKeyva.keyva.delete(range);
                }
                await FilaKeyva.keyva.delete(this.path);
            }
            /** */
            async move(target) {
                throw new Error("Not implemented.");
            }
            /** */
            async copy(target) {
                throw new Error("Not implemented.");
            }
            /** */
            watchProtected(recursive, callbackFn) {
                throw new Error("Not implemented");
                return () => { };
            }
            /** */
            async rename(newName) {
                throw new Error("Not implemented.");
            }
            /** */
            async exists() {
                const value = await FilaKeyva.keyva.get(this.path);
                return value !== undefined;
            }
            /** */
            async getSize() {
                return 0;
            }
            /** */
            async getModifiedTicks() {
                return 0;
            }
            /** */
            async getCreatedTicks() {
                return 0;
            }
            /** */
            async getAccessedTicks() {
                return 0;
            }
            /** */
            async isDirectory() {
                return await FilaKeyva.keyva.get(this.path) === null;
            }
        }
    }
    FilaKeyva_1.use = use;
    typeof module === "object" && Object.assign(module.exports, { FilaKeyva });
})(FilaKeyva || (FilaKeyva = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsYS1rZXl2YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL0ZpbGFLZXl2YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBVSxTQUFTLENBOExsQjtBQTlMRCxXQUFVLFdBQVM7SUFFbEIsU0FBZ0IsR0FBRztRQUVsQixNQUFNLFNBQVUsU0FBUSxJQUFJO1lBRTNCLE1BQU07WUFDTixNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO2dCQUVoQixJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVc7b0JBQy9CLE1BQU0sMERBQTBELENBQUM7Z0JBRWxFLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDbkQsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUVHLE1BQU0sQ0FBQyxLQUFLLENBQVE7WUFFNUIsTUFBTTtZQUNOLFlBQVksVUFBb0I7Z0JBRS9CLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDbEIsU0FBUyxDQUFDLEtBQUssS0FBSyxJQUFJLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ2pELENBQUM7WUFFRCxNQUFNO1lBQ04sS0FBSyxDQUFDLFFBQVE7Z0JBRWIsT0FBTyxNQUFNLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBRUQsTUFBTTtZQUNOLEtBQUssQ0FBQyxVQUFVO2dCQUVmLE1BQU0sS0FBSyxHQUFHLE1BQU0sU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNuRCxPQUFPLEtBQUssWUFBWSxXQUFXLENBQUMsQ0FBQztvQkFDcEMsS0FBSyxDQUFDLENBQUM7b0JBQ1AsSUFBSSxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFD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LFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUM7WUFDdEQsQ0FBQzs7SUFFSCxDQUFDO0lBeExlLGVBQUcsTUF3TGxCLENBQUE7SUFHRCxPQUFPLE1BQU0sS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztBQUM1RSxDQUFDLEVBOUxTLFNBQVMsS0FBVCxTQUFTLFFBOExsQiIsInNvdXJjZXNDb250ZW50IjpbIlxubmFtZXNwYWNlIEZpbGFLZXl2YVxue1xuXHRleHBvcnQgZnVuY3Rpb24gdXNlKClcblx0e1xuXHRcdGNsYXNzIEZpbGFLZXl2YSBleHRlbmRzIEZpbGFcblx0XHR7XG5cdFx0XHQvKiogKi9cblx0XHRcdHN0YXRpYyBfID0gKCgpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGlmICh0eXBlb2YgS2V5dmEgPT09IFwidW5kZWZpbmVkXCIpXG5cdFx0XHRcdFx0dGhyb3cgXCJDYW5ub3QgdXNlIEZpbGVLZXl2YSBiZWNhdXNlIEtleXZhIGxpYnJhcnkgd2FzIG5vdCBmb3VuZFwiO1xuXHRcdFx0XHRcblx0XHRcdFx0RmlsYS5zZXREZWZhdWx0cyhGaWxhS2V5dmEsIFwiL1wiLCBcIi9cIiwgXCIvX190ZW1wL1wiKTtcblx0XHRcdH0pKCk7XG5cdFx0XHRcblx0XHRcdHByaXZhdGUgc3RhdGljIGtleXZhOiBLZXl2YTtcblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRjb25zdHJ1Y3Rvcihjb21wb25lbnRzOiBzdHJpbmdbXSlcblx0XHRcdHtcblx0XHRcdFx0c3VwZXIoY29tcG9uZW50cyk7XG5cdFx0XHRcdEZpbGFLZXl2YS5rZXl2YSB8fD0gbmV3IEtleXZhKHsgbmFtZTogXCJmaWxhXCIgfSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0YXN5bmMgcmVhZFRleHQoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gYXdhaXQgRmlsYUtleXZhLmtleXZhLmdldDxzdHJpbmc+KHRoaXMucGF0aCk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0YXN5bmMgcmVhZEJpbmFyeSgpOiBQcm9taXNlPEFycmF5QnVmZmVyPlxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCB2YWx1ZSA9IGF3YWl0IEZpbGFLZXl2YS5rZXl2YS5nZXQodGhpcy5wYXRoKTtcblx0XHRcdFx0cmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgP1xuXHRcdFx0XHRcdHZhbHVlIDpcblx0XHRcdFx0XHRuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUodmFsdWUpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIHJlYWREaXJlY3RvcnkoKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBmaWxhczogRmlsYVtdID0gW107XG5cdFx0XHRcdGNvbnN0IHJhbmdlID0gS2V5dmEucHJlZml4KHRoaXMucGF0aCArIFwiL1wiKTtcblx0XHRcdFx0Y29uc3QgY29udGVudHMgPSBhd2FpdCBGaWxhS2V5dmEua2V5dmEuZWFjaCh7IHJhbmdlIH0sIFwia2V5c1wiKTtcblx0XHRcdFx0XG5cdFx0XHRcdGZvciAoY29uc3Qga2V5IG9mIGNvbnRlbnRzKVxuXHRcdFx0XHRcdGlmICh0eXBlb2Yga2V5ID09PSBcInN0cmluZ1wiKVxuXHRcdFx0XHRcdFx0ZmlsYXMucHVzaChGaWxhLm5ldyhrZXkpKTtcblx0XHRcdFx0XG5cdFx0XHRcdHJldHVybiBmaWxhcztcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyB3cml0ZVRleHQodGV4dDogc3RyaW5nLCBvcHRpb25zPzogRmlsYS5JV3JpdGVUZXh0T3B0aW9ucylcblx0XHRcdHtcblx0XHRcdFx0bGV0IGN1cnJlbnQgPSB0aGlzLnVwKCk7XG5cdFx0XHRcdGNvbnN0IG1pc3NpbmdGb2xkZXJzOiBGaWxhW10gPSBbXTtcblx0XHRcdFx0XG5cdFx0XHRcdGZvciAoOzspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoYXdhaXQgY3VycmVudC5leGlzdHMoKSlcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdG1pc3NpbmdGb2xkZXJzLnB1c2goY3VycmVudCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0aWYgKGN1cnJlbnQudXAoKS5wYXRoID09PSBjdXJyZW50LnBhdGgpXG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRjdXJyZW50ID0gY3VycmVudC51cCgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRmb3IgKGNvbnN0IGZvbGRlciBvZiBtaXNzaW5nRm9sZGVycylcblx0XHRcdFx0XHRhd2FpdCBmb2xkZXIud3JpdGVEaXJlY3RvcnkoKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChvcHRpb25zPy5hcHBlbmQpXG5cdFx0XHRcdFx0dGV4dCA9IChcIlwiICsgKGF3YWl0IEZpbGFLZXl2YS5rZXl2YS5nZXQodGhpcy5wYXRoKSB8fCBcIlwiKSkgKyB0ZXh0O1xuXHRcdFx0XHRcblx0XHRcdFx0YXdhaXQgRmlsYUtleXZhLmtleXZhLnNldCh0aGlzLnBhdGgsIHRleHQpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIHdyaXRlQmluYXJ5KGFycmF5QnVmZmVyOiBBcnJheUJ1ZmZlcilcblx0XHRcdHtcblx0XHRcdFx0YXdhaXQgRmlsYUtleXZhLmtleXZhLnNldCh0aGlzLnBhdGgsIGFycmF5QnVmZmVyKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyB3cml0ZURpcmVjdG9yeSgpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChhd2FpdCB0aGlzLmlzRGlyZWN0b3J5KCkpXG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKGF3YWl0IHRoaXMuZXhpc3RzKCkpXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQSBmaWxlIGFscmVhZHkgZXhpc3RzIGF0IHRoaXMgbG9jYXRpb24uXCIpO1xuXHRcdFx0XHRcblx0XHRcdFx0YXdhaXQgRmlsYUtleXZhLmtleXZhLnNldCh0aGlzLnBhdGgsIG51bGwpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKipcblx0XHRcdCAqIFdyaXRlcyBhIHN5bWxpbmsgZmlsZSBhdCB0aGUgbG9jYXRpb24gcmVwcmVzZW50ZWQgYnkgdGhlIHNwZWNpZmllZFxuXHRcdFx0ICogRmlsYSBvYmplY3QsIHRvIHRoZSBsb2NhdGlvbiBzcGVjaWZpZWQgYnkgdGhlIGN1cnJlbnQgRmlsYSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdGFzeW5jIHdyaXRlU3ltbGluayhhdDogRmlsYSlcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm90IGltcGxlbWVudGVkXCIpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKipcblx0XHRcdCAqIERlbGV0ZXMgdGhlIGZpbGUgb3IgZGlyZWN0b3J5IHRoYXQgdGhpcyBGaWxhIG9iamVjdCByZXByZXNlbnRzLlxuXHRcdFx0ICovXG5cdFx0XHRhc3luYyBkZWxldGUoKTogUHJvbWlzZTxFcnJvciB8IHZvaWQ+XG5cdFx0XHR7XG5cdFx0XHRcdGlmIChhd2FpdCB0aGlzLmlzRGlyZWN0b3J5KCkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCByYW5nZSA9IEtleXZhLnByZWZpeCh0aGlzLnBhdGggKyBcIi9cIik7XG5cdFx0XHRcdFx0YXdhaXQgRmlsYUtleXZhLmtleXZhLmRlbGV0ZShyYW5nZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdGF3YWl0IEZpbGFLZXl2YS5rZXl2YS5kZWxldGUodGhpcy5wYXRoKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyBtb3ZlKHRhcmdldDogRmlsYSlcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm90IGltcGxlbWVudGVkLlwiKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyBjb3B5KHRhcmdldDogRmlsYSlcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm90IGltcGxlbWVudGVkLlwiKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRwcm90ZWN0ZWQgd2F0Y2hQcm90ZWN0ZWQoXG5cdFx0XHRcdHJlY3Vyc2l2ZTogYm9vbGVhbixcblx0XHRcdFx0Y2FsbGJhY2tGbjogKGV2ZW50OiBGaWxhLkV2ZW50LCBmaWxhOiBGaWxhLCBzZWNvbmRhcnlGaWxhPzogRmlsYSkgPT4gdm9pZClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm90IGltcGxlbWVudGVkXCIpO1xuXHRcdFx0XHRyZXR1cm4gKCkgPT4ge307XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0YXN5bmMgcmVuYW1lKG5ld05hbWU6IHN0cmluZylcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm90IGltcGxlbWVudGVkLlwiKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyBleGlzdHMoKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCB2YWx1ZSA9IGF3YWl0IEZpbGFLZXl2YS5rZXl2YS5nZXQodGhpcy5wYXRoKTtcblx0XHRcdFx0cmV0dXJuIHZhbHVlICE9PSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0YXN5bmMgZ2V0U2l6ZSgpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIGdldE1vZGlmaWVkVGlja3MoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyBnZXRDcmVhdGVkVGlja3MoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyBnZXRBY2Nlc3NlZFRpY2tzKClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0YXN5bmMgaXNEaXJlY3RvcnkoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gYXdhaXQgRmlsYUtleXZhLmtleXZhLmdldCh0aGlzLnBhdGgpID09PSBudWxsO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRcblx0ZGVjbGFyZSBjb25zdCBtb2R1bGU6IGFueTtcblx0dHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBPYmplY3QuYXNzaWduKG1vZHVsZS5leHBvcnRzLCB7IEZpbGFLZXl2YSB9KTtcbn0iXX0=