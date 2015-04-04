"use strict";
var HtmlChecker = require("../lib/public/HtmlChecker");

var utils = require("./utils");

var expect = require("chai").expect;
var fs = require("fs");

var conn;



describe("PUBLIC -- HtmlChecker", function()
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
		var baseUrl = conn.absoluteUrl+"/fixture/index.html";
		var htmlString = fs.readFileSync(__dirname+"/fixture/index.html", {encoding:"utf8"});
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
});
