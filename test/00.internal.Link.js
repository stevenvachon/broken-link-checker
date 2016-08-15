/* eslint-disable sort-keys */
import {describe, it} from "mocha";
import {expect} from "chai";
import isString from "is-string";
import Link from "../lib/internal/Link";
import {simplifyLink} from "./helpers";
import URL_TESTS from "./fixtures-json/Link.json";



describe("INTERNAL -- Link", () =>
{
	it("is an extended Map", () =>
	{
		expect(new Link()).to.be.an.instanceOf(Map);
	});



	it("has static constants for key names", () =>
	{
		const someKeys =
		[
			"ORIGINAL_URL",
			"RESOLVED_URL",
			"REBASED_URL",
			"REDIRECTED_URL"
		];

		someKeys.forEach(key =>
		{
			expect(Link).to.include.key(key);
			expect(() => Link[key] = "new value").to.throw();
			expect(() => delete Link[key]).to.throw();
		});
	});



	it("rejects setting unknown keys", () =>
	{
		const link = new Link();
		expect(() => link.set("someKey", "value")).to.throw(TypeError);
	});



	it("rejects setting undefined values", () =>
	{
		const link = new Link();
		expect(() => link.set(Link.ORIGINAL_URL, null)).not.to.throw();
		expect(() => link.set(Link.ORIGINAL_URL, undefined)).to.throw(TypeError);
	});



	it("returns undefined when getting unknown keys", () =>
	{
		const link = new Link();
		expect(link.get("someKey")).to.be.undefined;
	});



	it("supports cloning", () =>
	{
		const link1 = new Link();
		link1.set(Link.ORIGINAL_URL, "value");

		const link2 = new Link(link1);
		expect(link2).to.not.equal(link1);
		expect(link2[Link.ORIGINAL_URL]).to.equal(link1[Link.ORIGINAL_URL]);
	});



	it("can be stringified as JSON", () =>
	{
		const link = new Link();
		link.set(Link.ORIGINAL_URL, new URL("http://domain.com/"));

		expect(JSON.parse(JSON.stringify(link))).to.deep.equal(
		{
			brokenReason: null,
			excludedReason: null,
			htmlAttrName: null,
			htmlAttrs: null,
			htmlBaseHref: null,
			htmlIndex: null,
			htmlLocation: null,
			htmlOffsetIndex: null,
			htmlSelector: null,
			htmlTag: null,
			htmlTagName: null,
			htmlText: null,
			httpResponse: null,
			httpResponseWasCached: null,
			isBroken: null,
			isInternal: null,
			isSamePage: null,
			originalURL: "http://domain.com/",
			rebasedBaseURL: null,
			rebasedURL: null,
			redirectedURL: null,
			resolvedBaseURL: null,
			resolvedURL: null,
			wasExcluded: null
		});
	});



	describe("break()", () =>
	{
		it("works", () =>
		{
			const reason = "HTTP_404";
			const link = new Link().break(reason);

			expect(simplifyLink(link)).to.deep.contain(
			{
				[Link.BROKEN_REASON]: reason,
				[Link.IS_BROKEN]: true
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
				const link = new Link().break(reason);

				expect(simplifyLink(link)).to.deep.contain(
				{
					[Link.BROKEN_REASON]: "BLC_UNKNOWN",
					[Link.IS_BROKEN]: true
				});
			});
		});
	});



	describe("exclude()", () =>
	{
		it("works", () =>
		{
			const reason = "BLC_CUSTOM";
			const link = new Link().exclude(reason);

			expect(simplifyLink(link)).to.deep.contain(
			{
				[Link.EXCLUDED_REASON]: reason,
				[Link.WAS_EXCLUDED]: true
			});
		});
	});



	describe("include()", () =>
	{
		it("works", () =>
		{
			const link = new Link().exclude("BLC_CUSTOM").include();

			expect(simplifyLink(link)).to.deep.contain(
			{
				[Link.EXCLUDED_REASON]: null,
				[Link.WAS_EXCLUDED]: false
			});
		});
	});



	describe("mend()", () =>
	{
		it("works", () =>
		{
			const link = new Link().break("HTTP_404").mend();

			expect(simplifyLink(link)).to.deep.contain(
			{
				[Link.BROKEN_REASON]: null,
				[Link.IS_BROKEN]: false
			});
		});
	});



	describe("resolve()", () =>
	{
		it("supports string and URL arguments", () =>
		{
			const linkURL = "http://domain.com/";

			const argumentCombinations =
			[
				[linkURL, linkURL],
				[new URL(linkURL), new URL(linkURL)],
				[linkURL, new URL(linkURL)],
				[new URL(linkURL), linkURL]
			];

			argumentCombinations.forEach(args =>
			{
				const link = new Link().resolve(...args);

				expect(simplifyLink(link)).to.deep.contain(
				{
					[Link.ORIGINAL_URL]: linkURL,
					[Link.RESOLVED_URL]: new URL(linkURL),
					[Link.REBASED_URL]:  new URL(linkURL),
					[Link.REDIRECTED_URL]: null,

					[Link.RESOLVED_BASE_URL]: new URL(linkURL),
					[Link.REBASED_BASE_URL]:  new URL(linkURL),

					[Link.IS_INTERNAL]: true,
					[Link.IS_SAME_PAGE]: true,

					// No HTML has been parsed
					[Link.HTML_ATTR_NAME]: null,
					[Link.HTML_ATTRS]: null,
					[Link.HTML_BASE_HREF]: null,
					[Link.HTML_INDEX]: null,
					[Link.HTML_LOCATION]: null,
					[Link.HTML_OFFSET_INDEX]: null,
					[Link.HTML_SELECTOR]: null,
					[Link.HTML_TAG]: null,
					[Link.HTML_TAG_NAME]: null,
					[Link.HTML_TEXT]: null,

					// No request has been made
					[Link.HTTP_RESPONSE]: null,
					[Link.HTTP_RESPONSE_WAS_CACHED]: null,
					[Link.IS_BROKEN]: null,
					[Link.BROKEN_REASON]: null,

					// No filtering has been performed
					[Link.WAS_EXCLUDED]: null,
					[Link.EXCLUDED_REASON]: null
				});
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
				actual = simplifyLink(actual);
				expected = simplifyLink(expected);

				expect(expected).to.deep.contain(actual);
			}
		};



		Object.entries(URL_TESTS).forEach(([title, fixture]) =>
		{
			// eslint-disable-next-line camelcase
			const it_skipOrOnly = it[fixture.skipOrOnly] ?? it;

			it_skipOrOnly(`${(fixture.resolvedLinkURL !== null) ? "accepts" : "rejects"} ${title}`, () =>
			{
				const {baseURL, htmlBaseURL, internal, linkURL, rebasedBaseURL, rebasedLinkURL, resolvedBaseURL, resolvedLinkURL, samePage} = fixture;
				const link = new Link();

				if (isString(htmlBaseURL))
				{
					link.set(Link.HTML_BASE_HREF, htmlBaseURL);
				}

				link.resolve(linkURL, baseURL);

				expect(link.get(Link.ORIGINAL_URL)).to.equal(linkURL);
				expect(link.get(Link.REDIRECTED_URL)).to.be.null;
				expectInterpolated(link.get(Link.RESOLVED_URL),      resolvedLinkURL, fixture);
				expectInterpolated(link.get(Link.REBASED_URL),       rebasedLinkURL,  fixture);
				expectInterpolated(link.get(Link.RESOLVED_BASE_URL), resolvedBaseURL, fixture);
				expectInterpolated(link.get(Link.REBASED_BASE_URL),  rebasedBaseURL,  fixture);

				if (isString(htmlBaseURL))
				{
					expect(link.get(Link.HTML_BASE_HREF)).to.equal(htmlBaseURL);
				}

				expect(link.get(Link.IS_INTERNAL)).to.equal(internal);
				expect(link.get(Link.IS_SAME_PAGE)).to.equal(samePage);
			});
		});



		it("accepts a base with a scheme/protocol not specified as accepted", () =>
		{
			const baseURL = "smtp://domain.com/";
			const linkURL = "http://domain.com/";
			const link = new Link().resolve(linkURL, baseURL);

			expect(simplifyLink(link)).to.deep.contain(
			{
				[Link.RESOLVED_URL]:      new URL(linkURL),
				[Link.RESOLVED_BASE_URL]: new URL(baseURL),
				[Link.REBASED_BASE_URL]:  new URL(baseURL),
				[Link.IS_INTERNAL]: false,
				[Link.IS_SAME_PAGE]: false
			});
		});



		it("accepts an html base with a scheme/protocol not specified as accepted", () =>
		{
			const baseURL     = "http://domain.com/";
			const htmlBaseURL = "smtp://domain.com/";
			const linkURL     = "http://domain.com/";

			const link = new Link();
			link.set(Link.HTML_BASE_HREF, htmlBaseURL);
			link.resolve(linkURL, baseURL);

			expect(simplifyLink(link)).to.deep.contain(
			{
				[Link.RESOLVED_URL]:      new URL(linkURL),
				[Link.RESOLVED_BASE_URL]: new URL(baseURL),
				[Link.REBASED_BASE_URL]:  new URL(htmlBaseURL),
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: true
			});
		});



		it("accepts an absolute url with a scheme/protocol not specified as accepted", () =>
		{
			const baseURL = "http://domain.com/";
			const linkURL = "smtp://domain.com/";
			const link = new Link().resolve(linkURL, baseURL);

			expect(simplifyLink(link)).to.deep.contain(
			{
				[Link.RESOLVED_URL]: new URL(linkURL),
				[Link.REBASED_URL]:  new URL(linkURL),
				[Link.IS_INTERNAL]: false,
				[Link.IS_SAME_PAGE]: false
			});
		});



		// @todo what part is rejected?
		it("rejects a relative url with a base containing a scheme/protocol not specified as accepted", () =>
		{
			const baseURL = "smtp://domain.com/";
			const linkURL = "path/resource.html?query#hash";
			const link = new Link().resolve(linkURL, baseURL);

			expect(simplifyLink(link)).to.deep.contain(
			{
				[Link.ORIGINAL_URL]:      linkURL,
				[Link.RESOLVED_URL]:      new URL(baseURL + linkURL),
				[Link.REBASED_URL]:       new URL(baseURL + linkURL),
				[Link.RESOLVED_BASE_URL]: new URL(baseURL),
				[Link.REBASED_BASE_URL]:  new URL(baseURL),
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});
		});
	});



	describe("redirect()", () =>
	{
		it("works", () =>
		{
			const baseURL        = "http://domain1.com/file1.html";
			const linkURL        = "http://domain1.com/file2.html";
			const redirectedURL1 = "http://domain1.com/file3.html";
			const redirectedURL2 = "http://domain2.com/file.html";
			const redirectedURL3 = "https://domain1.com/file.html";

			const link = redirectedURL =>
			{
				const result = new Link().resolve(linkURL, baseURL).redirect(redirectedURL);
				return simplifyLink(result);
			};

			expect(link(redirectedURL1)).to.deep.contain(
			{
				[Link.ORIGINAL_URL]:      linkURL,
				[Link.RESOLVED_URL]:      new URL(linkURL),
				[Link.REBASED_URL]:       new URL(linkURL),
				[Link.REDIRECTED_URL]:    new URL(redirectedURL1),
				[Link.RESOLVED_BASE_URL]: new URL(baseURL),
				[Link.REBASED_BASE_URL]:  new URL(baseURL),
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});

			expect(link(redirectedURL2)).to.deep.contain(
			{
				[Link.ORIGINAL_URL]:      linkURL,
				[Link.RESOLVED_URL]:      new URL(linkURL),
				[Link.REBASED_URL]:       new URL(linkURL),
				[Link.REDIRECTED_URL]:    new URL(redirectedURL2),
				[Link.RESOLVED_BASE_URL]: new URL(baseURL),
				[Link.REBASED_BASE_URL]:  new URL(baseURL),
				[Link.IS_INTERNAL]: false,
				[Link.IS_SAME_PAGE]: false
			});

			expect(link(redirectedURL3)).to.deep.contain(
			{
				[Link.ORIGINAL_URL]:      linkURL,
				[Link.RESOLVED_URL]:      new URL(linkURL),
				[Link.REBASED_URL]:       new URL(linkURL),
				[Link.REDIRECTED_URL]:    new URL(redirectedURL3),
				[Link.RESOLVED_BASE_URL]: new URL(baseURL),
				[Link.REBASED_BASE_URL]:  new URL(baseURL),
				[Link.IS_INTERNAL]: false,
				[Link.IS_SAME_PAGE]: false
			});
		});
	});
});
