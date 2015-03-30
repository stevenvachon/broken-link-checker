"use strict";
var BrokenLinkChecker = require("../lib");
var utils = require("./utils");

var expect = require("chai").expect;

var conn;



describe("checkHtmlUrl", function()
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
		it("url", function(done)
		{
			var blc = new BrokenLinkChecker();
			var checkHtmlUrl_array     = function(){ blc.checkHtmlUrl([0],          {}) };
			var checkHtmlUrl_function  = function(){ blc.checkHtmlUrl(function(){}, {}) };
			var checkHtmlUrl_null      = function(){ blc.checkHtmlUrl(null,         {}) };
			var checkHtmlUrl_number    = function(){ blc.checkHtmlUrl(0,            {}) };
			var checkHtmlUrl_object    = function(){ blc.checkHtmlUrl({0:0},        {}) };
			var checkHtmlUrl_string    = function(){ blc.checkHtmlUrl("",           {}) };
			var checkHtmlUrl_undefined = function(){ blc.checkHtmlUrl(undefined,    {}) };
			
			expect(checkHtmlUrl_array    ).to.throw("url must be a string");
			expect(checkHtmlUrl_function ).to.throw("url must be a string");
			expect(checkHtmlUrl_null     ).to.throw("url must be a string");
			expect(checkHtmlUrl_number   ).to.throw("url must be a string");
			expect(checkHtmlUrl_object   ).to.throw("url must be a string");
			expect(checkHtmlUrl_string   ).to.not.throw("url must be a string");
			expect(checkHtmlUrl_undefined).to.throw("url must be a string");
			done();
		});
		
		
		
		it("handlers", function(done)
		{
			var blc = new BrokenLinkChecker();
			var checkHtmlUrl_array     = function(){ blc.checkHtmlUrl("", [0]         ) };
			var checkHtmlUrl_function  = function(){ blc.checkHtmlUrl("", function(){}) };
			var checkHtmlUrl_null      = function(){ blc.checkHtmlUrl("", null        ) };
			var checkHtmlUrl_number    = function(){ blc.checkHtmlUrl("", 0           ) };
			var checkHtmlUrl_object    = function(){ blc.checkHtmlUrl("", {0:0}       ) };
			var checkHtmlUrl_string    = function(){ blc.checkHtmlUrl("", ""          ) };
			var checkHtmlUrl_undefined = function(){ blc.checkHtmlUrl("", undefined   ) };
			
			expect(checkHtmlUrl_array    ).to.throw("handlers must be an object");
			expect(checkHtmlUrl_function ).to.throw("handlers must be an object");
			expect(checkHtmlUrl_null     ).to.throw("handlers must be an object");
			expect(checkHtmlUrl_number   ).to.throw("handlers must be an object");
			expect(checkHtmlUrl_object   ).to.not.throw("handlers must be an object");
			expect(checkHtmlUrl_string   ).to.throw("handlers must be an object");
			expect(checkHtmlUrl_undefined).to.throw("handlers must be an object");
			done();
		});
	});
	
	
	
	describe("edge cases", function()
	{
		it("should use url as base", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker().checkHtmlUrl(conn.absoluteUrls[0]+"/fixture/index.html",
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function(error)
				{
					if (error !== null)
					{
						done(error);
						return;
					}
					
					expect(results).to.have.length(2);
					
					expect(results[0].url).to.deep.equal({
						original: "link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/index.html",
						resolved: conn.absoluteUrls[0]+"/fixture/index.html"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="link-real.html">');
					expect(results[0].html.text).to.equal("link-real");
					expect(results[0].broken).to.be.false;
					
					expect(results[1].url).to.deep.equal({
						original: "link-fake.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html",
						redirected: null
					});
					expect(results[1].base).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/index.html",
						resolved: conn.absoluteUrls[0]+"/fixture/index.html"
					});
					expect(results[1].html.tagName).to.equal("a");
					expect(results[1].html.attrName).to.equal("href");
					expect(results[1].html.tag).to.equal('<a href="link-fake.html">');
					expect(results[1].html.text).to.equal("link-fake");
					expect(results[1].broken).to.be.true;
					
					done();
				}
			});
		});
		
		
		
		it("should ignore custom base", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker({base:conn.absoluteUrls[0]+"/fake/index.html"}).checkHtmlUrl(conn.absoluteUrls[0]+"/fixture/index.html",
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					results[result.html.index] = result;
				},
				complete: function(error)
				{
					if (error !== null)
					{
						done(error);
						return;
					}
					
					expect(results).to.have.length(2);
					
					expect(results[0].url).to.deep.equal({
						original: "link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html",
						redirected: null
					});
					expect(results[0].base).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/index.html",
						resolved: conn.absoluteUrls[0]+"/fixture/index.html"
					});
					expect(results[0].html.tagName).to.equal("a");
					expect(results[0].html.attrName).to.equal("href");
					expect(results[0].html.tag).to.equal('<a href="link-real.html">');
					expect(results[0].html.text).to.equal("link-real");
					expect(results[0].broken).to.be.false;
					
					expect(results[1].url).to.deep.equal({
						original: "link-fake.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html",
						redirected: null
					});
					expect(results[1].base).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/index.html",
						resolved: conn.absoluteUrls[0]+"/fixture/index.html"
					});
					expect(results[1].html.tagName).to.equal("a");
					expect(results[1].html.attrName).to.equal("href");
					expect(results[1].html.tag).to.equal('<a href="link-fake.html">');
					expect(results[1].html.text).to.equal("link-fake");
					expect(results[1].broken).to.be.true;
					
					done();
				}
			});
		});
		
		
		
		it("should reject non-html urls", function(done)
		{
			new BrokenLinkChecker().checkHtmlUrl(conn.absoluteUrls[0]+"/fixture/image.gif",
			{
				link: function(result)
				{
					//utils.logLinkObj(result);
					done( new Error("this should not have been called") );
				},
				complete: function(error)
				{
					expect(error).to.be.instanceOf(Error);
					done();
				}
			});
		});
	});
});
