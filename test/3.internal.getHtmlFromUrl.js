"use strict";
var getHtmlFromUrl = require("../lib/internal/getHtmlFromUrl");

var utils = require("./utils");

var expect = require("chai").expect;
var fs = require("fs");
var UrlCache = require("urlcache");

var conn;



describe("INTERNAL -- getHtmlFromUrl", function()
{
	before( function(done)
	{
		utils.startConnection( function(connection)
		{
			conn = connection;
			done();
		});
	});
	
	
	
	after( function(done)
	{
		utils.stopConnection(conn.realPort, done);
	});
	
	
	
	it("should work", function(done)
	{
		getHtmlFromUrl(
			conn.absoluteUrl+"/fixtures/link-real.html",
			null,
			utils.options()
		)
		.then( function(result)
		{
			expect(result.html).to.equal( fs.readFileSync(__dirname+"/fixtures/link-real.html",{encoding:"utf8"}) );
			expect(result.url).to.equal( conn.absoluteUrl+"/fixtures/link-real.html" );
			done();
		})
		.catch(done);
	});
	
	
	
	it("should report a redirect", function(done)
	{
		getHtmlFromUrl(
			conn.absoluteUrl+"/fixtures/redirect.html",
			null,
			utils.options()
		)
		.then( function(result)
		{
			expect(result.html).to.equal( fs.readFileSync(__dirname+"/fixtures/index.html",{encoding:"utf8"}) );
			expect(result.url).to.equal( conn.absoluteUrl+"/fixtures/index.html" );
			done();
		})
		.catch(done);
	});
	
	
	
	it("should report a non-html url (gif)", function(done)
	{
		getHtmlFromUrl(
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
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.equal('expected type "text/html" but got "image/gif"');
			done();
		})
		.catch(done);
	});
	
	
	
	// TODO :: https://github.com/cloudhead/node-static/issues/169
	it.skip("should report a non-html url (unknown)", function(done)
	{
		getHtmlFromUrl(
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
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.equal('expected type "text/html" but got undefined');
			done();
		})
		.catch(done);
	});
	
	
	
	it("should report a 404", function(done)
	{
		getHtmlFromUrl(
			conn.absoluteUrl+"/fixtures/link-fake.html",
			null,
			utils.options()
		)
		.then( function(result)
		{
			done( new Error("this should not have been called") );
		})
		.catch( function(error)
		{
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.equal("HTML could not be retrieved");
			done();
		})
		.catch(done);
	});
	
	
	
	it("should report an erroneous url", function(done)
	{
		getHtmlFromUrl(
			"/fixtures/link-fake.html",
			null,
			utils.options()
		)
		.then( function(result)
		{
			done( new Error("this should not have been called") );
		})
		.catch( function(error)
		{
			expect(error).to.be.instanceOf(Error);
			//expect(error.message).to.equal("Invalid URL");  // TODO :: https://github.com/joepie91/node-bhttp/issues/4
			done();
		})
		.catch(done);
	});
	
	
	
	// NOTE :: cache is not stored for use in `getHtmlFromUrl()`, but instead for any wrapping functions
	// As a result, the cached responses are not retrieved and checked to be non-unique
	describe("caching", function()
	{
		it("should store the response", function(done)
		{
			var cache = new UrlCache();
			
			getHtmlFromUrl(
				conn.absoluteUrl+"/fixtures/link-real.html",
				cache,
				utils.options({ cacheResponses:true })
			)
			.then( function(result)
			{
				return cache.get( conn.absoluteUrl+"/fixtures/link-real.html" );
			})
			.then( function(response)
			{
				expect(response).to.be.an("object");
				done();
			})
			.catch(done);
		});
		
		
		
		it("should store a redirected response", function(done)
		{
			var cache = new UrlCache();
			
			getHtmlFromUrl(
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
				done();
			})
			.catch(done);
		});
	});
});
