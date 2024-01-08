"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Link = require("./internal/Link");
var _defaultOptions = _interopRequireDefault(require("./internal/defaultOptions"));
var _events = require("./internal/events");
var _gauge = _interopRequireDefault(require("gauge"));
var _httpMethodsConstants = require("http-methods-constants");
var _chalk = require("chalk");
var _ = require("./");
var _humanizeDuration = _interopRequireDefault(require("humanize-duration"));
var _longest = _interopRequireDefault(require("longest"));
var _keyscan = require("keyscan");
var _nodeNotifier = _interopRequireDefault(require("node-notifier"));
var _url = require("url");
var _stripAnsi = _interopRequireDefault(require("strip-ansi"));
var _supportsSemigraphics = _interopRequireDefault(require("supports-semigraphics"));
var _themes = require("gauge/themes");
var _package = require("../package.json");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/* eslint-disable no-console */

const title = "Broken Link Checker";
let checker, checkerOptions, gauge, keyScanner, logOptions, pauseMessage, spinner, stats, urls;
const argsToOptions = args => {
  const renames = {
    exclude: "excludedKeywords",
    excludeExternal: "excludeExternalLinks",
    excludeInternal: "excludeInternalLinks",
    follow: "followRobotExclusions",
    hostRequests: "maxSocketsPerHost",
    include: "includedKeywords",
    ordered: "maintainLinkOrder",
    requests: "maxSockets"
  };
  return Object.entries(args).reduce((opts, [argName, argValue]) => {
    if (argName in renames) {
      opts[renames[argName]] = argValue;
    } else if (argName in _defaultOptions.default) {
      opts[argName] = argValue;
    } else if (args.get) {
      opts.requestMethod = _httpMethodsConstants.GET;
    }
    return opts;
  }, {});
};
const log = (...args) => {
  // Avoid spinner/progress chars getting stuck in the log
  gauge.hide();
  console.log(...args);
  gauge.show();
};
const logPage = pageURL => {
  log(`${(0, _chalk.white)("\nGetting links from:")} ${(0, _chalk.yellow)(pageURL)}`);
};
const logPageMetrics = () => {
  let output = (0, _chalk.gray)(`Finished! ${stats.page.totalLinks} links found.`);
  if (stats.page.skippedLinks > 0) {
    output += (0, _chalk.gray)(` ${stats.page.skippedLinks} skipped.`);
  }
  if (stats.page.totalLinks > 0) {
    output += (0, _chalk.gray)(" ");
    if (stats.page.brokenLinks > 0) {
      output += (0, _chalk.red)(`${stats.page.brokenLinks} broken`);
    } else {
      output += (0, _chalk.green)(`${stats.page.brokenLinks} broken`);
    }
    output += (0, _chalk.gray)(".");
  }
  log(output);
};
const logProgress = () => {
  const links = checker.numActiveLinks + checker.numQueuedLinks;
  const pageCompletion = links > 0 ? 1 / links : 0;
  if (logOptions.recursive) {
    gauge.show(`Links:${links} Pages:${checker.numPages} Sites:${checker.numSites}`, pageCompletion);
  } else {
    gauge.show(`Links:${links} Pages:${checker.numPages}`, pageCompletion);
  }
};
const logResult = /*(*/(result /*, finalResult)*/) => {
  if (result.displayed) {
    // @todo if the last result is skipped, the last RENDERED result will not be "└─"
    let output = (0, _chalk.gray)( /*finalResult!==true ?*/"├─" /*: "└─"*/);
    const {
      link
    } = result;
    if (link.get(_Link.IS_BROKEN)) {
      output += (0, _chalk.red)("BROKEN");
      output += (0, _chalk.gray)("─ ");
    } else if (link.get(_Link.WAS_EXCLUDED)) {
      output += (0, _chalk.gray)("─SKIP── ");
    } else {
      output += (0, _chalk.gray)("──");
      output += (0, _chalk.green)("OK");
      output += (0, _chalk.gray)("─── ");
    }

    // @todo is ORIGINAL_URL only for invalid links?
    output += (0, _chalk.yellow)(link.get(_Link.REBASED_URL) ?? link.get(_Link.ORIGINAL_URL));
    if (link.get(_Link.IS_BROKEN)) {
      output += (0, _chalk.gray)(` (${link.get(_Link.BROKEN_REASON)})`);
    } else if (link.get(_Link.WAS_EXCLUDED)) {
      output += (0, _chalk.gray)(` (${link.get(_Link.EXCLUDED_REASON)})`);
    }
    // Don't display cached message if broken/excluded message is displayed
    else if (link.get(_Link.HTTP_RESPONSE_WAS_CACHED)) {
      output += (0, _chalk.gray)(" (CACHED)");
    }
    log(output);
  }
};

/**
 * Logs links in the order that they are found in their containing HTML
 * document, even if later links receive an earlier response.
 */
const logResults = () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const result = stats.page.results[stats.page.currentIndex];
    if (result !== undefined) {
      //const final = stats.page.currentIndex>=stats.page.results.length-1 && checker.numActiveLinks===0 && checker.numQueuedLinks===0;

      logResult(result /*, final*/);
      stats.page.currentIndex++;
    } else {
      break;
    }
  }
};
const logSite = () => {
  let output = "";
  if (++stats.site.totalPages > 1) {
    output += "\n";
  }
  output += (0, _chalk.white)("\nStarting recursive scan...");
  log(output);
};

// @todo number of unique/uncached links
// @todo "excluded links" [from cli] doesn't make sense with a value of 0 when there're skipped links in the log
const logSiteMetrics = () => {
  let output = "";
  output += (0, _chalk.gray)(`\nLinks found: ${stats.site.totalLinks}`);
  output += (0, _chalk.gray)(`\nLinks skipped: ${stats.site.skippedLinks}`);
  output += (0, _chalk.gray)(`\nLinks successful: ${stats.site.totalLinks - stats.site.skippedLinks - stats.site.brokenLinks}`);
  let broken;
  if (stats.site.totalLinks > 0) {
    broken = stats.site.brokenLinks > 0 ? _chalk.red : _chalk.green;
  } else {
    broken = _chalk.gray;
  }
  output += broken(`\nLinks broken: ${stats.site.brokenLinks}`);
  output += (0, _chalk.gray)("\nTime elapsed: ");
  output += (0, _chalk.gray)((0, _humanizeDuration.default)(Date.now() - stats.site.startTime, {
    largest: 2,
    round: true
  }));
  const separator = (0, _chalk.gray)("=".repeat((0, _longest.default)((0, _stripAnsi.default)(output).split("\n")).length));
  log(`\n${separator}${output}\n${separator}\n`);
};
const run = () => {
  Object.values(_themes.themes).forEach(theme => {
    //theme.preProgressbar = `\n\n${theme.preProgressbar}`;
    theme.preSubsection = (0, _chalk.gray)("—");
  });
  gauge = new _gauge.default();
  stats = new Statistics();
  if (logOptions.recursive) {
    checker = new _.SiteChecker(checkerOptions);
  } else {
    checker = new _.HtmlUrlChecker(checkerOptions);
  }
  checker.on(_events.HTML_EVENT, (tree, robots, response, pageURL) => {
    logPage(pageURL);
  }).on(_events.QUEUE_EVENT, () => {
    logProgress();
  }).on(_events.JUNK_EVENT, link => {
    stats.pushResult(link);
    logProgress();
    logResults();
  }).on(_events.LINK_EVENT, link => {
    stats.pushResult(link);
    logProgress();
    logResults();
  }).on(_events.PAGE_EVENT, (error, pageURL) => {
    if (error != null) {
      // HTML_EVENT will not have been called
      logPage(pageURL);
      if (error.code < 200 || error.code > 299) {
        log((0, _chalk.red)(`${error.name}: ${error.message}`));
      } else {
        log((0, _chalk.gray)(`${error.name}: ${error.message}`));
      }
      process.exitCode = 1;
    }
    // If more than a total of one page will be scanned
    else if (logOptions.recursive || urls.length > 1) {
      logPageMetrics();
      logProgress();
      stats.resetPage();

      // If nothing after current page
      if (checker.numPages === 1) {
        logSiteMetrics();
      }
    } else {
      logSiteMetrics();
    }
  }).on(_events.SITE_EVENT, () => {
    logSiteMetrics();
    stats.resetSite();
  }).on(_events.END_EVENT, () => {
    // @todo store multiple site stats in an array and log all site metrics at very end?

    if ((0, _supportsSemigraphics.default)()) {
      // Exit gracefully
      clearTimeout(spinner);
      gauge.disable();
      keyScanner.release();

      // @todo https://github.com/mikaelbr/node-notifier/issues/174
      _nodeNotifier.default.notify({
        message: "Finished!",
        title
      });
    }
  }).on(_events.ERROR_EVENT, error => {
    console.error(error);

    // eslint-disable-next-line no-process-exit
    process.exit(1);
  });
  if (logOptions.recursive) {
    logSite();
  }
  if ((0, _supportsSemigraphics.default)()) {
    // Show pause message
    togglePause(false);
    keyScanner = (0, _keyscan.make_scanner)(key => {
      if (key.parsed === "space") {
        togglePause();
      }
    });
  } else {
    gauge.disable();
  }
  try {
    checker.pause(); // avoid auto-start

    urls.map(url => {
      try {
        url = new URL(url);
      } catch {
        url = (0, _url.pathToFileURL)(url);
      }
      return url;
    }).forEach(url => checker.enqueue(url));
    checker.resume(); // start, if above didn't throw
  } catch ({
    message
  }) {
    console.error(message);
    process.exitCode = 1;
  }
};
const spinnerInterval = () => {
  spinner = setTimeout(() => {
    gauge.pulse(pauseMessage);
    spinnerInterval();
  }, 50);
};
class Statistics {
  constructor() {
    this.page = {};
    this.site = {};
    this.resetSite();
  }
  pushResult(link) {
    const result = {
      displayed: true,
      link
    };
    const hideCachedLink = logOptions.hideCachedLinks && link.get(_Link.IS_BROKEN) === false && link.get(_Link.HTTP_RESPONSE_WAS_CACHED);
    const hideSkippedLink = logOptions.hideSkippedLinks && link.get(_Link.WAS_EXCLUDED);
    const hideUnbrokenLink = logOptions.hideUnbrokenLinks && link.get(_Link.IS_BROKEN) === false;
    if (hideCachedLink || hideSkippedLink || hideUnbrokenLink) {
      this.page.hiddenLinks++;
      this.site.hiddenLinks++;
      result.displayed = false;
    }
    if (link.get(_Link.IS_BROKEN)) {
      this.page.brokenLinks++;
      this.site.brokenLinks++;
      process.exitCode = 1;
    } else if (link.get(_Link.WAS_EXCLUDED)) {
      this.page.skippedLinks++;
      this.site.skippedLinks++;
    }
    this.page.totalLinks++;
    this.site.totalLinks++;
    if (logOptions.maintainLinkOrder) {
      this.page.results[link.get(_Link.HTML_INDEX)] = result;
    } else {
      this.page.results.push(result);
    }
  }
  resetPage() {
    this.page.brokenLinks = 0;
    this.page.currentIndex = 0;
    this.page.hiddenLinks = 0;
    this.page.results = [];
    this.page.skippedLinks = 0;
    //this.page.startTime = Date.now();
    this.page.totalLinks = 0;
  }
  resetSite() {
    this.resetPage();
    this.site.brokenLinks = 0;
    this.site.hiddenLinks = 0;
    this.site.skippedLinks = 0;
    this.site.startTime = Date.now();
    this.site.totalLinks = 0;
    this.site.totalPages = 0;
  }
}
const togglePause = pause => {
  if (pause === undefined) {
    pause = !checker.isPaused;
  }
  if (pause) {
    checker.pause();
    pauseMessage = `${(0, _chalk.yellow)("PAUSED")}${(0, _chalk.gray)(" — press space to resume")}`;
    gauge.pulse(pauseMessage);
    clearTimeout(spinner);
  } else {
    checker.resume();
    pauseMessage = (0, _chalk.gray)("press space to pause");
    spinner = spinnerInterval();
  }
  logProgress();
};
var _default = (args = process.argv) => {
  const filterLevel = ["--filter-level:", "  0: clickable links", "  1: 0 + media, frames, meta refreshes", "  2: 1 + stylesheets, scripts, forms", "  3: 2 + metadata"].join("\n");
  const verbosity = ["--verbosity:", "  0: broken links", "  1: 0 + unbroken links", "  2: 1 + skipped links"].join("\n");

  /* eslint-disable sort-keys */
  const optionator = require("optionator")({
    prepend: `${(0, _chalk.yellow)(title.toUpperCase())}\n\n${(0, _chalk.green)("Usage:")} blc [options] url1 [url2 ...]`,
    append: `${(0, _chalk.gray)(filterLevel)}\n\n${(0, _chalk.gray)(verbosity)}\n`,
    options: [{
      heading: "Common Options"
    }, {
      option: "recursive",
      alias: "r",
      type: "Boolean",
      description: `Recursively scan ("crawl") the HTML document(s)`,
      default: "false"
    }, {
      heading: "Filtering Options"
    }, {
      option: "exclude",
      type: "[String]",
      description: "Skip checking of links that match keywords/glob"
    }, {
      option: "exclude-external",
      alias: "e",
      type: "Boolean",
      description: "Skip checking of external links",
      default: "false"
    }, {
      option: "exclude-internal",
      alias: "i",
      type: "Boolean",
      description: "Skip checking of internal links",
      default: "false"
    }, {
      option: "filter-level",
      type: "Number",
      description: "Include checking of links by HTML properties",
      default: `${_defaultOptions.default.filterLevel}`
    }, {
      option: "follow",
      alias: "f",
      type: "Boolean",
      description: "Force-follow robot exclusions",
      default: "false"
    }, {
      option: "include",
      type: "[String]",
      description: "Only check links that match keywords/glob"
    }, {
      heading: "Display Options"
    }, {
      option: "help",
      alias: "h",
      type: "Boolean",
      description: "Display this help text",
      default: "false"
    }, {
      option: "ordered",
      alias: "o",
      type: "Boolean",
      description: "Maintain the order of links as they appear in their HTML document",
      default: "false"
    }, {
      option: "verbosity",
      type: "Number",
      description: "The display verbosity level",
      default: "1"
    }, {
      option: "version",
      alias: "v",
      type: "Boolean",
      description: "Display the app version",
      default: "false"
    }, {
      heading: "Advanced Options"
    }, {
      option: "get",
      alias: "g",
      type: "Boolean",
      description: "Change request method to GET",
      default: "false"
    }, {
      option: "host-requests",
      type: "Number",
      description: "Concurrent requests limit per host",
      default: `${_defaultOptions.default.maxSocketsPerHost}`
    }, {
      option: "requests",
      type: "Number",
      description: "Concurrent requests limit ",
      default: `${_defaultOptions.default.maxSockets}`
    }, {
      option: "user-agent",
      type: "String",
      description: "The user agent to use for checking links"
    }]
  });
  /* eslint-disable sort-keys */

  try {
    if (args === process.argv) {
      args = optionator.parseArgv(args);
    } else {
      args = optionator.parse(args);
    }
  } catch (error) {
    args = error;
  }
  if (args instanceof Error) {
    console.error(args.message);
    process.exitCode = 1;
  } else if (args.help) {
    console.log(optionator.generateHelp());
  } else if (args.version) {
    console.log(_package.version);
  } else if (args._.length > 0) {
    urls = args._;
    checkerOptions = argsToOptions(args);
    logOptions = {
      hideCachedLinks: args.verbosity < 2,
      hideSkippedLinks: args.verbosity < 2,
      hideUnbrokenLinks: args.verbosity < 1,
      maintainLinkOrder: args.ordered,
      recursive: args.recursive === true // default value is undefined
    };
    run();
  } else {
    console.error("At least one URL is required; see '--help'");
    process.exitCode = 1;
  }
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=cli.js.map