
namespace ScrollApp.Build
{
	/**
	 * Minifies the file at the JavaScript file at the specified location,
	 * by generating an adjacent file with the ".min.js" extension.
	 * Returns a reference to this newly created file.
	 */
	export async function minify(inputFile: Fila, constants: Record<string, boolean>)
	{
		if (inputFile.extension !== ".js")
			throw new Error(`File name "${inputFile}" does not end with the .js extension.`);
		
		if (!await inputFile.exists())
			throw new Error(`File "${inputFile}" does not exist.`);
		
		const terser = require("terser") as typeof import("terser");
		const zlib = require("zlib") as typeof import("zlib");
		//const minName = inputFile.name.replace(/\.js$/, ".min.js");
		//const outputFila = inputFile.up().down(minName);
		const outputFile = inputFile;
		const inputJsText = await inputFile.readText();
		
		const output = await terser.minify(inputJsText, {
			compress: {
				keep_fnames: true,
				keep_classnames: true,
				global_defs: constants
			},
		});
		
		if (!output.code)
			throw new Error("No code generated.");
		
		await outputFile.writeText(output.code);
		
		const outBuffer = zlib.deflateSync(output.code, { level: 9 });
		console.log(`Generated minified JavaScript file at "${outputFile.path}".`);
		console.log(`Size of minified file after GZip compression: ${outBuffer.length} bytes.`);
		return outputFile;
	}
}
