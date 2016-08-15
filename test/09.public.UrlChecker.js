import {after, before, describe, it} from "mocha";
import {END_EVENT, ERROR_EVENT, LINK_EVENT} from "../lib/internal/events";
import {expect} from "chai";
import {ExpectedError, rawOptions, startServer, stopServers} from "./helpers";
import Link, {HTTP_RESPONSE_WAS_CACHED, RESOLVED_URL} from "../lib/internal/Link";
import UrlChecker from "../lib/public/UrlChecker";



describe("PUBLIC -- UrlChecker", () =>
{
	before(() => startServer("http://blc/"));
	after(stopServers);



	it("does not require options", () =>
	{
		expect(() => new UrlChecker()).not.to.throw();
	});



	describe("enqueue()", () =>
	{
		it("accepts a valid url", () =>
		{
			const id = new UrlChecker(rawOptions()).enqueue(new URL("http://blc/"));

			expect(id).to.be.a("number");
		});



		it("rejects an invalid url", () =>
		{
			expect(() => new UrlChecker(rawOptions()).enqueue("http://blc/")).to.throw(TypeError);
		});
	});



	describe("events", () =>
	{
		it(LINK_EVENT, done =>
		{
			new UrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (link, customData, ...remainingArgs) =>
			{
				expect(remainingArgs).to.be.empty;
				expect(link).to.be.an.instanceOf(Link);
				expect(customData).to.be.undefined;
				done();
			})
			.enqueue(new URL("http://blc/"));
		});



		it(END_EVENT, done =>
		{
			new UrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(END_EVENT, (...args) =>
			{
				expect(args).to.be.empty;
				done();
			})
			.enqueue(new URL("http://blc/"));
		});



		it(ERROR_EVENT, done =>
		{
			let errorCount = 0;

			new UrlChecker(rawOptions())
			.on(ERROR_EVENT, (error, ...remainingArgs) =>
			{
				expect(remainingArgs).to.be.empty;
				expect(error).to.be.an("error");

				if (++errorCount === 2)
				{
					done();
				}
			})
			.on(LINK_EVENT, () =>
			{
				throw new ExpectedError();
			})
			.on(END_EVENT, () =>
			{
				throw new ExpectedError();
			})
			.enqueue(new URL("http://blc/"));
		});
	});



	describe("numActiveLinks", () =>
	{
		it("works", done =>
		{
			const instance = new UrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(END_EVENT, () =>
			{
				expect( instance.numActiveLinks ).to.equal(0);
				done();
			});

			instance.enqueue(new URL("http://blc/"));
			instance.enqueue(new URL("http://blc/simple/no-links.html"));

			expect( instance.numActiveLinks ).to.equal(2);
		});
	});



	describe("pause() / resume() / isPaused", () =>
	{
		it("works", done =>
		{
			let resumed = false;

			const instance = new UrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(END_EVENT, () =>
			{
				expect(resumed).to.be.true;
				done();
			});

			expect( instance.pause() ).to.equal(instance);
			expect(instance.isPaused).to.be.true;

			instance.enqueue(new URL("http://blc/"));

			// Wait longer than scan should take
			setTimeout(() =>
			{
				resumed = true;

				expect( instance.resume() ).to.equal(instance);
				expect(instance.isPaused).to.be.false;

			}, 100);
		});
	});



	// @todo test what happens when the current queue item is dequeued
	describe("dequeue() / has(), numQueuedLinks", () =>
	{
		it("accepts a valid id", done =>
		{
			const instance = new UrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(END_EVENT, () =>
			{
				expect( instance.numQueuedLinks ).to.equal(0);
				done();
			});

			// Prevent first queued item from immediately starting (and thus being auto-dequeued)
			instance.pause();

			const url = new URL("http://blc/");
			const id = instance.enqueue(url);

			expect( instance.has(id) ).to.be.true;
			expect( instance.numQueuedLinks ).to.equal(1);
			expect( instance.dequeue(id) ).to.be.true;
			expect( instance.has(id) ).to.be.false;
			expect( instance.numQueuedLinks ).to.equal(0);

			instance.enqueue(url);
			instance.resume();
		});



		it("rejects an invalid id", () =>
		{
			const instance = new UrlChecker(rawOptions());

			// Prevent first queued item from immediately starting (and thus being auto-dequeued)
			instance.pause();

			const id = instance.enqueue(new URL("http://blc/"));

			expect( instance.dequeue(id+1) ).to.be.false;
			expect( instance.numQueuedLinks ).to.equal(1);
		});
	});



	describe("caching", () =>
	{
		it("requests a unique url only once", done =>
		{
			const options = rawOptions({ cacheResponses:true });
			const results = [];

			const instance = new UrlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (link, customData) =>
			{
				switch (customData.index)
				{
					case 0:
					{
						expect(link.get(HTTP_RESPONSE_WAS_CACHED)).to.be.false;
						break;
					}
					case 1:
					{
						expect(link.get(HTTP_RESPONSE_WAS_CACHED)).to.be.true;
						break;
					}
				}

				results[customData.index] = link;
			})
			.on(END_EVENT, () =>
			{
				expect(results).to.have.length(3);
				done();
			});

			instance.enqueue(new URL("http://blc/simple/index.html"),    {index:0});
			instance.enqueue(new URL("http://blc/simple/index.html"),    {index:1});
			instance.enqueue(new URL("http://blc/simple/no-links.html"), {index:2});
		});



		it("re-requests a non-unique url after clearing cache", done =>
		{
			const options = rawOptions({ cacheResponses:true });
			const results = [];
			let endWasDispatched = false;

			const instance = new UrlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (link, customData) =>
			{
				expect(link.get(HTTP_RESPONSE_WAS_CACHED)).to.be.false;

				results[customData.index] = link;
			})
			.on(END_EVENT, () =>
			{
				if (endWasDispatched)
				{
					expect(results).to.have.length(3);
					done();
				}
				else
				{
					expect( instance.clearCache() ).to.equal(instance);

					instance.enqueue(url2, {index:2});
					endWasDispatched = true;
				}
			});

			const url1 = new URL("http://blc/simple/index.html");
			const url2 = new URL("http://blc/simple/no-links.html");

			instance.enqueue(url1, {index:0});
			instance.enqueue(url2, {index:1});
		});



		it("re-requests a non-unique url after expiring in cache", done =>
		{
			const options = rawOptions({ cacheMaxAge:50, cacheResponses:true });
			const results = [];
			let endWasDispatched = false;

			const instance = new UrlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (link, customData) =>
			{
				expect(link.get(HTTP_RESPONSE_WAS_CACHED)).to.be.false;

				results[customData.index] = link;
			})
			.on(END_EVENT, () =>
			{
				if (endWasDispatched)
				{
					expect(results).to.have.length(2);
					done();
				}
				else
				{
					setTimeout(() =>
					{
						instance.enqueue(url, {index:1});
						endWasDispatched = true;
					}, 100);
				}
			});

			const url = new URL("http://blc/simple/no-links.html");

			instance.enqueue(url, {index:0});
		});
	});



	describe("edge cases", () =>
	{
		it("supports custom data", done =>
		{
			new UrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (link, customData) =>
			{
				expect(customData).to.deep.equal({ test:"value" });
				done();
			})
			.enqueue(new URL("http://blc/"), {test:"value"});
		});



		it("supports multiple queue items", done =>
		{
			const results = [];

			const instance = new UrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (link, customData) =>
			{
				results[customData.index] = link;
			})
			.on(END_EVENT, () =>
			{
				expect(results).to.have.length(3);
				expect(results[0].get(RESOLVED_URL)).to.deep.equal(new URL(url1));
				expect(results[1].get(RESOLVED_URL)).to.deep.equal(new URL(url2));
				expect(results[2].get(RESOLVED_URL)).to.deep.equal(new URL(url3));
				done();
			});

			const url1 = new URL("http://blc/simple/index.html");
			const url2 = new URL("http://blc/simple/no-links.html");
			const url3 = new URL("http://blc/simple/404.html");

			instance.enqueue(url1, {index:0});
			instance.enqueue(url2, {index:1});
			instance.enqueue(url3, {index:2});
		});
	});
});
