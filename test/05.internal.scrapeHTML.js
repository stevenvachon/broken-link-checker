/* eslint-disable sort-keys */
import {describe, it} from "mocha";
import {expect} from "chai";
import parseHTML from "../lib/internal/parseHTML";
import {REBASED_BASE_URL, REBASED_URL, REDIRECTED_URL, RESOLVED_BASE_URL, RESOLVED_URL} from "../lib/internal/Link";
import scrapeHTML from "../lib/internal/scrapeHTML";
import {simplifyLinks} from "./helpers";
import TAG_TESTS from "./fixtures-json/scrapeHTML.json";



const wrapper = async (input, baseURL, robots) =>
{
	const document = await parseHTML(input);
	return simplifyLinks(scrapeHTML(document, baseURL, robots));  // @todo https://github.com/tc39/proposal-pipeline-operator
};



describe("INTERNAL -- scrapeHTML", () =>
{
	describe("link tags & attributes", () =>
	{
		Object.entries(TAG_TESTS).forEach(([title, {html, links: expectedLinks, skipOrOnly}]) =>
		{
			// eslint-disable-next-line camelcase
			const it_skipOrOnly = it[skipOrOnly] ?? it;

			it_skipOrOnly(`supports ${title}`, async () =>
			{
				const links = await wrapper(html, "http://domain.com/");

				// Convert applicable URLs to `URL` instances
				[REBASED_BASE_URL, REBASED_URL, REDIRECTED_URL, RESOLVED_BASE_URL, RESOLVED_URL].forEach(key =>
				{
					expectedLinks.forEach(link =>
					{
						if (link[key] !== null)
						{
							link[key] = new URL(link[key]);
						}
					});
				});

				expect(links).to.have.length(expectedLinks.length);

				links.forEach((link, i) =>
				{
					expect(link).to.deep.include(expectedLinks[i]);
				});
			});
		});
	});



	describe("edge cases", () =>
	{
		it(`ignores <meta content/> lacking http-equiv="refresh"`, async () =>
		{
			let links;

			links = await wrapper(`<meta http-equiv="other" content="5; url=file.html">`);
			expect(links).to.be.empty;

			links = await wrapper(`<meta content="5; url=file.html">`);
			expect(links).to.be.empty;
		});



		it("supports link attributes with values surrounded by spaces", async () =>
		{
			expect(await wrapper(`<a href=" file.html ">link</a>`))
				.to.have.length(1)
				.property(0).to.deep.include(  // @todo https://github.com/chaijs/chai/issues/1290
				{
					originalURL: "file.html",
					htmlTag: `<a href=" file.html ">`
				});
		});



		it("supports link attributes preceded by non-link attributes", async () =>
		{
			expect(await wrapper(`<a id="link" href="file.html">link</a>`))
				.to.have.length(1)
				.property(0).to.deep.include(
				{
					originalURL: "file.html",
					htmlAttrName: "href",
					htmlAttrs: { href:"file.html", id:"link" },
					htmlTag: `<a id="link" href="file.html">`
				});
		});



		it("supports consecutive link attributes", async () =>
		{
			expect(await wrapper(`<img src="file.png" longdesc="file.html">`))
				.to.have.length(2)
				.to.containSubset(
				[
					{
						originalURL: "file.png",
						htmlSelector: "html > body > img:nth-child(1)",
						htmlTagName: "img",
						htmlAttrName: "src",
						htmlTag: `<img src="file.png" longdesc="file.html">`
					},
					{
						originalURL: "file.html",
						htmlSelector: "html > body > img:nth-child(1)",
						htmlTagName: "img",
						htmlAttrName: "longdesc",
						htmlTag: `<img src="file.png" longdesc="file.html">`
					}
				]);
		});



		it("ignores redundant link attributes", async () =>
		{
			expect(await wrapper(`<a href="file.html" href="ignored.html">link</a>`))
				.to.have.length(1)
				.property(0).to.deep.include(
				{
					originalURL: "file.html",
					htmlAttrName: "href",
					htmlTag: `<a href="file.html">`
				});
		});



		it("supports consecutive link elements", async () =>
		{
			expect(await wrapper(`<a href="file1.html">link1</a> <a href="file2.html">link2</a>`))
				.to.have.length(2)
				.to.containSubset(
				[
					{
						originalURL: "file1.html",
						htmlSelector: "html > body > a:nth-child(1)",
						htmlTag: `<a href="file1.html">`,
						htmlText: "link1"
					},
					{
						originalURL: "file2.html",
						htmlSelector: "html > body > a:nth-child(2)",
						htmlTag: `<a href="file2.html">`,
						htmlText: "link2"
					}
				]);
		});



		it("supports nonconsecutive link elements", async () =>
		{
			let html = `<a href="file1.html">link1</a>`;
			html += `content <span>content</span> content`;
			html += `<a href="file2.html">link2</a>`;

			expect(await wrapper(html))
				.to.have.length(2)
				.to.containSubset(
				[
					{
						originalURL: "file1.html",
						htmlSelector: "html > body > a:nth-child(1)",
						htmlTag: `<a href="file1.html">`,
						htmlText: "link1"
					},
					{
						originalURL: "file2.html",
						htmlSelector: "html > body > a:nth-child(3)",
						htmlTag: `<a href="file2.html">`,
						htmlText: "link2"
					}
				]);
		});



		it("supports nested link elements", async () =>
		{
			expect(await wrapper(`<a href="file1.html"><q cite="file2.html">quote</q></a>`))
				.to.have.length(2)
				.to.containSubset(
				[
					{
						originalURL: "file1.html",
						htmlSelector: "html > body > a:nth-child(1)",
						htmlTagName: "a",
						htmlAttrName: "href",
						htmlTag: `<a href="file1.html">`,
						htmlText: "quote"
					},
					{
						originalURL: "file2.html",
						htmlSelector: "html > body > a:nth-child(1) > q:nth-child(1)",
						htmlTagName: "q",
						htmlAttrName: "cite",
						htmlTag: `<q cite="file2.html">`,
						htmlText: "quote"
					}
				]);
		});



		it("supports link elements with nested elements", async () =>
		{
			expect(await wrapper(`<a href="file.html"><span>text</span></a>`))
				.to.have.length(1)
				.property(0).to.deep.include(
				{
					originalURL: "file.html",
					htmlSelector: "html > body > a:nth-child(1)",
					htmlTagName: "a",
					htmlAttrName: "href",
					htmlTag: `<a href="file.html">`,
					htmlText: "text"
				});
		});



		it("supports void elements", async () =>
		{
			expect(await wrapper(`<img src="file.png"> content`))
				.to.have.length(1)
				.property(0).to.deep.include(
				{
					originalURL: "file.png",
					htmlSelector: "html > body > img:nth-child(1)",
					htmlTagName: "img",
					htmlAttrName: "src",
					htmlTag: `<img src="file.png">`,
					htmlText: null
				});
		});



		it("supports multi-url attribute values", async () =>
		{
			expect(await wrapper(`<a ping="file1.html, file2.html"><img srcset="file3.png 2x, file4.png 100w"></a>`))
				.to.have.length(4)
				.to.containSubset(
				[
					{
						originalURL: "file1.html",
						htmlSelector: "html > body > a:nth-child(1)",
						htmlTagName: "a",
						htmlAttrName: "ping",
						htmlTag: `<a ping="file1.html, file2.html">`,
						htmlText: ""
					},
					{
						originalURL: "file2.html",
						htmlSelector: "html > body > a:nth-child(1)",
						htmlTagName: "a",
						htmlAttrName: "ping",
						htmlTag: `<a ping="file1.html, file2.html">`,
						htmlText: ""
					},
					{
						originalURL: "file3.png",
						htmlSelector: "html > body > a:nth-child(1) > img:nth-child(1)",
						htmlTagName: "img",
						htmlAttrName: "srcset",
						htmlTag: `<img srcset="file3.png 2x, file4.png 100w">`,
						htmlText: null
					},
					{
						originalURL: "file4.png",
						htmlSelector: "html > body > a:nth-child(1) > img:nth-child(1)",
						htmlTagName: "img",
						htmlAttrName: "srcset",
						htmlTag: `<img srcset="file3.png 2x, file4.png 100w">`,
						htmlText: null
					}
				]);
		});



		it("supports detailed selectors and omit nth-child from html and body", async () =>
		{
			let html = `<html><head><title>title</title></head><body>`;
			html += `<div><a href="file1.html">link1</a>`;
			html += `<div><a href="file2.html">link2</a></div>`;
			html += `<div><a href="file3.html">link3</a></div>`;
			html += `<a href="file4.html">link4</a></div>`;
			html += `<a href="file5.html">link5</a>`;
			html += `</body></html>`;

			expect(await wrapper(html))
				.to.have.length(5)
				.to.containSubset(
				[
					{
						originalURL: "file1.html",
						htmlSelector: "html > body > div:nth-child(1) > a:nth-child(1)",
						htmlTag: `<a href="file1.html">`,
						htmlText: "link1"
					},
					{
						originalURL: "file2.html",
						htmlSelector: "html > body > div:nth-child(1) > div:nth-child(2) > a:nth-child(1)",
						htmlTag: `<a href="file2.html">`,
						htmlText: "link2"
					},
					{
						originalURL: "file3.html",
						htmlSelector: "html > body > div:nth-child(1) > div:nth-child(3) > a:nth-child(1)",
						htmlTag: `<a href="file3.html">`,
						htmlText: "link3"
					},
					{
						originalURL: "file4.html",
						htmlSelector: "html > body > div:nth-child(1) > a:nth-child(4)",
						htmlTag: `<a href="file4.html">`,
						htmlText: "link4"
					},
					{
						originalURL: "file5.html",
						htmlSelector: "html > body > a:nth-child(2)",
						htmlTag: `<a href="file5.html">`,
						htmlText: "link5"
					}
				]);
		});



		it("supports link attribute source code locations", async () =>
		{
			const html = `\n\t<a href="file.html">link</a>`;
			const links = await wrapper(html);

			expect(links)
				.to.have.length(1)
				.property(0).to.deep.include(
				{
					htmlLocation:
					{
						endCol: 21,
						endLine: 2,
						endOffset: 21,
						startCol: 5,
						startLine: 2,
						startOffset: 5
					}
				});

			const {htmlLocation: {endOffset, startOffset}} = links[0];

			expect( html.substring(startOffset,endOffset) ).to.equal(`href="file.html"`);
		});



		it("supports <base/>", async () =>
		{
			expect(await wrapper(`<head><base href="/dir/"></head> <a href="file.html">link</a>`))
				.to.have.length(1)
				.property(0).to.deep.include(
				{
					originalURL: "file.html",
					htmlBaseHref: "/dir/"
				});
		});



		it("supports irregular use of <base/>", async () =>
		{
			let html = `<base href="/correct/">`;
			html += `<a href="file.html">link</a>`;

			expect(await wrapper(html))
				.to.have.length(1)
				.property(0).to.deep.include(
				{
					originalURL: "file.html",
					htmlBaseHref: "/correct/"
				});
		});



		it("ignores invalid use of <base/>", async () =>
		{
			let html = `<base>`;
			html += `<a href="file.html">link</a>`;

			expect(await wrapper(html))
				.to.have.length(1)
				.property(0).to.deep.include(
				{
					originalURL: "file.html",
					htmlBaseHref: null
				});
		});



		it("ignores multiple uses of <base/>", async () =>
		{
			let html = `<base href="/first/">`;
			html += `<head><base href="/ignored1/"><base href="/ignored2/"></head>`;
			html += `<head><base href="/ignored3/"></head>`;
			html += `<base href="/ignored4/">`;
			html += `<a href="file.html">link</a>`;

			expect(await wrapper(html))
				.to.have.length(1)
				.property(0).to.deep.include(
				{
					originalURL: "file.html",
					htmlBaseHref: "/first/"
				});
		});



		it("supports invalid html structure", async () =>
		{
			let html = `<html><head><title>title</title></head><body>`;
			html += `<table>`;
			html += `<p><div><a href="file1.html">link<b>1</div></a></b>`;
			html += `<tr><td>content</td></tr></table>`;
			html += `<a href="file2.html">link2</a>`;
			html += `</wtf></body></html>`;

			expect(await wrapper(html))
				.to.have.length(2)
				.to.containSubset(
				[
					{
						originalURL: "file1.html",
						htmlSelector: "html > body > div:nth-child(2) > a:nth-child(1)",
						htmlTag: `<a href="file1.html">`,
						htmlText: "link1"
					},
					{
						originalURL: "file2.html",
						htmlSelector: "html > body > a:nth-child(4)",
						htmlTag: `<a href="file2.html">`,
						htmlText: "link2"
					}
				]);
		});



		it("supports invalid html structure (#2)", async () =>
		{
			let html = `<html><head><title>title</title></head><body>`;
			html += `<a href="404.html">1<p>2</a>`;
			html += `</body></html>`;

			expect(await wrapper(html))
				.to.have.length(2)
				.to.containSubset(
				[
					{
						originalURL: "404.html",
						htmlSelector: "html > body > a:nth-child(1)",
						htmlTag: `<a href="404.html">`,
						htmlText: "1"
					},
					{
						originalURL: "404.html",
						htmlSelector: "html > body > p:nth-child(2) > a:nth-child(1)",
						htmlTag: `<a href="404.html">`,
						htmlText: "2"
					}
				]);
		});



		it("supports empty html documents", async () =>
		{
			expect(await wrapper("")).to.be.empty;
			expect(await wrapper(" ")).to.be.empty;
			expect(await wrapper("\n")).to.be.empty;
			expect(await wrapper("non-html")).to.be.empty;
		});



		it(`fires "complete" when no links found`, async () =>
		{
			expect(await wrapper("no links here")).to.be.empty;
		});
	});
});
