
namespace Squares
{
	/** */
	export class ScrollSquaresHat
	{
		readonly head: HTMLElement;
		
		/** */
		constructor(scroll: IScroll)
		{
			this.head = raw.div(
				"scroll-squares-hat",
				{
					height: "100%",
				}
			);
			
			const sq = new SquaresJS.Squares({
				anchorPosterIndex: scroll.anchorIndex,
				maxPosterCount: scroll.length,
				viewportElement: this.head,
				requestPoster: position =>
				{
					if (position >= scroll.length)
						return null;
					
					return (async () =>
					{
						const maybePost = await Data.readScrollPost(scroll.key, position);
						return maybeFetchPoster(maybePost);
					})();
				},
				requestPlaceholder: () =>
				{
					return raw.div(raw.text("Loading"));
				},
				requestPage: handleRequestPage
			});
			
			handleExit(sq);
			this.head.append(sq.head);
			Hat.wear(this);
		}
	}
	
	/** */
	export class FeedSquaresHat
	{
		readonly head: HTMLElement;
		
		/** */
		constructor(feed: IFeed)
		{
			this.head = raw.div(
				"feed-squares-hat",
				{
					height: "100%",
				}
			);
			
			const sq = new SquaresJS.Squares({
				anchorPosterIndex: feed.anchorIndex,
				maxPosterCount: feed.length,
				viewportElement: this.head,
				requestPoster: position =>
				{
					if (position > feed.length)
						return null;
					
					return (async () =>
					{
						const maybePost = await Data.readFeedPost(feed.key, position);
						return await maybeFetchPoster(maybePost);
					})();
				},
				requestPlaceholder: () =>
				{
					return raw.div(raw.text("Loading"));
				},
				requestPage: handleRequestPage
			});
			
			handleExit(sq);
			this.head.append(sq.head);
			Hat.wear(this);
		}
	}
	
	/** */
	async function maybeFetchPoster(post: IPost | null)
	{
		if (post === null)
			return Webfeed.getErrorPoster();
		
		const url = Util.getPostUrl(post);
		if (!url)
			return Webfeed.getErrorPoster();
		
		const page = await Webfeed.downloadPage(url);
		if (!page || !page.poster || page.sections.length === 0)
			return Webfeed.getErrorPoster();
		
		if (post.visited)
			applyVisitedStyle(page.poster);
		
		posterSections.set(page.poster, {
			path: url,
			sections: page.sections
		});
		
		return page.poster;
	}
	
	/** */
	function handleRequestPage(selectedElement: HTMLElement)
	{
		const pageInfo = getPageInfoFromPoster(selectedElement);
		return { sections: pageInfo.sections, path: pageInfo.path };
	}
	
	/** */
	function getPageInfoFromPoster(posterElement: HTMLElement)
	{
		const info = posterSections.get(posterElement);
		if (!info)
			throw new Error();
		
		return info;
	}
	
	/** */
	function handleExit(sq: SquaresJS.Squares)
	{
		raw.get(sq)(
			raw.on("squares:exit", ev =>
			{
				applyVisitedStyle(ev.detail.sourcePoster);
			})
		);
	}
	
	/** */
	function applyVisitedStyle(e: HTMLElement)
	{
		e.style.transitionDuration = "0.75s";
		e.style.transitionProperty = "filter";
		e.style.filter = "saturate(0) brightness(0.66)";
	}
	
	/** */
	interface IPageInfo
	{
		path: string;
		sections: HTMLElement[];
	}
	
	const posterSections = new WeakMap<HTMLElement, IPageInfo>();
}
