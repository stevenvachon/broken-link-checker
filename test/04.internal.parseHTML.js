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

		const document = await returnedValue;
		expect(document).not.to.be.a("promise");
		expect(document).to.be.an("object");
	});



	it("returns a Promise from a Stream that resolves to an HTML Document", async () =>
	{
		const returnedValue = parseHTML( fixtureStream("/normal/no-links.html") );
		expect(returnedValue).to.be.a("promise");

		const document = await returnedValue;
		expect(document).not.to.be.a("promise");
		expect(document).to.be.an("object");
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
			expect(error).to.be.an.instanceOf(TypeError);
			errorWasThrown = true;
		}
		finally
		{
			expect(errorWasThrown).to.be.true;
		}
	});
});
