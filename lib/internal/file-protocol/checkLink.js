import {REBASED_URL} from "../Link";
import {stat as statFile} from "fs/promises";



/**
 * Check a link on the local file system.
 * @param {Link} link
 * @returns {Promise<Link>}
 */
export default async link =>
{
	try
	{
		const {isDirectory} = await statFile(link.get(REBASED_URL).pathname);

		if (isDirectory())
		{
			link.exclude("BLC_DIRECTORY");
		}
		else
		{
			link.mend();
		}
	}
	// @todo possible that a `Link` method could fail; then set BLC_UNKNOWN ?
	catch ({code})
	{
		link.break(`ERRNO_${code}`);
	}

	return link;
};
