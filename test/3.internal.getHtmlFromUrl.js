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
		getHtmlFromUrl(
			conn.absoluteUrl+"/fixtures/link-real.html",
			utils.options(),
			function(error, htmlString, responseUrl)
			{
				expect(error).to.be.null;
				expect(htmlString).to.equal( fs.readFileSync(__dirname+"/fixtures/link-real.html",{encoding:"utf8"}) );
				expect(responseUrl).to.equal( conn.absoluteUrl+"/fixtures/link-real.html" );
				done();
			}
		);
	});
	
	
	
	it("should report a redirect", function(done)
	{
		getHtmlFromUrl(
			conn.absoluteUrl+"/fixtures/redirect.html",
			utils.options(),
			function(error, htmlString, responseUrl)
			{
				expect(error).to.be.null;
				expect(htmlString).to.equal( fs.readFileSync(__dirname+"/fixtures/index.html",{encoding:"utf8"}) );
				expect(responseUrl).to.equal( conn.absoluteUrl+"/fixtures/index.html" );
				done();
			}
		);
	});
	
	
	
	it("should report a non-html url", function(done)
	{
		getHtmlFromUrl(
			conn.absoluteUrl+"/fixtures/image.gif",
			utils.options(),
			function(error, htmlString, responseUrl)
			{
				expect(error).to.be.instanceOf(Error);
				expect(htmlString).to.be.undefined;
				expect(responseUrl).to.equal( conn.absoluteUrl+"/fixtures/image.gif" );
				done();
			}
		);
	});
	
	
	
	it("should report a 404", function(done)
	{
		getHtmlFromUrl(
			conn.absoluteUrl+"/fixtures/link-fake.html",
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
			"/fixtures/link-fake.html",
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
