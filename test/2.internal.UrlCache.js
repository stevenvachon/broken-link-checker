"use strict";
var UrlCache = require("../lib/internal/UrlCache");

var expect = require("chai").expect;



describe("INTERNAL -- UrlCache", function()
{
	describe("setRetrieving()", function()
	{
		it("should report that it is retrieving", function()
		{
			var cache = new UrlCache();
			var url = "some url";

			cache.setRetrieving(url);

			expect( cache.isRetrieving(url) ).to.be.true;
		});



		it("should report that it is not retrieving", function()
		{
			var cache = new UrlCache();
			var url = "some url";

			cache.setRetrieving(url);

			expect( cache.isRetrieving("another url") ).to.be.false;
		});



		it("should not report that it is retrieving after being stored", function()
		{
			var cache = new UrlCache();
			var url = "some url";

			cache.setRetrieving(url);
			cache.set(url, "something");

			expect( cache.isRetrieving(url) ).to.be.false;
		});



		it("should be cleared", function()
		{
			var cache = new UrlCache();
			var url = "some url";

			cache.setRetrieving(url);
			cache.clear();

			expect( cache.isRetrieving(url) ).to.be.false;
		});
	});



	describe("store()", function()
	{
		it("should get what was stored", function()
		{
			var cache = new UrlCache();
			var response = "some response";
			var url = "some url";

			cache.set(url, response);

			expect( cache.get(url) ).to.equal(response);
		});



		it("should contain what was stored", function()
		{
			var cache = new UrlCache();
			var url = "some url";

			cache.set(url, "anything");

			expect( cache.contains(url) ).to.be.true;
		});



		it("should be cleared", function()
		{
			var cache = new UrlCache();
			var url = "some url";

			cache.set(url, "anything");
			cache.clear();

			expect( cache.get(url) ).to.equal(undefined);
			expect( cache.contains(url) ).to.be.false;
		});
	});



	describe("addCallback()", function()
	{
		it("should run the callback function after cache is stored", function()
		{
			var cache = new UrlCache();
			var response = "some response";
			var success = false;
			var url = "some url";

			cache.addCallback(url, function(callbackResponse)
			{
				expect(callbackResponse).to.equal(response);

				success = true;
			});

			expect(success).to.be.false;

			cache.set(url, response);

			expect(success).to.be.true;
		});



		it("should not be overwritten by setting retrieval", function()
		{
			var cache = new UrlCache();
			var response = "some response";
			var success = false;
			var url = "some url";

			cache.addCallback(url, function(callbackResponse)
			{
				expect(callbackResponse).to.equal(response);

				success = true;
			});
						
			cache.setRetrieving(url);
			
			cache.set(url, response);

			expect(success).to.be.true;
		});
	});
});
