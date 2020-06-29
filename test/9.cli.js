"use strict";
var helpers = require("./helpers");

var expect = require("chai").expect;

var conn;



describe("CLI", function()
{
	before( function()
	{
		return helpers.startConnections().then( function(connections)
		{
			conn = connections;
		});
	});
	
	
	
	after( function()
	{
		return helpers.stopConnections(conn.realPorts);
	});
	
	
	
	it.skip("works", function(done)
	{
		done();
	});
});
