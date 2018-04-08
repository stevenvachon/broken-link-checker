"use strict";

var fs			   = require('fs');
var stripAnsi      = require('strip-ansi');

var brokenLinkLogs = "";
var brokenLinkLogPath = `${__dirname}/brokenLinks.txt`;

var logBrokenToFile;
var shouldDeleteFile = true;

var enable = function(shouldLog)
{
    logBrokenToFile = shouldLog;
};

var addToBrokenLogs = function(logData)
{   if(logBrokenToFile === true)
    {
        brokenLinkLogs += `${logData}\n`;   
    }
};

var clearData = function()
{   
    if(logBrokenToFile === true)
    {
        brokenLinkLogs = "";
    }
};

var write = function()
{
    if(logBrokenToFile === true)
    {
        if(shouldDeleteFile === true && fs.existsSync(brokenLinkLogPath))
        {        
            fs.unlinkSync(brokenLinkLogPath);
            shouldDeleteFile = false;
        }

        fs.appendFileSync(brokenLinkLogPath, stripAnsi(brokenLinkLogs));

        clearData();
    }
};

module.exports = {
    enable: enable,
    addToBrokenLogs: addToBrokenLogs,
    clearData: clearData,
    write: write
  }