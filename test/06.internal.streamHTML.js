import {after, before, beforeEach, describe, it} from "mocha";
import {BLC_INVALID} from "../lib/internal/reasons";
import {defaultAuth, parsedOptions, startDeadServer, startServer, stopServers} from "./helpers";
import {expect} from "chai";
import {ExpectedHTMLError, HTMLRetrievalError} from "../lib/internal/errors";
import isStream from "is-stream";
import streamHTML from "../lib/internal/streamHTML";
import URLCache from "urlcache";



describe("INTERNAL -- streamHTML", () =>
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
		const url = new URL("http://blc/simple/no-links.html");
		const returnedValue = streamHTML(url, defaultAuth, null, parsedOptions());

		expect(returnedValue).to.be.a("promise");
	});



	it("resolves to an object", async () =>
	{
		const url = new URL("http://blc/simple/no-links.html");
		const {response, stream} = await streamHTML(url, defaultAuth, null, parsedOptions());

		expect( isStream(stream) ).to.be.true;

		expect(response)
			.to.be.an("object")
			.property("url").to.deep.equal(url);
	});



	it("reports a redirect", async () =>
	{
		const url = new URL("http://blc/redirect/redirect.html");
		const {response, stream} = await streamHTML(url, defaultAuth, null, parsedOptions());

		expect( isStream(stream) ).to.be.true;
		expect(response.url.href).to.equal("http://blc/redirect/redirected.html");
	});



	const rejections =
	[
		{
			message: new ExpectedHTMLError("image/gif").message,
			title: "rejects a non-html url (gif)",
			url: new URL("http://blc/non-html/image.gif")
		},
		{
			message: new ExpectedHTMLError().message,
			title: "rejects a non-html url (unknown)",
			url: new URL("http://blc/non-html/empty")
		},
		{
			message: new HTMLRetrievalError().message,
			title: "rejects a 404",
			url: new URL("http://blc/simple/404.html")
		},
		{
			message: new HTMLRetrievalError().message,
			title: "rejects a 500",
			url: new URL("http://blc/simple/500.html")
		},
		{
			message: BLC_INVALID,
			title: "rejects an erroneous url",
			url: "/simple/404.html"
		}
	];

	rejections.forEach(({message, title, url}) => it(title, async () =>
	{
		let errorWasThrown = false;

		try
		{
			await streamHTML(url, defaultAuth, null, parsedOptions());
		}
		catch (error)
		{
			expect(error)
				.to.be.an("error")
				.property("message").to.equal(message);

			errorWasThrown = true;
		}
		finally
		{
			expect(errorWasThrown).to.be.true;
		}
	}));



	// Note: cache is not stored for use in `streamHTML()`, but instead for any wrapping functions
	// As a result, the cached responses are not retrieved and checked to be non-unique
	describe("caching", () =>
	{
		it("stores the response", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const url = new URL("http://blc/simple/no-links.html");

			streamHTML(url, defaultAuth, cache, options);

			const cached = cache.get(url);
			expect(cached).to.be.a("promise");

			expect(await cached)
				.to.be.an("object")  // @todo move to after with chai^5
				.not.to.be.a("promise");
		});



		const rejections =
		[
			{
				title: "stores the response of a non-html url",
				url: new URL("http://blc/non-html/image.gif")
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

		rejections.forEach(({title, url}) => it(title, async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			let errorWasThrown = false;

			try
			{
				await streamHTML(url, defaultAuth, cache, options);
			}
			catch
			{
				errorWasThrown = true;
			}
			finally
			{
				expect(errorWasThrown).to.be.true;

				expect(await cache.get(url))
					.to.be.an("object")  // @todo move to after with chai^5
					.not.to.be.a("promise")
					.not.to.be.an("error");
			}
		}));



		it("stores the response of a failed connection", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const url = new URL("http://blc-dead/path/to/resource.html");
			let errorWasThrown = false;

			try
			{
				await streamHTML(url, defaultAuth, cache, options);
			}
			catch
			{
				errorWasThrown = true;
			}
			finally
			{
				expect(errorWasThrown).to.be.true;
				expect(await cache.get(url)).to.be.an("error");
			}
		});



		it("stores the response of redirected urls", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const url1 = new URL("http://blc/redirect/redirect.html");
			const url2 = new URL("http://blc/redirect/redirect2.html");
			const url3 = new URL("http://blc/redirect/redirected.html");
			const promise = streamHTML(url1, defaultAuth, cache, options);

			expect(cache.get(url1)).to.be.a("promise");
			expect(cache.get(url2)).to.be.undefined;
			expect(cache.get(url3)).to.be.undefined;

			await promise;

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
			const url = "/simple/404.html";
			let errorWasThrown = false;

			try
			{
				await streamHTML(url, defaultAuth, cache, options);
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
