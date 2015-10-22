"use strict";
var UrlChecker = require("../lib/public/UrlChecker");

var utils = require("./utils");

var expect = require("chai").expect;

var conn;



describe("PUBLIC -- UrlChecker", function()
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
	
	
	
	describe("methods (#1)", function()
	{
		describe("enqueue()", function()
		{
			it("should accept a valid url", function()
			{
				var instance = new UrlChecker( utils.options() );
				
				expect( instance.enqueue(conn.absoluteUrl) ).to.not.be.an.instanceOf(Error);
				expect( instance.enqueue("/fixtures/page-no-links.html", conn.absoluteUrl) ).to.not.be.an.instanceOf(Error);
			});
			
			
			
			it("should reject an invalid url", function()
			{
				var id = new UrlChecker( utils.options() ).enqueue("/path/");
				
				expect(id).to.be.an.instanceOf(Error);
			});
		});
		
		
		
		describe("numActiveLinks()", function()
		{
			it("should work", function()
			{
				var instance = new UrlChecker( utils.options() );
				
				instance.enqueue(conn.absoluteUrl);
				instance.enqueue("/fixtures/page-no-links.html", conn.absoluteUrl);
				
				expect( instance.numActiveLinks() ).to.equal(2);
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
					expect(result).to.be.an.instanceOf(Object);
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
	
	
	
	describe("methods (#2)", function()
	{
		describe("pause() / resume()", function()
		{
			it("should work", function(done)
			{
				var resumed = false;
				
				var instance = new UrlChecker( utils.options(),
				{
					end: function()
					{
						expect(resumed).to.be.true;
						done();
					}
				});
				
				instance.pause();
				
				instance.enqueue( conn.absoluteUrl );
				
				// Wait longer than scan should take
				setTimeout( function()
				{
					resumed = true;
					instance.resume();
					
				}, 100);
			});
		});
		
		
		
		describe("dequeue() / numQueuedLinks()", function()
		{
			it("should accept a valid id", function()
			{
				var instance = new UrlChecker( utils.options() );
				
				// Prevent first queued item from immediately starting (and thus being auto-dequeued)
				instance.pause();
				
				var id = instance.enqueue( conn.absoluteUrl );
				
				expect(id).to.not.be.an.instanceOf(Error);
				expect( instance.numQueuedLinks() ).to.equal(1);
				expect( instance.dequeue(id) ).to.be.true;
				expect( instance.numQueuedLinks() ).to.equal(0);
			});
			
			
			
			it("should reject an invalid id", function()
			{
				var instance = new UrlChecker( utils.options() );
				
				// Prevent first queued item from immediately starting (and thus being auto-dequeued)
				instance.pause();
				
				var id = instance.enqueue( conn.absoluteUrl );
				
				expect( instance.dequeue(id+1) ).to.be.an.instanceOf(Error);
				expect( instance.numQueuedLinks() ).to.equal(1);
			});
		});
	});



	describe("caching", function()
	{
		it("should request a unique url only once", function(done)
		{
			var options = utils.options({ cacheResponses:true });
			var results = [];
			var success = false;

			var instance = new UrlChecker( options,
			{
				link: function(result, customData)
				{
					if (result.http.response._cached === true)
					{
						success = true;
					}
					
					result.http.response._cached = true;
					results[customData.index] = result;
				},
				end: function()
				{
					expect(success).to.equal(true);
					expect(results).to.have.length(3);
					done();
				}
			});
			
			instance.enqueue( conn.absoluteUrl+"/fixtures/index.html",         null, {index:0} );
			instance.enqueue( conn.absoluteUrl+"/fixtures/index.html",         null, {index:1} );
			instance.enqueue( conn.absoluteUrl+"/fixtures/page-no-links.html", null, {index:2} );
		});



		it("should re-request a non-unique url after clearing cache", function(done)
		{
			var finalFired = false;
			var options = utils.options({ cacheResponses:true });
			var results = [];

			var instance = new UrlChecker( options,
			{
				link: function(result, customData)
				{
					if (result.http.response._cached === true)
					{
						done( new Error("this should not have been a cached result") );
					}
					
					result.http.response._cached = true;
					results[customData.index] = result;
				},
				end: function()
				{
					if (finalFired === true)
					{
						expect(results).to.have.length(3);
						done();
					}
					else
					{
						instance.clearCache();
						instance.enqueue( conn.absoluteUrl+"/fixtures/page-no-links.html", null, {index:2} );
						finalFired = true;
					}
				}
			});
			
			instance.enqueue( conn.absoluteUrl+"/fixtures/index.html",         null, {index:0} );
			instance.enqueue( conn.absoluteUrl+"/fixtures/page-no-links.html", null, {index:1} );
		});
		
		
		
		it("should re-request a non-unique url after expiring in cache", function(done)
		{
			var finalFired = false;
			var options = utils.options({ cacheExpiryTime:50, cacheResponses:true });
			var results = [];
	
			var instance = new UrlChecker( options,
			{
				link: function(result, customData)
				{
					if (result.http.response._cached === true)
					{
						done( new Error("this should not have been a cached result") );
					}
					
					result.http.response._cached = true;
					results[customData.index] = result;
				},
				end: function()
				{
					if (finalFired === true)
					{
						expect(results).to.have.length(2);
						done();
					}
					else
					{
						setTimeout( function()
						{
							instance.enqueue( conn.absoluteUrl+"/fixtures/page-no-links.html", null, {index:1} );
							finalFired = true;
							
						}, 100);
					}
				}
			});
			
			instance.enqueue( conn.absoluteUrl+"/fixtures/page-no-links.html", null, {index:0} );
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
					expect(result).to.be.like(
					{
						url:
						{
							original: "/fixtures/page-no-links.html",
							resolved: conn.absoluteUrl+"/fixtures/page-no-links.html"
						},
						base:
						{
							original: conn.absoluteUrl
						}
					});
					done();
				}
			}).enqueue( "/fixtures/page-no-links.html", conn.absoluteUrl );
		});
		
		
		
		it("should support custom data", function(done)
		{
			new UrlChecker( utils.options(),
			{
				link: function(result, customData)
				{
					expect(customData).to.deep.equal({ test:"value" });
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
					expect(results).to.be.like(
					[
						{ url:{ original: conn.absoluteUrl+"/fixtures/index.html" } },
						{ url:{ original: conn.absoluteUrl+"/fixtures/page-no-links.html" } },
						{ url:{ original: conn.absoluteUrl+"/fixtures/page-fake.html" } }
					]);
					done();
				}
			});
			
			instance.enqueue( conn.absoluteUrl+"/fixtures/index.html",         null, {index:0} );
			instance.enqueue( conn.absoluteUrl+"/fixtures/page-no-links.html", null, {index:1} );
			instance.enqueue( conn.absoluteUrl+"/fixtures/page-fake.html",     null, {index:2} );
		});
	});
});
