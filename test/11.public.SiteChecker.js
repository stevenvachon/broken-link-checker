import * as messages from "../lib/internal/messages";
import {after, before, describe, it} from "mocha";
import {END_EVENT, ERROR_EVENT, HTML_EVENT, JUNK_EVENT, LINK_EVENT, PAGE_EVENT, ROBOTS_EVENT, SITE_EVENT} from "../lib/internal/events";
import {expect} from "chai";
import {ExpectedError, rawOptions, startServers, stopServers, WrongCallError} from "./helpers";
import {parse as parseAuth} from "basic-auth";
import SiteChecker from "../lib/public/SiteChecker";



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
describe("PUBLIC -- SiteChecker", () =>
{
	before(() => startServers("http://blc1/", "http://blc2/"));  // second server for external redirects
	after(stopServers);



	it("does not require options", () =>
	{
		expect(() => new SiteChecker()).not.to.throw();
	});



	describe("enqueue()", () =>
	{
		it("accepts a valid url", () =>
		{
			const id = new SiteChecker(rawOptions()).enqueue("http://blc1/");

			expect(id).to.be.a("number");
		});



		it("rejects an invalid url", () =>
		{
			expect(() => new SiteChecker(rawOptions()).enqueue("/path/")).to.throw(TypeError);
		});
	});



	describe("events", () =>
	{
		it(HTML_EVENT, done =>
		{
			let count = 0;

			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(HTML_EVENT, (tree, robots, response, pageUrl, customData, ...remainingArgs) =>
			{
				// If HTML has more than one link/page, so only accept the first
				// to avoid calling `done()` more than once
				if (++count === 1)
				{
					expect(remainingArgs).to.be.empty;
					expect(tree).to.be.an("object");
					expect(response).to.be.an("object");
					expect(pageUrl).to.be.an.instanceOf(Object);
					expect(customData).to.be.a("number");
					done();
				}
			})
			.enqueue("http://blc1/normal/index.html", 123);
		});



		it(`${HTML_EVENT} + ${ERROR_EVENT}`, done =>
		{
			let count = 0;

			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, (error, ...remainingArgs) =>
			{
				// If HTML has more than one link/page, so only accept the first
				// to avoid calling `done()` more than once
				if (++count === 1)
				{
					expect(remainingArgs).to.be.empty;
					expect(error).to.be.an("error");
					done();
				}
			})
			.on(HTML_EVENT, () =>
			{
				throw new ExpectedError();
			})
			.enqueue("http://blc1/normal/index.html");
		});



		it(LINK_EVENT, done =>
		{
			let count = 0;

			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (result, customData, ...remainingArgs) =>
			{
				// If HTML has more than one link, only accept the first
				// to avoid calling `done()` more than once
				if (++count === 1)
				{
					expect(remainingArgs).to.be.empty;
					expect(result).to.be.an("object");
					expect(customData).to.be.a("number");
					done();
				}
			})
			.enqueue("http://blc1/normal/index.html", 123);
		});



		it(`${LINK_EVENT} + ${ERROR_EVENT}`, done =>
		{
			let count = 0;

			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, (error, ...remainingArgs) =>
			{
				// If HTML has more than one link, so only accept the first
				// to avoid calling `done()` more than once
				if (++count === 1)
				{
					expect(remainingArgs).to.be.empty;
					expect(error).to.be.an("error");
					done();
				}
			})
			.on(LINK_EVENT, () =>
			{
				throw new ExpectedError();
			})
			.enqueue("http://blc1/normal/index.html");
		});



		it(PAGE_EVENT, done =>
		{
			let count = 0;

			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(PAGE_EVENT, (error, pageUrl, customData, ...remainingArgs) =>
			{
				// If site has more than one page, only accept the first
				// to avoid calling `done()` more than once
				if (++count === 1)
				{
					expect(remainingArgs).to.be.empty;
					expect(error).to.be.null;
					expect(pageUrl).to.be.an.instanceOf(Object);
					expect(customData).to.be.a("number");
					done();
				}
			})
			.enqueue("http://blc1/normal/index.html", 123);
		});



		it(`${PAGE_EVENT} + ${ERROR_EVENT}`, done =>
		{
			let count = 0;

			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, (error, ...remainingArgs) =>
			{
				// If HTML has more than one page, so only accept the first
				// to avoid calling `done()` more than once
				if (++count === 1)
				{
					expect(remainingArgs).to.be.empty;
					expect(error).to.be.an("error");
					done();
				}
			})
			.on(PAGE_EVENT, () =>
			{
				throw new ExpectedError();
			})
			.enqueue("http://blc1/normal/index.html");
		});



		it(SITE_EVENT, done =>
		{
			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(SITE_EVENT, (error, siteUrl, customData, ...remainingArgs) =>
			{
				expect(remainingArgs).to.be.empty;
				expect(error).to.be.null;
				expect(siteUrl).to.be.an.instanceOf(Object);
				expect(customData).to.be.a("number");
				done();
			})
			.enqueue("http://blc1/normal/index.html", 123);
		});



		it(`${SITE_EVENT} + ${ERROR_EVENT}`, done =>
		{
			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, (error, ...remainingArgs) =>
			{
				expect(remainingArgs).to.be.empty;
				expect(error).to.be.an("error");
				done();
			})
			.on(SITE_EVENT, () =>
			{
				throw new ExpectedError();
			})
			.enqueue("http://blc1/normal/index.html");
		});



		it(END_EVENT, done =>
		{
			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(END_EVENT, (...args) =>
			{
				expect(args).to.be.empty;
				done();
			})
			.enqueue("http://blc1/normal/index.html");
		});



		it(`${END_EVENT} + ${ERROR_EVENT}`, done =>
		{
			new SiteChecker(rawOptions())
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
			.enqueue("http://blc1/normal/index.html");
		});
	});



	describe("clearCache()", () =>
	{
		it("works", done =>
		{
			const options = rawOptions({ cacheResponses:true });
			let endWasDispatched = false;
			let linkWasDispatched = false;

			const instance = new SiteChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, result =>
			{
				expect(result.http.cached).to.be.false;
				linkWasDispatched = true;
			})
			.on(PAGE_EVENT, () =>
			{
				expect( instance.clearCache() ).to.equal(instance);
			})
			.on(END_EVENT, () =>
			{
				if (endWasDispatched)
				{
					expect(linkWasDispatched).to.be.true;
					done();
				}
				else
				{
					instance.enqueue("http://blc1/normal/index.html");
					endWasDispatched = true;
				}
			});

			instance.enqueue("http://blc1/normal/index.html");
		});
	});



	describe("numActiveLinks", () =>
	{
		it("works", done =>
		{
			let htmlWasDispatched = false;

			const instance = new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(HTML_EVENT, () =>
			{
				// Skip recursive checks
				if (!htmlWasDispatched)
				{
					// Give time for link checks to start
					setImmediate(() =>
					{
						expect( instance.numActiveLinks ).to.equal(2);
						htmlWasDispatched = true;
					});
				}
			})
			.on(END_EVENT, () =>
			{
				expect(htmlWasDispatched).to.be.true;
				expect( instance.numActiveLinks ).to.equal(0);
				done();
			});

			instance.enqueue("http://blc1/normal/index.html");

			expect( instance.numActiveLinks ).to.equal(0);
		});
	});



	describe("pause() / resume() / isPaused", () =>
	{
		it("works", done =>
		{
			let resumed = false;

			const instance = new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(END_EVENT, () =>
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
	describe("dequeue() / numSites / numPages / numQueuedLinks", () =>
	{
		it("accepts a valid id", done =>
		{
			const instance = new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(HTML_EVENT, () =>
			{
				expect( instance.numSites ).to.equal(1);
				expect( instance.numPages ).to.equal(1);
				expect( instance.numQueuedLinks ).to.equal(2);
			})
			.on(END_EVENT, () =>
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



		it("rejects an invalid id", () =>
		{
			const instance = new SiteChecker(rawOptions());

			// Prevent first queued item from immediately starting (and thus being auto-dequeued)
			instance.pause();

			const id = instance.enqueue("http://blc1/");

			expect( instance.dequeue(id+1) ).to.be.false;
			expect( instance.numSites ).to.equal(1);
		});
	});



	describe("edge cases", () =>
	{
		it("supports custom data", done =>
		{
			let linkWasDispatched = false;
			let pageWasDispatched = false;
			let siteWasDispatched = false;

			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (result, customData) =>
			{
				expect(customData).to.be.an("object");
				expect(customData.test).to.equal("value");
				linkWasDispatched = true;
			})
			.on(PAGE_EVENT, (error, pageUrl, customData) =>
			{
				expect(customData).to.be.an("object");
				expect(customData.test).to.equal("value");
				pageWasDispatched = true;
			})
			.on(SITE_EVENT, (error, siteUrl, customData) =>
			{
				expect(customData).to.be.an("object");
				expect(customData.test).to.equal("value");
				siteWasDispatched = true;
			})
			.on(END_EVENT, () =>
			{
				expect(linkWasDispatched).to.be.true;
				expect(pageWasDispatched).to.be.true;
				expect(siteWasDispatched).to.be.true;
				done();
			})
			.enqueue("http://blc1/normal/index.html", {test:"value"});
		});



		it("supports multiple queue items", done =>
		{
			const results = [];
			let pageIndex = 0;

			const instance = new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (result, customData) =>
			{
				maybeAddContainers(results, pageIndex, customData.siteIndex);

				results[ customData.siteIndex ][pageIndex][ result.html.index ] = result;
			})
			.on(PAGE_EVENT, (error, pageUrl, customData) =>
			{
				expect(error).to.be.null;

				// If first page didn't load
				// If first page did load but had no links
				maybeAddContainers(results, pageIndex, customData.siteIndex);

				pageIndex++;
			})
			.on(SITE_EVENT, error =>
			{
				expect(error).to.be.null;

				pageIndex = 0;
			})
			.on(END_EVENT, () =>
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



		it("supports html with no links", done =>
		{
			let linkCount = 0;
			let pageWasDispatched = false;
			let siteWasDispatched = false;

			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, () => linkCount++)
			.on(PAGE_EVENT, () => pageWasDispatched = true)
			.on(SITE_EVENT, () => siteWasDispatched = true)
			.on(END_EVENT, () =>
			{
				expect(pageWasDispatched).to.be.true;
				expect(siteWasDispatched).to.be.true;
				expect(linkCount).to.equal(0);
				done();
			})
			.enqueue("http://blc1/normal/no-links.html");
		});



		it("supports pages after html with no links", done =>
		{
			let linkCount = 0;
			let pageCount = 0;
			let siteCount = 0;

			const instance = new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, () => linkCount++)
			.on(PAGE_EVENT, () => pageCount++)
			.on(SITE_EVENT, () => siteCount++)
			.on(END_EVENT, () =>
			{
				expect(linkCount).to.equal(4);
				expect(pageCount).to.equal(4);  // no-links.html is checked twice because they're part of two different site queue items
				expect(siteCount).to.equal(2);
				done();
			});

			instance.enqueue("http://blc1/normal/no-links.html");
			instance.enqueue("http://blc1/normal/index.html");
		});



		it("reports a page+site error when first page's html cannot be retrieved", done =>
		{
			let pageWasDispatched = false;
			let siteWasDispatched = false;

			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(PAGE_EVENT, (error, pageUrl) =>
			{
				expect(error).to.be.an("error");
				expect(error.message).to.equal( messages.errors.HTML_RETRIEVAL );
				expect(pageUrl).to.be.an.instanceOf(Object);
				pageWasDispatched = true;
			})
			.on(SITE_EVENT, (error, siteUrl) =>
			{
				expect(error).to.be.an("error");
				expect(error.message).to.equal( messages.errors.HTML_RETRIEVAL );
				expect(siteUrl).to.be.an.instanceOf(Object);
				siteWasDispatched = true;
			})
			.on(END_EVENT, () =>
			{
				expect(pageWasDispatched).to.be.true;
				expect(siteWasDispatched).to.be.true;
				done();
			})
			.enqueue("http://blc1/normal/fake.html");
		});



		it("does not report site error when non-first page's html cannot be retrieved", done =>
		{
			let pageCount = 0;

			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(PAGE_EVENT, error =>
			{
				if (++pageCount < 3)
				{
					expect(error).not.to.be.an("error");
				}
				else
				{
					expect(error).to.be.an("error");
				}
			})
			.on(SITE_EVENT, error =>
			{
				expect(error).not.to.be.an("error");
			})
			.on(END_EVENT, () =>
			{
				done();
			})
			.enqueue("http://blc1/normal/with-links.html");
		});



		it("supports sites after first page's html could not be retrieved", done =>
		{
			let pageCount = 0;
			let siteCount = 0;

			const instance = new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(PAGE_EVENT, error =>
			{
				if (++pageCount === 1)
				{
					expect(error).to.be.an("error");
				}
				else
				{
					expect(error).not.to.be.an("error");
				}
			})
			.on(SITE_EVENT, error =>
			{
				if (++siteCount === 1)
				{
					expect(error).to.be.an("error");
				}
				else
				{
					expect(error).not.to.be.an("error");
				}
			})
			.on(END_EVENT, () =>
			{
				expect(pageCount).to.equal(2);
				expect(siteCount).to.equal(2);
				done();
			});

			instance.enqueue("http://blc1/normal/fake.html");
			instance.enqueue("http://blc1/normal/no-links.html");
		});



		it("does not check a page that has already been checked", done =>
		{
			let pageCount = 0;

			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(PAGE_EVENT, () => pageCount++)
			.on(END_EVENT, () =>
			{
				expect(pageCount).to.equal(3);
				done();
			})
			.enqueue("http://blc1/circular/index.html");
		});



		it("does not check a page that redirects to a page that has already been checked", done =>
		{
			let pageCount = 0;

			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(PAGE_EVENT, () => pageCount++)
			.on(END_EVENT, () =>
			{
				expect(pageCount).to.equal(2);
				done();
			})
			.enqueue("http://blc1/redirect/index.html");
		});



		it("does not check a page that redirects to a page that has already been checked (#2)", done =>
		{
			let pageCount = 0;

			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(PAGE_EVENT, () => pageCount++)
			.on(END_EVENT, () =>
			{
				expect(pageCount).to.equal(1);
				done();
			})
			.enqueue("http://blc1/circular-redirect/redirect.html");
		});



		it("does not check a non-first page that redirects to another site", done =>
		{
			let linkCount = 0;
			let pageCount = 0;

			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, result =>
			{
				expect(result.broken).to.be.false;
				linkCount++;
			})
			.on(PAGE_EVENT, () => pageCount++)
			.on(END_EVENT, () =>
			{
				expect(linkCount).to.equal(1);
				expect(pageCount).to.equal(1);
				done();
			})
			.enqueue("http://blc1/external-redirect/index.html");
		});



		it("checks a first page that redirects to another site", done =>
		{
			let pageCount = 0;

			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(PAGE_EVENT, error =>
			{
				expect(error).not.to.be.an("error");
				pageCount++;
			})
			.on(END_EVENT, () =>
			{
				expect(pageCount).to.equal(1);
				done();
			})
			.enqueue("http://blc1/external-redirect/redirect.html");
		});



		// More info: https://bugs.chromium.org/p/chromium/issues/detail?id=123150
		it("supports pages behind basic auth", done =>
		{
			const options = rawOptions({ maxSockets:1 });
			let linkCount = 0;
			let pageCount = 0;

			new SiteChecker(options)
			.on(LINK_EVENT, result =>
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
			.on(PAGE_EVENT, error =>
			{
				expect(error).not.to.be.an("error");
				pageCount++;
			})
			.on(END_EVENT, () =>
			{
				expect(linkCount).to.equal(9);
				expect(pageCount).to.equal(3);
				done();
			})
			.on(ERROR_EVENT, error => done(error))
			.enqueue("http://user:pass@blc1/auth/index.html");
		});



		// TODO :: does not check a non-first page that redirects to another site when options.excludeInternalLinks=true
	});



	describe("options", () =>
	{
		it("customFilter = () => {…}", done =>
		{
			const junkResults = [];
			const options = rawOptions({ customFilter: result => result.html.text !== "link-fake" });
			const results = [];
			let page = 0;

			new SiteChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(HTML_EVENT, () => page++)
			.on(JUNK_EVENT, result =>
			{
				if (page === 1)
				{
					junkResults[result.html.offsetIndex] = result;
				}
			})
			.on(LINK_EVENT, result =>
			{
				if (page === 1)
				{
					results[result.html.offsetIndex] = result;
				}
			})
			.on(END_EVENT, () =>
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



		it("honorRobotExclusions = false (robots.txt)", done =>
		{
			const results = [];

			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(ROBOTS_EVENT, () => done(new WrongCallError()))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, result => results.push(result))
			.on(END_EVENT, () =>
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



		// TODO :: remove custom data when separated ROBOTS_EVENT test is created
		it("honorRobotExclusions = true (robots.txt)", done =>
		{
			const junkResults = [];
			const options = rawOptions({ honorRobotExclusions:true });
			let robotsWasDispatched = true;

			new SiteChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(ROBOTS_EVENT, (robots, customData) =>
			{
				expect(robots).to.be.an("object");
				expect(customData).to.be.a("number");
				robotsWasDispatched = true;
			})
			.on(JUNK_EVENT, result => junkResults.push(result))
			.on(LINK_EVENT, () => done(new WrongCallError()))
			.on(END_EVENT, () =>
			{
				expect(robotsWasDispatched).to.be.true;
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



		it("honorRobotExclusions = false (rel + meta + header + robots.txt)", done =>
		{
			const results = [];
			let pageIndex = 0;

			new SiteChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(ROBOTS_EVENT, () => done(new WrongCallError()))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, result =>
			{
				maybeAddContainers(results, pageIndex);

				results[pageIndex][ result.html.index ] = result;
			})
			.on(PAGE_EVENT, error =>
			{
				expect(error).to.be.null;

				// If first page didn't load
				// If first page did load but had no links
				maybeAddContainers(results, pageIndex);

				pageIndex++;
			})
			.on(END_EVENT, () =>
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



		it("honorRobotExclusions = true (rel + meta + header + robots.txt)", done =>
		{
			const options = rawOptions({ honorRobotExclusions:true });
			const results = [];
			let pageIndex = 0;

			new SiteChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, result =>
			{
				maybeAddContainers(results, pageIndex);

				results[pageIndex][ result.html.index ] = result;
			})
			.on(LINK_EVENT, result =>
			{
				maybeAddContainers(results, pageIndex);

				results[pageIndex][ result.html.index ] = result;
			})
			.on(PAGE_EVENT, error =>
			{
				expect(error).to.be.null;

				// If first page didn't load
				// If first page did load but had no links
				maybeAddContainers(results, pageIndex);

				pageIndex++;
			})
			.on(END_EVENT, () =>
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
