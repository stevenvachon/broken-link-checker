"use strict";
var BrokenLinkChecker = require("./lib");



describe("Public API", function()
{
	describe("checkUrl", function()
	{
		it("should check a single absolute url", function(done)
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
	});
	
	
	
	describe("checkHtml", function()
	{
		it("should support a single absolute url", function(done)
		{
			new BrokenLinkChecker().checkHtml('<a href="https://google.com">link</a>', function(results)
			{
				results[0].response = {};	// temp -- for easier logging
				console.log(results);
				done();
			});
		});
		
		
		
		it.skip("should support attribute values containing double quotes", function(done)
		{
			new BrokenLinkChecker().checkHtml('<a href="https://google.com" data-test="this is a \\"quote\\"!">link</a>', function(linkObj)
			{
				console.log(linkObj);
				done();
			});
		});
	});
});
