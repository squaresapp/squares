
declare namespace Raw
{
	interface EventMap extends HTMLElementEventMap
	{
		"squares:follow": CustomEvent<{ feeds: Squares.IFeedDetail[] }>;
		"squares:unfollow": CustomEvent<{ feedKey: number }>;
		"squares:panechanged": Event;
	}
}

namespace Squares
{
	/** */
	export type DetailType<K extends keyof Raw.EventMap> = 
		Raw.EventMap[K] extends CustomEvent<infer T> ? T : {};
	
	/**
	 * Provides a way to dispatch a bubbling CustomEvent
	 * object with type-safe .details property, using a custom
	 * .details argument. The details argument is returned,
	 * possibly after being modified by the event handlers.
	 */
	export function dispatch<K extends keyof Raw.EventMap>(
		name: K,
		detail: DetailType<K>,
		target: HTMLElement): DetailType<K>;
	/**
	 * Provides a way to dispatch a bubbling a generic Event
	 * object, which targets the specified element.
	 */
	export function dispatch<K extends keyof Raw.EventMap>(
		name: K,
		target: HTMLElement): void;
	/**
	 * Provides a way to dispatch a bubbling a generic Event
	 * object, which targets the specified element.
	 */
	export function dispatch<K extends keyof Raw.EventMap>(
		name: K,
		detail: DetailType<K>): void;
	/**
	 * Provides a way to dispatch a bubbling a generic Event
	 * object, which targets the <body> element.
	 */
	export function dispatch<K extends keyof Raw.EventMap>(name: K): void;
	/**
	 * Provides a way to dispatch a bubbling CustomEvent
	 * object with type-safe .details property.
	 */
	export function dispatch<K extends keyof Raw.EventMap>(name: K, a?: any, b?: any)
	{
		const target: HTMLElement = [a, b].find(e => Raw.is.element(e)) || document.body;
		const detail: DetailType<K> = [a, b].find(e => !!e && !Raw.is.element(e) ? e : null) || {};
		const ev = new CustomEvent<any>(name, { bubbles: true, detail });
		target.dispatchEvent(ev);
		return detail;
	}
}
