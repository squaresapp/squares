
namespace Rail
{
	/**
	 * 
	 */
	export class ScrollerHat
	{
		/** */
		readonly head;
		
		/** */
		constructor()
		{
			maybeAppendDefaultCss();
			
			this.head = hot.div(
				Style.unselectable,
				{
					minHeight: "100%",
					overflowY: "auto",
				},
				hot.css("> ." + Class.poster, {
					display: "none",
					position: "absolute",
					width: "100vw",
					height: "100vh",
					overflow: "hidden",
					...Style.clickable,
				}),
				hot.on("scroll", () => this.updatePosterVisibility(true)),
				hot.on("connected", () =>
				{
					this._width = this.head.offsetWidth;
					this._height = this.head.offsetHeight;
					Resize.watch(this.head, (w, h) => [this._width, this._height] = [w, h]);
					this.tryAppendPosters(3);
				})
			);
			
			this.setSizeInner(calculateNaturalSize());
			Hat.wear(this);
		}
		
		/** */
		handleRender(fn: RenderFn)
		{
			this.renderFn = fn;
		}
		private renderFn: RenderFn = () => null;
		
		/** */
		handleSelect(fn: SelectFn)
		{
			this.selectFn = fn;
		}
		private selectFn: SelectFn = () => {};
		
		//# Size
		
		/**
		 * Gets the pixel width of the head element.
		 */
		get width()
		{
			return this._width;
		}
		private _width = 0;
		
		/**
		 * Gets the pixel height of the head element.
		 */
		get height()
		{
			return this._height;
		}
		private _height = 0;
		
		/**
		 * Gets or sets the number of posters being displayed in one dimension.
		 */
		get size()
		{
			return this._size;
		}
		set size(size: number)
		{
			this.setSizeInner(size);
		}
		
		/** */
		private setSizeInner(size: number)
		{
			size = Math.max(minSize, Math.min(size, maxSize));
			if (size === this._size)
				return;
			
			this._size = size;
			
			const cls = sizeClasses.get(size);
			if (cls)
			{
				this.head.classList.remove(...sizeClasses.values());
				this.head.classList.add(cls);
			}
			
			this.updatePosterVisibility();
		}
		
		private _size = -1;
		
		/**
		 * Gets the maximum possible size of the Omniview, 
		 * given the number of previews that are available.
		 * A value of 0 indicates that there is no size limit.
		 */
		private sizeLimit = 0;
		
		//# Posters
		
		/**
		 * Returns an array of HTMLElement objects that contain the posters
		 * that have at least a single pixel visible on the screen.
		 */
		getVisiblePosters(): HTMLElement[]
		{
			const elements: HTMLElement[] = [];
			
			for (const element of getByClass(showClass, this.head))
			{
				const rect = element.getBoundingClientRect();
				if (rect.width === 0 || rect.height === 0)
					continue;
				
				if (rect.top > this.height)
					continue;
				
				elements.push(element);
			}
			
			return elements;
		}
		
		/**
		 * Gets a reference to the poster HTMLElement that was selected for review.
		 */
		get currentPoster()
		{
			return this._currentPoster;
		}
		private set currentPoster(value: HTMLElement | null)
		{
			this._currentPoster = value;
		}
		private _currentPoster: HTMLElement | null = null;
		
		/** */
		get posterCount()
		{
			const e = this.head.lastElementChild;
			return e ? getIndex(e) : 0;
		}
		
		/** */
		private async tryAppendPosters(screenCount: number)
		{
			const pullCount = this.size * this.size * screenCount;
			const rangeStart = this.posterCount;
			const rangeEnd = rangeStart + pullCount;
			const maybePromises: ReturnType<RenderFn>[] = [];
			let canContinue = true;
			
			for (let i = rangeStart; i < rangeEnd; i++)
			{
				const result = this.renderFn(i);
				
				// If null is returned, this means that the stream has terminated.
				if (result === null)
				{
					canContinue = false;
					break;
				}
				
				maybePromises.push(result);
			}
			
			const posterCount = maybePromises.length;
			if (posterCount === 0)
				return;
			
			if (rangeStart === 0 && posterCount < this.size)
			{
				// The constrained size cannot go below 2. This means that if there
				// is only 1 preview returned, the Omniview is going to look a bit
				// awkward with a preview on the left side of the screen, and an
				// empty space on the right. If this is undesirable, the component
				// that owns the Omniview is responsible for avoiding this situation
				// by it's own means.
				this.sizeLimit = Math.max(2, posterCount);
				this.setSizeInner(this.sizeLimit);
			}
			
			const elements: HTMLElement[] = [];
			
			for (const maybePromise of maybePromises)
			{
				if (!maybePromise)
					throw "?";
				
				if (maybePromise instanceof Promise)
				{
					const shim = hot.div(
						"element-placeholder",
						getDefaultBackground());
					
					elements.push(shim);
					
					maybePromise.then(element =>
					{
						if (element === null)
							return;
						
						for (const n of shim.getAttributeNames())
							if (n !== "style" && n !== "class")
								element.setAttribute(n, shim.getAttribute(n) || "");
						
						for (const definedProperty of Array.from(shim.style))
						{
							element.style.setProperty(
								definedProperty,
								shim.style.getPropertyValue(definedProperty));
						}
						
						hot.get(element)(
							// Classes that have been set on the shim since it was inserted
							// must be copied over to the element.
							Array.from(shim.classList), 
							hot.on("click", () => this.selectFn(element, getIndex(element)))
						);
						
						shim.replaceWith(element);
					});
				}
				else
				{
					elements.push(hot.get(maybePromise)(
						hot.on("click", () => this.selectFn(maybePromise, getIndex(maybePromise)))
					));
				}
			}
			
			for (const [i, e] of elements.entries())
			{
				setIndex(e, this.posterCount + i);
				e.classList.add(Class.poster);
			}
			
			this.head.append(...elements);
			this.updatePosterVisibility(canContinue);
		}
		
		/** */
		private updatePosterVisibility(canContinue?: boolean)
		{
			if (!this.head.isConnected)
				return;
			
			let isNearingBottom = false;
			
			if (this.posterCount > 0)
			{
				//const y = this.scrollTop - this.offsetTop;
				const y = this.head.scrollTop;
				const rowHeight = this.height / this.size;
				const rowCount = this.posterCount / this.size;
				const visibleRowStart = Math.floor(y / rowHeight);
				const visibleItemStart = visibleRowStart * this.size;
				const visibleItemEnd = visibleItemStart + this.size * (this.size + 2);
				const elementsWithTop = new Set(getByClass(Class.hasCssTop, this.head));
				const elementsVisible = new Set(getByClass(showClass, this.head));
				
				for (let i = visibleItemStart; i < visibleItemEnd; i++)
				{
					const children = this.head.children;
					const e = children.item(i);
					if (!(e instanceof HTMLElement))
					{
						if (i >= children.length)
							break;
						
						continue;
					}
					
					const mul = getIndex(e) > 0 ? 1 : -1;
					const vh = (100 * this.rowOf(e) * mul || 0).toFixed(5);
					e.style.top = `calc(${vh}vh / var(${Class.sizeVar}))`;
					e.classList.add(Class.hasCssTop, showClass);
					
					elementsWithTop.delete(e);
					elementsVisible.delete(e);
				}
				
				for (const e of elementsWithTop)
				{
					e.style.removeProperty("top");
					e.classList.remove(Class.hasCssTop);
				}
				
				for (const e of elementsVisible)
					e.classList.remove(showClass);
				
				if (y !== this.lastY)
				{
					this.lastY = y;
					isNearingBottom = (y + this.height) > (rowCount - 1) * (this.height / this.size);
				}
			}
			
			if (canContinue && isNearingBottom)
				this.tryAppendPosters(1);
		}
		
		private lastY = -1;
		
		/** */
		private rowOf(previewElement: Element)
		{
			const eIdx = getIndex(previewElement);
			const rowIndex = Math.floor(eIdx / this.size);
			return rowIndex;
		}
	}
	
	/** */
	const enum Class
	{
		poster = "poster",
		body = "body",
		hasCssTop = "has-top",
		sizeVar = "--size",
	}
	
	/** */
	let getDefaultBackground = () =>
	{
		const canvas = hot.canvas({ width: 32, height: 32 });
		const ctx = canvas.getContext("2d")!;
		const grad = ctx.createLinearGradient(0, 0, 32, 32);
		grad.addColorStop(0, "rgb(50, 50, 50)");
		grad.addColorStop(1, "rgb(0, 0, 0)");
		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, 32, 32);
		
		const cls = hot.css({
			backgroundImage: `url(${canvas.toDataURL()})`,
			backgroundSize: "100% 100%",
		});
		
		getDefaultBackground = () => cls;
	}
	
	/** */
	let maybeAppendDefaultCss = () =>
	{
		maybeAppendDefaultCss = () => {};
		
		hot.style(
			"." + Class.body, {
				position: "fixed",
				top: 0,
				right: 0,
				left: 0,
				bottom: 0,
				zIndex: 1,
				transform: "translateY(0)",
				transitionProperty: "transform",
				transitionDuration: "0.33s",
				scrollSnapType: "y mandatory",
				overflowY: "auto",
			},
			`.${Class.body}:before, .${Class.body}:after`, {
				content: `""`,
				display: "block",
				height: "1px",
				scrollSnapStop: "always",
			},
			`.${Class.body}:before`, {
				scrollSnapAlign: "start",
			},
			`.${Class.body}:after`, {
				scrollSnapAlign: "end",
			},
			`.${Class.body} > *`, {
				scrollSnapAlign: "start",
				scrollSnapStop: "always",
				height: "100%",
			},
			// Place a screen over the poster element to kill any selection
			// events. This has to be done in another element rather than 
			// just doing a pointer-events: none on the children because the
			// poster element's contents are within a shadow root.
			`.${Class.poster}:before`, {
				content: `""`,
				position: "absolute",
				top: 0,
				right: 0,
				left: 0,
				bottom: 0,
				zIndex: 1,
				userSelect: "none",
			},
		).attach();
		
		const classes = new Map<number, string>();
		for (let size = minSize; size <= maxSize; size++)
		{
			const params: (string | Hot.Style)[] = [];
			const scale = 1 / size;
			const sizeClass = "size-" + size;
			classes.set(size, sizeClass);
			
			params.push(
				"." + sizeClass, {
					[Class.sizeVar]: size
				} as any
			);
			
			for (let n = -1; ++n < size;)
			{
				params.push(
					` .${sizeClass} > DIV:nth-of-type(${size}n + ${n + 1})`, {
						left: (scale * 100 * n) + "vw",
						transform: `scale(${scale.toFixed(4)})`,
						transformOrigin: "0 0",
					}
				);
			}
			
			hot.style(...params).attach();
		}
		
		sizeClasses = classes;
	}
	
	let sizeClasses: ReadonlyMap<number, string>;
	
	/**
	 * Calculates a comfortable preview size based on the size and pixel density
	 * of the screen. (The technique used is probably quite faulty, but good enough
	 * for most scenarios).
	 */
	function calculateNaturalSize()
	{
		const dp1 = window.devicePixelRatio === 1;
		const logicalWidth = window.innerWidth / window.devicePixelRatio;
		
		if (logicalWidth <= (dp1 ? 900 : 450))
			return 2;
		
		if (logicalWidth <= (dp1 ? 1400 : 700))
			return 3;
		
		if (logicalWidth <= 1800)
			return 4;
		
		return 5;
	}
	
	const minSize = 2;
	const maxSize = 7;
	
	/** */
	function getIndex(e: Element)
	{
		return Number((Array.from(e.classList)
			.find(cls => cls.startsWith(indexPrefix)) || "")
			.slice(indexPrefix.length)) || 0;
	}
	
	/** */
	function setIndex(e: Element, index: number)
	{
		e.classList.add(indexPrefix + index);
	}
	
	const indexPrefix = "index:";
	
	/**
	 * Returns a poster HTMLElement for the given index in the stream.
	 * The function should return null to stop looking for posters at or
	 * beyond the specified index.
	 */
	export type RenderFn = (index: number) => Promise<HTMLElement> | HTMLElement | null;
	
	/** */
	export type SelectFn = (selectedElement: HTMLElement, index: number) => void | Promise<void>;
	
	//# Utilities
	
	/** */
	const showClass = hot.css({
		display: "block !",
	});
	
	/** */
	function getByClass(cls: string, element?: Element)
	{
		const col = (element || document).getElementsByClassName(cls);
		return Array.from(col) as HTMLElement[];
	}
}
