/* eslint-disable sort-keys */
import * as Link from "../lib/internal/Link";
import {describe, it} from "mocha";
import {expect} from "chai";
import isString from "is-string";
import URL_TESTS from "./helpers/json/Link.json";



describe("INTERNAL -- Link", () =>
{
	describe(".create()", () =>
	{
		it("works", () =>
		{
			expect( Link.create() ).to.containSubset(
			{
				base: {},
				broken_link_checker: true,
				html: {},
				http: {},
				url: {}
			});
		});
	});



	describe(".isLink()", () =>
	{
		it("works", () =>
		{
			expect( Link.isLink( Link.create() ) ).to.be.true;
			expect( Link.isLink( {} ) ).to.be.false;
		});
	});



	describe(".resolve()", () =>
	{
		it.skip("wtf", () =>
		{
			const obj1={};
			const obj2={};
			Object.defineProperty(obj1, "prop", { get:()=>1 });
			Object.defineProperty(obj2, "prop", { get:()=>2 });
			//expect(obj1).to.be.like(obj2);
			//expect({ key:obj1 }).to.be.like({ key:obj2 });

			const url1 = "http://domain1/";
			const url2 = "http://domain2/";
			expect( new URL(url1) ).to.containSubset({ href:url1 });
			expect({ key:new URL(url1) }).to.containSubset({ key:{ href:url1 } });

			expect( new URL(url1) ).not.to.containSubset({ href:url2 });
			expect({ key:new URL(url1) }).not.to.containSubset({ key:{ href:url2 } });

			expect( new URL(url1) ).to.containSubset( new URL(url1) );
			expect({ key:new URL(url1) }).to.containSubset({ key:new URL(url1) });

			// https://github.com/debitoor/chai-subset/issues/60
			expect( new URL(url1) ).not.to.containSubset( new URL(url2) );
			expect({ key:new URL(url1) }).not.to.containSubset({ key:new URL(url2) });
		});



		it("supports String input", () =>
		{
			const linkUrl = "http://domain.com";
			const link = Link.resolve(Link.create(), linkUrl, linkUrl);

			expect(link).to.containSubset(
			{
				url:
				{
					original: linkUrl,
					resolved: new URL(linkUrl),
					rebased:  new URL(linkUrl),
					redirected: null
				},
				base:
				{
					resolved: new URL(linkUrl),
					rebased:  new URL(linkUrl)
				},
				html: { tag:null },  // No HTML has been parsed
				http: { response:null },  // No request has been made
				internal: true,
				samePage: true,
				broken: null,
				brokenReason: null,
				excluded: null,
				excludedReason: null,
				broken_link_checker: true
			});
		});



		it("supports URL input", () =>
		{
			const linkUrl = "http://domain.com/";
			const link = Link.resolve(Link.create(), new URL(linkUrl), new URL(linkUrl));

			expect(link).to.containSubset(
			{
				url:
				{
					original: linkUrl,
					resolved: new URL(linkUrl),
					rebased:  new URL(linkUrl),
					redirected: null
				},
				base:
				{
					resolved: new URL(linkUrl),
					rebased : new URL(linkUrl)
				},
				html: { tag:null },  // No HTML has been parsed
				http: { response:null },  // No request has been made
				internal: true,
				samePage: true,
				broken: null,
				brokenReason: null,
				excluded: null,
				excludedReason: null,
				broken_link_checker: true
			});
		});



		it("supports combined input (#1)", () =>
		{
			const linkUrl = "http://domain.com/";
			const link = Link.resolve(Link.create(), linkUrl, new URL(linkUrl));

			expect(link).to.containSubset(
			{
				url:
				{
					original: linkUrl,
					resolved: new URL(linkUrl),
					rebased:  new URL(linkUrl),
					redirected: null
				},
				base:
				{
					resolved: new URL(linkUrl),
					rebased : new URL(linkUrl)
				},
				html: { tag:null },  // No HTML has been parsed
				http: { response:null },  // No request has been made
				internal: true,
				samePage: true,
				broken: null,
				brokenReason: null,
				excluded: null,
				excludedReason: null,
				broken_link_checker: true
			});
		});



		it("supports combined input (#2)", () =>
		{
			const linkUrl = "http://domain.com/";
			const link = Link.resolve(Link.create(), new URL(linkUrl), linkUrl);

			expect(link).to.containSubset(
			{
				url:
				{
					original: linkUrl,
					resolved: new URL(linkUrl),
					rebased:  new URL(linkUrl),
					redirected: null
				},
				base:
				{
					resolved: new URL(linkUrl),
					rebased : new URL(linkUrl)
				},
				html: { tag:null },  // No HTML has been parsed
				http: { response:null },  // No request has been made
				internal: true,
				samePage: true,
				broken: null,
				brokenReason: null,
				excluded: null,
				excludedReason: null,
				broken_link_checker: true
			});
		});



		const expectInterpolated = (expected, actual, fixture) =>
		{
			if (actual !== null)
			{
				// Interpolate {{text}}
				const match = /{{([^}]+)}}/.exec(actual);

				if (match !== null)
				{
					actual = fixture[ match[1] ];
				}

				actual = new URL(actual);
			}

			if (actual === null)
			{
				expect(expected).to.be.null;
			}
			else
			{
				expect(expected).to.containSubset(actual);
			}
		};



		Object.entries(URL_TESTS).forEach(([title, fixture]) =>
		{
			const it_skipOrOnly = fixture.skipOrOnly ? it[fixture.skipOrOnly] : it;

			it_skipOrOnly(`${(fixture.resolvedLinkUrl !== null) ? "accepts" : "rejects"} ${title}`, () =>
			{
				const {baseUrl, htmlBaseUrl, internal, linkUrl, rebasedBaseUrl, rebasedLinkUrl, resolvedBaseUrl, resolvedLinkUrl, samePage} = fixture;
				const link = Link.create();

				if (isString(htmlBaseUrl))
				{
					link.html.base = htmlBaseUrl;
				}

				Link.resolve(link, linkUrl, baseUrl);

				expect(link.url.original).to.equal(linkUrl);
				expect(link.url.redirected).to.be.null;
				expectInterpolated(link.url.resolved,  resolvedLinkUrl, fixture);
				expectInterpolated(link.url.rebased,   rebasedLinkUrl,  fixture);
				expectInterpolated(link.base.resolved, resolvedBaseUrl, fixture);
				expectInterpolated(link.base.rebased,  rebasedBaseUrl,  fixture);

				if (isString(htmlBaseUrl))
				{
					expect(link.html.base).to.equal(htmlBaseUrl);
				}

				expect(link.internal).to.equal(internal);
				expect(link.samePage).to.equal(samePage);
			});
		});



		it("accepts a base with a scheme/protocol not specified as accepted", () =>
		{
			const baseUrl = "smtp://domain.com/";
			const linkUrl = "http://domain.com/";
			const link = Link.resolve(Link.create(), linkUrl, baseUrl);

			expect(link).to.containSubset(
			{
				url:
				{
					resolved: new URL(linkUrl)
				},
				base:
				{
					resolved: new URL(baseUrl),
					rebased:  new URL(baseUrl)
				},
				internal: false,
				samePage: false
			});
		});



		it("accepts an html base with a scheme/protocol not specified as accepted", () =>
		{
			const baseUrl     = "http://domain.com/";
			const htmlBaseUrl = "smtp://domain.com/";
			const linkUrl     = "http://domain.com/";

			const link = Link.create();
			link.html.base = htmlBaseUrl;
			Link.resolve(link, linkUrl, baseUrl);

			expect(link).to.containSubset(
			{
				url:
				{
					resolved: new URL(linkUrl)
				},
				base:
				{
					resolved: new URL(baseUrl),
					rebased : new URL(htmlBaseUrl)
				},
				internal: true,
				samePage: true
			});
		});



		it("accepts an absolute url with a scheme/protocol not specified as accepted", () =>
		{
			const baseUrl = "http://domain.com/";
			const linkUrl = "smtp://domain.com/";
			const link = Link.resolve(Link.create(), linkUrl, baseUrl);

			expect(link).to.containSubset(
			{
				url:
				{
					resolved: new URL(linkUrl),
					rebased:  new URL(linkUrl)
				},
				internal: false,
				samePage: false
			});
		});



		// TODO :: what part is rejected?
		it("rejects a relative url with a base containing a scheme/protocol not specified as accepted", () =>
		{
			const baseUrl = "smtp://domain.com/";
			const linkUrl = "path/resource.html?query#hash";
			const link = Link.resolve(Link.create(), linkUrl, baseUrl);

			expect(link).to.containSubset(
			{
				url:
				{
					original: linkUrl,
					resolved: new URL(baseUrl + linkUrl),
					rebased:  new URL(baseUrl + linkUrl)
				},
				base:
				{
					resolved: new URL(baseUrl),
					rebased:  new URL(baseUrl)
				},
				internal: true,
				samePage: false
			});
		});
	});



	describe(".redirect()", () =>
	{
		it("works", () =>
		{
			const baseUrl        = "http://domain1.com/file1.html";
			const linkUrl        = "http://domain1.com/file2.html";
			const redirectedUrl1 = "http://domain1.com/file3.html";
			const redirectedUrl2 = "http://domain2.com/file.html";
			const redirectedUrl3 = "https://domain1.com/file.html";

			const link = redirectedUrl =>
			{
				const result = Link.resolve(Link.create(), linkUrl, baseUrl);
				Link.redirect(result, redirectedUrl);
				return result;
			};

			expect(link(redirectedUrl1)).to.containSubset(
			{
				url:
				{
					original:   linkUrl,
					resolved:   new URL(linkUrl),
					rebased:    new URL(linkUrl),
					redirected: new URL(redirectedUrl1)
				},
				base:
				{
					resolved: new URL(baseUrl),
					rebased:  new URL(baseUrl)
				},
				internal: true,
				samePage: false
			});

			expect(link(redirectedUrl2)).to.containSubset(
			{
				url:
				{
					original:   linkUrl,
					resolved:   new URL(linkUrl),
					rebased:    new URL(linkUrl),
					redirected: new URL(redirectedUrl2)
				},
				base:
				{
					resolved: new URL(baseUrl),
					rebased:  new URL(baseUrl)
				},
				internal: false,
				samePage: false
			});

			expect(link(redirectedUrl3)).to.containSubset(
			{
				url:
				{
					original:   linkUrl,
					resolved:   new URL(linkUrl),
					rebased:    new URL(linkUrl),
					redirected: new URL(redirectedUrl3)
				},
				base:
				{
					resolved: new URL(baseUrl),
					rebased:  new URL(baseUrl)
				},
				internal: false,
				samePage: false
			});
		});
	});



	describe(".setBroken()", () =>
	{
		it("works", () =>
		{
			const link = Link.create();
			const reason = "HTTP_404";

			expect( Link.setBroken(link,reason) ).to.containSubset(
			{
				broken: true,
				brokenReason: reason
			});
		});



		it("overrides unknown reason values", () =>
		{
			const reasons =
			[
				"BLC_FAKE",
				"ERRNO_FAKE",
				"HTTP_FAKE",
				1,
				null,
				undefined
			];

			reasons.forEach(reason =>
			{
				const link = Link.create();

				expect( Link.setBroken(link,reason) ).to.containSubset(
				{
					broken: true,
					brokenReason: "BLC_UNKNOWN"
				});
			});
		});
	});
});
