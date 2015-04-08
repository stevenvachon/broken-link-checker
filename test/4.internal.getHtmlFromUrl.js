"use strict";
var getHtmlFromUrl = require("../lib/internal/getHtmlFromUrl");

var utils = require("./utils");

var expect = require("chai").expect;
var fs = require("fs");

var conn;



describe("INTERNAL -- getHtmlFromUrl", function()
{
	before( function(done)
	{
		utils.startConnections( function(connections)
		{
			conn = connections;
			done();
		});
	});
	
	
	
	after( function(done)
	{
		utils.stopConnections(conn.realPorts, done);
	});
	
	
	
	it("should work", function(done)
	{
		getHtmlFromUrl(
			conn.absoluteUrls[0]+"/fixture/link-real.html",
			utils.options(),
			function(error, htmlString, responseUrl)
			{
				expect(error).to.be.null;
				expect(htmlString).to.equal( fs.readFileSync(__dirname+"/fixture/link-real.html",{encoding:"utf8"}) );
				expect(responseUrl).to.equal( conn.absoluteUrls[0]+"/fixture/link-real.html" );
				done();
			}
		);
	});
	
	
	
	it("should report a redirect", function(done)
	{
		getHtmlFromUrl(
			conn.absoluteUrls[0]+"/fixture/redirect.html",
			utils.options(),
			function(error, htmlString, responseUrl)
			{
				expect(error).to.be.null;
				expect(htmlString).to.equal( fs.readFileSync(__dirname+"/fixture/index.html",{encoding:"utf8"}) );
				expect(responseUrl).to.equal( conn.absoluteUrls[0]+"/fixture/index.html" );
				done();
			}
		);
	});
	
	
	
	it("should report a non-html url", function(done)
	{
		getHtmlFromUrl(
			conn.absoluteUrls[0]+"/fixture/image.gif",
			utils.options(),
			function(error, htmlString, responseUrl)
			{
				expect(error).to.be.instanceOf(Error);
				expect(htmlString).to.be.undefined;
				expect(responseUrl).to.equal( conn.absoluteUrls[0]+"/fixture/image.gif" );
				done();
			}
		);
	});
	
	
	
	it("should report a 404", function(done)
	{
		getHtmlFromUrl(
			conn.absoluteUrls[0]+"/fixture/link-fake.html",
			utils.options(),
			function(error, htmlString, responseUrl)
			{
				expect(error).to.be.instanceOf(Error);
				expect(htmlString).to.be.undefined;
				expect(responseUrl).to.be.undefined;
				done();
			}
		);
	});
	
	
	
	it("should report an erroneous url", function(done)
	{
		getHtmlFromUrl(
			"/fixture/link-fake.html",
			utils.options(),
			function(error, htmlString, responseUrl)
			{
				expect(error).to.be.instanceOf(Error);
				expect(htmlString).to.be.undefined;
				expect(responseUrl).to.be.undefined;
				done();
			}
		);
	});
});
