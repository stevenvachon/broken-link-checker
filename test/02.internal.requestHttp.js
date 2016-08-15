/* eslint-disable sort-keys */
import {after, before, describe, it} from "mocha";
import {defaultAuth, parsedOptions, startDeadServer, startServer, stopServers} from "./helpers";
import {expect} from "chai";
import {reasons} from "../lib/internal/messages";
import requestHttp from "../lib/internal/requestHttp";
import URLCache from "urlcache";



describe("INTERNAL -- requestHttp", () =>
{
	before(() =>
	{
		startServer("http://blc/");
		startDeadServer("http://blc-dead/");
	});



	after(stopServers);



	it("returns a Promise", () =>
	{
		const cache = new URLCache();
		const url = new URL("http://blc/normal/index.html");
		const returnedValue = requestHttp(url, defaultAuth, "get", cache, parsedOptions());

		expect(returnedValue).to.be.a("promise");
	});



	it("receives a GET stream", async () =>
	{
		const cache = new URLCache();
		const url = new URL("http://blc/normal/index.html");
		const {response, stream} = await requestHttp(url, defaultAuth, "get", cache, parsedOptions());

		expect(response).to.containSubset(
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
		const cache = new URLCache();
		const url = new URL("http://blc/normal/index.html");
		const result = await requestHttp(url, defaultAuth, "head", cache, parsedOptions());

		expect(result.response).to.containSubset(
		{
			headers: { "content-type": "text/html" },
			redirects: [],
			status: 200,
			statusText: null/*,
			url: { href:"http://blc:80/normal/index.html" }*/
		});

		expect(result).not.to.have.property("stream");
	});



	// TODO :: results in "socket hang up" econnreset error
	it.skip("does not receive a PSEUDO-HEAD stream", async () =>
	{
		const cache = new URLCache();
		const url = new URL("http://blc/normal/index.html");
		const result = await requestHttp(url, defaultAuth, "pseudo-head", cache, parsedOptions());

		expect(result.response).to.containSubset(
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
		const cache = new URLCache();
		const url = new URL("http://blc/redirect/redirect.html");
		const {response, stream} = await requestHttp(url, defaultAuth, "get", cache, parsedOptions());

		expect(response).to.containSubset(
		{
			headers: { "content-type": "text/html" },
			status: 200,
			statusText: null,
			url: { href:"http://blc/redirect/redirected.html" },
			redirects:
			[
				{
					headers: { location:"/redirect/redirect2.html" },
					status: 302,
					statusText: null,
					url: { href:"http://blc/redirect/redirect.html" }
				},
				{
					headers: { location:"/redirect/redirected.html" },
					status: 301,
					statusText: null,
					url: { href:"http://blc/redirect/redirect2.html" }
				}
			]
		});

		expect(stream).to.be.an("object");
	});



	it("rejects an erroneous url", async () =>
	{
		const cache = new URLCache();
		let errorWasThrown = false;

		try
		{
			await requestHttp("/normal/fake.html", defaultAuth, "get", cache, parsedOptions());
		}
		catch (error)
		{
			expect(error).to.be.an("error");
			expect(error).to.be.an.instanceOf(TypeError);
			expect(error.message).to.equal(reasons.BLC_INVALID);
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
			const cache = new URLCache();
			const options = parsedOptions({ cacheResponses:true });
			const url = new URL("http://blc/normal/no-links.html");

			requestHttp(url, defaultAuth, "get", cache, options);

			let cached = cache.get(url);
			expect(cached).to.be.a("promise");

			cached = await cached;
			expect(cached).not.to.be.a("promise");
			expect(cached).to.be.an("object");
		});



		it("stores the response of a redirected url", async () =>
		{
			const cache = new URLCache();
			const options = parsedOptions({ cacheResponses:true });
			const url1 = new URL("http://blc/redirect/redirect.html");
			const url2 = new URL("http://blc/redirect/redirected.html");
			const promise = requestHttp(url1, defaultAuth, "get", cache, options);

			let cached = cache.get(url2);
			expect(cached).to.be.undefined;

			await promise;

			cached = cache.get(url2);
			expect(cached).not.to.be.a("promise");
			expect(cached).to.be.an("object");
		});



		it("stores the response of a failed connection", async () =>
		{
			const cache = new URLCache();
			const options = parsedOptions({ cacheResponses:true });
			const url = new URL("http://blc-dead/path/to/resource.html");
			let errorWasThrown = false;

			try
			{
				await requestHttp(url, defaultAuth, "get", cache, options);
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
			const cache = new URLCache();
			const options = parsedOptions({ cacheResponses:true });
			let errorWasThrown = false;

			try
			{
				await requestHttp("/normal/fake.html", defaultAuth, "get", cache, options);
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
