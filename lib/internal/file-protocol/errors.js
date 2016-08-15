export class ExpectedHTMLExtensionError extends TypeError
{
	/**
	 * @param {string} extension
	 */
	constructor(extension = "")
	{
		if (extension !== "")
		{
			extension = ` but got "${extension}"`;
		}

		super(`Expected a compatible HTML file extension$"{extension}`);
	}
}
