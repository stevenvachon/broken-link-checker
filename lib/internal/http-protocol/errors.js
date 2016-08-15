export class ExpectedHTMLMediaTypeError extends TypeError
{
	/**
	 * @param {string} mediaType
	 * @param {number|string} statusCode
	 */
	constructor(mediaType="", statusCode)
	{
		if (mediaType !== "")
		{
			mediaType = ` but got "${mediaType}"`;
		}

		super(`Expected a compatible (X)HTML media type$"{mediaType}`);
		this.code = statusCode;
	}
}
