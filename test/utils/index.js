"use strict";
var server = require("./server");



module.exports = 
{
	getTagsString: require("./getTagsString"),
	options: require("./options"),
	startConnections: server.startConnections,
	stopConnections: server.stopConnections
};
