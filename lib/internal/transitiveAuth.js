import isURL from "isurl";



const DEFAULT_AUTH = Object.freeze({ password:"", username:"" });



/**
 * Possibly override `auth` with that from `url`.
 * @param {URL} url
 * @param {object} [auth]
 * @returns {object}
 */
export default (url, auth=DEFAULT_AUTH) =>
{
	if (!isURL.lenient(url))
	{
		throw new TypeError("Invalid URL");
	}
	else if (url.username!=="" || url.password!=="")
	{
		// Clone to avoid mutation
		url = new URL(url);

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
