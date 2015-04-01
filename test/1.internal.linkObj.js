"use strict";
var linkObj = require("../lib/internal/linkObj");

var options = require("./utils").options();

var expect = require("chai").expect;



describe("INTERNAL -- linkObj", function()
{
	describe("linkObj()", function()
	{
		it("should work", function(done)
		{
			var link = linkObj("http://fakeurl.com/");
			
			expect(link).to.be.instanceOf(Object);
			expect(link.base).to.be.instanceOf(Object);
			expect(link.broken_link_checker).to.be.true;
			expect(link.html).to.be.instanceOf(Object);
			expect(link.http).to.be.instanceOf(Object);
			expect(link.url).to.be.instanceOf(Object);
			done();
		});
	});
	
	
	
	describe("linkObj.clean()", function()
	{
		it("should work", function(done)
		{
			var link = linkObj("http://fakeurl.com");
			
			linkObj.clean(link);
			
			expect(link.broken_link_checker).to.be.undefined;
			done();
		});
	});
	
	
	
	describe("linkObj.resolve()", function()
	{
		it("should work", function(done)
		{
			var url = "http://fakeurl.com";
			var link = linkObj(url);
			
			linkObj.resolve(link, url, options);
			
			expect(link.url.original).to.equal(url);
			expect(link.url.resolved).to.equal(url+"/");
			expect(link.url.redirected).to.be.null;
			expect(link.url.parsed).to.be.instanceOf(Object);
			expect(link.url.parsed.protocol).to.equal("http:");
			expect(link.url.parsed.protocolTruncated).to.equal("http");
			
			expect(link.base.original).to.equal(url);
			expect(link.base.resolved).to.equal(url+"/");
			expect(link.base.parsed).to.be.instanceOf(Object);
			
			expect(link.html.tag).to.be.null;	// No HTML has been parsed
			expect(link.http.statusCode).to.be.null;	// No request has been made
			
			expect(link.internal).to.be.true;
			expect(link.samePage).to.be.true;
			expect(link.error).to.be.null;
			expect(link.broken_link_checker).to.be.true;
			
			done();
		});
		
		
		
		describe("absolute url", function()
		{
			it("with NO BASE and NO HTML BASE should work", function(done)
			{
				var base = null;
				var url  = "http://fakeurl.com/";
				var link = linkObj(url);
				
				linkObj.resolve(link, base, options);
				
				expect(link.url.original).to.equal(url);
				expect(link.url.resolved).to.equal(url);
				
				expect(link.base.original).to.be.null;
				expect(link.base.resolved).to.be.null;
				
				expect(link.html.base).to.be.null;
				
				expect(link.internal).to.be.null;
				expect(link.samePage).to.be.null;
				
				done();
			});
			
			
			
			it("with NO BASE and ABSOLUTE HTML BASE should work", function(done)
			{
				var base     = null;
				var htmlBase = "http://fakeurl2.com/";
				var url      = "http://fakeurl1.com/";
				
				var link = linkObj(url);
				link.html.base = htmlBase;
				
				linkObj.resolve(link, base, options);
				
				expect(link.url.original).to.equal(url);
				expect(link.url.resolved).to.equal(url);
				
				expect(link.base.original).to.be.null;
				expect(link.base.resolved).to.equal(htmlBase);
				
				expect(link.html.base).to.equal(htmlBase);
				
				expect(link.internal).to.be.false;
				expect(link.samePage).to.be.false;
				
				done();
			});
			
			
			
			it("with NO BASE and RELATIVE HTML BASE should work", function(done)
			{
				var base     = null;
				var htmlBase = "/path/";
				var url      = "http://fakeurl.com/";
				
				var link = linkObj(url);
				link.html.base = htmlBase;
				
				linkObj.resolve(link, base, options);
				
				expect(link.url.original).to.equal(url);
				expect(link.url.resolved).to.equal(url);
				
				expect(link.base.original).to.be.null;
				expect(link.base.resolved).to.equal(htmlBase);
				
				expect(link.html.base).to.equal(htmlBase);
				
				expect(link.internal).to.be.false;
				expect(link.samePage).to.be.false;
				
				done();
			});
			
			
			
			it("with an ABSOLUTE BASE and NO HTML BASE should work", function(done)
			{
				var base = "http://fakeurl2.com/";
				var url  = "http://fakeurl1.com/";
				var link = linkObj(url);
				
				linkObj.resolve(link, base, options);
				
				expect(link.url.original).to.equal(url);
				expect(link.url.resolved).to.equal(url);
				
				expect(link.base.original).to.equal(base);
				expect(link.base.resolved).to.equal(base);
				
				expect(link.html.base).to.be.null;
				
				expect(link.internal).to.be.false;
				expect(link.samePage).to.be.false;
				
				done();
			});
			
			
			
			it("with an ABSOLUTE BASE and ABSOLUTE HTML BASE should work", function(done)
			{
				var base     = "http://fakeurl2.com/";
				var htmlBase = "http://fakeurl3.com/";
				var url      = "http://fakeurl1.com/";
				
				var link = linkObj(url);
				link.html.base = htmlBase;
				
				linkObj.resolve(link, base, options);
				
				expect(link.url.original).to.equal(url);
				expect(link.url.resolved).to.equal(url);
				
				expect(link.base.original).to.equal(base);
				expect(link.base.resolved).to.equal(htmlBase);
				
				expect(link.html.base).to.equal(htmlBase);
				
				expect(link.internal).to.be.false;
				expect(link.samePage).to.be.false;
				
				done();
			});
			
			
			
			it("with an ABSOLUTE BASE and RELATIVE HTML BASE should work", function(done)
			{
				var base     = "http://fakeurl2.com/";
				var htmlBase = "/path/";
				var url      = "http://fakeurl1.com/";
				
				var link = linkObj(url);
				link.html.base = htmlBase;
				
				linkObj.resolve(link, base, options);
				
				expect(link.url.original).to.equal(url);
				expect(link.url.resolved).to.equal(url);
				
				expect(link.base.original).to.equal(base);
				expect(link.base.resolved).to.equal("http://fakeurl2.com/path/");
				
				expect(link.html.base).to.equal(htmlBase);
				
				expect(link.internal).to.be.false;
				expect(link.samePage).to.be.false;
				
				done();
			});
			
			
			
			it("with a RELATIVE BASE and NO HTML BASE should work", function(done)
			{
				var base = "/path/";
				var url  = "http://fakeurl.com/";
				var link = linkObj(url);
				
				linkObj.resolve(link, base, options);
				
				expect(link.url.original).to.equal(url);
				expect(link.url.resolved).to.equal(url);
				
				expect(link.base.original).to.equal(base);
				expect(link.base.resolved).to.equal(base);
				
				expect(link.html.base).to.be.null;
				
				expect(link.internal).to.be.false;
				expect(link.samePage).to.be.false;
				
				done();
			});
			
			
			
			it("with a RELATIVE BASE and ABSOLUTE HTML BASE should work", function(done)
			{
				var base     = "/path/";
				var htmlBase = "http://fakeurl2.com/";
				var url      = "http://fakeurl1.com/";
				
				var link = linkObj(url);
				link.html.base = htmlBase;
				
				linkObj.resolve(link, base, options);
				
				expect(link.url.original).to.equal(url);
				expect(link.url.resolved).to.equal(url);
				
				expect(link.base.original).to.equal(base);
				expect(link.base.resolved).to.equal(htmlBase);
				
				expect(link.html.base).to.equal(htmlBase);
				
				expect(link.internal).to.be.false;
				expect(link.samePage).to.be.false;
				
				done();
			});
			
			
			
			it("with a RELATIVE BASE and RELATIVE HTML BASE should work", function(done)
			{
				var base     = "/path/";
				var htmlBase = "to/";
				var url      = "http://fakeurl.com/";
				
				var link = linkObj(url);
				link.html.base = htmlBase;
				
				linkObj.resolve(link, base, options);
				
				expect(link.url.original).to.equal(url);
				expect(link.url.resolved).to.equal(url);
				
				expect(link.base.original).to.equal(base);
				expect(link.base.resolved).to.equal("/path/to/");
				
				expect(link.html.base).to.equal(htmlBase);
				
				expect(link.internal).to.be.false;
				expect(link.samePage).to.be.false;
				
				done();
			});
		});
		
		
		
		describe("relative url", function()
		{
			it("with NO BASE and NO HTML BASE should not work", function(done)
			{
				var base = null;
				var url  = "/path/resource.html";
				var link = linkObj(url);
				
				linkObj.resolve(link, base, options);
				
				expect(link.url.original).to.equal(url);
				expect(link.url.resolved).to.be.null;
				
				expect(link.base.original).to.be.null;
				expect(link.base.resolved).to.be.null;
				
				expect(link.html.base).to.be.null;
				
				expect(link.internal).to.be.null;
				expect(link.samePage).to.be.null;
				
				done();
			});
			
			
			
			it("with NO BASE and ABSOLUTE HTML BASE should work", function(done)
			{
				var base     = null;
				var htmlBase = "http://fakeurl.com/";
				var url      = "/path/resource.html";
				
				var link = linkObj(url);
				link.html.base = htmlBase;
				
				linkObj.resolve(link, base, options);
				
				expect(link.url.original).to.equal(url);
				expect(link.url.resolved).to.equal("http://fakeurl.com/path/resource.html");
				
				expect(link.base.original).to.be.null;
				expect(link.base.resolved).to.equal(htmlBase);
				
				expect(link.html.base).to.equal(htmlBase);
				
				expect(link.internal).to.be.true;
				expect(link.samePage).to.be.false;
				
				done();
			});
			
			
			
			it("with NO BASE and RELATIVE HTML BASE should not work", function(done)
			{
				var base     = null;
				var htmlBase = "/path/";
				var url      = "resource.html";
				
				var link = linkObj(url);
				link.html.base = htmlBase;
				
				linkObj.resolve(link, base, options);
				
				expect(link.url.original).to.equal(url);
				expect(link.url.resolved).to.be.null;
				
				expect(link.base.original).to.be.null;
				expect(link.base.resolved).to.equal(htmlBase);
				
				expect(link.html.base).to.equal(htmlBase);
				
				expect(link.internal).to.be.null;
				expect(link.samePage).to.be.null;
				
				done();
			});
			
			
			
			it("with an ABSOLUTE BASE and NO HTML BASE should work", function(done)
			{
				var base = "http://fakeurl.com/";
				var url  = "/path/resource.html";
				var link = linkObj(url);
				
				linkObj.resolve(link, base, options);
				
				expect(link.url.original).to.equal(url);
				expect(link.url.resolved).to.equal("http://fakeurl.com/path/resource.html");
				
				expect(link.base.original).to.equal(base);
				expect(link.base.resolved).to.equal(base);
				
				expect(link.html.base).to.be.null;
				
				expect(link.internal).to.be.true;
				expect(link.samePage).to.be.false;
				
				done();
			});
			
			
			
			it("with an ABSOLUTE BASE and ABSOLUTE HTML BASE should work", function(done)
			{
				var base     = "http://fakeurl1.com/";
				var htmlBase = "http://fakeurl2.com/";
				var url      = "/path/resource.html";
				
				var link = linkObj(url);
				link.html.base = htmlBase;
				
				linkObj.resolve(link, base, options);
				
				expect(link.url.original).to.equal(url);
				expect(link.url.resolved).to.equal("http://fakeurl2.com/path/resource.html");
				
				expect(link.base.original).to.equal(base);
				expect(link.base.resolved).to.equal(htmlBase);
				
				expect(link.html.base).to.equal(htmlBase);
				
				expect(link.internal).to.be.true;
				expect(link.samePage).to.be.false;
				
				done();
			});
			
			
			
			it("with an ABSOLUTE BASE and RELATIVE HTML BASE should work", function(done)
			{
				var base     = "http://fakeurl.com/";
				var htmlBase = "/path/";
				var url      = "resource.html";
				
				var link = linkObj(url);
				link.html.base = htmlBase;
				
				linkObj.resolve(link, base, options);
				
				expect(link.url.original).to.equal(url);
				expect(link.url.resolved).to.equal("http://fakeurl.com/path/resource.html");
				
				expect(link.base.original).to.equal(base);
				expect(link.base.resolved).to.equal("http://fakeurl.com/path/");
				
				expect(link.html.base).to.equal(htmlBase);
				
				expect(link.internal).to.be.true;
				expect(link.samePage).to.be.false;
				
				done();
			});
			
			
			
			it("with a RELATIVE BASE and NO HTML BASE should not work", function(done)
			{
				var base = "/path/";
				var url  = "resource.html";
				var link = linkObj(url);
				
				linkObj.resolve(link, base, options);
				
				expect(link.url.original).to.equal(url);
				expect(link.url.resolved).to.be.null;
				
				expect(link.base.original).to.equal(base);
				expect(link.base.resolved).to.equal(base);
				
				expect(link.html.base).to.be.null;
				
				expect(link.internal).to.be.null;
				expect(link.samePage).to.be.null;
				
				done();
			});
			
			
			
			it("with a RELATIVE BASE and ABSOLUTE HTML BASE should work", function(done)
			{
				var base     = "/path/";
				var htmlBase = "http://fakeurl.com/";
				var url      = "resource.html";
				
				var link = linkObj(url);
				link.html.base = htmlBase;
				
				linkObj.resolve(link, base, options);
				
				expect(link.url.original).to.equal(url);
				expect(link.url.resolved).to.equal("http://fakeurl.com/resource.html");
				
				expect(link.base.original).to.equal(base);
				expect(link.base.resolved).to.equal("http://fakeurl.com/");
				
				expect(link.html.base).to.equal(htmlBase);
				
				expect(link.internal).to.be.true;
				expect(link.samePage).to.be.false;
				
				done();
			});
			
			
			
			it("with a RELATIVE BASE and RELATIVE HTML BASE should not work", function(done)
			{
				var base     = "/path/";
				var htmlBase = "to/";
				var url      = "resource.html";
				
				var link = linkObj(url);
				link.html.base = htmlBase;
				
				linkObj.resolve(link, base, options);
				
				expect(link.url.original).to.equal(url);
				expect(link.url.resolved).to.be.null;
				
				expect(link.base.original).to.equal(base);
				expect(link.base.resolved).to.equal("/path/to/");
				
				expect(link.html.base).to.equal(htmlBase);
				
				expect(link.internal).to.be.null;
				expect(link.samePage).to.be.null;
				
				done();
			});
		});
	});
});
