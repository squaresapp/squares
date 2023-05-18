
namespace Rail
{
	/** */
	export class RootHat
	{
		readonly head;
		
		/** */
		constructor()
		{
			this.head = hot.div(
				UI.noScrollBars
			);
			
			Hat.wear(this);
		}
	}
}
