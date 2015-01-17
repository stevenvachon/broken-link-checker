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
		console.log(result.index, result.broken, result.text, result.url);
		//-> 0 false "absolute link" "https://google.com"
		//-> 1 false "relative link" "https://mywebsite.com/path/to/resource.html"
		//-> 2 true "" "http://fakeurl.com/image.png"
	},
	complete: function(error) {
		if (error !== null) throw error;
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
Scans an HTML string to find broken links. A `link` event is fired for each result and a `complete` event is fired after the last result. In the event of a serious error, `complete` is fired with an `error` argument and the whole operation is cancelled.

* `html` is a `String`.
* `handlers` is an `Object` containing event handler `Function`s.

### blc.checkHtmlUrl(url, handlers)
Requests a URL and scans the HTML content returned to find broken links. A `link` event is fired for each result and a `complete` event is fired after the last result. In the event of a serious error, `complete` is fired with an `error` argument and the whole operation is cancelled.

* `url` can be a `String` or an `Array`.
* `handlers` is an `Object` containing event handler `Functions`s.

### blc.checkUrl(url, callback)
Requests a URL to determine if it is broken. A callback is invoked with the results.

* `url` is a `String`.
* `callback` is a `Function`.


## Options

### options.acceptedSchemes
Type: `Array`  
Default value: `["http","https"]`  
The schemes that will be checked. Example: a link to `ftp://files.com` will not be checked with this option's default value.

### options.site
Type: `String`  
Default value: `undefined`  
The address to which all relative URLs will be made absolute. Example: a link to `/path/to/file` will not be checked with this option's default value.


## Roadmap Features
* stream html files (waiting on [parse5](https://npmjs.com/package/parse5))
* cli
* `handlers.log()` for logging requests, parsing html, etc
* different element/attribute filter levels
* option to check for page source in case 404s redirect to static html with status 200?


## Changelog
* 0.1.0 initial release
