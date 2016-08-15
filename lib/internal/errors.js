export {ExpectedHTMLExtensionError} from "./file-protocol";
export {ExpectedHTMLMediaTypeError} from "./http-protocol";

export class HTMLRetrievalError extends Error
{
	/**
	 * @param {number|string} statusCode
	 */
	constructor(statusCode)
	{
		super("HTML could not be retrieved");
		this.code = statusCode;
	}
}
