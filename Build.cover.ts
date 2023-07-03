
namespace Rail.Build
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
		const indexHtml = [
			`<!DOCTYPE html>`,
			`<meta charset="UTF-8">`,
			`<meta name="apple-mobile-web-app-capable" content="yes">`,
			`<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`,
			`<meta name="apple-mobile-web-app-title" content="Rail">`,
			`<meta name="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover, width=device-width">`,
		];
		
		const buildFolder = Fila.new(__dirname);
		const baseFolder = buildFolder.up();
		const tsConfigText = await baseFolder.down("tsconfig.json").readText();
		const tsConfigJson = parseJson(tsConfigText);
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
			const referenceConfigJson = parseJson(referenceConfigText);
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
		indexHtml.push(`<script>setTimeout(() => Rail.startup());</script>`);
		await buildFolder.down("index.html").writeText(indexHtml.join("\n"));
		
		console.log("Done - " + Moduless.getRunningFunctionName());
	}
	
	/** */
	export async function emitApp()
	{
		
	}
	
	/** */
	export async function installApp()
	{
		
	}
	
	/** */
	function parseJson(jsonText: string): any
	{
		try
		{
			return new Function("return " + jsonText)();
		}
		catch (e)
		{
			return {};
		}
	}
}
