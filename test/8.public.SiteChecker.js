"use strict";
var messages    = require("../lib/internal/messages");
var SiteChecker = require("../lib/public/SiteChecker");

var helpers = require("./helpers");

var expect = require("chai").expect;

var conn;



function maybeAddContainers(results, pageIndex, siteIndex)
{
	if (siteIndex != null)
	{
		if (results[siteIndex] === undefined)
		{
			results[siteIndex] = [];
		}
		
		if (results[siteIndex][pageIndex] === undefined)
		{
			results[siteIndex][pageIndex] = [];
		}
	}
	else if (results[pageIndex] === undefined)
	{
		results[pageIndex] = [];
	}
}



describe("PUBLIC -- SiteChecker", function()
{
	before( function()
	{
		return helpers.startConnections().then( function(connections)
		{
			conn = connections;
		});
	});
	
	
	
	after( function()
	{
		return helpers.stopConnections(conn.realPorts);
	});
	
	
	
	describe("methods (#1)", function()
	{
		describe("enqueue()", function()
		{
			it("accepts a valid url", function()
			{
				var id = new SiteChecker( helpers.options() ).enqueue( conn.absoluteUrls[0] );
				
				expect(id).to.not.be.an.instanceOf(Error);
			});
			
			
			
			it("rejects an invalid url", function()
			{
				var id = new SiteChecker( helpers.options() ).enqueue("/path/");
				
				expect(id).to.be.an.instanceOf(Error);
			});
		});
	});
	
	
	
	// TODO :: find a way to test "robots" without requiring the use of an option
	describe("handlers", function()
	{
		it("html", function(done)
		{
			var count = 0;
			
			new SiteChecker( helpers.options(),
			{
				html: function(tree, robots, response, pageUrl, customData)
				{
					// HTML has more than one link/page, so only accept the first
					// to avoid calling `done()` more than once
					if (++count > 1) return;
					
					expect(tree).to.be.an.instanceOf(Object);
					expect(response).to.be.an.instanceOf(Object);
					expect(pageUrl).to.be.a("string");
					expect(customData).to.be.a("number");
					done();
				}
			}).enqueue( conn.absoluteUrls[0]+"/normal/index.html", 123 );
		});
		
		
		
		it("link", function(done)
		{
			var count = 0;
			
			new SiteChecker( helpers.options(),
			{
				link: function(result, customData)
				{
					// HTML has more than one link, so only accept the first
					// to avoid calling `done()` more than once
					if (++count > 1) return;
					
					expect(arguments).to.have.length(2);
					expect(result).to.be.an.instanceOf(Object);
					expect(customData).to.be.a("number");
					done();
				}
			}).enqueue( conn.absoluteUrls[0]+"/normal/index.html", 123 );
		});
		
		
		
		it("page", function(done)
		{
			var count = 0;
			
			new SiteChecker( helpers.options(),
			{
				page: function(error, pageUrl, customData)
				{
					// Site has more than one page, so only accept the first
					// to avoid calling `done()` more than once
					if (++count > 1) return;
					
					expect(arguments).to.have.length(3);
					expect(error).to.be.null;
					expect(pageUrl).to.be.a("string");
					expect(customData).to.be.a("number");
					done();
				}
			}).enqueue( conn.absoluteUrls[0]+"/normal/index.html", 123 );
		});
		
		
		
		it("site", function(done)
		{
			new SiteChecker( helpers.options(),
			{
				site: function(error, siteUrl, customData)
				{
					expect(arguments).to.have.length(3);
					expect(error).to.be.null;
					expect(siteUrl).to.be.a("string");
					expect(customData).to.be.a("number");
					done();
				}
			}).enqueue( conn.absoluteUrls[0]+"/normal/index.html", 123 );
		});
		
		
		
		it("end", function(done)
		{
			new SiteChecker( helpers.options(),
			{
				end: function()
				{
					expect(arguments).to.have.length(0);
					done();
				}
			}).enqueue( conn.absoluteUrls[0]+"/normal/index.html" );
		});
	});
	
	
	
	describe("methods (#2)", function()
	{
		describe("numActiveLinks()", function()
		{
			it("works", function(done)
			{
				var htmlCalled = false;
				
				var instance = new SiteChecker( helpers.options(),
				{
					html: function()
					{
						if (htmlCalled === true) return;  // skip recursive checks
						
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
				
				instance.enqueue( conn.absoluteUrls[0]+"/normal/index.html" );
				
				expect( instance.numActiveLinks() ).to.equal(0);
			});
		});
		
		
		
		describe("pause() / resume()", function()
		{
			it("works", function(done)
			{
				var resumed = false;
				
				var instance = new SiteChecker( helpers.options(),
				{
					end: function()
					{
						expect(resumed).to.be.true;
						done();
					}
				});
				
				instance.pause();
				
				instance.enqueue( conn.absoluteUrls[0] );
				
				// Wait longer than scan should take
				setTimeout( function()
				{
					resumed = true;
					instance.resume();
					
				}, 100);
			});
		});
		
		
		
		// TODO :: test what happens when the current queue item is dequeued
		describe("dequeue() / numSites() / numPages() / numQueuedLinks()", function()
		{
			it("accepts a valid id", function(done)
			{
				var instance = new SiteChecker( helpers.options(),
				{
					end: function()
					{
						expect( instance.numSites() ).to.equal(0);
						expect( instance.numPages() ).to.equal(0);
						expect( instance.numQueuedLinks() ).to.equal(0);
						done();
					}
				});
				
				// Prevent first queued item from immediately starting (and thus being auto-dequeued)
				instance.pause();
				
				var id = instance.enqueue( conn.absoluteUrls[0]+"/normal/index.html" );
				
				expect(id).to.not.be.an.instanceOf(Error);
				expect( instance.numSites() ).to.equal(1);
				expect( instance.numPages() ).to.equal(0);
				expect( instance.numQueuedLinks() ).to.equal(0);
				expect( instance.dequeue(id) ).to.be.true;
				expect( instance.numSites() ).to.equal(0);
				expect( instance.numPages() ).to.equal(0);
				expect( instance.numQueuedLinks() ).to.equal(0);
				
				instance.enqueue( conn.absoluteUrls[0]+"/normal/index.html" );
				instance.resume();
				
				// Wait for HTML to be downloaded and parsed
				setImmediate( function()
				{
					expect( instance.numSites() ).to.equal(1);
					expect( instance.numPages() ).to.equal(1);
					expect( instance.numQueuedLinks() ).to.equal(2);
				});
			});
			
			
			
			it("rejects an invalid id", function()
			{
				var instance = new SiteChecker( helpers.options() );
				
				// Prevent first queued item from immediately starting (and thus being auto-dequeued)
				instance.pause();
				
				var id = instance.enqueue( conn.absoluteUrls[0] );
				
				expect( instance.dequeue(id+1) ).to.be.an.instanceOf(Error);
				expect( instance.numSites() ).to.equal(1);
			});
		});
	});
	
	
	
	describe("edge cases", function()
	{
		it("supports custom data", function(done)
		{
			var linkCalled = false;
			var pageCalled = false;
			var siteCalled = false;
			
			new SiteChecker( helpers.options(),
			{
				link: function(result, customData)
				{
					expect(customData).to.be.an.instanceOf(Object);
					expect(customData.test).to.equal("value");
					linkCalled = true;
				},
				page: function(error, pageUrl, customData)
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
			}).enqueue( conn.absoluteUrls[0]+"/normal/index.html", {test:"value"} );
		});
		
		
		
		it("supports multiple queue items", function(done)
		{
			var pageIndex = 0;
			var results = [];
			
			var instance = new SiteChecker( helpers.options(),
			{
				link: function(result, customData)
				{
					maybeAddContainers(results, pageIndex, customData.siteIndex);
					
					results[ customData.siteIndex ][pageIndex][ result.html.index ] = result;
				},
				page: function(error, pageUrl, customData)
				{
					expect(error).to.be.null;
					
					// If first page didn't load
					// If first page did load but had no links
					maybeAddContainers(results, pageIndex, customData.siteIndex);
					
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
					expect(results[0][0][0].broken).to.be.false;  // link -- with-links.html
					expect(results[0][0][1].broken).to.be.true;   // link -- fake.html
					expect(results[0][1]).to.have.length(2);      // page -- with-links.html
					expect(results[0][1][0].broken).to.be.false;  // link -- no-links.html
					expect(results[0][1][1].broken).to.be.true;   // link -- fake.html
					expect(results[0][2]).to.have.length(0);      // page -- no-links.html
					
					expect(results[1]).to.have.length(3);         // site (with pages checked)
					expect(results[1][0]).to.have.length(2);      // page -- index.html
					expect(results[1][0][0].broken).to.be.false;  // link -- with-links.html
					expect(results[1][0][1].broken).to.be.true;   // link -- fake.html
					expect(results[1][1]).to.have.length(2);      // page -- with-links.html
					expect(results[1][1][0].broken).to.be.false;  // link -- no-links.html
					expect(results[1][1][1].broken).to.be.true;   // link -- fake.html
					expect(results[1][2]).to.have.length(0);      // page -- no-links.html
					
					done();
				}
			});
			
			instance.enqueue( conn.absoluteUrls[0]+"/normal/index.html", {siteIndex:0} );
			instance.enqueue( conn.absoluteUrls[0]+"/normal/index.html", {siteIndex:1} );
		});
		
		
		
		it("supports html with no links", function(done)
		{
			var linkCount = 0;
			var pageCalled = false;
			var siteCalled = false;
			
			new SiteChecker( helpers.options(),
			{
				link: function()
				{
					linkCount++;
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
					expect(linkCount).to.equal(0);
					done();
				}
			}).enqueue( conn.absoluteUrls[0]+"/normal/no-links.html" );
		});
		
		
		
		it("supports pages after html with no links", function(done)
		{
			var linkCount = 0;
			var pageCount = 0;
			var siteCount = 0;
			
			var instance = new SiteChecker( helpers.options(),
			{
				link: function()
				{
					linkCount++;
				},
				page: function()
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
					expect(pageCount).to.equal(4);  // no-links.html is checked twice because they're part of two different site queue items
					expect(siteCount).to.equal(2);
					done();
				}
			});

			instance.enqueue( conn.absoluteUrls[0]+"/normal/no-links.html" );
			instance.enqueue( conn.absoluteUrls[0]+"/normal/index.html" );
		});
		
		
		
		it("reports a page+site error when first page's html cannot be retrieved", function(done)
		{
			var pageCalled = false;
			var siteCalled = false;
			
			new SiteChecker( helpers.options(),
			{
				page: function(error, pageUrl, customData)
				{
					expect(error).to.be.an.instanceOf(Error);
					expect(error.message).to.equal( messages.errors.HTML_RETRIEVAL );
					expect(pageUrl).to.be.a("string");
					pageCalled = true;
				},
				site: function(error, siteUrl, customData)
				{
					expect(error).to.be.an.instanceOf(Error);
					expect(error.message).to.equal( messages.errors.HTML_RETRIEVAL );
					expect(siteUrl).to.be.a("string");
					siteCalled = true;
				},
				end: function()
				{
					expect(pageCalled).to.be.true;
					expect(siteCalled).to.be.true;
					done();
				}
			}).enqueue( conn.absoluteUrls[0]+"/normal/fake.html" );
		});
		
		
		
		it("does not report site error when non-first page's html cannot be retrieved", function(done)
		{
			var pageCount = 0;
			
			new SiteChecker( helpers.options(),
			{
				page: function(error, pageUrl, customData)
				{
					if (++pageCount < 3)
					{
						expect(error).to.not.be.an.instanceOf(Error);
					}
					else
					{
						expect(error).to.be.an.instanceOf(Error);
					}
				},
				site: function(error, siteUrl, customData)
				{
					expect(error).to.not.be.an.instanceOf(Error);
				},
				end: function()
				{
					done();
				}
			}).enqueue( conn.absoluteUrls[0]+"/normal/with-links.html" );
		});
		
		
		
		it("supports sites after first page's html could not be retrieved", function(done)
		{
			var pageCount = 0;
			var siteCount = 0;
			
			var instance = new SiteChecker( helpers.options(),
			{
				page: function(error, pageUrl, customData)
				{
					if (++pageCount === 1)
					{
						expect(error).to.be.an.instanceOf(Error);
					}
					else
					{
						expect(error).to.not.be.an.instanceOf(Error);
					}
				},
				site: function(error, siteUrl, customData)
				{
					if (++siteCount === 1)
					{
						expect(error).to.be.an.instanceOf(Error);
					}
					else
					{
						expect(error).to.not.be.an.instanceOf(Error);
					}
				},
				end: function()
				{
					expect(pageCount).to.equal(2);
					expect(siteCount).to.equal(2);
					done();
				}
			});
			
			instance.enqueue( conn.absoluteUrls[0]+"/normal/fake.html" );
			instance.enqueue( conn.absoluteUrls[0]+"/normal/no-links.html" );
		});
		
		
		
		it("does not check a page that has already been checked", function(done)
		{
			var pageCount = 0;
			
			new SiteChecker( helpers.options(),
			{
				page: function()
				{
					pageCount++;
				},
				end: function()
				{
					expect(pageCount).to.equal(3);
					done();
				}
			}).enqueue( conn.absoluteUrls[0]+"/circular/index.html" );
		});
		
		
		
		it("does not check a page that redirects to a page that has already been checked", function(done)
		{
			var pageCount = 0;
			
			new SiteChecker( helpers.options(),
			{
				page: function()
				{
					pageCount++;
				},
				end: function()
				{
					expect(pageCount).to.equal(2);
					done();
				}
			}).enqueue( conn.absoluteUrls[0]+"/redirect/index.html" );
		});
		
		
		
		it("does not check a page that redirects to a page that has already been checked (#2)", function(done)
		{
			var pageCount = 0;
			
			new SiteChecker( helpers.options(),
			{
				page: function()
				{
					pageCount++;
				},
				end: function()
				{
					expect(pageCount).to.equal(1);
					done();
				}
			}).enqueue( conn.absoluteUrls[0]+"/circular-redirect/redirect.html" );
		});
		
		
		
		it("does not check a non-first page that redirects to another site", function(done)
		{
			var linkCount = 0;
			var pageCount = 0;
			
			new SiteChecker( helpers.options(),
			{
				link: function(result, customData)
				{
					expect(result.broken).to.be.false;
					linkCount++;
				},
				page: function()
				{
					pageCount++;
				},
				end: function()
				{
					expect(linkCount).to.equal(1);
					expect(pageCount).to.equal(1);
					done();
				}
			}).enqueue( conn.absoluteUrls[0]+"/external-redirect/index.html" );
		});
		
		
		
		it("checks a first page that redirects to another site", function(done)
		{
			var pageCount = 0;
			
			new SiteChecker( helpers.options(),
			{
				page: function(error, pageUrl, customData)
				{
					expect(error).to.not.be.an.instanceOf(Error);
					pageCount++;
				},
				end: function()
				{
					expect(pageCount).to.equal(1);
					done();
				}
			}).enqueue( conn.absoluteUrls[0]+"/external-redirect/redirect.html" );
		});
		
		
		
		// TODO :: does not check a non-first page that redirects to another site when options.excludeInternalLinks=true
	});
	
	
	
	describe("options", function()
	{
		it("honorRobotExclusions = false (robots.txt)", function(done)
		{
			var results = [];
			
			new SiteChecker( helpers.options(),
			{
				robots: function(robots)
				{
					done( new Error("this should not have been called") );
				},
				junk: function(result)
				{
					done( new Error("this should not have been called") );
				},
				link: function(result)
				{
					results[result.html.offsetIndex] = result;
				},
				end: function()
				{
					expect(results).to.have.length(1);
					expect(results[0]).to.be.like(
					{
						broken: false,
						excluded: false,
						excludedReason: null
					});
					done();
				}
			}).enqueue( conn.absoluteUrls[0]+"/disallowed/robots-txt.html" );
		});
		
		
		
		it("honorRobotExclusions = true (robots.txt)", function(done)
		{
			var junkResults = [];
			var robotsCalled = true;
			
			new SiteChecker( helpers.options({ honorRobotExclusions:true }),
			{
				robots: function(robots, customData)
				{
					expect(robots).to.be.an.instanceOf(Object);
					expect(customData).to.be.a("number");
					robotsCalled = true;
				},
				junk: function(result)
				{
					junkResults[result.html.offsetIndex] = result;
				},
				link: function(result)
				{
					done( new Error("this should not have been called") );
				},
				end: function()
				{
					expect(robotsCalled).to.be.true;
					expect(junkResults).to.have.length(1);
					expect(junkResults[0]).to.be.like(
					{
						broken: null,
						excluded: true,
						excludedReason: "BLC_ROBOTS"
					});
					done();
				}
			}).enqueue( conn.absoluteUrls[0]+"/disallowed/robots-txt.html", 123 );
		});
		
		
		
		it("honorRobotExclusions = false (rel + meta + header + robots.txt)", function(done)
		{
			var pageIndex = 0;
			var results = [];
			
			new SiteChecker( helpers.options(),
			{
				robots: function(robots)
				{
					done( new Error("this should not have been called") );
				},
				junk: function(result)
				{
					done( new Error("this should not have been called") );
				},
				link: function(result)
				{
					maybeAddContainers(results, pageIndex);
					
					results[pageIndex][ result.html.index ] = result;
				},
				page: function(error)
				{
					expect(error).to.be.null;
					
					// If first page didn't load
					// If first page did load but had no links
					maybeAddContainers(results, pageIndex);
					
					pageIndex++;
				},
				end: function()
				{
					expect(results).to.have.length(9);
					expect(results).to.all.all.be.like(  // TODO :: https://github.com/chaijs/chai-things/issues/29
					{
						broken: false,
						excluded: false,
						excludedReason: null
					});
					done();
				}
			}).enqueue( conn.absoluteUrls[0]+"/disallowed/index.html" );
		});
		
		
		
		it("honorRobotExclusions = true (rel + meta + header + robots.txt)", function(done)
		{
			var pageIndex = 0;
			var results = [];
			
			new SiteChecker( helpers.options({ honorRobotExclusions:true }),
			{
				junk: function(result)
				{
					maybeAddContainers(results, pageIndex);
					
					results[pageIndex][ result.html.index ] = result;
				},
				link: function(result)
				{
					maybeAddContainers(results, pageIndex);
					
					results[pageIndex][ result.html.index ] = result;
				},
				page: function(error)
				{
					expect(error).to.be.null;
					
					// If first page didn't load
					// If first page did load but had no links
					maybeAddContainers(results, pageIndex);
					
					pageIndex++;
				},
				end: function()
				{
					expect(results).to.have.length(5);
					
					expect(results[0]).to.all.be.like(
					{
						broken: false,
						excluded: false,
						excludedReason: null
					});
					
					// TODO :: https://github.com/chaijs/chai-things/issues/29
					for (var i=1; i<5; i++)
					{
						expect(results[i]).to.all.be.like(
						{
							broken: null,
							excluded: true,
							excludedReason: "BLC_ROBOTS"
						});
					}
					
					done();
				}
			}).enqueue( conn.absoluteUrls[0]+"/disallowed/index.html" );
		});
		
		
		
		// TODO :: honorRobotExcluses=true (rel + meta + header + robots.txt) + userAgent=Googlebot/2.1
	});
});
