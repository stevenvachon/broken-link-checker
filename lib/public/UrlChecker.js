import * as Link from "../internal/Link";
import checkLink from "../internal/checkLink";
import {END_EVENT, ERROR_EVENT, ITEM_EVENT, LINK_EVENT, QUEUE_EVENT} from "../internal/events";
import {EventEmitter} from "events";
import parseOptions from "../internal/parseOptions";
import RequestQueue from "limited-request-queue";
import URLCache from "urlcache";



export default class UrlChecker extends EventEmitter
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
		.on(ITEM_EVENT, async (url, data, done) =>
		{
			try
			{
				const result = await checkLink(data.link, data.auth, this.#cache, options);

				this.emit(LINK_EVENT, result, data.customData);

				// Auto-starts next queue item, if any
				// Fires END_EVENT, if not
				done();
			}
			catch (error)
			{
				this.emit(ERROR_EVENT, error);
			}
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
		if (Link.isLink(url))
		{
			link = url;
		}
		// Documented use: `enqueue(url)`
		// or erroneous and let linkQueue sort it out
		else
		{
			link = Link.resolve(Link.create(), url);
		}

		const id = this.#linkQueue.enqueue(link.url.rebased, { auth, customData, link });

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
