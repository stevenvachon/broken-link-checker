"use strict";
var BrokenLinkChecker = require("../lib");
var utils = require("./utils");

var expect = require("chai").expect;



describe("checkUrl", function()
{
	// Let internal http lib decide when to give up
	this.timeout(0);
	
	
	
	describe("should accept only valid input types for", function()
	{
		// Reset to defeault timeout since no request should be made in this test
		this.timeout(2000);
		
		
		
		it("url", function(done)
		{
			var blc = new BrokenLinkChecker();
			var checkUrl_array    = function(){ blc.checkUrl([0],          function(){}) };
			var checkUrl_function = function(){ blc.checkUrl(function(){}, function(){}) };
			var checkUrl_number   = function(){ blc.checkUrl(0,            function(){}) };
			var checkUrl_object   = function(){ blc.checkUrl({0:0},        function(){}) };
			var checkUrl_string   = function(){ blc.checkUrl("",           function(){}) };
			
			expect(checkUrl_array   ).to.throw("url must be a string");
			expect(checkUrl_function).to.throw("url must be a string");
			expect(checkUrl_number  ).to.throw("url must be a string");
			expect(checkUrl_object  ).to.throw("url must be a string");
			expect(checkUrl_string  ).to.not.throw("url must be a string");
			done();
		});
		
		
		
		it("callback", function(done)
		{
			var blc = new BrokenLinkChecker();
			var checkUrl_array    = function(){ blc.checkUrl("", [0]         ) };
			var checkUrl_function = function(){ blc.checkUrl("", function(){}) };
			var checkUrl_number   = function(){ blc.checkUrl("", 0           ) };
			var checkUrl_object   = function(){ blc.checkUrl("", {0:0}       ) };
			var checkUrl_string   = function(){ blc.checkUrl("", ""          ) };
			
			expect(checkUrl_array   ).to.throw("callback must be a function");
			expect(checkUrl_function).to.not.throw("callback must be a function");
			expect(checkUrl_number  ).to.throw("callback must be a function");
			expect(checkUrl_object  ).to.throw("callback must be a function");
			expect(checkUrl_string  ).to.throw("callback must be a function");
			done();
		});
	});
	
	
	
	// TODO :: start a simple webserver on localhost and make requests to that (works without internet connection)
	// TODO :: for urls that must fail, point to the next available port on localhost since it has no server running
	describe("should not be broken with a REAL HOST and REAL PATH from", function()
	{
		it("an absolute url", function(done)
		{
			new BrokenLinkChecker().checkUrl("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html",
					resolved: "https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				done();
			});
		});
		
		
		
		it("a scheme-relative url", function(done)
		{
			new BrokenLinkChecker({site:"https://rawgit.com/stevenvachon/broken-link-checker/master/"}).checkUrl("//rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "//rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html",
					resolved: "https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				done();
			});
		});
		
		
		
		it("a root-path-relative url", function(done)
		{
			new BrokenLinkChecker({site:"https://rawgit.com/stevenvachon/broken-link-checker/master/"}).checkUrl("/stevenvachon/broken-link-checker/master/test/fixture/link-real.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "/stevenvachon/broken-link-checker/master/test/fixture/link-real.html",
					resolved: "https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				done();
			});
		});
		
		
		
		it("a path-relative url", function(done)
		{
			new BrokenLinkChecker({site:"https://rawgit.com/stevenvachon/broken-link-checker/master/"}).checkUrl("test/fixture/link-real.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "test/fixture/link-real.html",
					resolved: "https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				done();
			});
		});
		
		
		
		it("a query-relative url", function(done)
		{
			new BrokenLinkChecker({site:"https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html"}).checkUrl("?query", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "?query",
					resolved: "https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html?query"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				done();
			});
		});
		
		
		
		it("a hash-relative url", function(done)
		{
			new BrokenLinkChecker({site:"https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html"}).checkUrl("#hash", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "#hash",
					resolved: "https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html#hash"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				done();
			});
		});
		
		
		
		it("an empty url", function(done)
		{
			new BrokenLinkChecker({site:"https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html"}).checkUrl("", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "",
					resolved: "https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.false;
				done();
			});
		});
	});
	
	
	
	describe("should be broken with a REAL HOST and FAKE PATH from", function()
	{
		it("an absolute url", function(done)
		{
			new BrokenLinkChecker().checkUrl("https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html",
					resolved: "https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.true;
				done();
			});
		});
		
		
		
		it("a scheme-relative url", function(done)
		{
			new BrokenLinkChecker({site:"https://rawgit.com/stevenvachon/broken-link-checker/master/"}).checkUrl("//rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "//rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html",
					resolved: "https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.true;
				done();
			});
		});
		
		
		
		it("a root-path-relative url", function(done)
		{
			new BrokenLinkChecker({site:"https://rawgit.com/stevenvachon/broken-link-checker/master/"}).checkUrl("/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html",
					resolved: "https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.true;
				done();
			});
		});
		
		
		
		it("a path-relative url", function(done)
		{
			new BrokenLinkChecker({site:"https://rawgit.com/stevenvachon/broken-link-checker/master/"}).checkUrl("test/fixture/link-fake.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "test/fixture/link-fake.html",
					resolved: "https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.true;
				done();
			});
		});
		
		
		
		it("a query-relative url", function(done)
		{
			new BrokenLinkChecker({site:"https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html"}).checkUrl("?query", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "?query",
					resolved: "https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html?query"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.true;
				done();
			});
		});
		
		
		
		it("a hash-relative url", function(done)
		{
			new BrokenLinkChecker({site:"https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html"}).checkUrl("#hash", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "#hash",
					resolved: "https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html#hash"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.true;
				done();
			});
		});
		
		
		
		it("an empty url", function(done)
		{
			new BrokenLinkChecker({site:"https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html"}).checkUrl("", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "",
					resolved: "https://rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-fake.html"
				});
				expect(result.error).to.be.null;
				expect(result.broken).to.be.true;
				done();
			});
		});
	});
	
	
	
	describe("should be broken and have error with a FAKE HOST from", function()
	{
		it("an absolute url", function(done)
		{
			new BrokenLinkChecker().checkUrl("http://asdf1234.asdf1234", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "http://asdf1234.asdf1234",
					resolved: "http://asdf1234.asdf1234/"
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.code).to.equal("ENOTFOUND");
				expect(result.broken).to.be.true;
				done();
			});
		});
		
		
		
		it("a scheme-relative url", function(done)
		{
			new BrokenLinkChecker({site:"http://asdf1234.asdf1234"}).checkUrl("//asdf1234.asdf1234/path/to/resource.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "//asdf1234.asdf1234/path/to/resource.html",
					resolved: "http://asdf1234.asdf1234/path/to/resource.html"
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.code).to.equal("ENOTFOUND");
				expect(result.broken).to.be.true;
				done();
			});
		});
		
		
		
		it("a root-path-relative url", function(done)
		{
			new BrokenLinkChecker({site:"http://asdf1234.asdf1234"}).checkUrl("/path/to/resource.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "/path/to/resource.html",
					resolved: "http://asdf1234.asdf1234/path/to/resource.html"
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.code).to.equal("ENOTFOUND");
				expect(result.broken).to.be.true;
				done();
			});
		});
		
		
		
		it("a path-relative url", function(done)
		{
			new BrokenLinkChecker({site:"http://asdf1234.asdf1234"}).checkUrl("path/to/resource.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "path/to/resource.html",
					resolved: "http://asdf1234.asdf1234/path/to/resource.html"
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.code).to.equal("ENOTFOUND");
				expect(result.broken).to.be.true;
				done();
			});
		});
		
		
		
		it("a query-relative url", function(done)
		{
			new BrokenLinkChecker({site:"http://asdf1234.asdf1234"}).checkUrl("?query", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "?query",
					resolved: "http://asdf1234.asdf1234/?query"
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.code).to.equal("ENOTFOUND");
				expect(result.broken).to.be.true;
				done();
			});
		});
		
		
		
		it("a hash-relative url", function(done)
		{
			new BrokenLinkChecker({site:"http://asdf1234.asdf1234"}).checkUrl("#hash", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "#hash",
					resolved: "http://asdf1234.asdf1234/#hash"
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.code).to.equal("ENOTFOUND");
				expect(result.broken).to.be.true;
				done();
			});
		});
		
		
		
		it("an empty url", function(done)
		{
			new BrokenLinkChecker({site:"http://asdf1234.asdf1234"}).checkUrl("", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "",
					resolved: "http://asdf1234.asdf1234/"
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.code).to.equal("ENOTFOUND");
				expect(result.broken).to.be.true;
				done();
			});
		});
	});
	
	
	
	describe("should be broken and have error with NO HOST from", function()
	{
		// Reset to defeault timeout since no request should be made in this test
		this.timeout(2000);
		
		
		
		it("an absolute url", function(done)
		{
			new BrokenLinkChecker().checkUrl("http://", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "http://",
					resolved: "http:///"
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
				expect(result.broken).to.be.true;
				done();
			});
		});
		
		
		
		it("a scheme-relative url", function(done)
		{
			new BrokenLinkChecker().checkUrl("//rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "//rawgit.com/stevenvachon/broken-link-checker/master/test/fixture/link-real.html",
					resolved: null
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
				expect(result.broken).to.be.true;
				done();
			});
		});
		
		
		
		it("a root-path-relative url", function(done)
		{
			new BrokenLinkChecker().checkUrl("/stevenvachon/broken-link-checker/master/test/fixture/link-real.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "/stevenvachon/broken-link-checker/master/test/fixture/link-real.html",
					resolved: null
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
				expect(result.broken).to.be.true;
				done();
			});
		});
		
		
		
		it("a path-relative url", function(done)
		{
			new BrokenLinkChecker().checkUrl("test/fixture/link-real.html", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "test/fixture/link-real.html",
					resolved: null
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
				expect(result.broken).to.be.true;
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
					resolved: null
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
				expect(result.broken).to.be.true;
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
					resolved: null
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
				expect(result.broken).to.be.true;
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
					resolved: null
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
				expect(result.broken).to.be.true;
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
					resolved: null
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
				expect(result.broken).to.be.true;
				done();
			});
		});
		
		
		
		it("a tel uri", function(done)
		{
			new BrokenLinkChecker().checkUrl("tel:5-555-555-5555", function(result)
			{
				//utils.logLinkObj(result);
				expect(result.url).to.deep.equal({
					original: "tel:5-555-555-5555",
					resolved: null
				});
				expect(result.error).to.be.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
				expect(result.broken).to.be.true;
				done();
			});
		});
	});
	
	
	
	describe("options", function()
	{
		// `site` has already been tested above
	});
});
