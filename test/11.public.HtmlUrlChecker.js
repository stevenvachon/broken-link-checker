/* eslint-disable sort-keys */
import {after, before, describe, it} from "mocha";
import {END_EVENT, ERROR_EVENT, HTML_EVENT, JUNK_EVENT, LINK_EVENT, PAGE_EVENT} from "../lib/internal/events";
import {expect} from "chai";
import {ExpectedError, rawOptions, simplifyLinks, startServer, stopServers, WrongCallError} from "./helpers";
import {HTMLRetrievalError} from "../lib/internal/errors";
import HtmlUrlChecker from "../lib/public/HtmlUrlChecker";
import Link, {HTML_INDEX, HTML_OFFSET_INDEX, HTTP_RESPONSE, HTTP_RESPONSE_WAS_CACHED, IS_BROKEN, REBASED_URL} from "../lib/internal/Link";
import {parse as parseAuth} from "basic-auth";



describe("PUBLIC -- HtmlUrlChecker", () =>
{
	before(() => startServer("http://blc1/", "http://blc2/"));  // second server for external redirects
	after(stopServers);



	it("does not require options", () =>
	{
		expect(() => new HtmlUrlChecker()).not.to.throw();
	});



	describe("enqueue()", () =>
	{
		it("accepts a valid url", () =>
		{
			const id = new HtmlUrlChecker(rawOptions()).enqueue(new URL("http://blc1/"));

			expect(id).to.be.a("number");
		});



		it("rejects an invalid url", () =>
		{
			expect(() => new HtmlUrlChecker(rawOptions()).enqueue("http://blc1/")).to.throw(TypeError);
		});
	});



	describe("events", () =>
	{
		it(HTML_EVENT, done =>
		{
			new HtmlUrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(HTML_EVENT, (tree, robots, response, pageURL, customData, ...remainingArgs) =>
			{
				expect(remainingArgs).to.be.empty;
				expect(tree).to.be.an("object");
				expect(robots).to.be.an("object");
				expect(response).to.be.an("object");
				expect(pageURL).to.be.a("url");
				expect(customData).to.be.a("number");
				done();
			})
			.enqueue(new URL("http://blc1/simple/index.html"), 123);
		});



		it(LINK_EVENT, done =>
		{
			let count = 0;

			new HtmlUrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (link, customData, ...remainingArgs) =>
			{
				// If HTML has more than one link, only accept the first
				// to avoid calling `done()` more than once
				if (++count === 1)
				{
					expect(remainingArgs).to.be.empty;
					expect(link).to.be.an.instanceOf(Link);
					expect(customData).to.be.a("number");
					done();
				}
			})
			.enqueue(new URL("http://blc1/simple/index.html"), 123);
		});



		it(PAGE_EVENT, done =>
		{
			new HtmlUrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(PAGE_EVENT, (error, pageURL, customData, ...remainingArgs) =>
			{
				expect(remainingArgs).to.be.empty;
				expect(error).to.be.null;
				expect(pageURL).to.be.a("url");
				expect(customData).to.be.a("number");
				done();
			})
			.enqueue(new URL("http://blc1/simple/index.html"), 123);
		});



		it(END_EVENT, done =>
		{
			new HtmlUrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(END_EVENT, (...args) =>
			{
				expect(args).to.be.empty;
				done();
			})
			.enqueue(new URL("http://blc1/simple/index.html"));
		});



		it(ERROR_EVENT, done =>
		{
			let errorCount = 0;

			new HtmlUrlChecker(rawOptions())
			.on(ERROR_EVENT, (error, ...remainingArgs) =>
			{
				expect(remainingArgs).to.be.empty;
				expect(error).to.be.an("error");

				if (++errorCount === 4)
				{
					done();
				}
			})
			.on(HTML_EVENT, () =>
			{
				throw new ExpectedError();
			})
			.on(LINK_EVENT, () =>
			{
				throw new ExpectedError();
			})
			.on(PAGE_EVENT, () =>
			{
				throw new ExpectedError();
			})
			.on(END_EVENT, () =>
			{
				throw new ExpectedError();
			})
			.enqueue(new URL("http://blc1/simple/index.html"));
		});
	});



	describe("clearCache()", () =>
	{
		it("works", done =>
		{
			const options = rawOptions({ cacheResponses:true });
			let endWasDispatched = false;
			let linkWasDispatched = false;

			const instance = new HtmlUrlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, link =>
			{
				expect(link.get(HTTP_RESPONSE_WAS_CACHED)).to.be.false;
				linkWasDispatched = true;
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
					expect( instance.clearCache() ).to.equal(instance);

					instance.enqueue(new URL("http://blc1/simple/index.html"));
					endWasDispatched = true;
				}
			});

			instance.enqueue(new URL("http://blc1/simple/index.html"));
		});
	});



	describe("numActiveLinks", () =>
	{
		it("works", done =>
		{
			let htmlWasDispatched = false;

			const instance = new HtmlUrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(HTML_EVENT, () =>
			{
				// Give time for link checks to start
				setImmediate(() =>
				{
					expect( instance.numActiveLinks ).to.equal(2);
					htmlWasDispatched = true;
				});
			})
			.on(END_EVENT, () =>
			{
				expect(htmlWasDispatched).to.be.true;
				expect( instance.numActiveLinks ).to.equal(0);
				done();
			});

			instance.enqueue(new URL("http://blc1/simple/index.html"));

			expect( instance.numActiveLinks ).to.equal(0);
		});
	});



	describe("pause() / resume() / isPaused", () =>
	{
		it("works", done =>
		{
			let resumed = false;

			const instance = new HtmlUrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(END_EVENT, () =>
			{
				expect(resumed).to.be.true;
				done();
			});

			expect( instance.pause() ).to.equal(instance);
			expect(instance.isPaused).to.be.true;

			instance.enqueue(new URL("http://blc1/"));

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
	describe("dequeue() / has() / numPages / numQueuedLinks", () =>
	{
		it("accepts a valid id", done =>
		{
			const instance = new HtmlUrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(HTML_EVENT, () =>
			{
				expect( instance.numPages ).to.equal(1);
				expect( instance.numQueuedLinks ).to.equal(2);
			})
			.on(END_EVENT, () =>
			{
				expect( instance.numPages ).to.equal(0);
				expect( instance.numQueuedLinks ).to.equal(0);
				done();
			});

			// Prevent first queued item from immediately starting (and thus being auto-dequeued)
			instance.pause();

			const url = new URL("http://blc1/simple/index.html");
			const id = instance.enqueue(url);

			expect( instance.has(id) ).to.be.true;
			expect( instance.numPages ).to.equal(1);
			expect( instance.numQueuedLinks ).to.equal(0);
			expect( instance.dequeue(id) ).to.be.true;
			expect( instance.has(id) ).to.be.false;
			expect( instance.numPages ).to.equal(0);
			expect( instance.numQueuedLinks ).to.equal(0);

			instance.enqueue(url);
			instance.resume();
		});



		it("rejects an invalid id", () =>
		{
			const instance = new HtmlUrlChecker(rawOptions());

			// Prevent first queued item from immediately starting (and thus being auto-dequeued)
			instance.pause();

			const id = instance.enqueue(new URL("http://blc1/"));

			expect( instance.dequeue(id+1) ).to.be.false;
			expect( instance.numPages ).to.equal(1);
		});
	});



	describe("edge cases", () =>
	{
		it("supports custom data", done =>
		{
			let linkWasDispatched = false;
			let pageWasDispatched = false;

			new HtmlUrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (link, customData) =>
			{
				expect(customData).to.be.an("object");
				expect(customData.test).to.equal("value");
				linkWasDispatched = true;
			})
			.on(PAGE_EVENT, (error, pageURL, customData) =>
			{
				expect(customData).to.be.an("object");
				expect(customData.test).to.equal("value");
				pageWasDispatched = true;
			})
			.on(END_EVENT, () =>
			{
				expect(linkWasDispatched).to.be.true;
				expect(pageWasDispatched).to.be.true;
				done();
			})
			.enqueue(new URL("http://blc1/simple/index.html"), {test:"value"});
		});



		it("supports multiple queue items", done =>
		{
			const results = [];

			const instance = new HtmlUrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (link, customData) =>
			{
				if (results[ customData.index ] === undefined)
				{
					results[ customData.index ] = [];
				}

				results[ customData.index ][ link.get(HTML_INDEX) ] = link;
			})
			.on(END_EVENT, () =>
			{
				expect(results).to.have.length(2);

				expect(results[0]).to.have.length(2);
				expect(results[0][0].get(IS_BROKEN)).to.be.false;  // with-links.html
				expect(results[0][1].get(IS_BROKEN)).to.be.true;   // 404.html

				expect(results[1]).to.have.length(2);
				expect(results[1][0].get(IS_BROKEN)).to.be.false;  // with-links.html
				expect(results[1][1].get(IS_BROKEN)).to.be.true;   // 404.html

				done();
			});

			const url = new URL("http://blc1/simple/index.html");

			instance.enqueue(url, {index:0});
			instance.enqueue(url, {index:1});
		});



		it("supports html with no links", done =>
		{
			let linkCount = 0;
			let pageWasDispatched = false;

			new HtmlUrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, () => linkCount++)
			.on(PAGE_EVENT, () => pageWasDispatched = true)
			.on(END_EVENT, () =>
			{
				expect(pageWasDispatched).to.be.true;
				expect(linkCount).to.equal(0);
				done();
			})
			.enqueue(new URL("http://blc1/simple/no-links.html"));
		});



		it("supports pages after html with no links", done =>
		{
			let linkCount = 0;
			let pageCount = 0;

			const instance = new HtmlUrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, () => linkCount++)
			.on(PAGE_EVENT, () => pageCount++)
			.on(END_EVENT, () =>
			{
				expect(linkCount).to.equal(2);
				expect(pageCount).to.equal(2);
				done();
			});

			instance.enqueue(new URL("http://blc1/simple/no-links.html"));
			instance.enqueue(new URL("http://blc1/simple/index.html"));
		});



		it("reports an error when html cannot be retrieved", done =>
		{
			let pageWasDispatched = false;

			new HtmlUrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(PAGE_EVENT, (error, pageURL) =>
			{
				expect(error).to.be.an.instanceOf(HTMLRetrievalError);
				expect(pageURL).to.be.a("url");
				pageWasDispatched = true;
			})
			.on(END_EVENT, () =>
			{
				expect(pageWasDispatched).to.be.true;
				done();
			})
			.enqueue(new URL("http://blc1/simple/404.html"));
		});



		it("supports pages after html could not be retrieved", done =>
		{
			let pageCount = 0;

			const instance = new HtmlUrlChecker(rawOptions())
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
			.on(END_EVENT, () =>
			{
				expect(pageCount).to.equal(2);
				done();
			});

			instance.enqueue(new URL("http://blc1/simple/404.html"));
			instance.enqueue(new URL("http://blc1/simple/no-links.html"));
		});



		it("supports pages compressed with deflate", done =>
		{
			let pageWasDispatched = false;

			const instance = new HtmlUrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(PAGE_EVENT, error =>
			{
				expect(error).not.to.be.an("error");
				pageWasDispatched = true;
			})
			.on(END_EVENT, () =>
			{
				expect(pageWasDispatched).to.be.true;
				done();
			});

			instance.enqueue(new URL("http://blc1/compression/deflate.html"));
		});



		it("supports pages compressed with gzip", done =>
		{
			let pageWasDispatched = false;

			const instance = new HtmlUrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(PAGE_EVENT, error =>
			{
				expect(error).not.to.be.an("error");
				pageWasDispatched = true;
			})
			.on(END_EVENT, () =>
			{
				expect(pageWasDispatched).to.be.true;
				done();
			});

			instance.enqueue(new URL("http://blc1/compression/gzip.html"));
		});



		// More info: https://bugs.chromium.org/p/chromium/issues/detail?id=123150
		// @todo check page with absolute urls containing no auth so that URL is re-checked with cached auth (if any) after 401 (unauthorized) -- this requires caching request data
		it("supports pages behind basic auth", done =>
		{
			let linkCount = 0;
			let pageWasDispatched = false;

			new HtmlUrlChecker(rawOptions())
			.on(LINK_EVENT, link =>
			{
				switch (link.get(HTML_OFFSET_INDEX))
				{
					case 0:
					case 1:
					{
						expect(link.get(IS_BROKEN)).to.be.false;
						expect(link.get(REBASED_URL).password).to.be.empty;
						expect(link.get(REBASED_URL).username).to.be.empty;
						expect( parseAuth(link.get(HTTP_RESPONSE).headers.authorization) ).to.deep.equal({ name:"user", pass:"pass" });
						break;
					}
					case 2:
					{
						expect(link.get(IS_BROKEN)).to.be.false;
						expect(link.get(REBASED_URL).password).to.equal("pass2");
						expect(link.get(REBASED_URL).username).to.equal("user2");
						expect( parseAuth(link.get(HTTP_RESPONSE).headers.authorization) ).to.deep.equal({ name:"user2", pass:"pass2" });
						break;
					}
					case 3:
					{
						expect(link.get(IS_BROKEN)).to.be.true;
						expect(link.get(REBASED_URL).password).to.equal("pass3");
						expect(link.get(REBASED_URL).username).to.equal("user3");
						expect(link.get(HTTP_RESPONSE).headers.authorization).to.be.undefined;
						expect(link.get(HTTP_RESPONSE).status).to.equal(401);
						break;
					}
					case 4:
					{
						expect(link.get(IS_BROKEN)).to.be.false;
						expect(link.get(REBASED_URL).password).to.be.empty;
						expect(link.get(REBASED_URL).username).to.be.empty;
						expect( parseAuth(link.get(HTTP_RESPONSE).headers.authorization) ).to.deep.equal({ name:"user", pass:"pass" });
						break;
					}
					case 5:
					{
						expect(link.get(IS_BROKEN)).to.be.false;
						expect(link.get(REBASED_URL).password).to.be.empty;
						expect(link.get(REBASED_URL).username).to.be.empty;
						//expect( parseAuth(link.get(HTTP_RESPONSE).headers.authorization) ).to.deep.equal({ name:"user", pass:"pass" });  // @todo https://github.com/joepie91/node-bhttp/issues/35
						break;
					}
					case 6:
					{
						expect(link.get(IS_BROKEN)).to.be.true;
						expect(link.get(REBASED_URL).password).to.be.empty;
						expect(link.get(REBASED_URL).username).to.be.empty;
						expect(link.get(HTTP_RESPONSE).headers.authorization).to.be.undefined;
						expect(link.get(HTTP_RESPONSE).status).to.equal(404);
						break;
					}
					case 7:
					{
						expect(link.get(IS_BROKEN)).to.be.true;
						expect(link.get(REBASED_URL).password).to.equal("pass2");
						expect(link.get(REBASED_URL).username).to.equal("user2");
						expect(link.get(HTTP_RESPONSE).headers.authorization).to.be.undefined;
						expect(link.get(HTTP_RESPONSE).status).to.equal(404);
						break;
					}
				}

				linkCount++;
			})
			.on(PAGE_EVENT, error =>
			{
				expect(error).not.to.be.an("error");
				pageWasDispatched = true;
			})
			.on(END_EVENT, () =>
			{
				expect(linkCount).to.equal(8);
				expect(pageWasDispatched).to.be.true;
				done();
			})
			.on(ERROR_EVENT, error => done(error))
			.enqueue(new URL("http://user:pass@blc1/auth/index.html"));
		});
	});



	describe("options", () =>
	{
		it("honorRobotExclusions = false (header)", done =>
		{
			const results = [];

			new HtmlUrlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, link => results.push(link))
			.on(END_EVENT, () =>
			{
				expect(simplifyLinks(results))
					.to.have.length(1)
					.property(0).to.deep.include(
					{
						isBroken: false,
						wasExcluded: false,
						excludedReason: null
					});

				done();
			})
			.enqueue(new URL("http://blc1/disallowed/header.html"));
		});



		// Note: header+meta+rel is tested in `SiteChecker` suite
		it("honorRobotExclusions = true (header)", done =>
		{
			const junkResults = [];
			const options = rawOptions({ honorRobotExclusions:true });

			new HtmlUrlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, link => junkResults.push(link))
			.on(LINK_EVENT, () => done(new WrongCallError()))
			.on(END_EVENT, () =>
			{
				expect(simplifyLinks(junkResults))
					.to.have.length(1)
					.property(0).to.deep.include(
					{
						isBroken: null,
						wasExcluded: true,
						excludedReason: "BLC_ROBOTS"
					});

				done();
			})
			.enqueue(new URL("http://blc1/disallowed/header.html"));
		});



		// @todo honorRobotExcluses=true (header) + userAgent=Googlebot/2.1
	});
});
