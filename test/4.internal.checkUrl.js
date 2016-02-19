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
			conn.absoluteUrls[0]+"/normal/no-links.html",
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
				conn.absoluteUrls[0]+"/normal/no-links.html",
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
						original: conn.absoluteUrls[0]+"/normal/no-links.html",
						resolved: conn.absoluteUrls[0]+"/normal/no-links.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a scheme-relative url", function()
		{
			return checkUrl(
				conn.relativeUrls[0]+"/normal/no-links.html",
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
						original: conn.relativeUrls[0]+"/normal/no-links.html",
						resolved: conn.absoluteUrls[0]+"/normal/no-links.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a root-path-relative url", function()
		{
			return checkUrl(
				"/normal/no-links.html",
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
						original: "/normal/no-links.html",
						resolved: conn.absoluteUrls[0]+"/normal/no-links.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a path-relative url", function()
		{
			return checkUrl(
				"normal/no-links.html",
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
						original: "normal/no-links.html",
						resolved: conn.absoluteUrls[0]+"/normal/no-links.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a query-relative url", function()
		{
			return checkUrl(
				"?query",
				conn.absoluteUrls[0]+"/normal/no-links.html",
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
						resolved: conn.absoluteUrls[0]+"/normal/no-links.html?query",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0]+"/normal/no-links.html",
						resolved: conn.absoluteUrls[0]+"/normal/no-links.html"
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a hash-relative url", function()
		{
			return checkUrl(
				"#hash",
				conn.absoluteUrls[0]+"/normal/no-links.html",
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
						resolved: conn.absoluteUrls[0]+"/normal/no-links.html#hash",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0]+"/normal/no-links.html",
						resolved: conn.absoluteUrls[0]+"/normal/no-links.html"
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: true
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("an empty url", function()
		{
			return checkUrl(
				"",
				conn.absoluteUrls[0]+"/normal/no-links.html",
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
						resolved: conn.absoluteUrls[0]+"/normal/no-links.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0]+"/normal/no-links.html",
						resolved: conn.absoluteUrls[0]+"/normal/no-links.html"
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: true
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
	});
	
	
	
	describe("should be broken with a REAL HOST and FAKE PATH from", function()
	{
		it("an absolute url", function()
		{
			return checkUrl(
				conn.absoluteUrls[0]+"/normal/fake.html",
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
						original: conn.absoluteUrls[0]+"/normal/fake.html",
						resolved: conn.absoluteUrls[0]+"/normal/fake.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { response: { redirects:[] } },
					broken: true,
					brokenReason: "HTTP_404",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a scheme-relative url", function()
		{
			return checkUrl(
				conn.relativeUrls[0]+"/normal/fake.html",
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
						original: conn.relativeUrls[0]+"/normal/fake.html",
						resolved: conn.absoluteUrls[0]+"/normal/fake.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { response: { redirects:[] } },
					broken: true,
					brokenReason: "HTTP_404",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a root-path-relative url", function()
		{
			return checkUrl(
				"/normal/fake.html",
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
						original: "/normal/fake.html",
						resolved: conn.absoluteUrls[0]+"/normal/fake.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { response: { redirects:[] } },
					broken: true,
					brokenReason: "HTTP_404",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a path-relative url", function()
		{
			return checkUrl(
				"normal/fake.html",
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
						original: "normal/fake.html",
						resolved: conn.absoluteUrls[0]+"/normal/fake.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { response: { redirects:[] } },
					broken: true,
					brokenReason: "HTTP_404",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a query-relative url", function()
		{
			return checkUrl(
				"?query",
				conn.absoluteUrls[0]+"/normal/fake.html",
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
						resolved: conn.absoluteUrls[0]+"/normal/fake.html?query",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0]+"/normal/fake.html",
						resolved: conn.absoluteUrls[0]+"/normal/fake.html"
					},
					http: { response: { redirects:[] } },
					broken: true,
					brokenReason: "HTTP_404",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("a hash-relative url", function()
		{
			return checkUrl(
				"#hash",
				conn.absoluteUrls[0]+"/normal/fake.html",
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
						resolved: conn.absoluteUrls[0]+"/normal/fake.html#hash",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0]+"/normal/fake.html",
						resolved: conn.absoluteUrls[0]+"/normal/fake.html"
					},
					http: { response: { redirects:[] } },
					broken: true,
					brokenReason: "HTTP_404",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: true
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("an empty url", function()
		{
			return checkUrl(
				"",
				conn.absoluteUrls[0]+"/normal/fake.html",
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
						resolved: conn.absoluteUrls[0]+"/normal/fake.html",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0]+"/normal/fake.html",
						resolved: conn.absoluteUrls[0]+"/normal/fake.html"
					},
					http: { response: { redirects:[] } },
					broken: true,
					brokenReason: "HTTP_404",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: true
				});
				expect(result.http.response.redirects).to.have.length(0);
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
					http: { response:null },
					broken: true,
					brokenReason: "ERRNO_ECONNREFUSED",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
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
					http: { response:null },
					broken: true,
					brokenReason: "ERRNO_ECONNREFUSED",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
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
					http: { response:null },
					broken: true,
					brokenReason: "ERRNO_ECONNREFUSED",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
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
					http: { response:null },
					broken: true,
					brokenReason: "ERRNO_ECONNREFUSED",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
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
					http: { response:null },
					broken: true,
					brokenReason: "ERRNO_ECONNREFUSED",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
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
					http: { response:null },
					broken: true,
					brokenReason: "ERRNO_ECONNREFUSED",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: true
				});
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
					http: { response:null },
					broken: true,
					brokenReason: "ERRNO_ECONNREFUSED",
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: true
				});
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
					http: { response:null },
					broken: true,
					//brokenReason: "ERRNO_ECONNRESET",
					excluded: null,
					excludedReason: null,
					internal: null,
					samePage: null
				});
				
				expect(result.brokenReason).to.satisfy( function(value)
				{
					return value==="ERRNO_ECONNRESET" ||  // OSX, Node <=5.5.x
					       value==="ERRNO_ENOTFOUND" ||   // OSX, Node >=5.6.x
					       value==="ERRNO_ECONNREFUSED";  // Linux
				});
			});
		});
		
		
		
		it("a scheme-relative url", function()
		{
			return checkUrl(
				conn.relativeUrls[0]+"/no-links.html",
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
						original: conn.relativeUrls[0]+"/no-links.html",
						resolved: null,
						redirected: null
					},
					base:
					{
						original: null,
						resolved: null
					},
					http: { response:null },
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null,
					internal: null,
					samePage: null
				});
			});
		});
		
		
		
		it("a root-path-relative url", function()
		{
			return checkUrl(
				"/normal/no-links.html",
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
						original: "/normal/no-links.html",
						resolved: null,
						redirected: null
					},
					base:
					{
						original: null,
						resolved: null
					},
					http: { response:null },
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null,
					internal: null,
					samePage: null
				});
			});
		});
		
		
		
		it("a path-relative url", function()
		{
			return checkUrl(
				"normal/no-links.html",
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
						original: "normal/no-links.html",
						resolved: null,
						redirected: null
					},
					base:
					{
						original: null,
						resolved: null
					},
					http: { response:null },
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null,
					internal: null,
					samePage: null
				});
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
					http: { response:null },
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null,
					internal: null,
					samePage: null
				});
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
					http: { response:null },
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null,
					internal: null,
					samePage: null
				});
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
					http: { response:null },
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null,
					internal: null,
					samePage: null
				});
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
					http: { response:null },
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null,
					internal: null,
					samePage: null
				});
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
					http: { response:null },
					broken: true,
					brokenReason: "BLC_INVALID",
					excluded: null,
					excludedReason: null,
					internal: null,
					samePage: null
				});
			});
		});
	});
	
	
	
	describe("should not be broken with a REDIRECTED url", function()
	{
		it("containing no query or hash", function()
		{
			return checkUrl(
				conn.absoluteUrls[0]+"/redirect/redirect.html",
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
						original:   conn.absoluteUrls[0]+"/redirect/redirect.html",
						resolved:   conn.absoluteUrls[0]+"/redirect/redirect.html",
						redirected: conn.absoluteUrls[0]+"/redirect/redirected.html"
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(2);
			});
		});
		
		
		
		it("containing a query", function()
		{
			return checkUrl(
				conn.absoluteUrls[0]+"/redirect/redirect.html?query",
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
						original:   conn.absoluteUrls[0]+"/redirect/redirect.html?query",
						resolved:   conn.absoluteUrls[0]+"/redirect/redirect.html?query",
						redirected: null
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(0);
			});
		});
		
		
		
		it("containing a hash", function()
		{
			return checkUrl(
				conn.absoluteUrls[0]+"/redirect/redirect.html#hash",
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
						original:   conn.absoluteUrls[0]+"/redirect/redirect.html#hash",
						resolved:   conn.absoluteUrls[0]+"/redirect/redirect.html#hash",
						redirected: conn.absoluteUrls[0]+"/redirect/redirected.html"
					},
					base:
					{
						original: conn.absoluteUrls[0],
						resolved: conn.absoluteUrls[0]+"/"
					},
					http: { response: { redirects:[] } },
					broken: false,
					brokenReason: null,
					excluded: null,
					excludedReason: null,
					internal: true,
					samePage: false
				});
				expect(result.http.response.redirects).to.have.length(2);
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
				conn.absoluteUrls[0]+"/normal/no-links.html",
				conn.absoluteUrls[0],
				cache,
				utils.options({ cacheResponses:true })
			)
			.then( function()
			{
				return cache.get( conn.absoluteUrls[0]+"/normal/no-links.html" );
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
				conn.absoluteUrls[0]+"/redirect/redirect.html",
				conn.absoluteUrls[0],
				cache,
				utils.options({ cacheResponses:true })
			)
			.then( function()
			{
				return cache.get( conn.absoluteUrls[0]+"/redirect/redirect.html" );
			})
			.then( function(response)
			{
				expect(response).to.be.an("object");
			})
			.then( function()
			{
				return cache.get( conn.absoluteUrls[0]+"/redirect/redirected.html" );
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
				"/normal/fake.html",
				null,
				cache,
				utils.options({ cacheResponses:true })
			)
			.then( function()
			{
				return cache.get("/normal/fake.html");
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
				conn.absoluteUrls[0]+"/normal/no-links.html",
				conn.absoluteUrls[0],
				cache,
				utils.options({ cacheResponses:true })
			)
			.then( function()
			{
				return cache.get( conn.absoluteUrls[0]+"/normal/no-links.html" );
			})
			.then( function(response)
			{
				response._cached = true;
			})
			.then( function()
			{
				// Check URL again
				return checkUrl(
					conn.absoluteUrls[0]+"/normal/no-links.html",
					conn.absoluteUrls[0],
					cache,
					utils.options({ cacheResponses:true })
				);
			})
			.then( function()
			{
				return cache.get( conn.absoluteUrls[0]+"/normal/no-links.html" );
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
	});
});
