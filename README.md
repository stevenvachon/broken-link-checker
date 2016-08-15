# broken-link-checker [![NPM Version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Dependency Status][david-image]][david-url]

> Find broken links, missing images, etc in your HTML.

Features:
* Stream-parses local and remote HTML pages
* Concurrently checks multiple links
* Supports various HTML elements/attributes, not just `<a href>`
* Supports redirects, basic auth, absolute URLs, relative URLs and `<base>`
* Honors robot exclusions (robots.txt, headers and `rel`)
* WHATWG specifications-compliant [HTML](https://html.spec.whatwg.org) and [URL](https://url.spec.whatwg.org) parsing
* Provides detailed information about each link (HTTP and HTML)
* URL keyword filtering with wildcards
* Pause/Resume at any time


## Installation

[Node.js](http://nodejs.org/) `>= 6` is required. There're two ways to use it:

### Command Line Usage
To install, type this at the command line:
```shell
npm install broken-link-checker -g
```
After that, check out the help for available options:
```shell
blc --help
```
A typical site-wide check might look like:
```shell
blc http://yoursite.com -ro
```

### Programmatic API
To install, type this at the command line:
```shell
npm install broken-link-checker
```
The rest of this document will assist you with how to use the API.


## Classes
While all classes have been exposed for custom use, the one that you need will most likely be [`SiteChecker`](#sitechecker).

### `HtmlChecker`
Scans an HTML document to find broken links. All methods from [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter) are available.

```js
const {HtmlChecker} = require('broken-link-checker');

const htmlChecker = new HtmlChecker(options)
  .on('html', (tree, robots) => {})
  .on('queue', () => {})
  .on('junk', (result) => {})
  .on('link', (result) => {})
  .on('complete', () => {});

htmlChecker.scan(html, baseUrl);
```

#### Methods & Properties
* `.clearCache()` will remove any cached URL responses.
* `.isPaused` returns `true` if the internal link queue is paused and `false` if not.
* `.numActiveLinks` returns the number of links with active requests.
* `.numQueuedLinks` returns the number of links that currently have no active requests.
* `.pause()` will pause the internal link queue, but will not pause any active requests.
* `.resume()` will resume the internal link queue.
* `.scan(html, baseUrl)` parses & scans a single HTML document and returns a `Promise`. Calling this function while a previous scan is in progress will result in a thrown error. Arguments:
  * `html` must be either a [`Stream`](https://nodejs.org/api/stream.html) or a string.
  * `baseUrl` must be either a [`URL`](https://developer.mozilla.org/en/docs/Web/API/URL) or an absolute URL string. Without this value, links to relative URLs will output a "BLC_INVALID" error (unless an absolute `<base href>` is found).

#### Events
* `'complete'` is emitted after the last result or zero results.
* `'html'` is emitted after the HTML document has been fully parsed. Arguments:
  * `tree` is supplied by [parse5](https://npmjs.com/parse5).
  * `robots` is an instance of [robot-directives](https://npmjs.com/robot-directives) containing any `<meta>` robot exclusions.
* `'junk'` is emitted on each skipped/unchecked link, as configured in options. Arguments:
  * `result` is a [`Link`](https://github.com/stevenvachon/broken-link-checker/blob/v0.8.0/lib/internal/Link.js#L15-L55).
* `'link'` is emitted with the result of each checked/unskipped link (broken or not). Arguments:
  * `result` is a [`Link`](https://github.com/stevenvachon/broken-link-checker/blob/v0.8.0/lib/internal/Link.js#L15-L55).
* `'queue'` is emitted when a link is internally queued, dequeued or made active.


### `HtmlUrlChecker`
Scans the HTML content at each queued URL to find broken links. All methods from [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter) are available.

```js
const {HtmlUrlChecker} = require('broken-link-checker');

const htmlUrlChecker = new HtmlUrlChecker(options)
  .on('html', (tree, robots, response, pageUrl, customData) => {})
  .on('queue', () => {})
  .on('junk', (result, customData) => {})
  .on('link', (result, customData) => {})
  .on('page', (error, pageUrl, customData) => {})
  .on('end', () => {});

htmlUrlChecker.enqueue(pageUrl, customData);
```

#### Methods & Properties
* `.clearCache()` will remove any cached URL responses.
* `.dequeue(id)` removes a page from the queue. Returns `true` on success or `false` on failure.
* `.enqueue(pageUrl, customData)` adds a page to the queue. Queue items are auto-dequeued when their requests are complete. Returns a queue ID on success. Arguments:
  * `pageUrl` must be a [`URL`](https://developer.mozilla.org/en/docs/Web/API/URL) or an absolute URL string.
  * `customData` is optional data (of any type) that is stored in the queue item for the page.
* `.isPaused` returns `true` if the queue is paused and `false` if not.
* `.numActiveLinks` returns the number of links with active requests.
* `.numPages` returns the total number of pages in the queue.
* `.numQueuedLinks` returns the number of links that currently have no active requests.
* `.pause()` will pause the queue, but will not pause any active requests.
* `.resume()` will resume the queue.

#### Events
* `'end'` is emitted when the end of the queue has been reached.
* `'html'` is emitted after a page's HTML document has been fully parsed. Arguments:
  * `tree` is supplied by [parse5](https://npmjs.com/parse5).
  * `robots` is an instance of [robot-directives](https://npmjs.com/robot-directives) containing any `<meta>` and `X-Robots-Tag` robot exclusions.
  * `response` is the full HTTP response for the page, excluding the body.
  * `pageUrl` is the `URL` to the current page being scanned.
  * `customData` is whatever was queued.
* `'junk'` is emitted on each skipped/unchecked link, as configured in options. Arguments:
  * `result` is a [`Link`](https://github.com/stevenvachon/broken-link-checker/blob/v0.8.0/lib/internal/Link.js#L15-L55).
  * `customData` is whatever was queued.
* `'link'` is emitted with the result of each checked/unskipped link (broken or not) within the current page. Arguments:
  * `result` is a [`Link`](https://github.com/stevenvachon/broken-link-checker/blob/v0.8.0/lib/internal/Link.js#L15-L55).
  * `customData` is whatever was queued.
* `'page'` is emitted after a page's last result, on zero results, or if the HTML could not be retrieved. Arguments:
  * `error` will be an `Error` if such occurred or `null` if not.
  * `pageUrl` is the `URL` to the current page being scanned.
  * `customData` is whatever was queued.
* `'queue'` is emitted when a URL (link or page) is queued, dequeued or made active.


### `SiteChecker`
Recursively scans (crawls) the HTML content at each queued URL to find broken links. All methods from [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter) are available.

```js
const {SiteChecker} = require('broken-link-checker');

const siteChecker = new SiteChecker(options)
  .on('robots', (robots, customData) => {})
  .on('html', (tree, robots, response, pageUrl, customData) => {})
  .on('queue', () => {})
  .on('junk', (result, customData) => {})
  .on('link', (result, customData) => {})
  .on('page', (error, pageUrl, customData) => {})
  .on('site', (error, siteUrl, customData) => {})
  .on('end', () => {});

siteChecker.enqueue(siteUrl, customData);
```

#### Methods & Properties
* `.clearCache()` will remove any cached URL responses.
* `.dequeue(id)` removes a site from the queue. Returns `true` on success or `false` on failure.
* `.enqueue(siteUrl, customData)` adds [the first page of] a site to the queue. Queue items are auto-dequeued when their requests are complete. Returns a queue ID on success. Arguments:
  * `siteUrl` must be a [`URL`](https://developer.mozilla.org/en/docs/Web/API/URL) or an absolute URL string.
  * `customData` is optional data (of any type) that is stored in the queue item for the site.
* `.isPaused` returns `true` if the queue is paused and `false` if not.
* `.numActiveLinks` returns the number of links with active requests.
* `.numPages` returns the total number of pages in the queue.
* `.numQueuedLinks` returns the number of links that currently have no active requests.
* `.numSites` returns the total number of sites in the queue.
* `.pause()` will pause the queue, but will not pause any active requests.
* `.resume()` will resume the queue.

#### Events
* `'end'` is emitted when the end of the queue has been reached.
* `'html'` is emitted after a page's HTML document has been fully parsed. Arguments:
  * `tree` is supplied by [parse5](https://npmjs.com/parse5).
  * `robots` is an instance of [robot-directives](https://npmjs.com/robot-directives) containing any `<meta>` and `X-Robots-Tag` robot exclusions.
  * `response` is the full HTTP response for the page, excluding the body.
  * `pageUrl` is the `URL` to the current page being scanned.
  * `customData` is whatever was queued.
* `'junk'` is emitted on each skipped/unchecked link, as configured in options. Arguments:
  * `result` is a [`Link`](https://github.com/stevenvachon/broken-link-checker/blob/v0.8.0/lib/internal/Link.js#L15-L55).
  * `customData` is whatever was queued.
* `'link'` is emitted with the result of each checked/unskipped link (broken or not) within the current page. Arguments:
  * `result` is a [`Link`](https://github.com/stevenvachon/broken-link-checker/blob/v0.8.0/lib/internal/Link.js#L15-L55).
  * `customData` is whatever was queued.
* `'page'` is emitted after a page's last result, on zero results, or if the HTML could not be retrieved. Arguments:
  * `error` will be an `Error` if such occurred or `null` if not.
  * `pageUrl` is the `URL` to the current page being scanned.
  * `customData` is whatever was queued.
* `'queue'` is emitted when a URL (link, page or site) is queued, dequeued or made active.
* `'robots'` is emitted after a site's robots.txt has been downloaded. Arguments:
  * `robots` is an instance of [robots-txt-guard](https://npmjs.com/robots-txt-guard).
  * `customData` is whatever was queued.
* `'site'` is emitted after a site's last result, on zero results, or if the *initial* HTML could not be retrieved. Arguments:
  * `error` will be an `Error` if such occurred or `null` if not.
  * `siteUrl` is the `URL` to the current site being crawled.
  * `customData` is whatever was queued.

**Note:** the `filterLevel` option is used for determining which links are recursive.


### `UrlChecker`
Requests each queued URL to determine if they are broken. All methods from [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter) are available.

```js
const {UrlChecker} = require('broken-link-checker');

const urlChecker = new UrlChecker(options)
  .on('queue', () => {})
  .on('link', (result, customData) => {})
  .on('end', () => {});

urlChecker.enqueue(url, customData);
```

#### Methods & Properties
* `.clearCache()` will remove any cached URL responses.
* `.dequeue(id)` removes a URL from the queue. Returns `true` on success or `false` on failure.
* `.enqueue(url, customData)` adds a URL to the queue. Queue items are auto-dequeued when their requests are completed. Returns a queue ID on success. Arguments:
  * `url` must be a [`URL`](https://developer.mozilla.org/en/docs/Web/API/URL) or an absolute URL string.
  * `customData` is optional data (of any type) that is stored in the queue item for the URL.
* `.isPaused` returns `true` if the queue is paused and `false` if not.
* `.numActiveLinks` returns the number of links with active requests.
* `.numQueuedLinks` returns the number of links that currently have no active requests.
* `.pause()` will pause the queue, but will not pause any active requests.
* `.resume()` will resume the queue.

#### Events
* `'end'` is emitted when the end of the queue has been reached.
* `'link'` is emitted for each result (broken or not). Arguments:
  * `result` is a [`Link`](https://github.com/stevenvachon/broken-link-checker/blob/v0.8.0/lib/internal/Link.js#L15-L55).
  * `customData` is whatever was queued.
* `'queue'` is emitted when a URL is queued, dequeued or made active.


## Options

### `acceptedSchemes`
Type: `Array`  
Default value: `['http:','https:']`  
Will only check links with schemes/protocols mentioned in this list. Any others (except those in `excludedSchemes`) will output an "Invalid URL" error.

### `cacheMaxAge`
Type: `Number`  
Default Value: `3600000` (1 hour)  
The number of milliseconds in which a cached response should be considered valid. This is only relevant if the `cacheResponses` option is enabled.

### `cacheResponses`
Type: `Boolean`  
Default Value: `true`  
URL request results will be cached when `true`. This will ensure that each unique URL will only be checked once.

### `customFilter`
Type: `Function`  
Default value: `result => true`  
A synchronous callback that is called after all other filters have been performed. Return `true` to include `result` (a [`Link`](https://github.com/stevenvachon/broken-link-checker/blob/v0.8.0/lib/internal/Link.js#L15-L55)) in the list of links to be checked, or return `false` to have it skipped.

This option does *not* apply to `UrlChecker`.

### `excludedKeywords`
Type: `Array`  
Default value: `[]`  
Will not check links that match the keywords and glob patterns in this list. The only wildcard supported is `*`.

This option does *not* apply to `UrlChecker`.

### `excludedSchemes`
Type: `Array`  
Default value: `['data:','geo:','javascript:','mailto:','sms:','tel:']`  
Will not check links with schemes/protocols mentioned in this list. This avoids the output of "Invalid URL" errors with links that cannot be checked.

This option does *not* apply to `UrlChecker`.

### `excludeExternalLinks`
Type: `Boolean`  
Default value: `false`  
Will not check external links when `true`; relative links with a remote `<base>` included.

This option does *not* apply to `UrlChecker`.

### `excludeInternalLinks`
Type: `Boolean`  
Default value: `false`  
Will not check internal links when `true`.

This option does *not* apply to `UrlChecker` nor `SiteChecker`'s *crawler*.

### `excludeLinksToSamePage`
Type: `Boolean`  
Default value: `false`  
Will not check links to the same page; relative and absolute fragments/hashes included. This is only relevant if the `cacheResponses` option is disabled.

This option does *not* apply to `UrlChecker`.

### `filterLevel`
Type: `Number`  
Default value: `1`  
The tags and attributes that are considered links for checking, split into the following levels:
* `0`: clickable links
* `1`: clickable links, media, frames, meta refreshes
* `2`: clickable links, media, frames, meta refreshes, stylesheets, scripts, forms
* `3`: clickable links, media, frames, meta refreshes, stylesheets, scripts, forms, metadata

Recursive links have a slightly different filter subset. To see the exact breakdown of both, check out the [tag map](https://github.com/stevenvachon/broken-link-checker/blob/master/lib/internal/tags.js). `<base>` is not listed because it is not a link, though it is always parsed.

This option does *not* apply to `UrlChecker`.

### `honorRobotExclusions`
Type: `Boolean`  
Default value: `true`  
Will not scan pages that search engine crawlers would not follow. Such will have been specified with any of the following:
* `<a rel="nofollow" href="…">`
* `<area rel="nofollow" href="…">`
* `<meta name="robots" content="noindex,nofollow,…">`
* `<meta name="googlebot" content="noindex,nofollow,…">`
* `<meta name="robots" content="unavailable_after: …">`
* `X-Robots-Tag: noindex,nofollow,…`
* `X-Robots-Tag: googlebot: noindex,nofollow,…`
* `X-Robots-Tag: otherbot: noindex,nofollow,…`
* `X-Robots-Tag: unavailable_after: …`
* robots.txt

This option does *not* apply to `UrlChecker`.

### `maxSockets`
Type: `Number`  
Default value: `Infinity`  
The maximum number of links to check at any given time.

### `maxSocketsPerHost`
Type: `Number`  
Default value: `2`  
The maximum number of links per host/port to check at any given time. This avoids overloading a single target host with too many concurrent requests. This will not limit concurrent requests to other hosts.

### `rateLimit`
Type: `Number`  
Default value: `0`  
The number of milliseconds to wait before each request.

### `requestMethod`
Type: `String`  
Default value: `'head'`  
The HTTP request method used in checking links. If you experience problems, try using `'get'`, however the `retry405Head` option should have you covered.

### `retry405Head`
Type: `Boolean`  
Default value: `true`  
Some servers do not respond correctly to a `'head'` request method. When `true`, a link resulting in an HTTP 405 "Method Not Allowed" error will be re-requested using a `'get'` method before deciding that it is broken. This is only relevant if the `requestMethod` option is set to `'head'`.

### `userAgent`
Type: `String`  
Default value: `'broken-link-checker/0.8.0 Node.js/8.9.4 (OS X; x64)'` (or similar)  
The HTTP user-agent to use when checking links as well as retrieving pages and robot exclusions.


## Handling Broken/Excluded Links
A broken link will have a `broken` value of `true` and a reason code defined in `brokenReason`. A link that was not checked (emitted as `'junk'`) will have an `excluded` value of `true` and a reason code defined in `excludedReason`.
```js
if (result.broken) {
  console.log(result.brokenReason);
  //-> HTTP_406
} else if (result.excluded) {
  console.log(result.excludedReason);
  //-> BLC_ROBOTS
}
```

Additionally, more descriptive messages are available for each reason code:
```js
const blc = require('broken-link-checker');

console.log(blc.BLC_ROBOTS);       //-> Robots Exclusion
console.log(blc.ERRNO_ECONNRESET); //-> connection reset by peer (ECONNRESET)
console.log(blc.HTTP_404);         //-> Not Found (404)

// List all
console.log(blc);
```

Putting it all together:
```js
if (result.broken) {
  console.log(blc[result.brokenReason]);
} else if (result.excluded) {
  console.log(blc[result.excludedReason]);
}
```


## Roadmap Features
* add cheerio support by using parse5's htmlparser2 tree adaptor?
* load sitemap.xml at end of each `SiteChecker` site to possibly check pages that were not linked to
* remove `options.excludedSchemes` and handle schemes not in `options.acceptedSchemes` as junk?
* change order of checking to: tcp error, 4xx code (broken), 5xx code (undetermined), 200
* abort download of body when `options.retry405Head===true`
* option to retry broken links a number of times (default=0)
* option to scrape `response.body` for erroneous sounding text (using [fathom](https://npmjs.com/fathom-web)?), since an error page could be presented but still have code 200
* option to detect parked domain (302 with no redirect?)
* option to check broken link on archive.org for archived version (using [this lib](https://npmjs.com/archive.org))
* option to run `HtmlUrlChecker` checks on page load (using [jsdom](https://npmjs.com/jsdom)) to include links added with JavaScript?
* option to check if hashes exist in target URL document?
* option to parse Markdown in `HtmlChecker` for links
* option to check plain text URLs
* add throttle profiles (0–9, -1 for "custom") for easy configuring
* check [ftp:](https://npmjs.com/ftp), [sftp:](https://npmjs.com/ssh2) (for downloadable files)
* check ~~mailto:~~, news:, nntp:, telnet:?
* check that data URLs are valid (with [valid-data-url](https://www.npmjs.com/valid-data-url))?
* supply CORS error for file:// links on sites with a different protocol
* create an example with http://astexplorer.net
* swap [calmcard](https://npmjs.com/calmcard) for [matcher](https://npmjs.com/matcher) or both [minimatch](https://npmjs.com/minimatch) and `RegExp`
* use [debug](https://npmjs.com/debug)
* use [got](https://npmjs.com/got) ?
* use [bunyan](https://npmjs.com/bunyan) with JSON output for CLI
* store request object/headers (or just auth) in `Link.http`?
* supply basic auth for "page" events?
* add option for `URLCache` normalization profiles


[npm-image]: https://img.shields.io/npm/v/broken-link-checker.svg
[npm-url]: https://npmjs.org/package/broken-link-checker
[travis-image]: https://img.shields.io/travis/stevenvachon/broken-link-checker.svg
[travis-url]: https://travis-ci.org/stevenvachon/broken-link-checker
[coveralls-image]: https://img.shields.io/coveralls/stevenvachon/broken-link-checker/v0.8.0.svg
[coveralls-url]: https://coveralls.io/github/stevenvachon/broken-link-checker
[david-image]: https://img.shields.io/david/stevenvachon/broken-link-checker/v0.8.0.svg
[david-url]: https://david-dm.org/stevenvachon/broken-link-checker/v0.8.0
