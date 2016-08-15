/* eslint-disable sort-keys */
import {after, before, beforeEach, describe, it} from "mocha";
import {BLC_INVALID} from "../lib/internal/reasons";
import {defaultAuth, parsedOptions, startDeadServer, startServer, stopServers} from "./helpers";
import {expect} from "chai";
import {GET_METHOD, HEAD_METHOD} from "../lib/internal/methods";
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
		const url = new URL("http://blc/simple/index.html");
		const returnedValue = requestHTTP(url, defaultAuth, GET_METHOD, cache, parsedOptions());

		expect(returnedValue).to.be.a("promise");
	});



	it("receives a GET stream", async () =>
	{
		const url = new URL("http://blc/simple/index.html");
		const {response, stream} = await requestHTTP(url, defaultAuth, GET_METHOD, cache, parsedOptions());

		expect(response).to.deep.include(
		{
			headers: { "content-type": "text/html" },
			redirects: [],
			status: 200,
			statusText: null,
			url: new URL("http://blc:80/simple/index.html")
		});

		expect(stream).to.be.an("object");
	});



	it("does not receive a HEAD stream", async () =>
	{
		const url = new URL("http://blc/simple/index.html");
		const result = await requestHTTP(url, defaultAuth, HEAD_METHOD, cache, parsedOptions());

		expect(result.response).to.deep.include(
		{
			headers: { "content-type": "text/html" },
			redirects: [],
			status: 200,
			statusText: null,
			url: new URL("http://blc:80/simple/index.html")
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
			await requestHTTP("/simple/404.html", defaultAuth, GET_METHOD, cache, parsedOptions());
		}
		catch (error)
		{
			expect(error)
				.to.be.an("error")
				.to.be.an.instanceOf(TypeError)
				.property("message").to.equal(BLC_INVALID);

			errorWasThrown = true;
		}
		finally
		{
			expect(errorWasThrown).to.be.true;
		}
	});



	describe("caching", () =>
	{
		const resolves =
		[
			{
				title: "stores the response",
				url: new URL("http://blc/simple/no-links.html")
			},
			{
				title: "stores the response of a 404",
				url: new URL("http://blc/simple/404.html")
			},
			{
				title: "stores the response of a 500",
				url: new URL("http://blc/simple/500.html")
			}
		];

		resolves.forEach(({title, url}) => it(title, async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			requestHTTP(url, defaultAuth, GET_METHOD, cache, options);

			const cached = cache.get(url);
			expect(cached).to.be.a("promise");

			await cached;

			expect(cache.get(url))  // value is replaced after resolution
				.to.be.an("object")  // @todo move to after with chai^5
				.not.to.be.a("promise");
		}));



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

				const cached = cache.get(url);
				expect(cached).to.be.a("promise");
				expect(await cached).to.be.an("error");
			}
		});



		it("stores the response of redirected urls", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const url1 = new URL("http://blc/redirect/redirect.html");
			const url2 = new URL("http://blc/redirect/redirect2.html");
			const url3 = new URL("http://blc/redirect/redirected.html");
			requestHTTP(url1, defaultAuth, GET_METHOD, cache, options);

			const cached1 = cache.get(url1);
			expect(cached1).to.be.a("promise");
			expect(cache.get(url2)).to.be.undefined;
			expect(cache.get(url3)).to.be.undefined;

			await cached1;

			expect(cache.get(url1))
				.to.be.an("object").with.property("redirects").with.length(1)  // @todo move to after with chai^5
				.not.to.be.a("promise");

			expect(cache.get(url2))
				.to.be.an("object").with.property("redirects").with.length(0)  // @todo move to after with chai^5
				.not.to.be.a("promise");

			expect(cache.get(url3))
				.to.be.an("object").with.property("redirects").with.length(2)  // @todo move to after with chai^5
				.not.to.be.a("promise");
		});



		it("does not store the error from an erroneous url", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			let errorWasThrown = false;

			try
			{
				await requestHTTP("/simple/404.html", defaultAuth, GET_METHOD, cache, options);
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



	describe("options", () =>
	{
		it("retryHeadFail = false", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const url = new URL("http://blc/method-not-allowed/head.html");
			const {response: {status}} = await requestHTTP(url, defaultAuth, HEAD_METHOD, cache, options);

			expect(status).to.equal(405);
			expect(cache).to.have.length(1);
		});



		it("retryHeadFail = false (#2)", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const url = new URL("http://blc/method-not-allowed/any.html");
			const {response: {status}} = await requestHTTP(url, defaultAuth, GET_METHOD, cache, options);

			expect(status).to.equal(405);
			expect(cache).to.have.length(1);
		});



		it("retryHeadFail = true", async () =>
		{
			const options = parsedOptions({ cacheResponses:true, retryHeadFail:true });
			const url = new URL("http://blc/method-not-allowed/head.html");
			const {response: {status}} = await requestHTTP(url, defaultAuth, HEAD_METHOD, cache, options);

			expect(status).to.equal(200);
			expect(cache).to.have.length(1);
		});



		it("retryHeadFail = true (#2)", async () =>
		{
			const options = parsedOptions({ cacheResponses:true, retryHeadFail:true });
			const url = new URL("http://blc/method-not-allowed/any.html");
			const {response: {status}} = await requestHTTP(url, defaultAuth, GET_METHOD, cache, options);

			expect(status).to.equal(405);
			expect(cache).to.have.length(1);
		});
	});
});
