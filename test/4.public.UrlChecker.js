"use strict";
var UrlChecker = require("../lib/public/UrlChecker");

var utils = require("./utils");

var expect = require("chai").expect;

var conn;



describe("PUBLIC -- UrlChecker", function()
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
	
	
	
	describe("methods", function()
	{
		describe("enqueue()", function()
		{
			it("should accept a valid url", function(done)
			{
				var instance = new UrlChecker( utils.options() );
				
				expect( instance.enqueue(conn.absoluteUrl) ).to.not.be.instanceOf(Error);
				expect( instance.enqueue("/fixtures/link-real.html", conn.absoluteUrl) ).to.not.be.instanceOf(Error);
				done();
			});
			
			
			
			it("should reject an invalid url", function(done)
			{
				var id = new UrlChecker( utils.options() ).enqueue("/path/");
				
				expect(id).to.be.instanceOf(Error);
				done();
			});
		});
		
		
		
		describe("dequeue()", function()
		{
			it("should accept a valid id", function(done)
			{
				var instance = new UrlChecker( utils.options() );
				
				// Prevent first queued item from immediately starting (and thus being auto-dequeued)
				instance.pause();
				
				var id = instance.enqueue( conn.absoluteUrl );
				
				expect(id).to.not.be.instanceOf(Error);
				expect( instance.length() ).to.equal(1);
				expect( instance.dequeue(id) ).to.be.true;
				expect( instance.length() ).to.equal(0);
				done();
			});
			
			
			
			it("should reject an invalid id", function(done)
			{
				var instance = new UrlChecker( utils.options() );
				
				// Prevent first queued item from immediately starting (and thus being auto-dequeued)
				instance.pause();
				
				var id = instance.enqueue( conn.absoluteUrl );
				
				expect( instance.dequeue(id+1) ).to.be.instanceOf(Error);
				expect( instance.length() ).to.equal(1);
				done();
			});
		});
		
		
		
		describe("numActive()", function()
		{
			it("should work", function(done)
			{
				var instance = new UrlChecker( utils.options() );
				
				instance.enqueue(conn.absoluteUrl);
				instance.enqueue("/fixtures/link-real.html", conn.absoluteUrl);
				
				expect( instance.numActive() ).to.equal(2);
				done();
			});
		});
	});
	
	
	
	describe("handlers", function()
	{
		it("link", function(done)
		{
			new UrlChecker( utils.options(),
			{
				link: function(result, customData)
				{
					expect(arguments).to.have.length(2);
					expect(result).to.be.instanceOf(Object);
					expect(customData).to.be.undefined;
					done();
				}
			}).enqueue( conn.absoluteUrl );
		});
		
		
		
		it("end", function(done)
		{
			new UrlChecker( utils.options(),
			{
				end: function()
				{
					expect(arguments).to.have.length(0);
					done();
				}
			}).enqueue( conn.absoluteUrl );
		});
	});
	
	
	
	describe("edge cases", function()
	{
		it("should support a relative url", function(done)
		{
			new UrlChecker( utils.options(),
			{
				link: function(result)
				{
					expect(result.url.resolved).to.equal( conn.absoluteUrl+"/fixtures/link-real.html" );
					expect(result.url.original).to.equal("/fixtures/link-real.html");
					expect(result.base.original).to.equal( conn.absoluteUrl );
					done();
				}
			}).enqueue( "/fixtures/link-real.html", conn.absoluteUrl );
		});
		
		
		
		it("should support custom data", function(done)
		{
			new UrlChecker( utils.options(),
			{
				link: function(result, customData)
				{
					expect(customData).to.be.instanceOf(Object);
					expect(customData.test).to.equal("value");
					done();
				}
			}).enqueue( conn.absoluteUrl, null, {test:"value"} );
		});
		
		
		
		it("should support multiple queue items", function(done)
		{
			var results = [];
			
			var instance = new UrlChecker( utils.options(),
			{
				link: function(result, customData)
				{
					results[customData.index] = result;
				},
				end: function()
				{
					expect(results).to.have.length(3);
					expect(results[0].url.original).to.equal( conn.absoluteUrl+"/fixtures/index.html" );
					expect(results[1].url.original).to.equal( conn.absoluteUrl+"/fixtures/link-real.html" );
					expect(results[2].url.original).to.equal( conn.absoluteUrl+"/fixtures/link-fake.html" );
					done();
				}
			});
			
			instance.enqueue( conn.absoluteUrl+"/fixtures/index.html",     null, {index:0} );
			instance.enqueue( conn.absoluteUrl+"/fixtures/link-real.html", null, {index:1} );
			instance.enqueue( conn.absoluteUrl+"/fixtures/link-fake.html", null, {index:2} );
		});
	});
});
