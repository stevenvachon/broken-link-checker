"use strict";
var linkObj = require("../lib/internal/linkObj");

var urlTests = require("./json/linkObj.json");
var utils    = require("./utils");

var chai = require("chai");

var expect = chai.expect;
chai.config.includeStack = true;

var options = utils.options();



describe("INTERNAL -- linkObj", function()
{
	describe("linkObj()", function()
	{
		it("should work", function(done)
		{
			var link = linkObj("http://fakeurl.com/");
			
			expect(link).to.be.instanceOf(Object);
			expect(link.base).to.be.instanceOf(Object);
			expect(link.broken_link_checker).to.be.true;
			expect(link.html).to.be.instanceOf(Object);
			expect(link.http).to.be.instanceOf(Object);
			expect(link.url).to.be.instanceOf(Object);
			done();
		});
	});
	
	
	
	describe("linkObj.clean()", function()
	{
		it("should work", function(done)
		{
			var link = linkObj("http://fakeurl.com");
			
			linkObj.clean(link);
			
			expect(link.broken_link_checker).to.be.undefined;
			done();
		});
	});
	
	
	
	describe("linkObj.resolve()", function()
	{
		it("should work", function(done)
		{
			var linkUrl = "http://fakeurl.com";
			var link = linkObj(linkUrl);
			
			linkObj.resolve(link, linkUrl, options);
			
			expect(link.url.original).to.equal(linkUrl);
			expect(link.url.resolved).to.equal(linkUrl+"/");
			expect(link.url.redirected).to.be.null;
			expect(link.url.parsed).to.be.instanceOf(Object);
			expect(link.url.parsed.protocol).to.equal("http:");
			
			expect(link.base.original).to.equal(linkUrl);
			expect(link.base.resolved).to.equal(linkUrl+"/");
			expect(link.base.parsed).to.be.instanceOf(Object);
			
			expect(link.html.tag).to.be.null;  // No HTML has been parsed
			expect(link.http.statusCode).to.be.null;  // No request has been made
			
			expect(link.internal).to.be.true;
			expect(link.samePage).to.be.true;
			expect(link.error).to.be.null;
			expect(link.broken_link_checker).to.be.true;
			
			done();
		});
		
		
		
		for (var test in urlTests)
		{
			var data = urlTests[test];
			var skipOrOnly = data.skipOrOnly==null ? "" : "."+data.skipOrOnly;
			var title = "should "+ (data.resolvedUrl!==null ? "accept " : "reject ") + utils.a_an(test) + " "+test;
			
			var code = "";
			code  = 'it'+skipOrOnly+'("'+title+'", function(done)\n';
			code += '{\n';
			code += '	var baseUrl     = '+utils.format(data.baseUrl)+';\n';
			code += '	var htmlBaseUrl = '+utils.format(data.htmlBaseUrl)+';\n';
			code += '	var linkUrl     = '+utils.format(data.linkUrl)+';\n';
			code += '	\n';
			code += '	var link = linkObj(linkUrl);\n';
			code += '	if (typeof htmlBaseUrl==="string") link.html.base = htmlBaseUrl;\n';
			code += '	\n';
			code += '	linkObj.resolve(link, baseUrl, options);\n';
			code += '	\n';
			code += '	expect(link.url.original).to.equal(linkUrl);\n';
			code += '	expect(link.url.resolved).to.equal('+utils.format(data.resolvedLinkUrl)+');\n';
			code += '	\n';
			code += '	expect(link.base.original).to.equal(baseUrl);\n';
			code += '	expect(link.base.resolved).to.equal('+utils.format(data.resolvedBaseUrl)+');\n';
			code += '	\n';
			code += '	if (typeof htmlBaseUrl==="string") expect(link.html.base).to.equal(htmlBaseUrl);\n';
			code += '	\n';
			code += '	expect(link.internal).to.be.'+data.internal+';\n';
			code += '	expect(link.samePage).to.be.'+data.samePage+';\n';
			code += '	\n';
			code += '	done();\n';
			code += '});\n';
			
			eval(code);
		}
		
		
		
		it("should accept a base with a scheme/protocol not specified as accepted", function(done)
		{
			var baseUrl = "smtp://fakeurl.com/";
			var linkUrl = "http://fakeurl.com/";
			var link = linkObj(linkUrl);
			
			linkObj.resolve(link, baseUrl, options);
			
			expect(link.base.original).to.equal(baseUrl);
			expect(link.base.resolved).to.equal(baseUrl);
			expect(link.url.resolved).to.equal(linkUrl);
			expect(link.internal).to.be.false;
			expect(link.samePage).to.be.false;
			done();
		});
		
		
		
		it("should accept an html base with a scheme/protocol not specified as accepted", function(done)
		{
			var baseUrl     = "http://fakeurl.com/";
			var htmlBaseUrl = "smtp://fakeurl.com/";
			var linkUrl     = "http://fakeurl.com/";
			
			var link = linkObj(linkUrl);
			link.html.base = htmlBaseUrl;
			
			linkObj.resolve(link, baseUrl, options);
			
			expect(link.base.original).to.equal(baseUrl);
			expect(link.base.resolved).to.equal(htmlBaseUrl);
			expect(link.url.resolved).to.equal(linkUrl);
			expect(link.internal).to.be.true;
			expect(link.samePage).to.be.true;
			done();
		});
		
		
		
		it("should reject an absolute url with a scheme/protocol not specified as accepted", function(done)
		{
			var baseUrl = "http://fakeurl.com/";
			var linkUrl = "smtp://fakeurl.com/";
			var link = linkObj(linkUrl);
			
			linkObj.resolve(link, baseUrl, options);
			
			expect(link.url.original).to.equal(linkUrl);
			expect(link.url.resolved).to.be.null;
			expect(link.internal).to.be.false;
			expect(link.samePage).to.be.false;
			done();
		});
		
		
		
		it("should reject a relative url with a base containing a scheme/protocol not specified as accepted", function(done)
		{
			var baseUrl = "smtp://fakeurl.com/";
			var linkUrl = "path/resource.html?query#hash";
			var link = linkObj(linkUrl);
			
			linkObj.resolve(link, baseUrl, options);
			
			expect(link.base.original).to.equal(baseUrl);
			expect(link.base.resolved).to.equal(baseUrl);
			expect(link.url.original).to.equal(linkUrl);
			expect(link.url.resolved).to.be.null;
			expect(link.internal).to.be.null;
			expect(link.samePage).to.be.null;
			done();
		});
	});
});
