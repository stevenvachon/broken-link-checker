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
	
	
	
	it("should work", function(done)
	{
		var results = [];
		
		new HtmlUrlChecker( utils.options(),
		{
			link: function(result)
			{
				results[ result.html.index ] = result;
			},
			end: function()
			{
				expect(results).to.have.length(2);
				expect(results[0].broken).to.be.false;
				expect(results[1].broken).to.be.true;
				done();
			}
		}).enqueue(conn.absoluteUrl+"/fixture/index.html");
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
		
		instance.enqueue(conn.absoluteUrl+"/fixture/index.html", {index:0});
		instance.enqueue(conn.absoluteUrl+"/fixture/index.html", {index:1});
	});
});
