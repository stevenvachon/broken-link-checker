"use strict";
var linkObj = require("../lib/internal/linkObj");

var options  = require("./utils").options();
var urlTests = require("./generated/linkObj.json");

var expect = require("chai").expect;



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
			var url = "http://fakeurl.com";
			var link = linkObj(url);
			
			linkObj.resolve(link, url, options);
			
			expect(link.url.original).to.equal(url);
			expect(link.url.resolved).to.equal(url+"/");
			expect(link.url.redirected).to.be.null;
			expect(link.url.parsed).to.be.instanceOf(Object);
			expect(link.url.parsed.protocol).to.equal("http:");
			expect(link.url.parsed.protocolTruncated).to.equal("http");
			
			expect(link.base.original).to.equal(url);
			expect(link.base.resolved).to.equal(url+"/");
			expect(link.base.parsed).to.be.instanceOf(Object);
			
			expect(link.html.tag).to.be.null;	// No HTML has been parsed
			expect(link.http.statusCode).to.be.null;	// No request has been made
			
			expect(link.internal).to.be.true;
			expect(link.samePage).to.be.true;
			expect(link.error).to.be.null;
			expect(link.broken_link_checker).to.be.true;
			
			done();
		});
		
		
		
		function format(input)
		{
			if (typeof input==="string" || input instanceof String)
			{
				var match = /{{([^}]+)}}/.exec(input);
				
				if (match !== null)
				{
					// Variable
					return match[1];
				}
				
				// String
				return '"'+input+'"';
			}
			
			// Rely on JavaScript's internal stringification
			return input;
		}
		
		
		
		for (var test in urlTests)
		{
			var data = urlTests[test];
			var skip = data.skip ? ".skip" : "";
			var title = test +" should "+ (data.shouldWork ? "work" : "not work");
			
			var code = "";
			code  = 'it'+skip+'("'+title+'", function(done)\n';
			code += '{\n';
			code += '	var baseUrl     = '+format(data.baseUrl)+';\n';
			code += '	var htmlBaseUrl = '+format(data.htmlBaseUrl)+';\n';
			code += '	var linkUrl     = '+format(data.linkUrl)+';\n';
			code += '	\n';
			code += '	var link = linkObj(linkUrl);\n';
			code += '	if (typeof htmlBaseUrl==="string") link.html.base = htmlBaseUrl;\n';
			code += '	\n';
			code += '	linkObj.resolve(link, baseUrl, options);\n';
			code += '	\n';
			code += '	expect(link.url.original).to.equal(linkUrl);\n';
			code += '	expect(link.url.resolved).to.equal('+format(data.resolvedLinkUrl)+');\n';
			code += '	\n';
			code += '	expect(link.base.original).to.equal(baseUrl);\n';
			code += '	expect(link.base.resolved).to.equal('+format(data.resolvedBaseUrl)+');\n';
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
	});
});
