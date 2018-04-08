"use strict";

var fs			   = require('fs');
var stripAnsi      = require('strip-ansi');

var brokenLinkLogs = "";
var brokenLinkLogPath = `${__dirname}/brokenLinks.txt`;

var logBrokenToFile = true;
var shouldDeleteFile = true;

var addToBrokenLogs = function(logData)
{
    brokenLinkLogs += `${logData}\n`;   
};

var clearData = function()
{   
    brokenLinkLogs = "";
};

var write = function()
{
    if(shouldDeleteFile === true && fs.existsSync(brokenLinkLogPath))
    {        
        fs.unlinkSync(brokenLinkLogPath);
        shouldDeleteFile = false;
    }

    fs.appendFileSync(brokenLinkLogPath, stripAnsi(brokenLinkLogs));

    clearData();
};

module.exports = {
    addToBrokenLogs: addToBrokenLogs,
    clearData: clearData,
    write: write
  }