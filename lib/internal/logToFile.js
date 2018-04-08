"use strict";

var fs			   = require('fs');
var path           = require('path');
var stripAnsi      = require('strip-ansi');

var brokenLinkLogs = "";
var brokenLinkLogPath = path.resolve(process.cwd(),'brokenLinks.txt');

var logBrokenToFile;
var shouldDeleteFile = true;

var enable = function(shouldLog)
{
    logBrokenToFile = shouldLog;
};

var addToBrokenLogs = function(logData)
{
    write(`${logData}\n`);
};

var clearData = function()
{   
    if(logBrokenToFile === true)
    {
        brokenLinkLogs = "";
    }
};

var write = function(logToWrite)
{
    if(logBrokenToFile === true)
    {
        if(shouldDeleteFile === true && fs.existsSync(brokenLinkLogPath))
        {        
            fs.unlinkSync(brokenLinkLogPath);
            shouldDeleteFile = false;
        }

        fs.appendFileSync(brokenLinkLogPath, stripAnsi(logToWrite));

        clearData();
    }
};

module.exports = {
    enable: enable,
    addToBrokenLogs: addToBrokenLogs,
    clearData: clearData,
  }