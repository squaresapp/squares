
namespace ScrollApp.Build
{
	/** */
	export function emitIndexHtmlDebug()
	{
		return emitIndexHtml("tsconfig.json");
	}
	
	/** */
	export function emitIndexHtmlRelease()
	{
		return emitIndexHtml("tsconfig.release.json");
	}
	
	/** */
	async function emitIndexHtml(tsConfigName: string)
	{
		FilaNode.use();
		
		const indexHtml = [
			`<!DOCTYPE html>`,
			`<meta charset="UTF-8">`,
			`<meta name="apple-mobile-web-app-capable" content="yes">`,
			`<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`,
			`<meta name="apple-mobile-web-app-title" content="Scroll">`,
			`<meta name="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover, width=device-width">`,
			`<link href="data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABmJLR0T///////8JWPfcAAAACXBIWXMAAABIAAAASABGyWs+AAAAF0lEQVRIx2NgGAWjYBSMglEwCkbBSAcACBAAAeaR9cIAAAAASUVORK5CYII=" rel="icon" type="image/x-icon">`,
		];
		
		const buildFolder = Fila.new(__dirname);
		const baseFolder = buildFolder.up();
		const tsConfigText = await baseFolder.down("tsconfig.json").readText();
		const tsConfigJson = Util.tryParseJson<any>(tsConfigText);
		const references = Array.isArray(tsConfigJson["references"]) ?
			tsConfigJson["references"] : [];
		
		const getOutFile = (configJson: any) =>
			configJson?.["compilerOptions"]?.["outFile"] || "";
		
		for (const reference of references)
		{
			const path = reference.path;
			if (!path)
				continue;
			
			const referenceConfigFolder = baseFolder.down(path);
			const referenceConfigFila = referenceConfigFolder.down(tsConfigName);
			const referenceConfigText = await referenceConfigFila.readText();
			const referenceConfigJson = Util.tryParseJson(referenceConfigText);
			const outFile = getOutFile(referenceConfigJson);
			if (outFile)
			{
				const buildFile = referenceConfigFolder.down(outFile);
				await buildFile.copy(buildFolder.down(buildFile.name));
				indexHtml.push(`<script src="${buildFile.name}"></script>`);
			}
		}
		
		const outFileName = Fila.new(getOutFile(tsConfigJson)).name;
		indexHtml.push(`<script src="${outFileName}"></script>`);
		indexHtml.push(`<script>setTimeout(() => ScrollApp.startup());</script>`);
		await buildFolder.down("index.html").writeText(indexHtml.join("\n"));
		
		console.log("Done - " + Moduless.getRunningFunctionName());
	}
	
	/** */
	export async function buildWebDemo()
	{
		await buildTarget("web", { WEB: true });
	}
	
	/** */
	export async function buildIOS()
	{
		await buildTarget("ios", { IOS: true, CAPACITOR: true });
	}
	
	/** */
	export async function buildAndroid()
	{
		await buildTarget("android", { ANDROID: true, CAPACITOR: true });
	}
	
	/** */
	export async function buildMac()
	{
		await buildTarget("mac", { ANDROID: true, CAPACITOR: true });
	}
	
	/** */
	export async function buildWindows()
	{
		
	}
	
	/** */
	export async function buildLinux()
	{
		
	}
	
	/** */
	async function buildTarget(target: string, constantsOverrides: Partial<TConstants>)
	{
		FilaNode.use();
		
		const constants: TConstants = Object.assign(getConstants(), constantsOverrides);
		const root = Fila.new(__dirname).up();
		const buildFolder = root.down("+build-" + target.toLowerCase());
		const tsconfigFila = root.down("tsconfig.json");
		
		const tsconfig = await TsConfig.read(tsconfigFila);
		tsconfig.exclude.push("build/**/*.ts", "**/*.cover.ts");
		tsconfig.outFile = buildFolder.name + "/scroll.js";
		await tsconfig.compile();
		
		await Build.minify(root.down(tsconfig.outFile), constants);
		const indexHtml = new IndexHtml();
		
		for (const reference of tsconfig.references)
		{
			if (reference.if)
			{
				const ifArray = reference.if?.split(",").map(s => s.trim()) || [];
				if (ifArray.length > 0 && !ifArray.some(f => ifArray.includes(target)))
					continue;
			}
			
			const referenceFolder = root.down(reference.path);
			
			let referenceConfigFile = referenceFolder.down("tsconfig.release.json");
			if (!await referenceConfigFile.exists())
				referenceConfigFile = referenceFolder.down("tsconfig.json");
			
			const refTsConfig = await TsConfig.read(referenceConfigFile);
			await refTsConfig.compile();
			const referenceOutFile = referenceFolder.down(refTsConfig.outFile);
			await referenceOutFile.copy(buildFolder.down(referenceOutFile.name));
			indexHtml.addScript(referenceOutFile.name);
		}
		
		indexHtml.addScript(buildFolder.down(tsconfig.outFile).name);
		indexHtml.addScript(() => ScrollApp.startup());
		indexHtml.preventFavicon();
		await buildFolder.down("index.html").writeText(indexHtml.toString());
		
		// Write the git ignore file
		const gitIgnore = [
			".DS_Store",
			"*.tsbuildinfo",
			"*.d.ts",
			"*.d.ts.map",
		].join("\n");
		
		await buildFolder.down(".gitignore").writeText(gitIgnore);
		
		const cwd = buildFolder.path;
		await Build.executeInTerminal("git", ["add", "."], cwd);
		await Build.executeInTerminal("git", ["commit", "-m", `"${new Date().toString()}"`], cwd);
		//await Build.executeInTerminal("git", ["push", "-u", "origin", "master"], cwd);
	}
	
	/**
	 * @internal
	 */
	export function getConstants()
	{
		return {
			DEBUG: false,
			ELECTRON: false,
			TAURI: false,
			IOS: false,
			ANDROID: false,
			WEB: false,
			CAPACITOR: false,
			SIMULATOR: false,
		};
	}
	
	type TConstants = ReturnType<typeof Build["getConstants"]>
}
