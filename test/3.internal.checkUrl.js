"use strict";
var checkUrl = require("../lib/internal/checkUrl");
var linkObj  = require("../lib/internal/linkObj");

var utils = require("./utils");

var expect = require("chai").expect;

var conn;



describe("INTERNAL -- checkUrl", function()
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
		utils.stopConnections(conn.realPorts, done);
	});
	
	
	
	describe("should not be broken with a REAL HOST and REAL PATH from", function()
	{
		it("an absolute url", function(done)
		{
			checkUrl(
				conn.absoluteUrls[0]+"/fixture/link-real.html",
				conn.absoluteUrls[0],
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					});
					expect(result.http.redirects).to.have.length(0);
					expect(result.error).to.be.null;
					expect(result.broken).to.be.false;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.false;
					done();
				}
			);
		});
		
		
		
		it("a scheme-relative url", function(done)
		{
			checkUrl(
				conn.relativeUrls[0]+"/fixture/link-real.html",
				conn.absoluteUrls[0],
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: conn.relativeUrls[0]+"/fixture/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					});
					expect(result.http.redirects).to.have.length(0);
					expect(result.error).to.be.null;
					expect(result.broken).to.be.false;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.false;
					done();
				}
			);
		});
		
		
		
		it("a root-path-relative url", function(done)
		{
			checkUrl(
				"/fixture/link-real.html",
				conn.absoluteUrls[0],
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "/fixture/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					});
					expect(result.http.redirects).to.have.length(0);
					expect(result.error).to.be.null;
					expect(result.broken).to.be.false;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.false;
					done();
				}
			);
		});
		
		
		
		it("a path-relative url", function(done)
		{
			checkUrl(
				"fixture/link-real.html",
				conn.absoluteUrls[0],
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "fixture/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					});
					expect(result.http.redirects).to.have.length(0);
					expect(result.error).to.be.null;
					expect(result.broken).to.be.false;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.false;
					done();
				}
			);
		});
		
		
		
		it("a query-relative url", function(done)
		{
			checkUrl(
				"?query",
				conn.absoluteUrls[0]+"/fixture/link-real.html",
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "?query",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html?query",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html"
					});
					expect(result.http.redirects).to.have.length(0);
					expect(result.error).to.be.null;
					expect(result.broken).to.be.false;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.false;
					done();
				}
			);
		});
		
		
		
		it("a hash-relative url", function(done)
		{
			checkUrl(
				"#hash",
				conn.absoluteUrls[0]+"/fixture/link-real.html",
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "#hash",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html#hash",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html"
					});
					expect(result.http.redirects).to.have.length(0);
					expect(result.error).to.be.null;
					expect(result.broken).to.be.false;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.true;
					done();
				}
			);
		});
		
		
		
		it("an empty url", function(done)
		{
			checkUrl(
				"",
				conn.absoluteUrls[0]+"/fixture/link-real.html",
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/link-real.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-real.html"
					});
					expect(result.http.redirects).to.have.length(0);
					expect(result.error).to.be.null;
					expect(result.broken).to.be.false;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.true;
					done();
				}
			);
		});
	});
	
	
	
	describe("should be broken with a REAL HOST and FAKE PATH from", function()
	{
		it("an absolute url", function(done)
		{
			checkUrl(
				conn.absoluteUrls[0]+"/fixture/link-fake.html",
				conn.absoluteUrls[0],
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/link-fake.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					});
					expect(result.http.redirects).to.have.length(0);
					expect(result.error).to.be.null;
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.false;
					done();
				}
			);
		});
		
		
		
		it("a scheme-relative url", function(done)
		{
			checkUrl(
				conn.relativeUrls[0]+"/fixture/link-fake.html",
				conn.absoluteUrls[0],
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: conn.relativeUrls[0]+"/fixture/link-fake.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					});
					expect(result.http.redirects).to.have.length(0);
					expect(result.error).to.be.null;
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.false;
					done();
				}
			);
		});
		
		
		
		it("a root-path-relative url", function(done)
		{
			checkUrl(
				"/fixture/link-fake.html",
				conn.absoluteUrls[0],
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "/fixture/link-fake.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					});
					expect(result.http.redirects).to.have.length(0);
					expect(result.error).to.be.null;
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.false;
					done();
				}
			);
		});
		
		
		
		it("a path-relative url", function(done)
		{
			checkUrl(
				"fixture/link-fake.html",
				conn.absoluteUrls[0],
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "fixture/link-fake.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					});
					expect(result.http.redirects).to.have.length(0);
					expect(result.error).to.be.null;
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.false;
					done();
				}
			);
		});
		
		
		
		it("a query-relative url", function(done)
		{
			checkUrl(
				"?query",
				conn.absoluteUrls[0]+"/fixture/link-fake.html",
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "?query",
						resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html?query",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/link-fake.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html"
					});
					expect(result.http.redirects).to.have.length(0);
					expect(result.error).to.be.null;
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.false;
					done();
				}
			);
		});
		
		
		
		it("a hash-relative url", function(done)
		{
			checkUrl(
				"#hash",
				conn.absoluteUrls[0]+"/fixture/link-fake.html",
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "#hash",
						resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html#hash",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/link-fake.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html"
					});
					expect(result.http.redirects).to.have.length(0);
					expect(result.error).to.be.null;
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.true;
					done();
				}
			);
		});
		
		
		
		it("an empty url", function(done)
		{
			checkUrl(
				"",
				conn.absoluteUrls[0]+"/fixture/link-fake.html",
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "",
						resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/link-fake.html",
						resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html"
					});
					expect(result.http.redirects).to.have.length(0);
					expect(result.error).to.be.null;
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.true;
					done();
				}
			);
		});
	});
	
	
	
	// Technically it's a real host with a fake port, but same goal
	// and faster than testing a remote http://asdf1234.asdf1234
	describe("should be broken and have error with a FAKE HOST from", function()
	{
		it("an absolute url", function(done)
		{
			checkUrl(
				conn.fakeAbsoluteUrl+"/path/to/resource.html",
				conn.fakeAbsoluteUrl,
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: conn.fakeAbsoluteUrl+"/path/to/resource.html",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.fakeAbsoluteUrl,
						resolved: conn.fakeAbsoluteUrl+"/"
					});
					expect(result.http.redirects).to.be.null;
					expect(result.error).to.be.instanceOf(Error);
					expect(result.error.code).to.equal("ECONNREFUSED");
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.false;
					done();
				}
			);
		});
		
		
		
		it("a scheme-relative url", function(done)
		{
			checkUrl(
				conn.fakeRelativeUrl+"/path/to/resource.html",
				conn.fakeAbsoluteUrl,
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: conn.fakeRelativeUrl+"/path/to/resource.html",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.fakeAbsoluteUrl,
						resolved: conn.fakeAbsoluteUrl+"/"
					});
					expect(result.http.redirects).to.be.null;
					expect(result.error).to.be.instanceOf(Error);
					expect(result.error.code).to.equal("ECONNREFUSED");
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.false;
					done();
				}
			);
		});
		
		
		
		it("a root-path-relative url", function(done)
		{
			checkUrl(
				"/path/to/resource.html",
				conn.fakeAbsoluteUrl,
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "/path/to/resource.html",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.fakeAbsoluteUrl,
						resolved: conn.fakeAbsoluteUrl+"/"
					});
					expect(result.http.redirects).to.be.null;
					expect(result.error).to.be.instanceOf(Error);
					expect(result.error.code).to.equal("ECONNREFUSED");
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.false;
					done();
				}
			);
		});
		
		
		
		it("a path-relative url", function(done)
		{
			checkUrl(
				"path/to/resource.html",
				conn.fakeAbsoluteUrl,
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "path/to/resource.html",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.fakeAbsoluteUrl,
						resolved: conn.fakeAbsoluteUrl+"/"
					});
					expect(result.http.redirects).to.be.null;
					expect(result.error).to.be.instanceOf(Error);
					expect(result.error.code).to.equal("ECONNREFUSED");
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.false;
					done();
				}
			);
		});
		
		
		
		it("a query-relative url", function(done)
		{
			checkUrl(
				"?query",
				conn.fakeAbsoluteUrl+"/path/to/resource.html",
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "?query",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html?query",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.fakeAbsoluteUrl+"/path/to/resource.html",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html"
					});
					expect(result.http.redirects).to.be.null;
					expect(result.error).to.be.instanceOf(Error);
					expect(result.error.code).to.equal("ECONNREFUSED");
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.false;
					done();
				}
			);
		});
		
		
		
		it("a hash-relative url", function(done)
		{
			checkUrl(
				"#hash",
				conn.fakeAbsoluteUrl+"/path/to/resource.html",
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "#hash",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html#hash",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.fakeAbsoluteUrl+"/path/to/resource.html",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html"
					});
					expect(result.http.redirects).to.be.null;
					expect(result.error).to.be.instanceOf(Error);
					expect(result.error.code).to.equal("ECONNREFUSED");
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.true;
					done();
				}
			);
		});
		
		
		
		it("an empty url", function(done)
		{
			checkUrl(
				"",
				conn.fakeAbsoluteUrl+"/path/to/resource.html",
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.fakeAbsoluteUrl+"/path/to/resource.html",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html"
					});
					expect(result.http.redirects).to.be.null;
					expect(result.error).to.be.instanceOf(Error);
					expect(result.error.code).to.equal("ECONNREFUSED");
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.true;
					done();
				}
			);
		});
	});
	
	
	
	describe("should be broken and have error with NO HOST from", function()
	{
		it("an absolute url", function(done)
		{
			checkUrl(
				"http://",
				null,
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "http://",
						resolved: "http:///",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: null,
						resolved: null
					});
					expect(result.http.redirects).to.be.null;
					expect(result.error).to.be.instanceOf(Error);
					expect(result.error.message).to.equal("Invalid URL");
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.null;
					expect(result.samePage).to.be.null;
					done();
				}
			);
		});
		
		
		
		it("a scheme-relative url", function(done)
		{
			checkUrl(
				conn.relativeUrls[0]+"/fixture/link-real.html",
				null,
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: conn.relativeUrls[0]+"/fixture/link-real.html",
						resolved: null,
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: null,
						resolved: null
					});
					expect(result.http.redirects).to.be.null;
					expect(result.error).to.be.instanceOf(Error);
					expect(result.error.message).to.equal("Invalid URL");
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.null;
					expect(result.samePage).to.be.null;
					done();
				}
			);
		});
		
		
		
		it("a root-path-relative url", function(done)
		{
			checkUrl(
				"/fixture/link-real.html",
				null,
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "/fixture/link-real.html",
						resolved: null,
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: null,
						resolved: null
					});
					expect(result.http.redirects).to.be.null;
					expect(result.error).to.be.instanceOf(Error);
					expect(result.error.message).to.equal("Invalid URL");
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.null;
					expect(result.samePage).to.be.null;
					done();
				}
			);
		});
		
		
		
		it("a path-relative url", function(done)
		{
			checkUrl(
				"fixture/link-real.html",
				null,
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "fixture/link-real.html",
						resolved: null,
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: null,
						resolved: null
					});
					expect(result.http.redirects).to.be.null;
					expect(result.error).to.be.instanceOf(Error);
					expect(result.error.message).to.equal("Invalid URL");
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.null;
					expect(result.samePage).to.be.null;
					done();
				}
			);
		});
		
		
		
		it("a query-relative url", function(done)
		{
			checkUrl(
				"?query",
				null,
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "?query",
						resolved: null,
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: null,
						resolved: null
					});
					expect(result.http.redirects).to.be.null;
					expect(result.error).to.be.instanceOf(Error);
					expect(result.error.message).to.equal("Invalid URL");
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.null;
					expect(result.samePage).to.be.null;
					done();
				}
			);
		});
		
		
		
		it("a hash-relative url", function(done)
		{
			checkUrl(
				"#hash",
				null,
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "#hash",
						resolved: null,
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: null,
						resolved: null
					});
					expect(result.http.redirects).to.be.null;
					expect(result.error).to.be.instanceOf(Error);
					expect(result.error.message).to.equal("Invalid URL");
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.null;
					expect(result.samePage).to.be.null;
					done();
				}
			);
		});
		
		
		
		it("an empty url", function(done)
		{
			checkUrl(
				"",
				null,
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "",
						resolved: null,
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: null,
						resolved: null
					});
					expect(result.http.redirects).to.be.null;
					expect(result.error).to.be.instanceOf(Error);
					expect(result.error.message).to.equal("Invalid URL");
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.null;
					expect(result.samePage).to.be.null;
					done();
				}
			);
		});
	});
	
	
	
	describe("should be broken and have error from", function()
	{
		it("a data uri", function(done)
		{
			checkUrl(
				"data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7",
				null,
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7",
						resolved: null,
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: null,
						resolved: null
					});
					expect(result.http.redirects).to.be.null;
					expect(result.error).to.be.instanceOf(Error);
					expect(result.error.message).to.equal("Invalid URL");
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.null;
					expect(result.samePage).to.be.null;
					done();
				}
			);
		});
		
		
		
		it("a tel uri", function(done)
		{
			checkUrl(
				"tel:+5-555-555-5555",
				null,
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: "tel:+5-555-555-5555",
						resolved: null,
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: null,
						resolved: null
					});
					expect(result.http.redirects).to.be.null;
					expect(result.error).to.be.instanceOf(Error);
					expect(result.error.message).to.equal("Invalid URL");
					expect(result.broken).to.be.true;
					expect(result.internal).to.be.null;
					expect(result.samePage).to.be.null;
					done();
				}
			);
		});
	8});
	
	
	
	describe("should not be broken with a REDIRECTED url", function()
	{
		it("containing no query or hash", function(done)
		{
			checkUrl(
				conn.absoluteUrls[0]+"/fixture/redirect.html",
				conn.absoluteUrls[0],
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/redirect.html",
						resolved: conn.absoluteUrls[0]+"/fixture/redirect.html",
						redirected: conn.absoluteUrls[0]+"/fixture/index.html"
					});
					expect(result.base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					});
					expect(result.http.redirects).to.have.length(2);
					expect(result.error).to.be.null;
					expect(result.broken).to.be.false;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.false;
					done();
				}
			);
		});
		
		
		
		it("containing a query", function(done)
		{
			checkUrl(
				conn.absoluteUrls[0]+"/fixture/redirect.html?query",
				conn.absoluteUrls[0],
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/redirect.html?query",
						resolved: conn.absoluteUrls[0]+"/fixture/redirect.html?query",
						redirected: null
					});
					expect(result.base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					});
					expect(result.http.redirects).to.have.length(0);
					expect(result.error).to.be.null;
					expect(result.broken).to.be.false;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.false;
					done();
				}
			);
		});
		
		
		
		it("containing a hash", function(done)
		{
			checkUrl(
				conn.absoluteUrls[0]+"/fixture/redirect.html#hash",
				conn.absoluteUrls[0],
				utils.options(),
				function(result)
				{
					expect(result.url).to.deep.equal({
						original: conn.absoluteUrls[0]+"/fixture/redirect.html#hash",
						resolved: conn.absoluteUrls[0]+"/fixture/redirect.html#hash",
						redirected: conn.absoluteUrls[0]+"/fixture/index.html"
					});
					expect(result.base).to.deep.equal({
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					});
					expect(result.http.redirects).to.have.length(2);
					expect(result.error).to.be.null;
					expect(result.broken).to.be.false;
					expect(result.internal).to.be.true;
					expect(result.samePage).to.be.false;
					done();
				}
			);
		});
	});
	
	
	
	describe("options", function()
	{
		it.skip("acceptedSchemes = []", function(done)
		{
			
		});
		
		
		
		it.skip("excludeResponseData = true", function(done)
		{
			
		});
	});
});
