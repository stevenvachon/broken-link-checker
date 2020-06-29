"use strict";
var matchUrl = require("../lib/internal/matchUrl");

var expect = require("chai").expect;



describe("matchUrl", function()
{
	it("works", function()
	{
		expect( matchUrl("http://keyword.com/", []) ).to.be.false;
		
		expect( matchUrl("http://keyword.com/", ["keyword"])   ).to.be.true;
		expect( matchUrl("http://keyword.com/", ["keyword*"])  ).to.be.false;
		expect( matchUrl("http://keyword.com/", ["*keyword"])  ).to.be.false;
		expect( matchUrl("http://keyword.com/", ["*keyword*"]) ).to.be.true;
		
		expect( matchUrl("http://keyword.com/", ["keyword.com"])   ).to.be.true;
		expect( matchUrl("http://keyword.com/", ["*keyword.com"])  ).to.be.false;
		expect( matchUrl("http://keyword.com/", ["keyword.com*"])  ).to.be.false;
		expect( matchUrl("http://keyword.com/", ["*keyword.com*"]) ).to.be.true;
		
		expect( matchUrl("http://keyword.com/", ["*keyword.*"]) ).to.be.true;
		
		expect( matchUrl("http://keyword.com/", ["*.com"])  ).to.be.false;
		expect( matchUrl("http://keyword.com/", ["*.com*"]) ).to.be.true;
		expect( matchUrl("http://keyword.com",  ["*.com"])  ).to.be.true;
		expect( matchUrl("http://keyword.com",  ["*.com*"]) ).to.be.false;
		
		expect( matchUrl("http://keyword.net/.com/", [".com"])   ).to.be.true;
		expect( matchUrl("http://keyword.net/.com/", ["*.com*"]) ).to.be.true;
		
		expect( matchUrl("http://keyword.com/",     ["*://keyword.com*"])   ).to.be.true;
		expect( matchUrl("http://www.keyword.com/", ["*://*.keyword.com*"]) ).to.be.true;
		
		expect( matchUrl("http://keyword.com/", ["nope","keyword.com","nope"]) ).to.be.true;
		
		expect( matchUrl("http://domain.com/keyword/", ["keyword"])   ).to.be.true;
		expect( matchUrl("http://domain.com/keyword/", ["/keyword"])  ).to.be.true;
		expect( matchUrl("http://domain.com/keyword/", ["keyword/"])  ).to.be.true;
		expect( matchUrl("http://domain.com/keyword/", ["/keyword/"]) ).to.be.true;
		
		expect( matchUrl("http://domain.com/dir/keyword/", ["keyword"])   ).to.be.true;
		expect( matchUrl("http://domain.com/dir/keyword/", ["/keyword"])  ).to.be.true;
		expect( matchUrl("http://domain.com/dir/keyword/", ["keyword/"])  ).to.be.true;
		expect( matchUrl("http://domain.com/dir/keyword/", ["/keyword/"]) ).to.be.true;
		
		expect( matchUrl("http://domain.com/dir/keyword/", ["domain.com/keyword/"]) ).to.be.false;
		expect( matchUrl("http://domain.com/dir/keyword/", ["domain.com/dir/keyword/"]) ).to.be.true;
	});
});
