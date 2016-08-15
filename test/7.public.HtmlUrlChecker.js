"use strict";
const helpers        = require("./helpers");
const HtmlUrlChecker = require("../lib/public/HtmlUrlChecker");
const messages       = require("../lib/internal/messages");

const {after, before, describe, it} = require("mocha");
const {expect} = require("chai");
const {parse:parseAuth} = require("basic-auth");



describe("PUBLIC -- HtmlUrlChecker", function()
{
	before(() => helpers.startServer("http://blc1/", "http://blc2/"));  // second server for external redirects
	after(helpers.stopServers);



	describe("enqueue()", function()
	{
		it("accepts a valid url", function()
		{
			const id = new HtmlUrlChecker( helpers.options() ).enqueue("http://blc1/");

			expect(id).to.be.a("number");
		});



		it("rejects an invalid url", function()
		{
			expect(() => new HtmlUrlChecker( helpers.options() ).enqueue("/path/")).to.throw(TypeError);
		});
	});



	describe("events", function()
	{
		it("html", function(done)
		{
			new HtmlUrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("html", function(tree, robots, response, pageUrl, customData)
			{
				expect(arguments).to.have.length(5);
				expect(tree).to.be.an("object");
				expect(robots).to.be.an("object");
				expect(response).to.be.an("object");
				expect(pageUrl).to.be.an.instanceOf(Object);  // TODO :: `a("url")` when dropping Node 6 support
				expect(customData).to.be.a("number");
				done();
			})
			.enqueue("http://blc1/normal/index.html", 123);
		});



		it("html + error", function(done)
		{
			new HtmlUrlChecker( helpers.options() )
			.on("error", function(error)
			{
				expect(arguments).to.have.length(1);
				expect(error).to.be.an("error");
				done();
			})
			.on("html", () => { throw new Error("test") })
			.enqueue("http://blc1/normal/index.html");
		});



		it("link", function(done)
		{
			let count = 0;

			new HtmlUrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("link", function(result, customData)
			{
				// If HTML has more than one link, only accept the first
				// to avoid calling `done()` more than once
				if (++count > 1) return;

				expect(arguments).to.have.length(2);
				expect(result).to.be.an("object");
				expect(customData).to.be.a("number");
				done();
			})
			.enqueue("http://blc1/normal/index.html", 123);
		});



		it("link + error", function(done)
		{
			let count = 0;

			new HtmlUrlChecker( helpers.options() )
			.on("error", function(error)
			{
				// If HTML has more than one link, only accept the first
				// to avoid calling `done()` more than once
				if (++count > 1) return;

				expect(arguments).to.have.length(1);
				expect(error).to.be.an("error");
				done();
			})
			.on("link", () => { throw new Error("test") })
			.enqueue("http://blc1/normal/index.html");
		});



		it("page", function(done)
		{
			new HtmlUrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("page", function(error, pageUrl, customData)
			{
				expect(arguments).to.have.length(3);
				expect(error).to.be.null;
				expect(pageUrl).to.be.an.instanceOf(Object);
				expect(customData).to.be.a("number");
				done();
			})
			.enqueue("http://blc1/normal/index.html", 123);
		});



		it("page + error", function(done)
		{
			new HtmlUrlChecker( helpers.options() )
			.on("error", function(error)
			{
				expect(arguments).to.have.length(1);
				expect(error).to.be.an("error");
				done();
			})
			.on("page", () => { throw new Error("test") })
			.enqueue("http://blc1/normal/index.html");
		});



		it("end", function(done)
		{
			new HtmlUrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("end", function()
			{
				expect(arguments).to.be.empty;
				done();
			})
			.enqueue("http://blc1/normal/index.html");
		});



		it("end + error", function(done)
		{
			new HtmlUrlChecker( helpers.options() )
			.on("error", function(error)
			{
				expect(arguments).to.have.length(1);
				expect(error).to.be.an("error");
				done();
			})
			.on("end", () => { throw new Error("test") })
			.enqueue("http://blc1/normal/index.html");
		});
	});



	describe("clearCache()", function()
	{
		it("works", function(done)
		{
			let finalFired = false;
			let linkCalled = false;
			const options = helpers.options({ cacheResponses:true });

			const instance = new HtmlUrlChecker(options)
			.on("error", error => done(error))
			.on("link", result =>
			{
				expect(result.http.cached).to.be.false;
				linkCalled = true;
			})
			.on("end", () =>
			{
				if (finalFired)
				{
					expect(linkCalled).to.be.true;
					done();
				}
				else
				{
					expect( instance.clearCache() ).to.equal(instance);

					instance.enqueue("http://blc1/normal/index.html");
					finalFired = true;
				}
			});

			instance.enqueue("http://blc1/normal/index.html");
		});
	});



	describe("numActiveLinks", function()
	{
		it("works", function(done)
		{
			let htmlCalled = false;

			const instance = new HtmlUrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("html", () =>
			{
				// Give time for link checks to start
				setImmediate(() =>
				{
					expect( instance.numActiveLinks ).to.equal(2);
					htmlCalled = true;
				});
			})
			.on("end", () =>
			{
				expect(htmlCalled).to.be.true;
				expect( instance.numActiveLinks ).to.equal(0);
				done();
			});

			instance.enqueue("http://blc1/normal/index.html");

			expect( instance.numActiveLinks ).to.equal(0);
		});
	});



	describe("pause() / resume() / isPaused", function()
	{
		it("works", function(done)
		{
			let resumed = false;

			const instance = new HtmlUrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("end", () =>
			{
				expect(resumed).to.be.true;
				done();
			});

			expect( instance.pause() ).to.equal(instance);
			expect(instance.isPaused).to.be.true;

			instance.enqueue("http://blc1/");

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
	describe("dequeue() / numPages / numQueuedLinks", function()
	{
		it("accepts a valid id", function(done)
		{
			const instance = new HtmlUrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("html", () =>
			{
				expect( instance.numPages ).to.equal(1);
				expect( instance.numQueuedLinks ).to.equal(2);
			})
			.on("end", () =>
			{
				expect( instance.numPages ).to.equal(0);
				expect( instance.numQueuedLinks ).to.equal(0);
				done();
			});

			// Prevent first queued item from immediately starting (and thus being auto-dequeued)
			instance.pause();

			const id = instance.enqueue("http://blc1/normal/index.html");

			expect( instance.numPages ).to.equal(1);
			expect( instance.numQueuedLinks ).to.equal(0);
			expect( instance.dequeue(id) ).to.be.true;
			expect( instance.numPages ).to.equal(0);
			expect( instance.numQueuedLinks ).to.equal(0);

			instance.enqueue("http://blc1/normal/index.html");
			instance.resume();
		});



		it("rejects an invalid id", function()
		{
			const instance = new HtmlUrlChecker( helpers.options() );

			// Prevent first queued item from immediately starting (and thus being auto-dequeued)
			instance.pause();

			const id = instance.enqueue("http://blc1/");

			expect( instance.dequeue(id+1) ).to.be.false;
			expect( instance.numPages ).to.equal(1);
		});
	});



	describe("edge cases", function()
	{
		it("supports custom data", function(done)
		{
			let linkCalled = false;
			let pageCalled = false;

			new HtmlUrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("link", (result, customData) =>
			{
				expect(customData).to.be.an("object");
				expect(customData.test).to.equal("value");
				linkCalled = true;
			})
			.on("page", (error, pageUrl, customData) =>
			{
				expect(customData).to.be.an("object");
				expect(customData.test).to.equal("value");
				pageCalled = true;
			})
			.on("end", () =>
			{
				expect(linkCalled).to.be.true;
				expect(pageCalled).to.be.true;
				done();
			})
			.enqueue("http://blc1/normal/index.html", {test:"value"});
		});



		it("supports multiple queue items", function(done)
		{
			const results = [];

			const instance = new HtmlUrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("link", (result, customData) =>
			{
				if (results[ customData.index ] === undefined)
				{
					results[ customData.index ] = [];
				}

				results[ customData.index ][ result.html.index ] = result;
			})
			.on("end", () =>
			{
				expect(results).to.have.length(2);

				expect(results[0]).to.have.length(2);
				expect(results[0][0].broken).to.be.false;  // with-links.html
				expect(results[0][1].broken).to.be.true;   // fake.html

				expect(results[1]).to.have.length(2);
				expect(results[1][0].broken).to.be.false;  // with-links.html
				expect(results[1][1].broken).to.be.true;   // fake.html

				done();
			});

			instance.enqueue("http://blc1/normal/index.html", {index:0});
			instance.enqueue("http://blc1/normal/index.html", {index:1});
		});



		it("supports html with no links", function(done)
		{
			let linkCount = 0;
			let pageCalled = false;

			new HtmlUrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("link", () => linkCount++)
			.on("page", () => pageCalled = true)
			.on("end", () =>
			{
				expect(pageCalled).to.be.true;
				expect(linkCount).to.equal(0);
				done();
			})
			.enqueue("http://blc1/normal/no-links.html");
		});



		it("supports pages after html with no links", function(done)
		{
			let linkCount = 0;
			let pageCount = 0;

			const instance = new HtmlUrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("link", () => linkCount++)
			.on("page", () => pageCount++)
			.on("end", () =>
			{
				expect(linkCount).to.equal(2);
				expect(pageCount).to.equal(2);
				done();
			});

			instance.enqueue("http://blc1/normal/no-links.html");
			instance.enqueue("http://blc1/normal/index.html");
		});



		it("reports an error when html cannot be retrieved", function(done)
		{
			let pageCalled = false;

			new HtmlUrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("page", (error, pageUrl, customData) =>
			{
				expect(error).to.be.an("error");
				expect(error.message).to.equal( messages.errors.HTML_RETRIEVAL );
				expect(pageUrl).to.be.an.instanceOf(Object);
				pageCalled = true;
			})
			.on("end", () =>
			{
				expect(pageCalled).to.be.true;
				done();
			})
			.enqueue("http://blc1/normal/fake.html");
		});



		it("supports pages after html could not be retrieved", function(done)
		{
			let pageCount = 0;

			const instance = new HtmlUrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("page", (error, pageUrl, customData) =>
			{
				if (++pageCount === 1)
				{
					expect(error).to.be.an("error");
				}
				else
				{
					expect(error).to.not.be.an("error");
				}
			})
			.on("end", () =>
			{
				expect(pageCount).to.equal(2);
				done();
			});

			instance.enqueue("http://blc1/normal/fake.html");
			instance.enqueue("http://blc1/normal/no-links.html");
		});



		it("supports pages compressed with deflate", function(done)
		{
			let pageCalled = false;

			const instance = new HtmlUrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("page", (error, pageUrl, customData) =>
			{
				expect(error).to.not.be.an("error");
				pageCalled = true;
			})
			.on("end", () =>
			{
				expect(pageCalled).to.be.true;
				done();
			});

			instance.enqueue("http://blc1/compression/deflate.html");
		});



		it("supports pages compressed with gzip", function(done)
		{
			let pageCalled = false;

			const instance = new HtmlUrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("page", (error, pageUrl, customData) =>
			{
				expect(error).to.not.be.an("error");
				pageCalled = true;
			})
			.on("end", () =>
			{
				expect(pageCalled).to.be.true;
				done();
			});

			instance.enqueue("http://blc1/compression/gzip.html");
		});



		// More info: https://bugs.chromium.org/p/chromium/issues/detail?id=123150
		// TODO :: check page with absolute urls containing no auth so that URL is re-checked with cached auth (if any) after 401 (unauthorized) -- this requires caching request data
		it("supports pages behind basic auth", function(done)
		{
			let linkCount = 0;
			let pageCalled = false;

			new HtmlUrlChecker( helpers.options() )
			.on("link", result =>
			{
				switch (result.html.offsetIndex)
				{
					case 0:
					case 1:
					{
						expect(result.broken).to.be.false;
						expect(result.url.rebased.password).to.be.empty;
						expect(result.url.rebased.username).to.be.empty;
						expect( parseAuth(result.http.response.headers.authorization) ).to.deep.equal({ name:"user", pass:"pass" });
						break;
					}
					case 2:
					{
						expect(result.broken).to.be.false;
						expect(result.url.rebased.password).to.equal("pass2");
						expect(result.url.rebased.username).to.equal("user2");
						expect( parseAuth(result.http.response.headers.authorization) ).to.deep.equal({ name:"user2", pass:"pass2" });
						break;
					}
					case 3:
					{
						expect(result.broken).to.be.true;
						expect(result.url.rebased.password).to.equal("pass3");
						expect(result.url.rebased.username).to.equal("user3");
						expect(result.http.response.headers.authorization).to.be.undefined;
						expect(result.http.response.status).to.equal(401);
						break;
					}
					case 4:
					{
						expect(result.broken).to.be.false;
						expect(result.url.rebased.password).to.be.empty;
						expect(result.url.rebased.username).to.be.empty;
						expect( parseAuth(result.http.response.headers.authorization) ).to.deep.equal({ name:"user", pass:"pass" });
						break;
					}
					case 5:
					{
						expect(result.broken).to.be.false;
						expect(result.url.rebased.password).to.be.empty;
						expect(result.url.rebased.username).to.be.empty;
						//expect( parseAuth(result.http.response.headers.authorization) ).to.deep.equal({ name:"user", pass:"pass" });  // TODO :: https://github.com/joepie91/node-bhttp/issues/35
						break;
					}
					case 6:
					{
						expect(result.broken).to.be.true;
						expect(result.url.rebased.password).to.be.empty;
						expect(result.url.rebased.username).to.be.empty;
						expect(result.http.response.headers.authorization).to.be.undefined;
						expect(result.http.response.status).to.equal(404);
						break;
					}
					case 7:
					{
						expect(result.broken).to.be.true;
						expect(result.url.rebased.password).to.equal("pass2");
						expect(result.url.rebased.username).to.equal("user2");
						expect(result.http.response.headers.authorization).to.be.undefined;
						expect(result.http.response.status).to.equal(404);
						break;
					}
				}

				linkCount++;
			})
			.on("page", error =>
			{
				expect(error).to.not.be.an("error");
				pageCalled = true;
			})
			.on("end", () =>
			{
				expect(linkCount).to.equal(8);
				expect(pageCalled).to.be.true;
				done();
			})
			.on("error", error => done(error))
			.enqueue("http://user:pass@blc1/auth/index.html");
		});
	});



	describe("options", function()
	{
		it("honorRobotExclusions = false (header)", function(done)
		{
			const results = [];

			new HtmlUrlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("junk", () => done( new Error("this should not have been called") ))
			.on("link", result => results.push(result))
			.on("end", () =>
			{
				expect(results).to.have.length(1);
				expect(results[0]).to.containSubset(
				{
					broken: false,
					excluded: false,
					excludedReason: null
				});
				done();
			})
			.enqueue("http://blc1/disallowed/header.html");
		});



		// NOTE :: header+meta+rel is tested in `SiteChecker` suite
		it("honorRobotExclusions = true (header)", function(done)
		{
			const junkResults = [];

			new HtmlUrlChecker( helpers.options({ honorRobotExclusions:true }) )
			.on("error", error => done(error))
			.on("junk", result => junkResults.push(result))
			.on("link", () => done( new Error("this should not have been called") ))
			.on("end", () =>
			{
				expect(junkResults).to.have.length(1);
				expect(junkResults[0]).to.containSubset(
				{
					broken: null,
					excluded: true,
					excludedReason: "BLC_ROBOTS"
				});
				done();
			})
			.enqueue("http://blc1/disallowed/header.html");
		});



		// TODO :: honorRobotExcluses=true (header) + userAgent=Googlebot/2.1
	});
});
