"use strict";
var server        = require("./server");
var testGenerator = require("./testGenerator");

var chai = require("chai");
chai.config.includeStack = true;
chai.use( require("chai-as-promised") );
chai.use( require("chai-like") );

require("es6-promise").polyfill();
require("object.assign").shim();



module.exports = 
{
	a_an:       testGenerator.a_an,
	addSlashes: testGenerator.addSlashes,
	format:     testGenerator.format,
	italic:     testGenerator.italic,
	
	logLinkObj: require("./logLinkObj"),
	options:    require("./options"),
	
	startConnection:  server.startConnection,
	startConnections: server.startConnections,
	stopConnection:   server.stopConnection,
	stopConnections:  server.stopConnections,
	
	tagsString: require("./tagsString")
};
