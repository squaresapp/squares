
namespace Squares
{
	/** */
	export abstract class AbstractSquaresHat
	{
		readonly head: HTMLElement;
		private squaresElement: SquaresJS.Squares | null = null;
		private readonly checkmarkHat;
		
		/** */
		constructor()
		{
			this.head = raw.div(
				"squares-hat",
				{
					height: "100%",
				},
				raw.on("connected", () =>
				{
					this.squaresElement = raw.get(this.createSquaresElement())(
						raw.on("squares:exit", ev =>
						{
							applyVisitedStyle(ev.detail.sourcePoster);
						}),
						raw.on("squares:scrolledgecollision", ev =>
						{
							if (ev.detail.region === "bottom")
								this.checkmarkHat.show(true);
							
							else if (ev.detail.region === "bottom-exit")
								this.checkmarkHat.show(false);
						})
					);
					
					this.head.append(this.squaresElement.head)
				}),
				
				raw.div(
					"checkmark-container",
					{
						position: "fixed",
						left: 0,
						right: 0,
						bottom: "30px",
						zIndex: 1,
						margin: "auto",
						width: "fit-content",
						height: "100px",
						minWidth: "100px",
						display: "flex",
						justifyContent: "center",
						borderRadius: "100%",
					},
					raw.css(" *", { pointerEvents: "none" }),
					raw.on("click", () => this.beginHandleRefresh(), { capture: true }),
					this.checkmarkHat = new CheckmarkHat(),
				)
			);
			
			Hat.wear(this);
		}
		
		/** */
		protected abstract createSquaresElement(): SquaresJS.Squares;
		
		/** */
		private beginHandleRefresh()
		{
			if (!this.squaresElement)
				return;
			
			this.handleRefresh(this.squaresElement);
		}
		
		/** */
		protected abstract handleRefresh(sq: SquaresJS.Squares): void;
		
		/** */
		protected async maybeFetchPoster(post: IPost | null)
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
	}
	
	/** */
	export class ScrollSquaresHat extends AbstractSquaresHat
	{
		/** */
		constructor(private readonly scroll: IScroll)
		{
			super();
		}
		
		/** */
		protected createSquaresElement()
		{
			return new SquaresJS.Squares({
				anchorPosterIndex: this.scroll.anchorIndex,
				maxPosterCount: this.scroll.length,
				viewportElement: this.head,
				requestPoster: position =>
				{
					if (position >= this.scroll.length)
						return null;
					
					return (async () =>
					{
						const maybePost = await Data.readScrollPost(this.scroll.key, position);
						return this.maybeFetchPoster(maybePost);
					})();
				},
				requestPlaceholder: () =>
				{
					return raw.div(raw.text("Loading"));
				},
				requestPage: (selectedElement: HTMLElement) =>
				{
					const pageInfo = getPageInfoFromPoster(selectedElement);
					return { sections: pageInfo.sections, path: pageInfo.path };
				}
			});
		}
		
		/** */
		protected async handleRefresh(sq: SquaresJS.Squares)
		{
			await Refresher.refreshFeeds(...this.scroll.feeds);
			const lengthSum = this.scroll.feeds.reduce((acc, val) => val.length + acc, 0);
			sq.grid.extendPosterCount(lengthSum);
		}
	}
	
	/** */
	export class FeedSquaresHat extends AbstractSquaresHat
	{
		/** */
		constructor(private feed: IFeed)
		{
			super();
		}
		
		/** */
		protected createSquaresElement()
		{
			const sq = new SquaresJS.Squares({
				anchorPosterIndex: this.feed.anchorIndex,
				maxPosterCount: this.feed.length,
				viewportElement: this.head,
				requestPoster: position =>
				{
					if (position > this.feed.length)
						return null;
					
					return (async () =>
					{
						const maybePost = await Data.readFeedPost(this.feed.key, position);
						return await this.maybeFetchPoster(maybePost);
					})();
				},
				requestPlaceholder: () =>
				{
					return raw.div(raw.text("Loading"));
				},
				requestPage: e =>
				{
					const pageInfo = getPageInfoFromPoster(e);
					const hat = new FeedMetaHat(this.feed);
					const sections = [hat.head, ...pageInfo.sections];
					return { sections, path: pageInfo.path };
				}
			});
			
			return sq;
		}
		
		/** */
		protected async handleRefresh(sq: SquaresJS.Squares)
		{
			const feedsUpdated = await Refresher.refreshFeeds(this.feed);
			if (feedsUpdated.length === 0)
				return;
			
			this.feed = feedsUpdated[0];
			sq.grid.extendPosterCount(this.feed.length);
		}
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
