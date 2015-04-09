"use strict";
var BrokenLinkChecker = require("../lib");
var utils = require("./utils");

var expect = require("chai").expect;

var allTagsString,conn;



describe("checkHtml", function()
{
	describe("<base href/>", function()
	{
		it("none, with absolute link", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml('<a href="'+conn.absoluteUrls[1]+'/fixtures/link-real.html">link</a>',
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
						original: conn.absoluteUrls[1]+"/fixtures/link-real.html",
						resolved: conn.absoluteUrls[1]+"/fixtures/link-real.html",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[1]+'/fixtures/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("none, with root-path-relative link", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml('<a href="/fixtures/link-real.html">link</a>',
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
						original: "/fixtures/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/link-real.html",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="/fixtures/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("none, with path-relative link", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]}).checkHtml('<a href="fixtures/link-real.html">link</a>',
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
						original: "fixtures/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/link-real.html",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="fixtures/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("none, with query-relative link", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]+"/fixtures/index.html"}).checkHtml('<a href="?query">link</a>',
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
						resolved: conn.absoluteUrls[0]+"/fixtures/index.html?query",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixtures/index.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/index.html"
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
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]+"/fixtures/index.html", excludeLinksToSamePage:false}).checkHtml('<a href="#hash">link</a>',
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
						resolved: conn.absoluteUrls[0]+"/fixtures/index.html#hash",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixtures/index.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/index.html"
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
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]+"/fixtures/index.html", excludeLinksToSamePage:false}).checkHtml('<a href="">link</a>',
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
						resolved: conn.absoluteUrls[0]+"/fixtures/index.html",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixtures/index.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/index.html"
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
			
			var html = '<html><head><base href="'+conn.absoluteUrls[0]+'/fixtures/"></head><body>';
			html += '<a href="'+conn.absoluteUrls[1]+'/fixtures/link-real.html">link</a>';
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
						original: conn.absoluteUrls[1]+"/fixtures/link-real.html",
						resolved: conn.absoluteUrls[1]+"/fixtures/link-real.html",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixtures/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[1]+'/fixtures/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local absolute, with root-path-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="'+conn.absoluteUrls[0]+'/fixtures/"></head><body>';
			html += '<a href="/fixtures/link-real.html">link</a>';
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
						original: "/fixtures/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/link-real.html",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixtures/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="/fixtures/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local absolute, with path-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="'+conn.absoluteUrls[0]+'/fixtures/"></head><body>';
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
						resolved: conn.absoluteUrls[0]+"/fixtures/link-real.html",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixtures/"
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
			
			var html = '<html><head><base href="'+conn.absoluteUrls[0]+'/fixtures/"></head><body>';
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
						resolved: conn.absoluteUrls[0]+"/fixtures/?query",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixtures/"
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
			
			var html = '<html><head><base href="'+conn.absoluteUrls[0]+'/fixtures/"></head><body>';
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
						resolved: conn.absoluteUrls[0]+"/fixtures/#hash",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixtures/"
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
			
			var html = '<html><head><base href="'+conn.absoluteUrls[0]+'/fixtures/"></head><body>';
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
						resolved: conn.absoluteUrls[0]+"/fixtures/",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixtures/"
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
			
			var html = '<html><head><base href="/fixtures/"></head><body>';
			html += '<a href="'+conn.absoluteUrls[1]+'/fixtures/link-real.html">link</a>';
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
						original: conn.absoluteUrls[1]+"/fixtures/link-real.html",
						resolved: conn.absoluteUrls[1]+"/fixtures/link-real.html",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixtures/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[1]+'/fixtures/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local root-path-relative, with root-path-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="/fixtures/"></head><body>';
			html += '<a href="/fixtures/link-real.html">link</a>';
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
						original: "/fixtures/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/link-real.html",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixtures/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="/fixtures/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local root-path-relative, with path-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="/fixtures/"></head><body>';
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
						resolved: conn.absoluteUrls[0]+"/fixtures/link-real.html",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixtures/"
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
			
			var html = '<html><head><base href="/fixtures/"></head><body>';
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
						resolved: conn.absoluteUrls[0]+"/fixtures/?query",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixtures/"
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
			
			var html = '<html><head><base href="/fixtures/"></head><body>';
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
						resolved: conn.absoluteUrls[0]+"/fixtures/#hash",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixtures/"
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
			
			var html = '<html><head><base href="/fixtures/"></head><body>';
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
						resolved: conn.absoluteUrls[0]+"/fixtures/",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixtures/"
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
			
			var html = '<html><head><base href="fixtures/"></head><body>';
			html += '<a href="'+conn.absoluteUrls[1]+'/fixtures/link-real.html">link</a>';
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
						original: conn.absoluteUrls[1]+"/fixtures/link-real.html",
						resolved: conn.absoluteUrls[1]+"/fixtures/link-real.html",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixtures/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[1]+'/fixtures/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local path-relative, with root-path-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="fixtures/"></head><body>';
			html += '<a href="/fixtures/link-real.html">link</a>';
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
						original: "/fixtures/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/link-real.html",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixtures/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="/fixtures/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("local path-relative, with path-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="fixtures/"></head><body>';
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
						resolved: conn.absoluteUrls[0]+"/fixtures/link-real.html",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixtures/"
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
			
			var html = '<html><head><base href="fixtures/"></head><body>';
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
						resolved: conn.absoluteUrls[0]+"/fixtures/?query",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixtures/"
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
			
			var html = '<html><head><base href="fixtures/"></head><body>';
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
						resolved: conn.absoluteUrls[0]+"/fixtures/#hash",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixtures/"
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
			
			var html = '<html><head><base href="fixtures/"></head><body>';
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
						resolved: conn.absoluteUrls[0]+"/fixtures/",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/fixtures/"
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
			
			var html = '<html><head><base href="'+conn.absoluteUrls[1]+'/fixtures/"></head><body>';
			html += '<a href="'+conn.absoluteUrls[0]+'/fixtures/link-real.html">link</a>';
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
						original: conn.absoluteUrls[0]+"/fixtures/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/link-real.html",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[1]+"/fixtures/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="'+conn.absoluteUrls[0]+'/fixtures/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("remote absolute, with root-path-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="'+conn.absoluteUrls[1]+'/fixtures/"></head><body>';
			html += '<a href="/fixtures/link-real.html">link</a>';
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
						original: "/fixtures/link-real.html",
						resolved: conn.absoluteUrls[1]+"/fixtures/link-real.html",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[1]+"/fixtures/"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="/fixtures/link-real.html">');
					expect(results[0].html.text).to.equal("link");
					expect(results[0].broken).to.be.false;
					done();
				}
			});
		});
		
		
		
		it("remote absolute, with path-relative link", function(done)
		{
			var results = [];
			
			var html = '<html><head><base href="'+conn.absoluteUrls[1]+'/fixtures/"></head><body>';
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
						resolved: conn.absoluteUrls[1]+"/fixtures/link-real.html",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[1]+"/fixtures/"
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
			
			var html = '<html><head><base href="'+conn.absoluteUrls[1]+'/fixtures/"></head><body>';
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
						resolved: conn.absoluteUrls[1]+"/fixtures/?query",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[1]+"/fixtures/"
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
			
			var html = '<html><head><base href="'+conn.absoluteUrls[1]+'/fixtures/"></head><body>';
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
						resolved: conn.absoluteUrls[1]+"/fixtures/#hash",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[1]+"/fixtures/"
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
			
			var html = '<html><head><base href="'+conn.absoluteUrls[1]+'/fixtures/"></head><body>';
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
						resolved: conn.absoluteUrls[1]+"/fixtures/",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[1]+"/fixtures/"
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
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]+"/fixtures/index.html", excludeInternalLinks:false, excludeLinksToSamePage:false}).checkHtml(html,
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
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]+"/fixtures/index.html", excludeInternalLinks:true, excludeLinksToSamePage:false}).checkHtml(html,
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
			
			var html = '<a href="'+conn.absoluteUrls[0]+'/fixtures/index.html">link1</a>';
			html += '<a href="/">link2</a>';
			html += '<a href="?query">link3</a>';
			html += '<a href="#hash">link4</a>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]+"/fixtures/index.html", excludeLinksToSamePage:false}).checkHtml(html,
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
			
			var html = '<a href="'+conn.absoluteUrls[0]+'/fixtures/index.html">link1</a>';
			html += '<a href="/">link2</a>';
			html += '<a href="?query">link3</a>';
			html += '<a href="#hash">link4</a>';
			
			new BrokenLinkChecker({filterLevel:3, base:conn.absoluteUrls[0]+"/fixtures/index.html", excludeLinksToSamePage:true}).checkHtml(html,
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
});
