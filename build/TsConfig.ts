
namespace Squares.Build
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
			tsconfigJson.compilerOptions ||= {};
		}
		
		/** */
		get compilerOptions(): ICompilerOptions
		{
			this.isModified = true;
			return this.tsconfigJson.compilerOptions;
		}
		
		private isModified = false;
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
	
	/** */
	interface ICompilerOptions
	{
		outFile: string;
		composite: boolean;
		sourceMap: boolean;
		inlineSourceMap: boolean;
		inlineSources: boolean;
		declaration: boolean;
		declarationMap: boolean;
		incremental: boolean;
	}
}
