"use strict";
const {createReadStream, readFileSync} = require("fs");
const {resolve:resolvePath} = require("path");

const fixturePath = (path="") => resolvePath(`${__dirname}/../fixtures/${path}`);

const fixtureStream = path => createReadStream(fixturePath(path));

const fixtureString = path => readFileSync(fixturePath(path), "utf8");



module.exports =
{
	path: fixturePath,
	stream: fixtureStream,
	string: fixtureString
};
