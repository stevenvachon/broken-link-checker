"use strict";
const helpers    = require("./helpers");
const UrlChecker = require("../lib/public/UrlChecker");

const {after, before, describe, it} = require("mocha");
const {expect} = require("chai");



describe("PUBLIC -- UrlChecker", function()
{
	before(() => helpers.startServer("http://blc/"));
	after(helpers.stopServers);



	describe("enqueue()", function()
	{
		it("accepts a valid url", function()
		{
			const id = new UrlChecker( helpers.options() ).enqueue("http://blc/");

			expect(id).to.be.a("number");
		});



		it("rejects an invalid url", function()
		{
			expect(() => new UrlChecker( helpers.options() ).enqueue("/path/")).to.throw(TypeError);
		});
	});



	describe("events", function()
	{
		it("link", function(done)
		{
			new UrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("link", function(result, customData)
			{
				expect(arguments).to.have.length(2);
				expect(result).to.be.an("object");
				expect(customData).to.be.undefined;
				done();
			})
			.enqueue("http://blc/");
		});



		it("link + error", function(done)
		{
			new UrlChecker( helpers.options() )
			.on("error", error =>
			{
				expect(arguments).to.have.length(1);
				expect(error).to.be.an("error");
				done();
			})
			.on("link", () => { throw new Error("test") })
			.enqueue("http://blc/");
		});



		it("end", function(done)
		{
			new UrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("end", function()
			{
				expect(arguments).to.be.empty;
				done();
			})
			.enqueue("http://blc/");
		});



		it("end + error", function(done)
		{
			new UrlChecker( helpers.options() )
			.on("error", error =>
			{
				expect(arguments).to.have.length(1);
				expect(error).to.be.an("error");
				done();
			})
			.on("end", () => { throw new Error("test") })
			.enqueue("http://blc/");
		});
	});



	describe("numActiveLinks", function()
	{
		it("works", function(done)
		{
			const instance = new UrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("end", () =>
			{
				expect( instance.numActiveLinks ).to.equal(0);
				done();
			});

			instance.enqueue("http://blc/");
			instance.enqueue("http://blc/normal/no-links.html");

			expect( instance.numActiveLinks ).to.equal(2);
		});
	});



	describe("pause() / resume() / isPaused", function()
	{
		it("works", function(done)
		{
			let resumed = false;

			const instance = new UrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("end", () =>
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
	describe("dequeue() / numQueuedLinks", function()
	{
		it("accepts a valid id", function(done)
		{
			const instance = new UrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("end", () =>
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



		it("rejects an invalid id", function()
		{
			const instance = new UrlChecker( helpers.options() );

			// Prevent first queued item from immediately starting (and thus being auto-dequeued)
			instance.pause();

			const id = instance.enqueue("http://blc/");

			expect( instance.dequeue(id+1) ).to.be.false;
			expect( instance.numQueuedLinks ).to.equal(1);
		});
	});



	describe("caching", function()
	{
		it("requests a unique url only once", function(done)
		{
			const options = helpers.options({ cacheResponses:true });
			const results = [];

			const instance = new UrlChecker(options)
			.on("error", error => done(error))
			.on("link", (result, customData) =>
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
			.on("end", () =>
			{
				expect(results).to.have.length(3);
				done();
			});

			instance.enqueue("http://blc/normal/index.html",    {index:0});
			instance.enqueue("http://blc/normal/index.html",    {index:1});
			instance.enqueue("http://blc/normal/no-links.html", {index:2});
		});



		it("re-requests a non-unique url after clearing cache", function(done)
		{
			let finalFired = false;
			const options = helpers.options({ cacheResponses:true });
			const results = [];

			const instance = new UrlChecker(options)
			.on("error", error => done(error))
			.on("link", (result, customData) =>
			{
				expect(result.http.cached).to.be.false;

				results[customData.index] = result;
			})
			.on("end", () =>
			{
				if (finalFired)
				{
					expect(results).to.have.length(3);
					done();
				}
				else
				{
					expect( instance.clearCache() ).to.equal(instance);

					instance.enqueue("http://blc/normal/no-links.html", {index:2});
					finalFired = true;
				}
			});

			instance.enqueue("http://blc/normal/index.html",    {index:0});
			instance.enqueue("http://blc/normal/no-links.html", {index:1});
		});



		it("re-requests a non-unique url after expiring in cache", function(done)
		{
			let finalFired = false;
			const options = helpers.options({ cacheMaxAge:50, cacheResponses:true });
			const results = [];

			const instance = new UrlChecker(options)
			.on("error", error => done(error))
			.on("link", (result, customData) =>
			{
				expect(result.http.cached).to.be.false;

				results[customData.index] = result;
			})
			.on("end", () =>
			{
				if (finalFired)
				{
					expect(results).to.have.length(2);
					done();
				}
				else
				{
					setTimeout(() =>
					{
						instance.enqueue("http://blc/normal/no-links.html", {index:1});
						finalFired = true;

					}, 100);
				}
			});

			instance.enqueue("http://blc/normal/no-links.html", {index:0});
		});
	});



	describe("edge cases", function()
	{
		it("supports custom data", function(done)
		{
			new UrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("link", (result, customData) =>
			{
				expect(customData).to.deep.equal({ test:"value" });
				done();
			})
			.enqueue("http://blc/", {test:"value"});
		});



		it("supports multiple queue items", function(done)
		{
			const results = [];

			const instance = new UrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("link", (result, customData) =>
			{
				results[customData.index] = result;
			})
			.on("end", () =>
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
