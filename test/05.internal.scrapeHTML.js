/* eslint-disable sort-keys */
import {describe, it} from "mocha";
import {expect} from "chai";
import {HTML_ATTR_NAME, HTML_ATTRS, HTML_BASE_HREF, HTML_LOCATION, HTML_SELECTOR, HTML_TAG, HTML_TAG_NAME, HTML_TEXT, ORIGINAL_URL} from "../lib/internal/Link";
import parseHTML from "../lib/internal/parseHTML";
import scrapeHTML from "../lib/internal/scrapeHTML";
import {simplifyLinks} from "./helpers";
import TAG_TESTS from "./fixtures-json/scrapeHTML.json";



const wrapper = async (input, baseURL, robots) =>
{
	const document = await parseHTML(input);
	return simplifyLinks(scrapeHTML(document, baseURL, robots));
};



describe("INTERNAL -- scrapeHTML", () =>
{
	describe("link tags & attributes", () =>
	{
		Object.entries(TAG_TESTS).forEach(([title, {html, link, skipOrOnly}]) =>
		{
			// eslint-disable-next-line camelcase
			const it_skipOrOnly = it[skipOrOnly] ?? it;

			it_skipOrOnly(`supports ${title}`, async () =>
			{
				const links = await wrapper(html, "http://domain.com/");

				expect(links).to.have.length(1);
				expect(links[0]).to.containSubset(link);
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
			const links = await wrapper(`<a href=" file.html ">link</a>`);

			expect(links).to.have.length(1);
			expect(links[0]).to.containSubset(
			{
				[ORIGINAL_URL]: "file.html",
				[HTML_TAG]: `<a href=" file.html ">`
			});
		});



		it("supports link attributes preceded by non-link attributes", async () =>
		{
			const links = await wrapper(`<a id="link" href="file.html">link</a>`);

			expect(links).to.have.length(1);
			expect(links[0]).to.containSubset(
			{
				[ORIGINAL_URL]: "file.html",
				[HTML_ATTR_NAME]: "href",
				[HTML_ATTRS]: { href:"file.html", id:"link" },
				[HTML_TAG]: `<a id="link" href="file.html">`
			});
		});



		it("supports consecutive link attributes", async () =>
		{
			const links = await wrapper(`<img src="file.png" longdesc="file.html">`);

			expect(links).to.have.length(2);
			expect(links).to.containSubset(
			[
				{
					[ORIGINAL_URL]: "file.png",
					[HTML_SELECTOR]: "html > body > img:nth-child(1)",
					[HTML_TAG_NAME]: "img",
					[HTML_ATTR_NAME]: "src",
					[HTML_TAG]: `<img src="file.png" longdesc="file.html">`
				},
				{
					[ORIGINAL_URL]: "file.html",
					[HTML_SELECTOR]: "html > body > img:nth-child(1)",
					[HTML_TAG_NAME]: "img",
					[HTML_ATTR_NAME]: "longdesc",
					[HTML_TAG]: `<img src="file.png" longdesc="file.html">`
				}
			]);
		});



		it("ignores redundant link attributes", async () =>
		{
			const links = await wrapper(`<a href="file.html" href="ignored.html">link</a>`);

			expect(links.length).to.equal(1);
			expect(links[0]).to.containSubset(
			{
				[ORIGINAL_URL]: "file.html",
				[HTML_ATTR_NAME]: "href",
				[HTML_TAG]: `<a href="file.html">`
			});
		});



		it("supports consecutive link elements", async () =>
		{
			const links = await wrapper(`<a href="file1.html">link1</a> <a href="file2.html">link2</a>`);

			expect(links).to.have.length(2);
			expect(links).to.containSubset(
			[
				{
					[ORIGINAL_URL]: "file1.html",
					[HTML_SELECTOR]: "html > body > a:nth-child(1)",
					[HTML_TAG]: `<a href="file1.html">`,
					[HTML_TEXT]: "link1"
				},
				{
					[ORIGINAL_URL]: "file2.html",
					[HTML_SELECTOR]: "html > body > a:nth-child(2)",
					[HTML_TAG]: `<a href="file2.html">`,
					[HTML_TEXT]: "link2"
				}
			]);
		});



		it("supports nonconsecutive link elements", async () =>
		{
			let html = `<a href="file1.html">link1</a>`;
			html += `content <span>content</span> content`;
			html += `<a href="file2.html">link2</a>`;

			const links = await wrapper(html);

			expect(links).to.have.length(2);
			expect(links).to.containSubset(
			[
				{
					[ORIGINAL_URL]: "file1.html",
					[HTML_SELECTOR]: "html > body > a:nth-child(1)",
					[HTML_TAG]: `<a href="file1.html">`,
					[HTML_TEXT]: "link1"
				},
				{
					[ORIGINAL_URL]: "file2.html",
					[HTML_SELECTOR]: "html > body > a:nth-child(3)",
					[HTML_TAG]: `<a href="file2.html">`,
					[HTML_TEXT]: "link2"
				}
			]);
		});



		it("supports nested link elements", async () =>
		{
			const links = await wrapper(`<a href="file1.html"><q cite="file2.html">quote</q></a>`);

			expect(links).to.have.length(2);
			expect(links).to.containSubset(
			[
				{
					[ORIGINAL_URL]: "file1.html",
					[HTML_SELECTOR]: "html > body > a:nth-child(1)",
					[HTML_TAG_NAME]: "a",
					[HTML_ATTR_NAME]: "href",
					[HTML_TAG]: `<a href="file1.html">`,
					[HTML_TEXT]: "quote"
				},
				{
					[ORIGINAL_URL]: "file2.html",
					[HTML_SELECTOR]: "html > body > a:nth-child(1) > q:nth-child(1)",
					[HTML_TAG_NAME]: "q",
					[HTML_ATTR_NAME]: "cite",
					[HTML_TAG]: `<q cite="file2.html">`,
					[HTML_TEXT]: "quote"
				}
			]);
		});



		it("supports link elements with nested elements", async () =>
		{
			const links = await wrapper(`<a href="file.html"><span>text</span></a>`);

			expect(links).to.have.length(1);
			expect(links[0]).to.containSubset(
			{
				[ORIGINAL_URL]: "file.html",
				[HTML_SELECTOR]: "html > body > a:nth-child(1)",
				[HTML_TAG_NAME]: "a",
				[HTML_ATTR_NAME]: "href",
				[HTML_TAG]: `<a href="file.html">`,
				[HTML_TEXT]: "text"
			});
		});



		it("supports void elements", async () =>
		{
			const links = await wrapper(`<img src="file.png"> content`);

			expect(links).to.have.length(1);
			expect(links[0]).to.containSubset(
			{
				[ORIGINAL_URL]: "file.png",
				[HTML_SELECTOR]: "html > body > img:nth-child(1)",
				[HTML_TAG_NAME]: "img",
				[HTML_ATTR_NAME]: "src",
				[HTML_TAG]: `<img src="file.png">`,
				[HTML_TEXT]: null
			});
		});



		it("supports multi-url attribute values", async () =>
		{
			const links = await wrapper(`<a ping="file1.html, file2.html"><img srcset="file3.png 2x, file4.png 100w"></a>`);

			expect(links).to.have.length(4);
			expect(links).to.containSubset(
			[
				{
					[ORIGINAL_URL]: "file1.html",
					[HTML_SELECTOR]: "html > body > a:nth-child(1)",
					[HTML_TAG_NAME]: "a",
					[HTML_ATTR_NAME]: "ping",
					[HTML_TAG]: `<a ping="file1.html, file2.html">`,
					[HTML_TEXT]: ""
				},
				{
					[ORIGINAL_URL]: "file2.html",
					[HTML_SELECTOR]: "html > body > a:nth-child(1)",
					[HTML_TAG_NAME]: "a",
					[HTML_ATTR_NAME]: "ping",
					[HTML_TAG]: `<a ping="file1.html, file2.html">`,
					[HTML_TEXT]: ""
				},
				{
					[ORIGINAL_URL]: "file3.png",
					[HTML_SELECTOR]: "html > body > a:nth-child(1) > img:nth-child(1)",
					[HTML_TAG_NAME]: "img",
					[HTML_ATTR_NAME]: "srcset",
					[HTML_TAG]: `<img srcset="file3.png 2x, file4.png 100w">`,
					[HTML_TEXT]: null
				},
				{
					[ORIGINAL_URL]: "file4.png",
					[HTML_SELECTOR]: "html > body > a:nth-child(1) > img:nth-child(1)",
					[HTML_TAG_NAME]: "img",
					[HTML_ATTR_NAME]: "srcset",
					[HTML_TAG]: `<img srcset="file3.png 2x, file4.png 100w">`,
					[HTML_TEXT]: null
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

			const links = await wrapper(html);

			expect(links).to.have.length(5);
			expect(links).to.containSubset(
			[
				{
					[ORIGINAL_URL]: "file1.html",
					[HTML_SELECTOR]: "html > body > div:nth-child(1) > a:nth-child(1)",
					[HTML_TAG]: `<a href="file1.html">`,
					[HTML_TEXT]: "link1"
				},
				{
					[ORIGINAL_URL]: "file2.html",
					[HTML_SELECTOR]: "html > body > div:nth-child(1) > div:nth-child(2) > a:nth-child(1)",
					[HTML_TAG]: `<a href="file2.html">`,
					[HTML_TEXT]: "link2"
				},
				{
					[ORIGINAL_URL]: "file3.html",
					[HTML_SELECTOR]: "html > body > div:nth-child(1) > div:nth-child(3) > a:nth-child(1)",
					[HTML_TAG]: `<a href="file3.html">`,
					[HTML_TEXT]: "link3"
				},
				{
					[ORIGINAL_URL]: "file4.html",
					[HTML_SELECTOR]: "html > body > div:nth-child(1) > a:nth-child(4)",
					[HTML_TAG]: `<a href="file4.html">`,
					[HTML_TEXT]: "link4"
				},
				{
					[ORIGINAL_URL]: "file5.html",
					[HTML_SELECTOR]: "html > body > a:nth-child(2)",
					[HTML_TAG]: `<a href="file5.html">`,
					[HTML_TEXT]: "link5"
				}
			]);
		});



		it("supports link attribute source code locations", async () =>
		{
			const html = `\n\t<a href="file.html">link</a>`;

			const links = await wrapper(html);

			expect(links).to.have.length(1);
			expect(links[0]).to.containSubset(
			{
				[HTML_LOCATION]:
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
			const links = await wrapper(`<head><base href="/dir/"></head> <a href="file.html">link</a>`);

			expect(links).to.have.length(1);
			expect(links[0]).to.containSubset(
			{
				[ORIGINAL_URL]: "file.html",
				[HTML_BASE_HREF]: "/dir/"
			});
		});



		it("supports irregular use of <base/>", async () =>
		{
			let html = `<base href="/correct/">`;
			html += `<a href="file.html">link</a>`;

			const links = await wrapper(html);

			expect(links).to.have.length(1);
			expect(links[0]).to.containSubset(
			{
				[ORIGINAL_URL]: "file.html",
				[HTML_BASE_HREF]: "/correct/"
			});
		});



		it("ignores invalid use of <base/>", async () =>
		{
			let html = `<base>`;
			html += `<a href="file.html">link</a>`;

			const links = await wrapper(html);

			expect(links).to.have.length(1);
			expect(links[0]).to.containSubset(
			{
				[ORIGINAL_URL]: "file.html",
				[HTML_BASE_HREF]: null
			});
		});



		it("ignores multiple uses of <base/>", async () =>
		{
			let html = `<base href="/first/">`;
			html += `<head><base href="/ignored1/"><base href="/ignored2/"></head>`;
			html += `<head><base href="/ignored3/"></head>`;
			html += `<base href="/ignored4/">`;
			html += `<a href="file.html">link</a>`;

			const links = await wrapper(html);

			expect(links).to.have.length(1);
			expect(links[0]).to.containSubset(
			{
				[ORIGINAL_URL]: "file.html",
				[HTML_BASE_HREF]: "/first/"
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

			const links = await wrapper(html);

			expect(links).to.have.length(2);
			expect(links).to.containSubset(
			[
				{
					[ORIGINAL_URL]: "file1.html",
					[HTML_SELECTOR]: "html > body > div:nth-child(2) > a:nth-child(1)",
					[HTML_TAG]: `<a href="file1.html">`,
					[HTML_TEXT]: "link1"
				},
				{
					[ORIGINAL_URL]: "file2.html",
					[HTML_SELECTOR]: "html > body > a:nth-child(4)",
					[HTML_TAG]: `<a href="file2.html">`,
					[HTML_TEXT]: "link2"
				}
			]);
		});



		it("supports invalid html structure (#2)", async () =>
		{
			let html = `<html><head><title>title</title></head><body>`;
			html += `<a href="fake.html">1<p>2</a>`;
			html += `</body></html>`;

			const links = await wrapper(html);

			expect(links).to.have.length(2);
			expect(links).to.containSubset(
			[
				{
					[ORIGINAL_URL]: "fake.html",
					[HTML_SELECTOR]: "html > body > a:nth-child(1)",
					[HTML_TAG]: `<a href="fake.html">`,
					[HTML_TEXT]: "1"
				},
				{
					[ORIGINAL_URL]: "fake.html",
					[HTML_SELECTOR]: "html > body > p:nth-child(2) > a:nth-child(1)",
					[HTML_TAG]: `<a href="fake.html">`,
					[HTML_TEXT]: "2"
				}
			]);
		});



		it("supports empty html documents", async () =>
		{
			let links;

			links = await wrapper("");
			expect(links).to.be.empty;

			links = await wrapper(" ");
			expect(links).to.be.empty;

			links = await wrapper("\n");
			expect(links).to.be.empty;

			links = await wrapper("non-html");
			expect(links).to.be.empty;
		});



		it(`fires "complete" when no links found`, async () =>
		{
			const links = await wrapper("no links here");
			expect(links).to.be.empty;
		});
	});
});
