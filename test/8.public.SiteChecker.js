"use strict";
var SiteChecker = require("../lib/public/SiteChecker");

var utils = require("./utils");

var expect = require("chai").expect;

var conn;



describe("PUBLIC -- SiteChecker", function()
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
				var id = new SiteChecker( utils.options() ).enqueue(conn.absoluteUrl);
				
				expect(id).to.not.be.an.instanceOf(Error);
			});
			
			
			
			it("should reject an invalid url", function()
			{
				var id = new SiteChecker( utils.options() ).enqueue("/path/");
				
				expect(id).to.be.an.instanceOf(Error);
			});
		});
		
		
		
		describe("dequeue()", function()
		{
			it("should accept a valid id", function()
			{
				var instance = new SiteChecker( utils.options() );
				
				// Prevent first queued item from immediately starting (and thus being auto-dequeued)
				instance.pause();
				
				var id = instance.enqueue( conn.absoluteUrl );
				
				expect(id).to.not.be.an.instanceOf(Error);
				expect( instance.numSites() ).to.equal(1);
				expect( instance.dequeue(id) ).to.be.true;
				expect( instance.numSites() ).to.equal(0);
			});
			
			
			
			it("should reject an invalid id", function()
			{
				var instance = new SiteChecker( utils.options() );
				
				// Prevent first queued item from immediately starting (and thus being auto-dequeued)
				instance.pause();
				
				var id = instance.enqueue( conn.absoluteUrl );
				
				expect( instance.dequeue(id+1) ).to.be.an.instanceOf(Error);
				expect( instance.numSites() ).to.equal(1);
			});
		});
	});
	
	
	
	describe("handlers", function()
	{
		it("link", function(done)
		{
			var count = 0;
			
			new SiteChecker( utils.options(),
			{
				link: function(result, customData)
				{
					// HTML has more than one link, so only accept the first
					// to avoid calling `done()` more than once
					if (++count > 1) return;
					
					expect(arguments).to.have.length(2);
					expect(result).to.be.an.instanceOf(Object);
					expect(customData).to.be.undefined;
					done();
				}
			}).enqueue( conn.absoluteUrl+"/fixtures/index.html" );
		});
		
		
		
		it("page", function(done)
		{
			var count = 0;
			
			new SiteChecker( utils.options(),
			{
				page: function(error, pageUrl, customData)
				{
					// Site has more than one page, so only accept the first
					// to avoid calling `done()` more than once
					if (++count > 1) return;
					
					expect(arguments).to.have.length(3);
					expect(error).to.be.null;
					expect(pageUrl).to.be.a("string");
					expect(customData).to.be.undefined;
					done();
				}
			}).enqueue( conn.absoluteUrl+"/fixtures/index.html" );
		});
		
		
		
		it("site", function(done)
		{
			new SiteChecker( utils.options(),
			{
				site: function(error, siteUrl, customData)
				{
					expect(arguments).to.have.length(3);
					expect(error).to.be.null;
					expect(siteUrl).to.be.a("string");
					expect(customData).to.be.undefined;
					done();
				}
			}).enqueue( conn.absoluteUrl+"/fixtures/index.html" );
		});
		
		
		
		it("end", function(done)
		{
			new SiteChecker( utils.options(),
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
		describe("numActiveLinks()", function()
		{
			it("should work", function(done)
			{
				var htmlCalled = false;
				
				var instance = new SiteChecker( utils.options(),
				{
					html: function(pageUrl, customData)	// undocumented event
					{
						if (htmlCalled === true) return;  // skip recursive checks
						
						expect(pageUrl).to.be.a("string");
						
						// Give time for link checks to start
						setImmediate( function()
						{
							expect( instance.numActiveLinks() ).to.equal(2);
							htmlCalled = true;
						});
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
		
		
		
		describe("numQueuedLinks()", function()
		{
			it.skip("should work", function(done)
			{
				done();
			});
		});
	});
	
	
	
	describe("edge cases", function()
	{
		it("should support custom data", function(done)
		{
			var linkCalled = false;
			var pageCalled = false;
			var siteCalled = false;
			
			new SiteChecker( utils.options(),
			{
				link: function(result, customData)
				{
					expect(customData).to.be.an.instanceOf(Object);
					expect(customData.test).to.equal("value");
					linkCalled = true;
				},
				page: function(error, htmlUrl, customData)
				{
					expect(customData).to.be.an.instanceOf(Object);
					expect(customData.test).to.equal("value");
					pageCalled = true;
				},
				site: function(error, siteUrl, customData)
				{
					expect(customData).to.be.an.instanceOf(Object);
					expect(customData.test).to.equal("value");
					siteCalled = true;
				},
				end: function()
				{
					expect(linkCalled).to.be.true;
					expect(pageCalled).to.be.true;
					expect(siteCalled).to.be.true;
					done();
				}
			}).enqueue( conn.absoluteUrl+"/fixtures/index.html", {test:"value"} );
		});
		
		
		
		it("should support multiple queue items", function(done)
		{
			var pageIndex = 0;
			var results = [];
			
			var instance = new SiteChecker( utils.options(),
			{
				link: function(result, customData)
				{
					if (results[ customData.siteIndex ] === undefined)
					{
						results[ customData.siteIndex ] = [];
					}
					
					if (results[ customData.siteIndex ][pageIndex] === undefined)
					{
						results[ customData.siteIndex ][pageIndex] = [];
					}
					
					results[ customData.siteIndex ][pageIndex][ result.html.index ] = result;
				},
				page: function(error, pageUrl, customData)
				{
					expect(error).to.be.null;
					
					// If first page didn't load
					if (results[ customData.siteIndex ] === undefined)
					{
						// Makes array more human-understandable
						results[ customData.siteIndex ] = [];
					}
					
					// If first page didn't load
					// If first page did load but had no links
					if (results[ customData.siteIndex ][pageIndex] === undefined)
					{
						// Makes array more human-understandable
						results[ customData.siteIndex ][pageIndex] = [];
					}
					
					pageIndex++;
				},
				site: function(error, siteUrl, customData)
				{
					expect(error).to.be.null;
					
					pageIndex = 0;
				},
				end: function()
				{
					expect(results).to.have.length(2);
					
					expect(results[0]).to.have.length(3);         // site (with pages checked)
					expect(results[0][0]).to.have.length(2);      // page -- index.html
					expect(results[0][0][0].broken).to.be.false;  // link -- page-with-links.html
					expect(results[0][0][1].broken).to.be.true;   // link -- page-fake.html
					expect(results[0][1]).to.have.length(2);      // page -- page-with-links.html
					expect(results[0][1][0].broken).to.be.false;  // link -- page-no-links.html
					expect(results[0][1][1].broken).to.be.true;   // link -- page-fake.html
					expect(results[0][2]).to.have.length(0);      // page -- page-no-links.html
					
					expect(results[1]).to.have.length(3);         // site (with pages checked)
					expect(results[1][0]).to.have.length(2);      // page -- index.html
					expect(results[1][0][0].broken).to.be.false;  // link -- page-with-links.html
					expect(results[1][0][1].broken).to.be.true;   // link -- page-fake.html
					expect(results[1][1]).to.have.length(2);      // page -- page-with-links.html
					expect(results[1][1][0].broken).to.be.false;  // link -- page-no-links.html
					expect(results[1][1][1].broken).to.be.true;   // link -- page-fake.html
					expect(results[1][2]).to.have.length(0);      // page -- page-no-links.html
					
					done();
				}
			});
			
			instance.enqueue( conn.absoluteUrl+"/fixtures/index.html", {siteIndex:0} );
			instance.enqueue( conn.absoluteUrl+"/fixtures/index.html", {siteIndex:1} );
		});
		
		
		
		it("should support html with no links", function(done)
		{
			var count = 0;
			var pageCalled = false;
			var siteCalled = false;
			
			new SiteChecker( utils.options(),
			{
				link: function()
				{
					count++;
				},
				page: function()
				{
					pageCalled = true;
				},
				site: function()
				{
					siteCalled = true;
				},
				end: function()
				{
					expect(pageCalled).to.be.true;
					expect(siteCalled).to.be.true;
					expect(count).to.equal(0);
					done();
				}
			}).enqueue( conn.absoluteUrl+"/fixtures/page-no-links.html" );
		});
		
		
		
		it("should support pages after html with no links", function(done)
		{
			var linkCount = 0;
			var pageCount = 0;
			var siteCount = 0;
			
			var instance = new SiteChecker( utils.options(),
			{
				link: function()
				{
					linkCount++;
				},
				page: function(error, pageUrl)
				{
					pageCount++;
				},
				site: function()
				{
					siteCount++;
				},
				end: function()
				{
					expect(linkCount).to.equal(4);
					expect(pageCount).to.equal(4);  // page-no-links.html is checked twice because they're part of two different site queue items
					expect(siteCount).to.equal(2);
					done();
				}
			});

			instance.enqueue( conn.absoluteUrl+"/fixtures/page-no-links.html" );
			instance.enqueue( conn.absoluteUrl+"/fixtures/index.html" );
		});
		
		
		
		it("should report error when html could not be retrieved", function(done)
		{
			var pageCalled = false;
			var siteCalled = false;
			
			new SiteChecker( utils.options(),
			{
				page: function(error, htmlUrl, customData)
				{
					expect(error).to.be.an.instanceOf(Error);
					expect(htmlUrl).to.be.a("string");
					pageCalled = true;
				},
				site: function(error, siteUrl, customData)
				{
					expect(error).to.be.an.instanceOf(Error);
					expect(siteUrl).to.be.a("string");
					siteCalled = true;
				},
				end: function()
				{
					expect(pageCalled).to.be.true;
					expect(siteCalled).to.be.true;
					done();
				}
			}).enqueue( conn.absoluteUrl+"/fixtures/page-fake.html" );
		});
		
		
		
		// TODO :: should support pages after html could not be retrieved
	});
});
