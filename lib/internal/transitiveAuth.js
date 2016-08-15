import isURL from "isurl";



const defaultAuth = Object.freeze({ password:"", username:"" });



/*
	Possibly override `auth` with that from `url`.
*/
export default (url, auth=defaultAuth) =>
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

		// TODO :: is this the kind of result we want, with auth stored in `http` ?
		url.password = "";
		url.username = "";
	}

	return { auth, url };
};
