# broken-link-checker [![NPM Version](http://badge.fury.io/js/broken-link-checker.svg)](http://badge.fury.io/js/broken-link-checker) [![Build Status](https://secure.travis-ci.org/stevenvachon/broken-link-checker.svg)](http://travis-ci.org/stevenvachon/broken-link-checker) [![Dependency Status](https://david-dm.org/stevenvachon/broken-link-checker.svg)](https://david-dm.org/stevenvachon/broken-link-checker)
> Find broken links, missing images, etc in your HTML.

Features:
* Requests urls, html files, urls to html files
* Parses various html tags/attributes, not just `<a href>`
* Supports absolute and relative urls
* Provides detailed information about each link (http and html)

```js
var BrokenLinkChecker = require("broken-link-checker");

var options = { site:"https://mywebsite.com" };
var blc = new BrokenLinkChecker(options);

var html = '<a href="https://google.com">absolute link</a>';
html += '<a href="/path/to/resource.html">relative link</a>';
html += '<img src="http://fakeurl.com/image.png" alt="missing image"/>';

blc.checkHtml(html, {
	link: function(result) {
		console.log(result.html.index, result.broken, result.html.text, result.url.resolved);
		//-> 0 false "absolute link" "https://google.com"
		//-> 1 false "relative link" "https://mywebsite.com/path/to/resource.html"
		//-> 2 true null "http://fakeurl.com/image.png"
	},
	complete: function() {
		console.log("done checking!");
	}
});
```


## Installation

[Node.js](http://nodejs.org/) `~0.10` is required. Type this at the command line:
```shell
npm install broken-link-checker --save-dev
```


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
Scans the HTML content at `url` to find broken links. `handlers.link` is fired for each result and `handlers.complete` is fired after the last result or zero results. If `url` cannot be reached, `handlers.complete` is fired with an `error` argument and the whole operation is cancelled.
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
Any links to schemes/protocols not listed here will contain an "Invalid URI" error.

### options.excludeEmptyAnchors
Type: `Boolean`  
Default value: `false`  
An empty anchor (`<a href="">`,`<area href="">`) will not be checked when `true`. While browsers natively treat these as links to the current page, it is possible that their existence is the result of developer error.

### options.filterLevel
Type: `Number`  
Default value: `1`  
The tags and attributes that are considered links for checking, split into the following levels:
* `0`: clickable links
* `1`: clickable links, images
* `2`: clickable links, images, stylesheets, scripts, forms
* `3`: clickable links, images, stylesheets, scripts, forms, meta

To see the exact breakdown, check out the [tag map](https://github.com/stevenvachon/broken-link-checker/blob/master/lib/index.js#L18-L54).

### options.site
Type: `String`  
Default value: `undefined`  
The address to which all relative URLs will be made absolute. Without a value, links to relative URLs will contain an "Invalid URI" error.


## Handling link errors
Each result will have its own `error` key for which you can compare against:
```js
if (result.error !== null) {
	// Server could not be reached
	if (result.error.code === "ENOTFOUND"){}
	// Connection timed out
	if (result.error.code === "ETIMEDOUT"){}
	// Duh.
	if (result.error.message === "Invalid URI"){}
}
```


## Roadmap Features
* support `<head><base href="baseurl"></head>` element
* test links to larger/binary files to prevent full download
* option to check for page source in case 404s redirect to static html with status 200?
* cli
* `handlers.log()` for logging requests, parsing html, etc
* stream html files (waiting on [parse5](https://npmjs.com/package/parse5))

## Changelog
* 0.2.0 `options.excludeEmptyAnchors`,`options.filterLevel`, new linkObj structure, more complete test suite
* 0.1.0 initial release
