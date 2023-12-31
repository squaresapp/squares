
namespace Squares.Build
{
	/**
	 * Runs the specified command on the command line, and streams
	 * the output to the terminal.
	 */
	export function executeInTerminal(command: string, args: string[] = [], cwd: string = "")
	{
		return new Promise<void>(r =>
		{
			const { spawn } = require("node:child_process") as typeof import("child_process");
			const options = cwd ? { cwd } : {};
			const proc = spawn(command, args, options);
			
			const print = (data: string | Buffer) =>
			{
				command;
				
				if (data instanceof Buffer)
					console.log(data.toString("utf-8"));
				
				else if (typeof data === "string")
					console.log(data);
			}
			
			proc.stdout.on("data", print);
			proc.stderr.on("data", print);
			
			proc.on("close", () =>
			{
				console.log("Command completed: " + command);
				r();
			});
		});
	}
}
