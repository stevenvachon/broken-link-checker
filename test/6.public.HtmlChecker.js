"use strict";
const helpers     = require("./helpers");
const HtmlChecker = require("../lib/public/HtmlChecker");

const {after, before, describe, it} = require("mocha");
const {expect} = require("chai");

const allTagsString = helpers.tagsString(3, false, "http://blc1/");
const allTagsString_frameset = helpers.tagsString(3, true, "http://blc1/");
const baseUrl = "http://blc1/normal/index.html";
const commonHtmlString = helpers.fixture.string("/normal/index.html");

const commonHtmlStream = () => helpers.fixture.stream("/normal/index.html");



describe("PUBLIC -- HtmlChecker", function()
{
	before(() => helpers.startServers("http://blc1/", "http://blc2/"));
	after(helpers.stopServers);



	describe("scan()", function()
	{
		it("accepts a string", function()
		{
			const promise = new HtmlChecker( helpers.options() ).scan(commonHtmlString, baseUrl);

			expect(promise).to.be.a("promise");
		});



		it("accepts a stream", function()
		{
			const promise = new HtmlChecker( helpers.options() ).scan(commonHtmlStream(), baseUrl);

			expect(promise).to.be.a("promise");
		});



		it("can chain Promises", function()
		{
			const instance = new HtmlChecker( helpers.options() );
			const results = [];

			instance.scan(commonHtmlString, baseUrl)
			.then(() => results.push(0))
			.then(() => instance.scan(commonHtmlStream(), baseUrl))
			.then(() => results.push(1))
			.then(() => expect(results).to.deep.equal([0,1]));
		});



		it("throws if not ready", function()
		{
			const instance = new HtmlChecker( helpers.options() );
			let result;

			instance.scan(commonHtmlString, baseUrl);

			return instance.scan(commonHtmlString, baseUrl)
			.catch(error => result = error)
			.then(result => expect(result).to.be.an("error"));
		});
	});



	describe("events", function()
	{
		it("html", function(done)
		{
			new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("html", function(tree, robots)
			{
				expect(arguments).to.have.length(2);
				expect(tree).to.be.an("object");
				expect(robots).to.be.an("object");
				done();
			})
			.scan(commonHtmlString, baseUrl);
		});



		it("html + error", function(done)
		{
			new HtmlChecker( helpers.options() )
			.on("error", function(error)
			{
				expect(arguments).to.have.length(1);
				expect(error).to.be.an("error");
				done();
			})
			.on("html", () => { throw new Error("test") })
			.scan(commonHtmlString, baseUrl);
		});



		it("link", function(done)
		{
			let count = 0;

			new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("link", function(result)
			{
				// If HTML has more than one link, only accept the first
				// to avoid calling `done()` more than once
				if (++count > 1) return;

				expect(arguments).to.have.length(1);
				expect(result).to.be.an("object");
				done();
			})
			.scan(commonHtmlString, baseUrl);
		});



		it("link + error", function(done)
		{
			let count = 0;

			new HtmlChecker( helpers.options() )
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
			.scan(commonHtmlString, baseUrl);
		});



		it("complete", function(done)
		{
			new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("complete", function()
			{
				expect(arguments).to.be.empty;
				done();
			})
			.scan(commonHtmlString, baseUrl);
		});



		it("complete + error", function(done)
		{
			new HtmlChecker( helpers.options() )
			.on("error", function(error)
			{
				expect(arguments).to.have.length(1);
				expect(error).to.be.an("error");
				done();
			})
			.on("complete", () => { throw new Error("test") })
			.scan(commonHtmlString, baseUrl);
		});
	});



	describe("clearCache()", function()
	{
		it("works", function(done)
		{
			let finalFired = false;
			let linkCalled = false;
			const options = helpers.options({ cacheResponses:true });

			const instance = new HtmlChecker(options)
			.on("error", error => done(error))
			.on("link", result =>
			{
				expect(result.http.cached).to.be.false;
				linkCalled = true;
			})
			.on("complete", () =>
			{
				if (finalFired)
				{
					expect(linkCalled).to.be.true;
					done();
				}
				else
				{
					expect( instance.clearCache() ).to.equal(instance);

					instance.scan(commonHtmlString, baseUrl);
					finalFired = true;
				}
			});

			instance.scan(commonHtmlString, baseUrl);
		});
	});



	describe("numActiveLinks", function()
	{
		it("works", function(done)
		{
			let checked = false;

			const instance = new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("complete", () =>
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



	describe("pause() / resume() / isPaused", function()
	{
		it("works", function(done)
		{
			let resumed = false;

			const instance = new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("complete", () =>
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



	describe("numQueuedLinks", function()
	{
		it("works", function(done)
		{
			const instance = new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("complete", () =>
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



	describe("edge cases", function()
	{
		it("supports multiple links", function(done)
		{
			const results = [];

			new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("link", result =>
			{
				results[ result.html.offsetIndex ] = result;
			})
			.on("complete", () =>
			{
				expect(results).to.have.length(2);
				expect(results[0].broken).to.be.false;
				expect(results[1].broken).to.be.true;
				done();
			})
			.scan(commonHtmlString, baseUrl);
		});



		it("supports invalid links", function(done)
		{
			const htmlString = `<a href="http://b:l:c/">link</a>`;
			const results = [];

			new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("link", result => results.push(result))
			.on("complete", () =>
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



		it("supports html with no links", function(done)
		{
			let count = 0;

			new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("link", () =>
			{
				count++;
			})
			.on("complete", () =>
			{
				expect(count).to.equal(0);
				done();
			})
			.scan( helpers.fixture.string("/normal/no-links.html"), baseUrl );
		});



		it("supports lone cached link", function(done)
		{
			const htmlString = `<a href="http://blc1/">link</a>`;
			const results = [];

			const instance = new HtmlChecker( helpers.options({ cacheResponses:true }) )
			.on("error", error => done(error))
			.on("link", result => results.push(result))
			.on("complete", () =>
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



	describe("options", function()
	{
		it("customFilter = function(){…}", function(done)
		{
			let htmlString = `<a href="http://blc1/">link1</a>`;
			htmlString += `<a href="http://blc2/">link2</a>`;

			const junkResults = [];
			const results = [];

			new HtmlChecker( helpers.options({ customFilter: result => result.url.rebased.hostname !== "blc2" }) )
			.on("error", error => done(error))
			.on("junk", result => junkResults.push(result))
			.on("link", result => results.push(result))
			.on("complete", () =>
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



		it("excludedKeywords = []", function(done)
		{
			let htmlString = `<a href="http://blc1/">link1</a>`;
			htmlString += `<a href="http://blc2/">link2</a>`;

			const results = [];

			new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				done( new Error("this should not have been called") );
			})
			.on("link", result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on("complete", () =>
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



		it("excludedKeywords = […]", function(done)
		{
			let htmlString = `<a href="http://blc1/">link1</a>`;
			htmlString += `<a href="http://blc2/">link2</a>`;

			const junkResults = [];
			const results = [];

			new HtmlChecker( helpers.options({ excludedKeywords:["http://blc1/"] }) )
			.on("error", error => done(error))
			.on("junk", result => junkResults.push(result))
			.on("link", result => results.push(result))
			.on("complete", () =>
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



		it("excludedSchemes = []", function(done)
		{
			let htmlString = `<a href="data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7">link1</a>`;
			htmlString += `<a href="geo:0,0">link2</a>`;
			htmlString += `<a href="javascript:void(0);">link3</a>`;
			htmlString += `<a href="mailto:address@email.com?subject=hello">link4</a>`;
			htmlString += `<a href="sms:+5-555-555-5555?body=hello">link5</a>`;
			htmlString += `<a href="tel:+5-555-555-5555">link6</a>`;

			const results = [];

			new HtmlChecker( helpers.options({ excludedSchemes:[] }) )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				done( new Error("this should not have been called") );
			})
			.on("link", result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on("complete", () =>
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



		it(`excludedSchemes = ["data:","geo:","javascript:","mailto:","sms:","tel:"]`, function(done)
		{
			let htmlString = `<a href="data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7">link1</a>`;
			htmlString += `<a href="geo:0,0">link2</a>`;
			htmlString += `<a href="javascript:void(0);">link3</a>`;
			htmlString += `<a href="mailto:address@email.com?subject=hello">link4</a>`;
			htmlString += `<a href="sms:+5-555-555-5555?body=hello">link5</a>`;
			htmlString += `<a href="tel:+5-555-555-5555">link6</a>`;

			const junkResults = [];

			// Uses default `excludedSchemes` value to ensure that any change to it will break this test
			new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on("link", result =>
			{
				done( new Error("this should not have been called") );
			})
			.on("complete", () =>
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



		it("excludeExternalLinks = false", function(done)
		{
			let htmlString = `<a href="http://blc1/">link1</a>`;
			htmlString += `<a href="http://blc2/">link2</a>`;

			const results = [];

			new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				done( new Error("this should not have been called") );
			})
			.on("link", result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on("complete", () =>
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



		it("excludeExternalLinks = true", function(done)
		{
			let htmlString = `<a href="http://blc1/">link1</a>`;
			htmlString += `<a href="http://blc2/">link2</a>`;

			const junkResults = [];
			const results = [];

			new HtmlChecker( helpers.options({ excludeExternalLinks:true }) )
			.on("error", error => done(error))
			.on("junk", result => junkResults.push(result))
			.on("link", result => results.push(result))
			.on("complete", () =>
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



		it("excludeInternalLinks = false", function(done)
		{
			let htmlString = `<a href="http://blc1/">link1</a>`;
			htmlString += `<a href="/">link2</a>`;
			htmlString += `<a href="#hash">link3</a>`;

			const results = [];

			new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				done( new Error("this should not have been called") );
			})
			.on("link", result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on("complete", () =>
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



		it("excludeInternalLinks = true", function(done)
		{
			let htmlString = `<a href="http://blc1/">link1</a>`;
			htmlString += `<a href="/">link2</a>`;
			htmlString += `<a href="#hash">link3</a>`;

			const junkResults = [];

			new HtmlChecker( helpers.options({ excludeInternalLinks:true }) )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on("link", result =>
			{
				done( new Error("this should not have been called") );
			})
			.on("complete", () =>
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



		it("excludeLinksToSamePage = false", function(done)
		{
			let htmlString = `<a href="${baseUrl}">link1</a>`;
			htmlString += `<a href="/">link2</a>`;
			htmlString += `<a href="?query">link3</a>`;
			htmlString += `<a href="#hash">link4</a>`;

			const results = [];

			new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				done( new Error("this should not have been called") );
			})
			.on("link", result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on("complete", () =>
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



		it("excludeLinksToSamePage = true", function(done)
		{
			let htmlString = `<a href="${baseUrl}">link1</a>`;
			htmlString += `<a href="/">link2</a>`;
			htmlString += `<a href="?query">link3</a>`;
			htmlString += `<a href="#hash">link4</a>`;

			const junkResults = [];
			const results = [];

			new HtmlChecker( helpers.options({ excludeLinksToSamePage:true }) )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on("link", result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on("complete", () =>
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



		it("filterLevel = 0", function(done)
		{
			const junkResults = [];
			const results = [];

			new HtmlChecker( helpers.options({ filterLevel:0 }) )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on("link", result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on("complete", () =>
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



		it("filterLevel = 1", function(done)
		{
			const junkResults = [];
			const results = [];

			new HtmlChecker( helpers.options({ filterLevel:1 }) )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on("link", result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on("complete", () =>
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



		it("filterLevel = 2", function(done)
		{
			const junkResults = [];
			const results = [];

			new HtmlChecker( helpers.options({ filterLevel:2 }) )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on("link", result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on("complete", () =>
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



		it("filterLevel = 3", function(done)
		{
			const results = [];

			new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				done( new Error("this should not have been called") );
			})
			.on("link", result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on("complete", () =>
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



		it("filterLevel = 0 (frameset)", function(done)
		{
			const junkResults = [];
			const results = [];

			new HtmlChecker( helpers.options({ filterLevel:0 }) )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on("link", result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on("complete", () =>
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



		it("filterLevel = 1 (frameset)", function(done)
		{
			const junkResults = [];
			const results = [];

			new HtmlChecker( helpers.options({ filterLevel:1 }) )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on("link", result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on("complete", () =>
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



		it("filterLevel = 2 (frameset)", function(done)
		{
			const junkResults = [];
			const results = [];

			new HtmlChecker( helpers.options({ filterLevel:2 }) )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on("link", result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on("complete", () =>
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



		it("filterLevel = 3 (frameset)", function(done)
		{
			const results = [];

			new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				done( new Error("this should not have been called") );
			})
			.on("link", result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on("complete", () =>
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



		it("honorRobotExclusions = false (rel)", function(done)
		{
			let htmlString = `<a href="http://blc1/" rel="nofollow">link1</a>`;
			htmlString += `<a href="http://blc1/" rel="tag nofollow">link2</a>`;
			htmlString += `<a href="http://blc1/" rel=" TAG  NOFOLLOW ">link3</a>`;

			const results = [];

			new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				done( new Error("this should not have been called") );
			})
			.on("link", result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on("complete", () =>
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



		it("honorRobotExclusions = true (rel)", function(done)
		{
			let htmlString = `<a href="http://blc1/" rel="nofollow">link1</a>`;
			htmlString += `<a href="http://blc1/" rel="tag nofollow">link2</a>`;
			htmlString += `<a href="http://blc1/" rel=" TAG  NOFOLLOW ">link3</a>`;

			const junkResults = [];

			new HtmlChecker( helpers.options({ honorRobotExclusions:true }) )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on("link", result =>
			{
				done( new Error("this should not have been called") );
			})
			.on("complete", () =>
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



		it("honorRobotExclusions = false (meta)", function(done)
		{
			let htmlString = `<meta name="robots" content="nofollow">`;
			htmlString += `<a href="http://blc1/">link</a>`;

			const results = [];

			new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("junk", () => done( new Error("this should not have been called") ))
			.on("link", result => results.push(result))
			.on("complete", () =>
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



		it("honorRobotExclusions = true (meta)", function(done)
		{
			let htmlString = `<meta name="robots" content="nofollow">`;
			htmlString += `<a href="http://blc1/">link</a>`;

			const junkResults = [];

			new HtmlChecker( helpers.options({ honorRobotExclusions:true }) )
			.on("error", error => done(error))
			.on("junk", result => junkResults.push(result))
			.on("link", () => done( new Error("this should not have been called") ))
			.on("complete", () =>
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



		it("honorRobotExclusions = false (meta #2)", function(done)
		{
			let htmlString = `<meta name="robots" content="noimageindex">`;
			htmlString += `<img src="http://blc1/">`;
			htmlString += `<input src="http://blc1/">`;
			htmlString += `<menuitem icon="http://blc1/">`;
			htmlString += `<video poster="http://blc1/">`;

			const results = [];

			new HtmlChecker( helpers.options() )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				done( new Error("this should not have been called") );
			})
			.on("link", result =>
			{
				results[result.html.offsetIndex] = result;
			})
			.on("complete", () =>
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



		it("honorRobotExclusions = true (meta #2)", function(done)
		{
			let htmlString = `<meta name="robots" content="noimageindex">`;
			htmlString += `<img src="http://blc1/">`;
			htmlString += `<input src="http://blc1/">`;
			htmlString += `<menuitem icon="http://blc1/">`;
			htmlString += `<video poster="http://blc1/">`;

			const junkResults = [];

			new HtmlChecker( helpers.options({ honorRobotExclusions:true }) )
			.on("error", error => done(error))
			.on("junk", result =>
			{
				junkResults[result.html.offsetIndex] = result;
			})
			.on("link", result =>
			{
				done( new Error("this should not have been called") );
			})
			.on("complete", () =>
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
