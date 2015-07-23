"use strict";
var urlCache = require("../lib/internal/urlCache");

var expect = require("chai").expect;



describe("INTERNAL -- urlCache", function()
{
	describe("startRetrieving()", function()
	{
		it("reports that it is retrieving", function()
		{
			var cache = new urlCache();
			var url = "some url";

			cache.startRetrieving(url);

			expect(cache.isRetrieving(url)).to.be.true;
		});



		it("reports when it is not retrieving", function()
		{
			var cache = new urlCache();
			var url = "some url";

			cache.startRetrieving(url);

			expect(cache.isRetrieving("another url")).to.be.false;
		});



		it("is finished after being stored", function()
		{
			var cache = new urlCache();
			var url = "some url";

			cache.startRetrieving(url);
			cache.store(url, "something");

			expect(cache.isRetrieving(url)).to.be.false;
		});



		it("can be cleared", function()
		{
			var cache = new urlCache();
			var url = "some url";

			cache.startRetrieving(url);
			cache.clear();

			expect(cache.isRetrieving(url)).to.be.false;
		});
	});



	describe("store()", function()
	{
		it("can be retrieved", function()
		{
			var cache = new urlCache();
			var content = "some content";
			var url = "some url";

			cache.store(url, content);

			expect(cache.retrieve(url)).to.equal(content);
		});



		it("is then contained", function()
		{
			var cache = new urlCache();
			var url = "some url";

			cache.store(url, "anything");

			expect(cache.contains(url)).to.be.true;
		});



		it("can be cleared", function()
		{
			var cache = new urlCache();
			var url = "some url";

			cache.store(url, "anything");
			cache.clear();

			expect(cache.retrieve(url)).to.equal(undefined);
			expect(cache.contains(url)).to.be.false;
		});
	});



	describe("addCallback()", function()
	{
		it("is executed after cache is stored", function()
		{
			var cache = new urlCache();
			var callback = "some item";
			var success = false;
			var url = "some url";

			cache.addCallback(url, callback);
			expect(success).to.be.false;
			cache.store(url, function(item) {
				expect(item).to.equal(callback);
				success = true;
			});

			expect(success).to.be.true;
		});



		it("is not overwritten by starting retrieval", function()
		{
			var cache = new urlCache();
			var callback = "some item";
			var success = false;
			var url = "some url";

			cache.addCallback(url, callback);
			cache.startRetrieving(url);
			cache.store(url, function(item) {
				expect(item).to.equal(callback);
				success = true;
			});

			expect(success).to.be.true;
		});
	});
});
