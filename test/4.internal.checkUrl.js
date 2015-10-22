"use strict";
var checkUrl = require("../lib/internal/checkUrl");

var utils = require("./utils");

var expect = require("chai").expect;
var UrlCache = require("urlcache");
//var urlobj = require("urlobj");

var conn;



describe("INTERNAL -- checkUrl", function()
{
	before( function()
	{
		return utils.startConnections().then( function(connections)
		{
			conn = connections;
		});
	});
	
	
	
	after( function()
	{
		return utils.stopConnections(conn.realPorts);
	});
	
	
	
	it("should resolve the promise", function()
	{
		return checkUrl(
			conn.absoluteUrls[0]+"/fixtures/page-no-links.html",
			conn.absoluteUrls[0],
			new UrlCache(),
			utils.options()
		)
		.then( function(result)
		{
			expect(result).to.be.like(
			{
				url: {},
				base: {},
				http: { response:{} },
				html: {}
			});
		});
	});
	
	
	
	describe("should not be broken with a REAL HOST and REAL PATH from", function()
	{
		it("an absolute url", function()
		{
			return checkUrl(
				conn.absoluteUrls[0]+"/fixtures/page-no-links.html",
				conn.absoluteUrls[0],
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: conn.absoluteUrls[0]+"/fixtures/page-no-links.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-no-links.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { redirects:[] },
					error: null,
					broken: false,
					internal: true,
					samePage: false
				});
				expect(result.http.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a scheme-relative url", function()
		{
			return checkUrl(
				conn.relativeUrls[0]+"/fixtures/page-no-links.html",
				conn.absoluteUrls[0],
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: conn.relativeUrls[0]+"/fixtures/page-no-links.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-no-links.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { redirects:[] },
					error: null,
					broken: false,
					internal: true,
					samePage: false
				});
				expect(result.http.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a root-path-relative url", function()
		{
			return checkUrl(
				"/fixtures/page-no-links.html",
				conn.absoluteUrls[0],
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "/fixtures/page-no-links.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-no-links.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { redirects:[] },
					error: null,
					broken: false,
					internal: true,
					samePage: false
				});
				expect(result.http.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a path-relative url", function()
		{
			return checkUrl(
				"fixtures/page-no-links.html",
				conn.absoluteUrls[0],
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "fixtures/page-no-links.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-no-links.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { redirects:[] },
					error: null,
					broken: false,
					internal: true,
					samePage: false
				});
				expect(result.http.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a query-relative url", function()
		{
			return checkUrl(
				"?query",
				conn.absoluteUrls[0]+"/fixtures/page-no-links.html",
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "?query",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-no-links.html?query",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0]+"/fixtures/page-no-links.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-no-links.html"
					},
					http: { redirects:[] },
					error: null,
					broken: false,
					internal: true,
					samePage: false
				});
				expect(result.http.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a hash-relative url", function()
		{
			return checkUrl(
				"#hash",
				conn.absoluteUrls[0]+"/fixtures/page-no-links.html",
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "#hash",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-no-links.html#hash",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0]+"/fixtures/page-no-links.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-no-links.html"
					},
					http: { redirects:[] },
					error: null,
					broken: false,
					internal: true,
					samePage: true
				});
				expect(result.http.redirects).to.have.length(0);
			});
		});
		
		
		
		it("an empty url", function()
		{
			return checkUrl(
				"",
				conn.absoluteUrls[0]+"/fixtures/page-no-links.html",
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-no-links.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0]+"/fixtures/page-no-links.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-no-links.html"
					},
					http: { redirects:[] },
					error: null,
					broken: false,
					internal: true,
					samePage: true
				});
				expect(result.http.redirects).to.have.length(0);
			});
		});
	});
	
	
	
	describe("should be broken with a REAL HOST and FAKE PATH from", function()
	{
		it("an absolute url", function()
		{
			return checkUrl(
				conn.absoluteUrls[0]+"/fixtures/page-fake.html",
				conn.absoluteUrls[0],
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: conn.absoluteUrls[0]+"/fixtures/page-fake.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-fake.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { redirects:[] },
					error: null,
					broken: true,
					internal: true,
					samePage: false
				});
				expect(result.http.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a scheme-relative url", function()
		{
			return checkUrl(
				conn.relativeUrls[0]+"/fixtures/page-fake.html",
				conn.absoluteUrls[0],
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: conn.relativeUrls[0]+"/fixtures/page-fake.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-fake.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { redirects:[] },
					error: null,
					broken: true,
					internal: true,
					samePage: false
				});
				expect(result.http.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a root-path-relative url", function()
		{
			return checkUrl(
				"/fixtures/page-fake.html",
				conn.absoluteUrls[0],
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "/fixtures/page-fake.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-fake.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { redirects:[] },
					error: null,
					broken: true,
					internal: true,
					samePage: false
				});
				expect(result.http.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a path-relative url", function()
		{
			return checkUrl(
				"fixtures/page-fake.html",
				conn.absoluteUrls[0],
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "fixtures/page-fake.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-fake.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { redirects:[] },
					error: null,
					broken: true,
					internal: true,
					samePage: false
				});
				expect(result.http.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a query-relative url", function()
		{
			return checkUrl(
				"?query",
				conn.absoluteUrls[0]+"/fixtures/page-fake.html",
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "?query",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-fake.html?query",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0]+"/fixtures/page-fake.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-fake.html"
					},
					http: { redirects:[] },
					error: null,
					broken: true,
					internal: true,
					samePage: false
				});
				expect(result.http.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a hash-relative url", function()
		{
			return checkUrl(
				"#hash",
				conn.absoluteUrls[0]+"/fixtures/page-fake.html",
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "#hash",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-fake.html#hash",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0]+"/fixtures/page-fake.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-fake.html"
					},
					http: { redirects:[] },
					error: null,
					broken: true,
					internal: true,
					samePage: true
				});
				expect(result.http.redirects).to.have.length(0);
			});
		});
		
		
		
		it("an empty url", function()
		{
			return checkUrl(
				"",
				conn.absoluteUrls[0]+"/fixtures/page-fake.html",
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-fake.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0]+"/fixtures/page-fake.html",
						resolved: conn.absoluteUrls[0]+"/fixtures/page-fake.html"
					},
					http: { redirects:[] },
					error: null,
					broken: true,
					internal: true,
					samePage: true
				});
				expect(result.http.redirects).to.have.length(0);
			});
		});
	});
	
	
	
	// Technically it's a real host with a fake port, but same goal
	// and faster than testing a remote http://asdf1234.asdf1234
	describe("should be broken and have error with a FAKE HOST from", function()
	{
		it("an absolute url", function()
		{
			return checkUrl(
				conn.fakeAbsoluteUrl+"/path/to/resource.html",
				conn.fakeAbsoluteUrl,
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: conn.fakeAbsoluteUrl+"/path/to/resource.html",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html",
						redirected: null
					},
					base:
					{
						original: conn.fakeAbsoluteUrl,
						resolved: conn.fakeAbsoluteUrl+"/"
					},
					http: { redirects:null },
					//error: { code:"ECONNREFUSED" },
					broken: true,
					internal: true,
					samePage: false
				});
				expect(result.error).to.be.an.instanceOf(Error);
				expect(result.error.code).to.equal("ECONNREFUSED");
			});
		});
		
		
		
		it("a scheme-relative url", function()
		{
			return checkUrl(
				conn.fakeRelativeUrl+"/path/to/resource.html",
				conn.fakeAbsoluteUrl,
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: conn.fakeRelativeUrl+"/path/to/resource.html",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html",
						redirected: null
					},
					base:
					{
						original: conn.fakeAbsoluteUrl,
						resolved: conn.fakeAbsoluteUrl+"/"
					},
					http: { redirects:null },
					//error: { code:"ECONNREFUSED" },
					broken: true,
					internal: true,
					samePage: false
				});
				expect(result.error).to.be.an.instanceOf(Error);
				expect(result.error.code).to.equal("ECONNREFUSED");
			});
		});
		
		
		
		it("a root-path-relative url", function()
		{
			return checkUrl(
				"/path/to/resource.html",
				conn.fakeAbsoluteUrl,
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "/path/to/resource.html",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html",
						redirected: null
					},
					base:
					{
						original: conn.fakeAbsoluteUrl,
						resolved: conn.fakeAbsoluteUrl+"/"
					},
					http: { redirects:null },
					//error: { code:"ECONNREFUSED" },
					broken: true,
					internal: true,
					samePage: false
				});
				expect(result.error).to.be.an.instanceOf(Error);
				expect(result.error.code).to.equal("ECONNREFUSED");
			});
		});
		
		
		
		it("a path-relative url", function()
		{
			return checkUrl(
				"path/to/resource.html",
				conn.fakeAbsoluteUrl,
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "path/to/resource.html",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html",
						redirected: null
					},
					base:
					{
						original: conn.fakeAbsoluteUrl,
						resolved: conn.fakeAbsoluteUrl+"/"
					},
					http: { redirects:null },
					//error: { code:"ECONNREFUSED" },
					broken: true,
					internal: true,
					samePage: false
				});
				expect(result.error).to.be.an.instanceOf(Error);
				expect(result.error.code).to.equal("ECONNREFUSED");
			});
		});
		
		
		
		it("a query-relative url", function()
		{
			return checkUrl(
				"?query",
				conn.fakeAbsoluteUrl+"/path/to/resource.html",
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "?query",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html?query",
						redirected: null
					},
					base:
					{
						original: conn.fakeAbsoluteUrl+"/path/to/resource.html",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html"
					},
					http: { redirects:null },
					//error: { code:"ECONNREFUSED" },
					broken: true,
					internal: true,
					samePage: false
				});
				expect(result.error).to.be.an.instanceOf(Error);
				expect(result.error.code).to.equal("ECONNREFUSED");
			});
		});
		
		
		
		it("a hash-relative url", function()
		{
			return checkUrl(
				"#hash",
				conn.fakeAbsoluteUrl+"/path/to/resource.html",
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "#hash",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html#hash",
						redirected: null
					},
					base:
					{
						original: conn.fakeAbsoluteUrl+"/path/to/resource.html",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html"
					},
					http: { redirects:null },
					//error: { code:"ECONNREFUSED" },
					broken: true,
					internal: true,
					samePage: true
				});
				expect(result.error).to.be.an.instanceOf(Error);
				expect(result.error.code).to.equal("ECONNREFUSED");
			});
		});
		
		
		
		it("an empty url", function()
		{
			return checkUrl(
				"",
				conn.fakeAbsoluteUrl+"/path/to/resource.html",
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html",
						redirected: null
					},
					base:
					{
						original: conn.fakeAbsoluteUrl+"/path/to/resource.html",
						resolved: conn.fakeAbsoluteUrl+"/path/to/resource.html"
					},
					http: { redirects:null },
					//error: { code:"ECONNREFUSED" },
					broken: true,
					internal: true,
					samePage: true
				});
				expect(result.error).to.be.an.instanceOf(Error);
				expect(result.error.code).to.equal("ECONNREFUSED");
			});
		});
	});
	
	
	
	describe("should be broken and have error with NO HOST from", function()
	{
		it("an absolute url", function()
		{
			return checkUrl(
				"http://",
				null,
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "http://",
						resolved: "http:///",
						redirected: null
					},
					base:
					{
						original: null,
						resolved: null
					},
					http: { redirects:null },
					//error: { message:"Invalid URL" },  // TODO :: https://github.com/joepie91/node-bhttp/issues/4
					broken: true,
					internal: null,
					samePage: null
				});
				expect(result.error).to.be.an.instanceOf(Error);
				//expect(result.error.message).to.equal("Invalid URL");  // TODO :: https://github.com/joepie91/node-bhttp/issues/4
			});
		});
		
		
		
		it("a scheme-relative url", function()
		{
			return checkUrl(
				conn.relativeUrls[0]+"/fixtures/page-no-links.html",
				null,
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: conn.relativeUrls[0]+"/fixtures/page-no-links.html",
						resolved: null,
						redirected: null
					},
					base:
					{
						original: null,
						resolved: null
					},
					http: { redirects:null },
					//error: { message:"Invalid URL" },
					broken: true,
					internal: null,
					samePage: null
				});
				expect(result.error).to.be.an.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
			});
		});
		
		
		
		it("a root-path-relative url", function()
		{
			return checkUrl(
				"/fixtures/page-no-links.html",
				null,
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "/fixtures/page-no-links.html",
						resolved: null,
						redirected: null
					},
					base:
					{
						original: null,
						resolved: null
					},
					http: { redirects:null },
					//error: { message:"Invalid URL" },
					broken: true,
					internal: null,
					samePage: null
				});
				expect(result.error).to.be.an.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
			});
		});
		
		
		
		it("a path-relative url", function()
		{
			return checkUrl(
				"fixtures/page-no-links.html",
				null,
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "fixtures/page-no-links.html",
						resolved: null,
						redirected: null
					},
					base:
					{
						original: null,
						resolved: null
					},
					http: { redirects:null },
					//error: { message:"Invalid URL" },
					broken: true,
					internal: null,
					samePage: null
				});
				expect(result.error).to.be.an.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
			});
		});
		
		
		
		it("a query-relative url", function()
		{
			return checkUrl(
				"?query",
				null,
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "?query",
						resolved: null,
						redirected: null
					},
					base:
					{
						original: null,
						resolved: null
					},
					http: { redirects:null },
					//error: { message:"Invalid URL" },
					broken: true,
					internal: null,
					samePage: null
				});
				expect(result.error).to.be.an.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
			});
		});
		
		
		
		it("a hash-relative url", function()
		{
			return checkUrl(
				"#hash",
				null,
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "#hash",
						resolved: null,
						redirected: null
					},
					base:
					{
						original: null,
						resolved: null
					},
					http: { redirects:null },
					//error: { message:"Invalid URL" },
					broken: true,
					internal: null,
					samePage: null
				});
				expect(result.error).to.be.an.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
			});
		});
		
		
		
		it("an empty url", function()
		{
			return checkUrl(
				"",
				null,
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "",
						resolved: null,
						redirected: null
					},
					base:
					{
						original: null,
						resolved: null
					},
					http: { redirects:null },
					//error: { message:"Invalid URL" },
					broken: true,
					internal: null,
					samePage: null
				});
				expect(result.error).to.be.an.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
			});
		});
	});
	
	
	
	describe("should be broken and have error from", function()
	{
		it("a data uri", function()
		{
			return checkUrl(
				"data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7",
				null,
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7",
						resolved: null,
						redirected: null
					},
					base:
					{
						original: null,
						resolved: null
					},
					http: { redirects:null },
					//error: { message:"Invalid URL" },
					broken: true,
					internal: null,
					samePage: null
				});
				expect(result.error).to.be.an.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
			});
		});
		
		
		
		it("a tel uri", function()
		{
			return checkUrl(
				"tel:+5-555-555-5555",
				null,
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original: "tel:+5-555-555-5555",
						resolved: null,
						redirected: null
					},
					base:
					{
						original: null,
						resolved: null
					},
					http: { redirects:null },
					//error: { message:"Invalid URL" },
					broken: true,
					internal: null,
					samePage: null
				});
				expect(result.error).to.be.an.instanceOf(Error);
				expect(result.error.message).to.equal("Invalid URL");
			});
		});
	});
	
	
	
	describe("should not be broken with a REDIRECTED url", function()
	{
		it("containing no query or hash", function()
		{
			return checkUrl(
				conn.absoluteUrls[0]+"/fixtures/redirect.html",
				conn.absoluteUrls[0],
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:   conn.absoluteUrls[0]+"/fixtures/redirect.html",
						resolved:   conn.absoluteUrls[0]+"/fixtures/redirect.html",
						redirected: conn.absoluteUrls[0]+"/fixtures/index.html"
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { redirects:[] },
					error: null,
					broken: false,
					internal: true,
					samePage: false
				});
				expect(result.http.redirects).to.have.length(2);
			});
		});
		
		
		
		it("containing a query", function()
		{
			return checkUrl(
				conn.absoluteUrls[0]+"/fixtures/redirect.html?query",
				conn.absoluteUrls[0],
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:   conn.absoluteUrls[0]+"/fixtures/redirect.html?query",
						resolved:   conn.absoluteUrls[0]+"/fixtures/redirect.html?query",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { redirects:[] },
					error: null,
					broken: false,
					internal: true,
					samePage: false
				});
				expect(result.http.redirects).to.have.length(0);
			});
		});
		
		
		
		it("containing a hash", function()
		{
			return checkUrl(
				conn.absoluteUrls[0]+"/fixtures/redirect.html#hash",
				conn.absoluteUrls[0],
				new UrlCache(),
				utils.options()
			)
			.then( function(result)
			{
				expect(result).to.be.like(
				{
					url:
					{
						original:   conn.absoluteUrls[0]+"/fixtures/redirect.html#hash",
						resolved:   conn.absoluteUrls[0]+"/fixtures/redirect.html#hash",
						redirected: conn.absoluteUrls[0]+"/fixtures/index.html"
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { redirects:[] },
					error: null,
					broken: false,
					internal: true,
					samePage: false
				});
				expect(result.http.redirects).to.have.length(2);
			});
		});
	});
	
	
	
	describe("url object input", function()
	{
		it.skip("should work", function()
		{
			
		});
	});
	
	
	
	describe("caching", function()
	{
		it("should store the response", function()
		{
			var cache = new UrlCache();
			
			return checkUrl(
				conn.absoluteUrls[0]+"/fixtures/page-no-links.html",
				conn.absoluteUrls[0],
				cache,
				utils.options({ cacheResponses:true })
			)
			.then( function()
			{
				return cache.get( conn.absoluteUrls[0]+"/fixtures/page-no-links.html" );
			})
			.then( function(response)
			{
				expect(response).to.be.an("object");
			});
		});
		
		
		
		it("should store the response of a redirected url", function()
		{
			var cache = new UrlCache();
			
			return checkUrl(
				conn.absoluteUrls[0]+"/fixtures/redirect.html",
				conn.absoluteUrls[0],
				cache,
				utils.options({ cacheResponses:true })
			)
			.then( function()
			{
				return cache.get( conn.absoluteUrls[0]+"/fixtures/redirect.html" );
			})
			.then( function(response)
			{
				expect(response).to.be.an("object");
			})
			.then( function()
			{
				return cache.get( conn.absoluteUrls[0]+"/fixtures/index.html" );
			})
			.then( function(response)
			{
				expect(response).to.be.an("object");
			});
		});
		
		
		
		// NOTE :: not stored because we check first
		it("should not store the error from an erroneous url", function()
		{
			var cache = new UrlCache();
			
			return checkUrl(
				"/fixtures/page-fake.html",
				null,
				cache,
				utils.options({ cacheResponses:true })
			)
			.then( function()
			{
				return cache.get("/fixtures/page-fake.html");
			})
			.then( function(response)
			{
				expect(response).to.be.undefined;
			});
		});
		
		
		
		it("should request a unique url only once", function()
		{
			var cache = new UrlCache();
			
			return checkUrl(
				conn.absoluteUrls[0]+"/fixtures/page-no-links.html",
				conn.absoluteUrls[0],
				cache,
				utils.options({ cacheResponses:true })
			)
			.then( function()
			{
				return cache.get( conn.absoluteUrls[0]+"/fixtures/page-no-links.html" );
			})
			.then( function(response)
			{
				response._cached = true;
			})
			.then( function()
			{
				// Check URL again
				return checkUrl(
					conn.absoluteUrls[0]+"/fixtures/page-no-links.html",
					conn.absoluteUrls[0],
					cache,
					utils.options({ cacheResponses:true })
				);
			})
			.then( function()
			{
				return cache.get( conn.absoluteUrls[0]+"/fixtures/page-no-links.html" );
			})
			.then( function(response)
			{
				expect(response._cached).to.be.true;
			});
		});
	});
	
	
	
	describe("options", function()
	{
		it.skip("acceptedSchemes = []", function()
		{
			
		});
		
		
		
		it("excludeResponseData = true", function()
		{
			return checkUrl(
				conn.absoluteUrls[0]+"/fixtures/page-no-links.html",
				conn.absoluteUrls[0],
				new UrlCache(),
				utils.options({ excludeResponseData:true })
			)
			.then( function(result)
			{
				expect(result.http.response).to.be.null;
			});
		});
	});
});
