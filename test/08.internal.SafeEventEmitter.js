import {describe, it} from "mocha";
import {ERROR_EVENT} from "../lib/internal/events";
import {expect} from "chai";
import {ExpectedError} from "./helpers";
import SafeEventEmitter from "../lib/internal/SafeEventEmitter";



const CUSTOM_EVENT = "custom";



describe("INTERNAL -- SafeEventEmitter", () =>
{
	it("behaves the same as EventEmitter", done =>
	{
		new SafeEventEmitter()
		.on(CUSTOM_EVENT, (...args) =>
		{
			expect(args).to.have.length(2);
			done();
		})
		.emit(CUSTOM_EVENT, 0, 1);
	});



	it(`throws errors from event handlers when there is no "${ERROR_EVENT}" handler`, done =>
	{
		try
		{
			new SafeEventEmitter()
			.on(CUSTOM_EVENT, () =>
			{
				throw new ExpectedError();
			})
			.emit(CUSTOM_EVENT);
		}
		catch (error)
		{
			expect(error).to.be.an("error");
			done();
		}
	});



	it(`catches errors from event handlers when there is an "${ERROR_EVENT}" handler`, done =>
	{
		new SafeEventEmitter()
		.on(CUSTOM_EVENT, () =>
		{
			throw new ExpectedError();
		})
		.on(ERROR_EVENT, (error, ...remainingArgs) =>
		{
			expect(remainingArgs).to.be.empty;
			expect(error).to.be.an("error");
			done();
		})
		.emit(CUSTOM_EVENT);
	});



	it(`avoids an endless loop from an error within the "${ERROR_EVENT}" handler`, done =>
	{
		let errorDispatches = 0;
		let errorsThrown = 0;

		try
		{
			new SafeEventEmitter()
			.on(CUSTOM_EVENT, () =>
			{
				errorsThrown++;
				throw new ExpectedError();
			})
			.on(ERROR_EVENT, () =>
			{
				errorDispatches++;
				errorsThrown++;
				throw new ExpectedError();
			})
			.emit(CUSTOM_EVENT);
		}
		catch (error)
		{
			expect(errorDispatches).to.equal(1);
			expect(errorsThrown).to.equal(2);
			expect(error).to.be.an("error");
			done();
		}
	});
});
