"use strict";
var BrokenLinkChecker = require("../lib");
var utils = require("./utils");

var expect = require("chai").expect;

var allTagsString,conn;



describe("checkHtml", function()
{
	before( function(done)
	{
		utils.startConnections( function(connections)
		{
			conn = connections;
			allTagsString = utils.getTagsString(3, conn.absoluteUrls[0]+"/fixture/link-real.html");
			done();
		});
	});
	
	
	
	after( function(done)
	{
		utils.stopConnections(conn.realPorts, function(){ done() });
	});
	
	
	
	describe("should accept only valid input types for", function()
	{
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
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<a href="'+conn.absoluteUrls[0]+'/fixture/link-real.html">link</a>',
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
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<area href/>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<area href="'+conn.absoluteUrls[0]+'/fixture/link-real.html"/>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("area");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<area href="'+conn.absoluteUrls[0]+'/fixture/link-real.html"/>');
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<audio src>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<audio src="'+conn.absoluteUrls[0]+'/fixture/link-real.html"></audio>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("audio");
					expect(results[0].html.attrName).to.equal("src");
					expect(results[0].html.tag).to.equal('<audio src="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<blockquote cite>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<blockquote cite="'+conn.absoluteUrls[0]+'/fixture/link-real.html">quote</blockquote>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("blockquote");
					expect(results[0].html.attrName).to.equal("cite");
					expect(results[0].html.tag).to.equal('<blockquote cite="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("quote");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<del cite>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<del cite="'+conn.absoluteUrls[0]+'/fixture/link-real.html">deleted</del>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("del");
					expect(results[0].html.attrName).to.equal("cite");
					expect(results[0].html.tag).to.equal('<del cite="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("deleted");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<embed src/>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<embed src="'+conn.absoluteUrls[0]+'/fixture/link-real.html"/>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("embed");
					expect(results[0].html.attrName).to.equal("src");
					expect(results[0].html.tag).to.equal('<embed src="'+conn.absoluteUrls[0]+'/fixture/link-real.html"/>');
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<form action>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<form action="'+conn.absoluteUrls[0]+'/fixture/link-real.html">fields</form>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("form");
					expect(results[0].html.attrName).to.equal("action");
					expect(results[0].html.tag).to.equal('<form action="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("fields");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<iframe longdesc>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<iframe longdesc="'+conn.absoluteUrls[0]+'/fixture/link-real.html"></iframe>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("iframe");
					expect(results[0].html.attrName).to.equal("longdesc");
					expect(results[0].html.tag).to.equal('<iframe longdesc="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<iframe src>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<iframe src="'+conn.absoluteUrls[0]+'/fixture/link-real.html"></iframe>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("iframe");
					expect(results[0].html.attrName).to.equal("src");
					expect(results[0].html.tag).to.equal('<iframe src="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<img longdesc/>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<img longdesc="'+conn.absoluteUrls[0]+'/fixture/link-real.html"/>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("img");
					expect(results[0].html.attrName).to.equal("longdesc");
					expect(results[0].html.tag).to.equal('<img longdesc="'+conn.absoluteUrls[0]+'/fixture/link-real.html"/>');
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<img src/>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<img src="'+conn.absoluteUrls[0]+'/fixture/image.gif"/>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/image.gif");
					expect(results[0].html.tagName).to.equal("img");
					expect(results[0].html.attrName).to.equal("src");
					expect(results[0].html.tag).to.equal('<img src="'+conn.absoluteUrls[0]+'/fixture/image.gif"/>');
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<input src/>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<input src="'+conn.absoluteUrls[0]+'/fixture/image.gif"/>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/image.gif");
					expect(results[0].html.tagName).to.equal("input");
					expect(results[0].html.attrName).to.equal("src");
					expect(results[0].html.tag).to.equal('<input src="'+conn.absoluteUrls[0]+'/fixture/image.gif"/>');
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<ins cite>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<ins cite="'+conn.absoluteUrls[0]+'/fixture/link-real.html">inserted</ins>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("ins");
					expect(results[0].html.attrName).to.equal("cite");
					expect(results[0].html.tag).to.equal('<ins cite="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("inserted");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<link href/>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<link href="'+conn.absoluteUrls[0]+'/fixture/link-real.html"/>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("link");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<link href="'+conn.absoluteUrls[0]+'/fixture/link-real.html"/>');
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<menuitem icon/>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<menuitem icon="'+conn.absoluteUrls[0]+'/fixture/link-real.html"/>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("menuitem");
					expect(results[0].html.attrName).to.equal("icon");
					expect(results[0].html.tag).to.equal('<menuitem icon="'+conn.absoluteUrls[0]+'/fixture/link-real.html"/>');
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<object data>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<object data="'+conn.absoluteUrls[0]+'/fixture/link-real.html"></object>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("object");
					expect(results[0].html.attrName).to.equal("data");
					expect(results[0].html.tag).to.equal('<object data="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<q cite>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<q cite="'+conn.absoluteUrls[0]+'/fixture/link-real.html">quote</q>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("q");
					expect(results[0].html.attrName).to.equal("cite");
					expect(results[0].html.tag).to.equal('<q cite="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("quote");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<script src>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<script src="'+conn.absoluteUrls[0]+'/fixture/link-real.html"></script>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("script");
					expect(results[0].html.attrName).to.equal("src");
					expect(results[0].html.tag).to.equal('<script src="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<source src/>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<source src="'+conn.absoluteUrls[0]+'/fixture/link-real.html"/>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("source");
					expect(results[0].html.attrName).to.equal("src");
					expect(results[0].html.tag).to.equal('<source src="'+conn.absoluteUrls[0]+'/fixture/link-real.html"/>');
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<track src/>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<track src="'+conn.absoluteUrls[0]+'/fixture/link-real.html"/>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("track");
					expect(results[0].html.attrName).to.equal("src");
					expect(results[0].html.tag).to.equal('<track src="'+conn.absoluteUrls[0]+'/fixture/link-real.html"/>');
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("<video src>", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<video src="'+conn.absoluteUrls[0]+'/fixture/link-real.html"></video>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.tagName).to.equal("video");
					expect(results[0].html.attrName).to.equal("src");
					expect(results[0].html.tag).to.equal('<video src="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
	});
	
	
	
	describe("<base href/>", function()
	{
		it("none, with absolute link", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml('<a href="'+conn.absoluteUrls[1]+'/fixture/link-real.html">link</a>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: conn.absoluteUrls[1]+"/fixture/link-real.html",
						resolved: conn.absoluteUrls[1]+"/fixture/link-real.html"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[1]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("none, with root-path-relative link", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml('<a href="/fixture/link-real.html">link</a>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "/fixture/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("none, with path-relative link", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml('<a href="fixture/link-real.html">link</a>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "fixture/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="fixture/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("none, with query-relative link", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]+"/fixture/index.html"}).checkHtml('<a href="?query">link</a>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "?query",
						resolved: conn.absoluteUrls[0]+"/fixture/index.html?query"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/index.html",
						resolved: conn.absoluteUrls[0]+"/fixture/index.html"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="?query">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("none, with hash-relative link", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]+"/fixture/index.html", excludeLinksToSamePage:false}).checkHtml('<a href="#hash">link</a>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "#hash",
						resolved: conn.absoluteUrls[0]+"/fixture/index.html#hash"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/index.html",
						resolved: conn.absoluteUrls[0]+"/fixture/index.html"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="#hash">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("none, with empty link", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]+"/fixture/index.html", excludeLinksToSamePage:false}).checkHtml('<a href="">link</a>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "",
						resolved: conn.absoluteUrls[0]+"/fixture/index.html"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/index.html",
						resolved: conn.absoluteUrls[0]+"/fixture/index.html"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local absolute, with absolute link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="'+conn.absoluteUrls[0]+'/fixture/"></head><body>';
			html += '<a href="'+conn.absoluteUrls[1]+'/fixture/link-real.html">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: conn.absoluteUrls[1]+"/fixture/link-real.html",
						resolved: conn.absoluteUrls[1]+"/fixture/link-real.html"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[1]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local absolute, with root-path-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="'+conn.absoluteUrls[0]+'/fixture/"></head><body>';
			html += '<a href="/fixture/link-real.html">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "/fixture/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local absolute, with path-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="'+conn.absoluteUrls[0]+'/fixture/"></head><body>';
			html += '<a href="link-real.html">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local absolute, with query-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="'+conn.absoluteUrls[0]+'/fixture/"></head><body>';
			html += '<a href="?query">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "?query",
						resolved: conn.absoluteUrls[0]+"/fixture/?query"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="?query">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local absolute, with hash-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="'+conn.absoluteUrls[0]+'/fixture/"></head><body>';
			html += '<a href="#hash">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0], excludeLinksToSamePage:false}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "#hash",
						resolved: conn.absoluteUrls[0]+"/fixture/#hash"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="#hash">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local absolute, with empty link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="'+conn.absoluteUrls[0]+'/fixture/"></head><body>';
			html += '<a href="">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0], excludeLinksToSamePage:false}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "",
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local root-path-relative, with absolute link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="/fixture/"></head><body>';
			html += '<a href="'+conn.absoluteUrls[1]+'/fixture/link-real.html">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: conn.absoluteUrls[1]+"/fixture/link-real.html",
						resolved: conn.absoluteUrls[1]+"/fixture/link-real.html"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[1]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local root-path-relative, with root-path-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="/fixture/"></head><body>';
			html += '<a href="/fixture/link-real.html">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "/fixture/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local root-path-relative, with path-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="/fixture/"></head><body>';
			html += '<a href="link-real.html">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local root-path-relative, with query-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="/fixture/"></head><body>';
			html += '<a href="?query">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "?query",
						resolved: conn.absoluteUrls[0]+"/fixture/?query"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="?query">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local root-path-relative, with hash-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="/fixture/"></head><body>';
			html += '<a href="#hash">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0], excludeLinksToSamePage:false}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "#hash",
						resolved: conn.absoluteUrls[0]+"/fixture/#hash"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="#hash">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local root-path-relative, with empty link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="/fixture/"></head><body>';
			html += '<a href="">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0], excludeLinksToSamePage:false}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "",
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local path-relative, with absolute link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="fixture/"></head><body>';
			html += '<a href="'+conn.absoluteUrls[1]+'/fixture/link-real.html">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: conn.absoluteUrls[1]+"/fixture/link-real.html",
						resolved: conn.absoluteUrls[1]+"/fixture/link-real.html"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[1]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local path-relative, with root-path-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="fixture/"></head><body>';
			html += '<a href="/fixture/link-real.html">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "/fixture/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local path-relative, with path-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="fixture/"></head><body>';
			html += '<a href="link-real.html">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local path-relative, with query-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="fixture/"></head><body>';
			html += '<a href="?query">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "?query",
						resolved: conn.absoluteUrls[0]+"/fixture/?query"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="?query">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local path-relative, with hash-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="fixture/"></head><body>';
			html += '<a href="#hash">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0], excludeLinksToSamePage:false}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "#hash",
						resolved: conn.absoluteUrls[0]+"/fixture/#hash"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="#hash">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local path-relative, with empty link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="fixture/"></head><body>';
			html += '<a href="">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0], excludeLinksToSamePage:false}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "",
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("remote absolute, with absolute link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="'+conn.absoluteUrls[1]+'/fixture/"></head><body>';
			html += '<a href="'+conn.absoluteUrls[0]+'/fixture/link-real.html">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[1]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("remote absolute, with root-path-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="'+conn.absoluteUrls[1]+'/fixture/"></head><body>';
			html += '<a href="/fixture/link-real.html">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "/fixture/link-real.html",
						resolved: conn.absoluteUrls[1]+"/fixture/link-real.html"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[1]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("remote absolute, with path-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="'+conn.absoluteUrls[1]+'/fixture/"></head><body>';
			html += '<a href="link-real.html">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "link-real.html",
						resolved: conn.absoluteUrls[1]+"/fixture/link-real.html"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[1]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("remote absolute, with query-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="'+conn.absoluteUrls[1]+'/fixture/"></head><body>';
			html += '<a href="?query">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "?query",
						resolved: conn.absoluteUrls[1]+"/fixture/?query"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[1]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="?query">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("remote absolute, with hash-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="'+conn.absoluteUrls[1]+'/fixture/"></head><body>';
			html += '<a href="#hash">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0], excludeLinksToSamePage:false}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "#hash",
						resolved: conn.absoluteUrls[1]+"/fixture/#hash"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[1]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="#hash">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("remote absolute, with empty link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="'+conn.absoluteUrls[1]+'/fixture/"></head><body>';
			html += '<a href="">link</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0], excludeLinksToSamePage:false}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url).to.deep.equal({
						original: "",
						resolved: conn.absoluteUrls[1]+"/fixture/"
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[1]+"/fixture/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
	});
	
	
	
	describe("options", function()
	{
		it("excludedSchemes = []", function(done)
		{
			var results = [];
			
			var html = '<a href="data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7">link1</a>';
			html += '<a href="geo:0,0">link2</a>';
			html += '<a href="mailto:address@email.com?subject=hello">link3</a>';
			html += '<a href="sms:+5-555-555-5555?body=hello">link4</a>';
			html += '<a href="tel:+5-555-555-5555">link5</a>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0], excludedSchemes:[]}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(5);
					expect(results[0].error).to.be.instanceOf(Error);
					expect(results[1].error).to.be.instanceOf(Error);
					expect(results[2].error).to.be.instanceOf(Error);
					expect(results[3].error).to.be.instanceOf(Error);
					expect(results[4].error).to.be.instanceOf(Error);
					done();
				}
			});
		});
		
		
		
		it('excludedSchemes = ["data","geo","mailto","sms","tel"]', function(done)
		{
			var html = '<a href="data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7">link1</a>';
			html += '<a href="geo:0,0">link2</a>';
			html += '<a href="mailto:address@email.com?subject=hello">link3</a>';
			html += '<a href="sms:+5-555-555-5555?body=hello">link4</a>';
			html += '<a href="tel:+5-555-555-5555">link5</a>';
			
			// Uses default excludedSchemes value to ensure that any change to it will break this test
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					done( new Error("this should not have been called") );
				},
				complete: function()
				{
					done();
				}
			});
		});
		
		
		
		it("excludeInternalLinks = false", function(done)
		{
			var results = [];
			
			var html = '<a href="'+conn.absoluteUrls[0]+'">link1</a>';
			html += '<a href="/">link2</a>';
			html += '<a href="#hash">link3</a>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]+"/fixture/index.html", excludeInternalLinks:false, excludeLinksToSamePage:false}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(3);
					expect(results[0].internal).to.be.true;
					expect(results[1].internal).to.be.true;
					expect(results[2].internal).to.be.true;
					done();
				}
			});
		});
		
		
		
		it("excludeInternalLinks = true", function(done)
		{
			var html = '<a href="'+conn.absoluteUrls[0]+'">link1</a>';
			html += '<a href="/">link2</a>';
			html += '<a href="#hash">link3</a>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]+"/fixture/index.html", excludeInternalLinks:true, excludeLinksToSamePage:false}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					done( new Error("this should not have been called") );
				},
				complete: function()
				{
					done();
				}
			});
		});
		
		
		
		it("excludeLinksToSamePage = false", function(done)
		{
			var results = [];
			
			var html = '<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">link1</a>';
			html += '<a href="/">link2</a>';
			html += '<a href="?query">link3</a>';
			html += '<a href="#hash">link4</a>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]+"/fixture/index.html", excludeLinksToSamePage:false}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(4);
					expect(results[0].samePage).to.be.true;
					expect(results[1].samePage).to.be.false;
					expect(results[2].samePage).to.be.false;
					expect(results[3].samePage).to.be.true;
					done();
				}
			});
		});
		
		
		
		it("excludeLinksToSamePage = true", function(done)
		{
			var results = [];
			
			var html = '<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">link1</a>';
			html += '<a href="/">link2</a>';
			html += '<a href="?query">link3</a>';
			html += '<a href="#hash">link4</a>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]+"/fixture/index.html", excludeLinksToSamePage:true}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(2);
					expect(results[0].samePage).to.be.false;
					expect(results[0].html.text).to.equal("link2");
					expect(results[1].samePage).to.be.false;
					expect(results[1].html.text).to.equal("link3");
					done();
				}
			});
		});
		
		
		
		it("filterLevel = 0", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:0}).checkHtml(allTagsString,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(2);
					done();
				}
			});
		});
		
		
		
		it("filterLevel = 1", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:1}).checkHtml(allTagsString,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(13);
					done();
				}
			});
		});
		
		
		
		it("filterLevel = 2", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:2}).checkHtml(allTagsString,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(16);
					done();
				}
			});
		});
		
		
		// `base` has already been tested in checkUrl tests
		// `filterLevel=3` already tested above
	});
	
	
	
	describe("edge cases", function()
	{
		it("should support link attributes with values surrounded by spaces", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<a href=" '+conn.absoluteUrls[0]+'/fixture/link-real.html	">link</a>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.selector).to.equal("a:nth-child(1)");
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href=" '+conn.absoluteUrls[0]+'/fixture/link-real.html	">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("should support link attributes preceded by non-link attributes", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<a id="link" href="'+conn.absoluteUrls[0]+'/fixture/link-real.html">link</a>',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.selector).to.equal("a:nth-child(1)");
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a id="link" href="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("should support consecutive link attributes", function(done)
		{
			var results = [];
			
			var html = '<img src="'+conn.absoluteUrls[0]+'/fixture/image.gif"';
			html += ' longdesc="'+conn.absoluteUrls[0]+'/fixture/link-real.html"/>';
			
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
					
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/image.gif");
					expect(results[0].html.selector).to.equal("img:nth-child(1)");
					expect(results[0].html.tagName).to.equal("img");
					expect(results[0].html.attrName).to.equal("src");
					expect(results[0].html.tag).to.equal(html);
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					
					expect(results[1].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[1].html.selector).to.equal("img:nth-child(1)");
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
			
			var html = '<a href="'+conn.absoluteUrls[0]+'/fixture/link-real.html"';
			html += ' href="'+conn.absoluteUrls[0]+'/link-fake.html">link</a>';
			
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
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.selector).to.equal("a:nth-child(1)");
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("should support consecutive link elements", function(done)
		{
			var results = [];
			
			var html = '<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">link1</a>';
			html += '<a href="'+conn.absoluteUrls[0]+'/fixture/link-real.html">link2</a>';
			
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
					
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/index.html");
					expect(results[0].html.selector).to.equal("a:nth-child(1)");
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">');
					expect(results[0].html.text).to.equal("link1");
					expect(results[0].broken).to.be.false;
					
					expect(results[1].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[1].html.selector).to.equal("a:nth-child(2)");
					expect(results[1].html.tagName).to.equal("a");
					expect(results[1].html.attrName).to.equal("href");
					expect(results[1].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[1].html.text).to.equal("link2");
					expect(results[1].broken).to.be.false;
					
					done();
				}
			});
		});
		
		
		
		it("should support nonconsecutive link elements", function(done)
		{
			var results = [];
			
			var html = '<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">link1</a>';
			html += 'content <span>content</span> content';
			html += '<a href="'+conn.absoluteUrls[0]+'/fixture/link-real.html">link2</a>';
			
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
					
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/index.html");
					expect(results[0].html.selector).to.equal("a:nth-child(1)");
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">');
					expect(results[0].html.text).to.equal("link1");
					expect(results[0].broken).to.be.false;
					
					expect(results[1].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[1].html.selector).to.equal("a:nth-child(3)");
					expect(results[1].html.tagName).to.equal("a");
					expect(results[1].html.attrName).to.equal("href");
					expect(results[1].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[1].html.text).to.equal("link2");
					expect(results[1].broken).to.be.false;
					
					done();
				}
			});
		});
		
		
		
		it("should support nested link elements", function(done)
		{
			var results = [];
			
			var html = '<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">';
			html += '<q cite="'+conn.absoluteUrls[0]+'/fixture/link-real.html">';
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
					
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/index.html");
					expect(results[0].html.selector).to.equal("a:nth-child(1)");
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">');
					expect(results[0].html.text).to.equal("quote");
					expect(results[0].broken).to.be.false;
					
					expect(results[1].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[1].html.selector).to.equal("a:nth-child(1) > q:nth-child(1)");
					expect(results[1].html.tagName).to.equal("q");
					expect(results[1].html.attrName).to.equal("cite");
					expect(results[1].html.tag).to.equal('<q cite="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[1].html.text).to.equal("quote");
					expect(results[1].broken).to.be.false;
					
					done();
				}
			});
		});
		
		
		
		it("should support link elements with nested elements", function(done)
		{
			var results = [];
			
			var html = '<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">';
			html += '<span>text</span></a>';
			
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
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/index.html");
					expect(results[0].html.selector).to.equal("a:nth-child(1)");
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">');
					expect(results[0].html.text).to.equal("text");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("should support void elements", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml('<img src="'+conn.absoluteUrls[0]+'/fixture/link-real.html">',
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(1);
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[0].html.selector).to.equal("img:nth-child(1)");
					expect(results[0].html.tagName).to.equal("img");
					expect(results[0].html.attrName).to.equal("src");
					expect(results[0].html.tag).to.equal('<img src="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("should support detailed selectors and omit nth-child from html and body", function(done)
		{
			var results = [];
			
			var html = '<html><head><title>asdf</title></head><body>';
			html += '<div><a href="'+conn.absoluteUrls[0]+'/fixture/index.html">link1</a>';
			html += '<div><a href="'+conn.absoluteUrls[0]+'/fixture/index.html">link2</a></div>';
			html += '<div><a href="'+conn.absoluteUrls[0]+'/fixture/index.html">link3</a></div>';
			html += '<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">link4</a></div>';
			html += '<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">link5</a>';
			html += '</body></html>';
			
			new BrokenLinkChecker({filterLevel:3}).checkHtml(html,
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(5);
					
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/index.html");
					expect(results[0].html.selector).to.equal("html > body > div:nth-child(1) > a:nth-child(1)");
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">');
					expect(results[0].html.text).to.equal("link1");
					expect(results[0].broken).to.be.false;
					
					expect(results[1].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/index.html");
					expect(results[1].html.selector).to.equal("html > body > div:nth-child(1) > div:nth-child(2) > a:nth-child(1)");
					expect(results[1].html.tagName).to.equal("a");
					expect(results[1].html.attrName).to.equal("href");
					expect(results[1].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">');
					expect(results[1].html.text).to.equal("link2");
					expect(results[1].broken).to.be.false;
					
					expect(results[2].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/index.html");
					expect(results[2].html.selector).to.equal("html > body > div:nth-child(1) > div:nth-child(3) > a:nth-child(1)");
					expect(results[2].html.tagName).to.equal("a");
					expect(results[2].html.attrName).to.equal("href");
					expect(results[2].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">');
					expect(results[2].html.text).to.equal("link3");
					expect(results[2].broken).to.be.false;
					
					expect(results[3].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/index.html");
					expect(results[3].html.selector).to.equal("html > body > div:nth-child(1) > a:nth-child(4)");
					expect(results[3].html.tagName).to.equal("a");
					expect(results[3].html.attrName).to.equal("href");
					expect(results[3].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">');
					expect(results[3].html.text).to.equal("link4");
					expect(results[3].broken).to.be.false;
					
					expect(results[4].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/index.html");
					expect(results[4].html.selector).to.equal("html > body > a:nth-child(2)");
					expect(results[4].html.tagName).to.equal("a");
					expect(results[4].html.attrName).to.equal("href");
					expect(results[4].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">');
					expect(results[4].html.text).to.equal("link5");
					expect(results[4].broken).to.be.false;
					
					done();
				}
			});
		});
		
		
		
		it.skip("should support invalid html structure", function(done)
		{
			var results = [];
			
			var html = '<html><head><title>asdf</title></head><body>';
			html += '<div><a href="'+conn.absoluteUrls[0]+'/fixture/index.html">link1</div></a>';
			html += '<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">link2</a>';
			html += '</wtf></body></html>';
			
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
					
					expect(results[0].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/index.html");
					expect(results[0].html.selector).to.equal("html > body > div:nth-child(1) > a:nth-child(1)");
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">');
					expect(results[0].html.text).to.equal("link1");
					expect(results[0].broken).to.be.false;
					
					expect(results[1].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/index.html");
					expect(results[1].html.selector).to.equal("html > body > a:nth-child(2)");
					expect(results[1].html.tagName).to.equal("a");
					expect(results[1].html.attrName).to.equal("href");
					expect(results[1].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">');
					expect(results[1].html.text).to.equal("link2");
					expect(results[1].broken).to.be.false;
					
					done();
				}
			});
		});
		
		
		
		it("should call complete when no links found", function(done)
		{
			new BrokenLinkChecker({filterLevel:3}).checkHtml("no links here",
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
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
