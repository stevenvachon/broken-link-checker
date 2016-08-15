import {after, before, describe, it} from "mocha";
import {defaultAuth, parsedOptions, startDeadServer, startServer, stopServers} from "./helpers";
import {errors, reasons} from "../lib/internal/messages";
import {expect} from "chai";
import isStream from "is-stream";
import streamHtml from "../lib/internal/streamHtml";
import URLCache from "urlcache";



describe("INTERNAL -- streamHtml", () =>
{
	before(() =>
	{
		startServer("http://blc/");
		startDeadServer("http://blc-dead/");
	});



	after(stopServers);



	it("returns a Promise", () =>
	{
		const url = new URL("http://blc/normal/no-links.html");
		const returnedValue = streamHtml(url, defaultAuth, null, parsedOptions());

		expect(returnedValue).to.be.a("promise");
	});



	it("resolves to an object", async () =>
	{
		const url = new URL("http://blc/normal/no-links.html");
		const {response, stream} = await streamHtml(url, defaultAuth, null, parsedOptions());

		expect( isStream(stream) ).to.be.true;
		expect(response).to.be.an("object");
		expect(response.url.href).to.equal("http://blc/normal/no-links.html");
	});



	it("reports a redirect", async () =>
	{
		const url = new URL("http://blc/redirect/redirect.html");
		const {response, stream} = await streamHtml(url, defaultAuth, null, parsedOptions());

		expect( isStream(stream) ).to.be.true;
		expect(response.url.href).to.equal("http://blc/redirect/redirected.html");
	});



	const rejections =
	[
		{
			message: errors.EXPECTED_HTML("image/gif"),
			title: "rejects a non-html url (gif)",
			url: new URL("http://blc/non-html/image.gif")
		},
		{
			message: errors.EXPECTED_HTML(undefined),
			title: "rejects a non-html url (unknown)",
			url: new URL("http://blc/non-html/empty")
		},
		{
			message: errors.HTML_RETRIEVAL,
			title: "rejects a 404",
			url: new URL("http://blc/normal/fake.html")
		},
		{
			message: reasons.BLC_INVALID,
			title: "rejects an erroneous url",
			url: "/normal/fake.html"
		}
	];

	rejections.forEach(({message, title, url}) => it(title, async () =>
	{
		let errorWasThrown = false;

		try
		{
			await streamHtml(url, defaultAuth, null, parsedOptions());
		}
		catch (error)
		{
			expect(error).to.be.an("error");
			expect(error.message).to.equal(message);
			errorWasThrown = true;
		}
		finally
		{
			expect(errorWasThrown).to.be.true;
		}
	}));



	// NOTE :: cache is not stored for use in `streamHtml()`, but instead for any wrapping functions
	// As a result, the cached responses are not retrieved and checked to be non-unique
	describe("caching", () =>
	{
		it("stores the response", async () =>
		{
			const cache = new URLCache();
			const options = parsedOptions({ cacheResponses:true });
			const url = new URL("http://blc/normal/no-links.html");

			streamHtml(url, defaultAuth, cache, options);

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
			const promise = streamHtml(url1, defaultAuth, cache, options);

			let cached = cache.get(url2);
			expect(cached).to.be.undefined;

			await promise;

			cached = cache.get(url2);
			expect(cached).not.to.be.a("promise");
			expect(cached).to.be.an("object");
		});



		const rejections =
		[
			{
				title: "stores the response of a non-html url",
				url: new URL("http://blc/non-html/image.gif")
			},
			{
				title: "stores the response of a 404",
				url: new URL("http://blc/normal/fake.html")
			}
		];

		rejections.forEach(({title, url}) => it(title, async () =>
		{
			const cache = new URLCache();
			const options = parsedOptions({ cacheResponses:true });
			let errorWasThrown = false;

			try
			{
				await streamHtml(url, defaultAuth, cache, options);
			}
			catch
			{
				errorWasThrown = true;
			}
			finally
			{
				expect(errorWasThrown).to.be.true;

				const response = await cache.get(url);
				expect(response).not.to.be.a("promise");
				expect(response).not.to.be.an("error");
				expect(response).to.be.an("object");
			}
		}));



		it("stores the response of a failed connection", async () =>
		{
			const cache = new URLCache();
			const options = parsedOptions({ cacheResponses:true });
			const url = new URL("http://blc-dead/path/to/resource.html");
			let errorWasThrown = false;

			try
			{
				await streamHtml(url, defaultAuth, cache, options);
			}
			catch
			{
				errorWasThrown = true;
			}
			finally
			{
				expect(errorWasThrown).to.be.true;

				const response = await cache.get(url);
				expect(response).not.to.be.a("promise");
				expect(response).to.be.an("error");
			}
		});



		it("does not store the error from an erroneous url", async () =>
		{
			const cache = new URLCache();
			const options = parsedOptions({ cacheResponses:true });
			const url = "/normal/fake.html";
			let errorWasThrown = false;

			try
			{
				await streamHtml(url, defaultAuth, cache, options);
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
