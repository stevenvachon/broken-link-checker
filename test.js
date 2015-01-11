"use strict";
var BrokenLinkChecker = require("./lib");



describe("Public API", function()
{
	it("should support absolute urls", function(done)
	{
		new BrokenLinkChecker().checkHtml('<a href="https://google.com">link</a>', function(linkObj)
		{
			console.log(linkObj);
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
