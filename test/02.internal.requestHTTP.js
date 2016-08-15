/* eslint-disable sort-keys */
import {after, before, beforeEach, describe, it} from "mocha";
import {BLC_INVALID} from "../lib/internal/reasons";
import {defaultAuth, parsedOptions, startDeadServer, startServer, stopServers} from "./helpers";
import {expect} from "chai";
import {GET_METHOD, HEAD_METHOD, PSEUDO_HEAD_METHOD} from "../lib/internal/methods";
import requestHTTP from "../lib/internal/requestHTTP";
import URLCache from "urlcache";



describe("INTERNAL -- requestHTTP", () =>
{
	let cache;



	before(() =>
	{
		startServer("http://blc/");
		startDeadServer("http://blc-dead/");
	});



	beforeEach(() => cache = new URLCache());

	after(stopServers);



	it("returns a Promise", () =>
	{
		const url = new URL("http://blc/normal/index.html");
		const returnedValue = requestHTTP(url, defaultAuth, GET_METHOD, cache, parsedOptions());

		expect(returnedValue).to.be.a("promise");
	});



	it("receives a GET stream", async () =>
	{
		const url = new URL("http://blc/normal/index.html");
		const {response, stream} = await requestHTTP(url, defaultAuth, GET_METHOD, cache, parsedOptions());

		expect(response).to.deep.include(
		{
			headers: { "content-type": "text/html" },
			redirects: [],
			status: 200,
			statusText: null/*,
			url: { href:"http://blc:80/normal/index.html" }*/
		});

		expect(stream).to.be.an("object");
	});



	it("does not receive a HEAD stream", async () =>
	{
		const url = new URL("http://blc/normal/index.html");
		const result = await requestHTTP(url, defaultAuth, HEAD_METHOD, cache, parsedOptions());

		expect(result.response).to.deep.include(
		{
			headers: { "content-type": "text/html" },
			redirects: [],
			status: 200,
			statusText: null/*,
			url: { href:"http://blc:80/normal/index.html" }*/
		});

		expect(result).not.to.have.property("stream");
	});



	// @todo results in "socket hang up" econnreset error
	it.skip("does not receive a PSEUDO-HEAD stream", async () =>
	{
		const url = new URL("http://blc/normal/index.html");
		const result = await requestHTTP(url, defaultAuth, PSEUDO_HEAD_METHOD, cache, parsedOptions());

		expect(result.response).to.deep.include(
		{
			headers: { "content-type": "text/html" },
			redirects: [],
			status: 200,
			statusText: null/*,
			url: { href:"http://blc:80/normal/index.html" }*/
		});

		expect(result).not.to.have.property("stream");
	});



	it("supports a redirect", async () =>
	{
		const url = new URL("http://blc/redirect/redirect.html");
		const {response, stream} = await requestHTTP(url, defaultAuth, GET_METHOD, cache, parsedOptions());

		expect(response).to.deep.include(
		{
			headers: { "content-type": "text/html" },
			status: 200,
			statusText: null,
			url: new URL("http://blc/redirect/redirected.html"),
			redirects:
			[
				{
					headers:
					{
						"content-type": "text/html",
						location: "/redirect/redirect2.html"
					},
					status: 302,
					statusText: null,
					url: new URL("http://blc/redirect/redirect.html")
				},
				{
					headers:
					{
						"content-type": "text/html",
						location: "/redirect/redirected.html"
					},
					status: 301,
					statusText: null,
					url: new URL("http://blc/redirect/redirect2.html")
				}
			]
		});

		expect(stream).to.be.an("object");
	});



	it("rejects an erroneous url", async () =>
	{
		let errorWasThrown = false;

		try
		{
			await requestHTTP("/normal/fake.html", defaultAuth, GET_METHOD, cache, parsedOptions());
		}
		catch (error)
		{
			expect(error).to.be.an("error");
			expect(error).to.be.an.instanceOf(TypeError);
			expect(error.message).to.equal(BLC_INVALID);
			errorWasThrown = true;
		}
		finally
		{
			expect(errorWasThrown).to.be.true;
		}
	});



	describe("caching", () =>
	{
		it("stores the response", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const url = new URL("http://blc/normal/no-links.html");

			requestHTTP(url, defaultAuth, GET_METHOD, cache, options);

			let cached = cache.get(url);
			expect(cached).to.be.a("promise");

			cached = await cached;
			expect(cached).not.to.be.a("promise");
			expect(cached).to.be.an("object");
		});



		it("stores the response of a redirected url", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const url1 = new URL("http://blc/redirect/redirect.html");
			const url2 = new URL("http://blc/redirect/redirected.html");
			const promise = requestHTTP(url1, defaultAuth, GET_METHOD, cache, options);

			let cached = cache.get(url2);
			expect(cached).to.be.undefined;

			await promise;

			cached = cache.get(url2);
			expect(cached).not.to.be.a("promise");
			expect(cached).to.be.an("object");
		});



		it("stores the response of a failed connection", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const url = new URL("http://blc-dead/path/to/resource.html");
			let errorWasThrown = false;

			try
			{
				await requestHTTP(url, defaultAuth, GET_METHOD, cache, options);
			}
			catch
			{
				errorWasThrown = true;
			}
			finally
			{
				expect(errorWasThrown).to.be.true;

				let cached = cache.get(url);
				expect(cached).to.be.a("promise");

				cached = await cached;
				expect(cached).not.to.be.a("promise");
				expect(cached).to.be.an("error");
			}
		});



		it("does not store the error from an erroneous url", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			let errorWasThrown = false;

			try
			{
				await requestHTTP("/normal/fake.html", defaultAuth, GET_METHOD, cache, options);
			}
			catch
			{
				errorWasThrown = true;
			}
			finally
			{
				expect(errorWasThrown).to.be.true;
				expect(cache).to.have.length(0);
			}
		});
	});
});
