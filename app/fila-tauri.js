"use strict";
var FilaTauri;
(function (FilaTauri_1) {
    async function use() {
        let path = null;
        try {
            path = globalThis.__TAURI__.path;
        }
        catch (e) {
            console.log("withGlobalTauri is not set");
            return;
        }
        let cwd = "/";
        let tmp = "/";
        try {
            cwd = await path.appDataDir();
            tmp = await path.appCacheDir();
        }
        catch (e) {
            console.error("The Tauri environment doesn't have access to the path APIs");
        }
        class FilaTauri extends Fila {
            /** */
            static _ = Fila.setDefaults(FilaTauri, path?.sep || "", cwd, tmp);
            /** */
            fs = globalThis.__TAURI__.fs;
            /** */
            readText() {
                return this.fs.readTextFile(this.path);
            }
            /** */
            readBinary() {
                return this.fs.readBinaryFile(this.path);
            }
            /** */
            async readDirectory() {
                const fileNames = await this.fs.readDir(this.path);
                const filas = [];
                for (const fileName of fileNames)
                    if (fileName.name !== ".DS_Store")
                        filas.push(Fila.new(this.path, fileName.name || ""));
                return filas;
            }
            /** */
            async writeText(text, options) {
                try {
                    const up = this.up();
                    if (!await up.exists())
                        await up.writeDirectory();
                    await this.fs.writeTextFile(this.path, text, {
                        append: options?.append
                    });
                }
                catch (e) {
                    debugger;
                }
            }
            /** */
            async writeBinary(arrayBuffer) {
                await this.up().writeDirectory();
                await this.fs.writeBinaryFile(this.path, arrayBuffer);
            }
            /** */
            async writeDirectory() {
                this.fs.createDir(this.path, { recursive: true });
            }
            /**
             * Writes a symlink file at the location represented by the specified
             * Fila object, to the location specified by the current Fila object.
             */
            async writeSymlink(at) {
                return null;
            }
            /**
             * Deletes the file or directory that this Fila object represents.
             */
            async delete() {
                if (await this.isDirectory()) {
                    return new Promise(async (resolve) => {
                        await this.fs.removeDir(this.path, { recursive: true });
                        resolve();
                    });
                }
                await this.fs.removeFile(this.path);
            }
            /** */
            move(target) {
                return null;
            }
            /** */
            async copy(target) {
                if (await target.isDirectory())
                    throw "Copying directories is not implemented.";
                await this.fs.copyFile(this.path, target.path);
            }
            /** */
            watchProtected(recursive, callbackFn) {
                let un = null;
                (async () => {
                    un = await watchInternal(this.path, {}, async (ev) => {
                        if (!un)
                            return;
                        const payload = ev.payload.payload;
                        if (typeof payload !== "string")
                            return;
                        const fila = Fila.new(ev.payload.payload);
                        if (ev.type === "NoticeWrite" || ev.type === "Write")
                            callbackFn("modify" /* Fila.Event.modify */, fila);
                        else if (ev.type === "NoticeRemove" || ev.type === "Remove")
                            callbackFn("delete" /* Fila.Event.delete */, fila);
                        else if (ev.type === "Create" || ev.type === "Rename")
                            callbackFn("modify" /* Fila.Event.modify */, fila);
                    });
                })();
                return () => {
                    // This is hacky... the interface expects a function to be
                    // returned rather than a promise that resolves to one,
                    // so this waits 100ms to call the un() function if this unwatch
                    // function is invoked immediately after calling watch().
                    if (un)
                        un();
                    else
                        setTimeout(() => un?.(), 100);
                };
            }
            /** */
            async rename(newName) {
                // Note that the "renameFile" method actually works on directories
                return this.fs.renameFile(this.path, this.up().down(newName).path);
            }
            /** */
            async exists() {
                return this.fs.exists(this.path);
            }
            /** */
            async getSize() {
                return (await this.getMeta()).size;
            }
            /** */
            async getModifiedTicks() {
                return (await this.getMeta()).modifiedAt;
            }
            /** */
            async getCreatedTicks() {
                return (await this.getMeta()).createdAt;
            }
            /** */
            async getAccessedTicks() {
                return (await this.getMeta()).accessedAt;
            }
            /** */
            async isDirectory() {
                return (await this.getMeta()).isDir;
            }
            /** */
            async getMeta() {
                return this._meta || (this._meta = await getMetadata(this.path));
            }
            _meta = null;
        }
    }
    FilaTauri_1.use = use;
    //@ts-ignore
    if (!("__TAURI__" in globalThis))
        return;
    const t = globalThis.__TAURI__;
    const tauri = t.tauri;
    const wind = t.window;
    /** @internal */
    async function unwatch(id) {
        await tauri.invoke('plugin:fs-watch|unwatch', { id });
    }
    FilaTauri_1.unwatch = unwatch;
    /** @internal */
    async function watchInternal(paths, options, callbackFn) {
        const opts = {
            recursive: false,
            delayMs: 2000,
            ...options,
        };
        let watchPaths;
        if (typeof paths === "string")
            watchPaths = [paths];
        else
            watchPaths = paths;
        const id = window.crypto.getRandomValues(new Uint32Array(1))[0];
        await tauri.invoke("plugin:fs-watch|watch", {
            id,
            paths: watchPaths,
            options: opts,
        });
        const unlisten = await wind.appWindow.listen(`watcher://raw-event/${id}`, event => {
            callbackFn(event);
        });
        return async () => {
            await unwatch(id);
            unlisten();
        };
    }
    FilaTauri_1.watchInternal = watchInternal;
    /** @internal */
    async function watchImmediate(paths, options, callbackFn) {
        const opts = {
            recursive: false,
            ...options,
            delayMs: null
        };
        const watchPaths = typeof paths === "string" ? [paths] : paths;
        const id = window.crypto.getRandomValues(new Uint32Array(1))[0];
        await tauri.invoke("plugin:fs-watch|watch", {
            id,
            paths: watchPaths,
            options: opts,
        });
        const unlisten = await wind.appWindow.listen(`watcher://raw-event/${id}`, event => {
            callbackFn(event);
        });
        return async () => {
            await unwatch(id);
            unlisten();
        };
    }
    FilaTauri_1.watchImmediate = watchImmediate;
    /** @internal */
    function getMetadata(path) {
        return tauri.invoke("plugin:fs-extra|metadata", { path });
    }
    typeof module === "object" && Object.assign(module.exports, { FilaTauri });
})(FilaTauri || (FilaTauri = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsYS10YXVyaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL0ZpbGFUYXVyaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBVSxTQUFTLENBeWRsQjtBQXpkRCxXQUFVLFdBQVM7SUFFWCxLQUFLLFVBQVUsR0FBRztRQUV4QixJQUFJLElBQUksR0FBaUQsSUFBSSxDQUFDO1FBRTlELElBQ0E7WUFDQyxJQUFJLEdBQUksVUFBa0IsQ0FBQyxTQUFTLENBQUMsSUFBNkMsQ0FBQztTQUNuRjtRQUNELE9BQU8sQ0FBQyxFQUNSO1lBQ0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1lBQzFDLE9BQU87U0FDUDtRQUVELElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNkLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUVkLElBQ0E7WUFDQyxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDOUIsR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQy9CO1FBQ0QsT0FBTyxDQUFDLEVBQ1I7WUFDQyxPQUFPLENBQUMsS0FBSyxDQUFDLDREQUE0RCxDQUFDLENBQUM7U0FDNUU7UUFFRCxNQUFNLFNBQVUsU0FBUSxJQUFJO1lBRTNCLE1BQU07WUFDTixNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUVsRSxNQUFNO1lBQ1csRUFBRSxHQUNqQixVQUFrQixDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFFbEMsTUFBTTtZQUNOLFFBQVE7Z0JBRVAsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEMsQ0FBQztZQUVELE1BQU07WUFDTixVQUFVO2dCQUVU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QUFDLEVBQUU7WUFFUixVQUFVLENBQUMsS0FBd0IsQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxLQUFLLElBQUksRUFBRTtZQUVqQixNQUFNLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNsQixRQUFRLEVBQUUsQ0FBQztRQUNaLENBQUMsQ0FBQztJQUNILENBQUM7SUFoQ3FCLDBCQUFjLGlCQWdDbkMsQ0FBQTtJQXVDRCxnQkFBZ0I7SUFDaEIsU0FBUyxXQUFXLENBQUMsSUFBWTtRQUVoQyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsMEJBQTBCLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFnSEQsT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7QUFDNUUsQ0FBQyxFQXpkUyxTQUFTLEtBQVQsU0FBUyxRQXlkbEIiLCJzb3VyY2VzQ29udGVudCI6WyJcbm5hbWVzcGFjZSBGaWxhVGF1cmlcbntcblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVzZSgpXG5cdHtcblx0XHRsZXQgcGF0aDogdHlwZW9mIGltcG9ydChcIkB0YXVyaS1hcHBzL2FwaVwiKS5wYXRoIHwgbnVsbCA9IG51bGw7XG5cdFx0XHRcblx0XHR0cnlcblx0XHR7XG5cdFx0XHRwYXRoID0gKGdsb2JhbFRoaXMgYXMgYW55KS5fX1RBVVJJX18ucGF0aCBhcyB0eXBlb2YgaW1wb3J0KFwiQHRhdXJpLWFwcHMvYXBpXCIpLnBhdGg7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKFwid2l0aEdsb2JhbFRhdXJpIGlzIG5vdCBzZXRcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdFxuXHRcdGxldCBjd2QgPSBcIi9cIjtcblx0XHRsZXQgdG1wID0gXCIvXCI7XG5cdFx0XG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0Y3dkID0gYXdhaXQgcGF0aC5hcHBEYXRhRGlyKCk7XG5cdFx0XHR0bXAgPSBhd2FpdCBwYXRoLmFwcENhY2hlRGlyKCk7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoXCJUaGUgVGF1cmkgZW52aXJvbm1lbnQgZG9lc24ndCBoYXZlIGFjY2VzcyB0byB0aGUgcGF0aCBBUElzXCIpO1xuXHRcdH1cblx0XHRcblx0XHRjbGFzcyBGaWxhVGF1cmkgZXh0ZW5kcyBGaWxhXG5cdFx0e1xuXHRcdFx0LyoqICovXG5cdFx0XHRzdGF0aWMgXyA9IEZpbGEuc2V0RGVmYXVsdHMoRmlsYVRhdXJpLCBwYXRoPy5zZXAgfHwgXCJcIiwgY3dkLCB0bXApO1xuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdHByaXZhdGUgcmVhZG9ubHkgZnM6IHR5cGVvZiBpbXBvcnQoXCJAdGF1cmktYXBwcy9hcGlcIikuZnMgPSBcblx0XHRcdFx0KGdsb2JhbFRoaXMgYXMgYW55KS5fX1RBVVJJX18uZnM7XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0cmVhZFRleHQoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5mcy5yZWFkVGV4dEZpbGUodGhpcy5wYXRoKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRyZWFkQmluYXJ5KClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZnMucmVhZEJpbmFyeUZpbGUodGhpcy5wYXRoKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyByZWFkRGlyZWN0b3J5KClcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgZmlsZU5hbWVzID0gYXdhaXQgdGhpcy5mcy5yZWFkRGlyKHRoaXMucGF0aCk7XG5cdFx0XHRcdGNvbnN0IGZpbGFzOiBGaWxhW10gPSBbXTtcblx0XHRcdFx0XG5cdFx0XHRcdGZvciAoY29uc3QgZmlsZU5hbWUgb2YgZmlsZU5hbWVzKVxuXHRcdFx0XHRcdGlmIChmaWxlTmFtZS5uYW1lICE9PSBcIi5EU19TdG9yZVwiKVxuXHRcdFx0XHRcdFx0ZmlsYXMucHVzaChGaWxhLm5ldyh0aGlzLnBhdGgsIGZpbGVOYW1lLm5hbWUgfHwgXCJcIikpO1xuXHRcdFx0XHRcblx0XHRcdFx0cmV0dXJuIGZpbGFzO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIHdyaXRlVGV4dCh0ZXh0OiBzdHJpbmcsIG9wdGlvbnM/OiBGaWxhLklXcml0ZVRleHRPcHRpb25zKVxuXHRcdFx0e1xuXHRcdFx0XHR0cnlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0IHVwID0gdGhpcy51cCgpO1xuXHRcdFx0XHRcdGlmICghYXdhaXQgdXAuZXhpc3RzKCkpXG5cdFx0XHRcdFx0XHRhd2FpdCB1cC53cml0ZURpcmVjdG9yeSgpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGF3YWl0IHRoaXMuZnMud3JpdGVUZXh0RmlsZSh0aGlzLnBhdGgsIHRleHQsIHtcblx0XHRcdFx0XHRcdGFwcGVuZDogb3B0aW9ucz8uYXBwZW5kXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkZWJ1Z2dlcjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIHdyaXRlQmluYXJ5KGFycmF5QnVmZmVyOiBBcnJheUJ1ZmZlcilcblx0XHRcdHtcblx0XHRcdFx0YXdhaXQgdGhpcy51cCgpLndyaXRlRGlyZWN0b3J5KCk7XG5cdFx0XHRcdGF3YWl0IHRoaXMuZnMud3JpdGVCaW5hcnlGaWxlKHRoaXMucGF0aCwgYXJyYXlCdWZmZXIpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIHdyaXRlRGlyZWN0b3J5KClcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5mcy5jcmVhdGVEaXIodGhpcy5wYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBXcml0ZXMgYSBzeW1saW5rIGZpbGUgYXQgdGhlIGxvY2F0aW9uIHJlcHJlc2VudGVkIGJ5IHRoZSBzcGVjaWZpZWRcblx0XHRcdCAqIEZpbGEgb2JqZWN0LCB0byB0aGUgbG9jYXRpb24gc3BlY2lmaWVkIGJ5IHRoZSBjdXJyZW50IEZpbGEgb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRhc3luYyB3cml0ZVN5bWxpbmsoYXQ6IEZpbGEpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBudWxsIGFzIGFueTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBEZWxldGVzIHRoZSBmaWxlIG9yIGRpcmVjdG9yeSB0aGF0IHRoaXMgRmlsYSBvYmplY3QgcmVwcmVzZW50cy5cblx0XHRcdCAqL1xuXHRcdFx0YXN5bmMgZGVsZXRlKCk6IFByb21pc2U8RXJyb3IgfCB2b2lkPlxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoYXdhaXQgdGhpcy5pc0RpcmVjdG9yeSgpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlPEVycm9yIHwgdm9pZD4oYXN5bmMgcmVzb2x2ZSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuZnMucmVtb3ZlRGlyKHRoaXMucGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdGF3YWl0IHRoaXMuZnMucmVtb3ZlRmlsZSh0aGlzLnBhdGgpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdG1vdmUodGFyZ2V0OiBGaWxhKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gbnVsbCBhcyBhbnk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0YXN5bmMgY29weSh0YXJnZXQ6IEZpbGEpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChhd2FpdCB0YXJnZXQuaXNEaXJlY3RvcnkoKSlcblx0XHRcdFx0XHR0aHJvdyBcIkNvcHlpbmcgZGlyZWN0b3JpZXMgaXMgbm90IGltcGxlbWVudGVkLlwiO1xuXHRcdFx0XHRcblx0XHRcdFx0YXdhaXQgdGhpcy5mcy5jb3B5RmlsZSh0aGlzLnBhdGgsIHRhcmdldC5wYXRoKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRwcm90ZWN0ZWQgd2F0Y2hQcm90ZWN0ZWQoXG5cdFx0XHRcdHJlY3Vyc2l2ZTogYm9vbGVhbixcblx0XHRcdFx0Y2FsbGJhY2tGbjogKGV2ZW50OiBGaWxhLkV2ZW50LCBmaWxhOiBGaWxhKSA9PiB2b2lkKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdW46IEZ1bmN0aW9uIHwgbnVsbCA9IG51bGw7XG5cdFx0XHRcdFxuXHRcdFx0XHQoYXN5bmMgKCkgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdHVuID0gYXdhaXQgd2F0Y2hJbnRlcm5hbCh0aGlzLnBhdGgsIHt9LCBhc3luYyBldiA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmICghdW4pXG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0Y29uc3QgcGF5bG9hZCA9IGV2LnBheWxvYWQucGF5bG9hZDtcblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgcGF5bG9hZCAhPT0gXCJzdHJpbmdcIilcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRjb25zdCBmaWxhID0gRmlsYS5uZXcoZXYucGF5bG9hZC5wYXlsb2FkKTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0aWYgKGV2LnR5cGUgPT09IFwiTm90aWNlV3JpdGVcIiB8fCBldi50eXBlID09PSBcIldyaXRlXCIpXG5cdFx0XHRcdFx0XHRcdGNhbGxiYWNrRm4oRmlsYS5FdmVudC5tb2RpZnksIGZpbGEpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRlbHNlIGlmIChldi50eXBlID09PSBcIk5vdGljZVJlbW92ZVwiIHx8IGV2LnR5cGUgPT09IFwiUmVtb3ZlXCIpXG5cdFx0XHRcdFx0XHRcdGNhbGxiYWNrRm4oRmlsYS5FdmVudC5kZWxldGUsIGZpbGEpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRlbHNlIGlmIChldi50eXBlID09PSBcIkNyZWF0ZVwiIHx8IGV2LnR5cGUgPT09IFwiUmVuYW1lXCIpXG5cdFx0XHRcdFx0XHRcdGNhbGxiYWNrRm4oRmlsYS5FdmVudC5tb2RpZnksIGZpbGEpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KSgpO1xuXHRcdFx0XHRcblx0XHRcdFx0cmV0dXJuICgpID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBUaGlzIGlzIGhhY2t5Li4uIHRoZSBpbnRlcmZhY2UgZXhwZWN0cyBhIGZ1bmN0aW9uIHRvIGJlXG5cdFx0XHRcdFx0Ly8gcmV0dXJuZWQgcmF0aGVyIHRoYW4gYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gb25lLFxuXHRcdFx0XHRcdC8vIHNvIHRoaXMgd2FpdHMgMTAwbXMgdG8gY2FsbCB0aGUgdW4oKSBmdW5jdGlvbiBpZiB0aGlzIHVud2F0Y2hcblx0XHRcdFx0XHQvLyBmdW5jdGlvbiBpcyBpbnZva2VkIGltbWVkaWF0ZWx5IGFmdGVyIGNhbGxpbmcgd2F0Y2goKS5cblx0XHRcdFx0XHRpZiAodW4pXG5cdFx0XHRcdFx0XHR1bigpO1xuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQoKCkgPT4gdW4/LigpLCAxMDApO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIHJlbmFtZShuZXdOYW1lOiBzdHJpbmcpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIE5vdGUgdGhhdCB0aGUgXCJyZW5hbWVGaWxlXCIgbWV0aG9kIGFjdHVhbGx5IHdvcmtzIG9uIGRpcmVjdG9yaWVzXG5cdFx0XHRcdHJldHVybiB0aGlzLmZzLnJlbmFtZUZpbGUodGhpcy5wYXRoLCB0aGlzLnVwKCkuZG93bihuZXdOYW1lKS5wYXRoKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyBleGlzdHMoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5mcy5leGlzdHModGhpcy5wYXRoKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyBnZXRTaXplKClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIChhd2FpdCB0aGlzLmdldE1ldGEoKSkuc2l6ZTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyBnZXRNb2RpZmllZFRpY2tzKClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIChhd2FpdCB0aGlzLmdldE1ldGEoKSkubW9kaWZpZWRBdDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyBnZXRDcmVhdGVkVGlja3MoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gKGF3YWl0IHRoaXMuZ2V0TWV0YSgpKS5jcmVhdGVkQXQ7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0YXN5bmMgZ2V0QWNjZXNzZWRUaWNrcygpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiAoYXdhaXQgdGhpcy5nZXRNZXRhKCkpLmFjY2Vzc2VkQXQ7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0YXN5bmMgaXNEaXJlY3RvcnkoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gKGF3YWl0IHRoaXMuZ2V0TWV0YSgpKS5pc0Rpcjtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRwcml2YXRlIGFzeW5jIGdldE1ldGEoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fbWV0YSB8fCAodGhpcy5fbWV0YSA9IGF3YWl0IGdldE1ldGFkYXRhKHRoaXMucGF0aCkpO1xuXHRcdFx0fVxuXHRcdFx0cHJpdmF0ZSBfbWV0YTogTWV0YWRhdGEgfCBudWxsID0gbnVsbDtcblx0XHR9XG5cdH1cblx0XG5cdC8vQHRzLWlnbm9yZVxuXHRpZiAoIShcIl9fVEFVUklfX1wiIGluIGdsb2JhbFRoaXMpKSByZXR1cm47XG5cdFxuXHRjb25zdCB0ID0gKGdsb2JhbFRoaXMgYXMgYW55KS5fX1RBVVJJX187XG5cdGNvbnN0IHRhdXJpOiB0eXBlb2YgaW1wb3J0KFwiQHRhdXJpLWFwcHMvYXBpXCIpLnRhdXJpID0gdC50YXVyaTtcblx0Y29uc3Qgd2luZDogdHlwZW9mIGltcG9ydChcIkB0YXVyaS1hcHBzL2FwaVwiKS53aW5kb3cgPSB0LndpbmRvdztcblx0XG5cdC8qKiBAaW50ZXJuYWwgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVud2F0Y2goaWQ6IGFueSlcblx0e1xuXHRcdGF3YWl0IHRhdXJpLmludm9rZSgncGx1Z2luOmZzLXdhdGNofHVud2F0Y2gnLCB7IGlkIH0pO1xuXHR9XG5cdFxuXHQvKiogQGludGVybmFsICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiB3YXRjaEludGVybmFsKFxuXHRcdHBhdGhzOiBzdHJpbmcgfCBzdHJpbmdbXSxcblx0XHRvcHRpb25zOiBEZWJvdW5jZWRXYXRjaE9wdGlvbnMsXG5cdFx0Y2FsbGJhY2tGbjogKGV2ZW50OiBUYXVyaVdhdGNoRXZlbnQpID0+IHZvaWQpOiBQcm9taXNlPCgpID0+IFByb21pc2U8dm9pZD4+XG5cdHtcblx0XHRjb25zdCBvcHRzID0ge1xuXHRcdFx0cmVjdXJzaXZlOiBmYWxzZSxcblx0XHRcdGRlbGF5TXM6IDIwMDAsXG5cdFx0XHQuLi5vcHRpb25zLFxuXHRcdH07XG5cdFx0XG5cdFx0bGV0IHdhdGNoUGF0aHM7XG5cdFx0aWYgKHR5cGVvZiBwYXRocyA9PT0gXCJzdHJpbmdcIilcblx0XHRcdHdhdGNoUGF0aHMgPSBbcGF0aHNdO1xuXHRcdGVsc2Vcblx0XHRcdHdhdGNoUGF0aHMgPSBwYXRocztcblx0XHRcblx0XHRjb25zdCBpZCA9IHdpbmRvdy5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50MzJBcnJheSgxKSlbMF07XG5cdFx0YXdhaXQgdGF1cmkuaW52b2tlKFwicGx1Z2luOmZzLXdhdGNofHdhdGNoXCIsIHtcblx0XHRcdGlkLFxuXHRcdFx0cGF0aHM6IHdhdGNoUGF0aHMsXG5cdFx0XHRvcHRpb25zOiBvcHRzLFxuXHRcdH0pO1xuXHRcdFxuXHRcdGNvbnN0IHVubGlzdGVuID0gYXdhaXQgd2luZC5hcHBXaW5kb3cubGlzdGVuKFxuXHRcdFx0YHdhdGNoZXI6Ly9yYXctZXZlbnQvJHtpZH1gLFxuXHRcdFx0ZXZlbnQgPT5cblx0XHR7XG5cdFx0XHRjYWxsYmFja0ZuKGV2ZW50IGFzIFRhdXJpV2F0Y2hFdmVudCk7XG5cdFx0fSk7XG5cdFx0XG5cdFx0cmV0dXJuIGFzeW5jICgpID0+XG5cdFx0e1xuXHRcdFx0YXdhaXQgdW53YXRjaChpZCk7XG5cdFx0XHR1bmxpc3RlbigpO1xuXHRcdH07XG5cdH1cblx0XG5cdC8qKiBAaW50ZXJuYWwgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdhdGNoSW1tZWRpYXRlKFxuXHRcdHBhdGhzOiBzdHJpbmcgfCBzdHJpbmdbXSxcblx0XHRvcHRpb25zOiBEZWJvdW5jZWRXYXRjaE9wdGlvbnMsXG5cdFx0Y2FsbGJhY2tGbjogKGV2ZW50OiBUYXVyaVdhdGNoRXZlbnQpID0+IHZvaWQpOiBQcm9taXNlPCgpID0+IFByb21pc2U8dm9pZD4+XG5cdHtcblx0XHRjb25zdCBvcHRzID0ge1xuXHRcdFx0cmVjdXJzaXZlOiBmYWxzZSxcblx0XHRcdC4uLm9wdGlvbnMsXG5cdFx0XHRkZWxheU1zOiBudWxsXG5cdFx0fTtcblx0XHRcblx0XHRjb25zdCB3YXRjaFBhdGhzID0gdHlwZW9mIHBhdGhzID09PSBcInN0cmluZ1wiID8gW3BhdGhzXSA6IHBhdGhzO1xuXHRcdGNvbnN0IGlkID0gd2luZG93LmNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQzMkFycmF5KDEpKVswXTtcblx0XHRcblx0XHRhd2FpdCB0YXVyaS5pbnZva2UoXCJwbHVnaW46ZnMtd2F0Y2h8d2F0Y2hcIiwge1xuXHRcdFx0aWQsXG5cdFx0XHRwYXRoczogd2F0Y2hQYXRocyxcblx0XHRcdG9wdGlvbnM6IG9wdHMsXG5cdFx0fSk7XG5cdFx0XG5cdFx0Y29uc3QgdW5saXN0ZW4gPSBhd2FpdCB3aW5kLmFwcFdpbmRvdy5saXN0ZW4oXG5cdFx0XHRgd2F0Y2hlcjovL3Jhdy1ldmVudC8ke2lkfWAsXG5cdFx0XHRldmVudCA9PlxuXHRcdHtcblx0XHRcdGNhbGxiYWNrRm4oZXZlbnQgYXMgVGF1cmlXYXRjaEV2ZW50KTtcblx0XHR9KTtcblx0XHRcblx0XHRyZXR1cm4gYXN5bmMgKCkgPT5cblx0XHR7XG5cdFx0XHRhd2FpdCB1bndhdGNoKGlkKTtcblx0XHRcdHVubGlzdGVuKCk7XG5cdFx0fTtcblx0fVxuXHRcblx0LyoqICovXG5cdGludGVyZmFjZSBUYXVyaVdhdGNoRXZlbnRcblx0e1xuXHRcdC8qKiBFeGFtcGxlOiBcIndhdGNoZXI6Ly9kZWJvdW5jZWQtZXZlbnQvMjkwMzAzMlwiICovXG5cdFx0cmVhZG9ubHkgZXZlbnQ6IHN0cmluZztcblx0XHQvKiogRXhhbXBsZTogXCJtYWluXCIgKi9cblx0XHRyZWFkb25seSB3aW5kb3dMYWJlbDogc3RyaW5nO1xuXHRcdC8qKiBFeGFtcGxlOiAvVXNlcnMvdXNlci9MaWJyYXJ5L0FwcGxpY2F0aW9uIFN1cHBvcnQvY29tLmFwcC9maWxlbmFtZS50eHQgKi9cblx0XHRyZWFkb25seSBwYXlsb2FkOiB7IHBheWxvYWQ6IHN0cmluZzsgfTtcblx0XHQvKiogKi9cblx0XHRyZWFkb25seSB0eXBlOiBcblx0XHRcdFwiTm90aWNlV3JpdGVcIiB8XG5cdFx0XHRcIk5vdGljZVJlbW92ZVwiIHxcblx0XHRcdFwiQ3JlYXRlXCIgfFxuXHRcdFx0XCJXcml0ZVwiIHxcblx0XHRcdFwiQ2htb2RcIiB8XG5cdFx0XHRcIlJlbW92ZVwiIHxcblx0XHRcdFwiUmVuYW1lXCIgfFxuXHRcdFx0XCJSZXNjYW5cIiB8XG5cdFx0XHRcIkVycm9yXCI7XG5cdFx0XG5cdFx0LyoqICovXG5cdFx0cmVhZG9ubHkgaWQ6IG51bWJlcjtcblx0fVxuXHRcblx0LyoqIEBpbnRlcm5hbCAqL1xuXHRpbnRlcmZhY2UgV2F0Y2hPcHRpb25zXG5cdHtcblx0XHRyZWN1cnNpdmU/OiBib29sZWFuO1xuXHR9XG5cdFxuXHQvKiogQGludGVybmFsICovXG5cdGludGVyZmFjZSBEZWJvdW5jZWRXYXRjaE9wdGlvbnMgZXh0ZW5kcyBXYXRjaE9wdGlvbnNcblx0e1xuXHRcdGRlbGF5TXM/OiBudW1iZXI7XG5cdH1cblx0XG5cdC8qKiBAaW50ZXJuYWwgKi9cblx0ZnVuY3Rpb24gZ2V0TWV0YWRhdGEocGF0aDogc3RyaW5nKTogUHJvbWlzZTxNZXRhZGF0YT5cblx0e1xuXHRcdHJldHVybiB0YXVyaS5pbnZva2UoXCJwbHVnaW46ZnMtZXh0cmF8bWV0YWRhdGFcIiwgeyBwYXRoIH0pO1xuXHR9XG5cdFxuXHQvKipcblx0ICogTWV0YWRhdGEgaW5mb3JtYXRpb24gYWJvdXQgYSBmaWxlLlxuXHQgKiBUaGlzIHN0cnVjdHVyZSBpcyByZXR1cm5lZCBmcm9tIHRoZSBgbWV0YWRhdGFgIGZ1bmN0aW9uIG9yIG1ldGhvZFxuXHQgKiBhbmQgcmVwcmVzZW50cyBrbm93biBtZXRhZGF0YSBhYm91dCBhIGZpbGUgc3VjaCBhcyBpdHMgcGVybWlzc2lvbnMsXG5cdCAqIHNpemUsIG1vZGlmaWNhdGlvbiB0aW1lcywgZXRjLlxuXHQgKi9cblx0ZXhwb3J0IGludGVyZmFjZSBNZXRhZGF0YVxuXHR7XG5cdFx0LyoqXG5cdFx0ICogVGhlIGxhc3QgYWNjZXNzIHRpbWUgb2YgdGhpcyBtZXRhZGF0YS5cblx0XHQgKi9cblx0XHRyZWFkb25seSBhY2Nlc3NlZEF0OiBudW1iZXI7XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogVGhlIGNyZWF0aW9uIHRpbWUgbGlzdGVkIGluIHRoaXMgbWV0YWRhdGEuXG5cdFx0ICovXG5cdFx0cmVhZG9ubHkgY3JlYXRlZEF0OiBudW1iZXI7XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogVGhlIGxhc3QgbW9kaWZpY2F0aW9uIHRpbWUgbGlzdGVkIGluIHRoaXMgbWV0YWRhdGEuXG5cdFx0ICovXG5cdFx0cmVhZG9ubHkgbW9kaWZpZWRBdDogbnVtYmVyO1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIGB0cnVlYCBpZiB0aGlzIG1ldGFkYXRhIGlzIGZvciBhIGRpcmVjdG9yeS5cblx0XHQgKi9cblx0XHRyZWFkb25seSBpc0RpcjogYm9vbGVhbjtcblx0XHRcblx0XHQvKipcblx0XHQgKiBgdHJ1ZWAgaWYgdGhpcyBtZXRhZGF0YSBpcyBmb3IgYSByZWd1bGFyIGZpbGUuXG5cdFx0ICovXG5cdFx0cmVhZG9ubHkgaXNGaWxlOiBib29sZWFuO1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIGB0cnVlYCBpZiB0aGlzIG1ldGFkYXRhIGlzIGZvciBhIHN5bWJvbGljIGxpbmsuXG5cdFx0ICovXG5cdFx0cmVhZG9ubHkgaXNTeW1saW5rOiBib29sZWFuO1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFRoZSBzaXplIG9mIHRoZSBmaWxlLCBpbiBieXRlcywgdGhpcyBtZXRhZGF0YSBpcyBmb3IuXG5cdFx0ICovXG5cdFx0cmVhZG9ubHkgc2l6ZTogbnVtYmVyO1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFRoZSBwZXJtaXNzaW9ucyBvZiB0aGUgZmlsZSB0aGlzIG1ldGFkYXRhIGlzIGZvci5cblx0XHQgKi9cblx0XHRyZWFkb25seSBwZXJtaXNzaW9uczogUGVybWlzc2lvbnM7XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogVGhlIElEIG9mIHRoZSBkZXZpY2UgY29udGFpbmluZyB0aGUgZmlsZS4gT25seSBhdmFpbGFibGUgb24gVW5peC5cblx0XHQgKi9cblx0XHRyZWFkb25seSBkZXY/OiBudW1iZXI7XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogVGhlIGlub2RlIG51bWJlci4gT25seSBhdmFpbGFibGUgb24gVW5peC5cblx0XHQgKi9cblx0XHRyZWFkb25seSBpbm8/OiBudW1iZXI7XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogVGhlIHJpZ2h0cyBhcHBsaWVkIHRvIHRoaXMgZmlsZS4gT25seSBhdmFpbGFibGUgb24gVW5peC5cblx0XHQgKi9cblx0XHRyZWFkb25seSBtb2RlPzogbnVtYmVyO1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFRoZSBudW1iZXIgb2YgaGFyZCBsaW5rcyBwb2ludGluZyB0byB0aGlzIGZpbGUuIE9ubHkgYXZhaWxhYmxlIG9uIFVuaXguXG5cdFx0ICovXG5cdFx0cmVhZG9ubHkgbmxpbms/OiBudW1iZXI7XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogVGhlIHVzZXIgSUQgb2YgdGhlIG93bmVyIG9mIHRoaXMgZmlsZS4gT25seSBhdmFpbGFibGUgb24gVW5peC5cblx0XHQgKi9cblx0XHRyZWFkb25seSB1aWQ/OiBudW1iZXI7XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogVGhlIGdyb3VwIElEIG9mIHRoZSBvd25lciBvZiB0aGlzIGZpbGUuIE9ubHkgYXZhaWxhYmxlIG9uIFVuaXguXG5cdFx0ICovXG5cdFx0cmVhZG9ubHkgZ2lkPzogbnVtYmVyO1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFRoZSBkZXZpY2UgSUQgb2YgdGhpcyBmaWxlIChpZiBpdCBpcyBhIHNwZWNpYWwgb25lKS4gT25seSBhdmFpbGFibGUgb24gVW5peC5cblx0XHQgKi9cblx0XHRyZWFkb25seSByZGV2PzogbnVtYmVyO1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFRoZSBibG9jayBzaXplIGZvciBmaWxlc3lzdGVtIEkvTy4gT25seSBhdmFpbGFibGUgb24gVW5peC5cblx0XHQgKi9cblx0XHRyZWFkb25seSBibGtzaXplPzogbnVtYmVyO1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIFRoZSBudW1iZXIgb2YgYmxvY2tzIGFsbG9jYXRlZCB0byB0aGUgZmlsZSwgaW4gNTEyLWJ5dGUgdW5pdHMuIE9ubHkgYXZhaWxhYmxlIG9uIFVuaXguXG5cdFx0ICovXG5cdFx0cmVhZG9ubHkgYmxvY2tzPzogbnVtYmVyO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGludGVyZmFjZSBQZXJtaXNzaW9uc1xuXHR7XG5cdFx0LyoqXG5cdFx0ICogYHRydWVgIGlmIHRoZXNlIHBlcm1pc3Npb25zIGRlc2NyaWJlIGEgcmVhZG9ubHkgKHVud3JpdGFibGUpIGZpbGUuXG5cdFx0ICovXG5cdFx0cmVhZG9ubHk6IGJvb2xlYW47XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogVGhlIHVuZGVybHlpbmcgcmF3IGBzdF9tb2RlYCBiaXRzIHRoYXQgY29udGFpbiB0aGUgc3RhbmRhcmQgVW5peFxuXHRcdCAqIHBlcm1pc3Npb25zIGZvciB0aGlzIGZpbGUuXG5cdFx0ICovXG5cdFx0bW9kZT86IG51bWJlcjtcblx0fVxuXHRcblx0ZGVjbGFyZSBjb25zdCBtb2R1bGU6IGFueTtcblx0dHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBPYmplY3QuYXNzaWduKG1vZHVsZS5leHBvcnRzLCB7IEZpbGFUYXVyaSB9KTtcbn0iXX0=