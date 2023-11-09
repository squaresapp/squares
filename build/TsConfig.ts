
namespace ScrollApp.Build
{
	/** */
	export class TsConfig
	{
		/** */
		static async read(tsconfigFile: Fila)
		{
			const tsconfigText = await tsconfigFile.readText();
			const tsconfigJson = Util.tryParseJson(tsconfigText);
			if (!tsconfigJson)
				throw new Error("There is an error in file at: " + tsconfigFile.path);
			
			return new TsConfig(tsconfigFile, tsconfigJson);
		}
		
		/** */
		private constructor(
			private readonly tsconfigFile: Fila,
			private readonly tsconfigJson: any)
		{
			this.exclude = tsconfigJson.exclude || [];
			
			if (tsconfigJson.compilerOptions)
			{
				tsconfigJson.compilerOptions.inlineSourceMap = false;
				tsconfigJson.compilerOptions.inlineSources = false;
			}
		}
		
		private isModified = false;
		
		/** */
		get outFile()
		{
			return this.tsconfigJson.compilerOptions?.outFile || "";
		}
		set outFile(path: string)
		{
			if (!this.tsconfigJson.compilerOptions)
				this.tsconfigJson.compilerOptions = {};
			
			this.tsconfigJson.compilerOptions.outFile = path;
			this.isModified = true;
		}
		
		readonly exclude: string[];
		
		/** */
		get references(): readonly IReference[]
		{
			return this.tsconfigJson.references || [];
		}
		
		/** */
		async compile()
		{
			let file = this.tsconfigFile;
			
			if (this.isModified)
			{
				const tsconfigTempFile = this.tsconfigFile.up().down("+tsconfig.temp.json");
				await tsconfigTempFile.writeText(JSON.stringify(this.tsconfigJson, null, "\t"));
				file = tsconfigTempFile;
			}
			
			try
			{
				await Build.executeInTerminal("tsc", ["-p", file.path]);
			}
			catch (e) { }
			
			if (this.isModified)
				await file.delete();
		}
	}
	
	/** */
	interface IReference
	{
		path: string;
		if?: string;
	}
}
