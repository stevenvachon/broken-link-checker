"use strict";
var server        = require("./server");
var testGenerator = require("./testGenerator");

require("es6-promise").polyfill();



module.exports = 
{
	a_an:   testGenerator.a_an,
	format: testGenerator.format,
	italic: testGenerator.italic,
	
	logLinkObj: require("./logLinkObj"),
	options:    require("./options"),
	
	startConnection:  server.startConnection,
	startConnections: server.startConnections,
	stopConnection:   server.stopConnection,
	stopConnections:  server.stopConnections,
	
	tagsString: require("./tagsString")
};
