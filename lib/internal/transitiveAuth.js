"use strict";
const isURL = require("isurl");
const {URL} = require("universal-url");

const defaultAuth = { username:"", password:"" };



/*
	Possibly override `auth` with that from `url`.
*/
function transitiveAuth(url, auth=defaultAuth)
{
	if (!isURL.lenient(url) || url.username!=="" || url.password!=="")
	{
		// Parse or clone if necessary
		url = new URL(url);
	}

	if (url!=null && (url.username!=="" || url.password!==""))
	{
		auth =
		{
			password: url.password,
			username: url.username
		};

		// TODO :: is this the kind of result we want, with auth stored in `http` ? ask joepie91
		url.password = "";
		url.username = "";
	}

	return { url, auth };
}



module.exports = transitiveAuth;
