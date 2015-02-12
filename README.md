# broken-link-checker [![NPM Version](http://badge.fury.io/js/broken-link-checker.svg)](http://badge.fury.io/js/broken-link-checker) [![Build Status](https://secure.travis-ci.org/stevenvachon/broken-link-checker.svg)](http://travis-ci.org/stevenvachon/broken-link-checker) [![Dependency Status](https://david-dm.org/stevenvachon/broken-link-checker.svg)](https://david-dm.org/stevenvachon/broken-link-checker)
> Find broken links, missing images, etc in your HTML.

Features:
* Requests urls, html files, urls to html files
* Parses various html tags/attributes, not just `<a href>`
* Supports redirects, absolute urls, relative urls and `<base>`
* Provides detailed information about each link (http and html)

```js
var BrokenLinkChecker = require("broken-link-checker");

var options = { base:"https://mywebsite.com" };
var blc = new BrokenLinkChecker(options);

var html = '<a href="https://google.com">absolute link</a>';
html += '<a href="/path/to/resource.html">relative link</a>';
html += '<img src="http://fakeurl.com/image.png" alt="missing image"/>';

blc.checkHtml(html, {
	link: function(result) {
		console.log(result.html.index, result.broken, result.html.text, result.url.resolved);
		//-> 0 false "absolute link" "https://google.com/"
		//-> 1 false "relative link" "https://mywebsite.com/path/to/resource.html"
		//-> 2 true null "http://fakeurl.com/image.png"
	},
	complete: function() {
		console.log("done checking!");
	}
});
```


## Installation

[Node.js](http://nodejs.org/) `~0.10` is required. There're two ways to use it:

### Command Line Usage
To install, type this at the command line:
```shell
npm install broken-link-checker -g
```
Typical usage looks like:
```shell
blc http://website.com/
```

### Programmatic API
To install, type this at the command line:
```shell
npm install broken-link-checker --save-dev
```
The rest of this document will assist you with how to use the API.


## Methods

### blc.checkHtml(html, handlers)
Scans `html` to find broken links. `handlers.link` is fired for each result and `handlers.complete` is fired after the last result or zero results.
```js
new BrokenLinkChecker(options).checkHtml(html, {
	link: function(result){},
	complete: function(){}
});
```

### blc.checkHtmlUrl(url, handlers)
Scans the HTML content at `url` to find broken links. `handlers.link` is fired for each result and `handlers.complete` is fired after the last result or zero results. If `url` cannot be reached, `handlers.complete` is fired with an `error` argument and the whole operation is cancelled. This method overrides `options.base` with `url` and any redirections that may occur.
```js
new BrokenLinkChecker(options).checkHtmlUrl(url, {
	link: function(result){},
	complete: function(error){}
});
```

### blc.checkUrl(url, callback)
Requests `url` to determine if it is broken. A callback is invoked with the results.
```js
new BrokenLinkChecker(options).checkUrl(url, function(result){});
```

## Options

### options.acceptedSchemes
Type: `Array`  
Default value: `["http","https"]`  
Will only check links with schemes/protocols mentioned in this list. Any others will output an "Invalid URL" error.

### options.base
Type: `String`  
Default value: `undefined`  
The address to which all relative URLs will be made absolute. Without a value, links to relative URLs will output an "Invalid URL" error.

### options.excludedSchemes
Type: `Array`  
Default value: `["data","geo","mailto","sms","tel"]`  
Will not check or output links with schemes/protocols mentioned in this list. This avoids the output of "Invalid URL" errors with links that cannot be checked.

This option does not apply to `checkUrl()`.

### options.excludeInternalLinks
Type: `Boolean`  
Default value: `false`  
Will only check and output external links when `true`.

This option does not apply to `checkUrl()`.

### options.excludeLinksToSamePage
Type: `Boolean`  
Default value: `true`  
As the name suggests, it will not check or output links to the same page which include fragments/hashes (relative and absolute).

This option does not apply to `checkUrl()`.

### options.filterLevel
Type: `Number`  
Default value: `1`  
The tags and attributes that are considered links for checking, split into the following levels:
* `0`: clickable links
* `1`: clickable links, media
* `2`: clickable links, media, stylesheets, scripts, forms
* `3`: clickable links, media, stylesheets, scripts, forms, meta

To see the exact breakdown, check out the [tag map](https://github.com/stevenvachon/broken-link-checker/blob/master/lib/tags.js).

This option does not apply to `checkUrl()`.

### options.maxSockets
Type: `Number`  
Default value: `1`  
The maximum number of links per host/port to check at any given time. This avoids overloading a single target host with too many concurrent requests. This will not limit concurrent requests to other hosts.


## Handling link errors
Each result will have its own `error` key for which you can compare against:
```js
if (result.error !== null) {
	// Server denied access
	if (result.error.code === "ECONNREFUSED"){}
	// Server could not be reached
	if (result.error.code === "ENOTFOUND"){}
	// Connection timed out
	if (result.error.code === "ETIMEDOUT"){}
	// Duh.
	if (result.error.message === "Invalid URL"){}
}
```


## Roadmap Features
* provide a `link.url.redirected` value if the link was redirected
* option to include iframe html source in checking?
* method to pause/stop checking
* better cli -- table view option that disables default log, spinner like npm?
* `handlers.log()` for logging requests, parsing html, etc
* stream html files (waiting on [parse5](https://npmjs.com/package/parse5))
* `checkMarkdown()`,`checkMarkdownUrl()`,`checkHtmlMarkdown()`,`checkHtmlMarkdownUrl()`

## Changelog
* 0.4.1
  * options added: `acceptedSchemes`, `excludedSchemes`, `excludeInternalLinks`, `excludeLinksToSamePage`
  * options removed: `excludeEmptyAnchors`
  * linkObj added: `internal`, `samePage`
* 0.4.0
  * `checkHtmlUrl()` no longer uses `options.base`
  * linkObj added: `selector`
* 0.3.0
  * options added: `maxSockets`
  * options renamed: `site`->`base`
  * `<base>` supported
  * requesting links now only downloads the response header
  * faster test suite
* 0.2.2 added missing tags/attributes
* 0.2.1 basic CLI, bug fixes
* 0.2.0
  * options added: `excludeEmptyAnchors`, `filterLevel`
  * new linkObj structure
  * more complete test suite
* 0.1.0 initial release
