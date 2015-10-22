"use strict";
var linkObj = require("../lib/internal/linkObj");

var urlTests = require("./json/linkObj.json");
var utils    = require("./utils");

var expect = require("chai").expect;

var options = utils.options();



describe("INTERNAL -- linkObj", function()
{
	describe("linkObj()", function()
	{
		it("should work", function()
		{
			var link = linkObj("http://fakeurl.com/");
			
			expect(link).to.be.like(
			{
				base: {},
				broken_link_checker: true,
				html: {},
				http: {},
				url: {}
			});
		});
	});
	
	
	
	describe("linkObj.clean()", function()
	{
		it("should work", function()
		{
			var link = linkObj("http://fakeurl.com");
			
			linkObj.clean(link);
			
			expect(link.broken_link_checker).to.be.undefined;
		});
	});
	
	
	
	describe("linkObj.resolve()", function()
	{
		it("should work", function()
		{
			var linkUrl = "http://fakeurl.com";
			var link = linkObj(linkUrl);
			
			linkObj.resolve(link, linkUrl, options);
			
			expect(link).to.be.like(
			{
				url:
				{
					original: linkUrl,
					resolved: linkUrl+"/",
					redirected: null,
					parsed: { protocol:"http:" }
				},
				base:
				{
					original: linkUrl,
					resolved: linkUrl+"/",
					parsed: {}
				},
				html: { tag:null },  // No HTML has been parsed
				http: { statusCode:null },  // No request has been made
				internal: true,
				samePage: true,
				error: null,
				broken_link_checker: true
			});
		});
		
		
		
		for (var test in urlTests)
		{
			var data = urlTests[test];
			var skipOrOnly = data.skipOrOnly==null ? "" : "."+data.skipOrOnly;
			var title = "should "+ (data.resolvedUrl!==null ? "accept " : "reject ") + utils.a_an(test) + " "+utils.addSlashes(test);
			
			var code = "";
			code  = 'it'+skipOrOnly+'("'+title+'", function()\n';
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
			code += '});\n';
			
			eval(code);
		}
		
		
		
		it("should accept a base with a scheme/protocol not specified as accepted", function()
		{
			var baseUrl = "smtp://fakeurl.com/";
			var linkUrl = "http://fakeurl.com/";
			var link = linkObj(linkUrl);
			
			linkObj.resolve(link, baseUrl, options);
			
			expect(link).to.be.like(
			{
				url:
				{
					resolved: linkUrl
				},
				base:
				{
					original: baseUrl,
					resolved: baseUrl
				},
				internal: false,
				samePage: false
			});
		});
		
		
		
		it("should accept an html base with a scheme/protocol not specified as accepted", function()
		{
			var baseUrl     = "http://fakeurl.com/";
			var htmlBaseUrl = "smtp://fakeurl.com/";
			var linkUrl     = "http://fakeurl.com/";
			
			var link = linkObj(linkUrl);
			link.html.base = htmlBaseUrl;
			
			linkObj.resolve(link, baseUrl, options);
			
			expect(link).to.be.like(
			{
				url:
				{
					resolved: linkUrl
				},
				base:
				{
					original: baseUrl,
					resolved: htmlBaseUrl
				},
				internal: true,
				samePage: true
			});
		});
		
		
		
		it("should reject an absolute url with a scheme/protocol not specified as accepted", function()
		{
			var baseUrl = "http://fakeurl.com/";
			var linkUrl = "smtp://fakeurl.com/";
			var link = linkObj(linkUrl);
			
			linkObj.resolve(link, baseUrl, options);
			
			expect(link).to.be.like(
			{
				url:
				{
					original: linkUrl,
					resolved: null
				},
				internal: false,
				samePage: false
			});
		});
		
		
		
		it("should reject a relative url with a base containing a scheme/protocol not specified as accepted", function()
		{
			var baseUrl = "smtp://fakeurl.com/";
			var linkUrl = "path/resource.html?query#hash";
			var link = linkObj(linkUrl);
			
			linkObj.resolve(link, baseUrl, options);
			
			expect(link).to.be.like(
			{
				url:
				{
					original: linkUrl,
					resolved: null
				},
				base:
				{
					original: baseUrl,
					resolved: baseUrl
				},
				internal: null,
				samePage: null
			});
		});
	});
});
