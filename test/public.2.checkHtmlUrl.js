"use strict";
var BrokenLinkChecker = require("../lib");
var utils = require("./utils");

var expect = require("chai").expect;



describe("checkHtmlUrl", function()
{
	// Let internal http lib decide when to give up
	this.timeout(0);
	
	
	
	describe("should accept only valid input types for", function()
	{
		// Reset to defeault timeout since no request should be made in this test
		this.timeout(2000);
		
		
		
		it("url", function(done)
		{
			var blc = new BrokenLinkChecker();
			var checkHtmlUrl_array    = function(){ blc.checkHtmlUrl([0],          {}) };
			var checkHtmlUrl_function = function(){ blc.checkHtmlUrl(function(){}, {}) };
			var checkHtmlUrl_number   = function(){ blc.checkHtmlUrl(0,            {}) };
			var checkHtmlUrl_object   = function(){ blc.checkHtmlUrl({0:0},        {}) };
			var checkHtmlUrl_string   = function(){ blc.checkHtmlUrl("",           {}) };
			
			expect(checkHtmlUrl_array   ).to.throw("url must be a string");
			expect(checkHtmlUrl_function).to.throw("url must be a string");
			expect(checkHtmlUrl_number  ).to.throw("url must be a string");
			expect(checkHtmlUrl_object  ).to.throw("url must be a string");
			expect(checkHtmlUrl_string  ).to.not.throw("url must be a string");
			done();
		});
		
		
		
		it("handlers", function(done)
		{
			var blc = new BrokenLinkChecker();
			var checkHtmlUrl_array    = function(){ blc.checkHtmlUrl("", [0]         ) };
			var checkHtmlUrl_function = function(){ blc.checkHtmlUrl("", function(){}) };
			var checkHtmlUrl_number   = function(){ blc.checkHtmlUrl("", 0           ) };
			var checkHtmlUrl_object   = function(){ blc.checkHtmlUrl("", {0:0}       ) };
			var checkHtmlUrl_string   = function(){ blc.checkHtmlUrl("", ""          ) };
			
			// TODO :: check undefined/null
			expect(checkHtmlUrl_array   ).to.throw("handlers must be an object");
			expect(checkHtmlUrl_function).to.throw("handlers must be an object");
			expect(checkHtmlUrl_number  ).to.throw("handlers must be an object");
			expect(checkHtmlUrl_object  ).to.not.throw("handlers must be an object");
			expect(checkHtmlUrl_string  ).to.throw("handlers must be an object");
			done();
		});
	});
	
	
	
	it("should work", function(done)
	{
		var results = [];
		
		new BrokenLinkChecker().checkHtmlUrl("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/index.html",
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
				
				expect(results[0].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html");
				expect(results[0].html.tagName).to.equal("a");
				expect(results[0].html.attrName).to.equal("href");
				expect(results[0].html.tag).to.equal('<a href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">');
				expect(results[0].html.text).to.equal("link-real");
				expect(results[0].broken).to.be.false;
				
				expect(results[1].url.original).to.equal("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html");
				expect(results[1].html.tagName).to.equal("a");
				expect(results[1].html.attrName).to.equal("href");
				expect(results[1].html.tag).to.equal('<a href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html">');
				expect(results[1].html.text).to.equal("link-fake");
				expect(results[1].broken).to.be.true;
				
				done();
			}
		});
	});
});
