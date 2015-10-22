# broken-link-checker [![NPM Version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][david-image]][david-url]

> Find broken links, missing images, etc in your HTML.

Features:
* Stream-parses local and remote HTML pages
* Supports various HTML elements/attributes, not just `<a href>`
* Supports redirects, absolute URLs, relative URLs and `<base>`
* Honors robots.txt and `rel=nofollow` exclusions
* Provides detailed information about each link (HTTP and HTML)
* URL keyword filtering with wildcards
* Pause/Resume at any time


## Installation

[Node.js](http://nodejs.org/) `>= 0.10` is required; `< 4.0` will need `Promise` and `Object.assign` polyfills.

There're two ways to use it:

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
npm install broken-link-checker
```
The rest of this document will assist you with how to use the API.


## Classes

### blc.HtmlChecker(options, handlers)
Scans an HTML document to find broken links.

* `handlers.complete` is fired after the last result or zero results.
* `handlers.junk` is fired with data on each skipped link, as configured in options.
* `handlers.link` is fired with the result of each discovered link (broken or not).

* `.clearCache()` will remove any cached URL responses. This is only relevant if the `cacheResponses` option is enabled.
* `.numActiveLinks()` returns the number of links with active requests.
* `.numQueuedLinks()` returns the number of links that currently have no active requests.
* `.pause()` will pause the internal link queue, but will not pause any active requests.
* `.resume()` will resume the internal link queue.
* `.scan(html, baseUrl)` parses & scans a single HTML document. Returns `false` when there is a previously incomplete scan (and `true` otherwise).
  * `html` can be a stream or a string.
  * `baseUrl` is the address to which all relative URLs will be made absolute. Without a value, links to relative URLs will output an "Invalid URL" error.

```js
var htmlChecker = new blc.HtmlChecker(options, {
	junk: function(result){},
	link: function(result){},
	complete: function(){}
});

htmlChecker.scan(html, baseUrl);
```

### blc.HtmlUrlChecker(options, handlers)
Scans the HTML content at each queued URL to find broken links.

* `handlers.end` is fired when the end of the queue has been reached.
* `handlers.junk` is fired with data on each skipped link, as configured in options.
* `handlers.link` is fired with the result of each discovered link (broken or not) within the current page.
* `handlers.page` is fired after a page's last result, on zero results, or if the HTML could not be retrieved.

* `.clearCache()` will remove any cached URL responses. This is only relevant if the `cacheResponses` option is enabled.
* `.dequeue(id)` removes a page from the queue. Returns `true` on success or an `Error` on failure.
* `.enqueue(pageUrl, customData)` adds a page to the queue. Queue items are auto-dequeued when their requests are complete. Returns a queue ID on success or an `Error` on failure.
  * `customData` is optional data that is stored in the queue item for the page.
* `.numActiveLinks()` returns the number of links with active requests.
* `.numPages()` returns the total number of pages in the queue.
* `.numQueuedLinks()` returns the number of links that currently have no active requests.
* `.pause()` will pause the queue, but will not pause any active requests.
* `.resume()` will resume the queue.

```js
var htmlUrlChecker = new blc.HtmlUrlChecker(options, {
	junk: function(result, customData){},
	link: function(result, customData){},
	page: function(error, pageUrl, customData){},
	end: function(){}
});

htmlUrlChecker.enqueue(pageUrl, customData);
```

### blc.SiteChecker(options, handlers)
Recursively scans (crawls) the HTML content at each queued URL to find broken links.

* `handlers.end` is fired when the end of the queue has been reached.
* `handlers.junk` is fired with data on each skipped link, as configured in options.
* `handlers.link` is fired with the result of each discovered link (broken or not) within the current page.
* `handlers.page` is fired after a page's last result, on zero results, or if the HTML could not be retrieved.
* `handlers.site` is fired after a site's last result, on zero results, or if the initial HTML could not be retrieved.

* `.clearCache()` will remove any cached URL responses. This is only relevant if the `cacheResponses` option is enabled.
* `.dequeue(id)` removes a site from the queue. Returns `true` on success or an `Error` on failure.
* `.enqueue(siteUrl, customData)` adds [the first page of] a site to the queue. Queue items are auto-dequeued when their requests are complete. Returns a queue ID on success or an `Error` on failure.
  * `customData` is optional data that is stored in the queue item for the site.
* `.numActiveLinks()` returns the number of links with active requests.
* `.numQueuedLinks()` returns the number of links that currently have no active requests.
* `.numSites()` returns the total number of sites in the queue.
* `.pause()` will pause the queue, but will not pause any active requests.
* `.resume()` will resume the queue.

**Note:** `options.filterLevel` is used for determining which links are recursive.

```js
var siteChecker = new blc.SiteChecker(options, {
	junk: function(result, customData){},
	link: function(result, customData){},
	page: function(error, pageUrl, customData){},
	site: function(error, siteUrl, customData){},
	end: function(){}
});

siteChecker.enqueue(siteUrl, customData);
```

### blc.UrlChecker(options, handlers)
Requests each queued URL to determine if they are broken.

* `handlers.end` is fired when the end of the queue has been reached.
* `handlers.link` is fired for each result (broken or not).

* `.clearCache()` will remove any cached URL responses. This is only relevant if the `cacheResponses` option is enabled.
* `.dequeue(id)` removes a URL from the queue. Returns `true` on success or an `Error` on failure.
* `.enqueue(url, baseUrl, customData)` adds a URL to the queue. Queue items are auto-dequeued when their requests are completed. Returns a queue ID on success or an `Error` on failure.
  * `baseUrl` is the address to which all relative URLs will be made absolute. Without a value, links to relative URLs will output an "Invalid URL" error.
  * `customData` is optional data that is stored in the queue item for the URL.
* `.numActiveLinks()` returns the number of links with active requests.
* `.numQueuedLinks()` returns the number of links that currently have no active requests.
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
Default Value: `true`  
URL request results will be cached when `true`. This will ensure that each unique URL will only be checked once.

### options.excludedKeywords
Type: `Array`  
Default value: `[]`  
Will not check or output links that match the keywords and glob patterns in this list. The only wildcard supported is `"*"`.

This option does *not* apply to `UrlChecker`.

### options.excludedSchemes
Type: `Array`  
Default value: `["data","geo","javascript","mailto","sms","tel"]`  
Will not check or output links with schemes/protocols mentioned in this list. This avoids the output of "Invalid URL" errors with links that cannot be checked.

This option does *not* apply to `UrlChecker`.

### options.excludeExternalLinks
Type: `Boolean`  
Default value: `false`  
Will not check or output external links when `true`; relative links with a remote `<base>` included.

This option does *not* apply to `UrlChecker`.

### options.excludeInternalLinks
Type: `Boolean`  
Default value: `false`  
Will not check or output internal links when `true`.

This option does *not* apply to `UrlChecker`.

### options.excludeLinksToSamePage
Type: `Boolean`  
Default value: `true`  
Will not check or output links to the same page; relative and absolute fragments/hashes included.

This option does *not* apply to `UrlChecker`.

### options.excludeResponseData
Type: `Boolean`  
Default value: `true`  
Each link's lengthy response data will not be outputted when `true`.

### options.filterLevel
Type: `Number`  
Default value: `1`  
The tags and attributes that are considered links for checking, split into the following levels:
* `0`: clickable links
* `1`: clickable links, media, iframes, meta refreshes
* `2`: clickable links, media, iframes, meta refreshes, stylesheets, scripts, forms
* `3`: clickable links, media, iframes, meta refreshes, stylesheets, scripts, forms, metadata

Recursive links have a slightly different filter subset. To see the exact breakdown of both, check out the [tag map](https://github.com/stevenvachon/broken-link-checker/blob/master/lib/internal/tags.js). `<base>` is not listed because it is not a link, though it is always parsed.

This option does *not* apply to `UrlChecker`.

### options.honorDisallowed
Type: `Boolean`  
Default value: `true`  
Will not scan pages that search engines would not follow. Such will have been specified with any of the following:
* `<a rel="nofollow" href="…">`
* `<area rel="nofollow" href="…">`
* `<meta name="robots" content="nofollow">`
* `<meta name="robots" content="noindex">`
* robots.txt

This option does *not* apply to `UrlChecker`.

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
* load sitemap.xml at end of each `SiteChecker` site to possibly check pages that were not linked to
* start/end string locations for URL attribute values ([parse5#43](https://github.com/inikulin/parse5/issues/43))
* remove `options.excludedSchemes` and handle schemes not in `options.acceptedSchemes` as junk?
* change order of checking to: tcp error, 4xx code (broken), 5xx code (undetermined), 200
* option to retry broken links a number of times (default=0)
* option to scrape `response.body` for erroneous sounding text (since an error page could be presented but still have code 200)
* option to check broken link on archive.org for archived version (using [this lib](https://npmjs.com/archive.org))
* option to run `HtmlUrlChecker` checks on page load (using [jsdom](https://npmjs.com/jsdom)) to include links added with JavaScript?
* option to check if hashes exist in target URL document?
* option to parse Markdown in `HtmlChecker` for links
* add throttle profiles (0–9, -1 for "custom") for easy configuring
* check [ftp:](https://nmjs.com/ftp), [sftp:](https://npmjs.com/ssh2) (for downloadable files)
* check ~~mailto:~~, news:, nntp:, telnet:?
* check local files if URL is relative and has no base URL?
* cli json mode -- streamed or not?
* cli non-tty mode -- change nesting ASCII artwork to time stamps?


[npm-image]: https://img.shields.io/npm/v/broken-link-checker.svg
[npm-url]: https://npmjs.org/package/broken-link-checker
[travis-image]: https://img.shields.io/travis/stevenvachon/broken-link-checker.svg
[travis-url]: https://travis-ci.org/stevenvachon/broken-link-checker
[david-image]: https://img.shields.io/david/stevenvachon/broken-link-checker.svg
[david-url]: https://david-dm.org/stevenvachon/broken-link-checker
