"use strict";
var streamHtml = require("../lib/internal/streamHtml");

var utils = require("./utils");

var expect = require("chai").expect;
var fs = require("fs");
var isStream = require("is-stream");
var UrlCache = require("urlcache");

var conn;



describe("INTERNAL -- streamHtml", function()
{
	before( function()
	{
		return utils.startConnection().then( function(connection)
		{
			conn = connection;
		});
	});
	
	
	
	after( function()
	{
		return utils.stopConnection(conn.realPort);
	});
	
	
	
	it("should work", function()
	{
		return streamHtml(
			conn.absoluteUrl+"/fixtures/page-no-links.html",
			null,
			utils.options()
		)
		.then( function(result)
		{
			expect( isStream(result.stream) ).to.be.true;
			expect(result.response.url).to.equal( conn.absoluteUrl+"/fixtures/page-no-links.html" );
		});
	});
	
	
	
	it("should report a redirect", function()
	{
		return streamHtml(
			conn.absoluteUrl+"/fixtures/redirect.html",
			null,
			utils.options()
		)
		.then( function(result)
		{
			expect( isStream(result.stream) ).to.be.true;
			expect(result.response.url).to.equal( conn.absoluteUrl+"/fixtures/index.html" );
		});
	});
	
	
	
	it("should report a non-html url (gif)", function()
	{
		return streamHtml(
			conn.absoluteUrl+"/fixtures/image.gif",
			null,
			utils.options()
		)
		.then( function(result)
		{
			done( new Error("this should not have been called") );
		})
		.catch( function(error)
		{
			expect(error).to.be.an.instanceOf(Error);
			expect(error.message).to.equal('expected type "text/html" but got "image/gif"');
		});
	});
	
	
	
	// TODO :: https://github.com/cloudhead/node-static/issues/169
	it.skip("should report a non-html url (unknown)", function()
	{
		return streamHtml(
			conn.absoluteUrl+"/fixtures/empty",
			null,
			utils.options()
		)
		.then( function(result)
		{
			done( new Error("this should not have been called") );
		})
		.catch( function(error)
		{
			expect(error).to.be.an.instanceOf(Error);
			expect(error.message).to.equal('expected type "text/html" but got undefined');
		});
	});
	
	
	
	it("should report a 404", function()
	{
		return streamHtml(
			conn.absoluteUrl+"/fixtures/page-fake.html",
			null,
			utils.options()
		)
		.then( function(result)
		{
			done( new Error("this should not have been called") );
		})
		.catch( function(error)
		{
			expect(error).to.be.an.instanceOf(Error);
			expect(error.message).to.equal("HTML could not be retrieved");
		});
	});
	
	
	
	it("should report an erroneous url", function()
	{
		streamHtml(
			"/fixtures/page-fake.html",
			null,
			utils.options()
		)
		.then( function(result)
		{
			done( new Error("this should not have been called") );
		})
		.catch( function(error)
		{
			expect(error).to.be.an.instanceOf(Error);
			//expect(error.message).to.equal("Invalid URL");  // TODO :: https://github.com/joepie91/node-bhttp/issues/4
		});
	});
	
	
	
	// NOTE :: cache is not stored for use in `streamHtml()`, but instead for any wrapping functions
	// As a result, the cached responses are not retrieved and checked to be non-unique
	describe("caching", function()
	{
		it("should store the response", function()
		{
			var cache = new UrlCache();
			
			return streamHtml(
				conn.absoluteUrl+"/fixtures/page-no-links.html",
				cache,
				utils.options({ cacheResponses:true })
			)
			.then( function(result)
			{
				return cache.get( conn.absoluteUrl+"/fixtures/page-no-links.html" );
			})
			.then( function(response)
			{
				expect(response).to.be.an("object");
			});
		});
		
		
		
		it("should store the response of a redirected url", function()
		{
			var cache = new UrlCache();
			
			return streamHtml(
				conn.absoluteUrl+"/fixtures/redirect.html",
				cache,
				utils.options({ cacheResponses:true })
			)
			.then( function(result)
			{
				return cache.get( conn.absoluteUrl+"/fixtures/redirect.html" );
			})
			.then( function(response)
			{
				expect(response).to.be.an("object");
					
				return cache.get( conn.absoluteUrl+"/fixtures/index.html" );
			})
			.then( function(response)
			{
				expect(response).to.be.an("object");
			});
		});
		
		
		
		it("should store the response of a non-html url", function()
		{
			var cache = new UrlCache();
			
			return streamHtml(
				conn.absoluteUrl+"/fixtures/image.gif",
				cache,
				utils.options({ cacheResponses:true })
			)
			.catch( function(error)
			{
				// "Unsupported type", etc, error
			})
			.then( function(result)
			{
				return cache.get( conn.absoluteUrl+"/fixtures/image.gif" );
			})
			.then( function(response)
			{
				expect(response).to.be.an("object");
				expect(response).to.not.be.an.instanceOf(Error);
			});
		});
		
		
		
		it("should store the response of a 404", function()
		{
			var cache = new UrlCache();
			
			return streamHtml(
				conn.absoluteUrl+"/fixtures/page-fake.html",
				cache,
				utils.options({ cacheResponses:true })
			)
			.catch( function(error)
			{
				// "HTML not retrieved", etc, error
			})
			.then( function(result)
			{
				return cache.get( conn.absoluteUrl+"/fixtures/page-fake.html" );
			})
			.then( function(response)
			{
				expect(response).to.be.an("object");
				expect(response).to.not.be.an.instanceOf(Error);
			});
		});
		
		
		
		it("should store the error from an erroneous url", function()
		{
			var cache = new UrlCache();
			
			return streamHtml(
				"/fixtures/page-fake.html",
				cache,
				utils.options({ cacheResponses:true })
			)
			.catch( function(error)
			{
				// "Invalid URL", etc, error
			})
			.then( function(result)
			{
				return cache.get("/fixtures/page-fake.html");
			})
			.then( function(response)
			{
				expect(response).to.be.an.instanceOf(Error);
				//expect(response.message).to.equal("Invalid URL");  // TODO :: https://github.com/joepie91/node-bhttp/issues/4
			});
		});
	});
});
