/* eslint-disable sort-keys */
import {after, before, beforeEach, describe, it} from "mocha";
import checkLink from "../lib/internal/checkLink";
import {defaultAuth, parsedOptions, simplifyLink, startDeadServer, startServers, stopServers} from "./helpers";
import {expect} from "chai";
import {GET} from "http-methods-constants";
import Link, {BROKEN_REASON, EXCLUDED_REASON, HTTP_RESPONSE, IS_BROKEN, IS_INTERNAL, IS_SAME_PAGE, ORIGINAL_URL, REBASED_BASE_URL, REBASED_URL, REDIRECTED_URL, RESOLVED_BASE_URL, RESOLVED_URL, WAS_EXCLUDED} from "../lib/internal/Link";
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
		const link = new Link().resolve("http://blc1/simple/no-links.html");
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
			const fixtures =
			[
				{
					baseURL: "http://blc1/",
					linkURL: "http://blc1/simple/no-links.html"
				},
				{
					baseURL: "https://blc2/",
					linkURL: "https://blc2/simple/no-links.html"
				}
			];

			const results = await Promise.all
			(
				fixtures
					.map(({baseURL, linkURL}) => new Link().resolve(linkURL, baseURL))
					.map(link => checkLink(link, defaultAuth, cache, parsedOptions()))
			);

			results.forEach((result, i) =>
			{
				const {baseURL, linkURL} = fixtures[i];

				expect(simplifyLink(result))
					.to.deep.include(
					{
						[ORIGINAL_URL]:              linkURL,
						[RESOLVED_URL]:      new URL(linkURL),
						[REBASED_URL]:       new URL(linkURL),
						[REDIRECTED_URL]:            null,
						[RESOLVED_BASE_URL]: new URL(baseURL),
						[REBASED_BASE_URL]:  new URL(baseURL),
						[IS_BROKEN]: false,
						[BROKEN_REASON]: null,
						[WAS_EXCLUDED]: false,
						[EXCLUDED_REASON]: null,
						[IS_INTERNAL]: true,
						[IS_SAME_PAGE]: false
					})
					.property(HTTP_RESPONSE).to.deep.include(
					{
						redirects: [],
						status: 200
					});
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
					[ORIGINAL_URL]:                      linkURL,
					[RESOLVED_URL]:      new URL(`http:${linkURL}`),
					[REBASED_URL]:       new URL(`http:${linkURL}`),
					[REDIRECTED_URL]:            null,
					[RESOLVED_BASE_URL]: new URL(baseURL),
					[REBASED_BASE_URL]:  new URL(baseURL),
					[IS_BROKEN]: false,
					[BROKEN_REASON]: null,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true,
					[IS_SAME_PAGE]: false
				})
				.property(HTTP_RESPONSE).to.deep.include(
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
					[ORIGINAL_URL]:                            linkURL,
					[RESOLVED_URL]:      new URL(`http://blc1${linkURL}`),
					[REBASED_URL]:       new URL(`http://blc1${linkURL}`),
					[REDIRECTED_URL]:            null,
					[RESOLVED_BASE_URL]: new URL(baseURL),
					[REBASED_BASE_URL]:  new URL(baseURL),
					[IS_BROKEN]: false,
					[BROKEN_REASON]: null,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true,
					[IS_SAME_PAGE]: false
				})
				.property(HTTP_RESPONSE).to.deep.include(
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
					[ORIGINAL_URL]:                           linkURL,
					[RESOLVED_URL]:      new URL(`${baseURL}${linkURL}`),
					[REBASED_URL]:       new URL(`${baseURL}${linkURL}`),
					[REDIRECTED_URL]:            null,
					[RESOLVED_BASE_URL]: new URL(baseURL),
					[REBASED_BASE_URL]:  new URL(baseURL),
					[IS_BROKEN]: false,
					[BROKEN_REASON]: null,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true,
					[IS_SAME_PAGE]: false
				})
				.property(HTTP_RESPONSE).to.deep.include(
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
					[ORIGINAL_URL]:                           linkURL,
					[RESOLVED_URL]:      new URL(`${baseURL}${linkURL}`),
					[REBASED_URL]:       new URL(`${baseURL}${linkURL}`),
					[REDIRECTED_URL]:            null,
					[RESOLVED_BASE_URL]: new URL(baseURL),
					[REBASED_BASE_URL]:  new URL(baseURL),
					[IS_BROKEN]: false,
					[BROKEN_REASON]: null,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true,
					[IS_SAME_PAGE]: false
				})
				.property(HTTP_RESPONSE).to.deep.include(
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
					[ORIGINAL_URL]:                           linkURL,
					[RESOLVED_URL]:      new URL(`${baseURL}${linkURL}`),
					[REBASED_URL]:       new URL(`${baseURL}${linkURL}`),
					[REDIRECTED_URL]:            null,
					[RESOLVED_BASE_URL]: new URL(baseURL),
					[REBASED_BASE_URL]:  new URL(baseURL),
					[IS_BROKEN]: false,
					[BROKEN_REASON]: null,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true,
					[IS_SAME_PAGE]: true
				})
				.property(HTTP_RESPONSE).to.deep.include(
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
					[ORIGINAL_URL]:              linkURL,
					[RESOLVED_URL]:      new URL(baseURL),
					[REBASED_URL]:       new URL(baseURL),
					[REDIRECTED_URL]:            null,
					[RESOLVED_BASE_URL]: new URL(baseURL),
					[REBASED_BASE_URL]:  new URL(baseURL),
					[IS_BROKEN]: false,
					[BROKEN_REASON]: null,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true,
					[IS_SAME_PAGE]: true
				})
				.property(HTTP_RESPONSE).to.deep.include(
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
					[ORIGINAL_URL]:              linkURL,
					[RESOLVED_URL]:      new URL(linkURL),
					[REBASED_URL]:       new URL(linkURL),
					[REDIRECTED_URL]:            null,
					[RESOLVED_BASE_URL]: new URL(baseURL),
					[REBASED_BASE_URL]:  new URL(baseURL),
					[IS_BROKEN]: true,
					[BROKEN_REASON]: "HTTP_404",
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true,
					[IS_SAME_PAGE]: false
				})
				.property(HTTP_RESPONSE).to.deep.include(
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
					[ORIGINAL_URL]:                      linkURL,
					[RESOLVED_URL]:      new URL(`http:${linkURL}`),
					[REBASED_URL]:       new URL(`http:${linkURL}`),
					[REDIRECTED_URL]:            null,
					[RESOLVED_BASE_URL]: new URL(baseURL),
					[REBASED_BASE_URL]:  new URL(baseURL),
					[IS_BROKEN]: true,
					[BROKEN_REASON]: "HTTP_404",
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true,
					[IS_SAME_PAGE]: false
				})
				.property(HTTP_RESPONSE).to.deep.include(
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
					[ORIGINAL_URL]:                            linkURL,
					[RESOLVED_URL]:      new URL(`http://blc1${linkURL}`),
					[REBASED_URL]:       new URL(`http://blc1${linkURL}`),
					[REDIRECTED_URL]:            null,
					[RESOLVED_BASE_URL]: new URL(baseURL),
					[REBASED_BASE_URL]:  new URL(baseURL),
					[IS_BROKEN]: true,
					[BROKEN_REASON]: "HTTP_404",
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true,
					[IS_SAME_PAGE]: false
				})
				.property(HTTP_RESPONSE).to.deep.include(
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
					[ORIGINAL_URL]:                           linkURL,
					[RESOLVED_URL]:      new URL(`${baseURL}${linkURL}`),
					[REBASED_URL]:       new URL(`${baseURL}${linkURL}`),
					[REDIRECTED_URL]:            null,
					[RESOLVED_BASE_URL]: new URL(baseURL),
					[REBASED_BASE_URL]:  new URL(baseURL),
					[IS_BROKEN]: true,
					[BROKEN_REASON]: "HTTP_404",
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true,
					[IS_SAME_PAGE]: false
				})
				.property(HTTP_RESPONSE).to.deep.include(
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
					[ORIGINAL_URL]:                           linkURL,
					[RESOLVED_URL]:      new URL(`${baseURL}${linkURL}`),
					[REBASED_URL]:       new URL(`${baseURL}${linkURL}`),
					[REDIRECTED_URL]:            null,
					[RESOLVED_BASE_URL]: new URL(baseURL),
					[REBASED_BASE_URL]:  new URL(baseURL),
					[IS_BROKEN]: true,
					[BROKEN_REASON]: "HTTP_404",
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true,
					[IS_SAME_PAGE]: false
				})
				.property(HTTP_RESPONSE).to.deep.include(
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
					[ORIGINAL_URL]:                           linkURL,
					[RESOLVED_URL]:      new URL(`${baseURL}${linkURL}`),
					[REBASED_URL]:       new URL(`${baseURL}${linkURL}`),
					[REDIRECTED_URL]:            null,
					[RESOLVED_BASE_URL]: new URL(baseURL),
					[REBASED_BASE_URL]:  new URL(baseURL),
					[IS_BROKEN]: true,
					[BROKEN_REASON]: "HTTP_404",
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true,
					[IS_SAME_PAGE]: true
				})
				.property(HTTP_RESPONSE).to.deep.include(
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
					[ORIGINAL_URL]:              linkURL,
					[RESOLVED_URL]:      new URL(baseURL),
					[REBASED_URL]:       new URL(baseURL),
					[REDIRECTED_URL]:            null,
					[RESOLVED_BASE_URL]: new URL(baseURL),
					[REBASED_BASE_URL]:  new URL(baseURL),
					[IS_BROKEN]: true,
					[BROKEN_REASON]: "HTTP_404",
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true,
					[IS_SAME_PAGE]: true
				})
				.property(HTTP_RESPONSE).to.deep.include(
				{
					redirects: [],
					status: 404
				});
		});
	});



	// Technically it's a real hostname with a fake port, but same goal
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
				[ORIGINAL_URL]:              linkURL,
				[RESOLVED_URL]:      new URL(linkURL),
				[REBASED_URL]:       new URL(linkURL),
				[REDIRECTED_URL]:            null,
				[RESOLVED_BASE_URL]: new URL(baseURL),
				[REBASED_BASE_URL]:  new URL(baseURL),
				[HTTP_RESPONSE]: null,
				[IS_BROKEN]: true,
				[BROKEN_REASON]: "ERRNO_ECONNREFUSED",
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null,
				[IS_INTERNAL]: true,
				[IS_SAME_PAGE]: false
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
				[ORIGINAL_URL]:                      linkURL,
				[RESOLVED_URL]:      new URL(`http:${linkURL}`),
				[REBASED_URL]:       new URL(`http:${linkURL}`),
				[REDIRECTED_URL]:            null,
				[RESOLVED_BASE_URL]: new URL(baseURL),
				[REBASED_BASE_URL]:  new URL(baseURL),
				[HTTP_RESPONSE]: null,
				[IS_BROKEN]: true,
				[BROKEN_REASON]: "ERRNO_ECONNREFUSED",
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null,
				[IS_INTERNAL]: true,
				[IS_SAME_PAGE]: false
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
				[ORIGINAL_URL]:                                linkURL,
				[RESOLVED_URL]:      new URL(`http://blc-dead${linkURL}`),
				[REBASED_URL]:       new URL(`http://blc-dead${linkURL}`),
				[REDIRECTED_URL]:            null,
				[RESOLVED_BASE_URL]: new URL(baseURL),
				[REBASED_BASE_URL]:  new URL(baseURL),
				[HTTP_RESPONSE]: null,
				[IS_BROKEN]: true,
				[BROKEN_REASON]: "ERRNO_ECONNREFUSED",
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null,
				[IS_INTERNAL]: true,
				[IS_SAME_PAGE]: false
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
				[ORIGINAL_URL]:                           linkURL,
				[RESOLVED_URL]:      new URL(`${baseURL}${linkURL}`),
				[REBASED_URL]:       new URL(`${baseURL}${linkURL}`),
				[REDIRECTED_URL]:            null,
				[RESOLVED_BASE_URL]: new URL(baseURL),
				[REBASED_BASE_URL]:  new URL(baseURL),
				[HTTP_RESPONSE]: null,
				[IS_BROKEN]: true,
				[BROKEN_REASON]: "ERRNO_ECONNREFUSED",
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null,
				[IS_INTERNAL]: true,
				[IS_SAME_PAGE]: false
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
				[ORIGINAL_URL]:                           linkURL,
				[RESOLVED_URL]:      new URL(`${baseURL}${linkURL}`),
				[REBASED_URL]:       new URL(`${baseURL}${linkURL}`),
				[REDIRECTED_URL]:            null,
				[RESOLVED_BASE_URL]: new URL(baseURL),
				[REBASED_BASE_URL]:  new URL(baseURL),
				[HTTP_RESPONSE]: null,
				[IS_BROKEN]: true,
				[BROKEN_REASON]: "ERRNO_ECONNREFUSED",
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null,
				[IS_INTERNAL]: true,
				[IS_SAME_PAGE]: false
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
				[ORIGINAL_URL]:                           linkURL,
				[RESOLVED_URL]:      new URL(`${baseURL}${linkURL}`),
				[REBASED_URL]:       new URL(`${baseURL}${linkURL}`),
				[REDIRECTED_URL]:            null,
				[RESOLVED_BASE_URL]: new URL(baseURL),
				[REBASED_BASE_URL]:  new URL(baseURL),
				[HTTP_RESPONSE]: null,
				[IS_BROKEN]: true,
				[BROKEN_REASON]: "ERRNO_ECONNREFUSED",
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null,
				[IS_INTERNAL]: true,
				[IS_SAME_PAGE]: true
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
				[ORIGINAL_URL]:              linkURL,
				[RESOLVED_URL]:      new URL(baseURL),
				[REBASED_URL]:       new URL(baseURL),
				[REDIRECTED_URL]:            null,
				[RESOLVED_BASE_URL]: new URL(baseURL),
				[REBASED_BASE_URL]:  new URL(baseURL),
				[HTTP_RESPONSE]: null,
				[IS_BROKEN]: true,
				[BROKEN_REASON]: "ERRNO_ECONNREFUSED",
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null,
				[IS_INTERNAL]: true,
				[IS_SAME_PAGE]: true
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
				[ORIGINAL_URL]: linkURL,
				[RESOLVED_URL]: null,
				[REBASED_URL]: null,
				[REDIRECTED_URL]: null,
				[RESOLVED_BASE_URL]: null,
				[REBASED_BASE_URL]:  null,
				[HTTP_RESPONSE]: null,
				[IS_BROKEN]: true,
				[BROKEN_REASON]: "BLC_INVALID",
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null,
				[IS_INTERNAL]: null,
				[IS_SAME_PAGE]: null
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
				[ORIGINAL_URL]: linkURL,
				[RESOLVED_URL]: null,
				[REBASED_URL]: null,
				[REDIRECTED_URL]: null,
				[RESOLVED_BASE_URL]: null,
				[REBASED_BASE_URL]:  null,
				[HTTP_RESPONSE]: null,
				[IS_BROKEN]: true,
				[BROKEN_REASON]: "BLC_INVALID",
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null,
				[IS_INTERNAL]: null,
				[IS_SAME_PAGE]: null
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
				[ORIGINAL_URL]: linkURL,
				[RESOLVED_URL]: null,
				[REBASED_URL]: null,
				[REDIRECTED_URL]: null,
				[RESOLVED_BASE_URL]: null,
				[REBASED_BASE_URL]:  null,
				[HTTP_RESPONSE]: null,
				[IS_BROKEN]: true,
				[BROKEN_REASON]: "BLC_INVALID",
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null,
				[IS_INTERNAL]: null,
				[IS_SAME_PAGE]: null
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
				[ORIGINAL_URL]: linkURL,
				[RESOLVED_URL]: null,
				[REBASED_URL]: null,
				[REDIRECTED_URL]: null,
				[RESOLVED_BASE_URL]: null,
				[REBASED_BASE_URL]:  null,
				[HTTP_RESPONSE]: null,
				[IS_BROKEN]: true,
				[BROKEN_REASON]: "BLC_INVALID",
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null,
				[IS_INTERNAL]: null,
				[IS_SAME_PAGE]: null
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
				[ORIGINAL_URL]: linkURL,
				[RESOLVED_URL]: null,
				[REBASED_URL]: null,
				[REDIRECTED_URL]: null,
				[RESOLVED_BASE_URL]: null,
				[REBASED_BASE_URL]:  null,
				[HTTP_RESPONSE]: null,
				[IS_BROKEN]: true,
				[BROKEN_REASON]: "BLC_INVALID",
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null,
				[IS_INTERNAL]: null,
				[IS_SAME_PAGE]: null
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
				[ORIGINAL_URL]: linkURL,
				[RESOLVED_URL]: null,
				[REBASED_URL]: null,
				[REDIRECTED_URL]: null,
				[RESOLVED_BASE_URL]: null,
				[REBASED_BASE_URL]:  null,
				[HTTP_RESPONSE]: null,
				[IS_BROKEN]: true,
				[BROKEN_REASON]: "BLC_INVALID",
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null,
				[IS_INTERNAL]: null,
				[IS_SAME_PAGE]: null
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
				[ORIGINAL_URL]: linkURL,
				[RESOLVED_URL]: null,
				[REBASED_URL]: null,
				[REDIRECTED_URL]: null,
				[RESOLVED_BASE_URL]: null,
				[REBASED_BASE_URL]:  null,
				[HTTP_RESPONSE]: null,
				[IS_BROKEN]: true,
				[BROKEN_REASON]: "BLC_INVALID",
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null,
				[IS_INTERNAL]: null,
				[IS_SAME_PAGE]: null
			});
		});
	});



	describe("shall be broken from", () =>
	{
		it("an unsupported scheme with a REAL HOST", async () =>
		{
			const baseURL = null;
			const linkURL = "other://blc1/";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				[ORIGINAL_URL]:         linkURL,
				[RESOLVED_URL]: new URL(linkURL),
				[REBASED_URL]:  new URL(linkURL),
				[REDIRECTED_URL]: null,
				[RESOLVED_BASE_URL]: null,
				[REBASED_BASE_URL]:  null,
				[HTTP_RESPONSE]: null,
				[IS_BROKEN]: null,
				[BROKEN_REASON]: null,
				[WAS_EXCLUDED]: true,
				[EXCLUDED_REASON]: "BLC_UNSUPPORTED",
				[IS_INTERNAL]: null,
				[IS_SAME_PAGE]: null
			});
		});



		it("an unknown error", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL = "unknown/http-999.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result))
				.to.deep.include(
				{
					[ORIGINAL_URL]:                           linkURL,
					[RESOLVED_URL]:      new URL(`${baseURL}${linkURL}`),
					[REBASED_URL]:       new URL(`${baseURL}${linkURL}`),
					[REDIRECTED_URL]:            null,
					[RESOLVED_BASE_URL]: new URL(baseURL),
					[REBASED_BASE_URL]:  new URL(baseURL),
					[IS_BROKEN]: true,
					[BROKEN_REASON]: "BLC_UNKNOWN",
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true,
					[IS_SAME_PAGE]: false
				})
				.property(HTTP_RESPONSE).to.deep.include(
				{
					redirects: [],
					status: 999
				});
		});
	});



	describe("shall be excluded from", () =>
	{
		it("a data uri", async () =>
		{
			const baseURL = null;
			const linkURL = "data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(simplifyLink(result)).to.deep.include(
			{
				[ORIGINAL_URL]:         linkURL,
				[RESOLVED_URL]: new URL(linkURL),
				[REBASED_URL]:  new URL(linkURL),
				[REDIRECTED_URL]: null,
				[RESOLVED_BASE_URL]: null,
				[REBASED_BASE_URL]:  null,
				[HTTP_RESPONSE]: null,
				[IS_BROKEN]: null,
				[BROKEN_REASON]: null,
				[WAS_EXCLUDED]: true,
				[EXCLUDED_REASON]: "BLC_UNSUPPORTED",
				[IS_INTERNAL]: null,
				[IS_SAME_PAGE]: null
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
				[ORIGINAL_URL]:         linkURL,
				[RESOLVED_URL]: new URL(linkURL),
				[REBASED_URL]:  new URL(linkURL),
				[REDIRECTED_URL]: null,
				[RESOLVED_BASE_URL]: null,
				[REBASED_BASE_URL]:  null,
				[HTTP_RESPONSE]: null,
				[IS_BROKEN]: null,
				[BROKEN_REASON]: null,
				[WAS_EXCLUDED]: true,
				[EXCLUDED_REASON]: "BLC_UNSUPPORTED",
				[IS_INTERNAL]: null,
				[IS_SAME_PAGE]: null
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
					[ORIGINAL_URL]:              linkURL,
					[RESOLVED_URL]:      new URL(linkURL),
					[REBASED_URL]:       new URL(linkURL),
					[REDIRECTED_URL]:    new URL(redirectedURL),
					[RESOLVED_BASE_URL]: new URL(baseURL),
					[REBASED_BASE_URL]:  new URL(baseURL),
					[IS_BROKEN]: false,
					[BROKEN_REASON]: null,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true,
					[IS_SAME_PAGE]: false
				})
				.property(HTTP_RESPONSE).to.deep.include({ status:200 })
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
					[ORIGINAL_URL]:              linkURL,
					[RESOLVED_URL]:      new URL(linkURL),
					[REBASED_URL]:       new URL(linkURL),
					[REDIRECTED_URL]:    new URL(redirectedURL),
					[RESOLVED_BASE_URL]: new URL(baseURL),
					[REBASED_BASE_URL]:  new URL(baseURL),
					[IS_BROKEN]: false,
					[BROKEN_REASON]: null,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true,
					[IS_SAME_PAGE]: false
				})
				.property(HTTP_RESPONSE).to.deep.include({ status:200 })
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
					[ORIGINAL_URL]:              linkURL,
					[RESOLVED_URL]:      new URL(linkURL),
					[REBASED_URL]:       new URL(linkURL),
					[REDIRECTED_URL]:    new URL(redirectedURL),
					[RESOLVED_BASE_URL]: new URL(baseURL),
					[REBASED_BASE_URL]:  new URL(baseURL),
					[IS_BROKEN]: false,
					[BROKEN_REASON]: null,
					[WAS_EXCLUDED]: false,
					[EXCLUDED_REASON]: null,
					[IS_INTERNAL]: true,
					[IS_SAME_PAGE]: false
				})
				.property(HTTP_RESPONSE).to.deep.include({ status:200 })
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
			const linkURL = new URL("http://blc1/simple/no-links.html");
			const link1 = new Link().resolve(linkURL);
			const link2 = new Link().resolve(linkURL);

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
		it("excludedKeywords = []", async () =>
		{
			const options = parsedOptions();
			const link = new Link().resolve("http://blc1/simple/no-links.html");
			const result = await checkLink(link, defaultAuth, cache, options);

			expect(simplifyLink(result)).to.deep.include(
			{
				[IS_BROKEN]: false,
				[BROKEN_REASON]: null,
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null
			});
		});



		it("excludedKeywords = […]", async () =>
		{
			const options = parsedOptions({ excludedKeywords:["http://blc1*", "http://blc-dead*"] });
			const link = url => new Link().resolve(url);

			let result = await checkLink(link("http://blc1/simple/no-links.html"), defaultAuth, cache, options);
			expect(simplifyLink(result)).to.deep.include(
			{
				[IS_BROKEN]: null,
				[BROKEN_REASON]: null,
				[WAS_EXCLUDED]: true,
				[EXCLUDED_REASON]: "BLC_KEYWORD"
			});

			result = await checkLink(link("https://blc2/simple/no-links.html"), defaultAuth, cache, options);
			expect(simplifyLink(result)).to.deep.include(
			{
				[IS_BROKEN]: false,
				[BROKEN_REASON]: null,
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null
			});

			result = await checkLink(link("http://blc-dead/simple/no-links.html"), defaultAuth, cache, options);
			expect(simplifyLink(result)).to.deep.include(
			{
				[IS_BROKEN]: null,
				[BROKEN_REASON]: null,
				[WAS_EXCLUDED]: true,
				[EXCLUDED_REASON]: "BLC_KEYWORD"
			});
		});



		it("includedKeywords = []", async () =>
		{
			const options = parsedOptions();
			const link = new Link().resolve("http://blc1/simple/no-links.html");
			const result = await checkLink(link, defaultAuth, cache, options);

			expect(simplifyLink(result)).to.deep.include(
			{
				[IS_BROKEN]: false,
				[BROKEN_REASON]: null,
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null
			});
		});



		it("includedKeywords = […]", async () =>
		{
			const options = parsedOptions({ includedKeywords:["http://blc1*", "https://blc2*"] });
			const link = url => new Link().resolve(url);

			let result = await checkLink(link("http://blc1/simple/no-links.html"), defaultAuth, cache, options);
			expect(simplifyLink(result)).to.deep.include(
			{
				[IS_BROKEN]: false,
				[BROKEN_REASON]: null,
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null
			});

			result = await checkLink(link("https://blc2/simple/no-links.html"), defaultAuth, cache, options);
			expect(simplifyLink(result)).to.deep.include(
			{
				[IS_BROKEN]: false,
				[BROKEN_REASON]: null,
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null
			});

			result = await checkLink(link("http://blc-dead/simple/no-links.html"), defaultAuth, cache, options);
			expect(simplifyLink(result)).to.deep.include(
			{
				[IS_BROKEN]: null,
				[BROKEN_REASON]: null,
				[WAS_EXCLUDED]: true,
				[EXCLUDED_REASON]: "BLC_KEYWORD"
			});
		});



		it("includeLink = () => {…}", async () =>
		{
			const options = parsedOptions({ includeLink: link => link.get(REBASED_URL).hostname !== "blc2" });
			const link = url => new Link().resolve(url);

			let result = await checkLink(link("http://blc1/simple/no-links.html"), defaultAuth, cache, options);
			expect(simplifyLink(result)).to.deep.include(
			{
				[IS_BROKEN]: false,
				[BROKEN_REASON]: null,
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null
			});

			result = await checkLink(link("https://blc2/simple/no-links.html"), defaultAuth, cache, options);
			expect(simplifyLink(result)).to.deep.include(
			{
				[IS_BROKEN]: null,
				[BROKEN_REASON]: null,
				[WAS_EXCLUDED]: true,
				[EXCLUDED_REASON]: "BLC_CUSTOM"
			});
		});



		it("retryHeadFail = false", async () =>
		{
			const options = parsedOptions();
			const link = new Link().resolve("http://blc1/method-not-allowed/head.html");
			const result = await checkLink(link, defaultAuth, cache, options);

			expect(simplifyLink(result)).to.deep.include(
			{
				[IS_BROKEN]: true,
				[BROKEN_REASON]: "HTTP_405",
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null
			});
		});



		it("retryHeadFail = false (#2)", async () =>
		{
			const options = parsedOptions({ requestMethod:GET });
			const link = new Link().resolve("http://blc1/method-not-allowed/any.html");
			const result = await checkLink(link, defaultAuth, cache, options);

			expect(simplifyLink(result)).to.deep.include(
			{
				[IS_BROKEN]: true,
				[BROKEN_REASON]: "HTTP_405",
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null
			});
		});



		it("retryHeadFail = true", async () =>
		{
			const options = parsedOptions({ retryHeadFail:true });
			const link = new Link().resolve("http://blc1/method-not-allowed/head.html");
			const result = await checkLink(link, defaultAuth, cache, options);

			expect(simplifyLink(result)).to.deep.include(
			{
				[IS_BROKEN]: false,
				[BROKEN_REASON]: null,
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null
			});
		});



		it("retryHeadFail = true (#2)", async () =>
		{
			const options = parsedOptions({ retryHeadFail:true });
			const link = new Link().resolve("http://blc1/method-not-allowed/any.html");
			const result = await checkLink(link, defaultAuth, cache, options);

			expect(simplifyLink(result)).to.deep.include(
			{
				[IS_BROKEN]: true,
				[BROKEN_REASON]: "HTTP_405",
				[WAS_EXCLUDED]: false,
				[EXCLUDED_REASON]: null
			});
		});
	});
});
