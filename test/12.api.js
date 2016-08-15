import * as blc from "../lib";
import {describe, it} from "mocha";
import {expect} from "chai";



describe("API", () =>
{
	it("has necessary exports", () =>
	{
		const classes =
		[
			"HtmlChecker",
			"HtmlUrlChecker",
			"SiteChecker",
			"UrlChecker"
		];

		const objects =
		[
			"DEFAULT_OPTIONS",
			"events",
			"reasons"
		];

		expect(blc).to.be.an("object").that.has.keys(...classes, ...objects);

		classes.forEach(key => expect(blc[key]).to.be.a("function"));
		objects.forEach(key => expect(blc[key]).to.be.an("object"));
	});
});
