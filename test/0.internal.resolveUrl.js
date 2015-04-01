"use strict";
var resolveUrl = require("../lib/internal/resolveUrl");

var acceptedSchemes = require("./utils").options().acceptedSchemes;

var expect = require("chai").expect;



describe("INTERNAL -- resolveUrl", function()
{
	it("should work with an absolute url", function(done)
	{
		var base = "http://fakeurl.com/";
		var url = "http://fakeurl.com/";
		var resolved = resolveUrl(url, base, acceptedSchemes);
		
		expect(resolved).to.equal(url);
		done();
	});
	
	
	
	it("should work with a relative url", function(done)
	{
		var base = "http://fakeurl.com/";
		var url = "/path/resource.html";
		var resolved = resolveUrl(url, base, acceptedSchemes);
		
		expect(resolved).to.equal("http://fakeurl.com/path/resource.html");
		done();
	});
	
	
	
	it("should accept an absolute url with a relative base", function(done)
	{
		var base = "/path/";
		var url = "http://fakeurl.com/";
		var resolved = resolveUrl(url, base, acceptedSchemes);
		
		expect(resolved).to.equal(url);
		done();
	});
	
	
	
	it("should reject a relative url with a relative base", function(done)
	{
		var base = "/path/";
		var url = "resource.html";
		var resolved = resolveUrl(url, base, acceptedSchemes);
		
		expect(resolved).to.be.false;
		done();
	});
	
	
	
	it("should reject an absolute url with a scheme/protocol not specified as accepted", function(done)
	{
		var base = "http://fakeurl.com/";
		var url = "smtp://fakeurl.com/";
		var resolved = resolveUrl(url, base, acceptedSchemes);
		
		expect(resolved).to.be.false;
		done();
	});
	
	
	
	it("should reject a relative url with a scheme/protocol not specified as accepted", function(done)
	{
		var base = "smtp://fakeurl.com/";
		var url = "/path/resource.html";
		var resolved = resolveUrl(url, base, acceptedSchemes);
		
		expect(resolved).to.be.false;
		done();
	});
});
