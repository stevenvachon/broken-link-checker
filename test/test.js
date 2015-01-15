"use strict";
var expect = require("chai").expect;

var BrokenLinkChecker = require("../lib");



function logLinkObj(linkObj)
{
	linkObj.response = {};	// for easier logging
	console.log(linkObj);
}



describe("Public API", function()
{
	// Let internal http lib decide when to give up
	this.timeout(1000000);	// TODO :: 0 isn't working all of a sudden (?)
	
	
	
	describe("checkUrl", function()
	{
		it("should pass with a real absolute url", function(done)
		{
			new BrokenLinkChecker().checkUrl("https://google.com", function(result)
			{
				//logLinkObj(result);
				expect(result.broken).to.be.false;
				expect(result.url).to.equal("https://google.com");
				done();
			});
		});
		
		
		
		it("should fail with a fake absolute url", function(done)
		{
			new BrokenLinkChecker().checkUrl("http://asdf1234.asdf1234", function(result)
			{
				//logLinkObj(result);
				expect(result.broken).to.be.true;
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.code).to.equal("ENOTFOUND");
				done();
			});
		});
		
		
		
		it("should fail with an empty url", function(done)
		{
			// Reset to defeault timeout since no request should be made in this test
			this.timeout(2000);
			
			new BrokenLinkChecker().checkUrl("", function(result)
			{
				//logLinkObj(result);
				expect(result.broken).to.be.true;
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("invalid url");
				done();
			});
		});
		
		
		
		it("should pass with an empty url (with options)", function(done)
		{
			new BrokenLinkChecker({site:"http://google.com"}).checkUrl("", function(result)
			{
				//logLinkObj(result);
				expect(result.broken).to.be.false;
				expect(result.url).to.equal("");
				expect(result.resolvedUrl).to.equal("http://google.com/");
				done();
			});
		});
	});
	
	
	
	describe("checkHtml", function()
	{
		it("should support a single absolute url", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker().checkHtml('<a href="https://google.com">link</a>',
			{
				link: function(result, i)
				{
					//logLinkObj(result);
					results[i] = result;
				},
				complete: function(error)
				{
					if (error !== null)
					{
						done(error);
					}
					else
					{
						expect(results[0].tagName).to.equal("a");
						expect(results[0].attrName).to.equal("href");
						expect(results[0].tag).to.equal('<a href="https://google.com">');
						expect(results[0].broken).to.be.false;
						done();
					}
				}
			});
		});
		
		
		
		it("should support multiple absolute urls", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker().checkHtml('<a href="https://google.com">link1</a><a href="https://bing.com">link2</a>',
			{
				link: function(result, i)
				{
					//logLinkObj(result);
					results[i] = result;
				},
				complete: function(error)
				{
					if (error !== null)
					{
						done(error);
					}
					else
					{
						expect(results[0].tagName).to.equal("a");
						expect(results[0].attrName).to.equal("href");
						expect(results[0].tag).to.equal('<a href="https://google.com">');
						expect(results[0].broken).to.be.false;
						
						expect(results[1].tagName).to.equal("a");
						expect(results[1].attrName).to.equal("href");
						expect(results[1].tag).to.equal('<a href="https://bing.com">');
						expect(results[1].broken).to.be.false;
						
						done();
					}
				}
			});
		});
		
		
		
		it.skip("should support attribute values containing double quotes", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker().checkHtml('<a href="https://google.com" data-test="this is a \\"quote\\"!">link</a>',
			{
				link: function(result, i)
				{
					//logLinkObj(result);
					results[i] = result;
				},
				complete: function(error)
				{
					if (error !== null)
					{
						done(error);
					}
					else
					{
						/*expect(results[0].tagName).to.equal("a");
						expect(results[0].attrName).to.equal("href");
						expect(results[0].tag).to.equal('<a href="https://google.com">');
						expect(results[0].broken).to.be.false;*/
						done();
					}
				}
			});
		});
	});
	
	
	
	describe("checkHtmlUrl", function()
	{
		it("should work", function(done)
		{
			var results = [];
			
			new BrokenLinkChecker().checkHtmlUrl("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/index.html",
			{
				link: function(result, i)
				{
					//logLinkObj(result);
					results[i] = result;
				},
				complete: function(error)
				{
					if (error !== null)
					{
						done(error);
					}
					else
					{
						expect(results[0].tagName).to.equal("a");
						expect(results[0].attrName).to.equal("href");
						expect(results[0].tag).to.equal('<a href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html">');
						expect(results[0].broken).to.be.false;
						
						expect(results[1].tagName).to.equal("a");
						expect(results[1].attrName).to.equal("href");
						expect(results[1].tag).to.equal('<a href="https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html">');
						expect(results[1].broken).to.be.true;
						
						done();
					}
				}
			});
		});
	});
});
