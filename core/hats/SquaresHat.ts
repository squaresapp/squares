
namespace Squares
{
	/** */
	export abstract class AbstractSquaresHat
	{
		readonly head: HTMLElement;
		private readonly refreshButton;
		private squaresElement: SquaresJS.Squares | null = null;
		
		/** */
		constructor()
		{
			const refreshSection = raw.div(
				"refresher",
				{
					textAlign: "center",
					padding: "2em 0",
					color: "white",
					fontWeight: 700,
					fontSize: "30px",
				},
				t(Strings.refreshTitle),
				this.refreshButton = raw.div(
					{
						borderRadius: "100%",
						backgroundColor: Pal.attention,
						padding: "20px",
						width: "50px",
						height: "50px",
						margin: "1em auto 0",
						cursor: "pointer",
					},
					e => { e.innerHTML = Images.reload },
					raw.on("click", () => this.beginHandleRefresh()),
				),
			);
			
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
						})
					);
					
					this.head.append(
						this.squaresElement.head,
						refreshSection
					);
				})
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
				requestPage: handleRequestPage
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
			return new SquaresJS.Squares({
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
				requestPage: handleRequestPage
			});
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
