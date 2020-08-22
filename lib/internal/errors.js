export const HTML_MIMETYPES = [
    // https://www.w3.org/TR/xhtml-media-types/
    "application/xhtml+xml",
    "application/xml",
    "text/html",
    "text/xml",
];

export class ExpectedHTMLError extends TypeError
{
	/**
	 * @param {string} mimeType
	 * @param {number|string} statusCode
	 */
	constructor(mimeType="", statusCode)
	{
		if (mimeType !== "")
		{
			mimeType = ` but got "${mimeType}"`;
		}

		super(`Expected type "` + HTML_MIMETYPES.join('", "') + `"${mimeType}`);
		this.code = statusCode;
	}
}



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
