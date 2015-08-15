"use strict";
var HtmlChecker = require("../lib/public/HtmlChecker");

var utils = require("./utils");

var expect = require("chai").expect;
var fs = require("fs");

var allTagsString,baseUrl,commonHtmlString,conn;



describe("PUBLIC -- HtmlChecker", function()
{
	before( function(done)
	{
		utils.startConnections( function(connections)
		{
			conn = connections;
			allTagsString = utils.tagsString(3, conn.absoluteUrls[0]);
			baseUrl = conn.absoluteUrls[0]+"/fixtures/index.html";
			commonHtmlString = fs.readFileSync(__dirname+"/fixtures/index.html", {encoding:"utf8"});
			done();
		});
	});
	
	
	
	after( function(done)
	{
		utils.stopConnections(conn.realPorts, done);
	});
	
	
	
	describe("methods (#1)", function()
	{
		describe("scan()", function()
		{
			it("should work when ready", function(done)
			{
				var scanning = new HtmlChecker( utils.options() ).scan(commonHtmlString, baseUrl);
				
				expect(scanning).to.be.true;
				done();
			});
			
			
			
			it("should report if not ready", function(done)
			{
				var instance = new HtmlChecker( utils.options() );
				
				instance.scan(commonHtmlString, baseUrl);
				
				var concurrentScan = instance.scan(commonHtmlString, baseUrl);
				
				expect(concurrentScan).to.be.false;
				done();
			});
		});
	});
	
	
	
	describe("handlers", function()
	{
		// TODO :: find a way to test "junk" without requiring the use of an option
		
		
		
		it("link", function(done)
		{
			var count = 0;
			
			new HtmlChecker( utils.options(),
			{
				link: function(result)
				{
					// HTML has more than one link, so only accept the first
					// to avoid calling `done()` more than once
					if (++count > 1) return;
					
					expect(arguments).to.have.length(1);
					expect(result).to.be.instanceOf(Object);
					done();
				}
			}).scan(commonHtmlString, baseUrl);
		});
		
		
		
		it("complete", function(done)
		{
			new HtmlChecker( utils.options(),
			{
				complete: function()
				{
					expect(arguments).to.have.length(0);
					done();
				}
			}).scan(commonHtmlString, baseUrl);
		});
	});
	
	
	
	describe("methods (#2)", function()
	{
		describe("numActive()", function()
		{
			it("should work", function(done)
			{
				var instance = new HtmlChecker( utils.options(),
				{
					complete: function()
					{
						expect( instance.numActive() ).to.equal(0);
						done();
					}
				});
				
				instance.scan(commonHtmlString, baseUrl);
				
				expect( instance.numActive() ).to.equal(2);
			});
		});
		
		
		
		describe("pause() / resume()", function()
		{
			it("should work", function(done)
			{
				var resumed = false;
				
				var instance = new HtmlChecker( utils.options(),
				{
					complete: function()
					{
						expect(resumed).to.be.true;
						done();
					}
				});
				
				instance.pause();
				
				instance.scan(commonHtmlString, baseUrl);
				
				// Wait longer than scan should take
				setTimeout( function()
				{
					resumed = true;
					instance.resume();
					
				}, 100);
			});
		});
	});
	
	
	
	describe("edge cases", function()
	{
		it("should support multiple links", function(done)
		{
			var results = [];
			
			new HtmlChecker( utils.options(),
			{
				link: function(result)
				{
					results[ result.html.offsetIndex ] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(2);
					expect(results[0].broken).to.be.false;
					expect(results[1].broken).to.be.true;
					done();
				}
			}).scan(commonHtmlString, baseUrl);
		});
		
		
		
		it("should support html with no links", function(done)
		{
			var count = 0;
			
			new HtmlChecker( utils.options(),
			{
				link: function()
				{
					count++;
				},
				complete: function()
				{
					expect(count).to.equal(0);
					done();
				}
			}).scan( fs.readFileSync(__dirname+"/fixtures/link-real.html", {encoding:"utf8"}), baseUrl );
		});
	});
	
	
	
	describe("options", function()
	{
		it("excludedKeywords = []", function(done)
		{
			var htmlString = '<a href="'+conn.absoluteUrls[0]+'">link1</a>';
			htmlString += '<a href="'+conn.absoluteUrls[1]+'">link2</a>';
			
			var results = [];
			
			new HtmlChecker( utils.options(),
			{
				link: function(result)
				{
					results[result.html.offsetIndex] = result;
				},
				junk: function(result)
				{
					done( new Error("this should not have been called") );
				},
				complete: function()
				{
					expect(results).to.have.length(2);
					done();
				}
			}).scan(htmlString, baseUrl);
		});
		
		
		
		it("excludedKeywords = […]", function(done)
		{
			var htmlString = '<a href="'+conn.absoluteUrls[0]+'">link1</a>';
			htmlString += '<a href="'+conn.absoluteUrls[1]+'">link2</a>';
			
			var junkResults = [];
			var results = [];
			
			new HtmlChecker( utils.options({ excludedKeywords:[conn.absoluteUrls[0]] }),
			{
				link: function(result)
				{
					results[result.html.offsetIndex] = result;
				},
				junk: function(result)
				{
					junkResults[result.html.offsetIndex] = result;
				},
				complete: function()
				{
					expect(junkResults).to.have.length(1);
					expect(results).to.have.length(1);
					done();
				}
			}).scan(htmlString, baseUrl);
		});
		
		
		
		it("excludedSchemes = []", function(done)
		{
			var htmlString = '<a href="data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7">link1</a>';
			htmlString += '<a href="geo:0,0">link2</a>';
			htmlString += '<a href="javascript:void(0);">link3</a>';
			htmlString += '<a href="mailto:address@email.com?subject=hello">link4</a>';
			htmlString += '<a href="sms:+5-555-555-5555?body=hello">link5</a>';
			htmlString += '<a href="tel:+5-555-555-5555">link6</a>';
			
			var results = [];
			
			new HtmlChecker( utils.options({ excludedSchemes:[] }),
			{
				link: function(result)
				{
					results[result.html.offsetIndex] = result;
				},
				junk: function(result)
				{
					done( new Error("this should not have been called") );
				},
				complete: function()
				{
					expect(results).to.have.length(6);
					expect(results[0].error).to.be.instanceOf(Error);
					expect(results[1].error).to.be.instanceOf(Error);
					expect(results[2].error).to.be.instanceOf(Error);
					expect(results[3].error).to.be.instanceOf(Error);
					expect(results[4].error).to.be.instanceOf(Error);
					expect(results[5].error).to.be.instanceOf(Error);
					done();
				}
			}).scan(htmlString, baseUrl);
		});
		
		
		
		it('excludedSchemes = ["data","geo","javascript","mailto","sms","tel"]', function(done)
		{
			var htmlString = '<a href="data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7">link1</a>';
			htmlString += '<a href="geo:0,0">link2</a>';
			htmlString += '<a href="javascript:void(0);">link3</a>';
			htmlString += '<a href="mailto:address@email.com?subject=hello">link4</a>';
			htmlString += '<a href="sms:+5-555-555-5555?body=hello">link5</a>';
			htmlString += '<a href="tel:+5-555-555-5555">link6</a>';
			
			var junkResults = [];
			
			// Uses default `excludedSchemes` value to ensure that any change to it will break this test
			new HtmlChecker( utils.options(),
			{
				link: function(result)
				{
					done( new Error("this should not have been called") );
				},
				junk: function(result)
				{
					junkResults[result.html.offsetIndex] = result;
				},
				complete: function()
				{
					expect(junkResults).to.have.length(6);
					expect(junkResults[0].error).to.be.null;
					expect(junkResults[1].error).to.be.null;
					expect(junkResults[2].error).to.be.null;
					expect(junkResults[3].error).to.be.null;
					expect(junkResults[4].error).to.be.null;
					expect(junkResults[5].error).to.be.null;
					done();
				}
			}).scan(htmlString, baseUrl);
		});
		
		
		
		it("excludeExternalLinks = false", function(done)
		{
			var htmlString = '<a href="'+conn.absoluteUrls[0]+'">link1</a>';
			htmlString += '<a href="'+conn.absoluteUrls[1]+'">link2</a>';
			
			var results = [];
			
			new HtmlChecker( utils.options(),
			{
				link: function(result)
				{
					results[result.html.offsetIndex] = result;
				},
				junk: function(result)
				{
					done( new Error("this should not have been called") );
				},
				complete: function()
				{
					expect(results).to.have.length(2);
					expect(results[0].internal).to.be.true;
					expect(results[1].internal).to.be.false;
					done();
				}
			}).scan(htmlString, baseUrl);
		});
		
		
		
		it("excludeExternalLinks = true", function(done)
		{
			var htmlString = '<a href="'+conn.absoluteUrls[0]+'">link1</a>';
			htmlString += '<a href="'+conn.absoluteUrls[1]+'">link2</a>';
			
			var junkResults = [];
			var results = [];
			
			new HtmlChecker( utils.options({ excludeExternalLinks:true }),
			{
				link: function(result)
				{
					results[result.html.offsetIndex] = result;
				},
				junk: function(result)
				{
					junkResults[result.html.offsetIndex] = result;
				},
				complete: function()
				{
					expect(junkResults).to.have.length(1);
					expect(junkResults[0].internal).to.be.false;
					expect(junkResults[0].html.text).to.equal("link2");
					
					expect(results).to.have.length(1);
					expect(results[0].internal).to.be.true;
					expect(results[0].html.text).to.equal("link1");
					
					done();
				}
			}).scan(htmlString, baseUrl);
		});
		
		
		
		it("excludeInternalLinks = false", function(done)
		{
			var htmlString = '<a href="'+conn.absoluteUrls[0]+'">link1</a>';
			htmlString += '<a href="/">link2</a>';
			htmlString += '<a href="#hash">link3</a>';
			
			var results = [];
			
			new HtmlChecker( utils.options(),
			{
				link: function(result)
				{
					results[result.html.offsetIndex] = result;
				},
				junk: function(result)
				{
					done( new Error("this should not have been called") );
				},
				complete: function()
				{
					expect(results).to.have.length(3);
					expect(results[0].internal).to.be.true;
					expect(results[1].internal).to.be.true;
					expect(results[2].internal).to.be.true;
					done();
				}
			}).scan(htmlString, baseUrl);
		});
		
		
		
		it("excludeInternalLinks = true", function(done)
		{
			var htmlString = '<a href="'+conn.absoluteUrls[0]+'">link1</a>';
			htmlString += '<a href="/">link2</a>';
			htmlString += '<a href="#hash">link3</a>';
			
			var junkResults = [];
			
			new HtmlChecker( utils.options({ excludeInternalLinks:true }),
			{
				link: function(result)
				{
					done( new Error("this should not have been called") );
				},
				junk: function(result)
				{
					junkResults[result.html.offsetIndex] = result;
				},
				complete: function()
				{
					expect(junkResults).to.have.length(3);
					expect(junkResults[0].internal).to.be.true;
					expect(junkResults[1].internal).to.be.true;
					expect(junkResults[2].internal).to.be.true;
					done();
				}
			}).scan(htmlString, baseUrl);
		});
		
		
		
		it("excludeLinksToSamePage = false", function(done)
		{
			var htmlString = '<a href="'+baseUrl+'">link1</a>';
			htmlString += '<a href="/">link2</a>';
			htmlString += '<a href="?query">link3</a>';
			htmlString += '<a href="#hash">link4</a>';
			
			var results = [];
			
			new HtmlChecker( utils.options(),
			{
				link: function(result)
				{
					results[result.html.offsetIndex] = result;
				},
				junk: function(result)
				{
					done( new Error("this should not have been called") );
				},
				complete: function()
				{
					expect(results).to.have.length(4);
					expect(results[0].samePage).to.be.true;
					expect(results[1].samePage).to.be.false;
					expect(results[2].samePage).to.be.false;
					expect(results[3].samePage).to.be.true;
					done();
				}
			}).scan(htmlString, baseUrl);
		});
		
		
		
		it("excludeLinksToSamePage = true", function(done)
		{
			var htmlString = '<a href="'+baseUrl+'">link1</a>';
			htmlString += '<a href="/">link2</a>';
			htmlString += '<a href="?query">link3</a>';
			htmlString += '<a href="#hash">link4</a>';
			
			var junkResults = [];
			var results = [];
			
			new HtmlChecker( utils.options({ excludeLinksToSamePage:true }),
			{
				link: function(result)
				{
					results[result.html.offsetIndex] = result;
				},
				junk: function(result)
				{
					junkResults[result.html.offsetIndex] = result;
				},
				complete: function()
				{
					expect(junkResults).to.have.length(2);
					expect(junkResults[0].samePage).to.be.true;
					expect(junkResults[0].html.text).to.equal("link1");
					expect(junkResults[1].samePage).to.be.true;
					expect(junkResults[1].html.text).to.equal("link4");
					
					expect(results).to.have.length(2);
					expect(results[0].samePage).to.be.false;
					expect(results[0].html.text).to.equal("link2");
					expect(results[1].samePage).to.be.false;
					expect(results[1].html.text).to.equal("link3");
					
					done();
				}
			}).scan(htmlString, baseUrl);
		});
		
		
		
		it("filterLevel = 0", function(done)
		{
			var junkResults = [];
			var results = [];
			
			new HtmlChecker( utils.options({ filterLevel:0 }),
			{
				link: function(result)
				{
					results[result.html.offsetIndex] = result;
				},
				junk: function(result)
				{
					junkResults[result.html.offsetIndex] = result;
				},
				complete: function()
				{
					expect(junkResults).to.have.length(20);
					expect(results).to.have.length(2);
					done();
				}
			}).scan(allTagsString, baseUrl);
		});
		
		
		
		it("filterLevel = 1", function(done)
		{
			var junkResults = [];
			var results = [];
			
			new HtmlChecker( utils.options({ filterLevel:1 }),
			{
				link: function(result)
				{
					results[result.html.offsetIndex] = result;
				},
				junk: function(result)
				{
					junkResults[result.html.offsetIndex] = result;
				},
				complete: function()
				{
					expect(junkResults).to.have.length(9);
					expect(results).to.have.length(13);
					done();
				}
			}).scan(allTagsString, baseUrl);
		});
		
		
		
		it("filterLevel = 2", function(done)
		{
			var junkResults = [];
			var results = [];
			
			new HtmlChecker( utils.options({ filterLevel:2 }),
			{
				link: function(result)
				{
					results[result.html.offsetIndex] = result;
				},
				junk: function(result)
				{
					junkResults[result.html.offsetIndex] = result;
				},
				complete: function()
				{
					expect(junkResults).to.have.length(6);
					expect(results).to.have.length(16);
					done();
				}
			}).scan(allTagsString, baseUrl);
		});
		
		
		
		it("filterLevel = 3", function(done)
		{
			var results = [];
			
			new HtmlChecker( utils.options(),
			{
				link: function(result)
				{
					results[result.html.offsetIndex] = result;
				},
				junk: function(result)
				{
					done( new Error("this should not have been called") );
				},
				complete: function()
				{
					expect(results).to.have.length(22);
					done();
				}
			}).scan(allTagsString, baseUrl);
		});
	});
});
