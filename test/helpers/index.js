"use strict";
const server = require("./server");

require("chai")
.use( require("chai-as-promised") )
.use( require("chai-subset") )
.use( require("chai-things") )
.config.includeStack = true;



module.exports =
{
	options:    require("./options"),

	startDeadServer:  server.startDead,
	startDeadServers: server.startDead,
	startServer:      server.start,
	startServers:     server.start,
	stopServers:      server.stop,

	tagsString: require("./tagsString"),

	fixture: require("./fixture")
};
