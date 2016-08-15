/* eslint-disable sort-keys */
import {after, before, describe, it} from "mocha";
import {COMPLETE_EVENT, ERROR_EVENT, HTML_EVENT, JUNK_EVENT, LINK_EVENT} from "../lib/internal/events";
import {expect} from "chai";
import {ExpectedError, fixtureStream, fixtureString, rawOptions, startServers, stopServers, tagsString, WrongCallError} from "./helpers";
import HtmlChecker from "../lib/public/HtmlChecker";
import Link, {BROKEN_REASON, EXCLUDED_REASON, HTML_OFFSET_INDEX, HTML_TEXT, HTTP_RESPONSE_WAS_CACHED, IS_BROKEN, IS_INTERNAL, IS_SAME_PAGE, REBASED_URL, WAS_EXCLUDED} from "../lib/internal/Link";

const allTagsFramesetString = tagsString(3, true, "http://blc1/");
const allTagsString = tagsString(3, false, "http://blc1/");
const baseURL = "http://blc1/normal/index.html";
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
			const returnedValue = new HtmlChecker(rawOptions()).scan(commonHtmlString, baseURL);

			expect(returnedValue).to.be.a("promise");
		});



		it("returns a Promise from a Stream", () =>
		{
			const returnedValue = new HtmlChecker(rawOptions()).scan(commonHtmlStream(), baseURL);

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
					instance.scan(commonHtmlString, baseURL),
					instance.scan(commonHtmlString, baseURL)
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
			.scan(commonHtmlString, baseURL);
		});



		it(LINK_EVENT, done =>
		{
			let count = 0;

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, (link, ...remainingArgs) =>
			{
				// If HTML has more than one link, only accept the first
				// to avoid calling `done()` more than once
				if (++count === 1)
				{
					expect(remainingArgs).to.be.empty;
					expect(link).to.be.an.instanceOf(Link);
					done();
				}
			})
			.scan(commonHtmlString, baseURL);
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
			.scan(commonHtmlString, baseURL);
		});



		it(ERROR_EVENT, done =>
		{
			let errorCount = 0;

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, (error, ...remainingArgs) =>
			{
				expect(remainingArgs).to.be.empty;
				expect(error).to.be.an("error");

				if (++errorCount === 3)
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
			.on(COMPLETE_EVENT, () =>
			{
				throw new ExpectedError();
			})
			.scan(commonHtmlString, baseURL);
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
			.on(LINK_EVENT, link =>
			{
				expect(link.get(HTTP_RESPONSE_WAS_CACHED)).to.be.false;
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

					instance.scan(commonHtmlString, baseURL);
					endWasDispatched = true;
				}
			});

			instance.scan(commonHtmlString, baseURL);
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

			instance.scan(commonHtmlString, baseURL);

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

			instance.scan(commonHtmlString, baseURL);

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

			instance.scan(commonHtmlString, baseURL);

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
			.on(LINK_EVENT, link =>
			{
				results[ link.get(HTML_OFFSET_INDEX) ] = link;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(2);
				expect(results[0].get(IS_BROKEN)).to.be.false;
				expect(results[1].get(IS_BROKEN)).to.be.true;
				done();
			})
			.scan(commonHtmlString, baseURL);
		});



		it("supports invalid links", done =>
		{
			const htmlString = `<a href="http://b:l:c/">link</a>`;
			const results = [];

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, link => results.push(link))
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(1);
				expect(results[0]).to.containSubset(
				{
					[IS_BROKEN]: true,
					[BROKEN_REASON]: "BLC_INVALID",
					[WAS_EXCLUDED]: false
				});
				done();
			})
			.scan(htmlString, baseURL);
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
			.scan(fixtureString("/normal/no-links.html"), baseURL);
		});



		it("supports lone cached link", done =>
		{
			const htmlString = `<a href="http://blc1/">link</a>`;
			const options = rawOptions({ cacheResponses:true });
			const results = [];

			const instance = new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(LINK_EVENT, link => results.push(link))
			.on(COMPLETE_EVENT, () =>
			{
				if (results.length === 2)
				{
					expect(results[0].get(HTTP_RESPONSE_WAS_CACHED)).to.be.false;
					expect(results[1].get(HTTP_RESPONSE_WAS_CACHED)).to.be.true;
					done();
				}
			});

			instance.scan(htmlString, baseURL)
			.then(() => instance.scan(htmlString, baseURL));
		});
	});



	describe("options", () =>
	{
		it("customFilter = () => {…}", done =>
		{
			let htmlString = `<a href="http://blc1/">link1</a>`;
			htmlString += `<a href="http://blc2/">link2</a>`;

			const junkResults = [];
			const options = rawOptions({ customFilter: link => link.get(REBASED_URL).hostname !== "blc2" });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, link => junkResults.push(link))
			.on(LINK_EVENT, link => results.push(link))
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(1);
				expect(junkResults[0]).to.containSubset(
				{
					[IS_BROKEN]: null,
					[WAS_EXCLUDED]: true,
					[EXCLUDED_REASON]: "BLC_CUSTOM"
				});

				expect(results).to.have.length(1);
				expect(results[0]).to.containSubset(
				{
					[IS_BROKEN]: false,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null
				});

				done();
			})
			.scan(htmlString, baseURL);
		});



		it("excludedKeywords = []", done =>
		{
			let htmlString = `<a href="http://blc1/">link1</a>`;
			htmlString += `<a href="http://blc2/">link2</a>`;

			const results = [];

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, link =>
			{
				results[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(2);
				expect(results).to.all.containSubset(
				{
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null
				});
				done();
			})
			.scan(htmlString, baseURL);
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
			.on(JUNK_EVENT, link => junkResults.push(link))
			.on(LINK_EVENT, link => results.push(link))
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(1);
				expect(junkResults[0]).to.containSubset(
				{
					[IS_BROKEN]: null,
					[WAS_EXCLUDED]: true,
					[EXCLUDED_REASON]: "BLC_KEYWORD"
				});

				expect(results).to.have.length(1);
				expect(results[0]).to.containSubset(
				{
					[IS_BROKEN]: false,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null
				});

				done();
			})
			.scan(htmlString, baseURL);
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
			.on(LINK_EVENT, link =>
			{
				results[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(6);
				expect(results).to.all.containSubset(
				{
					[IS_BROKEN]: true,
					[BROKEN_REASON]: "BLC_INVALID"
				});
				done();
			})
			.scan(htmlString, baseURL);
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
			.on(JUNK_EVENT, link =>
			{
				junkResults[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(LINK_EVENT, () => done(new WrongCallError()))
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(6);
				expect(junkResults).to.all.containSubset(
				{
					[IS_BROKEN]: null,
					[BROKEN_REASON]: null,
					[WAS_EXCLUDED]: true,
					[EXCLUDED_REASON]: "BLC_SCHEME"
				});
				done();
			})
			.scan(htmlString, baseURL);
		});



		it("excludeExternalLinks = false", done =>
		{
			let htmlString = `<a href="http://blc1/">link1</a>`;
			htmlString += `<a href="http://blc2/">link2</a>`;

			const results = [];

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, link =>
			{
				results[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(2);
				expect(results).to.containSubset(
				[
					{
						[WAS_EXCLUDED]: false,
						[EXCLUDED_REASON]: null,
						[IS_INTERNAL]: true
					},
					{
						[WAS_EXCLUDED]: false,
						[EXCLUDED_REASON]: null,
						[IS_INTERNAL]: false
					}
				]);
				done();
			})
			.scan(htmlString, baseURL);
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
			.on(JUNK_EVENT, link => junkResults.push(link))
			.on(LINK_EVENT, link => results.push(link))
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(1);
				expect(junkResults[0]).to.containSubset(
				{
					[HTML_TEXT]: "link2",
					[IS_BROKEN]: null,
					[WAS_EXCLUDED]: true,
					[EXCLUDED_REASON]: "BLC_EXTERNAL",
					[IS_INTERNAL]: false
				});

				expect(results).to.have.length(1);
				expect(results[0]).to.containSubset(
				{
					[HTML_TEXT]: "link1",
					[IS_BROKEN]: false,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true
				});

				done();
			})
			.scan(htmlString, baseURL);
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
			.on(LINK_EVENT, link =>
			{
				results[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(3);
				expect(results).to.all.containSubset(
				{
					[IS_BROKEN]: false,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true
				});
				done();
			})
			.scan(htmlString, baseURL);
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
			.on(JUNK_EVENT, link =>
			{
				junkResults[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(LINK_EVENT, () => done(new WrongCallError()))
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(3);
				expect(junkResults).to.all.containSubset(
				{
					[IS_BROKEN]: null,
					[WAS_EXCLUDED]: true,
					[EXCLUDED_REASON]: "BLC_INTERNAL",
					[IS_INTERNAL]: true
				});
				done();
			})
			.scan(htmlString, baseURL);
		});



		it("excludeLinksToSamePage = false", done =>
		{
			let htmlString = `<a href="${baseURL}">link1</a>`;
			htmlString += `<a href="/">link2</a>`;
			htmlString += `<a href="?query">link3</a>`;
			htmlString += `<a href="#hash">link4</a>`;

			const results = [];

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, link =>
			{
				results[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(4);
				expect(results).to.containSubset(
				[
					{
						[IS_BROKEN]: false,
						[WAS_EXCLUDED]: false,
						[EXCLUDED_REASON]: null,
						[IS_INTERNAL]: true,
						[IS_SAME_PAGE]: true
					},
					{
						[IS_BROKEN]: false,
						[WAS_EXCLUDED]: false,
						[EXCLUDED_REASON]: null,
						[IS_INTERNAL]: true,
						[IS_SAME_PAGE]: false
					},
					{
						[IS_BROKEN]: false,
						[WAS_EXCLUDED]: false,
						[EXCLUDED_REASON]: null,
						[IS_INTERNAL]: true,
						[IS_SAME_PAGE]: false
					},
					{
						[IS_BROKEN]: false,
						[WAS_EXCLUDED]: false,
						[EXCLUDED_REASON]: null,
						[IS_INTERNAL]: true,
						[IS_SAME_PAGE]: true
					}
				]);
				done();
			})
			.scan(htmlString, baseURL);
		});



		it("excludeLinksToSamePage = true", done =>
		{
			let htmlString = `<a href="${baseURL}">link1</a>`;
			htmlString += `<a href="/">link2</a>`;
			htmlString += `<a href="?query">link3</a>`;
			htmlString += `<a href="#hash">link4</a>`;

			const junkResults = [];
			const options = rawOptions({ excludeLinksToSamePage:true });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, link =>
			{
				junkResults[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(LINK_EVENT, link =>
			{
				results[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(2);
				expect(junkResults).to.containSubset(
				[
					{
						[HTML_TEXT]: "link1",
						[IS_BROKEN]: null,
						[WAS_EXCLUDED]: true,
						[EXCLUDED_REASON]: "BLC_SAMEPAGE",
						[IS_INTERNAL]: true,
						[IS_SAME_PAGE]: true
					},
					{
						[HTML_TEXT]: "link4",
						[IS_BROKEN]: null,
						[WAS_EXCLUDED]: true,
						[EXCLUDED_REASON]: "BLC_SAMEPAGE",
						[IS_INTERNAL]: true,
						[IS_SAME_PAGE]: true
					}
				]);

				expect(results).to.have.length(2);
				expect(results).to.containSubset(
				[
					{
						[HTML_TEXT]: "link2",
						[IS_BROKEN]: false,
						[WAS_EXCLUDED]: false,
						[EXCLUDED_REASON]: null,
						[IS_INTERNAL]: true,
						[IS_SAME_PAGE]: false
					},
					{
						[HTML_TEXT]: "link3",
						[IS_BROKEN]: false,
						[WAS_EXCLUDED]: false,
						[EXCLUDED_REASON]: null,
						[IS_INTERNAL]: true,
						[IS_SAME_PAGE]: false
					}
				]);

				done();
			})
			.scan(htmlString, baseURL);
		});



		it("filterLevel = 0", done =>
		{
			const junkResults = [];
			const options = rawOptions({ filterLevel:0 });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, link =>
			{
				junkResults[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(LINK_EVENT, link =>
			{
				results[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(44);
				expect(junkResults).to.all.containSubset(
				{
					[IS_BROKEN]: null,
					[WAS_EXCLUDED]: true,
					[EXCLUDED_REASON]: "BLC_HTML"
				});

				expect(results).to.have.length(2);
				expect(results).to.all.containSubset(
				{
					[IS_BROKEN]: false,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null
				});

				done();
			})
			.scan(allTagsString, baseURL);
		});



		it("filterLevel = 1", done =>
		{
			const junkResults = [];
			const options = rawOptions({ filterLevel:1 });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, link =>
			{
				junkResults[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(LINK_EVENT, link =>
			{
				results[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(19);
				expect(junkResults).to.all.containSubset(
				{
					[IS_BROKEN]: null,
					[WAS_EXCLUDED]: true,
					[EXCLUDED_REASON]: "BLC_HTML"
				});

				expect(results).to.have.length(27);
				expect(results).to.all.containSubset(
				{
					[IS_BROKEN]: false,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null
				});

				done();
			})
			.scan(allTagsString, baseURL);
		});



		it("filterLevel = 2", done =>
		{
			const junkResults = [];
			const options = rawOptions({ filterLevel:2 });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, link =>
			{
				junkResults[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(LINK_EVENT, link =>
			{
				results[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(14);
				expect(junkResults).to.all.containSubset(
				{
					[IS_BROKEN]: null,
					[WAS_EXCLUDED]: true,
					[EXCLUDED_REASON]: "BLC_HTML"
				});

				expect(results).to.have.length(32);
				expect(results).to.all.containSubset(
				{
					[IS_BROKEN]: false,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null
				});

				done();
			})
			.scan(allTagsString, baseURL);
		});



		it("filterLevel = 3", done =>
		{
			const results = [];

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, link =>
			{
				results[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(46);
				expect(results).to.all.containSubset(
				{
					[IS_BROKEN]: false,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null
				});
				done();
			})
			.scan(allTagsString, baseURL);
		});



		it("filterLevel = 0 (frameset)", done =>
		{
			const junkResults = [];
			const options = rawOptions({ filterLevel:0 });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, link =>
			{
				junkResults[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(LINK_EVENT, link =>
			{
				results[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(4);
				expect(junkResults).to.all.containSubset(
				{
					[IS_BROKEN]: null,
					[WAS_EXCLUDED]: true,
					[EXCLUDED_REASON]: "BLC_HTML"
				});

				expect(results).to.be.empty;

				done();
			})
			.scan(allTagsFramesetString, baseURL);
		});



		it("filterLevel = 1 (frameset)", done =>
		{
			const junkResults = [];
			const options = rawOptions({ filterLevel:1 });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, link =>
			{
				junkResults[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(LINK_EVENT, link =>
			{
				results[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(3);
				expect(junkResults).to.all.containSubset(
				{
					[IS_BROKEN]: null,
					[WAS_EXCLUDED]: true,
					[EXCLUDED_REASON]: "BLC_HTML"
				});

				expect(results).to.have.length(1);
				expect(results).to.all.containSubset(
				{
					[IS_BROKEN]: false,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null
				});

				done();
			})
			.scan(allTagsFramesetString, baseURL);
		});



		it("filterLevel = 2 (frameset)", done =>
		{
			const junkResults = [];
			const options = rawOptions({ filterLevel:2 });
			const results = [];

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, link =>
			{
				junkResults[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(LINK_EVENT, link =>
			{
				results[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(3);
				expect(junkResults).to.all.containSubset(
				{
					[IS_BROKEN]: null,
					[WAS_EXCLUDED]: true,
					[EXCLUDED_REASON]: "BLC_HTML"
				});

				expect(results).to.have.length(1);
				expect(results).to.all.containSubset(
				{
					[IS_BROKEN]: false,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null
				});

				done();
			})
			.scan(allTagsFramesetString, baseURL);
		});



		it("filterLevel = 3 (frameset)", done =>
		{
			const results = [];

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, link =>
			{
				results[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(4);
				expect(results).to.all.containSubset(
				{
					[IS_BROKEN]: false,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null
				});
				done();
			})
			.scan(allTagsFramesetString, baseURL);
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
			.on(LINK_EVENT, link =>
			{
				results[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(3);
				expect(results).to.all.containSubset(
				{
					[IS_BROKEN]: false,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null
				});
				done();
			})
			.scan(htmlString, baseURL);
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
			.on(JUNK_EVENT, link =>
			{
				junkResults[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(LINK_EVENT, () => done(new WrongCallError()))
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(3);
				expect(junkResults).to.all.containSubset(
				{
					[IS_BROKEN]: null,
					[WAS_EXCLUDED]: true,
					[EXCLUDED_REASON]: "BLC_ROBOTS"
				});
				done();
			})
			.scan(htmlString, baseURL);
		});



		it("honorRobotExclusions = false (meta)", done =>
		{
			let htmlString = `<meta name="robots" content="nofollow">`;
			htmlString += `<a href="http://blc1/">link</a>`;

			const results = [];

			new HtmlChecker(rawOptions())
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, () => done(new WrongCallError()))
			.on(LINK_EVENT, link => results.push(link))
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(1);
				expect(results[0]).to.containSubset(
				{
					[IS_BROKEN]: false,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null
				});
				done();
			})
			.scan(htmlString, baseURL);
		});



		it("honorRobotExclusions = true (meta)", done =>
		{
			let htmlString = `<meta name="robots" content="nofollow">`;
			htmlString += `<a href="http://blc1/">link</a>`;

			const junkResults = [];
			const options = rawOptions({ honorRobotExclusions:true });

			new HtmlChecker(options)
			.on(ERROR_EVENT, error => done(error))
			.on(JUNK_EVENT, link => junkResults.push(link))
			.on(LINK_EVENT, () => done(new WrongCallError()))
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(1);
				expect(junkResults[0]).to.containSubset(
				{
					[IS_BROKEN]: null,
					[WAS_EXCLUDED]: true,
					[EXCLUDED_REASON]: "BLC_ROBOTS"
				});
				done();
			})
			.scan(htmlString, baseURL);
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
			.on(LINK_EVENT, link =>
			{
				results[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(COMPLETE_EVENT, () =>
			{
				expect(results).to.have.length(4);
				expect(results).to.all.containSubset(
				{
					[IS_BROKEN]: false,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null
				});
				done();
			})
			.scan(htmlString, baseURL);
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
			.on(JUNK_EVENT, link =>
			{
				junkResults[link.get(HTML_OFFSET_INDEX)] = link;
			})
			.on(LINK_EVENT, () => done(new WrongCallError()))
			.on(COMPLETE_EVENT, () =>
			{
				expect(junkResults).to.have.length(4);
				expect(junkResults).to.all.containSubset(
				{
					[IS_BROKEN]: null,
					[WAS_EXCLUDED]: true,
					[EXCLUDED_REASON]: "BLC_ROBOTS"
				});
				done();
			})
			.scan(htmlString, baseURL);
		});



		// @todo honorRobotExcluses=true (meta) + userAgent=Googlebot/2.1
	});
});
