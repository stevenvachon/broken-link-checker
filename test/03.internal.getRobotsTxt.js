import {after, before, beforeEach, describe, it} from "mocha";
import {BLC_INVALID} from "../lib/internal/reasons";
import {defaultAuth, parsedOptions, startDeadServer, startServer, stopServers} from "./helpers";
import {expect} from "chai";
import getRobotsTxt from "../lib/internal/getRobotsTxt";
import URLCache from "urlcache";



describe("INTERNAL -- getRobotsTxt", () =>
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
		const url = new URL("http://blc/");
		const returnedValue = getRobotsTxt(url, defaultAuth, cache, parsedOptions());

		expect(returnedValue).to.be.a("promise");
	});



	it("resolves to an object with predicate methods", async () =>
	{
		const url = new URL("http://blc/anything");
		const result = await getRobotsTxt(url, defaultAuth, cache, parsedOptions());

		expect(result)
			.to.be.an("object")
			.property("isAllowed").to.be.a("function");
	});



	it("rejects an erroneous url", async () =>
	{
		let errorWasThrown = false;

		try
		{
			await getRobotsTxt("/simple/404.html", defaultAuth, cache, parsedOptions());
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
		it("stores the response", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const url = new URL("http://blc/anything");

			getRobotsTxt(url, defaultAuth, cache, options);

			const cached = cache.get(new URL("http://blc/robots.txt"));
			expect(cached).to.be.a("promise");

			expect(await cached)
				.to.be.an("object")  // @todo move to after with chai^5
				.not.to.be.a("promise");
		});



		it("stores the response of a failed connection", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const url = new URL("http://blc-dead/anything");
			let errorWasThrown = false;

			try
			{
				await getRobotsTxt(url, defaultAuth, cache, options);
			}
			catch
			{
				errorWasThrown = true;
			}
			finally
			{
				expect(errorWasThrown).to.be.true;

				const cached = cache.get(new URL("http://blc-dead/robots.txt"));
				expect(cached).to.be.a("promise");

				expect(await cached)
					.to.be.an("error")  // @todo move to after with chai^5
					.not.to.be.a("promise");
			}
		});



		it("does not store the error from an erroneous url", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			let errorWasThrown = false;

			try
			{
				await getRobotsTxt("/simple/404.html", defaultAuth, cache, options);
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
