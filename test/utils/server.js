"use strict";
var http = require("http");
var https = require("https");
var nodeStatic = require("node-static");
var path = require("path");
var portscanner = require("portscanner");

var fileServer = new nodeStatic.Server( path.join(__dirname,"../") );
var host = "127.0.0.1";
var httpServers = {};



function getAvailablePort(callback)
{
	portscanner.findAPortNotInUse(3000, 3030, host, function(error, port)
	{
		if (error) throw error;
		callback(port);
	})
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



function startHttpServer(callback)
{
	getAvailablePort( function(port)
	{
		httpServers[port] = http.createServer( function(request, response)
		{
			request.addListener("end", function()
			{
				switch (request.url)
				{
					case "/fixture/redirect.html":
					{
						// Redirect
						response.writeHead(302, { "Location":"/fixture/redirect2.html" });
						response.end();
						break;
					}
					case "/fixture/redirect2.html":
					{
						// Redirect
						response.writeHead(301, { "Location":"/fixture/index.html" });
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
		}).listen(port, host);
		
		callback(port);
	});
}



function startHttpServers(numServers, callback)
{
	var ports = [];
	var absoluteUrls = [];
	var schemeRelativeUrls = [];
	
	/*if (numServers < 1)
	{
		callback(ports, absoluteUrls, schemeRelativeUrl);
		return;
	}*/
	
	function started(port)
	{
		ports.push(port);
		absoluteUrls.push( getUrl(port) );
		schemeRelativeUrls.push( getUrl(port,true) );
		
		// If more servers to start
		if (ports.length < numServers)
		{
			// Start next one
			startHttpServer(started);
		}
		else
		{
			// All servers started
			callback(ports, absoluteUrls, schemeRelativeUrls);
		}
	}
	
	// Start first server
	startHttpServer(started);
}



function stopHttpServer(port, callback)
{
	httpServers[port].close( function()
	{
		delete httpServers[port];
		
		callback();
	});
}



function stopHttpServers(ports, callback)
{
	/*if (ports.length === 0)
	{
		callback();
		return;
	}*/
	
	function stopped()
	{
		if (++count >= ports.length)
		{
			callback();
		}
	}
	
	var count = 0;
	
	for (var i=0; i<ports.length; i++)
	{
		stopHttpServer(ports[i], stopped);
	}
}



//::: PUBLIC API



function startConnection(callback)
{
	startHttpServers(1, function(ports, absoluteUrls, schemeRelativeUrls)
	{
		getAvailablePort( function(port)
		{
			callback(
			{
				realPort: ports[0],
				absoluteUrl: absoluteUrls[0],
				relativeUrl: schemeRelativeUrls[0],
				
				fakePort: port,
				fakeAbsoluteUrl: getUrl(port),
				fakeRelativeUrl: getUrl(port,true)
			});
		});
	});
}



function startConnections(callback)
{
	startHttpServers(2, function(ports, absoluteUrls, schemeRelativeUrls)
	{
		getAvailablePort( function(port)
		{
			callback(
			{
				realPorts: ports,
				absoluteUrls: absoluteUrls,
				relativeUrls: schemeRelativeUrls,
				
				fakePort: port,
				fakeAbsoluteUrl: getUrl(port),
				fakeRelativeUrl: getUrl(port,true)
			});
		});
	});
}



function stopConnection(port, callback)
{
	stopHttpServer(port, callback);
}



function stopConnections(ports, callback)
{
	stopHttpServers(ports, callback);
}



module.exports = 
{
	startConnection:  startConnection,
	startConnections: startConnections,
	stopConnection:   stopConnection,
	stopConnections:  stopConnections
};
