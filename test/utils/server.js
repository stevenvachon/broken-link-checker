"use strict";
var http = require("http");
var https = require("https");
var nodeStatic = require("node-static");
var path = require("path");

var fileServer = new nodeStatic.Server( path.join(__dirname,"../") );
var host = "127.0.0.1";
var httpServers = {};



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



function startHttpServer()
{
	return new Promise( function(resolve, reject)
	{
		var port;
		var server = http.createServer(startHttpServer_callback);
		
		// OS will return availabe port by point to port 0
		server.listen(0, host, function()
		{
			port = server.address().port;
			httpServers[port] = server;
			resolve(port);
		});
	});
}



function startHttpServer_callback(request, response)
{
	request.addListener("end", function()
	{
		switch (request.url)
		{
			case "/fixtures/redirect.html":
			{
				// Redirect
				response.writeHead(302, { "Location":"/fixtures/redirect2.html" });
				response.end();
				break;
			}
			case "/fixtures/redirect2.html":
			{
				// Redirect
				response.writeHead(301, { "Location":"/fixtures/index.html" });
				response.end();
				break;
			}
			default:
			{
				// Serve file
				fileServer.serve(request, response, function(error, result)
				{
					if (error !== null)
					{
						response.writeHead(error.status, error.headers);
						response.end();
					}
				});
			}
		}
	}).resume();
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
				startHttpServer().then(started);
			}
			else
			{
				// All servers started
				resolve(result);
			}
		}
		
		// Start first server
		startHttpServer().then(started);
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
