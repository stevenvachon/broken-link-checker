"use strict";
var BrokenLinkChecker = require("../lib");



describe("Public API", function()
{
	describe("checkUrl", function()
	{
		it("should pass with a real absolute url", function(done)
		{
			// Let internal http lib decide when to give up
			this.timeout(0);
			
			new BrokenLinkChecker().checkUrl("https://google.com", function(result)
			{
				result.response = {};	// temp -- for easier logging
				console.log(result);
				done();
			});
		});
		
		
		
		it("should fail with a fake absolute url", function(done)
		{
			// Let internal http lib decide when to give up
			this.timeout(0);
			
			new BrokenLinkChecker().checkUrl("http://asdf1234.asdf1234", function(result)
			{
				result.response = {};	// temp -- for easier logging
				console.log(result);
				done();
			});
		});
		
		
		
		it("should fail with an empty url", function(done)
		{
			new BrokenLinkChecker().checkUrl("", function(result)
			{
				result.response = {};	// temp -- for easier logging
				console.log(result);
				done();
			});
		});
		
		
		
		it("should fail with an empty url (with options)", function(done)
		{
			new BrokenLinkChecker({site:"http://google.com"}).checkUrl("", function(result)
			{
				result.response = {};	// temp -- for easier logging
				console.log(result);
				done();
			});
		});
	});
	
	
	
	describe("checkHtml", function()
	{
		it("should support a single absolute url", function(done)
		{
			// Let internal http lib decide when to give up
			this.timeout(0);
			
			new BrokenLinkChecker().checkHtml('<a href="https://google.com">link</a>', function(result)
			{
				result.response = {};	// temp -- for easier logging
				console.log(result);
				done();
			});
		});
		
		
		
		it("should support multiple absolute urls", function(done)
		{
			// Let internal http lib decide when to give up
			this.timeout(0);
			
			var count = 0;
			var results = new Array(2);	// TODO :: what if we didn't know how many links to expect?
			
			new BrokenLinkChecker().checkHtml('<a href="https://google.com">link1</a><a href="https://bing.com">link2</a>', function(result, i)
			{
				result.response = {};	// temp -- for easier logging
				results[i] = result;
				
				if (++count >= results.length)
				{
					console.log(results);
					done();
				}
			});
		});
		
		
		
		it.skip("should support attribute values containing double quotes", function(done)
		{
			new BrokenLinkChecker().checkHtml('<a href="https://google.com" data-test="this is a \\"quote\\"!">link</a>', function(result)
			{
				console.log(result);
				done();
			});
		});
	});
	
	
	
	describe("checkHtmlUrl", function()
	{
		it("should work", function(done)
		{
			// Let internal http lib decide when to give up
			this.timeout(0);
			
			var count = 0;
			var results = new Array(2);	// TODO :: what if we didn't know how many links to expect?
			
			new BrokenLinkChecker().checkHtmlUrl("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/index.html", function(result, i)
			{
				result.response = {};	// temp -- for easier logging
				results[i] = result;
				
				if (++count >= results.length)
				{
					console.log(results);
					done();
				}
			});
		});
	});
});
