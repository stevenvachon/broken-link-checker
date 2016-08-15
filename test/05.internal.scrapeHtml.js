/* eslint-disable sort-keys */
import {describe, it} from "mocha";
import {expect} from "chai";
import parseHtml from "../lib/internal/parseHtml";
import scrapeHtml from "../lib/internal/scrapeHtml";
import TAG_TESTS from "./helpers/json/scrapeHtml.json";



const wrapper = async (input, baseUrl, robots) =>
{
	const document = await parseHtml(input);
	return scrapeHtml(document, baseUrl, robots);
};



describe("INTERNAL -- scrapeHtml", () =>
{
	describe("link tags & attributes", () =>
	{
		Object.entries(TAG_TESTS).forEach(([title, fixture]) =>
		{
			const it_skipOrOnly = fixture.skipOrOnly ? it[fixture.skipOrOnly] : it;

			it_skipOrOnly(`supports ${title}`, async () =>
			{
				const links = await wrapper(fixture.html, "http://domain.com/");

				expect(links).to.have.length(fixture.length);
				expect(links[0]).to.containSubset(fixture.link);
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
				url: { original:"file.html" },
				html: { tag:`<a href=" file.html ">` }
			});
		});



		it("supports link attributes preceded by non-link attributes", async () =>
		{
			const links = await wrapper(`<a id="link" href="file.html">link</a>`);

			expect(links).to.have.length(1);
			expect(links[0]).to.containSubset(
			{
				url: { original:"file.html" },
				html:
				{
					attrName: "href",
					attrs: { href:"file.html", id:"link" },
					tag: `<a id="link" href="file.html">`
				}
			});
		});



		it("supports consecutive link attributes", async () =>
		{
			const links = await wrapper(`<img src="file.png" longdesc="file.html">`);

			expect(links).to.have.length(2);
			expect(links).to.containSubset(
			[
				{
					url: { original:"file.png" },
					html:
					{
						selector: "html > body > img:nth-child(1)",
						tagName: "img",
						attrName: "src",
						tag: `<img src="file.png" longdesc="file.html">`
					}
				},
				{
					url: { original:"file.html" },
					html:
					{
						selector: "html > body > img:nth-child(1)",
						tagName: "img",
						attrName: "longdesc",
						tag: `<img src="file.png" longdesc="file.html">`
					}
				}
			]);
		});



		it("ignores redundant link attributes", async () =>
		{
			const links = await wrapper(`<a href="file.html" href="ignored.html">link</a>`);

			expect(links.length).to.equal(1);
			expect(links[0]).to.containSubset(
			{
				url: { original:"file.html" },
				html:
				{
					attrName: "href",
					tag: `<a href="file.html">`
				}
			});
		});



		it("supports consecutive link elements", async () =>
		{
			const links = await wrapper(`<a href="file1.html">link1</a> <a href="file2.html">link2</a>`);

			expect(links).to.have.length(2);
			expect(links).to.containSubset(
			[
				{
					url: { original:"file1.html" },
					html:
					{
						selector: "html > body > a:nth-child(1)",
						tag: `<a href="file1.html">`,
						text: "link1"
					}
				},
				{
					url: { original:"file2.html" },
					html:
					{
						selector: "html > body > a:nth-child(2)",
						tag: `<a href="file2.html">`,
						text: "link2"
					}
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
					url: { original:"file1.html" },
					html:
					{
						selector: "html > body > a:nth-child(1)",
						tag: `<a href="file1.html">`,
						text: "link1"
					}
				},
				{
					url: { original:"file2.html" },
					html:
					{
						selector: "html > body > a:nth-child(3)",
						tag: `<a href="file2.html">`,
						text: "link2"
					}
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
					url: { original:"file1.html" },
					html:
					{
						selector: "html > body > a:nth-child(1)",
						tagName: "a",
						attrName: "href",
						tag: `<a href="file1.html">`,
						text: "quote"
					}
				},
				{
					url: { original:"file2.html" },
					html:
					{
						selector: "html > body > a:nth-child(1) > q:nth-child(1)",
						tagName: "q",
						attrName: "cite",
						tag: `<q cite="file2.html">`,
						text: "quote"
					}
				}
			]);
		});



		it("supports link elements with nested elements", async () =>
		{
			const links = await wrapper(`<a href="file.html"><span>text</span></a>`);

			expect(links).to.have.length(1);
			expect(links[0]).to.containSubset(
			{
				url: { original:"file.html" },
				html:
				{
					selector: "html > body > a:nth-child(1)",
					tagName: "a",
					attrName: "href",
					tag: `<a href="file.html">`,
					text: "text"
				}
			});
		});



		it("supports void elements", async () =>
		{
			const links = await wrapper(`<img src="file.png"> content`);

			expect(links).to.have.length(1);
			expect(links[0]).to.containSubset(
			{
				url: { original:"file.png" },
				html:
				{
					selector: "html > body > img:nth-child(1)",
					tagName: "img",
					attrName: "src",
					tag: `<img src="file.png">`,
					text: null
				}
			});
		});



		it("supports multi-url attribute values", async () =>
		{
			const links = await wrapper(`<a ping="file1.html, file2.html"><img srcset="file3.png 2x, file4.png 100w"></a>`);

			expect(links).to.have.length(4);
			expect(links).to.containSubset(
			[
				{
					url: { original:"file1.html" },
					html:
					{
						selector: "html > body > a:nth-child(1)",
						tagName: "a",
						attrName: "ping",
						tag: `<a ping="file1.html, file2.html">`,
						text: ""
					}
				},
				{
					url: { original:"file2.html" },
					html:
					{
						selector: "html > body > a:nth-child(1)",
						tagName: "a",
						attrName: "ping",
						tag: `<a ping="file1.html, file2.html">`,
						text: ""
					}
				},
				{
					url: { original:"file3.png" },
					html:
					{
						selector: "html > body > a:nth-child(1) > img:nth-child(1)",
						tagName: "img",
						attrName: "srcset",
						tag: `<img srcset="file3.png 2x, file4.png 100w">`,
						text: null
					}
				},
				{
					url: { original:"file4.png" },
					html:
					{
						selector: "html > body > a:nth-child(1) > img:nth-child(1)",
						tagName: "img",
						attrName: "srcset",
						tag: `<img srcset="file3.png 2x, file4.png 100w">`,
						text: null
					}
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
					url: { original:"file1.html" },
					html:
					{
						selector: "html > body > div:nth-child(1) > a:nth-child(1)",
						tag: `<a href="file1.html">`,
						text: "link1"
					}
				},
				{
					url: { original:"file2.html" },
					html:
					{
						selector: "html > body > div:nth-child(1) > div:nth-child(2) > a:nth-child(1)",
						tag: `<a href="file2.html">`,
						text: "link2"
					}
				},
				{
					url: { original:"file3.html" },
					html:
					{
						selector: "html > body > div:nth-child(1) > div:nth-child(3) > a:nth-child(1)",
						tag: `<a href="file3.html">`,
						text: "link3"
					}
				},
				{
					url: { original:"file4.html" },
					html:
					{
						selector: "html > body > div:nth-child(1) > a:nth-child(4)",
						tag: `<a href="file4.html">`,
						text: "link4"
					}
				},
				{
					url: { original:"file5.html" },
					html:
					{
						selector: "html > body > a:nth-child(2)",
						tag: `<a href="file5.html">`,
						text: "link5"
					}
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
				html:
				{
					location:
					{
						line: 2,
						col: 5,
						startOffset: 5,
						endOffset: 21
					}
				}
			});

			const {html: {location}} = links[0];
			const line = location.line-1;
			const start = (location.startOffset-1) + (location.col-1);
			const end = location.endOffset-1;

			expect( html.split("\n")[line].substring(start,end) ).to.equal(`="file.html"`);
		});



		it("supports <base/>", async () =>
		{
			const links = await wrapper(`<head><base href="/dir/"></head> <a href="file.html">link</a>`);

			expect(links).to.have.length(1);
			expect(links[0]).to.containSubset(
			{
				url: { original:"file.html" },
				html: { base:"/dir/" }
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
				url: { original:"file.html" },
				html: { base:"/correct/" }
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
				url: { original:"file.html" },
				html: { base:null }
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
				url: { original:"file.html" },
				html: { base:"/first/" }
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
					url: { original:"file1.html" },
					html:
					{
						selector: "html > body > div:nth-child(2) > a:nth-child(1)",
						tag: `<a href="file1.html">`,
						text: "link1"
					}
				},
				{
					url: { original:"file2.html" },
					html:
					{
						selector: "html > body > a:nth-child(4)",
						tag: `<a href="file2.html">`,
						text: "link2"
					}
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
					url: { original:"fake.html" },
					html:
					{
						selector: "html > body > a:nth-child(1)",
						tag: `<a href="fake.html">`,
						text: "1"
					}
				},
				{
					url: { original:"fake.html" },
					html:
					{
						selector: "html > body > p:nth-child(2) > a:nth-child(1)",
						tag: `<a href="fake.html">`,
						text: "2"
					}
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
