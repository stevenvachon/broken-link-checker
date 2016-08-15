/* eslint-disable sort-keys */
import {after, before, beforeEach, describe, it} from "mocha";
import checkLink from "../lib/internal/checkLink";
import {defaultAuth, parsedOptions, startDeadServer, startServers, stopServers} from "./helpers";
import {expect} from "chai";
import {GET_METHOD} from "../lib/internal/methods";
import Link from "../lib/internal/Link";
import URLCache from "urlcache";



describe("INTERNAL -- checkLink", () =>
{
	let cache;



	before(() =>
	{
		startServers("http://blc1/", "https://blc2/");
		startDeadServer("http://blc-dead/");
	});



	beforeEach(() => cache = new URLCache());

	after(stopServers);



	it("returns a Promise", () =>
	{
		const baseURL = "http://blc1/";
		const linkURL = "http://blc1/normal/no-links.html";
		const link = new Link().resolve(linkURL, baseURL);
		const returnedValue = checkLink(link, defaultAuth, cache, parsedOptions());

		expect(returnedValue).to.be.a("promise");
	});



	it("rejects a non-Link", async () =>
	{
		let errorWasThrown = false;

		try
		{
			await checkLink("/normal/no-links.html", defaultAuth, cache, parsedOptions());
		}
		catch (error)
		{
			expect(error).to.be.an("error");
			expect(error).to.be.an.instanceOf(TypeError);
			errorWasThrown = true;
		}
		finally
		{
			expect(errorWasThrown).to.be.true;
		}
	});



	describe("shall not be broken with a REAL HOST and REAL PATH from", () =>
	{
		it("an absolute url", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL = "http://blc1/normal/no-links.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:          linkURL,
				[Link.RESOLVED_URL]:   { href:linkURL },
				[Link.REBASED_URL]:    { href:linkURL },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: { redirects:[] },
				[Link.IS_BROKEN]: false,
				[Link.BROKEN_REASON]: null,
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});

			expect(result.get(Link.HTTP_RESPONSE).redirects).to.be.empty;
		});



		it("a scheme-relative url", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL =      "//blc1/normal/no-links.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:                  linkURL,
				[Link.RESOLVED_URL]:   { href:`http:${linkURL}` },
				[Link.REBASED_URL]:    { href:`http:${linkURL}` },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: { redirects:[] },
				[Link.IS_BROKEN]: false,
				[Link.BROKEN_REASON]: null,
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});

			expect(result.get(Link.HTTP_RESPONSE).redirects).to.be.empty;
		});



		it("a root-path-relative url", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL =            "/normal/no-links.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:                        linkURL,
				[Link.RESOLVED_URL]:   { href:`http://blc1${linkURL}` },
				[Link.REBASED_URL]:    { href:`http://blc1${linkURL}` },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: { redirects:[] },
				[Link.IS_BROKEN]: false,
				[Link.BROKEN_REASON]: null,
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});

			expect(result.get(Link.HTTP_RESPONSE).redirects).to.be.empty;
		});



		it("a path-relative url", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL =             "normal/no-links.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:                       linkURL,
				[Link.RESOLVED_URL]:   { href:`${baseURL}${linkURL}` },
				[Link.REBASED_URL]:    { href:`${baseURL}${linkURL}` },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: { redirects:[] },
				[Link.IS_BROKEN]: false,
				[Link.BROKEN_REASON]: null,
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});

			expect(result.get(Link.HTTP_RESPONSE).redirects).to.be.empty;
		});



		it("a query-relative url", async () =>
		{
			const baseURL = "http://blc1/normal/no-links.html";
			const linkURL =                                 "?query";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:                       linkURL,
				[Link.RESOLVED_URL]:   { href:`${baseURL}${linkURL}` },
				[Link.REBASED_URL]:    { href:`${baseURL}${linkURL}` },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: { redirects:[] },
				[Link.IS_BROKEN]: false,
				[Link.BROKEN_REASON]: null,
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});

			expect(result.get(Link.HTTP_RESPONSE).redirects).to.be.empty;
		});



		it("a hash-relative url", async () =>
		{
			const baseURL = "http://blc1/normal/no-links.html";
			const linkURL =                                 "#hash";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:                       linkURL,
				[Link.RESOLVED_URL]:   { href:`${baseURL}${linkURL}` },
				[Link.REBASED_URL]:    { href:`${baseURL}${linkURL}` },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: { redirects:[] },
				[Link.IS_BROKEN]: false,
				[Link.BROKEN_REASON]: null,
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: true
			});

			expect(result.get(Link.HTTP_RESPONSE).redirects).to.be.empty;
		});



		it("an empty url", async () =>
		{
			const baseURL = "http://blc1/normal/no-links.html";
			const linkURL = "";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:          linkURL,
				[Link.RESOLVED_URL]:   { href:baseURL },
				[Link.REBASED_URL]:    { href:baseURL },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: { redirects:[] },
				[Link.IS_BROKEN]: false,
				[Link.BROKEN_REASON]: null,
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: true
			});

			expect(result.get(Link.HTTP_RESPONSE).redirects).to.be.empty;
		});
	});



	describe("shall be broken with a REAL HOST and FAKE PATH from", () =>
	{
		it("an absolute url", async () =>
		{
			const baseURL = "http://blc1/normal/fake.html";
			const linkURL = "http://blc1/";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:          linkURL,
				[Link.RESOLVED_URL]:   { href:linkURL },
				[Link.REBASED_URL]:    { href:linkURL },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: { redirects:[] },
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "HTTP_404",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});

			expect(result.get(Link.HTTP_RESPONSE).redirects).to.be.empty;
		});



		it("a scheme-relative url", async () =>
		{
			const baseURL = "http://blc1/normal/fake.html";
			const linkURL =      "//blc1/normal/fake.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:                  linkURL,
				[Link.RESOLVED_URL]:   { href:`http:${linkURL}` },
				[Link.REBASED_URL]:    { href:`http:${linkURL}` },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:linkURL },
				[Link.REBASED_BASE_URL]:  { href:linkURL },
				[Link.HTTP_RESPONSE]: { redirects:[] },
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "HTTP_404",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});

			expect(result.get(Link.HTTP_RESPONSE).redirects).to.be.empty;
		});



		it("a root-path-relative url", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL =            "/normal/fake.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:                        linkURL,
				[Link.RESOLVED_URL]:   { href:`http://blc1${linkURL}` },
				[Link.REBASED_URL]:    { href:`http://blc1${linkURL}` },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: { redirects:[] },
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "HTTP_404",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});

			expect(result.get(Link.HTTP_RESPONSE).redirects).to.be.empty;
		});



		it("a path-relative url", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL =             "normal/fake.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:                       linkURL,
				[Link.RESOLVED_URL]:   { href:`${baseURL}${linkURL}` },
				[Link.REBASED_URL]:    { href:`${baseURL}${linkURL}` },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: { redirects:[] },
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "HTTP_404",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});

			expect(result.get(Link.HTTP_RESPONSE).redirects).to.be.empty;
		});



		it("a query-relative url", async () =>
		{
			const baseURL = "http://blc1/normal/fake.html";
			const linkURL =                             "?query";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:                       linkURL,
				[Link.RESOLVED_URL]:   { href:`${baseURL}${linkURL}` },
				[Link.REBASED_URL]:    { href:`${baseURL}${linkURL}` },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: { redirects:[] },
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "HTTP_404",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});

			expect(result.get(Link.HTTP_RESPONSE).redirects).to.be.empty;
		});



		it("a hash-relative url", async () =>
		{
			const baseURL = "http://blc1/normal/fake.html";
			const linkURL =                             "#hash";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:                       linkURL,
				[Link.RESOLVED_URL]:   { href:`${baseURL}${linkURL}` },
				[Link.REBASED_URL]:    { href:`${baseURL}${linkURL}` },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: { redirects:[] },
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "HTTP_404",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: true
			});

			expect(result.get(Link.HTTP_RESPONSE).redirects).to.be.empty;
		});



		it("an empty url", async () =>
		{
			const baseURL = "http://blc1/normal/fake.html";
			const linkURL =  "";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:          linkURL,
				[Link.RESOLVED_URL]:   { href:baseURL },
				[Link.REBASED_URL]:    { href:baseURL },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: { redirects:[] },
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "HTTP_404",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: true
			});

			expect(result.get(Link.HTTP_RESPONSE).redirects).to.be.empty;
		});
	});



	// Technically it's a real host with a fake port, but same goal
	// and faster than testing a remote http://asdf1234.asdf1234
	describe("shall be broken with a FAKE HOST from", () =>
	{
		it("an absolute url", async () =>
		{
			const baseURL = "http://blc-dead/";
			const linkURL = "http://blc-dead/path/to/resource.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:          linkURL,
				[Link.RESOLVED_URL]:   { href:linkURL },
				[Link.REBASED_URL]:    { href:linkURL },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: null,
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "ERRNO_ECONNREFUSED",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});
		});



		it("a scheme-relative url", async () =>
		{
			const baseURL = "http://blc-dead/";
			const linkURL =      "//blc-dead/path/to/resource.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:                  linkURL,
				[Link.RESOLVED_URL]:   { href:`http:${linkURL}` },
				[Link.REBASED_URL]:    { href:`http:${linkURL}` },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: null,
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "ERRNO_ECONNREFUSED",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});
		});



		it("a root-path-relative url", async () =>
		{
			const baseURL = "http://blc-dead/";
			const linkURL =                "/path/to/resource.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:                            linkURL,
				[Link.RESOLVED_URL]:   { href:`http://blc-dead${linkURL}` },
				[Link.REBASED_URL]:    { href:`http://blc-dead${linkURL}` },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: null,
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "ERRNO_ECONNREFUSED",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});
		});



		it("a path-relative url", async () =>
		{
			const baseURL = "http://blc-dead/";
			const linkURL =                 "path/to/resource.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:                       linkURL,
				[Link.RESOLVED_URL]:   { href:`${baseURL}${linkURL}` },
				[Link.REBASED_URL]:    { href:`${baseURL}${linkURL}` },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: null,
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "ERRNO_ECONNREFUSED",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});
		});



		it("a query-relative url", async () =>
		{
			const baseURL = "http://blc-dead/path/to/resource.html";
			const linkURL =                                      "?query";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:                       linkURL,
				[Link.RESOLVED_URL]:   { href:`${baseURL}${linkURL}` },
				[Link.REBASED_URL]:    { href:`${baseURL}${linkURL}` },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: null,
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "ERRNO_ECONNREFUSED",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});
		});



		it("a hash-relative url", async () =>
		{
			const baseURL = "http://blc-dead/path/to/resource.html";
			const linkURL =                                      "#hash";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:                       linkURL,
				[Link.RESOLVED_URL]:   { href:`${baseURL}${linkURL}` },
				[Link.REBASED_URL]:    { href:`${baseURL}${linkURL}` },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: null,
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "ERRNO_ECONNREFUSED",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: true
			});
		});



		it("an empty url", async () =>
		{
			const baseURL = "http://blc-dead/path/to/resource.html";
			const linkURL = "";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:          linkURL,
				[Link.RESOLVED_URL]:   { href:baseURL },
				[Link.REBASED_URL]:    { href:baseURL },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: null,
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "ERRNO_ECONNREFUSED",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: true
			});
		});
	});



	describe("shall be broken with NO HOST from", () =>
	{
		it("an absolute url", async () =>
		{
			const baseURL = null;
			const linkURL = "http://";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]: baseURL,
				[Link.RESOLVED_URL]: null,
				[Link.REBASED_URL]: null,
				[Link.REDIRECTED_URL]: null,
				[Link.RESOLVED_BASE_URL]: null,
				[Link.REBASED_BASE_URL]: null,
				[Link.HTTP_RESPONSE]: null,
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "BLC_INVALID",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: null,
				[Link.IS_SAME_PAGE]: null
			});
		});



		it("a scheme-relative url", async () =>
		{
			const baseURL = null;
			const linkURL = "//blc1/normal/no-links.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]: linkURL,
				[Link.RESOLVED_URL]: null,
				[Link.REBASED_URL]: null,
				[Link.REDIRECTED_URL]: null,
				[Link.RESOLVED_BASE_URL]: null,
				[Link.REBASED_BASE_URL]: null,
				[Link.HTTP_RESPONSE]: null,
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "BLC_INVALID",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: null,
				[Link.IS_SAME_PAGE]: null
			});
		});



		it("a root-path-relative url", async () =>
		{
			const baseURL = null;
			const linkURL = "/normal/no-links.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]: linkURL,
				[Link.RESOLVED_URL]: null,
				[Link.REBASED_URL]: null,
				[Link.REDIRECTED_URL]: null,
				[Link.RESOLVED_BASE_URL]: null,
				[Link.REBASED_BASE_URL]: null,
				[Link.HTTP_RESPONSE]: null,
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "BLC_INVALID",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: null,
				[Link.IS_SAME_PAGE]: null
			});
		});



		it("a path-relative url", async () =>
		{
			const baseURL = null;
			const linkURL = "normal/no-links.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]: linkURL,
				[Link.RESOLVED_URL]: null,
				[Link.REBASED_URL]: null,
				[Link.REDIRECTED_URL]: null,
				[Link.RESOLVED_BASE_URL]: null,
				[Link.REBASED_BASE_URL]: null,
				[Link.HTTP_RESPONSE]: null,
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "BLC_INVALID",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: null,
				[Link.IS_SAME_PAGE]: null
			});
		});



		it("a query-relative url", async () =>
		{
			const baseURL = null;
			const linkURL = "?query";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]: linkURL,
				[Link.RESOLVED_URL]: null,
				[Link.REBASED_URL]: null,
				[Link.REDIRECTED_URL]: null,
				[Link.RESOLVED_BASE_URL]: null,
				[Link.REBASED_BASE_URL]: null,
				[Link.HTTP_RESPONSE]: null,
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "BLC_INVALID",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: null,
				[Link.IS_SAME_PAGE]: null
			});
		});



		it("a hash-relative url", async () =>
		{
			const baseURL = null;
			const linkURL = "#hash";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]: linkURL,
				[Link.RESOLVED_URL]: null,
				[Link.REBASED_URL]: null,
				[Link.REDIRECTED_URL]: null,
				[Link.RESOLVED_BASE_URL]: null,
				[Link.REBASED_BASE_URL]: null,
				[Link.HTTP_RESPONSE]: null,
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "BLC_INVALID",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: null,
				[Link.IS_SAME_PAGE]: null
			});
		});



		it("an empty url", async () =>
		{
			const baseURL = null;
			const linkURL = "";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]: linkURL,
				[Link.RESOLVED_URL]: null,
				[Link.REBASED_URL]: null,
				[Link.REDIRECTED_URL]: null,
				[Link.RESOLVED_BASE_URL]: null,
				[Link.REBASED_BASE_URL]: null,
				[Link.HTTP_RESPONSE]: null,
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "BLC_INVALID",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: null,
				[Link.IS_SAME_PAGE]: null
			});
		});
	});



	describe("shall be broken from", () =>
	{
		it("an unknown error", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL = "unknown/http-999.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:                       linkURL,
				[Link.RESOLVED_URL]:   { href:`${baseURL}${linkURL}` },
				[Link.REBASED_URL]:    { href:`${baseURL}${linkURL}` },
				[Link.REDIRECTED_URL]:        null,
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: { redirects:[], status:999 },
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "BLC_UNKNOWN",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});

			expect(result.get(Link.HTTP_RESPONSE).redirects).to.be.empty;
		});



		it("a data uri", async () =>
		{
			const baseURL = null;
			const linkURL = "data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH/C1hNUCBEYXRhWE1QAz94cAAsAAAAAAEAAQAAAgJEAQA7";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]: linkURL,
				[Link.RESOLVED_URL]: {},
				[Link.REBASED_URL]: {},
				[Link.REDIRECTED_URL]: null,
				[Link.RESOLVED_BASE_URL]: null,
				[Link.REBASED_BASE_URL]: null,
				[Link.HTTP_RESPONSE]: null,
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "BLC_INVALID",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: null,
				[Link.IS_SAME_PAGE]: null
			});
		});



		it("a tel uri", async () =>
		{
			const baseURL = null;
			const linkURL = "tel:+5-555-555-5555";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]: linkURL,
				[Link.RESOLVED_URL]: {},
				[Link.REBASED_URL]: {},
				[Link.REDIRECTED_URL]: null,
				[Link.RESOLVED_BASE_URL]: null,
				[Link.REBASED_BASE_URL]: null,
				[Link.HTTP_RESPONSE]: null,
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "BLC_INVALID",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: null,
				[Link.IS_SAME_PAGE]: null
			});
		});
	});



	describe("shall not be broken with a REDIRECTED url", () =>
	{
		it("containing no query or hash", async () =>
		{
			const baseURL       = "http://blc1/";
			const linkURL       = "http://blc1/redirect/redirect.html";
			const redirectedURL = "http://blc1/redirect/redirected.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:          linkURL,
				[Link.RESOLVED_URL]:   { href:linkURL },
				[Link.REBASED_URL]:    { href:linkURL },
				[Link.REDIRECTED_URL]: { href:redirectedURL },
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: { redirects:[] },
				[Link.IS_BROKEN]: false,
				[Link.BROKEN_REASON]: null,
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});

			expect(result.get(Link.HTTP_RESPONSE).redirects).to.have.length(2);
		});



		it("containing a query", async () =>
		{
			const baseURL       = "http://blc1/";
			const linkURL       = "http://blc1/redirect/redirect.html?query";
			const redirectedURL = "http://blc1/redirect/redirected.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:          linkURL,
				[Link.RESOLVED_URL]:   { href:linkURL },
				[Link.REBASED_URL]:    { href:linkURL },
				[Link.REDIRECTED_URL]: { href:redirectedURL },
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: { redirects:[] },
				[Link.IS_BROKEN]: false,
				[Link.BROKEN_REASON]: null,
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});

			expect(result.get(Link.HTTP_RESPONSE).redirects).to.have.length(2);
		});



		it("containing a hash", async () =>
		{
			const baseURL       = "http://blc1/";
			const linkURL       = "http://blc1/redirect/redirect.html#hash";
			const redirectedURL = "http://blc1/redirect/redirected.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.ORIGINAL_URL]:          linkURL,
				[Link.RESOLVED_URL]:   { href:linkURL },
				[Link.REBASED_URL]:    { href:linkURL },
				[Link.REDIRECTED_URL]: { href:redirectedURL },
				[Link.RESOLVED_BASE_URL]: { href:baseURL },
				[Link.REBASED_BASE_URL]:  { href:baseURL },
				[Link.HTTP_RESPONSE]: { redirects:[] },
				[Link.IS_BROKEN]: false,
				[Link.BROKEN_REASON]: null,
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null,
				[Link.IS_INTERNAL]: true,
				[Link.IS_SAME_PAGE]: false
			});

			expect(result.get(Link.HTTP_RESPONSE).redirects).to.have.length(2);
		});
	});



	describe("caching", () =>
	{
		it("stores the response", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const baseURL = new URL("http://blc1/");
			const linkURL = new URL("http://blc1/normal/no-links.html");
			const link = new Link().resolve(linkURL, baseURL);

			checkLink(link, defaultAuth, cache, options);

			let cached = cache.get(linkURL);
			expect(cached).to.be.a("promise");

			cached = await cached;
			expect(cached).not.to.be.a("promise");
			expect(cached).to.be.an("object");
		});



		it("stores the response of a redirected url", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const baseURL       = new URL("http://blc1/");
			const linkURL       = new URL("http://blc1/redirect/redirect.html");
			const redirectedURL = new URL("http://blc1/redirect/redirected.html");
			const link = new Link().resolve(linkURL, baseURL);
			const promise = checkLink(link, defaultAuth, cache, options);

			let cached = cache.get(redirectedURL);
			expect(cached).to.be.undefined;

			await promise;

			cached = cache.get(redirectedURL);
			expect(cached).not.to.be.a("promise");
			expect(cached).to.be.an("object");
		});



		it("stores the response of a 404", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const baseURL = new URL("http://blc1/");
			const linkURL = new URL("http://blc1/normal/fake.html");
			const link = new Link().resolve(linkURL, baseURL);

			checkLink(link, defaultAuth, cache, options);

			let cached = cache.get(linkURL);
			expect(cached).to.be.a("promise");

			cached = await cached;
			expect(cached).not.to.be.a("promise");
			expect(cached).not.to.be.an("error");
			expect(cached).to.be.an("object");
		});



		it("stores the response of a failed connection", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const baseURL = new URL("http://blc-dead/");
			const linkURL = new URL("http://blc-dead/path/to/resource.html");
			const link = new Link().resolve(linkURL, baseURL);

			checkLink(link, defaultAuth, cache, options);

			let cached = cache.get(linkURL);
			expect(cached).to.be.a("promise");

			cached = await cached;
			expect(cached).not.to.be.a("promise");
			expect(cached).to.be.an("error");
		});



		it("does not store the error from an erroneous url", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const baseURL = null;
			const linkURL = "/normal/fake.html";
			const link = new Link().resolve(linkURL, baseURL);

			await checkLink(link, defaultAuth, cache, options);
			expect(cache).to.have.length(0);
		});



		it("requests a unique url only once", async () =>
		{
			const options = parsedOptions({ cacheResponses:true });
			const baseURL = new URL("http://blc1/");
			const linkURL = new URL("http://blc1/normal/no-links.html");
			const link1 = new Link().resolve(linkURL, baseURL);
			const link2 = new Link().resolve(linkURL, baseURL);

			await checkLink(link1, defaultAuth, cache, options);
			const response1 = cache.get(linkURL);

			// Check URL again
			await checkLink(link2, defaultAuth, cache, options);
			const response2 = cache.get(linkURL);

			expect(response2).to.equal(response1);
		});
	});



	describe("options", () =>
	{
		it("acceptedSchemes = []", async () =>
		{
			const options = parsedOptions({ acceptedSchemes:[] });
			const baseURL = "http://blc1/";
			const linkURL = "http://blc1/normal/no-links.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, options);

			expect(result).to.containSubset(
			{
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "BLC_INVALID",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null
			});
		});



		it(`acceptedSchemes = ["http:","https:"]`, async () =>
		{
			const options = parsedOptions({ acceptedSchemes:["http:","https:"] });

			const link = url => new Link().resolve(url);

			let result = await checkLink(link("http://blc1/normal/no-links.html"), defaultAuth, cache, options);
			expect(result).to.containSubset(
			{
				[Link.IS_BROKEN]: false,
				[Link.BROKEN_REASON]: null,
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null
			});

			result = await checkLink(link("https://blc2/normal/no-links.html"), defaultAuth, cache, options);
			expect(result).to.containSubset(
			{
				[Link.IS_BROKEN]: false,
				[Link.BROKEN_REASON]: null,
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null
			});
		});



		it("retry405Head = false", async () =>
		{
			const baseURL = "http://blc1/";
			const linkURL = "http://blc1/method-not-allowed/head.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, parsedOptions());

			expect(result).to.containSubset(
			{
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "HTTP_405",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null
			});
		});



		it("retry405Head = false (#2)", async () =>
		{
			const options = parsedOptions({ requestMethod:GET_METHOD });
			const baseURL = "http://blc1/";
			const linkURL = "http://blc1/method-not-allowed/any.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, options);

			expect(result).to.containSubset(
			{
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "HTTP_405",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null
			});
		});



		it("retry405Head = true", async () =>
		{
			const options = parsedOptions({ retry405Head:true });
			const baseURL = "http://blc1/";
			const linkURL = "http://blc1/method-not-allowed/head.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, options);

			expect(result).to.containSubset(
			{
				[Link.IS_BROKEN]: false,
				[Link.BROKEN_REASON]: null,
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null
			});
		});



		it("retry405Head = true (#2)", async () =>
		{
			const options = parsedOptions({ retry405Head:true });
			const baseURL = "http://blc1/";
			const linkURL = "http://blc1/method-not-allowed/any.html";
			const link = new Link().resolve(linkURL, baseURL);

			const result = await checkLink(link, defaultAuth, cache, options);

			expect(result).to.containSubset(
			{
				[Link.IS_BROKEN]: true,
				[Link.BROKEN_REASON]: "HTTP_405",
				[Link.WAS_EXCLUDED]: null,
				[Link.EXCLUDED_REASON]: null
			});
		});
	});
});
