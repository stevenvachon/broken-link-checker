import {describe, it} from "mocha";
import {expect} from "chai";
import matchURL from "../lib/internal/matchURL";



describe("INTERNAL -- matchURL", () =>
{
	it("works", () =>
	{
		expect( matchURL("http://keyword.com/", []) ).to.be.false;

		expect( matchURL("http://keyword.com/", ["keyword"])   ).to.be.true;
		expect( matchURL("http://keyword.com/", ["keyword*"])  ).to.be.false;
		expect( matchURL("http://keyword.com/", ["*keyword"])  ).to.be.false;
		expect( matchURL("http://keyword.com/", ["*keyword*"]) ).to.be.true;

		expect( matchURL("http://keyword.com/", ["keyword.com"])   ).to.be.true;
		expect( matchURL("http://keyword.com/", ["*keyword.com"])  ).to.be.false;
		expect( matchURL("http://keyword.com/", ["keyword.com*"])  ).to.be.false;
		expect( matchURL("http://keyword.com/", ["*keyword.com*"]) ).to.be.true;

		expect( matchURL("http://keyword.com/", ["*keyword.*"]) ).to.be.true;

		expect( matchURL("http://keyword.com/", ["*.com"])  ).to.be.false;
		expect( matchURL("http://keyword.com/", ["*.com*"]) ).to.be.true;
		expect( matchURL("http://keyword.com",  ["*.com"])  ).to.be.true;
		expect( matchURL("http://keyword.com",  ["*.com*"]) ).to.be.true;

		expect( matchURL("http://keyword.net/.com/", [".com"])   ).to.be.true;
		expect( matchURL("http://keyword.net/.com/", ["*.com*"]) ).to.be.true;

		expect( matchURL("http://keyword.com/",     ["*://keyword.com*"])   ).to.be.true;
		expect( matchURL("http://www.keyword.com/", ["*://*.keyword.com*"]) ).to.be.true;

		expect( matchURL("http://keyword.com/", ["nope","keyword.com","nope"]) ).to.be.true;

		expect( matchURL("http://domain.com/keyword/", ["keyword"])   ).to.be.true;
		expect( matchURL("http://domain.com/keyword/", ["/keyword"])  ).to.be.true;
		expect( matchURL("http://domain.com/keyword/", ["keyword/"])  ).to.be.true;
		expect( matchURL("http://domain.com/keyword/", ["/keyword/"]) ).to.be.true;

		expect( matchURL("http://domain.com/dir/keyword/", ["keyword"])   ).to.be.true;
		expect( matchURL("http://domain.com/dir/keyword/", ["/keyword"])  ).to.be.true;
		expect( matchURL("http://domain.com/dir/keyword/", ["keyword/"])  ).to.be.true;
		expect( matchURL("http://domain.com/dir/keyword/", ["/keyword/"]) ).to.be.true;

		expect( matchURL("http://domain.com/dir/keyword/", ["domain.com/keyword/"]) ).to.be.false;
		expect( matchURL("http://domain.com/dir/keyword/", ["domain.com/dir/keyword/"]) ).to.be.true;

		expect( matchURL("http://domain.com/dir/keyword/", ["!*keyword*"]) ).to.be.false;
	});
});
