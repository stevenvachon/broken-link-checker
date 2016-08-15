import basicAuthHeader from "basic-auth-header";
import {createDeflate, createGzip} from "zlib";
import {createReadStream} from "fs";
import escapeStringRegexp from "escape-string-regexp";
import {fixturePath} from "./fixture";
import {GET_METHOD, HEAD_METHOD} from "../../lib/internal/methods";
import nock from "nock";



const addDeadMock = (...urls) =>
{
	const error = new Error("mocked ECONNREFUSED");
	const pattern = pathPattern("/path/to/resource.html");

	error.code = "ECONNREFUSED";

	urls.forEach(url =>
	{
		nock(url)
		.persist().get(pattern).replyWithError(error)
		.persist().head(pattern).replyWithError(error);
	});
};



/* eslint-disable sort-keys */
const addMock = (...urls) => urls.forEach((url, i) =>
{
	const instance = nock(url);

	intercept(instance,
	{
		path: /^.*404\.html.*$/,
		methods:
		{
			all: { statusCode:404 }
		}
	});

	intercept(instance,
	{
		path: /^.*500\.html.*$/,
		methods:
		{
			all: { statusCode:500 }
		}
	});

	intercept(instance,
	{
		path: ["/", "/index.html"],
		methods:
		{
			all:
			{
				body: stream("/index.html"),
				headers: { "content-type":"text/html" },
				statusCode: 200
			}
		}
	});

	intercept(instance,
	{
		path: "/auth/index.html",
		auth: { user:"user", pass:"pass" },
		methods:
		{
			all:
			{
				body: stream("/auth/index.html"),
				headers: { "content-type":"text/html" },
				statusCode: 200
			}
		}
	});

	intercept(instance,
	{
		path: "/auth/intransitive.html",
		auth: { user:"user2", pass:"pass2" },
		methods:
		{
			all:
			{
				body: stream("/auth/intransitive.html"),
				headers: { "content-type":"text/html" },
				statusCode: 200
			}
		}
	});

	intercept(instance,
	{
		path: "/auth/transitive.html",
		auth: { user:"user", pass:"pass" },
		methods:
		{
			all:
			{
				body: stream("/auth/transitive.html"),
				headers: { "content-type":"text/html" },
				statusCode: 200
			}
		}
	});

	intercept(instance,
	{
		path: "/auth/transitive-redirect.html",
		auth: { user:"user", pass:"pass" },
		methods:
		{
			all:
			{
				headers:
				{
					"content-type": "text/html",
					location: "/auth/transitive-redirected.html"
				},
				statusCode: 302
			}
		}
	});

	intercept(instance,
	{
		path: "/auth/transitive-redirected.html",
		auth: { user:"user", pass:"pass" },
		methods:
		{
			all:
			{
				body: stream("/auth/transitive-redirected.html"),
				headers: { "content-type":"text/html" },
				statusCode: 200
			}
		}
	});

	intercept(instance,
	{
		path: "/circular-redirect/redirect.html",
		methods:
		{
			all:
			{
				headers:
				{
					"content-type": "text/html",
					location: "/circular-redirect/redirected.html"
				},
				statusCode: 302
			}
		}
	});

	intercept(instance,
	{
		path: "/compression/deflate.html",
		methods:
		{
			all:
			{
				body: stream("/compression/deflate.html", "deflate"),
				headers:
				{
					"content-encoding": "deflate",
					"content-type": "text/html"
				},
				statusCode: 200
			}
		}
	});

	intercept(instance,
	{
		path: "/compression/gzip.html",
		methods:
		{
			all:
			{
				body: stream("/compression/gzip.html", "gzip"),
				headers:
				{
					"content-encoding": "gzip",
					"content-type": "text/html"
				},
				statusCode: 200
			}
		}
	});

	intercept(instance,
	{
		path: "/disallowed/header.html",
		methods:
		{
			all:
			{
				body: stream("/disallowed/header.html"),
				headers:
				{
					"content-type": "text/html",
					"x-robots-tag": "nofollow"/*,
					"x-robots-tag: unavailable_after": "1-Jan-3000 00:00:00 EST"*/
				},
				statusCode: 200
			}
		}
	});

	intercept(instance,
	{
		path: "/method-not-allowed/any.html",
		methods:
		{
			all: { statusCode:405 }
		}
	});

	intercept(instance,
	{
		path: "/method-not-allowed/head.html",
		methods:
		{
			get:
			{
				body: stream("/method-not-allowed/head.html"),
				headers: { "content-type":"text/html" },
				statusCode: 200
			},
			head:
			{
				statusCode: 405
			}
		}
	});

	intercept(instance,
	{
		path: "/non-html/empty",
		methods:
		{
			all:
			{
				body: stream("/non-html/empty"),
				statusCode: 200
			}
		}
	});

	intercept(instance,
	{
		path: "/non-html/image.gif",
		methods:
		{
			all:
			{
				body: stream("/non-html/image.gif"),
				headers: { "content-type":"image/gif" },
				statusCode: 200
			}
		}
	});

	intercept(instance,
	{
		path: "/redirect/redirect.html",
		methods:
		{
			all:
			{
				headers:
				{
					"content-type": "text/html",
					location: "/redirect/redirect2.html"
				},
				statusCode: 302
			}
		}
	});

	intercept(instance,
	{
		path: "/redirect/redirect2.html",
		methods:
		{
			all:
			{
				headers:
				{
					"content-type": "text/html",
					location: "/redirect/redirected.html"
				},
				statusCode: 301
			}
		}
	});

	intercept(instance,
	{
		path: "/unknown/http-999.html",
		methods:
		{
			all: { statusCode:999 }
		}
	});

	intercept(instance,
	{
		path: "/robots.txt",
		methods:
		{
			all:
			{
				body: stream("/robots.txt"),
				headers: { "content-type":"text/plain" },
				statusCode: 200
			}
		}
	});

	[
		"/circular/index.html",
		"/circular/no-links.html",
		"/circular/with-links.html",
		"/circular-redirect/redirected.html",
		"/disallowed/header2.html",
		"/disallowed/index.html",
		"/disallowed/meta.html",
		"/disallowed/meta2.html",
		"/disallowed/rel.html",
		"/disallowed/rel2.html",
		"/disallowed/robots-txt.html",
		"/disallowed/robots-txt2.html",
		"/external-redirect/index.html",
		"/external-redirect/redirected.html",
		"/redirect/index.html",
		"/redirect/redirected.html",
		"/simple/index.html",
		"/simple/no-links.html",
		"/simple/with-links.html"
	]
	.forEach(path => intercept(instance,
	{
		path,
		methods:
		{
			all:
			{
				body: stream(path),
				headers: { "content-type":"text/html" },
				statusCode: 200
			}
		}
	}));

	// These fixtures require multiple mocks
	if (urls.length >= 2)
	{
		if (i === 0)
		{
			// Redirect first mock to next mock
			// @todo make this more explicit in test suite somehow -- special case object for server, created per test?
			intercept(instance,
			{
				path: "/auth/intransitive-redirect.html",
				auth: { user:"user", pass:"pass" },
				methods:
				{
					all:
					{
						headers:
						{
							"content-type": "text/html",
							location: new URL("/auth/intransitive-redirected.html", urls[1]).href
						},
						statusCode: 302
					}
				}
			});

			intercept(instance,
			{
				path: "/external-redirect/redirect.html",
				methods:
				{
					all:
					{
						headers:
						{
							"content-type": "text/html",
							location: new URL("/external-redirect/redirected.html", urls[1]).href
						},
						statusCode: 302
					}
				}
			});
		}
		else if (i === 1)
		{
			intercept(instance,
			{
				path: "/auth/intransitive-redirected.html",
				auth: { user:"user", pass:"pass" },
				methods:
				{
					all:
					{
						body: stream("/auth/intransitive-redirected.html"),
						headers: { "content-type":"text/html" },
						statusCode: 200
					}
				}
			});
		}
	}
	else
	{
		// Cannot redirect to another mock -- make sure tests fail
		intercept(instance,
		{
			path: "/auth/intransitive-redirect.html",
			methods:
			{
				all: { statusCode:500 }
			}
		});

		intercept(instance,
		{
			path: "/external-redirect/redirect.html",
			methods:
			{
				all: { statusCode:500 }
			}
		});
	}
});
/* eslint-disable sort-keys */



const intercept = (nockInstance, {auth, methods, path}) =>
{
	if (auth)
	{
		auth = basicAuthHeader(auth.user, auth.pass);
	}

	if (methods.all)
	{
		methods.get  = methods.all;
		methods.head = methods.all;
	}

	if (!Array.isArray(path))
	{
		path = [path];
	}

	if (auth && methods.get.headers)
	{
		methods.get.headers.authorization = auth;
	}

	if (auth && methods.head.headers)
	{
		methods.head.headers.authorization = auth;
	}

	if (typeof methods.get.body !== "function")
	{
		methods.get.body = () => null;
	}

	const response = method =>
	{
		return function callback(/*url, requestBody*/)
		{
			if (!auth)
			{
				return [
					methods[method].statusCode,
					method===GET_METHOD ? methods.get.body() : null,
					methods[method].headers
				];
			}
			else if (auth && this.req.headers.authorization===auth)
			{
				return [
					methods[method].statusCode,
					method===GET_METHOD ? methods.get.body() : null,
					{
						authorization: this.req.headers.authorization,
						...methods[method].headers
					}
				];
			}
			else
			{
				return [401, null, {}];
			}
		};
	};

	path.forEach(path =>
	{
		const pattern = pathPattern(path);

		if (methods.get)
		{
			nockInstance.persist().get(pattern).reply(response(GET_METHOD));
		}

		if (methods.head)
		{
			nockInstance.persist().head(pattern).reply(response(HEAD_METHOD));
		}
	});
};



const pathPattern = path =>
{
	if (path instanceof RegExp)
	{
		return path;
	}
	else
	{
		path = escapeStringRegexp(path);

		path += "(?:\\?(?:.+)?)?";  // adds support for possible queries
		path += "(?:\\#(?:.+)?)?";  // adds support for possible hashes

		return new RegExp(`^${path}$`);
	}
};



const removeMocks = () => nock.cleanAll();



const stream = (path, compression=false) => () =>
{
	const stream = createReadStream( fixturePath(path) );

	if (compression === "deflate")
	{
		return stream.pipe(createDeflate());
	}
	else if (compression === "gzip")
	{
		return stream.pipe(createGzip());
	}
	else
	{
		return stream;
	}
};



export {addMock as start};
export {addDeadMock as startDead};
export {removeMocks as stop};
