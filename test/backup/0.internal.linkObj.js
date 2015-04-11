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
		
		
		
		describe("remote absolute url", function()
		{
			it.skip("should work", function(){});
		});
		
		
		
		describe.only("local absolute url", function()
		{
			describe("with an ABSOLUTE base", function()
			{
				it("and REMOTE ABSOLUTE html base should work", function(done)
				{
					var base     = "http://fakeurl1.com/path/link.html";
					var htmlBase = "http://fakeurl2.com/path/link.html";
					var url      = "http://fakeurl1.com/path/link.html";
					
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
				
				
				
				it("and LOCAL ABSOLUTE html base should work", function(done)
				{
					var base     = "http://fakeurl.com/path/link.html?query#hash";
					var htmlBase = "http://fakeurl.com/path/link.html?query#hash";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal(base);
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.true;
					expect(link.samePage).to.be.true;
					
					done();
				});
				
				
				
				// TODO :: root-path-relative, path-relative, resource-relative, query-relative, hash-relative
				// as links, bases and html bases
				
				
				
				it("and ROOT-PATH-RELATIVE html base should work", function(done)
				{
					var base     = "http://fakeurl.com/path/link.html?query#hash";
					var htmlBase = "/path/link.html?query#hash";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal(base);
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.true;
					expect(link.samePage).to.be.true;
					
					done();
				});
				
				
				
				it("and PATH-RELATIVE html base should work", function(done)
				{
					var base     = "http://fakeurl.com/path/link.html?query#hash";
					var htmlBase = "path/link.html?query#hash";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal("http://fakeurl.com/path/path/link.html?query#hash");
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.true;
					expect(link.samePage).to.be.false;
					
					done();
				});
				
				
				
				it("and RESOURCE-RELATIVE html base should work", function(done)
				{
					var base     = "http://fakeurl.com/path/link.html?query#hash";
					var htmlBase = "link.html?query#hash";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal(base);
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.true;
					expect(link.samePage).to.be.true;
					
					done();
				});
				
				
				
				it("and QUERY-RELATIVE html base should work", function(done)
				{
					var base     = "http://fakeurl.com/path/link.html?query#hash";
					var htmlBase = "?query#hash";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal(base);
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.true;
					expect(link.samePage).to.be.true;
					
					done();
				});
				
				
				
				it("and HASH-RELATIVE html base should work", function(done)
				{
					var base     = "http://fakeurl.com/path/link.html?query#hash";
					var htmlBase = "#hash";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal(base);
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.true;
					expect(link.samePage).to.be.true;
					
					done();
				});
				
				
				
				it("and EMPTY html base should work", function(done)
				{
					var base     = "http://fakeurl.com/path/link.html?query#hash";
					var htmlBase = "";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal("http://fakeurl.com/path/link.html?query");	// TODO :: shouldn't this have a hash?
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.true;
					expect(link.samePage).to.be.true;
					
					done();
				});
				
				
				
				it("and UNDEFINED html base should work", function(done)
				{
					var base = "http://fakeurl.com/path/link.html?query#hash";
					var url  = "http://fakeurl.com/path/link.html?query#hash";
					var link = linkObj(url);
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal("http://fakeurl.com/path/link.html?query");	// TODO :: shouldn't this have a hash?
					
					expect(link.html.base).to.be.null;
					
					expect(link.internal).to.be.true;
					expect(link.samePage).to.be.true;
					
					done();
				});
			});
			
			
			
			describe("with a ROOT-PATH-RELATIVE base", function()
			{
				it("and REMOTE ABSOLUTE html base should work", function(done)
				{
					var base     = "/path/link.html?query#hash";
					var htmlBase = "http://fakeurl2.com/path/link.html?query#hash";
					var url      = "http://fakeurl1.com/path/link.html?query#hash";
					
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
				
				
				
				it("and LOCAL ABSOLUTE html base should work", function(done)
				{
					var base     = "/path/link.html?query#hash";
					var htmlBase = "http://fakeurl.com/path/link.html?query#hash";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal(htmlBase);
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.true;
					expect(link.samePage).to.be.true;
					
					done();
				});
				
				
				
				// TODO :: root-path-relative, path-relative, resource-relative, query-relative, hash-relative
				// as links, bases and html bases
				
				
				
				it("and ROOT-PATH-RELATIVE html base should work", function(done)
				{
					var base     = "/path/link.html?query#hash";
					var htmlBase = "/path/link.html?query#hash";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal(base);
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.false;
					expect(link.samePage).to.be.false;
					
					done();
				});
				
				
				
				it("and PATH-RELATIVE html base should work", function(done)
				{
					var base     = "/path/link.html?query#hash";
					var htmlBase = "path/link.html?query#hash";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal("/path/path/link.html?query#hash");
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.false;
					expect(link.samePage).to.be.false;
					
					done();
				});
				
				
				
				it("and RESOURCE-RELATIVE html base should work", function(done)
				{
					var base     = "/path/link.html?query#hash";
					var htmlBase = "link.html?query#hash";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal("/path/link.html?query#hash");
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.false;
					expect(link.samePage).to.be.false;
					
					done();
				});
				
				
				
				it("and QUERY-RELATIVE html base should work", function(done)
				{
					var base     = "/path/link.html?query#hash";
					var htmlBase = "?query#hash";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal("/path/link.html?query#hash");
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.false;
					expect(link.samePage).to.be.false;
					
					done();
				});
				
				
				
				it("and HASH-RELATIVE html base should work", function(done)
				{
					var base     = "/path/link.html?query#hash";
					var htmlBase = "?query#hash";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal("/path/link.html?query#hash");
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.false;
					expect(link.samePage).to.be.false;
					
					done();
				});
				
				
				
				it("and EMPTY html base should work", function(done)
				{
					var base     = "/path/link.html?query#hash";
					var htmlBase = "";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal("/path/link.html?query");	// TODO :: shouldn't this have a hash?
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.false;
					expect(link.samePage).to.be.false;
					
					done();
				});
				
				
				
				it("and UNDEFINED html base should work", function(done)
				{
					var base = "/path/link.html?query#hash";
					var url  = "http://fakeurl.com/path/link.html?query#hash";
					var link = linkObj(url);
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal("/path/link.html?query");	// TODO :: shouldn't this have a hash?
					
					expect(link.html.base).to.be.null;
					
					expect(link.internal).to.be.false;
					expect(link.samePage).to.be.false;
					
					done();
				});
			});
			
			
			
			describe("with a PATH-RELATIVE base", function()
			{
				it("and REMOTE ABSOLUTE html base should work", function(done)
				{
					var base     = "path/link.html?query#hash";
					var htmlBase = "http://fakeurl2.com/path/link.html?query#hash";
					var url      = "http://fakeurl1.com/path/link.html?query#hash";
					
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
				
				
				
				it("and LOCAL ABSOLUTE html base should work", function(done)
				{
					var base     = "path/link.html?query#hash";
					var htmlBase = "http://fakeurl.com/path/link.html?query#hash";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal(htmlBase);
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.true;
					expect(link.samePage).to.be.true;
					
					done();
				});
				
				
				
				// TODO :: root-path-relative, path-relative, resource-relative, query-relative, hash-relative
				// as links, bases and html bases
				
				
				
				it("and ROOT-PATH-RELATIVE html base should work", function(done)
				{
					var base     = "path/link.html?query#hash";
					var htmlBase = "/path/link.html?query#hash";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal(base);
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.false;
					expect(link.samePage).to.be.false;
					
					done();
				});
				
				
				
				it("and PATH-RELATIVE html base should work", function(done)
				{
					var base     = "/?query#hash";
					var htmlBase = "path/link.html?query#hash";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal("/path/link.html?query#hash");
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.false;
					expect(link.samePage).to.be.false;
					
					done();
				});
				
				
				
				it("and RESOURCE-RELATIVE html base should work", function(done)
				{
					var base     = "/path/link.html?query#hash";
					var htmlBase = "link.html?query#hash";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal("/path/link.html?query#hash");
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.false;
					expect(link.samePage).to.be.false;
					
					done();
				});
				
				
				
				it("and QUERY-RELATIVE html base should work", function(done)
				{
					var base     = "/path/link.html?query#hash";
					var htmlBase = "?query#hash";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal("/path/link.html?query#hash");
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.false;
					expect(link.samePage).to.be.false;
					
					done();
				});
				
				
				
				it("and HASH-RELATIVE html base should work", function(done)
				{
					var base     = "/path/link.html?query#hash";
					var htmlBase = "?query#hash";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal("/path/link.html?query#hash");
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.false;
					expect(link.samePage).to.be.false;
					
					done();
				});
				
				
				
				it("and EMPTY html base should work", function(done)
				{
					var base     = "/path/link.html?query#hash";
					var htmlBase = "";
					var url      = "http://fakeurl.com/path/link.html?query#hash";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal("/path/link.html?query");	// TODO :: shouldn't this have a hash?
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.false;
					expect(link.samePage).to.be.false;
					
					done();
				});
				
				
				
				it("and UNDEFINED html base should work", function(done)
				{
					var base = "/path/link.html?query#hash";
					var url  = "http://fakeurl.com/path/link.html?query#hash";
					var link = linkObj(url);
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal("/path/link.html?query");	// TODO :: shouldn't this have a hash?
					
					expect(link.html.base).to.be.null;
					
					expect(link.internal).to.be.false;
					expect(link.samePage).to.be.false;
					
					done();
				});
			});
			
			
			
			/*describe("with a RELATIVE base", function()
			{
				it("and ABSOLUTE HTML BASE should work", function(done)
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
				
				
				
				it("and RELATIVE HTML BASE should work", function(done)
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
				
				
				
				it("and EMPTY HTML BASE should work", function(done)
				{
					var base     = "/path/";
					var htmlBase = "";
					var url      = "http://fakeurl.com/";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal(base);
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.false;
					expect(link.samePage).to.be.false;
					
					done();
				});
				
				
				
				it("and NO HTML BASE should work", function(done)
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
			});
			
			
			
			describe("with an EMPTY base", function()
			{
				it("and ABSOLUTE HTML BASE should work", function(done)
				{
					var base     = "";
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
				
				
				
				it("and RELATIVE HTML BASE should work", function(done)
				{
					var base     = "";
					var htmlBase = "/path/";
					var url      = "http://fakeurl.com/";
					
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
				
				
				
				it("and EMPTY HTML BASE should work", function(done)
				{
					var base     = "";
					var htmlBase = "";
					var url      = "http://fakeurl.com/";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.be.null;
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.null;
					expect(link.samePage).to.be.null;
					
					done();
				});
				
				
				
				it("and NO HTML BASE should work", function(done)
				{
					var base = "";
					var url  = "http://fakeurl.com/";
					var link = linkObj(url);
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.be.null;
					
					expect(link.html.base).to.be.null;
					
					expect(link.internal).to.be.null;
					expect(link.samePage).to.be.null;
					
					done();
				});
			});
			
			
			
			describe("with an UNDEFINED base", function()
			{
				it("and ABSOLUTE HTML BASE should work", function(done)
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
				
				
				
				it("and RELATIVE HTML BASE should work", function(done)
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
				
				
				
				it("and EMPTY HTML BASE should work", function(done)
				{
					var base     = null;
					var htmlBase = "";
					var url      = "http://fakeurl.com/";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal(url);
					
					expect(link.base.original).to.be.null;
					expect(link.base.resolved).to.be.null;
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.null;
					expect(link.samePage).to.be.null;
					
					done();
				});
				
				
				
				it("and NO HTML BASE should work", function(done)
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
			});*/
		});
		
		
		
		describe("root-path-relative url", function()
		{
			it.skip("should work", function(){});
		});
		
		
		
		describe("path-relative url", function()
		{
			it.skip("should work", function(){});
		});
		
		
		
		describe("resource-relative url", function()
		{
			it.skip("should work", function(){});
		});
		
		
		
		describe("query-relative url", function()
		{
			it.skip("should work", function(){});
		});
		
		
		
		describe("hash-relative url", function()
		{
			it.skip("should work", function(){});
		});
		
		
		
		describe("empty url", function()
		{
			it.skip("should work", function(){});
		});
		
		
		
		describe("relative url", function()
		{
			describe("with an ABSOLUTE BASE", function()
			{
				it("and ABSOLUTE HTML BASE should work", function(done)
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
				
				
				
				it("and RELATIVE HTML BASE should work", function(done)
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
				
				
				
				it("and EMPTY HTML BASE should work", function(done)
				{
					var base     = "http://fakeurl.com/";
					var htmlBase = "";
					var url      = "/path/resource.html";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.equal("http://fakeurl.com/path/resource.html");
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal(base);
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.true;
					expect(link.samePage).to.be.false;
					
					done();
				});
				
				
				
				it("and NO HTML BASE should work", function(done)
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
			});
			
			
			
			describe("with a RELATIVE BASE", function()
			{
				it("and ABSOLUTE HTML BASE should work", function(done)
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
				
				
				
				it("and RELATIVE HTML BASE should not work", function(done)
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
				
				
				
				it("and EMPTY HTML BASE should not work", function(done)
				{
					var base     = "/path/";
					var htmlBase = "";
					var url      = "resource.html";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.be.null;
					
					expect(link.base.original).to.equal(base);
					expect(link.base.resolved).to.equal(base);
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.null;
					expect(link.samePage).to.be.null;
					
					done();
				});
				
				
				
				it("and NO HTML BASE should not work", function(done)
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
			});
			
			
			
			describe("with NO BASE", function()
			{
				it("and ABSOLUTE HTML BASE should work", function(done)
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
				
				
				
				it("and RELATIVE HTML BASE should not work", function(done)
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
				
				
				
				it("and EMPTY HTML BASE should not work", function(done)
				{
					var base     = null;
					var htmlBase = "";
					var url      = "/path/resource.html";
					
					var link = linkObj(url);
					link.html.base = htmlBase;
					
					linkObj.resolve(link, base, options);
					
					expect(link.url.original).to.equal(url);
					expect(link.url.resolved).to.be.null;
					
					expect(link.base.original).to.be.null;
					expect(link.base.resolved).to.be.null;
					
					expect(link.html.base).to.equal(htmlBase);
					
					expect(link.internal).to.be.null;
					expect(link.samePage).to.be.null;
					
					done();
				});
				
				
				
				it("and NO HTML BASE should not work", function(done)
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
			});
		});
	});
});
