"use strict";
var BrokenLinkChecker = require("../lib");
var utils = require("./utils");

var expect = require("chai").expect;



describe("checkHtml", function()
{
	// Let internal http lib decide when to give up
	this.timeout(0);
	
	
	
	describe("should accept only valid input types for", function()
	{
		// Reset to defeault timeout since no request should be made in this test
		this.timeout(2000);
		
		
		
		it("html", function(done)
		{
			var blc = new BrokenLinkChecker();
			var checkHtml_array    = function(){ blc.checkHtml([0],          function(){}) };
			var checkHtml_function = function(){ blc.checkHtml(function(){}, function(){}) };
			var checkHtml_number   = function(){ blc.checkHtml(0,            function(){}) };
			var checkHtml_object   = function(){ blc.checkHtml({0:0},        function(){}) };
			var checkHtml_string   = function(){ blc.checkHtml("",           function(){}) };
			
			expect(checkHtml_array   ).to.throw("html must be a string");
			expect(checkHtml_function).to.throw("html must be a string");
			expect(checkHtml_number  ).to.throw("html must be a string");
			expect(checkHtml_object  ).to.throw("html must be a string");
			expect(checkHtml_string  ).to.not.throw("html must be a string");
			done();
		});
		
		
		
		it("handlers", function(done)
		{
			var blc = new BrokenLinkChecker();
			var checkHtml_array    = function(){ blc.checkHtml("", [0]         ) };
			var checkHtml_function = function(){ blc.checkHtml("", function(){}) };
			var checkHtml_number   = function(){ blc.checkHtml("", 0           ) };
			var checkHtml_object   = function(){ blc.checkHtml("", {0:0}       ) };
			var checkHtml_string   = function(){ blc.checkHtml("", ""          ) };
			
			expect(checkHtml_array   ).to.throw("handlers must be an object");
			expect(checkHtml_function).to.throw("handlers must be an object");
			expect(checkHtml_number  ).to.throw("handlers must be an object");
			expect(checkHtml_object  ).to.not.throw("handlers must be an object");
			expect(checkHtml_string  ).to.throw("handlers must be an object");
			done();
		});
	});
	
	
	
	describe("tags", function()
	{
		it("<a href>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<a href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">link</a>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					// TODO :: use deep.equal() for `html` key
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<area href/>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<area href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html"/>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("area");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<area href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html"/>');
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<blockquote cite>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<blockquote cite="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">quote</blockquote>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("blockquote");
					expect(results[0].html.attrName).to.equal("cite");
					expect(results[0].html.tag).to.equal('<blockquote cite="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("quote");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<del cite>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<del cite="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">deleted</del>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("del");
					expect(results[0].html.attrName).to.equal("cite");
					expect(results[0].html.tag).to.equal('<del cite="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("deleted");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<form action>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<form action="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">fields</form>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("form");
					expect(results[0].html.attrName).to.equal("action");
					expect(results[0].html.tag).to.equal('<form action="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("fields");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<img longdesc/>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<img longdesc="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html"/>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("img");
					expect(results[0].html.attrName).to.equal("longdesc");
					expect(results[0].html.tag).to.equal('<img longdesc="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html"/>');
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<img src/>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<img src="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/image.gif"/>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/image.gif");
					expect(results[0].html.tagName).to.equal("img");
					expect(results[0].html.attrName).to.equal("src");
					expect(results[0].html.tag).to.equal('<img src="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/image.gif"/>');
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<input src/>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<input src="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/image.gif"/>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/image.gif");
					expect(results[0].html.tagName).to.equal("input");
					expect(results[0].html.attrName).to.equal("src");
					expect(results[0].html.tag).to.equal('<input src="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/image.gif"/>');
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<ins cite>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<ins cite="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">inserted</ins>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("ins");
					expect(results[0].html.attrName).to.equal("cite");
					expect(results[0].html.tag).to.equal('<ins cite="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("inserted");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<link href/>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<link href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html"/>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("link");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<link href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html"/>');
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<object data>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<object data="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html"></object>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("object");
					expect(results[0].html.attrName).to.equal("data");
					expect(results[0].html.tag).to.equal('<object data="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<q cite>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<q cite="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">quote</q>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("q");
					expect(results[0].html.attrName).to.equal("cite");
					expect(results[0].html.tag).to.equal('<q cite="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("quote");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<script src>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<script src="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html"></script>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("script");
					expect(results[0].html.attrName).to.equal("src");
					expect(results[0].html.tag).to.equal('<script src="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
	});
	
	
	
	describe.skip("options", function()
	{
		// `acceptedSchemes` has already been tested in checkUrl tests
		
		
		
		it("excludeEmptyAnchors = false", function(done)
		{
			
		});
		
		
		
		it("excludeEmptyAnchors = true", function(done)
		{
			
		});
		
		
		
		it("filterLevel = 0", function(done)
		{
			
		});
		
		
		
		it("filterLevel = 1", function(done)
		{
			
		});
		
		
		
		it("filterLevel = 2", function(done)
		{
			
		});
		
		
		// `filterLevel=3` already tested above
		// `site` has already been tested in checkUrl tests
	});
	
	
	
	describe("edge cases", function()
	{
		it("should support link attributes preceded by non-link attributes", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<a id="link" href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/index.html">link</a>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/index.html");
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a id="link" href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/index.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("should support consecutive link elements", function(done)
		{
			var results = [];
			
			var html = '<a href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/index.html">link1</a>';
			html += '<a href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">link2</a>';
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(2);
					
					expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/index.html");
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/index.html">');
					expect(results[0].html.text).to.equal("link1");
					expect(results[0].broken).to.be.false;
					
					expect(results[1].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html");
					expect(results[1].html.tagName).to.equal("a");
					expect(results[1].html.attrName).to.equal("href");
					expect(results[1].html.tag).to.equal('<a href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">');
					expect(results[1].html.text).to.equal("link2");
					expect(results[1].broken).to.be.false;
					
					done();
				}
			});
		});
		
		
		
		it("should support consecutive link attributes", function(done)
		{
			var results = [];
			
			var html = '<img src="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/image.gif"';
			html += ' longdesc="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html"/>';
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(2);
					
					expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/image.gif");
					expect(results[0].html.tagName).to.equal("img");
					expect(results[0].html.attrName).to.equal("src");
					expect(results[0].html.tag).to.equal(html);
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					
					expect(results[1].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html");
					expect(results[1].html.tagName).to.equal("img");
					expect(results[1].html.attrName).to.equal("longdesc");
					expect(results[1].html.tag).to.equal(html);
					expect(results[1].html.text).to.be.null;
					expect(results[1].broken).to.be.false;
					
					done();
				}
			});
		});
		
		
		
		it("should ignore redundant link attributes", function(done)
		{
			var results = [];
			
			var html = '<a href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/index.html"';
			html += ' href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">link</a>';
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/index.html");
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/index.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("should support nested link elements", function(done)
		{
			// Reset to defeault timeout since no request should be made in this test
			this.timeout(2000);
			
			var results = [];
			
			var html = '<a href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/index.html">';
			html += '<q cite="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">';
			html += 'quote</q></a>';
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(2);
					
					expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/index.html");
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/index.html">');
					expect(results[0].html.text).to.equal("quote");
					expect(results[0].broken).to.be.false;
					
					expect(results[1].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html");
					expect(results[1].html.tagName).to.equal("q");
					expect(results[1].html.attrName).to.equal("cite");
					expect(results[1].html.tag).to.equal('<q cite="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">');
					expect(results[1].html.text).to.equal("quote");
					expect(results[1].broken).to.be.false;
					
					done();
				}
			});
		});
		
		
		
		it.skip("should support <base>", function(done)
		{
			
		});
		
		
		
		it.skip("should ignore hash anchors", function(done)
		{
			
		});
		
		
		
		it.skip("should ignore data uri", function(done)
		{
			
		});
		
		
		
		it.skip("should ignore tel uri", function(done)
		{
			
		});
		
		
		
		it("should call complete when no links found", function(done)
		{
			// Reset to defeault timeout since no request should be made in this test
			this.timeout(2000);
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml("no links here",
			{
				link: function(result)
				{
					done( new Error("this should not have been called") );
				},
				complete: function()
				{
					done();
				}
			});
		});
	});
});
