"use strict";
var HtmlLinkParser = require("../lib/internal/HtmlLinkParser");
var linkObj        = require("../lib/internal/linkObj");

var utils = require("./utils");

var expect = require("chai").expect;

var allTagsString = utils.tagsString(3, "http://fakeurl.com/");



describe("INTERNAL -- HtmlLinkParser", function()
{
	describe("handlers", function()
	{
		it("link", function(done)
		{
			var foundLink = false;
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					expect(arguments).to.have.length(1);
					expect(link).to.be.instanceOf(Object);
					foundLink = true;
				}
			}).parse('<a href="fake.html">link</a>');
			
			// Ended here to ensure that everything is synchronous
			expect(foundLink).to.be.true;
			done();
		});
		
		
		
		it("complete", function(done)
		{
			var completed = false;
			
			new HtmlLinkParser( utils.options(),
			{
				complete: function()
				{
					expect(arguments).to.have.length(0);
					completed = true;
				}
			}).parse('<a href="fake.html">link</a>');
			
			// Ended here to ensure that everything is synchronous
			expect(completed).to.be.true;
			done();
		});
	});
	
	
	
	describe("link tags & attributes", function()
	{
		it("<a href>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.html");
					expect(links[0].html.selector).to.equal("a:nth-child(1)");
					expect(links[0].html.tagName).to.equal("a");
					expect(links[0].html.attrName).to.equal("href");
					expect(links[0].html.tag).to.equal('<a href="fake.html">');
					expect(links[0].html.text).to.equal("link");
					done();
				}
			}).parse('<a href="fake.html">link</a>');
		});
		
		
		
		it("<area href/>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.html");
					expect(links[0].html.selector).to.equal("area:nth-child(1)");
					expect(links[0].html.tagName).to.equal("area");
					expect(links[0].html.attrName).to.equal("href");
					expect(links[0].html.tag).to.equal('<area href="fake.html"/>');
					expect(links[0].html.text).to.be.null;
					done();
				}
			}).parse('<area href="fake.html"/>');
		});
		
		
		
		it("<audio src>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.ogg");
					expect(links[0].html.selector).to.equal("audio:nth-child(1)");
					expect(links[0].html.tagName).to.equal("audio");
					expect(links[0].html.attrName).to.equal("src");
					expect(links[0].html.tag).to.equal('<audio src="fake.ogg">');
					expect(links[0].html.text).to.equal("");
					done();
				}
			}).parse('<audio src="fake.ogg"></audio>');
		});
		
		
		
		it("<blockquote cite>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.html");
					expect(links[0].html.selector).to.equal("blockquote:nth-child(1)");
					expect(links[0].html.tagName).to.equal("blockquote");
					expect(links[0].html.attrName).to.equal("cite");
					expect(links[0].html.tag).to.equal('<blockquote cite="fake.html">');
					expect(links[0].html.text).to.equal("quote");
					done();
				}
			}).parse('<blockquote cite="fake.html">quote</blockquote>');
		});
		
		
		
		it("<del cite>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.html");
					expect(links[0].html.selector).to.equal("del:nth-child(1)");
					expect(links[0].html.tagName).to.equal("del");
					expect(links[0].html.attrName).to.equal("cite");
					expect(links[0].html.tag).to.equal('<del cite="fake.html">');
					expect(links[0].html.text).to.equal("deleted");
					done();
				}
			}).parse('<del cite="fake.html">deleted</del>');
		});
		
		
		
		it("<embed src/>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.swf");
					expect(links[0].html.selector).to.equal("embed:nth-child(1)");
					expect(links[0].html.tagName).to.equal("embed");
					expect(links[0].html.attrName).to.equal("src");
					expect(links[0].html.tag).to.equal('<embed src="fake.swf"/>');
					expect(links[0].html.text).to.be.null;
					done();
				}
			}).parse('<embed src="fake.swf"/>');
		});
		
		
		
		it("<form action>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.html");
					expect(links[0].html.selector).to.equal("form:nth-child(1)");
					expect(links[0].html.tagName).to.equal("form");
					expect(links[0].html.attrName).to.equal("action");
					expect(links[0].html.tag).to.equal('<form action="fake.html">');
					expect(links[0].html.text).to.equal("fields");
					done();
				}
			}).parse('<form action="fake.html">fields</form>');
		});
		
		
		
		it("<iframe longdesc>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.html");
					expect(links[0].html.selector).to.equal("iframe:nth-child(1)");
					expect(links[0].html.tagName).to.equal("iframe");
					expect(links[0].html.attrName).to.equal("longdesc");
					expect(links[0].html.tag).to.equal('<iframe longdesc="fake.html">');
					expect(links[0].html.text).to.equal("");
					done();
				}
			}).parse('<iframe longdesc="fake.html"></iframe>');
		});
		
		
		
		it("<iframe src>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.html");
					expect(links[0].html.selector).to.equal("iframe:nth-child(1)");
					expect(links[0].html.tagName).to.equal("iframe");
					expect(links[0].html.attrName).to.equal("src");
					expect(links[0].html.tag).to.equal('<iframe src="fake.html">');
					expect(links[0].html.text).to.equal("");
					done();
				}
			}).parse('<iframe src="fake.html"></iframe>');
		});
		
		
		
		it("<img longdesc/>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.html");
					expect(links[0].html.selector).to.equal("img:nth-child(1)");
					expect(links[0].html.tagName).to.equal("img");
					expect(links[0].html.attrName).to.equal("longdesc");
					expect(links[0].html.tag).to.equal('<img longdesc="fake.html"/>');
					expect(links[0].html.text).to.be.null;
					done();
				}
			}).parse('<img longdesc="fake.html"/>');
		});
		
		
		
		it("<img src/>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.png");
					expect(links[0].html.selector).to.equal("img:nth-child(1)");
					expect(links[0].html.tagName).to.equal("img");
					expect(links[0].html.attrName).to.equal("src");
					expect(links[0].html.tag).to.equal('<img src="fake.png"/>');
					expect(links[0].html.text).to.be.null;
					done();
				}
			}).parse('<img src="fake.png"/>');
		});
		
		
		
		it("<input src/>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.png");
					expect(links[0].html.selector).to.equal("input:nth-child(1)");
					expect(links[0].html.tagName).to.equal("input");
					expect(links[0].html.attrName).to.equal("src");
					expect(links[0].html.tag).to.equal('<input src="fake.png"/>');
					expect(links[0].html.text).to.be.null;
					done();
				}
			}).parse('<input src="fake.png"/>');
		});
		
		
		
		it("<ins cite>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.html");
					expect(links[0].html.selector).to.equal("ins:nth-child(1)");
					expect(links[0].html.tagName).to.equal("ins");
					expect(links[0].html.attrName).to.equal("cite");
					expect(links[0].html.tag).to.equal('<ins cite="fake.html">');
					expect(links[0].html.text).to.equal("inserted");
					done();
				}
			}).parse('<ins cite="fake.html">inserted</ins>');
		});
		
		
		
		it("<link href/>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.css");
					expect(links[0].html.selector).to.equal("link:nth-child(1)");
					expect(links[0].html.tagName).to.equal("link");
					expect(links[0].html.attrName).to.equal("href");
					expect(links[0].html.tag).to.equal('<link href="fake.css"/>');
					expect(links[0].html.text).to.be.null;
					done();
				}
			}).parse('<link href="fake.css"/>');
		});
		
		
		
		it("<menuitem icon/>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.png");
					expect(links[0].html.selector).to.equal("menuitem:nth-child(1)");
					expect(links[0].html.tagName).to.equal("menuitem");
					expect(links[0].html.attrName).to.equal("icon");
					expect(links[0].html.tag).to.equal('<menuitem icon="fake.png"/>');
					expect(links[0].html.text).to.be.null;
					done();
				}
			}).parse('<menuitem icon="fake.png"/>');
		});
		
		
		
		it("<object data>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.swf");
					expect(links[0].html.selector).to.equal("object:nth-child(1)");
					expect(links[0].html.tagName).to.equal("object");
					expect(links[0].html.attrName).to.equal("data");
					expect(links[0].html.tag).to.equal('<object data="fake.swf">');
					expect(links[0].html.text).to.equal("");
					done();
				}
			}).parse('<object data="fake.swf"></object>');
		});
		
		
		
		it("<q cite>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.html");
					expect(links[0].html.selector).to.equal("q:nth-child(1)");
					expect(links[0].html.tagName).to.equal("q");
					expect(links[0].html.attrName).to.equal("cite");
					expect(links[0].html.tag).to.equal('<q cite="fake.html">');
					expect(links[0].html.text).to.equal("quote");
					done();
				}
			}).parse('<q cite="fake.html">quote</q>');
		});
		
		
		
		it("<script src>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.js");
					expect(links[0].html.selector).to.equal("script:nth-child(1)");
					expect(links[0].html.tagName).to.equal("script");
					expect(links[0].html.attrName).to.equal("src");
					expect(links[0].html.tag).to.equal('<script src="fake.js">');
					expect(links[0].html.text).to.equal("");
					done();
				}
			}).parse('<script src="fake.js"></script>');
		});
		
		
		
		it("<source src/>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.ogg");
					expect(links[0].html.selector).to.equal("source:nth-child(1)");
					expect(links[0].html.tagName).to.equal("source");
					expect(links[0].html.attrName).to.equal("src");
					expect(links[0].html.tag).to.equal('<source src="fake.ogg"/>');
					expect(links[0].html.text).to.be.null;
					done();
				}
			}).parse('<source src="fake.ogg"/>');
		});
		
		
		
		it("<track src/>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.vtt");
					expect(links[0].html.selector).to.equal("track:nth-child(1)");
					expect(links[0].html.tagName).to.equal("track");
					expect(links[0].html.attrName).to.equal("src");
					expect(links[0].html.tag).to.equal('<track src="fake.vtt"/>');
					expect(links[0].html.text).to.be.null;
					done();
				}
			}).parse('<track src="fake.vtt"/>');
		});
		
		
		
		it("<video src>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(1);
					expect(links[0].url.original).to.equal("fake.ogg");
					expect(links[0].html.selector).to.equal("video:nth-child(1)");
					expect(links[0].html.tagName).to.equal("video");
					expect(links[0].html.attrName).to.equal("src");
					expect(links[0].html.tag).to.equal('<video src="fake.ogg">');
					expect(links[0].html.text).to.equal("");
					done();
				}
			}).parse('<video src="fake.ogg"></video>');
		});
	});
	
	
	
	describe("edge cases", function()
	{
		it("should support link attributes with values surrounded by spaces", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links[0].url.original).to.equal("fake.html");
					expect(links[0].html.tag).to.equal('<a href=" fake.html ">');
					done();
				}
			}).parse('<a href=" fake.html ">link</a>');
		});
		
		
		
		it("should support link attributes preceded by non-link attributes", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links[0].url.original).to.equal("fake.html");
					expect(links[0].html.attrName).to.equal("href");
					expect(links[0].html.attrs).to.deep.equal({ href:"fake.html", id:"link" });
					expect(links[0].html.tag).to.equal('<a id="link" href="fake.html">');
					done();
				}
			}).parse('<a id="link" href="fake.html">link</a>');
		});
		
		
		
		it("should support consecutive link attributes", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links[0].url.original).to.equal("fake.png");
					expect(links[0].html.selector).to.equal("img:nth-child(1)");
					expect(links[0].html.tagName).to.equal("img");
					expect(links[0].html.attrName).to.equal("src");
					expect(links[0].html.tag).to.equal('<img src="fake.png" longdesc="fake.html"/>');
					
					expect(links[1].url.original).to.equal("fake.html");
					expect(links[1].html.selector).to.equal("img:nth-child(1)");
					expect(links[1].html.tagName).to.equal("img");
					expect(links[1].html.attrName).to.equal("longdesc");
					expect(links[1].html.tag).to.equal('<img src="fake.png" longdesc="fake.html"/>');
					
					done();
				}
			}).parse('<img src="fake.png" longdesc="fake.html"/>');
		});
		
		
		
		it("should ignore redundant link attributes", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links.length).to.equal(1);
					expect(links[0].url.original).to.equal("fake.html");
					expect(links[0].html.attrName).to.equal("href");
					expect(links[0].html.tag).to.equal('<a href="fake.html">');
					done();
				}
			}).parse('<a href="fake.html" href="ignored.html">link</a>');
		});
		
		
		
		it("should support consecutive link elements", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links[0].url.original).to.equal("fake1.html");
					expect(links[0].html.selector).to.equal("a:nth-child(1)");
					expect(links[0].html.tag).to.equal('<a href="fake1.html">');
					expect(links[0].html.text).to.equal("link1");
					
					expect(links[1].url.original).to.equal("fake2.html");
					expect(links[1].html.selector).to.equal("a:nth-child(2)");
					expect(links[1].html.tag).to.equal('<a href="fake2.html">');
					expect(links[1].html.text).to.equal("link2");
					
					done();
				}
			}).parse('<a href="fake1.html">link1</a> <a href="fake2.html">link2</a>');
		});
		
		
		
		it("should support nonconsecutive link elements", function(done)
		{
			var links = [];
			
			var html = '<a href="fake1.html">link1</a>';
			html += 'contnet <span>content</span> content';
			html += '<a href="fake2.html">link2</a>';
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links[0].url.original).to.equal("fake1.html");
					expect(links[0].html.selector).to.equal("a:nth-child(1)");
					expect(links[0].html.tag).to.equal('<a href="fake1.html">');
					expect(links[0].html.text).to.equal("link1");
					
					expect(links[1].url.original).to.equal("fake2.html");
					expect(links[1].html.selector).to.equal("a:nth-child(3)");
					expect(links[1].html.tag).to.equal('<a href="fake2.html">');
					expect(links[1].html.text).to.equal("link2");
					
					done();
				}
			}).parse(html);
		});
		
		
		
		it("should support nested link elements", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links[0].url.original).to.equal("fake1.html");
					expect(links[0].html.selector).to.equal("a:nth-child(1)");
					expect(links[0].html.tagName).to.equal("a");
					expect(links[0].html.attrName).to.equal("href");
					expect(links[0].html.tag).to.equal('<a href="fake1.html">');
					expect(links[0].html.text).to.equal("quote");
					
					expect(links[1].url.original).to.equal("fake2.html");
					expect(links[1].html.selector).to.equal("a:nth-child(1) > q:nth-child(1)");
					expect(links[1].html.tagName).to.equal("q");
					expect(links[1].html.attrName).to.equal("cite");
					expect(links[1].html.tag).to.equal('<q cite="fake2.html">');
					expect(links[1].html.text).to.equal("quote");
					
					done();
				}
			}).parse('<a href="fake1.html"><q cite="fake2.html">quote</q></a>');
		});
		
		
		
		it("should support link elements with nested elements", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links[0].url.original).to.equal("fake.html");
					expect(links[0].html.selector).to.equal("a:nth-child(1)");
					expect(links[0].html.tagName).to.equal("a");
					expect(links[0].html.attrName).to.equal("href");
					expect(links[0].html.tag).to.equal('<a href="fake.html">');
					expect(links[0].html.text).to.equal("text");
					done();
				}
			}).parse('<a href="fake.html"><span>text</span></a>');
		});
		
		
		
		it("should support void elements", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links[0].url.original).to.equal("fake.png");
					expect(links[0].html.selector).to.equal("img:nth-child(1)");
					expect(links[0].html.tagName).to.equal("img");
					expect(links[0].html.attrName).to.equal("src");
					expect(links[0].html.tag).to.equal('<img src="fake.png">');
					expect(links[0].html.text).to.be.null;
					done();
				}
			}).parse('<img src="fake.png"> content');
		});
		
		
		
		it("should support detailed selectors and omit nth-child from html and body", function(done)
		{
			var links = [];
			
			var html = '<html><head><title>asdf</title></head><body>';
			html += '<div><a href="fake1.html">link1</a>';
			html += '<div><a href="fake2.html">link2</a></div>';
			html += '<div><a href="fake3.html">link3</a></div>';
			html += '<a href="fake4.html">link4</a></div>';
			html += '<a href="fake5.html">link5</a>';
			html += '</body></html>';
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(5);
					
					expect(links[0].url.original).to.equal("fake1.html");
					expect(links[0].html.selector).to.equal("html > body > div:nth-child(1) > a:nth-child(1)");
					expect(links[0].html.tag).to.equal('<a href="fake1.html">');
					expect(links[0].html.text).to.equal("link1");
					
					expect(links[1].url.original).to.equal("fake2.html");
					expect(links[1].html.selector).to.equal("html > body > div:nth-child(1) > div:nth-child(2) > a:nth-child(1)");
					expect(links[1].html.tag).to.equal('<a href="fake2.html">');
					expect(links[1].html.text).to.equal("link2");
					
					expect(links[2].url.original).to.equal("fake3.html");
					expect(links[2].html.selector).to.equal("html > body > div:nth-child(1) > div:nth-child(3) > a:nth-child(1)");
					expect(links[2].html.tag).to.equal('<a href="fake3.html">');
					expect(links[2].html.text).to.equal("link3");
					
					expect(links[3].url.original).to.equal("fake4.html");
					expect(links[3].html.selector).to.equal("html > body > div:nth-child(1) > a:nth-child(4)");
					expect(links[3].html.tag).to.equal('<a href="fake4.html">');
					expect(links[3].html.text).to.equal("link4");
					
					expect(links[4].url.original).to.equal("fake5.html");
					expect(links[4].html.selector).to.equal("html > body > a:nth-child(2)");
					expect(links[4].html.tag).to.equal('<a href="fake5.html">');
					expect(links[4].html.text).to.equal("link5");
					
					done();
				}
			}).parse(html);
		});
		
		
		
		it("should support <base/>", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = link;
				},
				complete: function()
				{
					expect(links[0].url.original).to.equal("fake.html");
					expect(links[0].html.base).to.equal("/fake/");
					done();
				}
			}).parse('<head><base href="/fake/"/></head> <a href="fake.html">link</a>');
		});
		
		
		
		it("should ignore <base/> if invalidly used (#1)", function(done)
		{
			var links = [];
			
			var html = '<base href="/incorrect/"/>';
			html += '<a href="fake.html">link</a>';
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = link;
				},
				complete: function()
				{
					expect(links[0].url.original).to.equal("fake.html");
					expect(links[0].html.base).to.be.undefined;
					done();
				}
			}).parse(html);
		});
		
		
		
		it("should ignore <base/> if invalidly used (#2)", function(done)
		{
			var links = [];
			
			var html = '<base href="/incorrect1/"/>';
			html += '<head><base href="/correct/"/><base href="/incorrect2/"/></head>';
			html += '<head><base href="/incorrect3/"/></head>';
			html += '<base href="/incorrect4/"/>';
			html += '<a href="fake.html">link</a>';
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = link;
				},
				complete: function()
				{
					expect(links[0].url.original).to.equal("fake.html");
					expect(links[0].html.base).to.equal("/correct/");
					done();
				}
			}).parse(html);
		});
		
		
		
		it.skip("should support invalid html structure", function(done)
		{
			var links = [];
			
			var html = '<html><head><title>asdf</title></head><body>';
			html += '<div><a href="fake1.html">link1</div></a>';
			html += '<a href="fake2.html">link2</a>';
			html += '</wtf></body></html>';
			
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(2);
					
					expect(links[0].url.original).to.equal("fake1.html");
					expect(links[0].html.selector).to.equal("html > body > div:nth-child(1) > a:nth-child(1)");
					expect(links[0].html.tag).to.equal('<a href="fake1.html">');
					expect(links[0].html.text).to.equal("link1");
					
					expect(links[1].url.original).to.equal("fake2.html");
					expect(links[1].html.selector).to.equal("html > body > a:nth-child(2)");
					expect(links[1].html.tag).to.equal('<a href="fake2.html">');
					expect(links[1].html.text).to.equal("link2");
					
					done();
				}
			}).parse('<img src="fake.png"> content');
		});
		
		
		
		it("should fire \"complete\" when no links found", function(done)
		{
			new HtmlLinkParser( utils.options(),
			{
				link: function(link)
				{
					done( new Error("this should not have been called") );
				},
				complete: function()
				{
					done();
				}
			}).parse("no links here");
		});
	});
	
	
	
	describe("options", function()
	{
		it("filterLevel = 0", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options({ filterLevel:0 }),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(2);
					done();
				}
			}).parse(allTagsString);
		});
		
		
		
		it("filterLevel = 1", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options({ filterLevel:1 }),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(13);
					done();
				}
			}).parse(allTagsString);
		});
		
		
		
		it("filterLevel = 2", function(done)
		{
			var links = [];
			
			new HtmlLinkParser( utils.options({ filterLevel:2 }),
			{
				link: function(link)
				{
					links[link.html.index] = linkObj.clean(link);
				},
				complete: function()
				{
					expect(links).to.have.length(16);
					done();
				}
			}).parse(allTagsString);
		});
		
		
		
		// `filterLevel=3` already tested above
	});
});
