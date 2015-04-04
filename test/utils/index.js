"use strict";
var server = require("./server");



module.exports = 
{
	getTagsString: require("./getTagsString"),
	options: require("./options"),
	startConnection:  server.startConnection,
	startConnections: server.startConnections,
	stopConnection:   server.stopConnection,
	stopConnections:  server.stopConnections
};
