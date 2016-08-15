import isURL from "isurl";



const DEFAULT_AUTH = Object.freeze({ password:"", username:"" });



/**
 * Possibly override `auth` with that from `url`.
 * @param {URL|string} url
 * @param {object} [auth]
 * @returns {object}
 */
export default (url, auth=DEFAULT_AUTH) =>
{
	if (!isURL.lenient(url) || url.username!=="" || url.password!=="")
	{
		// Parse or clone if necessary
		url = new URL(url);
	}

	if (url.username!=="" || url.password!=="")
	{
		auth =
		{
			password: url.password,
			username: url.username
		};

		// @todo is this the kind of result we want, with auth stored in `http` ?
		url.password = "";
		url.username = "";
	}

	return { auth, url };
};
