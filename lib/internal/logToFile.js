"use strict";

var fs = require("fs");
var path = require("path");
var stripAnsi = require("strip-ansi");
var os = require("os");

var brokenLinksArray = new Array(); //logs buffer
var outputFile = path.resolve(process.cwd(), "brokenLinks.txt");
var shouldLogToFile = false; //false by default

/**
 * Set if should log to file
 * @param {boolean} shouldLog if should log to file
 */
var enable = function(shouldLog) {
  shouldLogToFile = shouldLog;
  if (shouldLogToFile === true) {
    deleteExistingLogFile();
  }
};

var deleteExistingLogFile = function() {
  //Delete file if exist on first entry
  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }
};

/**
 * add logs to buffer and flush on demand
 * @param {string} logData result from cli
 * @param {boolean} shouldFlush should flush to file
 */
var addToBrokenLogs = function(logData, shouldFlush) {
  if (shouldLogToFile === true) {
    /**
     * add data to an array
     * since uses data (with colors) from cli, stripAnsi keeps the string clean
     */
    brokenLinksArray.push(`${stripAnsi(logData)}${os.EOL}`);

    if (shouldFlush === true) {
      flush();
    }
  }
};

/**
 * Reset links array
 */
var clearData = function() {
  brokenLinksArray = [];
};

/**
 * Flush logs to file
 */
var flush = function() {
    //todo fix it - should not use loop. takes too much time
    //consider use long string with EOL instead of array
  for (var line in brokenLinksArray) {
    fs.appendFileSync(outputFile, brokenLinksArray[line]);
  }
};

module.exports = {
  enable: enable,
  addToBrokenLogs: addToBrokenLogs,
  clearData: clearData
};
