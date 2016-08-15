"use strict";
const helpers     = require("./helpers");
const messages    = require("../lib/internal/messages");
const SiteChecker = require("../lib/public/SiteChecker");

const {after, before, describe, it} = require("mocha");
const {expect} = require("chai");
const {parse:parseAuth} = require("basic-auth");



const maybeAddContainers = (results, pageIndex, siteIndex) =>
{
	if (siteIndex != null)
	{
		if (results[siteIndex] === undefined)
		{
			results[siteIndex] = [];
		}

		if (results[siteIndex][pageIndex] === undefined)
		{
			results[siteIndex][pageIndex] = [];
		}
	}
	else if (results[pageIndex] === undefined)
	{
		results[pageIndex] = [];
	}
};



// TODO :: https://github.com/mochajs/mocha/issues/1128#issuecomment-246186839
describe("PUBLIC -- SiteChecker", function()
{
	before(() => helpers.startServers("http://blc1/", "http://blc2/"));  // second server for external redirects
	after(helpers.stopServers);



	describe("enqueue()", function()
	{
		it("accepts a valid url", function()
		{
			const id = new SiteChecker( helpers.options() ).enqueue("http://blc1/");

			expect(id).to.be.a("number");
		});



		it("rejects an invalid url", function()
		{
			expect(() => new SiteChecker( helpers.options() ).enqueue("/path/")).to.throw(TypeError);
		});
	});



	describe("events", function()
	{
		it("html", function(done)
		{
			let count = 0;

			new SiteChecker( helpers.options() )
			.on("error", error => done(error))
			.on("html", function(tree, robots, response, pageUrl, customData)
			{
				// If HTML has more than one link/page, so only accept the first
				// to avoid calling `done()` more than once
				if (++count > 1) return;

				expect(arguments).to.have.length(5);
				expect(tree).to.be.an("object");
				expect(response).to.be.an("object");
				expect(pageUrl).to.be.an.instanceOf(Object);
				expect(customData).to.be.a("number");
				done();
			})
			.enqueue("http://blc1/normal/index.html", 123);
		});



		it("html + error", function(done)
		{
			let count = 0;

			new SiteChecker( helpers.options() )
			.on("error", function(error)
			{
				// If HTML has more than one link/page, so only accept the first
				// to avoid calling `done()` more than once
				if (++count > 1) return;

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

			new SiteChecker( helpers.options() )
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

			new SiteChecker( helpers.options() )
			.on("error", function(error)
			{
				// If HTML has more than one link, so only accept the first
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
			let count = 0;

			new SiteChecker( helpers.options() )
			.on("error", error => done(error))
			.on("page", function(error, pageUrl, customData)
			{
				// If site has more than one page, only accept the first
				// to avoid calling `done()` more than once
				if (++count > 1) return;

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
			let count = 0;

			new SiteChecker( helpers.options() )
			.on("error", function(error)
			{
				// If HTML has more than one page, so only accept the first
				// to avoid calling `done()` more than once
				if (++count > 1) return;

				expect(arguments).to.have.length(1);
				expect(error).to.be.an("error");
				done();
			})
			.on("page", () => { throw new Error("test") })
			.enqueue("http://blc1/normal/index.html");
		});



		it("site", function(done)
		{
			new SiteChecker( helpers.options() )
			.on("error", error => done(error))
			.on("site", function(error, siteUrl, customData)
			{
				expect(arguments).to.have.length(3);
				expect(error).to.be.null;
				expect(siteUrl).to.be.an.instanceOf(Object);
				expect(customData).to.be.a("number");
				done();
			})
			.enqueue("http://blc1/normal/index.html", 123);
		});



		it("site + error", function(done)
		{
			new SiteChecker( helpers.options() )
			.on("error", function(error)
			{
				expect(arguments).to.have.length(1);
				expect(error).to.be.an("error");
				done();
			})
			.on("site", () => { throw new Error("test") })
			.enqueue("http://blc1/normal/index.html");
		});



		it("end", function(done)
		{
			new SiteChecker( helpers.options() )
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
			new SiteChecker( helpers.options() )
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

			const instance = new SiteChecker(options)
			.on("error", error => done(error))
			.on("link", result =>
			{
				expect(result.http.cached).to.be.false;
				linkCalled = true;
			})
			.on("page", () =>
			{
				expect( instance.clearCache() ).to.equal(instance);
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

			const instance = new SiteChecker( helpers.options() )
			.on("error", error => done(error))
			.on("html", () =>
			{
				if (htmlCalled) return;  // skip recursive checks

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

			const instance = new SiteChecker( helpers.options() )
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
	describe("dequeue() / numSites / numPages / numQueuedLinks", function()
	{
		it("accepts a valid id", function(done)
		{
			const instance = new SiteChecker( helpers.options() )
			.on("error", error => done(error))
			.on("html", () =>
			{
				expect( instance.numSites ).to.equal(1);
				expect( instance.numPages ).to.equal(1);
				expect( instance.numQueuedLinks ).to.equal(2);
			})
			.on("end", () =>
			{
				expect( instance.numSites ).to.equal(0);
				expect( instance.numPages ).to.equal(0);
				expect( instance.numQueuedLinks ).to.equal(0);
				done();
			});

			// Prevent first queued item from immediately starting (and thus being auto-dequeued)
			instance.pause();

			const id = instance.enqueue("http://blc1/normal/index.html");

			expect( instance.numSites ).to.equal(1);
			expect( instance.numPages ).to.equal(0);
			expect( instance.numQueuedLinks ).to.equal(0);
			expect( instance.dequeue(id) ).to.be.true;
			expect( instance.numSites ).to.equal(0);
			expect( instance.numPages ).to.equal(0);
			expect( instance.numQueuedLinks ).to.equal(0);

			instance.enqueue("http://blc1/normal/index.html");
			instance.resume();
		});



		it("rejects an invalid id", function()
		{
			const instance = new SiteChecker( helpers.options() );

			// Prevent first queued item from immediately starting (and thus being auto-dequeued)
			instance.pause();

			const id = instance.enqueue("http://blc1/");

			expect( instance.dequeue(id+1) ).to.be.false;
			expect( instance.numSites ).to.equal(1);
		});
	});



	describe("edge cases", function()
	{
		it("supports custom data", function(done)
		{
			let linkCalled = false;
			let pageCalled = false;
			let siteCalled = false;

			new SiteChecker( helpers.options() )
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
			.on("site", (error, siteUrl, customData) =>
			{
				expect(customData).to.be.an("object");
				expect(customData.test).to.equal("value");
				siteCalled = true;
			})
			.on("end", () =>
			{
				expect(linkCalled).to.be.true;
				expect(pageCalled).to.be.true;
				expect(siteCalled).to.be.true;
				done();
			})
			.enqueue("http://blc1/normal/index.html", {test:"value"});
		});



		it("supports multiple queue items", function(done)
		{
			let pageIndex = 0;
			const results = [];

			const instance = new SiteChecker( helpers.options() )
			.on("error", error => done(error))
			.on("link", (result, customData) =>
			{
				maybeAddContainers(results, pageIndex, customData.siteIndex);

				results[ customData.siteIndex ][pageIndex][ result.html.index ] = result;
			})
			.on("page", (error, pageUrl, customData) =>
			{
				expect(error).to.be.null;

				// If first page didn't load
				// If first page did load but had no links
				maybeAddContainers(results, pageIndex, customData.siteIndex);

				pageIndex++;
			})
			.on("site", (error, siteUrl, customData) =>
			{
				expect(error).to.be.null;

				pageIndex = 0;
			})
			.on("end", () =>
			{
				expect(results).to.have.length(2);

				expect(results[0]).to.have.length(3);         // site (with pages checked)
				expect(results[0][0]).to.have.length(2);      // page -- index.html
				expect(results[0][0][0].broken).to.be.false;  // link -- with-links.html
				expect(results[0][0][1].broken).to.be.true;   // link -- fake.html
				expect(results[0][1]).to.have.length(2);      // page -- with-links.html
				expect(results[0][1][0].broken).to.be.false;  // link -- no-links.html
				expect(results[0][1][1].broken).to.be.true;   // link -- fake.html
				expect(results[0][2]).to.have.length(0);      // page -- no-links.html

				expect(results[1]).to.have.length(3);         // site (with pages checked)
				expect(results[1][0]).to.have.length(2);      // page -- index.html
				expect(results[1][0][0].broken).to.be.false;  // link -- with-links.html
				expect(results[1][0][1].broken).to.be.true;   // link -- fake.html
				expect(results[1][1]).to.have.length(2);      // page -- with-links.html
				expect(results[1][1][0].broken).to.be.false;  // link -- no-links.html
				expect(results[1][1][1].broken).to.be.true;   // link -- fake.html
				expect(results[1][2]).to.have.length(0);      // page -- no-links.html

				done();
			});

			instance.enqueue("http://blc1/normal/index.html", {siteIndex:0});
			instance.enqueue("http://blc1/normal/index.html", {siteIndex:1});
		});



		it("supports html with no links", function(done)
		{
			let linkCount = 0;
			let pageCalled = false;
			let siteCalled = false;

			new SiteChecker( helpers.options() )
			.on("error", error => done(error))
			.on("link", () => linkCount++)
			.on("page", () => pageCalled = true)
			.on("site", () => siteCalled = true)
			.on("end", () =>
			{
				expect(pageCalled).to.be.true;
				expect(siteCalled).to.be.true;
				expect(linkCount).to.equal(0);
				done();
			})
			.enqueue("http://blc1/normal/no-links.html");
		});



		it("supports pages after html with no links", function(done)
		{
			let linkCount = 0;
			let pageCount = 0;
			let siteCount = 0;

			const instance = new SiteChecker( helpers.options() )
			.on("error", error => done(error))
			.on("link", () => linkCount++)
			.on("page", () => pageCount++)
			.on("site", () => siteCount++)
			.on("end", () =>
			{
				expect(linkCount).to.equal(4);
				expect(pageCount).to.equal(4);  // no-links.html is checked twice because they're part of two different site queue items
				expect(siteCount).to.equal(2);
				done();
			});

			instance.enqueue("http://blc1/normal/no-links.html");
			instance.enqueue("http://blc1/normal/index.html");
		});



		it("reports a page+site error when first page's html cannot be retrieved", function(done)
		{
			let pageCalled = false;
			let siteCalled = false;

			new SiteChecker( helpers.options() )
			.on("error", error => done(error))
			.on("page", (error, pageUrl, customData) =>
			{
				expect(error).to.be.an("error");
				expect(error.message).to.equal( messages.errors.HTML_RETRIEVAL );
				expect(pageUrl).to.be.an.instanceOf(Object);
				pageCalled = true;
			})
			.on("site", (error, siteUrl, customData) =>
			{
				expect(error).to.be.an("error");
				expect(error.message).to.equal( messages.errors.HTML_RETRIEVAL );
				expect(siteUrl).to.be.an.instanceOf(Object);
				siteCalled = true;
			})
			.on("end", () =>
			{
				expect(pageCalled).to.be.true;
				expect(siteCalled).to.be.true;
				done();
			})
			.enqueue("http://blc1/normal/fake.html");
		});



		it("does not report site error when non-first page's html cannot be retrieved", function(done)
		{
			let pageCount = 0;

			new SiteChecker( helpers.options() )
			.on("error", error => done(error))
			.on("page", (error, pageUrl, customData) =>
			{
				if (++pageCount < 3)
				{
					expect(error).to.not.be.an("error");
				}
				else
				{
					expect(error).to.be.an("error");
				}
			})
			.on("site", (error, siteUrl, customData) =>
			{
				expect(error).to.not.be.an("error");
			})
			.on("end", () =>
			{
				done();
			})
			.enqueue("http://blc1/normal/with-links.html");
		});



		it("supports sites after first page's html could not be retrieved", function(done)
		{
			let pageCount = 0;
			let siteCount = 0;

			const instance = new SiteChecker( helpers.options() )
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
			.on("site", (error, siteUrl, customData) =>
			{
				if (++siteCount === 1)
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
				expect(siteCount).to.equal(2);
				done();
			});

			instance.enqueue("http://blc1/normal/fake.html");
			instance.enqueue("http://blc1/normal/no-links.html");
		});



		it("does not check a page that has already been checked", function(done)
		{
			let pageCount = 0;

			new SiteChecker( helpers.options() )
			.on("error", error => done(error))
			.on("page", () => pageCount++)
			.on("end", () =>
			{
				expect(pageCount).to.equal(3);
				done();
			})
			.enqueue("http://blc1/circular/index.html");
		});



		it("does not check a page that redirects to a page that has already been checked", function(done)
		{
			let pageCount = 0;

			new SiteChecker( helpers.options() )
			.on("error", error => done(error))
			.on("page", () => pageCount++)
			.on("end", () =>
			{
				expect(pageCount).to.equal(2);
				done();
			})
			.enqueue("http://blc1/redirect/index.html");
		});



		it("does not check a page that redirects to a page that has already been checked (#2)", function(done)
		{
			let pageCount = 0;

			new SiteChecker( helpers.options() )
			.on("error", error => done(error))
			.on("page", () => pageCount++)
			.on("end", () =>
			{
				expect(pageCount).to.equal(1);
				done();
			})
			.enqueue("http://blc1/circular-redirect/redirect.html");
		});



		it("does not check a non-first page that redirects to another site", function(done)
		{
			let linkCount = 0;
			let pageCount = 0;

			new SiteChecker( helpers.options() )
			.on("error", error => done(error))
			.on("link", (result, customData) =>
			{
				expect(result.broken).to.be.false;
				linkCount++;
			})
			.on("page", () => pageCount++)
			.on("end", () =>
			{
				expect(linkCount).to.equal(1);
				expect(pageCount).to.equal(1);
				done();
			})
			.enqueue("http://blc1/external-redirect/index.html");
		});



		it("checks a first page that redirects to another site", function(done)
		{
			let pageCount = 0;

			new SiteChecker( helpers.options() )
			.on("error", error => done(error))
			.on("page", (error, pageUrl, customData) =>
			{
				expect(error).to.not.be.an("error");
				pageCount++;
			})
			.on("end", () =>
			{
				expect(pageCount).to.equal(1);
				done();
			})
			.enqueue("http://blc1/external-redirect/redirect.html");
		});



		// More info: https://bugs.chromium.org/p/chromium/issues/detail?id=123150
		it("supports pages behind basic auth", function(done)
		{
			let linkCount = 0;
			let pageCount = 0;

			new SiteChecker( helpers.options({ maxSockets:1 }) )
			.on("link", result =>
			{
				// TODO :: more than one link per index due to multiple pages
				switch (linkCount++)
				{
					case 0:
					{
						expect(result.broken).to.be.false;
						expect(result.url.original).to.equal("transitive.html");
						expect(result.url.rebased.password).to.be.empty;
						expect(result.url.rebased.username).to.be.empty;
						expect( parseAuth(result.http.response.headers.authorization) ).to.deep.equal({ name:"user", pass:"pass" });
						break;
					}
					case 1:
					{
						expect(result.broken).to.be.false;
						expect(result.url.original).to.equal("http://blc1/auth/transitive.html");
						expect(result.url.rebased.password).to.be.empty;
						expect(result.url.rebased.username).to.be.empty;
						expect( parseAuth(result.http.response.headers.authorization) ).to.deep.equal({ name:"user", pass:"pass" });
						break;
					}
					case 2:
					{
						// TODO :: add link to this page and make sure it doesn't crawl it, since auth is different
						expect(result.broken).to.be.false;
						expect(result.url.original).to.equal("http://user2:pass2@blc1/auth/intransitive.html");
						expect(result.url.rebased.password).to.equal("pass2");
						expect(result.url.rebased.username).to.equal("user2");
						expect( parseAuth(result.http.response.headers.authorization) ).to.deep.equal({ name:"user2", pass:"pass2" });
						break;
					}
					case 3:
					{
						expect(result.broken).to.be.true;
						expect(result.url.original).to.equal("http://user3:pass3@blc1/auth/intransitive.html");
						expect(result.url.rebased.password).to.equal("pass3");
						expect(result.url.rebased.username).to.equal("user3");
						expect(result.http.response.headers.authorization).to.be.undefined;
						expect(result.http.response.status).to.equal(401);
						break;
					}
					case 4:
					{
						expect(result.broken).to.be.false;
						expect(result.url.original).to.equal("transitive-redirect.html");
						expect(result.url.redirected.pathname).to.equal("/auth/transitive-redirected.html");
						expect(result.url.rebased.password).to.be.empty;
						expect(result.url.rebased.username).to.be.empty;
						expect( parseAuth(result.http.response.headers.authorization) ).to.deep.equal({ name:"user", pass:"pass" });
						break;
					}
					case 5:
					{
						expect(result.broken).to.be.false;
						expect(result.url.original).to.equal("intransitive-redirect.html");
						expect(result.url.rebased.password).to.be.empty;
						expect(result.url.rebased.username).to.be.empty;
						//expect( parseAuth(result.http.response.headers.authorization) ).to.deep.equal({ name:"user", pass:"pass" });  // TODO :: https://github.com/joepie91/node-bhttp/issues/35
						break;
					}
					case 6:
					{
						expect(result.broken).to.be.true;
						expect(result.url.original).to.equal("fake.html");
						expect(result.url.rebased.password).to.be.empty;
						expect(result.url.rebased.username).to.be.empty;
						expect(result.http.response.headers.authorization).to.be.undefined;
						expect(result.http.response.status).to.equal(404);
						break;
					}
					case 7:
					{
						expect(result.broken).to.be.true;
						expect(result.url.original).to.equal("http://user2:pass2@blc1/auth/fake.html");
						expect(result.url.rebased.password).to.equal("pass2");
						expect(result.url.rebased.username).to.equal("user2");
						expect(result.http.response.headers.authorization).to.be.undefined;
						expect(result.http.response.status).to.equal(404);
						break;
					}
					case 8:
					{
						expect(result.broken).to.be.false;
						expect(result.base.resolved.pathname).to.equal("/auth/transitive-redirected.html");
						expect(result.url.original).to.equal("transitive.html");
						expect(result.url.rebased.password).to.be.empty;
						expect(result.url.rebased.username).to.be.empty;
						expect( parseAuth(result.http.response.headers.authorization) ).to.deep.equal({ name:"user", pass:"pass" });
						break;
					}
				}
			})
			.on("page", (error, pageUrl) =>
			{
				expect(error).to.not.be.an("error");
				pageCount++;
			})
			.on("end", () =>
			{
				expect(linkCount).to.equal(9);
				expect(pageCount).to.equal(3);
				done();
			})
			.on("error", error => done(error))
			.enqueue("http://user:pass@blc1/auth/index.html");
		});



		// TODO :: does not check a non-first page that redirects to another site when options.excludeInternalLinks=true
	});



	describe("options", function()
	{
		it("customFilter = function(){…}", function(done)
		{
			const junkResults = [];
			const results = [];
			let page = 0;

			new SiteChecker( helpers.options({ customFilter: result => result.html.text !== "link-fake" }) )
			.on("error", error => done(error))
			.on("html", () => page++)
			.on("junk", result =>
			{
				if (page === 1)
				{
					junkResults[result.html.offsetIndex] = result;
				}
			})
			.on("link", result =>
			{
				if (page === 1)
				{
					results[result.html.offsetIndex] = result;
				}
			})
			.on("end", () =>
			{
				expect(junkResults).to.have.length(1);
				expect(junkResults[0]).to.containSubset(
				{
					broken: null,
					excluded: true,
					excludedReason: "BLC_CUSTOM"
				});

				expect(results).to.have.length(1);
				expect(results[0]).to.containSubset(
				{
					broken: false,
					excluded: false,
					excludedReason: null
				});

				done();
			})
			.enqueue("http://blc1/normal/index.html");
		});



		it("honorRobotExclusions = false (robots.txt)", function(done)
		{
			const results = [];

			new SiteChecker( helpers.options() )
			.on("error", error => done(error))
			.on("robots", robots => done( new Error("this should not have been called") ))
			.on("junk", result => done( new Error("this should not have been called") ))
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
			.enqueue("http://blc1/disallowed/robots-txt.html");
		});



		// TODO :: remove custom data when separated "robots" even test is created
		it("honorRobotExclusions = true (robots.txt)", function(done)
		{
			const junkResults = [];
			let robotsCalled = true;

			new SiteChecker( helpers.options({ honorRobotExclusions:true }) )
			.on("error", error => done(error))
			.on("robots", (robots, customData) =>
			{
				expect(robots).to.be.an("object");
				expect(customData).to.be.a("number");
				robotsCalled = true;
			})
			.on("junk", result => junkResults.push(result))
			.on("link", () => done( new Error("this should not have been called") ))
			.on("end", () =>
			{
				expect(robotsCalled).to.be.true;
				expect(junkResults).to.have.length(1);
				expect(junkResults[0]).to.containSubset(
				{
					broken: null,
					excluded: true,
					excludedReason: "BLC_ROBOTS"
				});
				done();
			})
			.enqueue("http://blc1/disallowed/robots-txt.html", 123);
		});



		it("honorRobotExclusions = false (rel + meta + header + robots.txt)", function(done)
		{
			let pageIndex = 0;
			const results = [];

			new SiteChecker( helpers.options() )
			.on("error", error => done(error))
			.on("robots", robots => done( new Error("this should not have been called") ))
			.on("junk", result => done( new Error("this should not have been called") ))
			.on("link", result =>
			{
				maybeAddContainers(results, pageIndex);

				results[pageIndex][ result.html.index ] = result;
			})
			.on("page", error =>
			{
				expect(error).to.be.null;

				// If first page didn't load
				// If first page did load but had no links
				maybeAddContainers(results, pageIndex);

				pageIndex++;
			})
			.on("end", () =>
			{
				expect(results).to.have.length(9);
				expect(results).to.all.all.containSubset(  // TODO :: https://github.com/chaijs/chai-things/issues/29
				{
					broken: false,
					excluded: false,
					excludedReason: null
				});
				done();
			})
			.enqueue("http://blc1/disallowed/index.html");
		});



		it("honorRobotExclusions = true (rel + meta + header + robots.txt)", function(done)
		{
			let pageIndex = 0;
			const results = [];

			new SiteChecker( helpers.options({ honorRobotExclusions:true }) )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				maybeAddContainers(results, pageIndex);

				results[pageIndex][ result.html.index ] = result;
			})
			.on("link", result =>
			{
				maybeAddContainers(results, pageIndex);

				results[pageIndex][ result.html.index ] = result;
			})
			.on("page", error =>
			{
				expect(error).to.be.null;

				// If first page didn't load
				// If first page did load but had no links
				maybeAddContainers(results, pageIndex);

				pageIndex++;
			})
			.on("end", () =>
			{
				expect(results).to.have.length(5);

				expect(results[0]).to.all.containSubset(
				{
					broken: false,
					excluded: false,
					excludedReason: null
				});

				// TODO :: https://github.com/chaijs/chai-things/issues/29
				for (let i=1; i<5; i++)
				{
					expect(results[i]).to.all.containSubset(
					{
						broken: null,
						excluded: true,
						excludedReason: "BLC_ROBOTS"
					});
				}

				done();
			})
			.enqueue("http://blc1/disallowed/index.html");
		});



		// TODO :: honorRobotExcluses=true (rel + meta + header + robots.txt) + userAgent=Googlebot/2.1
	});
});
