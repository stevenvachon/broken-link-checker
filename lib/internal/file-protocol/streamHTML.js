import {createReadStream} from "fs";
import {ExpectedHTMLExtensionError} from "./errors";
import {extname} from "path";
import {HTMLRetrievalError} from "../errors";



const FILE_EXTENSIONS = [".htm", ".html", ".xht", ".xhtml"];

const ERROR_EVENT = "error";
const OPEN_EVENT = "open";



/**
 * Read a file URL for its HTML contents.
 * @param {URL} url
 * @throws {ExpectedHTMLExtensionError} if not HTML media type
 * @throws {HTMLRetrievalError} file not found, etc
 * @returns {Promise<Stream>}
 * @todo return {response, stream} structure to be consistent with HTTP, and thereby support other protocols?
 */
export default url => new Promise((resolve, reject) =>
{
	const pathFileExtension = extname(url.pathname);

	if (!FILE_EXTENSIONS.some(ext => pathFileExtension === ext))
	{
		throw new ExpectedHTMLExtensionError(pathFileExtension);
	}
	else
	{
		const stream = createReadStream(url);

		stream.on(ERROR_EVENT, ({code}) => reject(new HTMLRetrievalError(code)));
		stream.on(OPEN_EVENT, () => resolve(stream));
	}
});
