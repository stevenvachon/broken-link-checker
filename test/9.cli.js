"use strict";
var utils = require("./utils");

var expect = require("chai").expect;

var conn;



describe("CLI", function()
{
	before( function()
	{
		return utils.startConnections().then( function(connections)
		{
			conn = connections;
		});
	});
	
	
	
	after( function()
	{
		return utils.stopConnections(conn.realPorts);
	});
	
	
	
	it.skip("should work", function(done)
	{
		done();
	});
});
