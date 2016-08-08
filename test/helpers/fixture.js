"use strict";
var fs = require("fs");
var pathlib = require("path");



function fixturePath(path)
{
	if (path == null) path = "";
	
	return pathlib.resolve( __dirname + "/../fixtures/" + path );
}



function fixtureStream(path)
{
	return fs.createReadStream(fixturePath(path));
}



function fixtureString(path)
{
	return fs.readFileSync(fixturePath(path), {encoding:"utf8"});
}



module.exports = 
{
	path: fixturePath,
	stream: fixtureStream,
	string: fixtureString
};
