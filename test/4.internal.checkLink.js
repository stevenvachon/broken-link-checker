"use strict";
const checkLink = require("../lib/internal/checkLink");
const helpers   = require("./helpers");
const Link      = require("../lib/internal/Link");

const {after, before, describe, it} = require("mocha");
const {expect} = require("chai");
const {URL} = require("universal-url");
const URLCache = require("urlcache");



describe("INTERNAL -- checkLink", () =>
{
	before(() =>
	{
		helpers.startServers("http://blc1/", "https://blc2/");
		helpers.startDeadServer("http://blc-dead/");
	});



	after(helpers.stopServers);



	it("resolves a promise", done =>
	{
		const auth = {};
		const cache = new URLCache();
		const options = helpers.options();
		const base = new URL("http://blc1/");
		const url  = new URL("http://blc1/normal/no-links.html");
		const link = Link.resolve(Link.create(), url, base);

		checkLink(link, auth, cache, options).then(result => done());
	});



	describe("shall not be broken with a REAL HOST and REAL PATH from", () =>
	{
		it("an absolute url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"http://blc1/normal/no-links.html",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a scheme-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"//blc1/normal/no-links.html",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a root-path-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"/normal/no-links.html",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a path-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"normal/no-links.html",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a query-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"?query",
				"http://blc1/normal/no-links.html"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a hash-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"#hash",
				"http://blc1/normal/no-links.html"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("an empty url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"",
				"http://blc1/normal/no-links.html"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
	});



	describe("shall be broken with a REAL HOST and FAKE PATH from", () =>
	{
		it("an absolute url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"http://blc1/normal/fake.html",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a scheme-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"//blc1/normal/fake.html",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a root-path-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"/normal/fake.html",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a path-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"normal/fake.html",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a query-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"?query",
				"http://blc1/normal/fake.html"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a hash-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"#hash",
				"http://blc1/normal/fake.html"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("an empty url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"",
				"http://blc1/normal/fake.html"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
	});



	// Technically it's a real host with a fake port, but same goal
	// and faster than testing a remote http://asdf1234.asdf1234
	describe("shall be broken with a FAKE HOST from", () =>
	{
		it("an absolute url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"http://blc-dead/path/to/resource.html",
				"http://blc-dead/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a scheme-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"//blc-dead/path/to/resource.html",
				"http://blc-dead/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a root-path-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"/path/to/resource.html",
				"http://blc-dead/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a path-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"path/to/resource.html",
				"http://blc-dead/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a query-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"?query",
				"http://blc-dead/path/to/resource.html"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a hash-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"#hash",
				"http://blc-dead/path/to/resource.html"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("an empty url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"",
				"http://blc-dead/path/to/resource.html"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
	});



	describe("shall be broken with NO HOST from", () =>
	{
		it("an absolute url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"http://",
				null
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a scheme-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"//blc1/normal/no-links.html",
				null
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a root-path-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"/normal/no-links.html",
				null
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a path-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"normal/no-links.html",
				null
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a query-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"?query",
				null
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a hash-relative url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"#hash",
				null
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("an empty url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"",
				null
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
	});



	describe("shall be broken from", () =>
	{
		it("an unknown error", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"unknown/http-999.html",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a data uri", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7",
				null
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("a tel uri", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"tel:+5-555-555-5555",
				null
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
	});



	describe("shall not be broken with a REDIRECTED url", () =>
	{
		it("containing no query or hash", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"http://blc1/redirect/redirect.html",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
		});



		it("containing a query", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"http://blc1/redirect/redirect.html?query",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
				expect(result).to.containSubset(
				{
					url:
					{
						original:          "http://blc1/redirect/redirect.html?query",
						resolved:   { href:"http://blc1/redirect/redirect.html?query" },
						rebased:    { href:"http://blc1/redirect/redirect.html?query" },
						redirected: { href:"http://blc1/redirect/redirected.html" },
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



		it("containing a hash", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"http://blc1/redirect/redirect.html#hash",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
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
	});



	describe("caching", () =>
	{
		it("stores the response", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options({ cacheResponses:true });
			const base = new URL("http://blc1/");
			const url  = new URL("http://blc1/normal/no-links.html");
			const link = Link.resolve(Link.create(), url, base);

			return checkLink(link, auth, cache, options)
			.then(result => cache.get(url))
			.then(response => expect(response).to.be.an("object"));
		});



		it("stores the response of a redirected url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options({ cacheResponses:true });
			const base = new URL("http://blc1/");
			const url1 = new URL("http://blc1/redirect/redirect.html");
			const url2 = new URL("http://blc1/redirect/redirected.html");
			const link = Link.resolve(Link.create(), url1, base);

			return checkLink(link, auth, cache, options)
			.then(result => cache.get(url1))
			.then(response => expect(response).to.be.an("object"))
			.then(() => cache.get(url2))
			.then(response => expect(response).to.be.an("object"));
		});



		it("does not store the error from an erroneous url", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options({ cacheResponses:true });
			const link = Link.resolve(Link.create(), "/normal/fake.html", null);

			return checkLink(link, auth, cache, options)
			.then(result => expect(cache.length).to.equal(0));
		});



		it("requests a unique url only once", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options({ cacheResponses:true });
			const base = new URL("http://blc1/");
			const url  = new URL("http://blc1/normal/no-links.html");
			const link = Link.resolve(Link.create(), url, base);

			return checkLink(link, auth, cache, options)
			.then(result => cache.get(url))
			.then(response => response._cached = true)
			.then(() =>
			{
				// Check URL again
				const link = Link.resolve(Link.create(), url, base);

				return checkLink(link, auth, cache, options);
			})
			.then(() => cache.get(url))
			.then(response => expect(response._cached).to.be.true);
		});
	});



	describe("options", () =>
	{
		it("acceptedSchemes = []", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options({ acceptedSchemes:[] });
			const link = Link.resolve(Link.create(),
				"http://blc1/normal/no-links.html",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
				expect(result).to.containSubset(
				{
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null
				});
			});
		});



		it(`acceptedSchemes = ["http:","https:"]`, () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options({ acceptedSchemes:["http:","https:"] });

			const link = url => Link.resolve(Link.create(), url);

			return checkLink(link("http://blc1/normal/no-links.html"), auth, cache, options)
			.then(result => expect(result).to.containSubset(
			{
				broken: false,
				brokenReason: null,
				excluded: null,
				excludedReason: null
			}))
			.then(() => checkLink(link("https://blc2/normal/no-links.html"), auth, cache, options))
			.then(result => expect(result).to.containSubset(
			{
				broken: false,
				brokenReason: null,
				excluded: null,
				excludedReason: null
			}));
		});



		it("retryHeadFail = false", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options();
			const link = Link.resolve(Link.create(),
				"http://blc1/method-not-allowed/head.html",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
				expect(result).to.containSubset(
				{
					broken: true,
					brokenReason: "HTTP_405",
					excluded: null,
					excludedReason: null
				});
			});
		});



		it("retryHeadFail = true", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options({ retryHeadFail:true });
			const link = Link.resolve(Link.create(),
				"http://blc1/method-not-allowed/head.html",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
				expect(result).to.containSubset(
				{
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null
				});
			});
		});



		it("retryHeadFail = false (#2)", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options({ requestMethod:"get" });
			const link = Link.resolve(Link.create(),
				"http://blc1/method-not-allowed/any.html",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
				expect(result).to.containSubset(
				{
					broken: true,
					brokenReason: "HTTP_405",
					excluded: null,
					excludedReason: null
				});
			});
		});



		it("retryHeadFail = true (#2)", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options({ retryHeadFail:true });
			const link = Link.resolve(Link.create(),
				"http://blc1/method-not-allowed/any.html",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
				expect(result).to.containSubset(
				{
					broken: true,
					brokenReason: "HTTP_405",
					excluded: null,
					excludedReason: null
				});
			});
		});

		it("retryHeadCodes = []", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options({ retryHeadFail:true, retryHeadCodes: [] });
			const link = Link.resolve(Link.create(),
				"http://blc1/internal-error/head.html",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
				expect(result).to.containSubset(
					{
						broken: true,
						brokenReason: "HTTP_500",
						excluded: null,
						excludedReason: null
					});
			});
		});

		it("retryHeadCodes = [500]]", () =>
		{
			const auth = {};
			const cache = new URLCache();
			const options = helpers.options({ retryHeadFail:true, retryHeadCodes: [500] });
			const link = Link.resolve(Link.create(),
				"http://blc1/internal-error/head.html",
				"http://blc1/"
			);

			return checkLink(link, auth, cache, options).then(result =>
			{
				expect(result).to.containSubset(
					{
						broken: false,
						brokenReason: null,
						excluded: null,
						excludedReason: null
					});
			});
		});

	});
});
