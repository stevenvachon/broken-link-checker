/* eslint-disable sort-keys */
import * as Link from "../lib/internal/Link";
import {after, before, describe, it} from "mocha";
import checkLink from "../lib/internal/checkLink";
import {defaultAuth, parsedOptions, startDeadServer, startServers, stopServers} from "./helpers";
import {expect} from "chai";
import URLCache from "urlcache";



describe("INTERNAL -- checkLink", () =>
{
	before(() =>
	{
		startServers("http://blc1/", "https://blc2/");
		startDeadServer("http://blc-dead/");
	});



	after(stopServers);



	it("returns a Promise", () =>
	{
		const cache = new URLCache();
		const base = new URL("http://blc1/");
		const url  = new URL("http://blc1/normal/no-links.html");
		const link = Link.resolve(Link.create(), url, base);
		const returnedValue = checkLink(link, defaultAuth, cache, parsedOptions());

		expect(returnedValue).to.be.a("promise");
	});



	it("rejects a non-Link", async () =>
	{
		const cache = new URLCache();
		let errorWasThrown = false;

		try
		{
			await checkLink("/normal/no-links.html", defaultAuth, cache, parsedOptions());
		}
		catch (error)
		{
			expect(error).to.be.an("error");
			expect(error).to.be.an.instanceOf(TypeError);
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
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"http://blc1/normal/no-links.html",
				"http://blc1/"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:          "http://blc1/normal/no-links.html",
					resolved:   { href:"http://blc1/normal/no-links.html" },
					rebased:    { href:"http://blc1/normal/no-links.html" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc1/" },
					rebased:  { href:"http://blc1/" }
				},
				http: { response: { redirects:[] } },
				broken: false,
				brokenReason: null,
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});

			expect(result.http.response.redirects).to.be.empty;
		});



		it("a scheme-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"//blc1/normal/no-links.html",
				"http://blc1/"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:               "//blc1/normal/no-links.html",
					resolved:   { href:"http://blc1/normal/no-links.html" },
					rebased:    { href:"http://blc1/normal/no-links.html" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc1/" },
					rebased:  { href:"http://blc1/" }
				},
				http: { response: { redirects:[] } },
				broken: false,
				brokenReason: null,
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});

			expect(result.http.response.redirects).to.be.empty;
		});



		it("a root-path-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"/normal/no-links.html",
				"http://blc1/"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:                     "/normal/no-links.html",
					resolved:   { href:"http://blc1/normal/no-links.html" },
					rebased:    { href:"http://blc1/normal/no-links.html" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc1/" },
					rebased:  { href:"http://blc1/" }
				},
				http: { response: { redirects:[] } },
				broken: false,
				brokenReason: null,
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});

			expect(result.http.response.redirects).to.be.empty;
		});



		it("a path-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"normal/no-links.html",
				"http://blc1/"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:                      "normal/no-links.html",
					resolved:   { href:"http://blc1/normal/no-links.html" },
					rebased:    { href:"http://blc1/normal/no-links.html" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc1/" },
					rebased:  { href:"http://blc1/" }
				},
				http: { response: { redirects:[] } },
				broken: false,
				brokenReason: null,
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});

			expect(result.http.response.redirects).to.be.empty;
		});



		it("a query-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"?query",
				"http://blc1/normal/no-links.html"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:                                          "?query",
					resolved:   { href:"http://blc1/normal/no-links.html?query" },
					rebased:    { href:"http://blc1/normal/no-links.html?query" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc1/normal/no-links.html" },
					rebased:  { href:"http://blc1/normal/no-links.html" }
				},
				http: { response: { redirects:[] } },
				broken: false,
				brokenReason: null,
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});

			expect(result.http.response.redirects).to.be.empty;
		});



		it("a hash-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"#hash",
				"http://blc1/normal/no-links.html"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:                                          "#hash",
					resolved:   { href:"http://blc1/normal/no-links.html#hash" },
					rebased:    { href:"http://blc1/normal/no-links.html#hash" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc1/normal/no-links.html" },
					rebased:  { href:"http://blc1/normal/no-links.html" }
				},
				http: { response: { redirects:[] } },
				broken: false,
				brokenReason: null,
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: true
			});

			expect(result.http.response.redirects).to.be.empty;
		});



		it("an empty url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"",
				"http://blc1/normal/no-links.html"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:          "",
					resolved:   { href:"http://blc1/normal/no-links.html" },
					rebased:    { href:"http://blc1/normal/no-links.html" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc1/normal/no-links.html" },
					rebased:  { href:"http://blc1/normal/no-links.html" }
				},
				http: { response: { redirects:[] } },
				broken: false,
				brokenReason: null,
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: true
			});

			expect(result.http.response.redirects).to.be.empty;
		});
	});



	describe("shall be broken with a REAL HOST and FAKE PATH from", () =>
	{
		it("an absolute url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"http://blc1/normal/fake.html",
				"http://blc1/"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:          "http://blc1/normal/fake.html",
					resolved:   { href:"http://blc1/normal/fake.html" },
					rebased:    { href:"http://blc1/normal/fake.html" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc1/" },
					rebased:  { href:"http://blc1/" }
				},
				http: { response: { redirects:[] } },
				broken: true,
				brokenReason: "HTTP_404",
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});

			expect(result.http.response.redirects).to.be.empty;
		});



		it("a scheme-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"//blc1/normal/fake.html",
				"http://blc1/"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:               "//blc1/normal/fake.html",
					resolved:   { href:"http://blc1/normal/fake.html" },
					rebased:    { href:"http://blc1/normal/fake.html" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc1/" },
					rebased:  { href:"http://blc1/" }
				},
				http: { response: { redirects:[] } },
				broken: true,
				brokenReason: "HTTP_404",
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});

			expect(result.http.response.redirects).to.be.empty;
		});



		it("a root-path-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"/normal/fake.html",
				"http://blc1/"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:                     "/normal/fake.html",
					resolved:   { href:"http://blc1/normal/fake.html" },
					rebased:    { href:"http://blc1/normal/fake.html" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc1/" },
					rebased:  { href:"http://blc1/" }
				},
				http: { response: { redirects:[] } },
				broken: true,
				brokenReason: "HTTP_404",
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});

			expect(result.http.response.redirects).to.be.empty;
		});



		it("a path-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"normal/fake.html",
				"http://blc1/"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:                      "normal/fake.html",
					resolved:   { href:"http://blc1/normal/fake.html" },
					rebased:    { href:"http://blc1/normal/fake.html" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc1/" },
					rebased:  { href:"http://blc1/" }
				},
				http: { response: { redirects:[] } },
				broken: true,
				brokenReason: "HTTP_404",
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});

			expect(result.http.response.redirects).to.be.empty;
		});



		it("a query-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"?query",
				"http://blc1/normal/fake.html"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:                                      "?query",
					resolved:   { href:"http://blc1/normal/fake.html?query" },
					rebased:    { href:"http://blc1/normal/fake.html?query" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc1/normal/fake.html" },
					rebased:  { href:"http://blc1/normal/fake.html" }
				},
				http: { response: { redirects:[] } },
				broken: true,
				brokenReason: "HTTP_404",
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});

			expect(result.http.response.redirects).to.be.empty;
		});



		it("a hash-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"#hash",
				"http://blc1/normal/fake.html"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:                                      "#hash",
					resolved:   { href:"http://blc1/normal/fake.html#hash" },
					rebased:    { href:"http://blc1/normal/fake.html#hash" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc1/normal/fake.html" },
					rebased:  { href:"http://blc1/normal/fake.html" }
				},
				http: { response: { redirects:[] } },
				broken: true,
				brokenReason: "HTTP_404",
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: true
			});

			expect(result.http.response.redirects).to.be.empty;
		});



		it("an empty url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"",
				"http://blc1/normal/fake.html"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:          "",
					resolved:   { href:"http://blc1/normal/fake.html" },
					rebased:    { href:"http://blc1/normal/fake.html" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc1/normal/fake.html" },
					rebased:  { href:"http://blc1/normal/fake.html" }
				},
				http: { response: { redirects:[] } },
				broken: true,
				brokenReason: "HTTP_404",
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: true
			});

			expect(result.http.response.redirects).to.be.empty;
		});
	});



	// Technically it's a real host with a fake port, but same goal
	// and faster than testing a remote http://asdf1234.asdf1234
	describe("shall be broken with a FAKE HOST from", () =>
	{
		it("an absolute url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"http://blc-dead/path/to/resource.html",
				"http://blc-dead/"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:          "http://blc-dead/path/to/resource.html",
					resolved:   { href:"http://blc-dead/path/to/resource.html" },
					rebased:    { href:"http://blc-dead/path/to/resource.html" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc-dead/" },
					rebased:  { href:"http://blc-dead/" }
				},
				http: { response:null },
				broken: true,
				brokenReason: "ERRNO_ECONNREFUSED",
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});
		});



		it("a scheme-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"//blc-dead/path/to/resource.html",
				"http://blc-dead/"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:               "//blc-dead/path/to/resource.html",
					resolved:   { href:"http://blc-dead/path/to/resource.html" },
					rebased:    { href:"http://blc-dead/path/to/resource.html" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc-dead/" },
					rebased:  { href:"http://blc-dead/" }
				},
				http: { response:null },
				broken: true,
				brokenReason: "ERRNO_ECONNREFUSED",
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});
		});



		it("a root-path-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"/path/to/resource.html",
				"http://blc-dead/"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:                         "/path/to/resource.html",
					resolved:   { href:"http://blc-dead/path/to/resource.html" },
					rebased:    { href:"http://blc-dead/path/to/resource.html" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc-dead/" },
					rebased:  { href:"http://blc-dead/" }
				},
				http: { response:null },
				broken: true,
				brokenReason: "ERRNO_ECONNREFUSED",
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});
		});



		it("a path-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"path/to/resource.html",
				"http://blc-dead/"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:                          "path/to/resource.html",
					resolved:   { href:"http://blc-dead/path/to/resource.html" },
					rebased:    { href:"http://blc-dead/path/to/resource.html" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc-dead/" },
					rebased:  { href:"http://blc-dead/" }
				},
				http: { response:null },
				broken: true,
				brokenReason: "ERRNO_ECONNREFUSED",
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});
		});



		it("a query-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"?query",
				"http://blc-dead/path/to/resource.html"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:                                               "?query",
					resolved:   { href:"http://blc-dead/path/to/resource.html?query" },
					rebased:    { href:"http://blc-dead/path/to/resource.html?query" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc-dead/path/to/resource.html" },
					rebased:  { href:"http://blc-dead/path/to/resource.html" }
				},
				http: { response:null },
				broken: true,
				brokenReason: "ERRNO_ECONNREFUSED",
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});
		});



		it("a hash-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"#hash",
				"http://blc-dead/path/to/resource.html"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:                                               "#hash",
					resolved:   { href:"http://blc-dead/path/to/resource.html#hash" },
					rebased:    { href:"http://blc-dead/path/to/resource.html#hash" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc-dead/path/to/resource.html" },
					rebased:  { href:"http://blc-dead/path/to/resource.html" }
				},
				http: { response:null },
				broken: true,
				brokenReason: "ERRNO_ECONNREFUSED",
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: true
			});
		});



		it("an empty url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"",
				"http://blc-dead/path/to/resource.html"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:          "",
					resolved:   { href:"http://blc-dead/path/to/resource.html" },
					rebased:    { href:"http://blc-dead/path/to/resource.html" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc-dead/path/to/resource.html" },
					rebased:  { href:"http://blc-dead/path/to/resource.html" }
				},
				http: { response:null },
				broken: true,
				brokenReason: "ERRNO_ECONNREFUSED",
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: true
			});
		});
	});



	describe("shall be broken with NO HOST from", () =>
	{
		it("an absolute url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"http://",
				null
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original: "http://",
					resolved: null,
					rebased: null,
					redirected: null
				},
				base:
				{
					resolved: null,
					rebased: null
				},
				http: { response:null },
				broken: true,
				brokenReason: "BLC_INVALID",
				excluded: null,
				excludedReason: null,
				internal: null,
				samePage: null
			});
		});



		it("a scheme-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"//blc1/normal/no-links.html",
				null
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original: "//blc1/normal/no-links.html",
					resolved: null,
					rebased: null,
					redirected: null
				},
				base:
				{
					resolved: null,
					rebased: null
				},
				http: { response:null },
				broken: true,
				brokenReason: "BLC_INVALID",
				excluded: null,
				excludedReason: null,
				internal: null,
				samePage: null
			});
		});



		it("a root-path-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"/normal/no-links.html",
				null
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original: "/normal/no-links.html",
					resolved: null,
					rebased: null,
					redirected: null
				},
				base:
				{
					resolved: null,
					rebased: null
				},
				http: { response:null },
				broken: true,
				brokenReason: "BLC_INVALID",
				excluded: null,
				excludedReason: null,
				internal: null,
				samePage: null
			});
		});



		it("a path-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"normal/no-links.html",
				null
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original: "normal/no-links.html",
					resolved: null,
					rebased: null,
					redirected: null
				},
				base:
				{
					resolved: null,
					rebased: null
				},
				http: { response:null },
				broken: true,
				brokenReason: "BLC_INVALID",
				excluded: null,
				excludedReason: null,
				internal: null,
				samePage: null
			});
		});



		it("a query-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"?query",
				null
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original: "?query",
					resolved: null,
					rebased: null,
					redirected: null
				},
				base:
				{
					resolved: null,
					rebased: null
				},
				http: { response:null },
				broken: true,
				brokenReason: "BLC_INVALID",
				excluded: null,
				excludedReason: null,
				internal: null,
				samePage: null
			});
		});



		it("a hash-relative url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"#hash",
				null
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original: "#hash",
					resolved: null,
					rebased: null,
					redirected: null
				},
				base:
				{
					resolved: null,
					rebased: null
				},
				http: { response:null },
				broken: true,
				brokenReason: "BLC_INVALID",
				excluded: null,
				excludedReason: null,
				internal: null,
				samePage: null
			});
		});



		it("an empty url", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"",
				null
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original: "",
					resolved: null,
					rebased: null,
					redirected: null
				},
				base:
				{
					resolved: null,
					rebased: null
				},
				http: { response:null },
				broken: true,
				brokenReason: "BLC_INVALID",
				excluded: null,
				excludedReason: null,
				internal: null,
				samePage: null
			});
		});
	});



	describe("shall be broken from", () =>
	{
		it("an unknown error", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"unknown/http-999.html",
				"http://blc1/"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:                      "unknown/http-999.html",
					resolved:   { href:"http://blc1/unknown/http-999.html" },
					rebased:    { href:"http://blc1/unknown/http-999.html" },
					redirected:        null
				},
				base:
				{
					resolved: { href:"http://blc1/" },
					rebased:  { href:"http://blc1/" }
				},
				http: { response: { redirects:[], status:999 } },
				broken: true,
				brokenReason: "BLC_UNKNOWN",
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});

			expect(result.http.response.redirects).to.be.empty;
		});



		it("a data uri", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7",
				null
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original: "data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7",
					resolved: {},
					rebased: {},
					redirected: null
				},
				base:
				{
					resolved: null,
					rebased: null
				},
				http: { response:null },
				broken: true,
				brokenReason: "BLC_INVALID",
				excluded: null,
				excludedReason: null,
				internal: null,
				samePage: null
			});
		});



		it("a tel uri", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"tel:+5-555-555-5555",
				null
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original: "tel:+5-555-555-5555",
					resolved: {},
					rebased: {},
					redirected: null
				},
				base:
				{
					resolved: null,
					rebased: null
				},
				http: { response:null },
				broken: true,
				brokenReason: "BLC_INVALID",
				excluded: null,
				excludedReason: null,
				internal: null,
				samePage: null
			});
		});
	});



	describe("shall not be broken with a REDIRECTED url", () =>
	{
		it("containing no query or hash", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"http://blc1/redirect/redirect.html",
				"http://blc1/"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:          "http://blc1/redirect/redirect.html",
					resolved:   { href:"http://blc1/redirect/redirect.html" },
					rebased:    { href:"http://blc1/redirect/redirect.html" },
					redirected: { href:"http://blc1/redirect/redirected.html" }
				},
				base:
				{
					resolved: { href:"http://blc1/" },
					rebased:  { href:"http://blc1/" }
				},
				http: { response: { redirects:[] } },
				broken: false,
				brokenReason: null,
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});

			expect(result.http.response.redirects).to.have.length(2);
		});



		it("containing a query", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"http://blc1/redirect/redirect.html?query",
				"http://blc1/"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:          "http://blc1/redirect/redirect.html?query",
					resolved:   { href:"http://blc1/redirect/redirect.html?query" },
					rebased:    { href:"http://blc1/redirect/redirect.html?query" },
					redirected: { href:"http://blc1/redirect/redirected.html" }
				},
				base:
				{
					resolved: { href:"http://blc1/" },
					rebased:  { href:"http://blc1/" }
				},
				http: { response: { redirects:[] } },
				broken: false,
				brokenReason: null,
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});

			expect(result.http.response.redirects).to.have.length(2);
		});



		it("containing a hash", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"http://blc1/redirect/redirect.html#hash",
				"http://blc1/"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				url:
				{
					original:          "http://blc1/redirect/redirect.html#hash",
					resolved:   { href:"http://blc1/redirect/redirect.html#hash" },
					rebased:    { href:"http://blc1/redirect/redirect.html#hash" },
					redirected: { href:"http://blc1/redirect/redirected.html" }
				},
				base:
				{
					resolved: { href:"http://blc1/" },
					rebased:  { href:"http://blc1/" }
				},
				http: { response: { redirects:[] } },
				broken: false,
				brokenReason: null,
				excluded: null,
				excludedReason: null,
				internal: true,
				samePage: false
			});

			expect(result.http.response.redirects).to.have.length(2);
		});
	});



	describe("caching", () =>
	{
		it("stores the response", async () =>
		{
			const cache = new URLCache();
			const options = parsedOptions({ cacheResponses:true });
			const base = new URL("http://blc1/");
			const url  = new URL("http://blc1/normal/no-links.html");
			const link = Link.resolve(Link.create(), url, base);

			checkLink(link, defaultAuth, cache, options);

			let cached = cache.get(url);
			expect(cached).to.be.a("promise");

			cached = await cached;
			expect(cached).not.to.be.a("promise");
			expect(cached).to.be.an("object");
		});



		it("stores the response of a redirected url", async () =>
		{
			const cache = new URLCache();
			const options = parsedOptions({ cacheResponses:true });
			const base = new URL("http://blc1/");
			const url1 = new URL("http://blc1/redirect/redirect.html");
			const url2 = new URL("http://blc1/redirect/redirected.html");
			const link = Link.resolve(Link.create(), url1, base);
			const promise = checkLink(link, defaultAuth, cache, options);

			let cached = cache.get(url2);
			expect(cached).to.be.undefined;

			await promise;

			cached = cache.get(url2);
			expect(cached).not.to.be.a("promise");
			expect(cached).to.be.an("object");
		});



		it("stores the response of a 404", async () =>
		{
			const cache = new URLCache();
			const options = parsedOptions({ cacheResponses:true });
			const base = new URL("http://blc1/");
			const url  = new URL("http://blc1/normal/fake.html");
			const link = Link.resolve(Link.create(), url, base);

			checkLink(link, defaultAuth, cache, options);

			let cached = cache.get(url);
			expect(cached).to.be.a("promise");

			cached = await cached;
			expect(cached).not.to.be.a("promise");
			expect(cached).not.to.be.an("error");
			expect(cached).to.be.an("object");
		});



		it("stores the response of a failed connection", async () =>
		{
			const cache = new URLCache();
			const options = parsedOptions({ cacheResponses:true });
			const base = new URL("http://blc-dead/");
			const url  = new URL("http://blc-dead/path/to/resource.html");
			const link = Link.resolve(Link.create(), url, base);

			checkLink(link, defaultAuth, cache, options);

			let cached = cache.get(url);
			expect(cached).to.be.a("promise");

			cached = await cached;
			expect(cached).not.to.be.a("promise");
			expect(cached).to.be.an("error");
		});



		it("does not store the error from an erroneous url", async () =>
		{
			const cache = new URLCache();
			const options = parsedOptions({ cacheResponses:true });
			const link = Link.resolve(Link.create(), "/normal/fake.html", null);

			await checkLink(link, defaultAuth, cache, options);
			expect(cache).to.have.length(0);
		});



		it("requests a unique url only once", async () =>
		{
			const cache = new URLCache();
			const options = parsedOptions({ cacheResponses:true });
			const base = new URL("http://blc1/");
			const url  = new URL("http://blc1/normal/no-links.html");
			const link1 = Link.resolve(Link.create(), url, base);
			const link2 = Link.resolve(Link.create(), url, base);

			await checkLink(link1, defaultAuth, cache, options);
			const response1 = cache.get(url);

			// Check URL again
			await checkLink(link2, defaultAuth, cache, options);
			const response2 = cache.get(url);

			expect(response2).to.equal(response1);
		});
	});



	describe("options", () =>
	{
		it("acceptedSchemes = []", async () =>
		{
			const cache = new URLCache();
			const options = parsedOptions({ acceptedSchemes:[] });
			const link = Link.resolve(Link.create(),
				"http://blc1/normal/no-links.html",
				"http://blc1/"
			);

			const result = await checkLink(link, defaultAuth, cache, options);

			expect(result).to.containSubset(
			{
				broken: true,
				brokenReason: "BLC_INVALID",
				excluded: null,
				excludedReason: null
			});
		});



		it(`acceptedSchemes = ["http:","https:"]`, async () =>
		{
			const cache = new URLCache();
			const options = parsedOptions({ acceptedSchemes:["http:","https:"] });

			const link = url => Link.resolve(Link.create(), url);

			let result = await checkLink(link("http://blc1/normal/no-links.html"), defaultAuth, cache, options);
			expect(result).to.containSubset(
			{
				broken: false,
				brokenReason: null,
				excluded: null,
				excludedReason: null
			});

			result = await checkLink(link("https://blc2/normal/no-links.html"), defaultAuth, cache, options);
			expect(result).to.containSubset(
			{
				broken: false,
				brokenReason: null,
				excluded: null,
				excludedReason: null
			});
		});



		it("retry405Head = false", async () =>
		{
			const cache = new URLCache();
			const link = Link.resolve(Link.create(),
				"http://blc1/method-not-allowed/head.html",
				"http://blc1/"
			);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				broken: true,
				brokenReason: "HTTP_405",
				excluded: null,
				excludedReason: null
			});
		});



		it("retry405Head = true", async () =>
		{
			const cache = new URLCache();
			const options = parsedOptions({ retry405Head:true });
			const link = Link.resolve(Link.create(),
				"http://blc1/method-not-allowed/head.html",
				"http://blc1/"
			);

			const result = await checkLink(link, defaultAuth, cache, options);

			expect(result).to.containSubset(
			{
				broken: false,
				brokenReason: null,
				excluded: null,
				excludedReason: null
			});
		});



		it("retry405Head = false (#2)", async () =>
		{
			const cache = new URLCache();
			const options = parsedOptions({ requestMethod:"get" });
			const link = Link.resolve(Link.create(),
				"http://blc1/method-not-allowed/any.html",
				"http://blc1/"
			);

			const result = await checkLink(link, defaultAuth, cache, options);

			expect(result).to.containSubset(
			{
				broken: true,
				brokenReason: "HTTP_405",
				excluded: null,
				excludedReason: null
			});
		});



		it("retry405Head = true (#2)", async () =>
		{
			const cache = new URLCache();
			const options = parsedOptions({ retry405Head:true });
			const link = Link.resolve(Link.create(),
				"http://blc1/method-not-allowed/any.html",
				"http://blc1/"
			);

			const result = await checkLink(link, defaultAuth, cache, options);

			expect(result).to.containSubset(
			{
				broken: true,
				brokenReason: "HTTP_405",
				excluded: null,
				excludedReason: null
			});
		});
	});
});
