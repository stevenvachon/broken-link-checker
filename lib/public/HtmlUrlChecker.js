import {COMPLETE_EVENT, END_EVENT, ERROR_EVENT, HTML_EVENT, JUNK_EVENT, LINK_EVENT, PAGE_EVENT, QUEUE_EVENT} from "../internal/events";
import HtmlChecker from "./HtmlChecker";
import parseOptions from "../internal/parseOptions";
import RequestQueue, {ITEM_EVENT, END_EVENT as REQUEST_QUEUE_END_EVENT} from "limited-request-queue";
import RobotDirectives from "robot-directives";
import SafeEventEmitter from "../internal/SafeEventEmitter";
import streamHTML from "../internal/streamHTML";
import transitiveAuth from "../internal/transitiveAuth";



export default class HtmlUrlChecker extends SafeEventEmitter
{
	#currentAuth;
	#currentCustomData;
	#currentDone;
	#currentPageURL;
	#currentResponse;
	#currentRobots;
	#htmlChecker;
	#htmlUrlQueue;
	#options;



	constructor(options)
	{
		super();
		this.#reset();

		this.#options = parseOptions(options);

		this.#htmlUrlQueue = new RequestQueue(
		{
			maxSockets: 1,
			rateLimit: this.#options.rateLimit
		})
		.on(ITEM_EVENT, async (url, {auth, customData}, done) =>
		{
			this.#reset();

			this.#currentAuth = auth;
			this.#currentCustomData = customData;
			this.#currentDone = done;
			this.#currentPageURL = url;  // @todo remove hash ?

			try
			{
				const {response, stream} = await streamHTML(this.#currentPageURL, this.#currentAuth, this.__cache, this.#options);

				this.#currentResponse = response;
				this.#currentRobots = new RobotDirectives({ userAgent: this.#options.userAgent });

				this.#appendRobotHeaders();

				// Passes robots instance so that headers are included in robot exclusion checks
				// @todo does the `await` cause `completedPage` to be called twice (other's in COMPLETE_EVENT) if error occurs?
				await this.#htmlChecker.scan(stream, response.url, this.#currentRobots, this.#currentAuth);
			}
			catch (error)
			{
				this.#completedPage(error);
			}
		})
		.on(REQUEST_QUEUE_END_EVENT, () =>
		{
			// Clear references for garbage collection
			this.#reset();

			this.emit(END_EVENT);
		});

		this.#htmlChecker = new HtmlChecker(this.#options)
		.on(ERROR_EVENT, error => this.emit(ERROR_EVENT, error))
		.on(HTML_EVENT, (tree, robots) =>
		{
			this.emit(HTML_EVENT, tree, robots, this.#currentResponse, this.#currentPageURL, this.#currentCustomData);
		})
		.on(QUEUE_EVENT, () => this.emit(QUEUE_EVENT))
		.on(JUNK_EVENT, result => this.emit(JUNK_EVENT, result, this.#currentCustomData))
		.on(LINK_EVENT, result => this.emit(LINK_EVENT, result, this.#currentCustomData))
		.on(COMPLETE_EVENT, () => this.#completedPage());
	}



	/**
	 * Append any robot headers.
	 */
	#appendRobotHeaders()
	{
		const xRobotsTag = this.#currentResponse.headers["x-robots-tag"];

		// @todo https://github.com/nodejs/node/issues/3591
		if (xRobotsTag != null)
		{
			this.#currentRobots.header(xRobotsTag);
		}
	}



	clearCache()
	{
		this.#htmlChecker.clearCache();
		return this;
	}



	/**
	 * Emit PAGE_EVENT and continue the queue.
	 * @param {Error} [error]
	 */
	#completedPage(error = null)
	{
		// @todo emit page error instead?
		// @todo include redirected url if there is one?
		this.emit(PAGE_EVENT, error, this.#currentPageURL, this.#currentCustomData);

		// Auto-starts next queue item, if any
		// Emits REQUEST_QUEUE_END_EVENT, if not
		this.#currentDone();
	}



	dequeue(id)
	{
		const success = this.#htmlUrlQueue.dequeue(id);

		this.emit(QUEUE_EVENT);

		return success;
	}



	// `auth` is undocumented and for internal use only
	enqueue(pageURL, customData, auth)
	{
		// @todo this could get messy if there're many different credentials per site (if we cache based on headers)
		const transitive = transitiveAuth(pageURL, auth);

		const id = this.#htmlUrlQueue.enqueue(transitive.url, { auth:transitive.auth, customData });

		this.emit(QUEUE_EVENT);

		return id;
	}



	has(id)
	{
		return this.#htmlUrlQueue.has(id);
	}



	get isPaused()
	{
		return this.#htmlChecker.isPaused;
	}



	get numActiveLinks()
	{
		return this.#htmlChecker.numActiveLinks;
	}



	get numPages()
	{
		return this.#htmlUrlQueue.length;
	}



	get numQueuedLinks()
	{
		return this.#htmlChecker.numQueuedLinks;
	}



	pause()
	{
		this.#htmlChecker.pause();
		this.#htmlUrlQueue.pause();
		return this;
	}



	#reset()
	{
		this.#currentAuth = null;
		this.#currentCustomData = null;
		this.#currentDone = null;
		this.#currentPageURL = null;
		this.#currentResponse = null;
		this.#currentRobots = null;
	}



	resume()
	{
		this.#htmlChecker.resume();
		this.#htmlUrlQueue.resume();
		return this;
	}



	get __cache()
	{
		return this.#htmlChecker.__cache;
	}
}
