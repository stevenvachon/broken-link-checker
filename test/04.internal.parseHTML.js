import {describe, it} from "mocha";
import {expect} from "chai";
import {fixtureStream} from "./helpers";
import parseHTML from "../lib/internal/parseHTML";



describe("INTERNAL -- parseHTML", () =>
{
	it("returns a Promise from a string that resolves to an HTML Document", async () =>
	{
		const returnedValue = parseHTML("<html></html>");
		expect(returnedValue).to.be.a("promise");

		expect(await returnedValue)
			.to.be.an("object")  // @todo move to after with chai^5
			.not.to.be.a("promise");
	});



	it("returns a Promise from a Stream that resolves to an HTML Document", async () =>
	{
		const returnedValue = parseHTML( fixtureStream("/simple/no-links.html") );
		expect(returnedValue).to.be.a("promise");

		expect(await returnedValue)
			.to.be.an("object")  // @todo move to after with chai^5
			.not.to.be.a("promise");
	});



	it("rejects invalid input", async () =>
	{
		let errorWasThrown = false;

		try
		{
			await parseHTML(1);
		}
		catch (error)
		{
			expect(error)
				.to.be.an("error")
				.to.be.an.instanceOf(TypeError);

			errorWasThrown = true;
		}
		finally
		{
			expect(errorWasThrown).to.be.true;
		}
	});
});
