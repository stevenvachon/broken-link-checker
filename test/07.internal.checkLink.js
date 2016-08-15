/* eslint-disable sort-keys */
import {after, before, beforeEach, describe, it} from "mocha";
import checkLink from "../lib/internal/checkLink";
import {defaultAuth, parsedOptions, simplifyLink, startDeadServer, startServers, stopServers} from "./helpers";
import {expect} from "chai";
import {GET_METHOD} from "../lib/internal/methods";
import Link from "../lib/internal/Link";
import URLCache from "urlcache";



describe("INTERNAL -- checkLink", () =>
{
	let cache;



	before(() =>
	{
		startServers("http://blc1/", "https://blc2/");
		startDeadServer("http://blc-dead/");
	});



	beforeEach(() => cache = new URLCache());

	after(stopServers);



	it("returns a Promise", () =>
	{
		const baseURL = "http://blc1/";
		const linkURL = "http://blc1/simple/no-links.html";
		const link = new Link().resolve(linkURL, baseURL);
		const returnedValue = checkLink(link, defaultAuth, cache, parsedOptions());

		expect(returnedValue).to.be.a("promise");
	});



	it("rejects a non-Link", async () =>
	{
		let errorWasThrown = false;

		try
		{
			await checkLink("/simple/no-links.html", defaultAuth, cache, parsedOptions());
		}
		catch (error)
		{
			expect(error)
				.to.be.an("error")
				.to.be.an.instanceOf(TypeError);

			errorWasThrown = true;
		}
		finally
		{
			expect(errorWasThrown).to.be.true;
		}
	});



	describe("shall not be broken with a REAL HOST and REAL PATH from", () =>
	{
		it("an absolute url", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL = "http://blc1/simple/no-links.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					originalURL:             linkURL,
					resolvedURL:     new URL(linkURL),
					rebasedURL:      new URL(linkURL),
					redirectedURL:           null,
					resolvedBaseURL: new URL(baseURL),
					rebasedBaseURL:  new URL(baseURL),
					isBroken: false,
					brokenReason: null,
					wasExcluded: null,
					excludedReason: null,
					isInternal: true,
					isSamePage: false
				})
				.property("httpResponse").to.deep.include(
				{
					redirects: [],
					status: 200
				});
		});



		it("a scheme-relative url", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL =      "//blc1/simple/no-links.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					originalURL:                     linkURL,
					resolvedURL:     new URL(`http:${linkURL}`),
					rebasedURL:      new URL(`http:${linkURL}`),
					redirectedURL:           null,
					resolvedBaseURL: new URL(baseURL),
					rebasedBaseURL:  new URL(baseURL),
					isBroken: false,
					brokenReason: null,
					wasExcluded: null,
					excludedReason: null,
					isInternal: true,
					isSamePage: false
				})
				.property("httpResponse").to.deep.include(
				{
					redirects: [],
					status: 200
				});
		});



		it("a root-path-relative url", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL =            "/simple/no-links.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					originalURL:                           linkURL,
					resolvedURL:     new URL(`http://blc1${linkURL}`),
					rebasedURL:      new URL(`http://blc1${linkURL}`),
					redirectedURL:           null,
					resolvedBaseURL: new URL(baseURL),
					rebasedBaseURL:  new URL(baseURL),
					isBroken: false,
					brokenReason: null,
					wasExcluded: null,
					excludedReason: null,
					isInternal: true,
					isSamePage: false
				})
				.property("httpResponse").to.deep.include(
				{
					redirects: [],
					status: 200
				});
		});



		it("a path-relative url", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL =             "simple/no-links.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					originalURL:                          linkURL,
					resolvedURL:     new URL(`${baseURL}${linkURL}`),
					rebasedURL:      new URL(`${baseURL}${linkURL}`),
					redirectedURL:           null,
					resolvedBaseURL: new URL(baseURL),
					rebasedBaseURL:  new URL(baseURL),
					isBroken: false,
					brokenReason: null,
					wasExcluded: null,
					excludedReason: null,
					isInternal: true,
					isSamePage: false
				})
				.property("httpResponse").to.deep.include(
				{
					redirects: [],
					status: 200
				});
		});



		it("a query-relative url", async () =>
		{
			const baseURL = "http://blc1/simple/no-links.html";
			const linkURL =                                 "?query";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					originalURL:                          linkURL,
					resolvedURL:     new URL(`${baseURL}${linkURL}`),
					rebasedURL:      new URL(`${baseURL}${linkURL}`),
					redirectedURL:           null,
					resolvedBaseURL: new URL(baseURL),
					rebasedBaseURL:  new URL(baseURL),
					isBroken: false,
					brokenReason: null,
					wasExcluded: null,
					excludedReason: null,
					isInternal: true,
					isSamePage: false
				})
				.property("httpResponse").to.deep.include(
				{
					redirects: [],
					status: 200
				});
		});



		it("a hash-relative url", async () =>
		{
			const baseURL = "http://blc1/simple/no-links.html";
			const linkURL =                                 "#hash";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					originalURL:                          linkURL,
					resolvedURL:     new URL(`${baseURL}${linkURL}`),
					rebasedURL:      new URL(`${baseURL}${linkURL}`),
					redirectedURL:           null,
					resolvedBaseURL: new URL(baseURL),
					rebasedBaseURL:  new URL(baseURL),
					isBroken: false,
					brokenReason: null,
					wasExcluded: null,
					excludedReason: null,
					isInternal: true,
					isSamePage: true
				})
				.property("httpResponse").to.deep.include(
				{
					redirects: [],
					status: 200
				});
		});



		it("an empty url", async () =>
		{
			const baseURL = "http://blc1/simple/no-links.html";
			const linkURL = "";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					originalURL:             linkURL,
					resolvedURL:     new URL(baseURL),
					rebasedURL:      new URL(baseURL),
					redirectedURL:           null,
					resolvedBaseURL: new URL(baseURL),
					rebasedBaseURL:  new URL(baseURL),
					isBroken: false,
					brokenReason: null,
					wasExcluded: null,
					excludedReason: null,
					isInternal: true,
					isSamePage: true
				})
				.property("httpResponse").to.deep.include(
				{
					redirects: [],
					status: 200
				});
		});
	});



	describe("shall be broken with a REAL HOST and FAKE PATH from", () =>
	{
		it("an absolute url", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL = "http://blc1/simple/404.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					originalURL:             linkURL,
					resolvedURL:     new URL(linkURL),
					rebasedURL:      new URL(linkURL),
					redirectedURL:           null,
					resolvedBaseURL: new URL(baseURL),
					rebasedBaseURL:  new URL(baseURL),
					isBroken: true,
					brokenReason: "HTTP_404",
					wasExcluded: null,
					excludedReason: null,
					isInternal: true,
					isSamePage: false
				})
				.property("httpResponse").to.deep.include(
				{
					redirects: [],
					status: 404
				});
		});



		it("a scheme-relative url", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL =      "//blc1/simple/404.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					originalURL:                     linkURL,
					resolvedURL:     new URL(`http:${linkURL}`),
					rebasedURL:      new URL(`http:${linkURL}`),
					redirectedURL:           null,
					resolvedBaseURL: new URL(baseURL),
					rebasedBaseURL:  new URL(baseURL),
					isBroken: true,
					brokenReason: "HTTP_404",
					wasExcluded: null,
					excludedReason: null,
					isInternal: true,
					isSamePage: false
				})
				.property("httpResponse").to.deep.include(
				{
					redirects: [],
					status: 404
				});
		});



		it("a root-path-relative url", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL =            "/simple/404.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					originalURL:                           linkURL,
					resolvedURL:     new URL(`http://blc1${linkURL}`),
					rebasedURL:      new URL(`http://blc1${linkURL}`),
					redirectedURL:           null,
					resolvedBaseURL: new URL(baseURL),
					rebasedBaseURL:  new URL(baseURL),
					isBroken: true,
					brokenReason: "HTTP_404",
					wasExcluded: null,
					excludedReason: null,
					isInternal: true,
					isSamePage: false
				})
				.property("httpResponse").to.deep.include(
				{
					redirects: [],
					status: 404
				});
		});



		it("a path-relative url", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL =             "simple/404.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					originalURL:                          linkURL,
					resolvedURL:     new URL(`${baseURL}${linkURL}`),
					rebasedURL:      new URL(`${baseURL}${linkURL}`),
					redirectedURL:           null,
					resolvedBaseURL: new URL(baseURL),
					rebasedBaseURL:  new URL(baseURL),
					isBroken: true,
					brokenReason: "HTTP_404",
					wasExcluded: null,
					excludedReason: null,
					isInternal: true,
					isSamePage: false
				})
				.property("httpResponse").to.deep.include(
				{
					redirects: [],
					status: 404
				});
		});



		it("a query-relative url", async () =>
		{
			const baseURL = "http://blc1/simple/404.html";
			const linkURL =                            "?query";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					originalURL:                          linkURL,
					resolvedURL:     new URL(`${baseURL}${linkURL}`),
					rebasedURL:      new URL(`${baseURL}${linkURL}`),
					redirectedURL:           null,
					resolvedBaseURL: new URL(baseURL),
					rebasedBaseURL:  new URL(baseURL),
					isBroken: true,
					brokenReason: "HTTP_404",
					wasExcluded: null,
					excludedReason: null,
					isInternal: true,
					isSamePage: false
				})
				.property("httpResponse").to.deep.include(
				{
					redirects: [],
					status: 404
				});
		});



		it("a hash-relative url", async () =>
		{
			const baseURL = "http://blc1/simple/404.html";
			const linkURL =                            "#hash";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					originalURL:                          linkURL,
					resolvedURL:     new URL(`${baseURL}${linkURL}`),
					rebasedURL:      new URL(`${baseURL}${linkURL}`),
					redirectedURL:           null,
					resolvedBaseURL: new URL(baseURL),
					rebasedBaseURL:  new URL(baseURL),
					isBroken: true,
					brokenReason: "HTTP_404",
					wasExcluded: null,
					excludedReason: null,
					isInternal: true,
					isSamePage: true
				})
				.property("httpResponse").to.deep.include(
				{
					redirects: [],
					status: 404
				});
		});



		it("an empty url", async () =>
		{
			const baseURL = "http://blc1/simple/404.html";
			const linkURL =  "";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					originalURL:             linkURL,
					resolvedURL:     new URL(baseURL),
					rebasedURL:      new URL(baseURL),
					redirectedURL:           null,
					resolvedBaseURL: new URL(baseURL),
					rebasedBaseURL:  new URL(baseURL),
					isBroken: true,
					brokenReason: "HTTP_404",
					wasExcluded: null,
					excludedReason: null,
					isInternal: true,
					isSamePage: true
				})
				.property("httpResponse").to.deep.include(
				{
					redirects: [],
					status: 404
				});
		});
	});



	// Technically it's a real host with a fake port, but same goal
	// and faster than testing a remote http://asdf1234.asdf1234
	describe("shall be broken with a FAKE HOST from", () =>
	{
		it("an absolute url", async () =>
		{
			const baseURL = "http://blc-dead/";
			const linkURL = "http://blc-dead/path/to/resource.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				originalURL:             linkURL,
				resolvedURL:     new URL(linkURL),
				rebasedURL:      new URL(linkURL),
				redirectedURL:           null,
				resolvedBaseURL: new URL(baseURL),
				rebasedBaseURL:  new URL(baseURL),
				httpResponse: null,
				isBroken: true,
				brokenReason: "ERRNO_ECONNREFUSED",
				wasExcluded: null,
				excludedReason: null,
				isInternal: true,
				isSamePage: false
			});
		});



		it("a scheme-relative url", async () =>
		{
			const baseURL = "http://blc-dead/";
			const linkURL =      "//blc-dead/path/to/resource.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				originalURL:                     linkURL,
				resolvedURL:     new URL(`http:${linkURL}`),
				rebasedURL:      new URL(`http:${linkURL}`),
				redirectedURL:           null,
				resolvedBaseURL: new URL(baseURL),
				rebasedBaseURL:  new URL(baseURL),
				httpResponse: null,
				isBroken: true,
				brokenReason: "ERRNO_ECONNREFUSED",
				wasExcluded: null,
				excludedReason: null,
				isInternal: true,
				isSamePage: false
			});
		});



		it("a root-path-relative url", async () =>
		{
			const baseURL = "http://blc-dead/";
			const linkURL =                "/path/to/resource.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				originalURL:                               linkURL,
				resolvedURL:     new URL(`http://blc-dead${linkURL}`),
				rebasedURL:      new URL(`http://blc-dead${linkURL}`),
				redirectedURL:           null,
				resolvedBaseURL: new URL(baseURL),
				rebasedBaseURL:  new URL(baseURL),
				httpResponse: null,
				isBroken: true,
				brokenReason: "ERRNO_ECONNREFUSED",
				wasExcluded: null,
				excludedReason: null,
				isInternal: true,
				isSamePage: false
			});
		});



		it("a path-relative url", async () =>
		{
			const baseURL = "http://blc-dead/";
			const linkURL =                 "path/to/resource.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				originalURL:                          linkURL,
				resolvedURL:     new URL(`${baseURL}${linkURL}`),
				rebasedURL:      new URL(`${baseURL}${linkURL}`),
				redirectedURL:           null,
				resolvedBaseURL: new URL(baseURL),
				rebasedBaseURL:  new URL(baseURL),
				httpResponse: null,
				isBroken: true,
				brokenReason: "ERRNO_ECONNREFUSED",
				wasExcluded: null,
				excludedReason: null,
				isInternal: true,
				isSamePage: false
			});
		});



		it("a query-relative url", async () =>
		{
			const baseURL = "http://blc-dead/path/to/resource.html";
			const linkURL =                                      "?query";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				originalURL:                          linkURL,
				resolvedURL:     new URL(`${baseURL}${linkURL}`),
				rebasedURL:      new URL(`${baseURL}${linkURL}`),
				redirectedURL:           null,
				resolvedBaseURL: new URL(baseURL),
				rebasedBaseURL:  new URL(baseURL),
				httpResponse: null,
				isBroken: true,
				brokenReason: "ERRNO_ECONNREFUSED",
				wasExcluded: null,
				excludedReason: null,
				isInternal: true,
				isSamePage: false
			});
		});



		it("a hash-relative url", async () =>
		{
			const baseURL = "http://blc-dead/path/to/resource.html";
			const linkURL =                                      "#hash";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				originalURL:                          linkURL,
				resolvedURL:     new URL(`${baseURL}${linkURL}`),
				rebasedURL:      new URL(`${baseURL}${linkURL}`),
				redirectedURL:           null,
				resolvedBaseURL: new URL(baseURL),
				rebasedBaseURL:  new URL(baseURL),
				httpResponse: null,
				isBroken: true,
				brokenReason: "ERRNO_ECONNREFUSED",
				wasExcluded: null,
				excludedReason: null,
				isInternal: true,
				isSamePage: true
			});
		});



		it("an empty url", async () =>
		{
			const baseURL = "http://blc-dead/path/to/resource.html";
			const linkURL = "";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				originalURL:             linkURL,
				resolvedURL:     new URL(baseURL),
				rebasedURL:      new URL(baseURL),
				redirectedURL:           null,
				resolvedBaseURL: new URL(baseURL),
				rebasedBaseURL:  new URL(baseURL),
				httpResponse: null,
				isBroken: true,
				brokenReason: "ERRNO_ECONNREFUSED",
				wasExcluded: null,
				excludedReason: null,
				isInternal: true,
				isSamePage: true
			});
		});
	});



	describe("shall be broken with NO HOST from", () =>
	{
		it("an absolute url", async () =>
		{
			const baseURL = null;
			const linkURL = "http://";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				originalURL: linkURL,
				resolvedURL: null,
				rebasedURL: null,
				redirectedURL: null,
				resolvedBaseURL: null,
				rebasedBaseURL:  null,
				httpResponse: null,
				isBroken: true,
				brokenReason: "BLC_INVALID",
				wasExcluded: null,
				excludedReason: null,
				isInternal: null,
				isSamePage: null
			});
		});



		// This technically has a host, but it follows the same progression as other tests
		it("a scheme-relative url", async () =>
		{
			const baseURL = null;
			const linkURL = "//blc1/simple/no-links.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				originalURL: linkURL,
				resolvedURL: null,
				rebasedURL: null,
				redirectedURL: null,
				resolvedBaseURL: null,
				rebasedBaseURL:  null,
				httpResponse: null,
				isBroken: true,
				brokenReason: "BLC_INVALID",
				wasExcluded: null,
				excludedReason: null,
				isInternal: null,
				isSamePage: null
			});
		});



		it("a root-path-relative url", async () =>
		{
			const baseURL = null;
			const linkURL = "/simple/no-links.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				originalURL: linkURL,
				resolvedURL: null,
				rebasedURL: null,
				redirectedURL: null,
				resolvedBaseURL: null,
				rebasedBaseURL:  null,
				httpResponse: null,
				isBroken: true,
				brokenReason: "BLC_INVALID",
				wasExcluded: null,
				excludedReason: null,
				isInternal: null,
				isSamePage: null
			});
		});



		it("a path-relative url", async () =>
		{
			const baseURL = null;
			const linkURL = "simple/no-links.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				originalURL: linkURL,
				resolvedURL: null,
				rebasedURL: null,
				redirectedURL: null,
				resolvedBaseURL: null,
				rebasedBaseURL:  null,
				httpResponse: null,
				isBroken: true,
				brokenReason: "BLC_INVALID",
				wasExcluded: null,
				excludedReason: null,
				isInternal: null,
				isSamePage: null
			});
		});



		it("a query-relative url", async () =>
		{
			const baseURL = null;
			const linkURL = "?query";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				originalURL: linkURL,
				resolvedURL: null,
				rebasedURL: null,
				redirectedURL: null,
				resolvedBaseURL: null,
				rebasedBaseURL:  null,
				httpResponse: null,
				isBroken: true,
				brokenReason: "BLC_INVALID",
				wasExcluded: null,
				excludedReason: null,
				isInternal: null,
				isSamePage: null
			});
		});



		it("a hash-relative url", async () =>
		{
			const baseURL = null;
			const linkURL = "#hash";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				originalURL: linkURL,
				resolvedURL: null,
				rebasedURL: null,
				redirectedURL: null,
				resolvedBaseURL: null,
				rebasedBaseURL:  null,
				httpResponse: null,
				isBroken: true,
				brokenReason: "BLC_INVALID",
				wasExcluded: null,
				excludedReason: null,
				isInternal: null,
				isSamePage: null
			});
		});



		it("an empty url", async () =>
		{
			const baseURL = null;
			const linkURL = "";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				originalURL: linkURL,
				resolvedURL: null,
				rebasedURL: null,
				redirectedURL: null,
				resolvedBaseURL: null,
				rebasedBaseURL:  null,
				httpResponse: null,
				isBroken: true,
				brokenReason: "BLC_INVALID",
				wasExcluded: null,
				excludedReason: null,
				isInternal: null,
				isSamePage: null
			});
		});
	});



	describe("shall be broken from", () =>
	{
		it("an unknown error", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL = "unknown/http-999.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					originalURL:                          linkURL,
					resolvedURL:     new URL(`${baseURL}${linkURL}`),
					rebasedURL:      new URL(`${baseURL}${linkURL}`),
					redirectedURL:           null,
					resolvedBaseURL: new URL(baseURL),
					rebasedBaseURL:  new URL(baseURL),
					isBroken: true,
					brokenReason: "BLC_UNKNOWN",
					wasExcluded: null,
					excludedReason: null,
					isInternal: true,
					isSamePage: false
				})
				.property("httpResponse").to.deep.include(
				{
					redirects: [],
					status: 999
				});
		});



		it("a data uri", async () =>
		{
			const baseURL = null;
			const linkURL = "data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				originalURL:         linkURL,
				resolvedURL: new URL(linkURL),
				rebasedURL:  new URL(linkURL),
				redirectedURL: null,
				resolvedBaseURL: null,
				rebasedBaseURL:  null,
				httpResponse: null,
				isBroken: true,
				brokenReason: "BLC_INVALID",
				wasExcluded: null,
				excludedReason: null,
				isInternal: null,
				isSamePage: null
			});
		});



		it("a tel uri", async () =>
		{
			const baseURL = null;
			const linkURL = "tel:+5-555-555-5555";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				originalURL:         linkURL,
				resolvedURL: new URL(linkURL),
				rebasedURL:  new URL(linkURL),
				redirectedURL: null,
				resolvedBaseURL: null,
				rebasedBaseURL:  null,
				httpResponse: null,
				isBroken: true,
				brokenReason: "BLC_INVALID",
				wasExcluded: null,
				excludedReason: null,
				isInternal: null,
				isSamePage: null
			});
		});
	});



	describe("shall not be broken with a REDIRECTED url", () =>
	{
		it("containing no query or hash", async () =>
		{
			const baseURL       = "http://blc1/";
			const linkURL       = "http://blc1/redirect/redirect.html";
			const redirectedURL = "http://blc1/redirect/redirected.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					originalURL:             linkURL,
					resolvedURL:     new URL(linkURL),
					rebasedURL:      new URL(linkURL),
					redirectedURL:   new URL(redirectedURL),
					resolvedBaseURL: new URL(baseURL),
					rebasedBaseURL:  new URL(baseURL),
					isBroken: false,
					brokenReason: null,
					wasExcluded: null,
					excludedReason: null,
					isInternal: true,
					isSamePage: false
				})
				.property("httpResponse").to.deep.include({ status:200 })
				.property("redirects").to.be.an("array").with.length(2);
		});



		it("containing a query", async () =>
		{
			const baseURL       = "http://blc1/";
			const linkURL       = "http://blc1/redirect/redirect.html?query";
			const redirectedURL = "http://blc1/redirect/redirected.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					originalURL:             linkURL,
					resolvedURL:     new URL(linkURL),
					rebasedURL:      new URL(linkURL),
					redirectedURL:   new URL(redirectedURL),
					resolvedBaseURL: new URL(baseURL),
					rebasedBaseURL:  new URL(baseURL),
					isBroken: false,
					brokenReason: null,
					wasExcluded: null,
					excludedReason: null,
					isInternal: true,
					isSamePage: false
				})
				.property("httpResponse").to.deep.include({ status:200 })
				.property("redirects").to.be.an("array").with.length(2);
		});



		it("containing a hash", async () =>
		{
			const baseURL       = "http://blc1/";
			const linkURL       = "http://blc1/redirect/redirect.html#hash";
			const redirectedURL = "http://blc1/redirect/redirected.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					originalURL:             linkURL,
					resolvedURL:     new URL(linkURL),
					rebasedURL:      new URL(linkURL),
					redirectedURL:   new URL(redirectedURL),
					resolvedBaseURL: new URL(baseURL),
					rebasedBaseURL:  new URL(baseURL),
					isBroken: false,
					brokenReason: null,
					wasExcluded: null,
					excludedReason: null,
					isInternal: true,
					isSamePage: false
				})
				.property("httpResponse").to.deep.include({ status:200 })
				.property("redirects").to.be.an("array").with.length(2);
		});
	});



	describe("caching", () =>
	{
		const resolves =
		[
			{
				title: "stores the response",
				url: "http://blc1/simple/no-links.html"
			},
			{
				title: "stores the response of a 404",
				url: "http://blc1/simple/404.html"
			},
			{
				title: "stores the response of a 500",
				url: "http://blc1/simple/500.html"
			}
		];

		resolves.forEach(({title, url}) => it(title, async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const baseURL = new URL("http://blc1/");
			const linkURL = new URL(url);
			const link = new Link().resolve(linkURL, baseURL);

			checkLink(link, defaultAuth, cache, options);

			const cached = cache.get(linkURL);
			expect(cached).to.be.a("promise");

			expect(await cached)
				.to.be.an("object")  // @todo move to after with chai^5
				.not.to.be.a("promise")
				.not.to.be.an("error");
		}));



		it("stores the response of a failed connection", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const baseURL = new URL("http://blc-dead/");
			const linkURL = new URL("http://blc-dead/path/to/resource.html");
			const link = new Link().resolve(linkURL, baseURL);

			checkLink(link, defaultAuth, cache, options);

			const cached = cache.get(linkURL);
			expect(cached).to.be.a("promise");
			expect(await cached).to.be.an("error");
		});




		it("stores the response of redirected urls", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const baseURL        = new URL("http://blc1/");
			const linkURL        = new URL("http://blc1/redirect/redirect.html");
			const redirectedURL1 = new URL("http://blc1/redirect/redirect2.html");
			const redirectedURL2 = new URL("http://blc1/redirect/redirected.html");
			const link = new Link().resolve(linkURL, baseURL);
			const promise = checkLink(link, defaultAuth, cache, options);

			expect(cache.get(redirectedURL1)).to.be.undefined;
			expect(cache.get(redirectedURL2)).to.be.undefined;

			await promise;

			expect(cache.get(redirectedURL1))
				.to.be.an("object").with.property("redirects").with.length(0)  // @todo move to after with chai^5
				.not.to.be.a("promise");

			expect(cache.get(redirectedURL2))
				.to.be.an("object").with.property("redirects").with.length(2)  // @todo move to after with chai^5
				.not.to.be.a("promise");
		});



		it("does not store the error from an erroneous url", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const baseURL = null;
			const linkURL = "/simple/404.html";
			const link = new Link().resolve(linkURL, baseURL);

			await checkLink(link, defaultAuth, cache, options);
			expect(cache).to.have.length(0);
		});



		it("requests a unique url only once", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const baseURL = new URL("http://blc1/");
			const linkURL = new URL("http://blc1/simple/no-links.html");
			const link1 = new Link().resolve(linkURL, baseURL);
			const link2 = new Link().resolve(linkURL, baseURL);

			await checkLink(link1, defaultAuth, cache, options);
			const response1 = cache.get(linkURL);

			// Check URL again
			await checkLink(link2, defaultAuth, cache, options);
			const response2 = cache.get(linkURL);

			expect(response2).to.equal(response1);
		});
	});



	describe("options", () =>
	{
		it("acceptedSchemes = []", async () =>
		{
			const options = parsedOptions({ acceptedSchemes:[] });
			const baseURL = "http://blc1/";
			const linkURL = "http://blc1/simple/no-links.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, options);

			expect(simplifyLink(result)).to.deep.include(
			{
				isBroken: true,
				brokenReason: "BLC_INVALID",
				wasExcluded: null,
				excludedReason: null
			});
		});



		it(`acceptedSchemes = ["http:","https:"]`, async () =>
		{
			const options = parsedOptions({ acceptedSchemes:["http:","https:"] });

			const link = url => new Link().resolve(url);

			let result = await checkLink(link("http://blc1/simple/no-links.html"), defaultAuth, cache, options);
			expect(simplifyLink(result)).to.deep.include(
			{
				isBroken: false,
				brokenReason: null,
				wasExcluded: null,
				excludedReason: null
			});

			result = await checkLink(link("https://blc2/simple/no-links.html"), defaultAuth, cache, options);
			expect(simplifyLink(result)).to.deep.include(
			{
				isBroken: false,
				brokenReason: null,
				wasExcluded: null,
				excludedReason: null
			});
		});



		it("retryHeadFail = false", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL = "http://blc1/method-not-allowed/head.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				isBroken: true,
				brokenReason: "HTTP_405",
				wasExcluded: null,
				excludedReason: null
			});
		});



		it("retryHeadFail = false (#2)", async () =>
		{
			const options = parsedOptions({ requestMethod:GET_METHOD });
			const baseURL = "http://blc1/";
			const linkURL = "http://blc1/method-not-allowed/any.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, options);

			expect(simplifyLink(result)).to.deep.include(
			{
				isBroken: true,
				brokenReason: "HTTP_405",
				wasExcluded: null,
				excludedReason: null
			});
		});



		it("retryHeadFail = true", async () =>
		{
			const options = parsedOptions({ retryHeadFail:true });
			const baseURL = "http://blc1/";
			const linkURL = "http://blc1/method-not-allowed/head.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, options);

			expect(simplifyLink(result)).to.deep.include(
			{
				isBroken: false,
				brokenReason: null,
				wasExcluded: null,
				excludedReason: null
			});
		});



		it("retryHeadFail = true (#2)", async () =>
		{
			const options = parsedOptions({ retryHeadFail:true });
			const baseURL = "http://blc1/";
			const linkURL = "http://blc1/method-not-allowed/any.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, options);

			expect(simplifyLink(result)).to.deep.include(
			{
				isBroken: true,
				brokenReason: "HTTP_405",
				wasExcluded: null,
				excludedReason: null
			});
		});
	});
});
