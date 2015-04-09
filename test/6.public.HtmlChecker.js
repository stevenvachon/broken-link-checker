"use strict";
var HtmlChecker = require("../lib/public/HtmlChecker");

var utils = require("./utils");

var expect = require("chai").expect;
var fs = require("fs");

var baseUrl,conn,htmlString;



describe("PUBLIC -- HtmlChecker", function()
{
	before( function(done)
	{
		utils.startConnection( function(connection)
		{
			conn = connection;
			baseUrl = conn.absoluteUrl+"/fixtures/index.html";
			htmlString = fs.readFileSync(__dirname+"/fixtures/index.html", {encoding:"utf8"});
			done();
		});
	});
	
	
	
	after( function(done)
	{
		utils.stopConnection(conn.realPort, done);
	});
	
	
	
	describe("methods (#1)", function()
	{
		describe("scan()", function()
		{
			it("should work when ready", function(done)
			{
				var scanning = new HtmlChecker( utils.options() ).scan(htmlString, baseUrl);
				
				expect(scanning).to.be.true;
				done();
			});
			
			
			
			it("should report if not ready", function(done)
			{
				var instance = new HtmlChecker( utils.options() );
				
				instance.scan(htmlString, baseUrl);
				
				var concurrentScan = instance.scan(htmlString, baseUrl);
				
				expect(concurrentScan).to.be.false;
				done();
			});
		});
	});
	
	
	
	describe("handlers", function()
	{
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
			}).scan(htmlString, baseUrl);
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
			}).scan(htmlString, baseUrl);
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
				
				instance.scan(htmlString, baseUrl);
				
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
				
				instance.scan(htmlString, baseUrl);
				
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
					results[ result.html.index ] = result;
				},
				complete: function()
				{
					expect(results).to.have.length(2);
					expect(results[0].broken).to.be.false;
					expect(results[1].broken).to.be.true;
					done();
				}
			}).scan(htmlString, baseUrl);
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
			}).scan( fs.readFileSync(__dirname+"/fixtures/link-real.html", {encoding:"utf8"}) );
		});
	});
});
