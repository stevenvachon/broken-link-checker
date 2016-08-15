import {after, before, describe, it} from "mocha";
import {defaultAuth, parsedOptions, startDeadServer, startServer, stopServers} from "./helpers";
import {expect} from "chai";
import getRobotsTxt from "../lib/internal/getRobotsTxt";
import {reasons} from "../lib/internal/messages";
import URLCache from "urlcache";



describe("INTERNAL -- getRobotsTxt", () =>
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
		const url = new URL("http://blc/");
		const returnedValue = getRobotsTxt(url, defaultAuth, cache, parsedOptions());

		expect(returnedValue).to.be.a("promise");
	});



	it("resolves to an object with predicate methods", async () =>
	{
		const cache = new URLCache();
		const url = new URL("http://blc/anything");
		const result = await getRobotsTxt(url, defaultAuth, cache, parsedOptions());

		expect(result).to.be.an("object");
		expect(result.isAllowed).to.be.a("function");
	});



	it("rejects an erroneous url", async () =>
	{
		const cache = new URLCache();
		let errorWasThrown = false;

		try
		{
			await getRobotsTxt("/normal/fake.html", defaultAuth, cache, parsedOptions());
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
			const url = new URL("http://blc/anything");

			getRobotsTxt(url, defaultAuth, cache, options);

			let cached = cache.get(new URL("http://blc/robots.txt"));
			expect(cached).to.be.a("promise");

			cached = await cached;
			expect(cached).not.to.be.a("promise");
			expect(cached).to.be.an("object");
		});



		it("stores the response of a failed connection", async () =>
		{
			const cache = new URLCache();
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

				let cached = cache.get(new URL("http://blc-dead/robots.txt"));
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
				await getRobotsTxt("/normal/fake.html", defaultAuth, cache, options);
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
