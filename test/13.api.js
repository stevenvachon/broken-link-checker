import * as blc from "../lib";
import * as events from "../lib/internal/events";
import * as methods from "../lib/internal/methods";
import {describe, it} from "mocha";
import {expect} from "chai";

const blcCJS = require("../lib");



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
			"reasons"
		];

		const strings =
		[
			...Object.keys(events),
			...Object.keys(methods)
		];

		const modules =
		[
			blc,    // ES module
			blcCJS  // CommonJS module
		];

		modules.forEach(module =>
		{
			expect(module).to.be.an("object").that.has.keys(...classes, ...objects, ...strings);

			classes.forEach(key => expect(module).property(key).to.be.a("function"));
			objects.forEach(key => expect(module).property(key).to.be.an("object"));
			strings.forEach(key => expect(module).property(key).to.be.a("string"));
		});
	});
});
