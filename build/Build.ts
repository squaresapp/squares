
namespace Squares.Build
{
	/** */
	export async function buildDemo()
	{
		const filas = await buildTarget("demo", { DEMO: true });
		
		// Write the git ignore file
		const gitIgnore = [
			".DS_Store",
			"+*",
			"*.tsbuildinfo",
			"*.d.ts",
			"*.d.ts.map",
		].join("\n");
		
		// Handle deployment to the remote git repo
		await filas.dst.down(".gitignore").writeText(gitIgnore);
		const cwd = filas.dst.path;
		await Build.executeInTerminal("git", ["init"], cwd);
		await Build.executeInTerminal("git", ["add", "."], cwd);
		
		const filaUrl = filas.root.down("+web-demo-url");
		if (!await filaUrl.exists())
			throw new Error("Please create file: " + filaUrl.path);
		
		const deployUrl = (await filaUrl.readText()).trim();
		const message = new Date().toLocaleString();
		await Build.executeInTerminal("git", ["commit", "-m", `${message}`], cwd);
		await Build.executeInTerminal("git", ["remote", "add", "origin", deployUrl], cwd);
		await Build.executeInTerminal("git", ["push", "--force", "--set-upstream", "origin", "main"], cwd);
		await Build.executeInTerminal("git", ["push", "--force"], cwd);
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
		await buildTarget("mac", { MAC: true, TAURI: true });
	}
	
	/** */
	export async function buildWindows()
	{
		await buildTarget("windows", { WINDOWS: true, TAURI: true });
	}
	
	/** */
	export async function buildLinux()
	{
		await buildTarget("linux", { LINUX: true, TAURI: true });
	}
	
	/** */
	async function buildTarget(target: string, constants: Partial<TConstants>)
	{
		FilaNode.use();
		const filaRoot = Fila.new(__dirname).up();
		const filaSrc = filaRoot.down("app");
		const filaDst = filaRoot.down("app-" + target.toLowerCase());
		
		if (await filaDst.exists())
			await filaDst.delete();
		
		await filaSrc.copy(filaDst);
		console.log("Recreated directory: " + filaDst.path);
		
		for (const fila of await filaDst.readDirectory())
			if (fila.extension === ".js")
				await Build.minify(fila, constants);
		
		return { root: filaRoot, src: filaSrc, dst: filaDst };
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
			MAC: false,
			WINDOWS: false,
			LINUX: false,
			DEMO: false,
			CAPACITOR: false,
		};
	}
	
	type TConstants = ReturnType<typeof Build["getConstants"]>
}
