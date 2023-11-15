"use strict";
var FilaNode;
(function (FilaNode_1) {
    function use() {
        class FilaNode extends Fila {
            /** */
            static _ = (() => {
                const sep = require("path").sep;
                const cwd = process.cwd();
                const tmp = require("os").tmpdir();
                Fila.setDefaults(FilaNode, sep, cwd, tmp);
            })();
            /** */
            fs = require("fs");
            /** */
            async readText() {
                return await this.fs.promises.readFile(this.path, "utf8");
            }
            /** */
            async readBinary() {
                return await this.fs.promises.readFile(this.path);
            }
            /** */
            async readDirectory() {
                const fileNames = await this.fs.promises.readdir(this.path);
                const filas = [];
                for (const fileName of fileNames)
                    if (fileName !== ".DS_Store")
                        filas.push(Fila.new(...this.components, fileName));
                return filas;
            }
            /** */
            async writeText(text, options) {
                await this.up().writeDirectory();
                if (options?.append)
                    await this.fs.promises.appendFile(this.path, text);
                else
                    await this.fs.promises.writeFile(this.path, text);
            }
            /** */
            async writeBinary(arrayBuffer) {
                await this.up().writeDirectory();
                const buffer = Buffer.from(arrayBuffer);
                await this.fs.promises.writeFile(this.path, buffer);
            }
            /** */
            async writeDirectory() {
                if (!this.fs.existsSync(this.path))
                    await this.fs.promises.mkdir(this.path, { recursive: true });
            }
            /**
             * Writes a symlink file at the location represented by the specified
             * Fila object, to the location specified by the current Fila object.
             */
            async writeSymlink(at) {
                return new Promise(r => {
                    this.fs.symlink(this.path, at.path, () => {
                        r();
                    });
                });
            }
            /**
             * Deletes the file or directory that this Fila object represents.
             */
            async delete() {
                if (await this.isDirectory()) {
                    return new Promise(resolve => {
                        this.fs.rmdir(this.path, { recursive: true }, error => {
                            resolve(error || void 0);
                        });
                    });
                }
                await this.fs.promises.unlink(this.path);
            }
            /** */
            move(target) {
                return new Promise(resolve => {
                    this.fs.rename(this.path, target.path, () => resolve());
                });
            }
            /** */
            copy(target) {
                return new Promise(async (resolve) => {
                    if (await this.isDirectory()) {
                        this.fs.cp(this.path, target.path, { recursive: true, force: true }, () => resolve());
                    }
                    else {
                        const dir = target.up();
                        if (!await dir.exists())
                            await new Promise(r => this.fs.mkdir(dir.path, { recursive: true }, r));
                        this.fs.copyFile(this.path, target.path, () => resolve());
                    }
                });
            }
            /** */
            watchProtected(recursive, callbackFn) {
                const watcher = FilaNode.chokidar.watch(this.path);
                watcher.on("ready", () => {
                    watcher.on("all", (evName, path) => {
                        if (path.endsWith("/.DS_Store"))
                            return;
                        let ev;
                        if (evName === "add")
                            ev = "create" /* Fila.Event.create */;
                        else if (evName === "change")
                            ev = "modify" /* Fila.Event.modify */;
                        else if (evName === "unlink")
                            ev = "delete" /* Fila.Event.delete */;
                        if (ev)
                            callbackFn(ev, Fila.new(path));
                    });
                });
                return () => { watcher.removeAllListeners(); };
            }
            /** */
            static get chokidar() {
                return this._chokidar || (this._chokidar = require("chokidar"));
            }
            static _chokidar;
            /** */
            rename(newName) {
                return this.fs.promises.rename(this.path, this.up().down(newName).path);
            }
            /** */
            async exists() {
                return new Promise(r => {
                    this.fs.stat(this.path, error => {
                        r(!error);
                    });
                });
            }
            /** */
            async getSize() {
                const stats = await this.getStats();
                return stats?.size || 0;
            }
            /** */
            async getModifiedTicks() {
                const stats = await this.getStats();
                return stats?.mtimeMs || 0;
            }
            /** */
            async getCreatedTicks() {
                const stats = await this.getStats();
                return stats?.birthtimeMs || 0;
            }
            /** */
            async getAccessedTicks() {
                const stats = await this.getStats();
                return stats?.atimeMs || 0;
            }
            /** */
            async isDirectory() {
                const stats = await this.getStats();
                return stats?.isDirectory() || false;
            }
            /** */
            async getStats() {
                return new Promise(r => {
                    this.fs.stat(this.path, (error, stats) => {
                        r(stats);
                    });
                });
            }
        }
    }
    FilaNode_1.use = use;
    typeof module === "object" && Object.assign(module.exports, { FilaNode });
})(FilaNode || (FilaNode = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsYS1ub2RlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vRmlsYU5vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLElBQVUsUUFBUSxDQWlQakI7QUFqUEQsV0FBVSxVQUFRO0lBRWpCLFNBQWdCLEdBQUc7UUFFbEIsTUFBTSxRQUFTLFNBQVEsSUFBSTtZQUUxQixNQUFNO1lBQ04sTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRTtnQkFFaEIsTUFBTSxHQUFHLEdBQUksT0FBTyxDQUFDLE1BQU0sQ0FBMkIsQ0FBQyxHQUFHLENBQUM7Z0JBQzNELE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDMUIsTUFBTSxHQUFHLEdBQUksT0FBTyxDQUFDLElBQUksQ0FBeUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDNUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMzQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRUwsTUFBTTtZQUNXLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUF3QixDQUFDO1lBRTNELE1BQU07WUFDTixLQUFLLENBQUMsUUFBUTtnQkFFYixPQUFPLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDM0QsQ0FBQztZQUVELE1BQU07WUFDTixLQUFLLENBQUMsVUFBVTtnQkFFZixPQUFPLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuRCxDQUFDO1lBRUQsTUFBTTtZQUNOLEtBQUssQ0FBQyxhQUFhO2dCQUVsQixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzVELE1BQU0sS0FBSyxHQUFXLEVBQUUsQ0FBQztnQkFFekIsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTO29CQUMvQixJQUFJLFFBQVEsS0FBSyxXQUFXO3dCQUMzQixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBRXJELE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUVELE1BQU07WUFDTixLQUFLLENBQUMsU0FBUyxDQUFDLElBQVksRUFBRSxPQUFnQztnQkFFN0QsTUFBTSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBRWpDLElBQUksT0FBTyxFQUFFLE1BQU07b0JBQ2xCLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7O29CQUVuRCxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3BELENBQUM7WUFFRCxNQUFNO1lBQ04sS0FBSyxDQUFDLFdBQVcsQ0FBQyxXQUF3QjtnQkFFekMsTUFBTSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ2pDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDckQsQ0FBQztZQUVELE1BQU07WUFDTixLQUFLLENBQUMsY0FBYztnQkFFbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7b0JBQ2pDLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUMvRCxDQUFDO1lBRUQ7OztlQUdHO1lBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFRO2dCQUUxQixPQUFPLElBQUksT0FBTyxDQUFPLENBQUMsQ0FBQyxFQUFFO29CQUU1QixJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO3dCQUV4QyxDQUFDLEVBQUUsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFDSixDQUFDLENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRDs7ZUFFRztZQUNILEtBQUssQ0FBQyxNQUFNO2dCQUVYLElBQUksTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQzVCO29CQUNDLE9BQU8sSUFBSSxPQUFPLENBQWUsT0FBTyxDQUFDLEVBQUU7d0JBRTFDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUU7NEJBRXJELE9BQU8sQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQzt3QkFDMUIsQ0FBQyxDQUFDLENBQUM7b0JBQ0osQ0FBQyxDQUFDLENBQUM7aUJBQ0g7Z0JBRUQsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFDLENBQUM7WUFFRCxNQUFNO1lBQ04sSUFBSSxDQUFDLE1BQVk7Z0JBRWhCLE9BQU8sSUFBSSxPQUFPLENBQU8sT0FBTyxDQUFDLEVBQUU7b0JBRWxDLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUN6RCxDQUFDLENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxNQUFNO1lBQ04sSUFBSSxDQUFDLE1BQVk7Z0JBRWhCLE9BQU8sSUFBSSxPQUFPLENBQU8sS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO29CQUV4QyxJQUFJLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUM1Qjt3QkFDQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO3FCQUN0Rjt5QkFFRDt3QkFDQyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBRXhCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxNQUFNLEVBQUU7NEJBQ3RCLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBRXpFLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO3FCQUMxRDtnQkFDRixDQUFDLENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxNQUFNO1lBQ0ksY0FBYyxDQUN2QixTQUFrQixFQUNsQixVQUF5RTtnQkFFekUsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVuRCxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7b0JBRXhCLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFO3dCQUVsQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDOzRCQUM5QixPQUFPO3dCQUVSLElBQUksRUFBMEIsQ0FBQzt3QkFFL0IsSUFBSSxNQUFNLEtBQUssS0FBSzs0QkFDbkIsRUFBRSxtQ0FBb0IsQ0FBQzs2QkFFbkIsSUFBSSxNQUFNLEtBQUssUUFBUTs0QkFDM0IsRUFBRSxtQ0FBb0IsQ0FBQzs2QkFFbkIsSUFBSSxNQUFNLEtBQUssUUFBUTs0QkFDM0IsRUFBRSxtQ0FBb0IsQ0FBQzt3QkFFeEIsSUFBSSxFQUFFOzRCQUNMLFVBQVUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNqQyxDQUFDLENBQUMsQ0FBQztnQkFDSixDQUFDLENBQUMsQ0FBQztnQkFFSCxPQUFPLEdBQUcsRUFBRSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxDQUFBLENBQUMsQ0FBQyxDQUFDO1lBQy9DLENBQUM7WUFFRCxNQUFNO1lBQ0UsTUFBTSxLQUFLLFFBQVE7Z0JBRTFCLE9BQU8sSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDakUsQ0FBQztZQUNPLE1BQU0sQ0FBQyxTQUFTLENBQTRCO1lBRXBELE1BQU07WUFDTixNQUFNLENBQUMsT0FBZTtnQkFFckIsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pFLENBQUM7WUFFRCxNQUFNO1lBQ04sS0FBSyxDQUFDLE1BQU07Z0JBRVgsT0FBTyxJQUFJLE9BQU8sQ0FBVSxDQUFDLENBQUMsRUFBRTtvQkFFL0IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRTt3QkFFL0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ1gsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDO1lBRUQsTUFBTTtZQUNOLEtBQUssQ0FBQyxPQUFPO2dCQUVaLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNwQyxPQUFPLEtBQUssRUFBRSxJQUFJLElBQUksQ0FBQyxDQUFDO1lBQ3pCLENBQUM7WUFFRCxNQUFNO1lBQ04sS0FBSyxDQUFDLGdCQUFnQjtnQkFFckIsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3BDLE9BQU8sS0FBSyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUM7WUFDNUIsQ0FBQztZQUVELE1BQU07WUFDTixLQUFLLENBQUMsZUFBZTtnQkFFcEIsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3BDLE9BQU8sS0FBSyxFQUFFLFdBQVcsSUFBSSxDQUFDLENBQUM7WUFDaEMsQ0FBQztZQUVELE1BQU07WUFDTixLQUFLLENBQUMsZ0JBQWdCO2dCQUVyQixNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDcEMsT0FBTyxLQUFLLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQztZQUM1QixDQUFDO1lBRUQsTUFBTTtZQUNOLEtBQUssQ0FBQyxXQUFXO2dCQUVoQixNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDcEMsT0FBTyxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksS0FBSyxDQUFDO1lBQ3RDLENBQUM7WUFFRCxNQUFNO1lBQ0UsS0FBSyxDQUFDLFFBQVE7Z0JBRXJCLE9BQU8sSUFBSSxPQUFPLENBQWlDLENBQUMsQ0FBQyxFQUFFO29CQUV0RCxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO3dCQUV4QyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ1YsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDOztJQUVILENBQUM7SUE1T2UsY0FBRyxNQTRPbEIsQ0FBQTtJQUVELE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQzNFLENBQUMsRUFqUFMsUUFBUSxLQUFSLFFBQVEsUUFpUGpCIiwic291cmNlc0NvbnRlbnQiOlsiXG5uYW1lc3BhY2UgRmlsYU5vZGVcbntcblx0ZXhwb3J0IGZ1bmN0aW9uIHVzZSgpXG5cdHtcblx0XHRjbGFzcyBGaWxhTm9kZSBleHRlbmRzIEZpbGFcblx0XHR7XG5cdFx0XHQvKiogKi9cblx0XHRcdHN0YXRpYyBfID0gKCgpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHNlcCA9IChyZXF1aXJlKFwicGF0aFwiKSBhcyB0eXBlb2YgaW1wb3J0KFwicGF0aFwiKSkuc2VwO1xuXHRcdFx0XHRjb25zdCBjd2QgPSBwcm9jZXNzLmN3ZCgpO1xuXHRcdFx0XHRjb25zdCB0bXAgPSAocmVxdWlyZShcIm9zXCIpIGFzIHR5cGVvZiBpbXBvcnQoXCJvc1wiKSkudG1wZGlyKCk7XG5cdFx0XHRcdEZpbGEuc2V0RGVmYXVsdHMoRmlsYU5vZGUsIHNlcCwgY3dkLCB0bXApO1xuXHRcdFx0fSkoKTtcblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRwcml2YXRlIHJlYWRvbmx5IGZzID0gcmVxdWlyZShcImZzXCIpIGFzIHR5cGVvZiBpbXBvcnQoXCJmc1wiKTtcblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyByZWFkVGV4dCgpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBhd2FpdCB0aGlzLmZzLnByb21pc2VzLnJlYWRGaWxlKHRoaXMucGF0aCwgXCJ1dGY4XCIpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIHJlYWRCaW5hcnkoKTogUHJvbWlzZTxBcnJheUJ1ZmZlcj5cblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGF3YWl0IHRoaXMuZnMucHJvbWlzZXMucmVhZEZpbGUodGhpcy5wYXRoKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyByZWFkRGlyZWN0b3J5KClcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgZmlsZU5hbWVzID0gYXdhaXQgdGhpcy5mcy5wcm9taXNlcy5yZWFkZGlyKHRoaXMucGF0aCk7XG5cdFx0XHRcdGNvbnN0IGZpbGFzOiBGaWxhW10gPSBbXTtcblx0XHRcdFx0XG5cdFx0XHRcdGZvciAoY29uc3QgZmlsZU5hbWUgb2YgZmlsZU5hbWVzKVxuXHRcdFx0XHRcdGlmIChmaWxlTmFtZSAhPT0gXCIuRFNfU3RvcmVcIilcblx0XHRcdFx0XHRcdGZpbGFzLnB1c2goRmlsYS5uZXcoLi4udGhpcy5jb21wb25lbnRzLCBmaWxlTmFtZSkpO1xuXHRcdFx0XHRcblx0XHRcdFx0cmV0dXJuIGZpbGFzO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIHdyaXRlVGV4dCh0ZXh0OiBzdHJpbmcsIG9wdGlvbnM/OiBGaWxhLklXcml0ZVRleHRPcHRpb25zKVxuXHRcdFx0e1xuXHRcdFx0XHRhd2FpdCB0aGlzLnVwKCkud3JpdGVEaXJlY3RvcnkoKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChvcHRpb25zPy5hcHBlbmQpXG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5mcy5wcm9taXNlcy5hcHBlbmRGaWxlKHRoaXMucGF0aCwgdGV4dCk7XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRhd2FpdCB0aGlzLmZzLnByb21pc2VzLndyaXRlRmlsZSh0aGlzLnBhdGgsIHRleHQpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIHdyaXRlQmluYXJ5KGFycmF5QnVmZmVyOiBBcnJheUJ1ZmZlcilcblx0XHRcdHtcblx0XHRcdFx0YXdhaXQgdGhpcy51cCgpLndyaXRlRGlyZWN0b3J5KCk7XG5cdFx0XHRcdGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGFycmF5QnVmZmVyKTtcblx0XHRcdFx0YXdhaXQgdGhpcy5mcy5wcm9taXNlcy53cml0ZUZpbGUodGhpcy5wYXRoLCBidWZmZXIpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIHdyaXRlRGlyZWN0b3J5KClcblx0XHRcdHtcblx0XHRcdFx0aWYgKCF0aGlzLmZzLmV4aXN0c1N5bmModGhpcy5wYXRoKSlcblx0XHRcdFx0XHRhd2FpdCB0aGlzLmZzLnByb21pc2VzLm1rZGlyKHRoaXMucGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKlxuXHRcdFx0ICogV3JpdGVzIGEgc3ltbGluayBmaWxlIGF0IHRoZSBsb2NhdGlvbiByZXByZXNlbnRlZCBieSB0aGUgc3BlY2lmaWVkXG5cdFx0XHQgKiBGaWxhIG9iamVjdCwgdG8gdGhlIGxvY2F0aW9uIHNwZWNpZmllZCBieSB0aGUgY3VycmVudCBGaWxhIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0YXN5bmMgd3JpdGVTeW1saW5rKGF0OiBGaWxhKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2U8dm9pZD4ociA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhpcy5mcy5zeW1saW5rKHRoaXMucGF0aCwgYXQucGF0aCwgKCkgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyKCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKipcblx0XHRcdCAqIERlbGV0ZXMgdGhlIGZpbGUgb3IgZGlyZWN0b3J5IHRoYXQgdGhpcyBGaWxhIG9iamVjdCByZXByZXNlbnRzLlxuXHRcdFx0ICovXG5cdFx0XHRhc3luYyBkZWxldGUoKTogUHJvbWlzZTxFcnJvciB8IHZvaWQ+XG5cdFx0XHR7XG5cdFx0XHRcdGlmIChhd2FpdCB0aGlzLmlzRGlyZWN0b3J5KCkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2U8RXJyb3IgfCB2b2lkPihyZXNvbHZlID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dGhpcy5mcy5ybWRpcih0aGlzLnBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0sIGVycm9yID0+XG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHJlc29sdmUoZXJyb3IgfHwgdm9pZCAwKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRhd2FpdCB0aGlzLmZzLnByb21pc2VzLnVubGluayh0aGlzLnBhdGgpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdG1vdmUodGFyZ2V0OiBGaWxhKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhpcy5mcy5yZW5hbWUodGhpcy5wYXRoLCB0YXJnZXQucGF0aCwgKCkgPT4gcmVzb2x2ZSgpKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0Y29weSh0YXJnZXQ6IEZpbGEpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPihhc3luYyByZXNvbHZlID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoYXdhaXQgdGhpcy5pc0RpcmVjdG9yeSgpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHRoaXMuZnMuY3AodGhpcy5wYXRoLCB0YXJnZXQucGF0aCwgeyByZWN1cnNpdmU6IHRydWUsIGZvcmNlOiB0cnVlIH0sICgpID0+IHJlc29sdmUoKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zdCBkaXIgPSB0YXJnZXQudXAoKTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0aWYgKCFhd2FpdCBkaXIuZXhpc3RzKCkpXG5cdFx0XHRcdFx0XHRcdGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gdGhpcy5mcy5ta2RpcihkaXIucGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSwgcikpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHR0aGlzLmZzLmNvcHlGaWxlKHRoaXMucGF0aCwgdGFyZ2V0LnBhdGgsICgpID0+IHJlc29sdmUoKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRwcm90ZWN0ZWQgd2F0Y2hQcm90ZWN0ZWQoXG5cdFx0XHRcdHJlY3Vyc2l2ZTogYm9vbGVhbixcblx0XHRcdFx0Y2FsbGJhY2tGbjogKGV2ZW50OiBGaWxhLkV2ZW50LCBmaWxhOiBGaWxhLCBzZWNvbmRhcnlGaWxhPzogRmlsYSkgPT4gdm9pZClcblx0XHRcdHtcblx0XHRcdFx0Y29uc3Qgd2F0Y2hlciA9IEZpbGFOb2RlLmNob2tpZGFyLndhdGNoKHRoaXMucGF0aCk7XG5cdFx0XHRcdFxuXHRcdFx0XHR3YXRjaGVyLm9uKFwicmVhZHlcIiwgKCkgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdHdhdGNoZXIub24oXCJhbGxcIiwgKGV2TmFtZSwgcGF0aCkgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAocGF0aC5lbmRzV2l0aChcIi8uRFNfU3RvcmVcIikpXG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0bGV0IGV2OiBGaWxhLkV2ZW50IHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRpZiAoZXZOYW1lID09PSBcImFkZFwiKVxuXHRcdFx0XHRcdFx0XHRldiA9IEZpbGEuRXZlbnQuY3JlYXRlO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRlbHNlIGlmIChldk5hbWUgPT09IFwiY2hhbmdlXCIpXG5cdFx0XHRcdFx0XHRcdGV2ID0gRmlsYS5FdmVudC5tb2RpZnk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGVsc2UgaWYgKGV2TmFtZSA9PT0gXCJ1bmxpbmtcIilcblx0XHRcdFx0XHRcdFx0ZXYgPSBGaWxhLkV2ZW50LmRlbGV0ZTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0aWYgKGV2KVxuXHRcdFx0XHRcdFx0XHRjYWxsYmFja0ZuKGV2LCBGaWxhLm5ldyhwYXRoKSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRcblx0XHRcdFx0cmV0dXJuICgpID0+IHsgd2F0Y2hlci5yZW1vdmVBbGxMaXN0ZW5lcnMoKSB9O1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdHByaXZhdGUgc3RhdGljIGdldCBjaG9raWRhcigpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9jaG9raWRhciB8fCAodGhpcy5fY2hva2lkYXIgPSByZXF1aXJlKFwiY2hva2lkYXJcIikpO1xuXHRcdFx0fVxuXHRcdFx0cHJpdmF0ZSBzdGF0aWMgX2Nob2tpZGFyOiB0eXBlb2YgaW1wb3J0KFwiY2hva2lkYXJcIik7XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0cmVuYW1lKG5ld05hbWU6IHN0cmluZylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZnMucHJvbWlzZXMucmVuYW1lKHRoaXMucGF0aCwgdGhpcy51cCgpLmRvd24obmV3TmFtZSkucGF0aCk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0YXN5bmMgZXhpc3RzKClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KHIgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRoaXMuZnMuc3RhdCh0aGlzLnBhdGgsIGVycm9yID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cighZXJyb3IpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyBnZXRTaXplKClcblx0XHRcdHtcblx0XHRcdFx0Y29uc3Qgc3RhdHMgPSBhd2FpdCB0aGlzLmdldFN0YXRzKCk7XG5cdFx0XHRcdHJldHVybiBzdGF0cz8uc2l6ZSB8fCAwO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIGdldE1vZGlmaWVkVGlja3MoKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBzdGF0cyA9IGF3YWl0IHRoaXMuZ2V0U3RhdHMoKTtcblx0XHRcdFx0cmV0dXJuIHN0YXRzPy5tdGltZU1zIHx8IDA7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8qKiAqL1xuXHRcdFx0YXN5bmMgZ2V0Q3JlYXRlZFRpY2tzKClcblx0XHRcdHtcblx0XHRcdFx0Y29uc3Qgc3RhdHMgPSBhd2FpdCB0aGlzLmdldFN0YXRzKCk7XG5cdFx0XHRcdHJldHVybiBzdGF0cz8uYmlydGh0aW1lTXMgfHwgMDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRhc3luYyBnZXRBY2Nlc3NlZFRpY2tzKClcblx0XHRcdHtcblx0XHRcdFx0Y29uc3Qgc3RhdHMgPSBhd2FpdCB0aGlzLmdldFN0YXRzKCk7XG5cdFx0XHRcdHJldHVybiBzdGF0cz8uYXRpbWVNcyB8fCAwO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiogKi9cblx0XHRcdGFzeW5jIGlzRGlyZWN0b3J5KClcblx0XHRcdHtcblx0XHRcdFx0Y29uc3Qgc3RhdHMgPSBhd2FpdCB0aGlzLmdldFN0YXRzKCk7XG5cdFx0XHRcdHJldHVybiBzdGF0cz8uaXNEaXJlY3RvcnkoKSB8fCBmYWxzZTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0LyoqICovXG5cdFx0XHRwcml2YXRlIGFzeW5jIGdldFN0YXRzKClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlPGltcG9ydChcImZzXCIpLlN0YXRzIHwgdW5kZWZpbmVkPihyID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aGlzLmZzLnN0YXQodGhpcy5wYXRoLCAoZXJyb3IsIHN0YXRzKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHIoc3RhdHMpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0XG5cdHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgT2JqZWN0LmFzc2lnbihtb2R1bGUuZXhwb3J0cywgeyBGaWxhTm9kZSB9KTtcbn0iXX0=