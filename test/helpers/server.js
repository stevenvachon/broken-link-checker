"use strict";
var fixture = require("./fixture");

var http = require("http");
var st = require("st");

var host = "127.0.0.1";
var httpServers = {};
var serveFile = st({ index:"index.html", path:fixture.path() });



function getAvailablePort()
{
	return new Promise( function(resolve, reject)
	{
		var port;
		var server = http.createServer();
		
		// OS will return availabe port by point to port 0
		server.listen(0, host, function()
		{
			port = server.address().port;
			server.close();
			resolve(port);
		});
	});
}



function getUrl(port, schemeRelative)
{
	if (schemeRelative !== true)
	{
		return "http://"+host+":"+port;
	}
	else
	{
		return "//"+host+":"+port;
	}
}



function startHttpServer(suitePorts)
{
	return new Promise( function(resolve, reject)
	{
		var port;
		var server = http.createServer( function(request, response)
		{
			startHttpServer_callback(request, response, port, suitePorts);
		});
		
		// OS will return available port by pointing to port 0
		server.listen(0, host, function()
		{
			port = server.address().port;
			httpServers[port] = server;
			resolve(port);
		});
	});
}



function startHttpServer_callback(request, response, port, suitePorts)
{
	switch (request.url)
	{
		case "/circular-redirect/redirect.html":
		{
			// Redirect
			response.writeHead(302, { "Location":"/circular-redirect/redirected.html" });
			response.end();
			return;
		}
		case "/disallowed/header.html":
		{
			// Add header
			response.setHeader("X-Robots-Tag", "nofollow");
			//response.setHeader("X-Robots-Tag: unavailable_after", "1-Jan-3000 00:00:00 EST");
			//response.setHeader("X-Robots-Tag", "unavailable_after: 1-Jan-3000 00:00:00 EST");
			break;
		}
		case "/method-not-allowed/any.html":
		{
			// Error
			response.writeHead(405);
			response.end();
			return;
		}
		case "/method-not-allowed/head.html":
		{
			if (request.method.toLowerCase() === "head")
			{
				// Error
				response.writeHead(405);
				response.end();
				return;
			}
			
			// Serve file
			break;
		}
		case "/external-redirect/redirect.html":
		{
			// This fixture requires at least servers
			if (suitePorts.length < 2)
			{
				// Cannot redirect to another server -- make sure test fails
				response.writeHead(500);
				response.end();
				return;
			}
			
			for (var i=1; i<suitePorts.length; i++)
			{
				if (suitePorts[i] !== port)
				{
					// Redirect first test suite port to next port in suite
					response.writeHead(302, { "Location":"http://"+host+":"+suitePorts[i]+"/external-redirect/redirected.html" });
					response.end();
					return;
				}
			}
			
			// Serve file
			break;
		}
		case "/redirect/redirect.html":
		{
			// Redirect
			response.writeHead(302, { "Location":"/redirect/redirect2.html" });
			response.end();
			return;
		}
		case "/redirect/redirect2.html":
		{
			// Redirect
			response.writeHead(301, { "Location":"/redirect/redirected.html" });
			response.end();
			return;
		}
	}
	
	serveFile(request, response);
}



function startHttpServers(numServers)
{
	return new Promise( function(resolve, reject)
	{
		var result = 
		{
			ports: [],
			absoluteUrls: [],
			schemeRelativeUrls: []
		};
		
		/*if (numServers < 1)
		{
			resolve(result);
			return;
		}*/
		
		function started(port)
		{
			result.ports.push(port);
			result.absoluteUrls.push( getUrl(port) );
			result.schemeRelativeUrls.push( getUrl(port,true) );
			
			// If more servers to start
			if (result.ports.length < numServers)
			{
				// Start next one
				startHttpServer(result.ports).then(started);
			}
			else
			{
				// All servers started
				resolve(result);
			}
		}
		
		// Start first server
		startHttpServer(result.ports).then(started);
	});
}



function stopHttpServer(port)
{
	return new Promise( function(resolve, reject)
	{
		httpServers[port].close( function()
		{
			delete httpServers[port];
			
			resolve();
		});
	});
}



function stopHttpServers(ports)
{
	return new Promise( function(resolve, reject)
	{
		/*if (ports.length === 0)
		{
			resolve();
			return;
		}*/
		
		function stopped()
		{
			if (++count >= ports.length)
			{
				resolve();
			}
		}
		
		var count = 0;
		
		for (var i=0; i<ports.length; i++)
		{
			stopHttpServer( ports[i] ).then(stopped);
		}
	});
}



//::: PUBLIC API



function startConnection()
{
	var absoluteUrls,ports,schemeRelativeUrls;
	
	return startHttpServers(1).then( function(data)
	{
		absoluteUrls = data.absoluteUrls;
		ports = data.ports;
		schemeRelativeUrls = data.schemeRelativeUrls;
		
		return getAvailablePort();
	})
	.then( function(port)
	{
		return {
			realPort: ports[0],
			absoluteUrl: absoluteUrls[0],
			relativeUrl: schemeRelativeUrls[0],
			
			fakePort: port,
			fakeAbsoluteUrl: getUrl(port),
			fakeRelativeUrl: getUrl(port,true)
		};
	});
}



function startConnections()
{
	var absoluteUrls,ports,schemeRelativeUrls;
	
	return startHttpServers(2).then( function(data)
	{
		absoluteUrls = data.absoluteUrls;
		ports = data.ports;
		schemeRelativeUrls = data.schemeRelativeUrls;
		
		return getAvailablePort();
	})
	.then( function(port)
	{
		return {
			realPorts: ports,
			absoluteUrls: absoluteUrls,
			relativeUrls: schemeRelativeUrls,
			
			fakePort: port,
			fakeAbsoluteUrl: getUrl(port),
			fakeRelativeUrl: getUrl(port,true)
		};
	});
}



function stopConnection(port)
{
	return stopHttpServer(port);
}



function stopConnections(ports)
{
	return stopHttpServers(ports);
}



module.exports = 
{
	startConnection:  startConnection,
	startConnections: startConnections,
	stopConnection:   stopConnection,
	stopConnections:  stopConnections
};
