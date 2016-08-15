/* eslint-disable sort-keys */
import {describe, it} from "mocha";
import {expect} from "chai";
import isString from "is-string";
import Link, {HTML_BASE_HREF, IS_INTERNAL, IS_SAME_PAGE, ORIGINAL_URL, REBASED_BASE_URL, REBASED_URL, REDIRECTED_URL, RESOLVED_BASE_URL, RESOLVED_URL} from "../lib/internal/Link";
import {simplifyLink} from "./helpers";
import URL_TESTS from "./fixtures-json/Link.json";



const INTERPOLATED_URL_TESTS = (() =>
{
	const interpolatableKeys = ["rebasedBaseURL", "rebasedLinkURL", "resolvedBaseURL", "resolvedLinkURL"];

	return Object.fromEntries
	(
		Object.entries(URL_TESTS).map(([title, fixture]) =>
		{
			fixture = Object.fromEntries
			(
				Object.entries(fixture).map(([key, value]) =>
				{
					if (interpolatableKeys.includes(key))
					{
						// Interpolate {{key}}
						const match = /{{([^}]+)}}/.exec(value);

						if (match !== null)
						{
							value = fixture[ match[1] ];
						}

						if (value !== null)
						{
							value = new URL(value);
						}
					}

					return [key, value];
				})
			);

			return [title, fixture];
		})
	);
})();



describe("INTERNAL -- Link", () =>
{
	it("is an extended Map", () =>
	{
		expect(new Link()).to.be.an.instanceOf(Map);
	});



	it("rejects setting unknown keys", () =>
	{
		const link = new Link();
		expect(() => link.set("someKey", "value")).to.throw(TypeError);
	});



	it("rejects setting undefined values", () =>
	{
		const link = new Link();
		expect(() => link.set(ORIGINAL_URL, null)).not.to.throw();
		expect(() => link.set(ORIGINAL_URL, undefined)).to.throw(TypeError);
	});



	it("returns undefined when getting unknown keys", () =>
	{
		const link = new Link();
		expect(link.get("someKey")).to.be.undefined;
	});



	it("supports cloning", () =>
	{
		const link1 = new Link();
		link1.set(ORIGINAL_URL, "value");

		const link2 = new Link(link1);
		expect(link2).to.not.equal(link1);
		expect(link2.originalURL).to.equal(link1.originalURL);
	});



	it("can be stringified as JSON", () =>
	{
		const link = new Link();
		link.set(ORIGINAL_URL, new URL("http://domain.com/"));

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

			expect(simplifyLink(link)).to.deep.include(
			{
				brokenReason: reason,
				isBroken: true
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

				expect(simplifyLink(link)).to.deep.include(
				{
					brokenReason: "BLC_UNKNOWN",
					isBroken: true
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

			expect(simplifyLink(link)).to.deep.include(
			{
				excludedReason: reason,
				wasExcluded: true
			});
		});
	});



	describe("include()", () =>
	{
		it("works", () =>
		{
			const link = new Link().exclude("BLC_CUSTOM").include();

			expect(simplifyLink(link)).to.deep.include(
			{
				excludedReason: null,
				wasExcluded: false
			});
		});
	});



	describe("mend()", () =>
	{
		it("works", () =>
		{
			const link = new Link().break("HTTP_404").mend();

			expect(simplifyLink(link)).to.deep.include(
			{
				brokenReason: null,
				isBroken: false
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
				[        linkURL,          linkURL ],
				[new URL(linkURL), new URL(linkURL)],
				[        linkURL,  new URL(linkURL)],
				[new URL(linkURL),         linkURL ]
			];

			argumentCombinations.forEach(args =>
			{
				const link = new Link().resolve(...args);

				expect(simplifyLink(link)).to.deep.include(
				{
					originalURL:         linkURL,
					resolvedURL: new URL(linkURL),
					rebasedURL:  new URL(linkURL),
					redirectedURL: null,

					resolvedBaseURL: new URL(linkURL),
					rebasedBaseURL:  new URL(linkURL),

					isInternal: true,
					isSamePage: true,

					// No HTML has been parsed
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

					// No request has been made
					httpResponse: null,
					httpResponseWasCached: null,
					isBroken: null,
					brokenReason: null,

					// No filtering has been performed
					wasExcluded: null,
					excludedReason: null
				});
			});
		});



		const expectNullOrURL = (actual, expected) =>
		{
			if (expected === null)
			{
				expect(actual).to.be.null;
			}
			else
			{
				expect(actual).to.deep.equal(expected);
			}
		};



		Object.entries(INTERPOLATED_URL_TESTS).forEach(([title, fixture]) =>
		{
			// eslint-disable-next-line camelcase
			const it_skipOrOnly = it[fixture.skipOrOnly] ?? it;

			it_skipOrOnly(`${(fixture.resolvedLinkURL !== null) ? "accepts" : "rejects"} ${title}`, () =>
			{
				const {baseURL, htmlBaseURL, internal, linkURL, rebasedBaseURL, rebasedLinkURL, resolvedBaseURL, resolvedLinkURL, samePage} = fixture;
				const link = new Link();

				if (isString(htmlBaseURL))
				{
					link.set(HTML_BASE_HREF, htmlBaseURL);
				}

				link.resolve(linkURL, baseURL);

				expect(link.get(ORIGINAL_URL)).to.equal(linkURL);
				expect(link.get(REDIRECTED_URL)).to.be.null;
				expectNullOrURL(link.get(RESOLVED_URL),      resolvedLinkURL);
				expectNullOrURL(link.get(REBASED_URL),       rebasedLinkURL);
				expectNullOrURL(link.get(RESOLVED_BASE_URL), resolvedBaseURL);
				expectNullOrURL(link.get(REBASED_BASE_URL),  rebasedBaseURL);

				if (isString(htmlBaseURL))
				{
					expect(link.get(HTML_BASE_HREF)).to.equal(htmlBaseURL);
				}

				expect(link.get(IS_INTERNAL)).to.equal(internal);
				expect(link.get(IS_SAME_PAGE)).to.equal(samePage);
			});
		});



		it("accepts a base with a scheme/protocol not specified as accepted", () =>
		{
			const baseURL = "smtp://domain.com/";
			const linkURL = "http://domain.com/";
			const link = new Link().resolve(linkURL, baseURL);

			expect(simplifyLink(link)).to.deep.include(
			{
				resolvedURL:     new URL(linkURL),
				resolvedBaseURL: new URL(baseURL),
				rebasedBaseURL:  new URL(baseURL),
				isInternal: false,
				isSamePage: false
			});
		});



		it("accepts an html base with a scheme/protocol not specified as accepted", () =>
		{
			const baseURL     = "http://domain.com/";
			const htmlBaseURL = "smtp://domain.com/";
			const linkURL     = "http://domain.com/";

			const link = new Link();
			link.set(HTML_BASE_HREF, htmlBaseURL);
			link.resolve(linkURL, baseURL);

			expect(simplifyLink(link)).to.deep.include(
			{
				resolvedURL:     new URL(linkURL),
				resolvedBaseURL: new URL(baseURL),
				rebasedBaseURL:  new URL(htmlBaseURL),
				isInternal: true,
				isSamePage: true
			});
		});



		it("accepts an absolute url with a scheme/protocol not specified as accepted", () =>
		{
			const baseURL = "http://domain.com/";
			const linkURL = "smtp://domain.com/";
			const link = new Link().resolve(linkURL, baseURL);

			expect(simplifyLink(link)).to.deep.include(
			{
				resolvedURL: new URL(linkURL),
				rebasedURL:  new URL(linkURL),
				isInternal: false,
				isSamePage: false
			});
		});



		it("accepts a relative url with a base containing a scheme/protocol not specified as accepted", () =>
		{
			const baseURL = "smtp://domain.com/";
			const linkURL = "path/resource.html?query#hash";
			const link = new Link().resolve(linkURL, baseURL);

			expect(simplifyLink(link)).to.deep.include(
			{
				originalURL:                          linkURL,
				resolvedURL:     new URL(`${baseURL}${linkURL}`),
				rebasedURL:      new URL(`${baseURL}${linkURL}`),
				resolvedBaseURL: new URL(baseURL),
				rebasedBaseURL:  new URL(baseURL),
				isInternal: true,
				isSamePage: false
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

			expect(link(redirectedURL1)).to.deep.include(
			{
				originalURL:             linkURL,
				resolvedURL:     new URL(linkURL),
				rebasedURL:      new URL(linkURL),
				redirectedURL:   new URL(redirectedURL1),
				resolvedBaseURL: new URL(baseURL),
				rebasedBaseURL:  new URL(baseURL),
				isInternal: true,
				isSamePage: false
			});

			expect(link(redirectedURL2)).to.deep.include(
			{
				originalURL:             linkURL,
				resolvedURL:     new URL(linkURL),
				rebasedURL:      new URL(linkURL),
				redirectedURL:   new URL(redirectedURL2),
				resolvedBaseURL: new URL(baseURL),
				rebasedBaseURL:  new URL(baseURL),
				isInternal: false,
				isSamePage: false
			});

			expect(link(redirectedURL3)).to.deep.include(
			{
				originalURL:             linkURL,
				resolvedURL:     new URL(linkURL),
				rebasedURL:      new URL(linkURL),
				redirectedURL:   new URL(redirectedURL3),
				resolvedBaseURL: new URL(baseURL),
				rebasedBaseURL:  new URL(baseURL),
				isInternal: false,
				isSamePage: false
			});
		});
	});
});
