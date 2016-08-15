import checkLink from "../internal/checkLink";
import {END_EVENT, ITEM_EVENT, LINK_EVENT, QUEUE_EVENT} from "../internal/events";
import Link, {REBASED_URL} from "../internal/Link";
import parseOptions from "../internal/parseOptions";
import RequestQueue from "limited-request-queue";
import SafeEventEmitter from "../internal/SafeEventEmitter";
import URLCache from "urlcache";



export default class UrlChecker extends SafeEventEmitter
{
	#cache;
	#linkQueue;



	constructor(options)
	{
		super();

		options = parseOptions(options);

		this.#cache = new URLCache({ maxAge:options.cacheMaxAge });

		this.#linkQueue = new RequestQueue(
		{
			maxSockets:        options.maxSockets,
			maxSocketsPerHost: options.maxSocketsPerHost,
			rateLimit:         options.rateLimit
		})
		.on(ITEM_EVENT, async (url, {auth, customData, link}, done) =>
		{
			const result = await checkLink(link, auth, this.#cache, options);

			this.emit(LINK_EVENT, result, customData);

			// Auto-starts next queue item, if any
			// Emits END_EVENT, if not
			done();
		})
		.on(END_EVENT, () => this.emit(END_EVENT));
	}



	clearCache()
	{
		this.#cache.clear();
		return this;
	}



	dequeue(id)
	{
		const success = this.#linkQueue.dequeue(id);

		this.emit(QUEUE_EVENT);

		return success;
	}



	// `auth` is undocumented and for internal use only
	enqueue(url, customData, auth={})
	{
		let link;

		// Undocumented internal use: `enqueue(Link)`
		if (url instanceof Link)
		{
			link = url;
		}
		// Documented use: `enqueue(url)`
		// or erroneous and let linkQueue sort it out
		else
		{
			link = new Link().resolve(url);
		}

		const id = this.#linkQueue.enqueue(link.get(REBASED_URL), { auth, customData, link });

		this.emit(QUEUE_EVENT);

		return id;
	}



	get isPaused()
	{
		return this.#linkQueue.isPaused;
	}



	get numActiveLinks()
	{
		return this.#linkQueue.numActive;
	}



	get numQueuedLinks()
	{
		return this.#linkQueue.numQueued;
	}



	pause()
	{
		this.#linkQueue.pause();
		return this;
	}



	resume()
	{
		this.#linkQueue.resume();
		return this;
	}



	get __cache()
	{
		return this.#cache;
	}
}
