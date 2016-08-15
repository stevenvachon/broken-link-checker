import {ERROR_EVENT} from "../internal/events";
import {EventEmitter} from "events";



export default class SafeEventEmitter extends EventEmitter
{
	/**
	 * Emit an event while catching any errors within consumer handlers.
	 * @param {string} type
	 * @param {...*} args
	 */
	emit(type, ...args)
	{
		try
		{
			super.emit(type, ...args);
		}
		catch (error)
		{
			super.emit(ERROR_EVENT, error);
		}
	}
}
