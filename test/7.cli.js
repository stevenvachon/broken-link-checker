"use strict";
var utils = require("./utils");

var expect = require("chai").expect;

var conn;



describe("CLI", function()
{
	before( function(done)
	{
		utils.startConnections( function(connections)
		{
			conn = connections;
			done();
		});
	});
	
	
	
	after( function(done)
	{
		utils.stopConnections(conn.realPorts, done);
	});
	
	
	
	it.skip("should work", function(done)
	{
		done();
	});
});
