"use strict";
var FilaCapacitor;
(function (FilaCapacitor_1) {
    /** */
    let Directory;
    (function (Directory) {
        Directory["cache"] = "CACHE";
        Directory["data"] = "DATA";
        Directory["documents"] = "DOCUMENTS";
        Directory["external"] = "EXTERNAL";
        Directory["externalStorage"] = "EXTERNAL_STORAGE";
        Directory["library"] = "LIBRARY";
    })(Directory || (Directory = {}));
    /** */
    async function use() {
        const cwd = "DATA" /* Directory.data */;
        const tmp = "CACHE" /* Directory.cache */;
        const sep = "/";
        /** */
        class FilaCapacitor extends Fila {
            /** */
            static _ = (() => {
                Fila.setDefaults(FilaCapacitor, sep, cwd, tmp);
            })();
            /** */
            get fs() {
                const g = globalThis;
                const fs = g.Capacitor?.Plugins?.Filesystem;
                if (!fs)
                    throw new Error("Filesystem plugin not added to Capacitor.");
                return fs;
            }
            /**
             * Gets the fully-qualified path, including any file name to the
             * file system object being represented by this Fila object.
             */
            get path() {
                return Fila.join(...this.components);
            }
            /** */
            async readText() {
                const result = await this.fs.readFile({
                    ...this.getDefaultOptions(),
                    encoding: "utf8"
                });
                return result.data;
            }
            /** */
            async readBinary() {
                const result = await this.fs.readFile({
                    ...this.getDefaultOptions(),
                    encoding: "ascii"
                });
                const base64 = result.data;
                return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            }
            /** */
            async readDirectory() {
                const result = await this.fs.readdir(this.getDefaultOptions());
                const filas = [];
                for (const file of result.files)
                    if (file.name !== ".DS_Store")
                        filas.push(Fila.new(this.path, file.name || ""));
                return filas;
            }
            /** */
            async writeText(text, options) {
                try {
                    const up = this.up();
                    if (!await up.exists())
                        await up.writeDirectory();
                    const writeOptions = {
                        ...this.getDefaultOptions(),
                        data: text,
                        encoding: "utf8"
                    };
                    if (options?.append)
                        await this.fs.appendFile(writeOptions);
                    else
                        await this.fs.writeFile(writeOptions);
                }
                catch (e) {
                    console.error("Write failed to path: " + this.path);
                    debugger;
                }
            }
            /** */
            async writeBinary(arrayBuffer) {
                await this.up().writeDirectory();
                const data = await this.arrayBufferToBase64(arrayBuffer);
                await this.fs.writeFile({
                    ...this.getDefaultOptions(),
                    data,
                    encoding: "ascii"
                });
            }
            /** */
            arrayBufferToBase64(buffer) {
                return new Promise(r => {
                    const blob = new Blob([buffer], { type: "application/octet-binary" });
                    const reader = new FileReader();
                    reader.onload = ev => {
                        const dataUrl = (ev.target?.result || "");
                        const slice = dataUrl.slice(dataUrl.indexOf(`,`) + 1);
                        r(slice);
                    };
                    reader.readAsDataURL(blob);
                });
            }
            /** */
            async writeDirectory() {
                await this.fs.mkdir({
                    ...this.getDefaultOptions(),
                    recursive: true
                });
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
                    return new Promise(async (r) => {
                        await this.fs.rmdir({
                            ...this.getDefaultOptions(),
                            recursive: true
                        });
                        r();
                    });
                }
                await this.fs.deleteFile(this.getDefaultOptions());
            }
            /** */
            async move(target) {
                throw new Error("Not implemented.");
            }
            /** */
            async copy(target) {
                const fromOptions = this.getDefaultOptions();
                const toOptions = this.getDefaultOptions(target.path);
                await this.fs.copy({
                    from: fromOptions.path,
                    directory: fromOptions.directory,
                    to: toOptions.path,
                    toDirectory: toOptions.directory,
                });
            }
            /** */
            async rename(newName) {
                const target = this.up().down(newName).path;
                const fromOptions = this.getDefaultOptions();
                const toOptions = this.getDefaultOptions(target);
                await this.fs.rename({
                    from: this.path,
                    directory: fromOptions.directory,
                    to: target,
                    toDirectory: toOptions.directory
                });
            }
            /** */
            watchProtected(recursive, callbackFn) {
                throw new Error("Not implemented");
            }
            /** */
            async exists() {
                return !!await this.getStat();
            }
            /** */
            async getSize() {
                return (await this.getStat())?.size || 0;
            }
            /** */
            async getModifiedTicks() {
                return (await this.getStat())?.mtime || 0;
            }
            /** */
            async getCreatedTicks() {
                return (await this.getStat())?.ctime || 0;
            }
            /** */
            async getAccessedTicks() {
                return 0;
            }
            /** */
            async isDirectory() {
                return (await this.getStat())?.type === "directory";
            }
            /** */
            async getStat() {
                try {
                    return await this.fs.stat(this.getDefaultOptions());
                }
                catch (e) {
                    return null;
                }
            }
            /** */
            getDefaultOptions(targetPath = this.path) {
                const slash = targetPath.indexOf("/");
                let path = "";
                let directory = "";
                if (slash < 0) {
                    path = targetPath;
                    directory = "CACHE" /* Directory.cache */;
                }
                else {
                    path = targetPath.slice(slash + 1);
                    directory = targetPath.slice(0, slash);
                }
                const result = {
                    path,
                    directory: directory
                };
                return result;
            }
        }
    }
    FilaCapacitor_1.use = use;
    typeof module === "object" && Object.assign(module.exports, { FilaCapacitor });
})(FilaCapacitor || (FilaCapacitor = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsYS1jYXBhY2l0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9GaWxhQ2FwYWNpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxJQUFVLGFBQWEsQ0ErU3RCO0FBL1NELFdBQVUsZUFBYTtJQUV0QixNQUFNO0lBQ04sSUFBVyxTQVFWO0lBUkQsV0FBVyxTQUFTO1FBRW5CLDRCQUFlLENBQUE7UUFDZiwwQkFBYSxDQUFBO1FBQ2Isb0NBQXVCLENBQUE7UUFDdkIsa0NBQXFCLENBQUE7UUFDckIsaURBQW9DLENBQUE7UUFDcEMsZ0NBQW1CLENBQUE7SUFDcEIsQ0FBQyxFQVJVLFNBQVMsS0FBVCxTQUFTLFFBUW5CO0lBS0QsTUFBTTtJQUNDLEtBQUssVUFBVSxHQUFHO1FBRXhCLE1BQU0sR0FBRyw4QkFBaUIsQ0FBQztRQUMzQixNQUFNLEdBQUcsZ0NBQWtCLENBQUM7UUFDNUIsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBRWhCLE1BQU07UUFDTixNQUFNLGFBQWMsU0FBUSxJQUFJO1lBRS9CLE1BQU07WUFDTixNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO2dCQUVoQixJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQyxFQUFFLENBQUM7WUFFTCxNQUFNO1lBQ04sSUFBWSxFQUFFO2dCQUViLE1BQU0sQ0FBQyxHQUFHLFVBQWlCLENBQUM7Z0JBQzVCLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLEVBQUU7b0JBQ04sTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO2dCQUU5RCxPQUFPLEVBQXVELENBQUM7WUFDaEUsQ0FBQztZQUVEOzs7ZUFHRztZQUNILElBQUksSUFBSTtnQkFFUCxPQUFPLElBQUksQ0FB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Q29udGVudCI6WyJcbm5hbWVzcGFjZSBGaWxhQ2FwYWNpdG9yXG57XG5cdC8qKiAqL1xuXHRjb25zdCBlbnVtIERpcmVjdG9yeVxuXHR7XG5cdFx0Y2FjaGUgPSBcIkNBQ0hFXCIsXG5cdFx0ZGF0YSA9IFwiREFUQVwiLFxuXHRcdGRvY3VtZW50cyA9IFwiRE9DVU1FTlRTXCIsXG5cdFx0ZXh0ZXJuYWwgPSBcIkVYVEVSTkFMXCIsXG5cdFx0ZXh0ZXJuYWxTdG9yYWdlID0gXCJFWFRFUk5BTF9TVE9SQUdFXCIsXG5cdFx0bGlicmFyeSA9IFwiTElCUkFSWVwiLFxuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IHR5cGUgVERpcmVjdG9yeSA9IGltcG9ydChcIkBjYXBhY2l0b3IvZmlsZXN5c3RlbVwiKS5EaXJlY3Rvcnk7XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVzZSgpXG5cdHtcblx0XHRjb25zdCBjd2QgPSBEaXJlY3RvcnkuZGF0YTtcblx0XHRjb25zdCB0bXAgPSBEaXJlY3RvcnkuY2FjaGU7XG5cdFx0Y29uc3Qgc2VwID0gXCIvXCI7XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0Y2xhc3MgRmlsYUNhcGFjaXRvciBleHRlbmRzIEZpbGFcblx0XHR7XG5cdFx0XHQvKiogKi9cblx0XHRcdHN0YXRpYyBfID0gKCgpID0+XG5cdFx0XHR7XG5cdFx0XHRcdEZpbGEuc2V0RGVmYXVsdHMoRmlsYUNhcGFjaXRvciwgc2VwLCBjd2QsIHRtcCk7XG5cdFx0XHR9KSgpO1xuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdHByaXZhdGUgZ2V0IGZzKClcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgZyA9IGdsb2JhbFRoaXMgYXMgYW55O1xuXHRcdFx0XHRjb25zdCBmcyA9IGcuQ2FwYWNpdG9yPy5QbHVnaW5zPy5GaWxlc3lzdGVtO1xuXHRcdFx0XHRpZiAoIWZzKVxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkZpbGVzeXN0ZW0gcGx1Z2luIG5vdCBhZGRlZCB0byBDYXBhY2l0b3IuXCIpO1xuXHRcdFx0XHRcblx0XHRcdFx0cmV0dXJuIGZzIGFzIHR5cGVvZiBpbXBvcnQoXCJAY2FwYWNpdG9yL2ZpbGVzeXN0ZW1cIikuRmlsZXN5c3RlbTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBHZXRzIHRoZSBmdWxseS1xdWFsaWZpZWQgcGF0aCwgaW5jbHVkaW5nIGFueSBmaWxlIG5hbWUgdG8gdGhlXG5cdFx0XHQgKiBmaWxlIHN5c3RlbSBvYmplY3QgYmVpbmcgcmVwcmVzZW50ZWQgYnkgdGhpcyBGaWxhIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0Z2V0IHBhdGgoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gRmlsYS5qb2luKC4uLnRoaXMuY29tcG9uZW50cyk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0YXN5bmMgcmVhZFRleHQoKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmZzLnJlYWRGaWxlKHtcblx0XHRcdFx0XHQuLi50aGlzLmdldERlZmF1bHRPcHRpb25zKCksXG5cdFx0XHRcdFx0ZW5jb2Rpbmc6IFwidXRmOFwiIGFzIGFueVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0XG5cdFx0XHRcdHJldHVybiByZXN1bHQuZGF0YTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyByZWFkQmluYXJ5KClcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5mcy5yZWFkRmlsZSh7XG5cdFx0XHRcdFx0Li4udGhpcy5nZXREZWZhdWx0T3B0aW9ucygpLFxuXHRcdFx0XHRcdGVuY29kaW5nOiBcImFzY2lpXCIgYXMgYW55XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRcblx0XHRcdFx0Y29uc3QgYmFzZTY0ID0gcmVzdWx0LmRhdGE7XG5cdFx0XHRcdHJldHVybiBVaW50OEFycmF5LmZyb20oYXRvYihiYXNlNjQpLCBjID0+IGMuY2hhckNvZGVBdCgwKSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0YXN5bmMgcmVhZERpcmVjdG9yeSgpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZnMucmVhZGRpcih0aGlzLmdldERlZmF1bHRPcHRpb25zKCkpO1xuXHRcdFx0XHRjb25zdCBmaWxhczogRmlsYVtdID0gW107XG5cdFx0XHRcdFxuXHRcdFx0XHRmb3IgKGNvbnN0IGZpbGUgb2YgcmVzdWx0LmZpbGVzKVxuXHRcdFx0XHRcdGlmIChmaWxlLm5hbWUgIT09IFwiLkRTX1N0b3JlXCIpXG5cdFx0XHRcdFx0XHRmaWxhcy5wdXNoKEZpbGEubmV3KHRoaXMucGF0aCwgZmlsZS5uYW1lIHx8IFwiXCIpKTtcblx0XHRcdFx0XG5cdFx0XHRcdHJldHVybiBmaWxhcztcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyB3cml0ZVRleHQodGV4dDogc3RyaW5nLCBvcHRpb25zPzogRmlsYS5JV3JpdGVUZXh0T3B0aW9ucylcblx0XHRcdHtcblx0XHRcdFx0dHJ5XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCB1cCA9IHRoaXMudXAoKTtcblx0XHRcdFx0XHRpZiAoIWF3YWl0IHVwLmV4aXN0cygpKVxuXHRcdFx0XHRcdFx0YXdhaXQgdXAud3JpdGVEaXJlY3RvcnkoKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRjb25zdCB3cml0ZU9wdGlvbnMgPSB7XG5cdFx0XHRcdFx0XHQuLi50aGlzLmdldERlZmF1bHRPcHRpb25zKCksXG5cdFx0XHRcdFx0XHRkYXRhOiB0ZXh0LFxuXHRcdFx0XHRcdFx0ZW5jb2Rpbmc6IFwidXRmOFwiIGFzIGFueVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0aWYgKG9wdGlvbnM/LmFwcGVuZClcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuZnMuYXBwZW5kRmlsZSh3cml0ZU9wdGlvbnMpO1xuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuZnMud3JpdGVGaWxlKHdyaXRlT3B0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKFwiV3JpdGUgZmFpbGVkIHRvIHBhdGg6IFwiICsgdGhpcy5wYXRoKTtcblx0XHRcdFx0XHRkZWJ1Z2dlcjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIHdyaXRlQmluYXJ5KGFycmF5QnVmZmVyOiBBcnJheUJ1ZmZlcilcblx0XHRcdHtcblx0XHRcdFx0YXdhaXQgdGhpcy51cCgpLndyaXRlRGlyZWN0b3J5KCk7XG5cdFx0XHRcdGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmFycmF5QnVmZmVyVG9CYXNlNjQoYXJyYXlCdWZmZXIpO1xuXHRcdFx0XHRhd2FpdCB0aGlzLmZzLndyaXRlRmlsZSh7XG5cdFx0XHRcdFx0Li4udGhpcy5nZXREZWZhdWx0T3B0aW9ucygpLFxuXHRcdFx0XHRcdGRhdGEsXG5cdFx0XHRcdFx0ZW5jb2Rpbmc6IFwiYXNjaWlcIiBhcyBhbnlcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0cHJpdmF0ZSBhcnJheUJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcjogQXJyYXlCdWZmZXIpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBuZXcgUHJvbWlzZTxzdHJpbmc+KHIgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbYnVmZmVyXSwgeyB0eXBlOiBcImFwcGxpY2F0aW9uL29jdGV0LWJpbmFyeVwiIH0pO1xuXHRcdFx0XHRcdGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0cmVhZGVyLm9ubG9hZCA9IGV2ID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc3QgZGF0YVVybCA9IChldi50YXJnZXQ/LnJlc3VsdCB8fCBcIlwiKSBhcyBzdHJpbmc7XG5cdFx0XHRcdFx0XHRjb25zdCBzbGljZSA9IGRhdGFVcmwuc2xpY2UoZGF0YVVybC5pbmRleE9mKGAsYCkgKyAxKTtcblx0XHRcdFx0XHRcdHIoc2xpY2UpO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0cmVhZGVyLnJlYWRBc0RhdGFVUkwoYmxvYik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIHdyaXRlRGlyZWN0b3J5KClcblx0XHRcdHtcblx0XHRcdFx0YXdhaXQgdGhpcy5mcy5ta2Rpcih7XG5cdFx0XHRcdFx0Li4udGhpcy5nZXREZWZhdWx0T3B0aW9ucygpLFxuXHRcdFx0XHRcdHJlY3Vyc2l2ZTogdHJ1ZVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBXcml0ZXMgYSBzeW1saW5rIGZpbGUgYXQgdGhlIGxvY2F0aW9uIHJlcHJlc2VudGVkIGJ5IHRoZSBzcGVjaWZpZWRcblx0XHRcdCAqIEZpbGEgb2JqZWN0LCB0byB0aGUgbG9jYXRpb24gc3BlY2lmaWVkIGJ5IHRoZSBjdXJyZW50IEZpbGEgb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRhc3luYyB3cml0ZVN5bWxpbmsoYXQ6IEZpbGEpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIk5vdCBpbXBsZW1lbnRlZFwiKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBEZWxldGVzIHRoZSBmaWxlIG9yIGRpcmVjdG9yeSB0aGF0IHRoaXMgRmlsYSBvYmplY3QgcmVwcmVzZW50cy5cblx0XHRcdCAqL1xuXHRcdFx0YXN5bmMgZGVsZXRlKCk6IFByb21pc2U8RXJyb3IgfCB2b2lkPlxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoYXdhaXQgdGhpcy5pc0RpcmVjdG9yeSgpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlPEVycm9yIHwgdm9pZD4oYXN5bmMgciA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuZnMucm1kaXIoe1xuXHRcdFx0XHRcdFx0XHQuLi50aGlzLmdldERlZmF1bHRPcHRpb25zKCksXG5cdFx0XHRcdFx0XHRcdHJlY3Vyc2l2ZTogdHJ1ZVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdHIoKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0YXdhaXQgdGhpcy5mcy5kZWxldGVGaWxlKHRoaXMuZ2V0RGVmYXVsdE9wdGlvbnMoKSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0YXN5bmMgbW92ZSh0YXJnZXQ6IEZpbGEpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIk5vdCBpbXBsZW1lbnRlZC5cIik7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0YXN5bmMgY29weSh0YXJnZXQ6IEZpbGEpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGZyb21PcHRpb25zID0gdGhpcy5nZXREZWZhdWx0T3B0aW9ucygpO1xuXHRcdFx0XHRjb25zdCB0b09wdGlvbnMgPSB0aGlzLmdldERlZmF1bHRPcHRpb25zKHRhcmdldC5wYXRoKTtcblx0XHRcdFx0XG5cdFx0XHRcdGF3YWl0IHRoaXMuZnMuY29weSh7XG5cdFx0XHRcdFx0ZnJvbTogZnJvbU9wdGlvbnMucGF0aCxcblx0XHRcdFx0XHRkaXJlY3Rvcnk6IGZyb21PcHRpb25zLmRpcmVjdG9yeSxcblx0XHRcdFx0XHR0bzogdG9PcHRpb25zLnBhdGgsXG5cdFx0XHRcdFx0dG9EaXJlY3Rvcnk6IHRvT3B0aW9ucy5kaXJlY3RvcnksXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIHJlbmFtZShuZXdOYW1lOiBzdHJpbmcpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHRhcmdldCA9IHRoaXMudXAoKS5kb3duKG5ld05hbWUpLnBhdGg7XG5cdFx0XHRcdGNvbnN0IGZyb21PcHRpb25zID0gdGhpcy5nZXREZWZhdWx0T3B0aW9ucygpO1xuXHRcdFx0XHRjb25zdCB0b09wdGlvbnMgPSB0aGlzLmdldERlZmF1bHRPcHRpb25zKHRhcmdldCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRhd2FpdCB0aGlzLmZzLnJlbmFtZSh7XG5cdFx0XHRcdFx0ZnJvbTogdGhpcy5wYXRoLFxuXHRcdFx0XHRcdGRpcmVjdG9yeTogZnJvbU9wdGlvbnMuZGlyZWN0b3J5LFxuXHRcdFx0XHRcdHRvOiB0YXJnZXQsXG5cdFx0XHRcdFx0dG9EaXJlY3Rvcnk6IHRvT3B0aW9ucy5kaXJlY3Rvcnlcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0cHJvdGVjdGVkIHdhdGNoUHJvdGVjdGVkKFxuXHRcdFx0XHRyZWN1cnNpdmU6IGJvb2xlYW4sXG5cdFx0XHRcdGNhbGxiYWNrRm46IChldmVudDogRmlsYS5FdmVudCwgZmlsYTogRmlsYSkgPT4gdm9pZCk6ICgpID0+IHZvaWRcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm90IGltcGxlbWVudGVkXCIpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIGV4aXN0cygpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiAhIWF3YWl0IHRoaXMuZ2V0U3RhdCgpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIGdldFNpemUoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gKGF3YWl0IHRoaXMuZ2V0U3RhdCgpKT8uc2l6ZSB8fCAwO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIGdldE1vZGlmaWVkVGlja3MoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gKGF3YWl0IHRoaXMuZ2V0U3RhdCgpKT8ubXRpbWUgfHwgMDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyBnZXRDcmVhdGVkVGlja3MoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gKGF3YWl0IHRoaXMuZ2V0U3RhdCgpKT8uY3RpbWUgfHwgMDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyBnZXRBY2Nlc3NlZFRpY2tzKClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0YXN5bmMgaXNEaXJlY3RvcnkoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gKGF3YWl0IHRoaXMuZ2V0U3RhdCgpKT8udHlwZSA9PT0gXCJkaXJlY3RvcnlcIjtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRwcml2YXRlIGFzeW5jIGdldFN0YXQoKVxuXHRcdFx0e1xuXHRcdFx0XHR0cnlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBhd2FpdCB0aGlzLmZzLnN0YXQodGhpcy5nZXREZWZhdWx0T3B0aW9ucygpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXRjaCAoZSkgeyByZXR1cm4gbnVsbDsgfVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdHByaXZhdGUgZ2V0RGVmYXVsdE9wdGlvbnModGFyZ2V0UGF0aDogc3RyaW5nID0gdGhpcy5wYXRoKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBzbGFzaCA9IHRhcmdldFBhdGguaW5kZXhPZihcIi9cIik7XG5cdFx0XHRcdGxldCBwYXRoID0gXCJcIjtcblx0XHRcdFx0bGV0IGRpcmVjdG9yeSA9IFwiXCI7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoc2xhc2ggPCAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cGF0aCA9IHRhcmdldFBhdGg7XG5cdFx0XHRcdFx0ZGlyZWN0b3J5ID0gRGlyZWN0b3J5LmNhY2hlIGFzIGFueSBhcyBURGlyZWN0b3J5O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBhdGggPSB0YXJnZXRQYXRoLnNsaWNlKHNsYXNoICsgMSk7XG5cdFx0XHRcdFx0ZGlyZWN0b3J5ID0gdGFyZ2V0UGF0aC5zbGljZSgwLCBzbGFzaCkgYXMgVERpcmVjdG9yeTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Y29uc3QgcmVzdWx0ID0ge1xuXHRcdFx0XHRcdHBhdGgsXG5cdFx0XHRcdFx0ZGlyZWN0b3J5OiBkaXJlY3RvcnkgYXMgVERpcmVjdG9yeVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRcblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0XG5cdGRlY2xhcmUgY29uc3QgbW9kdWxlOiBhbnk7XG5cdHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgT2JqZWN0LmFzc2lnbihtb2R1bGUuZXhwb3J0cywgeyBGaWxhQ2FwYWNpdG9yIH0pO1xufVxuIl19