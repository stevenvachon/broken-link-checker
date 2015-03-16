# broken-link-checker [![NPM Version](http://badge.fury.io/js/broken-link-checker.svg)](http://badge.fury.io/js/broken-link-checker) [![Build Status](https://secure.travis-ci.org/stevenvachon/broken-link-checker.svg)](http://travis-ci.org/stevenvachon/broken-link-checker) [![Dependency Status](https://david-dm.org/stevenvachon/broken-link-checker.svg)](https://david-dm.org/stevenvachon/broken-link-checker)
> Find broken links, missing images, etc in your HTML.

Features:
* Requests urls, html files, urls to html files
* Parses various html tags/attributes, not just `<a href>`
* Supports redirects, absolute urls, relative urls and `<base>`
* Provides detailed information about each link (http and html)
* Pause/Resume at any time

```js
var blc = require("broken-link-checker");

var html = '<a href="https://google.com">absolute link</a>';
html += '<a href="/path/to/resource.html">relative link</a>';
html += '<img src="http://fakeurl.com/image.png" alt="missing image"/>';

var options = { base:"https://mywebsite.com" };
var htmlChecker = new blc.HtmlChecker(options, {
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

htmlChecker.parse(html);
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


## Classes

### blc.HtmlChecker(options, handlers)
Scans an HTML string to find broken links.

* `handlers.link` is fired with the result of each discovered link (broken or not).
* `handlers.complete` is fired after the last result or zero results.

* `.scan(htmlString)` for parsing & scanning a single string. Returns `false` when there is a previously incomplete scan (and `true` otherwise).

```js
var htmlChecker = new blc.HtmlChecker(options, {
	link: function(result){},
	complete: function(){}
});

htmlChecker.scan(htmlString);
```

### blc.HtmlUrlChecker(options, handlers)
Scans the HTML content at each queued URL to find broken links.

* `handlers.link` is fired with the result of each queue item's discovered link (broken or not).
* `handlers.queueItemComplete` is fired after a queue item's last result or zero results, or if the queued URL could not be reached.
* `handlers.queueComplete` is fired when the queue has been emptied.

* `.enqueue(htmlUrl)` adds an item to the queue. Items are auto-dequeued when their requests are complete. Items cannot be manually dequeued at this time.
* `.pause()` will pause the queue, but will not pause any active requests.
* `.resume()` will resume the queue.

This method overrides `options.base` with each queued URL (and any redirections that may occur).

```js
var htmlUrlChecker = new blc.HtmlUrlChecker(options, {
	link: function(result){},
	queueItemComplete: function(error, htmlUrl){},
	queueComplete: function(){}
});

htmlUrlChecker.enqueue(htmlUrl);
```

### blc.UrlChecker(options, handlers)
Requests each queued URL to determine if they are broken.

* `handlers.link` is fired for each result (broken or not).
* `handlers.queueComplete` is fired when the queue has been emptied.

* `.enqueue(url)` adds an item to the queue. Items are auto-dequeued when their requests are complete. Items cannot be manually dequeued at this time.
* `.pause()` will pause the queue, but will not pause any active requests.
* `.resume()` will resume the queue.

```js
var urlChecker = new blc.UrlChecker(options, {
	link: function(result){},
	queueComplete: function(){}
});

urlChecker.enqueue(url);
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

This option does not apply to `UrlChecker`.

### options.excludeInternalLinks
Type: `Boolean`  
Default value: `false`  
Will only check and output external links when `true`.

This option does not apply to `UrlChecker`.

### options.excludeLinksToSamePage
Type: `Boolean`  
Default value: `true`  
As the name suggests, it will not check or output links to the same page; relative and absolute fragments/hashes included.

This option does not apply to `UrlChecker`.

### options.excludeResponseData
Type: `Boolean`  
Default value: `true`  
Each link's lengthy response data (generated by [request](https://npmjs.com/package/request)) will not be outputted when `true`.

### options.filterLevel
Type: `Number`  
Default value: `1`  
The tags and attributes that are considered links for checking, split into the following levels:
* `0`: clickable links
* `1`: clickable links, media
* `2`: clickable links, media, stylesheets, scripts, forms
* `3`: clickable links, media, stylesheets, scripts, forms, meta

To see the exact breakdown, check out the [tag map](https://github.com/stevenvachon/broken-link-checker/blob/master/lib/common/tags.js).

This option does not apply to `UrlChecker`.

### options.maxSockets
Type: `Number`  
Default value: `Infinity`  
The maximum number of links to check at any given time.

### options.maxSocketsPerHost
Type: `Number`  
Default value: `1`  
The maximum number of links per host/port to check at any given time. This avoids overloading a single target host with too many concurrent requests. This will not limit concurrent requests to other hosts.

### options.rateLimit
Type: `Number`  
Default value: `0`  
The number of milliseconds to wait before each request.


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
* add `linkObj.id` using [puid](https://www.npmjs.com/package/puid)?
* start/end string locations for url attribute values ([parse5#43](https://github.com/inikulin/parse5/issues/43))
* option to exclude keywords from URLs (facebook.com, etc)
* response cache to avoid checking same URL twice (even with different hashes)?
  * per class instance?
  * could copy response from first checked link for each successive link's completeness
  * provide method to clear cache
* option to check broken link on archive.org for archived version (using [this lib](https://npmjs.com/archive.org))
* option to include iframe html source in checking?
* better cli -- table view option that disables default log, spinner like npm?
* `handlers.log()` for logging requests, parsing html, etc
* stream html files ([parse5#26](https://github.com/inikulin/parse5/issues/26))
* `MarkdownChecker`,`MarkdownUrlChecker`,`HtmlMarkdownChecker`,`HtmlMarkdownUrlChecker`

## Changelog
* 0.5.0
  * API change
  * options added: `excludeResponseData`, `maxSockets`
  * options renamed: `maxSockets`->`maxSocketsPerHost`
  * linkObj added: `http`
  * linkObj moved: `response`->`http.response`
* 0.4.3 added `rateLimit` option, cleanup
* 0.4.2 added `url.redirected` to linkObj, bug fixes
* 0.4.1
  * options added: `acceptedSchemes`, `excludedSchemes`, `excludeInternalLinks`, `excludeLinksToSamePage`
  * options removed: `excludeEmptyAnchors`
  * linkObj added: `internal`, `samePage`
* 0.4.0
  * checking HTML URLs now ignores `options.base`
  * linkObj added: `html.selector`
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
