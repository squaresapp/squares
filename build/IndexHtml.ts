
namespace Squares.Build
{
	/**
	 * A class for generating the index.html file used to launch the app.
	 */
	export class IndexHtml
	{
		/** */
		constructor()
		{
			this.lines = [
				`<!DOCTYPE html>`,
				`<meta charset="UTF-8">`,
				`<meta name="apple-mobile-web-app-capable" content="yes">`,
				`<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`,
				`<meta name="apple-mobile-web-app-title" content="Scroll">`,
				`<meta name="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover, width=device-width">`,
			]
		}
		
		private readonly lines;
		private readonly scriptsExternal: string[] = [];
		private readonly scriptsInternal: Function[] = [];
		
		/** */
		preventFavicon()
		{
			this._preventFavicon = true;
		}
		private _preventFavicon = false;
		
		/** */
		addScript(src: string): void;
		addScript(arrowFunction: Function): void;
		addScript(a: string | Function)
		{
			typeof a === "string" ?
				this.scriptsExternal.push(a) :
				this.scriptsInternal.push(a);
		}
		
		/** */
		toString()
		{
			const lines = this.lines.slice();
			
			if (this._preventFavicon)
			{
				lines.push(`<link href="data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABmJLR0T///////8JWPfcAAAACXBIWXMAAABIAAAASABGyWs+AAAAF0lEQVRIx2NgGAWjYBSMglEwCkbBSAcACBAAAeaR9cIAAAAASUVORK5CYII=" rel="icon" type="image/x-icon">`);
			}
			
			for (const src of this.scriptsExternal)
				lines.push(`<script src="${src}"></script>`);
			
			for (const fn of this.scriptsInternal)
			{
				const fnText = fn.toString().replace(/^\(\)\s*=>\s*/, "");
				lines.push(`<script>${fnText}</script>`);
			}
			
			return lines.join("\n");
		}
	}
}
