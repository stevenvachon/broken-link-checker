import {COMPLETE_EVENT, END_EVENT, ERROR_EVENT, HTML_EVENT, ITEM_EVENT, JUNK_EVENT, LINK_EVENT, PAGE_EVENT, QUEUE_EVENT} from "../internal/events";
import {EventEmitter} from "events";
import HtmlChecker from "./HtmlChecker";
import parseOptions from "../internal/parseOptions";
import RequestQueue from "limited-request-queue";
import RobotDirectives from "robot-directives";
import streamHtml from "../internal/streamHtml";
import transitiveAuth from "../internal/transitiveAuth";



export default class HtmlUrlChecker extends EventEmitter
{
	#currentAuth;
	#currentCustomData;
	#currentDone;
	#currentPageUrl;
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
		.on(ITEM_EVENT, async (url, data, done) =>
		{
			this.#reset();

			this.#currentAuth = data.auth;
			this.#currentCustomData = data.customData;
			this.#currentDone = done;
			this.#currentPageUrl = url;  // TODO :: remove hash ?

			try
			{
				const {response, stream} = await streamHtml(this.#currentPageUrl, this.#currentAuth, this.__cache, this.#options);

				this.#currentResponse = response;
				this.#currentRobots = new RobotDirectives({ userAgent: this.#options.userAgent });

				this.#robotHeaders();

				// Passes robots instance so that headers are included in robot exclusion checks
				this.#htmlChecker.scan(stream, response.url, this.#currentRobots, this.#currentAuth);
			}
			catch (error)
			{
				this.#completedPage(error);
			}
		})
		.on(END_EVENT, () =>
		{
			// Clear references for garbage collection
			this.#reset();

			this.emit(END_EVENT);
		});

		this.#htmlChecker = new HtmlChecker(this.#options)
		.on(ERROR_EVENT, error => this.emit(ERROR_EVENT, error))
		.on(HTML_EVENT, (tree, robots) =>
		{
			this.emit(HTML_EVENT, tree, robots, this.#currentResponse, this.#currentPageUrl, this.#currentCustomData);
		})
		.on(QUEUE_EVENT, () => this.emit(QUEUE_EVENT))
		.on(JUNK_EVENT, result => this.emit(JUNK_EVENT, result, this.#currentCustomData))
		.on(LINK_EVENT, result => this.emit(LINK_EVENT, result, this.#currentCustomData))
		.on(COMPLETE_EVENT, () => this.#completedPage());
	}



	clearCache()
	{
		this.#htmlChecker.clearCache();
		return this;
	}



	#completedPage(error = null)
	{
		try
		{
			// TODO :: emit page error instead?
			// TODO :: include redirected url if there is one?
			this.emit(PAGE_EVENT, error, this.#currentPageUrl, this.#currentCustomData);

			// Auto-starts next queue item, if any
			// Fires END_EVENT, if not
			this.#currentDone();
		}
		catch (error)
		{
			this.emit(ERROR_EVENT, error);
		}
	}



	dequeue(id)
	{
		const success = this.#htmlUrlQueue.dequeue(id);

		this.emit(QUEUE_EVENT);

		return success;
	}



	// `auth` is undocumented and for internal use only
	enqueue(pageUrl, customData, auth)
	{
		// TODO :: this could get messy if there're many different credentials per site (if we cache based on headers)
		const transitive = transitiveAuth(pageUrl, auth);

		const id = this.#htmlUrlQueue.enqueue(transitive.url, { auth:transitive.auth, customData });

		this.emit(QUEUE_EVENT);

		return id;
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
		this.#currentPageUrl = null;
		this.#currentResponse = null;
		this.#currentRobots = null;
	}



	resume()
	{
		this.#htmlChecker.resume();
		this.#htmlUrlQueue.resume();
		return this;
	}



	#robotHeaders()
	{
		const xRobotsTag = this.#currentResponse.headers["x-robots-tag"];

		// TODO :: https://github.com/nodejs/node/issues/3591
		if (xRobotsTag != null)
		{
			this.#currentRobots.header(xRobotsTag);
		}
	}



	get __cache()
	{
		return this.#htmlChecker.__cache;
	}
}
