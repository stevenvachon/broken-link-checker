/* eslint-disable sort-keys */
import {after, before, describe, it} from "mocha";
import {COMPLETE_EVENT, ERROR_EVENT, HTML_EVENT, JUNK_EVENT, LINK_EVENT} from "../lib/internal/events";
import {expect} from "chai";
import {ExpectedError, fixtureStream, fixtureString, rawOptions, startServers, stopServers, tagsString, WrongCallError} from "./helpers";
import HtmlChecker from "../lib/public/HtmlChecker";

const allTagsString = tagsString(3, false, "http://blc1/");
const allTagsString_frameset = tagsString(3, true, "http://blc1/");
const baseUrl = "http://blc1/normal/index.html";
const commonHtmlString = fixtureString("/normal/index.html");

const commonHtmlStream = () => fixtureStream("/normal/index.html");



describe("PUBLIC -- HtmlChecker", () =>
{
	before(() => startServers("http://blc1/", "http://blc2/"));
	after(stopServers);



	it("does not require options", () =>
	{
		expect(() => new HtmlChecker()).not.to.throw();
	});



	describe("scan()", () =>
	{
		it("returns a Promise from a string", () =>
		{
			const returnedValue = new HtmlChecker(rawOptions()).scan(commonHtmlString, baseUrl);

			expect(returnedValue).to.be.a("promise");
		});



		it("returns a Promise from a Stream", () =>
		{
			const returnedValue = new HtmlChecker(rawOptions()).scan(commonHtmlStream(), baseUrl);

			expect(returnedValue).to.be.a("promise");
		});



		it("throws if not ready", async () =>
		{
			const instance = new HtmlChecker(rawOptions());
			let errorWasThrown;

			try
			{
				await Promise.all(
				[
					instance.scan(commonHtmlString, baseUrl),
					instance.scan(commonHtmlString, baseUrl)
				]);
			}
			catch (error)
			{
				expect(error).to.be.an("error");
				errorWasThrown = true;
			}
			finally
			{
				expect(errorWasThrown).to.be.true;
			}
		});
	});



	describe("events", () =>
	{
		it(HTML_EVENT, done =>
		{
			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(HTML_EVENT, (tree, robots, ...remainingArgs) =>
			{
				expect(remainingArgs).to.be.empty;
				expect(tree).to.be.an("object");
				expect(robots).to.be.an("object");
				done();
			})
			.scan(commonHtmlString, baseUrl);
		});



		it(`${HTML_EVENT} + ${ERROR_EVENT}`, done =>
		{
			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, (error, ...remainingArgs) =>
			{
				expect(remainingArgs).to.be.empty;
				expect(error).to.be.an("error");
				done();
			})
			.on(HTML_EVENT, () =>
			{
				throw new ExpectedError();
			})
			.scan(commonHtmlString, baseUrl);
		});



		it(LINK_EVENT, done =>
		{
			let count = 0;

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (result, ...remainingArgs) =>
			{
				// If HTML has more than one link, only accept the first
				// to avoid calling `done()` more than once
				if (++count === 1)
				{
					expect(remainingArgs).to.be.empty;
					expect(result).to.be.an("object");
					done();
				}
			})
			.scan(commonHtmlString, baseUrl);
		});



		it(`${LINK_EVENT} + ${ERROR_EVENT}`, done =>
		{
			let count = 0;

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, (error, ...remainingArgs) =>
			{
				// If HTML has more than one link, only accept the first
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
			.scan(commonHtmlString, baseUrl);
		});



		it(COMPLETE_EVENT, done =>
		{
			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(COMPLETE_EVENT, (...args) =>
			{
				expect(args).to.be.empty;
				done();
			})
			.scan(commonHtmlString, baseUrl);
		});



		it(`${COMPLETE_EVENT} + ${ERROR_EVENT}`, done =>
		{
			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, (error, ...remainingArgs) =>
			{
				expect(remainingArgs).to.be.empty;
				expect(error).to.be.an("error");
				done();
			})
			.on(COMPLETE_EVENT, () =>
			{
				throw new ExpectedError();
			})
			.scan(commonHtmlString, baseUrl);
		});
	});



	describe("clearCache()", () =>
	{
		it("works", done =>
		{
			const options = rawOptions({ cacheResponses:true });
			let endWasDispatched = false;
			let linkWasDispatched = false;

			const instance = new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, result =>
			{
				expect(result.http.cached).to.be.false;
				linkWasDispatched = true;
			})
			.on(COMPLETE_EVENT, () =>
			{
				if (endWasDispatched)
				{
					expect(linkWasDispatched).to.be.true;
					done();
				}
				else
				{
					expect( instance.clearCache() ).to.equal(instance);

					instance.scan(commonHtmlString, baseUrl);
					endWasDispatched = true;
				}
			});

			instance.scan(commonHtmlString, baseUrl);
		});
	});



	describe("numActiveLinks", () =>
	{
		it("works", done =>
		{
			let checked = false;

			const instance = new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(COMPLETE_EVENT, () =>
			{
				expect( instance.numActiveLinks ).to.equal(0);
				expect(checked).to.be.true;
				done();
			});

			instance.scan(commonHtmlString, baseUrl);

			// Give time for link checks to start
			setImmediate(() =>
			{
				expect( instance.numActiveLinks ).to.equal(2);
				checked = true;
			});
		});
	});



	describe("pause() / resume() / isPaused", () =>
	{
		it("works", done =>
		{
			let resumed = false;

			const instance = new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(COMPLETE_EVENT, () =>
			{
				expect(resumed).to.be.true;
				done();
			});

			expect( instance.pause() ).to.equal(instance);
			expect(instance.isPaused).to.be.true;

			instance.scan(commonHtmlString, baseUrl);

			// Wait longer than scan should take
			setTimeout(() =>
			{
				resumed = true;

				expect( instance.resume() ).to.equal(instance);
				expect(instance.isPaused).to.be.false;

			}, 100);
		});
	});



	describe("numQueuedLinks", () =>
	{
		it("works", done =>
		{
			const instance = new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(COMPLETE_EVENT, () =>
			{
				expect( instance.numQueuedLinks ).to.equal(0);
				done();
			});

			// Prevent first queued item from immediately starting (and thus being auto-dequeued)
			instance.pause();

			instance.scan(commonHtmlString, baseUrl);

			// Wait for HTML to be parsed
			setImmediate(() =>
			{
				expect( instance.numQueuedLinks ).to.equal(2);

				instance.resume();
			});
		});
	});



	describe("edge cases", () =>
	{
		it("supports multiple links", done =>
		{
			const results = [];

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, result =>
			{
				results[ result.html.offsetIndex ] = result;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(2);
				expect(results[0].broken).to.be.false;
				expect(results[1].broken).to.be.true;
				done();
			})
			.scan(commonHtmlString, baseUrl);
		});



		it("supports invalid links", done =>
		{
			const htmlString = `<a href="http://b:l:c/">link</a>`;
			const results = [];

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, result => results.push(result))
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(1);
				expect(results[0]).to.containSubset(
				{
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: false
				});
				done();
			})
			.scan(htmlString, baseUrl);
		});



		it("supports html with no links", done =>
		{
			let count = 0;

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, () =>
			{
				count++;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(count).to.equal(0);
				done();
			})
			.scan(fixtureString("/normal/no-links.html"), baseUrl);
		});



		it("supports lone cached link", done =>
		{
			const htmlString = `<a href="http://blc1/">link</a>`;
			const options = rawOptions({ cacheResponses:true });
			const results = [];

			const instance = new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, result => results.push(result))
			.on(COMPLETE_EVENT, () =>
			{
				if (results.length === 2)
				{
					expect(results[0].http.cached).to.be.false;
					expect(results[1].http.cached).to.be.true;
					done();
				}
			});

			instance.scan(htmlString, baseUrl)
			.then(() => instance.scan(htmlString, baseUrl));
		});
	});



	describe("options", () =>
	{
		it("customFilter = () => {…}", done =>
		{
			let htmlString = `<a href="http://blc1/">link1</a>`;
			htmlString += `<a href="http://blc2/">link2</a>`;

			const junkResults = [];
			const options = rawOptions({ customFilter: result => result.url.rebased.hostname !== "blc2" });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, result => junkResults.push(result))
			.on(LINK_EVENT, result => results.push(result))
			.on(COMPLETE_EVENT, () =>
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
			.scan(htmlString, baseUrl);
		});



		it("excludedKeywords = []", done =>
		{
			let htmlString = `<a href="http://blc1/">link1</a>`;
			htmlString += `<a href="http://blc2/">link2</a>`;

			const results = [];

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(2);
				expect(results).to.all.containSubset(
				{
					excluded: false,
					excludedReason: null
				});
				done();
			})
			.scan(htmlString, baseUrl);
		});



		it("excludedKeywords = […]", done =>
		{
			let htmlString = `<a href="http://blc1/">link1</a>`;
			htmlString += `<a href="http://blc2/">link2</a>`;

			const junkResults = [];
			const options = rawOptions({ excludedKeywords:["http://blc1/"] });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, result => junkResults.push(result))
			.on(LINK_EVENT, result => results.push(result))
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(1);
				expect(junkResults[0]).to.containSubset(
				{
					broken: null,
					excluded: true,
					excludedReason: "BLC_KEYWORD"
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
			.scan(htmlString, baseUrl);
		});



		it("excludedSchemes = []", done =>
		{
			let htmlString = `<a href="data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7">link1</a>`;
			htmlString += `<a href="geo:0,0">link2</a>`;
			htmlString += `<a href="javascript:void(0);">link3</a>`;
			htmlString += `<a href="mailto:address@email.com?subject=hello">link4</a>`;
			htmlString += `<a href="sms:+5-555-555-5555?body=hello">link5</a>`;
			htmlString += `<a href="tel:+5-555-555-5555">link6</a>`;

			const options = rawOptions({ excludedSchemes:[] });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(6);
				expect(results).to.all.containSubset(
				{
					broken: true,
					brokenReason: "BLC_INVALID"
				});
				done();
			})
			.scan(htmlString, baseUrl);
		});



		it(`excludedSchemes = ["data:","geo:","javascript:","mailto:","sms:","tel:"]`, done =>
		{
			let htmlString = `<a href="data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7">link1</a>`;
			htmlString += `<a href="geo:0,0">link2</a>`;
			htmlString += `<a href="javascript:void(0);">link3</a>`;
			htmlString += `<a href="mailto:address@email.com?subject=hello">link4</a>`;
			htmlString += `<a href="sms:+5-555-555-5555?body=hello">link5</a>`;
			htmlString += `<a href="tel:+5-555-555-5555">link6</a>`;

			const junkResults = [];

			// Uses default `excludedSchemes` value to ensure that any change to it will break this test
			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on(LINK_EVENT, () => done(new WrongCallError()))
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(6);
				expect(junkResults).to.all.containSubset(
				{
					broken: null,
					brokenReason: null,
					excluded: true,
					excludedReason: "BLC_SCHEME"
				});
				done();
			})
			.scan(htmlString, baseUrl);
		});



		it("excludeExternalLinks = false", done =>
		{
			let htmlString = `<a href="http://blc1/">link1</a>`;
			htmlString += `<a href="http://blc2/">link2</a>`;

			const results = [];

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(2);
				expect(results).to.containSubset(
				[
					{
						excluded: false,
						excludedReason: null,
						internal: true
					},
					{
						excluded: false,
						excludedReason: null,
						internal: false
					}
				]);
				done();
			})
			.scan(htmlString, baseUrl);
		});



		it("excludeExternalLinks = true", done =>
		{
			let htmlString = `<a href="http://blc1/">link1</a>`;
			htmlString += `<a href="http://blc2/">link2</a>`;

			const junkResults = [];
			const options = rawOptions({ excludeExternalLinks:true });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, result => junkResults.push(result))
			.on(LINK_EVENT, result => results.push(result))
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(1);
				expect(junkResults[0]).to.containSubset(
				{
					html: { text:"link2" },
					broken: null,
					excluded: true,
					excludedReason: "BLC_EXTERNAL",
					internal: false
				});

				expect(results).to.have.length(1);
				expect(results[0]).to.containSubset(
				{
					html: { text:"link1" },
					broken: false,
					excluded: false,
					excludedReason: null,
					internal: true
				});

				done();
			})
			.scan(htmlString, baseUrl);
		});



		it("excludeInternalLinks = false", done =>
		{
			let htmlString = `<a href="http://blc1/">link1</a>`;
			htmlString += `<a href="/">link2</a>`;
			htmlString += `<a href="#hash">link3</a>`;

			const results = [];

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(3);
				expect(results).to.all.containSubset(
				{
					broken: false,
					excluded: false,
					excludedReason: null,
					internal: true
				});
				done();
			})
			.scan(htmlString, baseUrl);
		});



		it("excludeInternalLinks = true", done =>
		{
			let htmlString = `<a href="http://blc1/">link1</a>`;
			htmlString += `<a href="/">link2</a>`;
			htmlString += `<a href="#hash">link3</a>`;

			const options = rawOptions({ excludeInternalLinks:true });
			const junkResults = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on(LINK_EVENT, () => done(new WrongCallError()))
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(3);
				expect(junkResults).to.all.containSubset(
				{
					broken: null,
					excluded: true,
					excludedReason: "BLC_INTERNAL",
					internal: true
				});
				done();
			})
			.scan(htmlString, baseUrl);
		});



		it("excludeLinksToSamePage = false", done =>
		{
			let htmlString = `<a href="${baseUrl}">link1</a>`;
			htmlString += `<a href="/">link2</a>`;
			htmlString += `<a href="?query">link3</a>`;
			htmlString += `<a href="#hash">link4</a>`;

			const results = [];

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(4);
				expect(results).to.containSubset(
				[
					{
						broken: false,
						excluded: false,
						excludedReason: null,
						internal: true,
						samePage: true
					},
					{
						broken: false,
						excluded: false,
						excludedReason: null,
						internal: true,
						samePage: false
					},
					{
						broken: false,
						excluded: false,
						excludedReason: null,
						internal: true,
						samePage: false
					},
					{
						broken: false,
						excluded: false,
						excludedReason: null,
						internal: true,
						samePage: true
					}
				]);
				done();
			})
			.scan(htmlString, baseUrl);
		});



		it("excludeLinksToSamePage = true", done =>
		{
			let htmlString = `<a href="${baseUrl}">link1</a>`;
			htmlString += `<a href="/">link2</a>`;
			htmlString += `<a href="?query">link3</a>`;
			htmlString += `<a href="#hash">link4</a>`;

			const junkResults = [];
			const options = rawOptions({ excludeLinksToSamePage:true });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on(LINK_EVENT, result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(2);
				expect(junkResults).to.containSubset(
				[
					{
						html: { text:"link1" },
						broken: null,
						excluded: true,
						excludedReason: "BLC_SAMEPAGE",
						internal: true,
						samePage: true
					},
					{
						html: { text:"link4" },
						broken: null,
						excluded: true,
						excludedReason: "BLC_SAMEPAGE",
						internal: true,
						samePage: true
					}
				]);

				expect(results).to.have.length(2);
				expect(results).to.containSubset(
				[
					{
						html: { text:"link2" },
						broken: false,
						excluded: false,
						excludedReason: null,
						internal: true,
						samePage: false
					},
					{
						html: { text:"link3" },
						broken: false,
						excluded: false,
						excludedReason: null,
						internal: true,
						samePage: false
					}
				]);

				done();
			})
			.scan(htmlString, baseUrl);
		});



		it("filterLevel = 0", done =>
		{
			const junkResults = [];
			const options = rawOptions({ filterLevel:0 });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on(LINK_EVENT, result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(44);
				expect(junkResults).to.all.containSubset(
				{
					broken: null,
					excluded: true,
					excludedReason: "BLC_HTML"
				});

				expect(results).to.have.length(2);
				expect(results).to.all.containSubset(
				{
					broken: false,
					excluded: false,
					excludedReason: null
				});

				done();
			})
			.scan(allTagsString, baseUrl);
		});



		it("filterLevel = 1", done =>
		{
			const junkResults = [];
			const options = rawOptions({ filterLevel:1 });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on(LINK_EVENT, result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(19);
				expect(junkResults).to.all.containSubset(
				{
					broken: null,
					excluded: true,
					excludedReason: "BLC_HTML"
				});

				expect(results).to.have.length(27);
				expect(results).to.all.containSubset(
				{
					broken: false,
					excluded: false,
					excludedReason: null
				});

				done();
			})
			.scan(allTagsString, baseUrl);
		});



		it("filterLevel = 2", done =>
		{
			const junkResults = [];
			const options = rawOptions({ filterLevel:2 });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on(LINK_EVENT, result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(14);
				expect(junkResults).to.all.containSubset(
				{
					broken: null,
					excluded: true,
					excludedReason: "BLC_HTML"
				});

				expect(results).to.have.length(32);
				expect(results).to.all.containSubset(
				{
					broken: false,
					excluded: false,
					excludedReason: null
				});

				done();
			})
			.scan(allTagsString, baseUrl);
		});



		it("filterLevel = 3", done =>
		{
			const results = [];

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(46);
				expect(results).to.all.containSubset(
				{
					broken: false,
					excluded: false,
					excludedReason: null
				});
				done();
			})
			.scan(allTagsString, baseUrl);
		});



		it("filterLevel = 0 (frameset)", done =>
		{
			const junkResults = [];
			const options = rawOptions({ filterLevel:0 });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on(LINK_EVENT, result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(4);
				expect(junkResults).to.all.containSubset(
				{
					broken: null,
					excluded: true,
					excludedReason: "BLC_HTML"
				});

				expect(results).to.be.empty;

				done();
			})
			.scan(allTagsString_frameset, baseUrl);
		});



		it("filterLevel = 1 (frameset)", done =>
		{
			const junkResults = [];
			const options = rawOptions({ filterLevel:1 });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on(LINK_EVENT, result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(3);
				expect(junkResults).to.all.containSubset(
				{
					broken: null,
					excluded: true,
					excludedReason: "BLC_HTML"
				});

				expect(results).to.have.length(1);
				expect(results).to.all.containSubset(
				{
					broken: false,
					excluded: false,
					excludedReason: null
				});

				done();
			})
			.scan(allTagsString_frameset, baseUrl);
		});



		it("filterLevel = 2 (frameset)", done =>
		{
			const junkResults = [];
			const options = rawOptions({ filterLevel:2 });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on(LINK_EVENT, result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(3);
				expect(junkResults).to.all.containSubset(
				{
					broken: null,
					excluded: true,
					excludedReason: "BLC_HTML"
				});

				expect(results).to.have.length(1);
				expect(results).to.all.containSubset(
				{
					broken: false,
					excluded: false,
					excludedReason: null
				});

				done();
			})
			.scan(allTagsString_frameset, baseUrl);
		});



		it("filterLevel = 3 (frameset)", done =>
		{
			const results = [];

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(4);
				expect(results).to.all.containSubset(
				{
					broken: false,
					excluded: false,
					excludedReason: null
				});
				done();
			})
			.scan(allTagsString_frameset, baseUrl);
		});



		it("honorRobotExclusions = false (rel)", done =>
		{
			let htmlString = `<a href="http://blc1/" rel="nofollow">link1</a>`;
			htmlString += `<a href="http://blc1/" rel="tag nofollow">link2</a>`;
			htmlString += `<a href="http://blc1/" rel=" TAG  NOFOLLOW ">link3</a>`;

			const results = [];

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(3);
				expect(results).to.all.containSubset(
				{
					broken: false,
					excluded: false,
					excludedReason: null
				});
				done();
			})
			.scan(htmlString, baseUrl);
		});



		it("honorRobotExclusions = true (rel)", done =>
		{
			let htmlString = `<a href="http://blc1/" rel="nofollow">link1</a>`;
			htmlString += `<a href="http://blc1/" rel="tag nofollow">link2</a>`;
			htmlString += `<a href="http://blc1/" rel=" TAG  NOFOLLOW ">link3</a>`;

			const junkResults = [];
			const options = rawOptions({ honorRobotExclusions:true });

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on(LINK_EVENT, () => done(new WrongCallError()))
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(3);
				expect(junkResults).to.all.containSubset(
				{
					broken: null,
					excluded: true,
					excludedReason: "BLC_ROBOTS"
				});
				done();
			})
			.scan(htmlString, baseUrl);
		});



		it("honorRobotExclusions = false (meta)", done =>
		{
			let htmlString = `<meta name="robots" content="nofollow">`;
			htmlString += `<a href="http://blc1/">link</a>`;

			const results = [];

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, result => results.push(result))
			.on(COMPLETE_EVENT, () =>
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
			.scan(htmlString, baseUrl);
		});



		it("honorRobotExclusions = true (meta)", done =>
		{
			let htmlString = `<meta name="robots" content="nofollow">`;
			htmlString += `<a href="http://blc1/">link</a>`;

			const junkResults = [];
			const options = rawOptions({ honorRobotExclusions:true });

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, result => junkResults.push(result))
			.on(LINK_EVENT, () => done(new WrongCallError()))
			.on(COMPLETE_EVENT, () =>
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
			.scan(htmlString, baseUrl);
		});



		it("honorRobotExclusions = false (meta #2)", done =>
		{
			let htmlString = `<meta name="robots" content="noimageindex">`;
			htmlString += `<img src="http://blc1/">`;
			htmlString += `<input src="http://blc1/">`;
			htmlString += `<menuitem icon="http://blc1/">`;
			htmlString += `<video poster="http://blc1/">`;

			const results = [];

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(4);
				expect(results).to.all.containSubset(
				{
					broken: false,
					excluded: false,
					excludedReason: null
				});
				done();
			})
			.scan(htmlString, baseUrl);
		});



		it("honorRobotExclusions = true (meta #2)", done =>
		{
			let htmlString = `<meta name="robots" content="noimageindex">`;
			htmlString += `<img src="http://blc1/">`;
			htmlString += `<input src="http://blc1/">`;
			htmlString += `<menuitem icon="http://blc1/">`;
			htmlString += `<video poster="http://blc1/">`;

			const junkResults = [];
			const options = rawOptions({ honorRobotExclusions:true });

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on(LINK_EVENT, () => done(new WrongCallError()))
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(4);
				expect(junkResults).to.all.containSubset(
				{
					broken: null,
					excluded: true,
					excludedReason: "BLC_ROBOTS"
				});
				done();
			})
			.scan(htmlString, baseUrl);
		});



		// TODO :: honorRobotExcluses=true (meta) + userAgent=Googlebot/2.1
	});
});
