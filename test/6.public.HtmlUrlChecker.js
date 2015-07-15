"use strict";
var HtmlUrlChecker = require("../lib/public/HtmlUrlChecker");

var utils = require("./utils");

var expect = require("chai").expect;

var conn;



describe("PUBLIC -- HtmlUrlChecker", function()
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
	
	
	
	describe("methods (#1)", function()
	{
		describe("enqueue()", function()
		{
			it("should accept a valid url", function(done)
			{
				var id = new HtmlUrlChecker( utils.options() ).enqueue(conn.absoluteUrl);
				
				expect(id).to.not.be.instanceOf(Error);
				done();
			});
			
			
			
			it("should reject an invalid url", function(done)
			{
				var id = new HtmlUrlChecker( utils.options() ).enqueue("/path/");
				
				expect(id).to.be.instanceOf(Error);
				done();
			});
		});
		
		
		
		describe("dequeue()", function()
		{
			it("should accept a valid id", function(done)
			{
				var instance = new HtmlUrlChecker( utils.options() );
				
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
				var instance = new HtmlUrlChecker( utils.options() );
				
				// Prevent first queued item from immediately starting (and thus being auto-dequeued)
				instance.pause();
				
				var id = instance.enqueue( conn.absoluteUrl );
				
				expect( instance.dequeue(id+1) ).to.be.instanceOf(Error);
				expect( instance.length() ).to.equal(1);
				done();
			});
		});
	});
	
	
	
	describe("handlers", function()
	{
		it("link", function(done)
		{
			var count = 0;
			
			new HtmlUrlChecker( utils.options(),
			{
				link: function(result, customData)
				{
					// HTML has more than one link, so only accept the first
					// to avoid calling `done()` more than once
					if (++count > 1) return;
					
					expect(arguments).to.have.length(2);
					expect(result).to.be.instanceOf(Object);
					expect(customData).to.be.undefined;
					done();
				}
			}).enqueue( conn.absoluteUrl+"/fixtures/index.html" );
		});
		
		
		
		it("item", function(done)
		{
			new HtmlUrlChecker( utils.options(),
			{
				item: function(error, htmlUrl, customData)
				{
					expect(arguments).to.have.length(3);
					expect(error).to.be.null;
					expect(htmlUrl).to.be.a("string");
					expect(customData).to.be.undefined;
					done();
				}
			}).enqueue( conn.absoluteUrl+"/fixtures/index.html" );
		});
		
		
		
		it("end", function(done)
		{
			new HtmlUrlChecker( utils.options(),
			{
				end: function()
				{
					expect(arguments).to.have.length(0);
					done();
				}
			}).enqueue( conn.absoluteUrl+"/fixtures/index.html" );
		});
	});
	
	
	
	describe("methods (#2)", function()
	{
		describe("numActiveItems()", function()
		{
			it("should work", function(done)
			{
				var instance = new HtmlUrlChecker( utils.options(),
				{
					end: function()
					{
						expect( instance.numActiveItems() ).to.equal(0);
						done();
					}
				});
				
				instance.enqueue( conn.absoluteUrl+"/fixtures/index.html" );
				instance.enqueue( conn.absoluteUrl+"/fixtures/link-real.html" );
				
				expect( instance.numActiveItems() ).to.equal(1);
			});
		});
		
		
		
		describe("numActiveLinks()", function()
		{
			it("should work", function(done)
			{
				var htmlCalled = false;
				
				var instance = new HtmlUrlChecker( utils.options(),
				{
					html: function(id)	// undocumented event
					{
						expect( instance.numActiveLinks() ).to.equal(2);
						htmlCalled = true;
					},
					end: function()
					{
						expect(htmlCalled).to.be.true;
						expect( instance.numActiveLinks() ).to.equal(0);
						done();
					}
				});
				
				instance.enqueue( conn.absoluteUrl+"/fixtures/index.html" );
				
				expect( instance.numActiveLinks() ).to.equal(0);
			});
		});
	});
	
	
	
	describe("edge cases", function()
	{
		it("should support custom data", function(done)
		{
			var itemCalled = false;
			var linkCalled = false;
			
			new HtmlUrlChecker( utils.options(),
			{
				link: function(result, customData)
				{
					expect(customData).to.be.instanceOf(Object);
					expect(customData.test).to.equal("value");
					linkCalled = true;
				},
				item: function(error, htmlUrl, customData)
				{
					expect(customData).to.be.instanceOf(Object);
					expect(customData.test).to.equal("value");
					itemCalled = true;
				},
				end: function()
				{
					expect(linkCalled).to.be.true;
					expect(itemCalled).to.be.true;
					done();
				}
			}).enqueue( conn.absoluteUrl+"/fixtures/index.html", {test:"value"} );
		});
		
		
		
		it("should support multiple queue items", function(done)
		{
			var results = [];
			
			var instance = new HtmlUrlChecker( utils.options(),
			{
				link: function(result, customData)
				{
					if (results[ customData.index ] === undefined)
					{
						results[ customData.index ] = [];
					}
					
					results[ customData.index ][ result.html.index ] = result;
				},
				end: function()
				{
					expect(results).to.have.length(2);
					
					expect(results[0]).to.have.length(2);
					expect(results[0][0].broken).to.be.false;
					expect(results[0][1].broken).to.be.true;
					
					expect(results[1]).to.have.length(2);
					expect(results[1][0].broken).to.be.false;
					expect(results[1][1].broken).to.be.true;
					
					done();
				}
			});
			
			instance.enqueue( conn.absoluteUrl+"/fixtures/index.html", {index:0} );
			instance.enqueue( conn.absoluteUrl+"/fixtures/index.html", {index:1} );
		});
		
		
		
		it("should support html with no links", function(done)
		{
			var count = 0;
			var itemCalled = false;
			
			new HtmlUrlChecker( utils.options(),
			{
				link: function()
				{
					count++;
				},
				item: function()
				{
					itemCalled = true;
				},
				end: function()
				{
					expect(itemCalled).to.be.true;
					expect(count).to.equal(0);
					done();
				}
			}).enqueue( conn.absoluteUrl+"/fixtures/link-real.html" );
		});
		
		
		
		it("should support pages after html with no links", function(done)
		{
			var count = 0;
			var itemCalled = 0;
			
			var instance = new HtmlUrlChecker( utils.options(),
			{
				link: function()
				{
					count++;
				},
				item: function()
				{
					itemCalled++;
				},
				end: function()
				{
					expect(count).to.equal(2);
					expect(itemCalled).to.equal(2);
					done();
				}
			});
			instance.enqueue( conn.absoluteUrl+"/fixtures/link-real.html" );
			instance.enqueue( conn.absoluteUrl+"/fixtures/index.html" );
		});
		
		
		
		it("should report error when html could not be retrieved", function(done)
		{
			var itemCalled = false;
			
			new HtmlUrlChecker( utils.options(),
			{
				item: function(error, htmlUrl, customData)
				{
					expect(error).to.be.instanceOf(Error);
					expect(htmlUrl).to.be.a("string");
					itemCalled = true;
				},
				end: function()
				{
					expect(itemCalled).to.be.true;
					done();
				}
			}).enqueue( conn.absoluteUrl+"/fixtures/link-fake.html", {test:"value"} );
		});
	});
});
