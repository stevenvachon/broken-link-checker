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
		it("enqueue()", function(done)
		{
			var id = new UrlChecker( utils.options() ).enqueue( conn.absoluteUrl );
			
			expect(id).to.not.be.instanceOf(Error);
			done();
		});
		
		
		
		it("dequeue()", function(done)
		{
			var instance = new UrlChecker( utils.options() );
			
			// Prevent first queued item from immediately starting (and thus being auto-dequeued)
			instance.pause();
			
			var id = instance.enqueue( conn.absoluteUrl );
			
			expect(id).to.not.be.instanceOf(Error);
			expect( instance.dequeue(id) ).to.be.true;
			done();
		});
	});
	
	
	
	describe("handlers", function()
	{
		it("link", function(done)
		{
			new UrlChecker( utils.options(),
			{
				link: function(result)
				{
					done();
				}
			}).enqueue( conn.absoluteUrl );
		});
		
		
		
		it("complete", function(done)
		{
			new UrlChecker( utils.options(),
			{
				end: function()
				{
					done();
				}
			}).enqueue( conn.absoluteUrl );
		});
	});
	
	
	
	describe("edge cases", function()
	{
		it("should return a link", function(done)
		{
			new UrlChecker( utils.options(),
			{
				link: function(result)
				{
					expect(result).to.be.instanceOf(Object);
					expect(result.url.original).to.equal( conn.absoluteUrl );
					expect(result.base.original).to.equal( conn.absoluteUrl );
					done();
				}
			}).enqueue( conn.absoluteUrl, conn.absoluteUrl );
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
		
		
		
		it("should support multiple links", function(done)
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
					expect(results[0].url.original).to.equal( conn.absoluteUrl+"/fixture/index.html" );
					expect(results[1].url.original).to.equal( conn.absoluteUrl+"/fixture/link-real.html" );
					expect(results[2].url.original).to.equal( conn.absoluteUrl+"/fixture/link-fake.html" );
					done();
				}
			});
			
			instance.enqueue( conn.absoluteUrl+"/fixture/index.html",     null, {index:0} );
			instance.enqueue( conn.absoluteUrl+"/fixture/link-real.html", null, {index:1} );
			instance.enqueue( conn.absoluteUrl+"/fixture/link-fake.html", null, {index:2} );
		});
	});
});
