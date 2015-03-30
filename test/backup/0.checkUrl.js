"use strict";
var BrokenLinkChecker = require("../lib");
var utils = require("./utils");

var expect = require("chai").expect;

var conn;



describe("checkUrl", function()
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
		utils.stopConnections(conn.realPorts, function(){ done() });
	});
	
	
	
	describe("should accept only valid input types for", function()
	{
		it("url", function(done)
		{
			var blc = new BrokenLinkChecker();
			var checkUrl_array     = function(){ blc.checkUrl([0],          function(){}) };
			var checkUrl_function  = function(){ blc.checkUrl(function(){}, function(){}) };
			var checkUrl_null      = function(){ blc.checkUrl(null,         function(){}) };
			var checkUrl_number    = function(){ blc.checkUrl(0,            function(){}) };
			var checkUrl_object    = function(){ blc.checkUrl({0:0},        function(){}) };
			var checkUrl_string    = function(){ blc.checkUrl("",           function(){}) };
			var checkUrl_undefined = function(){ blc.checkUrl(undefined,    function(){}) };
			
			expect(checkUrl_array    ).to.throw("url must be a string");
			expect(checkUrl_function ).to.throw("url must be a string");
			expect(checkUrl_null     ).to.throw("url must be a string");
			expect(checkUrl_number   ).to.throw("url must be a string");
			expect(checkUrl_object   ).to.throw("url must be a string");
			expect(checkUrl_string   ).to.not.throw("url must be a string");
			expect(checkUrl_undefined).to.throw("url must be a string");
			done();
		});
		
		
		
		it("callback", function(done)
		{
			var blc = new BrokenLinkChecker();
			var checkUrl_array     = function(){ blc.checkUrl("", [0]         ) };
			var checkUrl_function  = function(){ blc.checkUrl("", function(){}) };
			var checkUrl_null      = function(){ blc.checkUrl("", null        ) };
			var checkUrl_number    = function(){ blc.checkUrl("", 0           ) };
			var checkUrl_object    = function(){ blc.checkUrl("", {0:0}       ) };
			var checkUrl_string    = function(){ blc.checkUrl("", ""          ) };
			var checkUrl_undefined = function(){ blc.checkUrl("", undefined   ) };
			
			expect(checkUrl_array    ).to.throw("callback must be a function");
			expect(checkUrl_function ).to.not.throw("callback must be a function");
			expect(checkUrl_null     ).to.throw("callback must be a function");
			expect(checkUrl_number   ).to.throw("callback must be a function");
			expect(checkUrl_object   ).to.throw("callback must be a function");
			expect(checkUrl_string   ).to.throw("callback must be a function");
			expect(checkUrl_undefined).to.throw("callback must be a function");
			done();
		});
	});
	
	
	
	describe("should not be broken with a REAL HOST and REAL PATH from", function()
	{
		it("an absolute url", function(done)
		{
			new BrokenLinkChecker({base:conn.absoluteUrls[0]}).checkUrl(conn.absoluteUrls[0]+"/fixture/link-real.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: conn.absoluteUrls[0]+"/fixture/link-real.html",
					resolved: conn.absoluteUrls[0]+"/fixture/link-real.html",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.absoluteUrls[0],
					resolved: conn.absoluteUrls[0]+"/"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.false;
				done();
			});
		});
		
		
		
		it("a scheme-relative url", function(done)
		{
			new BrokenLinkChecker({base:conn.absoluteUrls[0]}).checkUrl(conn.relativeUrls[0]+"/fixture/link-real.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: conn.relativeUrls[0]+"/fixture/link-real.html",
					resolved: conn.absoluteUrls[0]+"/fixture/link-real.html",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.absoluteUrls[0],
					resolved: conn.absoluteUrls[0]+"/"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.false;
				done();
			});
		});
		
		
		
		it("a root-path-relative url", function(done)
		{
			new BrokenLinkChecker({base:conn.absoluteUrls[0]}).checkUrl("/fixture/link-real.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "/fixture/link-real.html",
					resolved: conn.absoluteUrls[0]+"/fixture/link-real.html",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.absoluteUrls[0],
					resolved: conn.absoluteUrls[0]+"/"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.false;
				done();
			});
		});
		
		
		
		it("a path-relative url", function(done)
		{
			new BrokenLinkChecker({base:conn.absoluteUrls[0]}).checkUrl("fixture/link-real.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "fixture/link-real.html",
					resolved: conn.absoluteUrls[0]+"/fixture/link-real.html",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.absoluteUrls[0],
					resolved: conn.absoluteUrls[0]+"/"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.false;
				done();
			});
		});
		
		
		
		it("a query-relative url", function(done)
		{
			new BrokenLinkChecker({base:conn.absoluteUrls[0]+"/fixture/link-real.html"}).checkUrl("?query", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "?query",
					resolved: conn.absoluteUrls[0]+"/fixture/link-real.html?query",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.absoluteUrls[0]+"/fixture/link-real.html",
					resolved: conn.absoluteUrls[0]+"/fixture/link-real.html"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.false;
				done();
			});
		});
		
		
		
		it("a hash-relative url", function(done)
		{
			new BrokenLinkChecker({base:conn.absoluteUrls[0]+"/fixture/link-real.html"}).checkUrl("#hash", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "#hash",
					resolved: conn.absoluteUrls[0]+"/fixture/link-real.html#hash",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.absoluteUrls[0]+"/fixture/link-real.html",
					resolved: conn.absoluteUrls[0]+"/fixture/link-real.html"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.true;
				done();
			});
		});
		
		
		
		it("an empty url", function(done)
		{
			new BrokenLinkChecker({base:conn.absoluteUrls[0]+"/fixture/link-real.html"}).checkUrl("", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "",
					resolved: conn.absoluteUrls[0]+"/fixture/link-real.html",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.absoluteUrls[0]+"/fixture/link-real.html",
					resolved: conn.absoluteUrls[0]+"/fixture/link-real.html"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.true;
				done();
			});
		});
	});
	
	
	
	describe("should be broken with a REAL HOST and FAKE PATH from", function()
	{
		it("an absolute url", function(done)
		{
			new BrokenLinkChecker({base:conn.absoluteUrls[0]}).checkUrl(conn.absoluteUrls[0]+"/fixture/link-fake.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: conn.absoluteUrls[0]+"/fixture/link-fake.html",
					resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.absoluteUrls[0],
					resolved: conn.absoluteUrls[0]+"/"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.false;
				done();
			});
		});
		
		
		
		it("a scheme-relative url", function(done)
		{
			new BrokenLinkChecker({base:conn.absoluteUrls[0]}).checkUrl(conn.relativeUrls[0]+"/fixture/link-fake.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: conn.relativeUrls[0]+"/fixture/link-fake.html",
					resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.absoluteUrls[0],
					resolved: conn.absoluteUrls[0]+"/"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.false;
				done();
			});
		});
		
		
		
		it("a root-path-relative url", function(done)
		{
			new BrokenLinkChecker({base:conn.absoluteUrls[0]}).checkUrl("/fixture/link-fake.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "/fixture/link-fake.html",
					resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.absoluteUrls[0],
					resolved: conn.absoluteUrls[0]+"/"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.false;
				done();
			});
		});
		
		
		
		it("a path-relative url", function(done)
		{
			new BrokenLinkChecker({base:conn.absoluteUrls[0]}).checkUrl("fixture/link-fake.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "fixture/link-fake.html",
					resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.absoluteUrls[0],
					resolved: conn.absoluteUrls[0]+"/"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.false;
				done();
			});
		});
		
		
		
		it("a query-relative url", function(done)
		{
			new BrokenLinkChecker({base:conn.absoluteUrls[0]+"/fixture/link-fake.html"}).checkUrl("?query", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "?query",
					resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html?query",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.absoluteUrls[0]+"/fixture/link-fake.html",
					resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.false;
				done();
			});
		});
		
		
		
		it("a hash-relative url", function(done)
		{
			new BrokenLinkChecker({base:conn.absoluteUrls[0]+"/fixture/link-fake.html"}).checkUrl("#hash", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "#hash",
					resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html#hash",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.absoluteUrls[0]+"/fixture/link-fake.html",
					resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.true;
				done();
			});
		});
		
		
		
		it("an empty url", function(done)
		{
			new BrokenLinkChecker({base:conn.absoluteUrls[0]+"/fixture/link-fake.html"}).checkUrl("", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "",
					resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.absoluteUrls[0]+"/fixture/link-fake.html",
					resolved: conn.absoluteUrls[0]+"/fixture/link-fake.html"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.true;
				done();
			});
		});
	});
	
	
	
	// Technically it's a real host with a fake port, but same goal
	// and faster than http://asdf1234.asdf1234
	describe("should be broken and have error with a FAKE HOST from", function()
	{
		it("an absolute url", function(done)
		{
			new BrokenLinkChecker({base:conn.fakeAbsoluteUrl}).checkUrl(conn.fakeAbsoluteUrl+"/path/to/resource.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: conn.fakeAbsoluteUrl+"/path/to/resource.html",
					resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.fakeAbsoluteUrl,
					resolved: conn.fakeAbsoluteUrl+"/"
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.code).to.equal("ECONNREFUSED");
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.false;
				done();
			});
		});
		
		
		
		it("a scheme-relative url", function(done)
		{
			new BrokenLinkChecker({base:conn.fakeAbsoluteUrl}).checkUrl(conn.fakeRelativeUrl+"/path/to/resource.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: conn.fakeRelativeUrl+"/path/to/resource.html",
					resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.fakeAbsoluteUrl,
					resolved: conn.fakeAbsoluteUrl+"/"
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.code).to.equal("ECONNREFUSED");
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.false;
				done();
			});
		});
		
		
		
		it("a root-path-relative url", function(done)
		{
			new BrokenLinkChecker({base:conn.fakeAbsoluteUrl}).checkUrl("/path/to/resource.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "/path/to/resource.html",
					resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.fakeAbsoluteUrl,
					resolved: conn.fakeAbsoluteUrl+"/"
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.code).to.equal("ECONNREFUSED");
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.false;
				done();
			});
		});
		
		
		
		it("a path-relative url", function(done)
		{
			new BrokenLinkChecker({base:conn.fakeAbsoluteUrl}).checkUrl("path/to/resource.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "path/to/resource.html",
					resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.fakeAbsoluteUrl,
					resolved: conn.fakeAbsoluteUrl+"/"
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.code).to.equal("ECONNREFUSED");
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.false;
				done();
			});
		});
		
		
		
		it("a query-relative url", function(done)
		{
			new BrokenLinkChecker({base:conn.fakeAbsoluteUrl+"/path/to/resource.html"}).checkUrl("?query", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "?query",
					resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html?query",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.fakeAbsoluteUrl+"/path/to/resource.html",
					resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html"
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.code).to.equal("ECONNREFUSED");
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.false;
				done();
			});
		});
		
		
		
		it("a hash-relative url", function(done)
		{
			new BrokenLinkChecker({base:conn.fakeAbsoluteUrl+"/path/to/resource.html"}).checkUrl("#hash", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "#hash",
					resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html#hash",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.fakeAbsoluteUrl+"/path/to/resource.html",
					resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html"
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.code).to.equal("ECONNREFUSED");
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.true;
				done();
			});
		});
		
		
		
		it("an empty url", function(done)
		{
			new BrokenLinkChecker({base:conn.fakeAbsoluteUrl+"/path/to/resource.html"}).checkUrl("", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "",
					resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.fakeAbsoluteUrl+"/path/to/resource.html",
					resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html"
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.code).to.equal("ECONNREFUSED");
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.true;
				done();
			});
		});
	});
	
	
	
	describe("should be broken and have error with NO HOST from", function()
	{
		it("an absolute url", function(done)
		{
			new BrokenLinkChecker().checkUrl("http://", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "http://",
					resolved: "http:///",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: null,
					resolved: null
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.null;
				expect(result.samePage).to.be.null;
				done();
			});
		});
		
		
		
		it("a scheme-relative url", function(done)
		{
			new BrokenLinkChecker().checkUrl(conn.relativeUrls[0]+"/fixture/link-real.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: conn.relativeUrls[0]+"/fixture/link-real.html",
					resolved: null,
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: null,
					resolved: null
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.null;
				expect(result.samePage).to.be.null;
				done();
			});
		});
		
		
		
		it("a root-path-relative url", function(done)
		{
			new BrokenLinkChecker().checkUrl("/fixture/link-real.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "/fixture/link-real.html",
					resolved: null,
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: null,
					resolved: null
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.null;
				expect(result.samePage).to.be.null;
				done();
			});
		});
		
		
		
		it("a path-relative url", function(done)
		{
			new BrokenLinkChecker().checkUrl("fixture/link-real.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "fixture/link-real.html",
					resolved: null,
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: null,
					resolved: null
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.null;
				expect(result.samePage).to.be.null;
				done();
			});
		});
		
		
		
		it("a query-relative url", function(done)
		{
			new BrokenLinkChecker().checkUrl("?query", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "?query",
					resolved: null,
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: null,
					resolved: null
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.null;
				expect(result.samePage).to.be.null;
				done();
			});
		});
		
		
		
		it("a hash-relative url", function(done)
		{
			new BrokenLinkChecker().checkUrl("#hash", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "#hash",
					resolved: null,
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: null,
					resolved: null
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.null;
				expect(result.samePage).to.be.null;
				done();
			});
		});
		
		
		
		it("an empty url", function(done)
		{
			new BrokenLinkChecker().checkUrl("", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "",
					resolved: null,
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: null,
					resolved: null
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.null;
				expect(result.samePage).to.be.null;
				done();
			});
		});
	});
	
	
	
	describe("should be broken and have error from", function()
	{
		it("a data uri", function(done)
		{
			new BrokenLinkChecker().checkUrl("data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7",
					resolved: null,
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: null,
					resolved: null
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.null;
				expect(result.samePage).to.be.null;
				done();
			});
		});
		
		
		
		it("a tel uri", function(done)
		{
			new BrokenLinkChecker().checkUrl("tel:+5-555-555-5555", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "tel:+5-555-555-5555",
					resolved: null,
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: null,
					resolved: null
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
				expect(result.broken).to.be.true;
				expect(result.internal).to.be.null;
				expect(result.samePage).to.be.null;
				done();
			});
		});
	});
	
	
	
	describe("should not be broken with a REDIRECTED url", function()
	{
		it("containing no query or hash", function(done)
		{
			new BrokenLinkChecker({base:conn.absoluteUrls[0]}).checkUrl(conn.absoluteUrls[0]+"/fixture/redirect.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: conn.absoluteUrls[0]+"/fixture/redirect.html",
					resolved: conn.absoluteUrls[0]+"/fixture/redirect.html",
					redirected: conn.absoluteUrls[0]+"/fixture/index.html"
				});
				expect(result.base).to.deep.equal({
					original: conn.absoluteUrls[0],
					resolved: conn.absoluteUrls[0]+"/"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.false;
				done();
			});
		});
		
		
		
		it("containing a query", function(done)
		{
			new BrokenLinkChecker({base:conn.absoluteUrls[0]}).checkUrl(conn.absoluteUrls[0]+"/fixture/redirect.html?query", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: conn.absoluteUrls[0]+"/fixture/redirect.html?query",
					resolved: conn.absoluteUrls[0]+"/fixture/redirect.html?query",
					redirected: null
				});
				expect(result.base).to.deep.equal({
					original: conn.absoluteUrls[0],
					resolved: conn.absoluteUrls[0]+"/"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.false;
				done();
			});
		});
		
		
		
		it("containing a hash", function(done)
		{
			new BrokenLinkChecker({base:conn.absoluteUrls[0]}).checkUrl(conn.absoluteUrls[0]+"/fixture/redirect.html#hash", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: conn.absoluteUrls[0]+"/fixture/redirect.html#hash",
					resolved: conn.absoluteUrls[0]+"/fixture/redirect.html#hash",
					redirected: conn.absoluteUrls[0]+"/fixture/index.html"
				});
				expect(result.base).to.deep.equal({
					original: conn.absoluteUrls[0],
					resolved: conn.absoluteUrls[0]+"/"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				expect(result.internal).to.be.true;
				expect(result.samePage).to.be.false;
				done();
			});
		});
	});
	
	
	
	describe("options", function()
	{
		// `base` has already been tested above
		it.skip("acceptedSchemes = []", function(done)
		{
			
		});
	});
});
