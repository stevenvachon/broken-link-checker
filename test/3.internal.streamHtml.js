"use strict";
const helpers    = require("./helpers");
const messages   = require("../lib/internal/messages");
const streamHtml = require("../lib/internal/streamHtml");

const {after, before, describe, it} = require("mocha");
const {expect} = require("chai");
const isStream = require("is-stream");
const {URL} = require("universal-url");
const URLCache = require("urlcache");



describe("INTERNAL -- streamHtml", function()
{
	before(() => helpers.startServer("http://blc/"));
	after(helpers.stopServers);



	it("works", function()
	{
		const url = new URL("http://blc/normal/no-links.html");

		return streamHtml(url, {}, null, helpers.options())
		.then(result =>
		{
			expect( isStream(result.stream) ).to.be.true;
			expect(result.response.url.href).to.equal("http://blc/normal/no-links.html");
		});
	});



	it("reports a redirect", function()
	{
		const url = new URL("http://blc/redirect/redirect.html");

		return streamHtml(url, {}, null, helpers.options())
		.then(result =>
		{
			expect( isStream(result.stream) ).to.be.true;
			expect(result.response.url.href).to.equal("http://blc/redirect/redirected.html");
		});
	});



	it("rejects a non-html url (gif)", function()
	{
		const url = new URL("http://blc/non-html/image.gif");
		let accepted = false;

		return streamHtml(url, {}, null, helpers.options())
		.then(result => accepted = new Error("this should not have been called"))
		.catch(error =>
		{
			expect(error).to.be.an("error");
			expect(error.message).to.equal( messages.errors.EXPECTED_HTML("image/gif") );
		})
		.then(() =>
		{
			if (accepted!==false) throw accepted;
		});
	});



	it("rejects a non-html url (unknown)", function()
	{
		const url = new URL("http://blc/non-html/empty");
		let accepted = false;

		return streamHtml(url, {}, null, helpers.options())
		.then(result => accepted = new Error("this should not have been called"))
		.catch(error =>
		{
			expect(error).to.be.an("error");
			expect(error.message).to.equal( messages.errors.EXPECTED_HTML(undefined) );
		})
		.then(() =>
		{
			if (accepted!==false) throw accepted;
		});
	});



	it("rejects a 404", function()
	{
		const url = new URL("http://blc/normal/fake.html");
		let accepted = false;

		return streamHtml(url, {}, null, helpers.options())
		.then(result => accepted = new Error("this should not have been called"))
		.catch(error =>
		{
			expect(error).to.be.an("error");
			expect(error.message).to.equal( messages.errors.HTML_RETRIEVAL );
		})
		.then(() =>
		{
			if (accepted!==false) throw accepted;
		});
	});



	it("rejects an erroneous url", function()
	{
		let accepted = false;

		return streamHtml("/normal/fake.html", {}, null, helpers.options())
		.then(result => accepted = new Error("this should not have been called"))
		.catch(error =>
		{
			expect(error).to.be.an("error");
			expect(error.message).to.equal("Invalid URL");
		})
		.then(() =>
		{
			if (accepted) throw accepted;
		});
	});



	// NOTE :: cache is not stored for use in `streamHtml()`, but instead for any wrapping functions
	// As a result, the cached responses are not retrieved and checked to be non-unique
	describe("caching", function()
	{
		it("stores the response", function()
		{
			const cache = new URLCache();
			const url = new URL("http://blc/normal/no-links.html");

			return streamHtml(url, {}, cache, helpers.options({ cacheResponses:true }))
			.then(result => cache.get(url))
			.then(response => expect(response).to.be.an("object"));
		});



		it("stores the response of a redirected url", function()
		{
			const cache = new URLCache();
			const url1 = new URL("http://blc/redirect/redirect.html");
			const url2 = new URL("http://blc/redirect/redirected.html");

			return streamHtml(url1, {}, cache, helpers.options({ cacheResponses:true }))
			.then(result => cache.get(url1))
			.then(response =>
			{
				expect(response).to.be.an("object");

				return cache.get(url2);
			})
			.then(response =>
			{
				expect(response).to.be.an("object");
			});
		});



		it("stores the response of a non-html url", function()
		{
			const cache = new URLCache();
			const url = new URL("http://blc/non-html/image.gif");

			return streamHtml(url, {}, cache, helpers.options({ cacheResponses:true }))
			.catch(error => { /* "Unsupported type", etc, error */ })
			.then(() => cache.get(url))
			.then(response =>
			{
				expect(response).to.be.an("object");
				expect(response).to.not.be.an("error");
			});
		});



		it("stores the response of a 404", function()
		{
			const cache = new URLCache();
			const url = new URL("http://blc/normal/fake.html");

			return streamHtml(url, {}, cache, helpers.options({ cacheResponses:true }))
			.catch(error => { /* "HTML not retrieved", etc, error */ })
			.then(() => cache.get(url))
			.then(response =>
			{
				expect(response).to.be.an("object");
				expect(response).to.not.be.an("error");
			});
		});



		it.skip("stores the error from an erroneous url", function()
		{
			const cache = new URLCache();

			return streamHtml("/normal/fake.html", {}, cache, helpers.options({ cacheResponses:true }))
			.catch(error => { /* "Invalid URL", etc, error */ })
			.then(() => cache.get("/normal/fake.html"))
			.then(response =>
			{
				expect(response).to.be.an("error");
				expect(response.message).to.equal("Invalid URL");
			});
		});
	});
});
