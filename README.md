# broken-link-checker [![NPM Version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][david-image]][david-url]

> Find broken links, missing images, etc in your HTML.

Features:
* Parses local and remote HTML documents
* Supports various HTML tags/attributes, not just `<a href>`
* Supports redirects, absolute URLs, relative URLs and `<base>`
* Provides detailed information about each link (HTTP and HTML)
* URL keyword filtering with wildcards
* Pause/Resume at any time

```js
var blc = require("broken-link-checker");

var html = '<a href="https://google.com">absolute link</a>';
html += '<a href="/path/to/resource.html">relative link</a>';
html += '<img src="http://fakeurl.com/image.png" alt="missing image"/>';

var htmlChecker = new blc.HtmlChecker(null, {
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

htmlChecker.scan(html, "https://mywebsite.com");
```


## Installation

[Node.js](http://nodejs.org/) `~0.10` is required. There're two ways to use it:

### Command Line Usage
To install, type this at the command line:
```shell
npm install broken-link-checker -g
```
After that, check out the help for available options:
```shell
blc -?
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
* `handlers.junk` is fired with the result of each skipped, as configured in options.
* `handlers.complete` is fired after the last result or zero results.

* `.clearCache()` will remove any cached URL responses. This is only relevant if the `cacheResponses` option is enabled.
* `.numActive()` returns the number of active requests.
* `.pause()` will pause the internal link queue, but will not pause any active requests.
* `.resume()` will resume the internal link queue.
* `.scan(htmlString, baseUrl)` parses & scans a single string. Returns `false` when there is a previously incomplete scan (and `true` otherwise).
  * `baseUrl` is the address to which all relative URLs will be made absolute. Without a value, links to relative URLs will output an "Invalid URL" error.

```js
var htmlChecker = new blc.HtmlChecker(options, {
	link: function(result){},
	junk: function(result){},
	complete: function(){}
});

htmlChecker.scan(htmlString, baseUrl);
```

### blc.HtmlUrlChecker(options, handlers)
Scans the HTML content at each queued URL to find broken links.

* `handlers.link` is fired with the result of each discovered link (broken or not) within the current queue item.
* `handlers.junk` is fired with the result of each skipped, as configured in options.
* `handlers.item` is fired after a queue item's last result, on zero results, or if the HTML could not be retreived.
* `handlers.end` is fired when the end of the queue has been reached.

* `.clearCache()` will remove any cached URL responses. This is only relevant if the `cacheResponses` option is enabled.
* `.dequeue(id)` removes an item from the queue. Returns `true` on success or an `Error` on failure.
* `.enqueue(htmlUrl, customData)` adds an item to the queue. Items are auto-dequeued when their requests are complete. Returns a queue ID on success or an `Error` on failure.
  * `customData` is optional data that is stored in the queue item.
* `.length()` returns the number of items in the queue.
* `.numActiveItems()` returns the number of active HTML URL sessions (series of link requests).
* `.numActiveLinks()` returns the number of active link requests.
* `.pause()` will pause the queue, but will not pause any active requests.
* `.resume()` will resume the queue.

```js
var htmlUrlChecker = new blc.HtmlUrlChecker(options, {
	link: function(result, customData){},
	junk: function(result, customData){},
	item: function(error, htmlUrl, customData){},
	end: function(){}
});

htmlUrlChecker.enqueue(htmlUrl, customData);
```

### blc.UrlChecker(options, handlers)
Requests each queued URL to determine if they are broken.

* `handlers.link` is fired for each result (broken or not).
* `handlers.end` is fired when the end of the queue has been reached.

* `.clearCache()` will remove any cached URL responses. This is only relevant if the `cacheResponses` option is enabled.
* `.dequeue(id)` removes an item from the queue. Returns `true` on success or an `Error` on failure.
* `.enqueue(url, baseUrl, customData)` adds an item to the queue. Items are auto-dequeued when their requests are completed. Returns a queue ID on success or an `Error` on failure.
  * `baseUrl` is the address to which all relative URLs will be made absolute. Without a value, links to relative URLs will output an "Invalid URL" error.
  * `customData` is optional data that is stored in the queue item.
* `.length()` returns the number of items in the queue.
* `.numActive()` returns the number of active requests.
* `.pause()` will pause the queue, but will not pause any active requests.
* `.resume()` will resume the queue.

```js
var urlChecker = new blc.UrlChecker(options, {
	link: function(result, customData){},
	end: function(){}
});

urlChecker.enqueue(url, baseUrl, customData);
```

## Options

### options.acceptedSchemes
Type: `Array`  
Default value: `["http","https"]`  
Will only check links with schemes/protocols mentioned in this list. Any others (except those in `excludedSchemes`) will output an "Invalid URL" error.

### options.cacheExpiryTime
Type: `Number`  
Default Value: `3600000` (1 hour)  
The number of milliseconds in which a cached response should be considered valid. This is only relevant if the `cacheResponses` option is enabled.

### options.cacheResponses
Type: `Boolean`  
Default Value: `false`  
URL request results will be cached when `true`. This will ensure that each unique URL will only be checked once.

### options.excludedKeywords
Type: `Array`  
Default value: `[]`  
Will not check or output links that match the keywords and glob patterns in this list. The only wildcard supported is `"*"`.

This option only applies to `HtmlChecker` and `HtmlUrlChecker`.

### options.excludedSchemes
Type: `Array`  
Default value: `["data","geo","javascript","mailto","sms","tel"]`  
Will not check or output links with schemes/protocols mentioned in this list. This avoids the output of "Invalid URL" errors with links that cannot be checked.

This option only applies to `HtmlChecker` and `HtmlUrlChecker`.

### options.excludeExternalLinks
Type: `Boolean`  
Default value: `false`  
Will not check or output external links when `true`; relative links with a remote `<base>` included.

This option only applies to `HtmlChecker` and `HtmlUrlChecker`.

### options.excludeInternalLinks
Type: `Boolean`  
Default value: `false`  
Will not check or output internal links when `true`.

This option only applies to `HtmlChecker` and `HtmlUrlChecker`.

### options.excludeLinksToSamePage
Type: `Boolean`  
Default value: `true`  
Will not check or output links to the same page; relative and absolute fragments/hashes included.

This option only applies to `HtmlChecker` and `HtmlUrlChecker`.

### options.excludeResponseData
Type: `Boolean`  
Default value: `true`  
Each link's lengthy response data will not be outputted when `true`.

### options.filterLevel
Type: `Number`  
Default value: `1`  
The tags and attributes that are considered links for checking, split into the following levels:
* `0`: clickable links
* `1`: clickable links, media
* `2`: clickable links, media, stylesheets, scripts, forms
* `3`: clickable links, media, stylesheets, scripts, forms, meta

To see the exact breakdown, check out the [tag map](https://github.com/stevenvachon/broken-link-checker/blob/master/lib/internal/tags.js). `<base>` is not listed because it is not a link, though it is always parsed.

This option only applies to `HtmlChecker` and `HtmlUrlChecker`.

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

### options.requestMethod
Type: `String`  
Default value: `"head"`  
The HTTP request method used in checking links. Some sites do not respond correctly to `"head"`, while `"get"` can provide more consistent and accurate results, albeit slower.


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
* add ability to pass response from `HtmlUrlChecker` to `UrlChecker` to avoid requesting that URL twice
* start/end string locations for URL attribute values ([parse5#43](https://github.com/inikulin/parse5/issues/43))
* change order of checking to: tcp error, 4xx code (broken), 5xx code (undetermined), 200
* option to scrape `response.body` for erroneous sounding text (since an error page could be presented but still have code 200)
* option to check broken link on archive.org for archived version (using [this lib](https://npmjs.com/archive.org))
* option to include iframe HTML source in checking?
* option to run `HtmlUrlChecker` checks on page load (using [jsdom](https://npmjs.com/jsdom)) to include links added with JavaScript
* option to check if hashes exist in target url document?
* add throttle profiles (0–9, -1 for "custom") for easy configuring
* check [ftp:](https://nmjs.com/ftp), [sftp:](https://npmjs.com/ssh2) (for downloadable files)
* check ~~mailto:~~, news:, nntp:, telnet:?
* check local files if URL is relative and has no base URL?
* full-site checker/crawler (honoring robots.txt, same-domain and optional same-subdomain)
* cli non-tty mode -- change nesting ascii artwork to time stamps?
* use [ineed](https://npmjs.com/ineed)?
* stream HTML files ([parse5#26](https://github.com/inikulin/parse5/issues/26))
* `MarkdownChecker`,`MarkdownUrlChecker`,`HtmlMarkdownChecker`,`HtmlMarkdownUrlChecker`


## Changelog
* 0.6.5
  * handlers added: `junk`
  * linkObj added: `excluded`
  * CLI options removed: `--include-same`
  * CLI `--verbose` is now more verbose
* 0.6.4
  * options added: `excludedKeywords`
  * CLI options added: `--exclude`
* 0.6.3
  * linkObj added: `http.cached`
  * CLI options added: `--verbose`, `--version`
  * CLI options removed: `--uncached`
* 0.6.2
  * options added: `cacheExpiryTime`
  * reduced redundant URLs in cache
* 0.6.1
  * options added: `requestMethod`
  * CLI options added: `--get`
* 0.6.0
  * methods added: `clearCache()`
  * options added: `cacheResponses`
  * CLI options added: `--filter-level`, `--ordered`, `--uncached`
  * `"javascript:"` links now excluded
* 0.5.1 fun CLI spinner
* 0.5.0
  * API change
  * CLI options
  * options added: `excludeExternalLinks`, `excludeResponseData`, `maxSockets`
  * options renamed: `maxSockets`->`maxSocketsPerHost`
  * linkObj added: `http`
  * linkObj moved: `response`->`http.response`
  * linkObj changed: `internal` and `samePage` now compares the base URL (ignoring `<base>`) with links that may have `<base>` applied
  * switched from [request](https://npmjs.com/request) to [bhttp](https://npmjs.com/bhttp)
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


[npm-image]: https://img.shields.io/npm/v/broken-link-checker.svg
[npm-url]: https://npmjs.org/package/broken-link-checker
[travis-image]: https://img.shields.io/travis/stevenvachon/broken-link-checker.svg
[travis-url]: https://travis-ci.org/stevenvachon/broken-link-checker
[david-image]: https://img.shields.io/david/stevenvachon/broken-link-checker.svg
[david-url]: https://david-dm.org/stevenvachon/broken-link-checker
