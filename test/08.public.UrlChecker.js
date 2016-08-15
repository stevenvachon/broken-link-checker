import {after, before, describe, it} from "mocha";
import {END_EVENT, ERROR_EVENT, LINK_EVENT} from "../lib/internal/events";
import {expect} from "chai";
import {ExpectedError, rawOptions, startServer, stopServers} from "./helpers";
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
			const id = new UrlChecker(rawOptions()).enqueue("http://blc/");

			expect(id).to.be.a("number");
		});



		it("rejects an invalid url", () =>
		{
			expect(() => new UrlChecker(rawOptions()).enqueue("/path/")).to.throw(TypeError);
		});
	});



	describe("events", () =>
	{
		it(LINK_EVENT, done =>
		{
			new UrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (result, customData, ...remainingArgs) =>
			{
				expect(remainingArgs).to.be.empty;
				expect(result).to.be.an("object");
				expect(customData).to.be.undefined;
				done();
			})
			.enqueue("http://blc/");
		});



		it(`${LINK_EVENT} + ${ERROR_EVENT}`, done =>
		{
			new UrlChecker(rawOptions())
			.on(ERROR_EVENT, (error, ...remainingArgs) =>
			{
				expect(remainingArgs).to.be.empty;
				expect(error).to.be.an("error");
				done();
			})
			.on(LINK_EVENT, () =>
			{
				throw new ExpectedError();
			})
			.enqueue("http://blc/");
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
			.enqueue("http://blc/");
		});



		it(`${END_EVENT} + ${ERROR_EVENT}`, done =>
		{
			new UrlChecker(rawOptions())
			.on(ERROR_EVENT, (error, ...remainingArgs) =>
			{
				expect(remainingArgs).to.be.empty;
				expect(error).to.be.an("error");
				done();
			})
			.on(END_EVENT, () =>
			{
				throw new ExpectedError();
			})
			.enqueue("http://blc/");
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

			instance.enqueue("http://blc/");
			instance.enqueue("http://blc/normal/no-links.html");

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

			instance.enqueue("http://blc/");

			// Wait longer than scan should take
			setTimeout(() =>
			{
				resumed = true;

				expect( instance.resume() ).to.equal(instance);
				expect(instance.isPaused).to.be.false;

			}, 100);
		});
	});



	// TODO :: test what happens when the current queue item is dequeued
	describe("dequeue() / numQueuedLinks", () =>
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

			const id = instance.enqueue("http://blc/");

			expect( instance.numQueuedLinks ).to.equal(1);
			expect( instance.dequeue(id) ).to.be.true;
			expect( instance.numQueuedLinks ).to.equal(0);

			instance.enqueue("http://blc/");
			instance.resume();
		});



		it("rejects an invalid id", () =>
		{
			const instance = new UrlChecker(rawOptions());

			// Prevent first queued item from immediately starting (and thus being auto-dequeued)
			instance.pause();

			const id = instance.enqueue("http://blc/");

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
			.on(LINK_EVENT, (result, customData) =>
			{
				switch (customData.index)
				{
					case 0:
					{
						expect(result.http.cached).to.be.false;
						break;
					}
					case 1:
					{
						expect(result.http.cached).to.be.true;
						break;
					}
				}

				results[customData.index] = result;
			})
			.on(END_EVENT, () =>
			{
				expect(results).to.have.length(3);
				done();
			});

			instance.enqueue("http://blc/normal/index.html",    {index:0});
			instance.enqueue("http://blc/normal/index.html",    {index:1});
			instance.enqueue("http://blc/normal/no-links.html", {index:2});
		});



		it("re-requests a non-unique url after clearing cache", done =>
		{
			const options = rawOptions({ cacheResponses:true });
			const results = [];
			let endWasDispatched = false;

			const instance = new UrlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (result, customData) =>
			{
				expect(result.http.cached).to.be.false;

				results[customData.index] = result;
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

					instance.enqueue("http://blc/normal/no-links.html", {index:2});
					endWasDispatched = true;
				}
			});

			instance.enqueue("http://blc/normal/index.html",    {index:0});
			instance.enqueue("http://blc/normal/no-links.html", {index:1});
		});



		it("re-requests a non-unique url after expiring in cache", done =>
		{
			const options = rawOptions({ cacheMaxAge:50, cacheResponses:true });
			const results = [];
			let endWasDispatched = false;

			const instance = new UrlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (result, customData) =>
			{
				expect(result.http.cached).to.be.false;

				results[customData.index] = result;
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
						instance.enqueue("http://blc/normal/no-links.html", {index:1});
						endWasDispatched = true;
					}, 100);
				}
			});

			instance.enqueue("http://blc/normal/no-links.html", {index:0});
		});
	});



	describe("edge cases", () =>
	{
		it("supports custom data", done =>
		{
			new UrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (result, customData) =>
			{
				expect(customData).to.deep.equal({ test:"value" });
				done();
			})
			.enqueue("http://blc/", {test:"value"});
		});



		it("supports multiple queue items", done =>
		{
			const results = [];

			const instance = new UrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (result, customData) =>
			{
				results[customData.index] = result;
			})
			.on(END_EVENT, () =>
			{
				expect(results).to.have.length(3);
				expect(results).to.containSubset(
				[
					{ url:{ resolved:{ href: "http://blc/normal/index.html"    } } },
					{ url:{ resolved:{ href: "http://blc/normal/no-links.html" } } },
					{ url:{ resolved:{ href: "http://blc/normal/fake.html"     } } }
				]);
				done();
			});

			instance.enqueue("http://blc/normal/index.html",    {index:0});
			instance.enqueue("http://blc/normal/no-links.html", {index:1});
			instance.enqueue("http://blc/normal/fake.html",     {index:2});
		});
	});
});
