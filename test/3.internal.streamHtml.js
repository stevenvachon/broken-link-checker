"use strict";
var messages   = require("../lib/internal/messages");
var streamHtml = require("../lib/internal/streamHtml");

var helpers = require("./helpers");

var expect = require("chai").expect;
var isStream = require("is-stream");
var UrlCache = require("urlcache");

var conn;



describe("INTERNAL -- streamHtml", function()
{
	before( function()
	{
		return helpers.startConnection().then( function(connection)
		{
			conn = connection;
		});
	});
	
	
	
	after( function()
	{
		return helpers.stopConnection(conn.realPort);
	});
	
	
	
	it("works", function()
	{
		return streamHtml(
			conn.absoluteUrl+"/normal/no-links.html",
			null,
			helpers.options()
		)
		.then( function(result)
		{
			expect( isStream(result.stream) ).to.be.true;
			expect(result.response.url).to.equal( conn.absoluteUrl+"/normal/no-links.html" );
		});
	});
	
	
	
	it("reports a redirect", function()
	{
		return streamHtml(
			conn.absoluteUrl+"/redirect/redirect.html",
			null,
			helpers.options()
		)
		.then( function(result)
		{
			expect( isStream(result.stream) ).to.be.true;
			expect(result.response.url).to.equal( conn.absoluteUrl+"/redirect/redirected.html" );
		});
	});
	
	
	
	it("rejects a non-html url (gif)", function()
	{
		var accepted = false;
		
		return streamHtml(
			conn.absoluteUrl+"/non-html/image.gif",
			null,
			helpers.options()
		)
		.then( function(result)
		{
			accepted = new Error("this should not have been called");
		})
		.catch( function(error)
		{
			expect(error).to.be.an.instanceOf(Error);
			expect(error.message).to.equal( messages.errors.EXPECTED_HTML("image/gif") );
		})
		.then( function()
		{
			if (accepted!==false) throw accepted;
		});
	});
	
	
	
	it("rejects a non-html url (unknown)", function()
	{
		var accepted = false;
		
		return streamHtml(
			conn.absoluteUrl+"/non-html/empty",
			null,
			helpers.options()
		)
		.then( function(result)
		{
			accepted = new Error("this should not have been called");
		})
		.catch( function(error)
		{
			expect(error).to.be.an.instanceOf(Error);
			expect(error.message).to.equal( messages.errors.EXPECTED_HTML(undefined) );
		})
		.then( function()
		{
			if (accepted!==false) throw accepted;
		});
	});
	
	
	
	it("rejects a 404", function()
	{
		var accepted = false;
		
		return streamHtml(
			conn.absoluteUrl+"/normal/fake.html",
			null,
			helpers.options()
		)
		.then( function(result)
		{
			accepted = new Error("this should not have been called");
		})
		.catch( function(error)
		{
			expect(error).to.be.an.instanceOf(Error);
			expect(error.message).to.equal( messages.errors.HTML_RETRIEVAL );
		})
		.then( function()
		{
			if (accepted!==false) throw accepted;
		});
	});
	
	
	
	it("rejects an erroneous url", function()
	{
		var accepted = false;
		
		return streamHtml(
			"/normal/fake.html",
			null,
			helpers.options()
		)
		.then( function(result)
		{
			accepted = new Error("this should not have been called");
		})
		.catch( function(error)
		{
			expect(error).to.be.an.instanceOf(Error);
			//expect(error.message).to.equal("Invalid URL");  // TODO :: https://github.com/joepie91/node-bhttp/issues/4
		})
		.then( function()
		{
			if (accepted!==false) throw accepted;
		});
	});
	
	
	
	// NOTE :: cache is not stored for use in `streamHtml()`, but instead for any wrapping functions
	// As a result, the cached responses are not retrieved and checked to be non-unique
	describe("caching", function()
	{
		it("stores the response", function()
		{
			var cache = new UrlCache();
			
			return streamHtml(
				conn.absoluteUrl+"/normal/no-links.html",
				cache,
				helpers.options({ cacheResponses:true })
			)
			.then( function(result)
			{
				return cache.get( conn.absoluteUrl+"/normal/no-links.html" );
			})
			.then( function(response)
			{
				expect(response).to.be.an("object");
			});
		});
		
		
		
		it("stores the response of a redirected url", function()
		{
			var cache = new UrlCache();
			
			return streamHtml(
				conn.absoluteUrl+"/redirect/redirect.html",
				cache,
				helpers.options({ cacheResponses:true })
			)
			.then( function(result)
			{
				return cache.get( conn.absoluteUrl+"/redirect/redirect.html" );
			})
			.then( function(response)
			{
				expect(response).to.be.an("object");
					
				return cache.get( conn.absoluteUrl+"/redirect/redirected.html" );
			})
			.then( function(response)
			{
				expect(response).to.be.an("object");
			});
		});
		
		
		
		it("stores the response of a non-html url", function()
		{
			var cache = new UrlCache();
			
			return streamHtml(
				conn.absoluteUrl+"/non-html/image.gif",
				cache,
				helpers.options({ cacheResponses:true })
			)
			.catch( function(error)
			{
				// "Unsupported type", etc, error
			})
			.then( function(result)
			{
				return cache.get( conn.absoluteUrl+"/non-html/image.gif" );
			})
			.then( function(response)
			{
				expect(response).to.be.an("object");
				expect(response).to.not.be.an.instanceOf(Error);
			});
		});
		
		
		
		it("stores the response of a 404", function()
		{
			var cache = new UrlCache();
			
			return streamHtml(
				conn.absoluteUrl+"/normal/fake.html",
				cache,
				helpers.options({ cacheResponses:true })
			)
			.catch( function(error)
			{
				// "HTML not retrieved", etc, error
			})
			.then( function(result)
			{
				return cache.get( conn.absoluteUrl+"/normal/fake.html" );
			})
			.then( function(response)
			{
				expect(response).to.be.an("object");
				expect(response).to.not.be.an.instanceOf(Error);
			});
		});
		
		
		
		it("stores the error from an erroneous url", function()
		{
			var cache = new UrlCache();
			
			return streamHtml(
				"/normal/fake.html",
				cache,
				helpers.options({ cacheResponses:true })
			)
			.catch( function(error)
			{
				// "Invalid URL", etc, error
			})
			.then( function(result)
			{
				return cache.get("/normal/fake.html");
			})
			.then( function(response)
			{
				expect(response).to.be.an.instanceOf(Error);
				//expect(response.message).to.equal("Invalid URL");  // TODO :: https://github.com/joepie91/node-bhttp/issues/4
			});
		});
	});
});
