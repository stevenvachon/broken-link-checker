"use strict";
var BrokenLinkChecker = require("../lib");
var utils = require("./utils");

var expect = require("chai").expect;

var conn;



describe("checkHtml", function()
{
	before( function(done)
	{
		utils.startConnections( function(connections)
		{
			conn = connections;
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
	});
	
	
	
	describe.skip("options", function()
	{
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
					expect(results[0].html.tagName).to.equal("img");
					expect(results[0].html.attrName).to.equal("src");
					expect(results[0].html.tag).to.equal(html);
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					
					expect(results[1].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
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
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">');
					expect(results[0].html.text).to.equal("link1");
					expect(results[0].broken).to.be.false;
					
					expect(results[1].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
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
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixture/index.html">');
					expect(results[0].html.text).to.equal("quote");
					expect(results[0].broken).to.be.false;
					
					expect(results[1].url.original).to.equal(conn.absoluteUrls[0]+"/fixture/link-real.html");
					expect(results[1].html.tagName).to.equal("q");
					expect(results[1].html.attrName).to.equal("cite");
					expect(results[1].html.tag).to.equal('<q cite="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[1].html.text).to.equal("quote");
					expect(results[1].broken).to.be.false;
					
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
					expect(results[0].html.tagName).to.equal("img");
					expect(results[0].html.attrName).to.equal("src");
					expect(results[0].html.tag).to.equal('<img src="'+conn.absoluteUrls[0]+'/fixture/link-real.html">');
					expect(results[0].html.text).to.be.null;
					expect(results[0].broken).to.be.false;
					done();
				}
			});
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
