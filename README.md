# broken-link-checker [![NPM Version](http://badge.fury.io/js/broken-link-checker.svg)](http://badge.fury.io/js/broken-link-checker) [![Build Status](https://secure.travis-ci.org/stevenvachon/broken-link-checker.svg)](http://travis-ci.org/stevenvachon/broken-link-checker) [![Dependency Status](https://david-dm.org/stevenvachon/broken-link-checker.svg)](https://david-dm.org/stevenvachon/broken-link-checker)
> Find broken links, missing images, etc in your HTML (Node.js)

Features:
* Requests urls, html files, urls to html files
* Parses various html tags/attributes, not just `<a href>`
* Supports absolute and relative urls

```js
var BrokenLinkChecker = require("broken-link-checker");

var options = { site:"https://mywebsite.com" };
var blc = new BrokenLinkChecker(options);

var html = '<a href="https://google.com">absolute link</a>';
html += '<a href="/path/to/resource.html">relative link</a>';

blc.checkHtml(html, function(linkObj) {
	console.log(linkObj.url);	//-> "https://google.com", "https://mywebsite.com/path/to/resource.html"
});
```


## Installation

[Node.js](http://nodejs.org/) `~0.10` is required. Type this at the command line:
```shell
npm install broken-link-checker --save-dev
```


## Methods

### blc.checkHtml(html, callback)
Scans one or more HTML strings to find broken links. A callback is invoked with the results.

* `html` can be a `String` or an `Array`.
* `callback` is a `Function`.

### blc.checkHtmlUrl(url, callback)
Requests one or more URLs and scans the HTML content returned from each to find broken links. A callback is invoked with the results.

* `url` can be a `String` or an `Array`.
* `callback` is a `Function`.

### blc.checkUrl(url, callback)
Requests one or more URLs to determine if they are broken. A callback is invoked with the results.

* `url` can be a `String` or an `Array`.
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
* link text
* stream html files (waiting on [parse5](https://npmjs.com/package/parse5))
* cli
* option to check for page source in case 404s redirect to static html with status 200?


## Changelog
* 0.0.1 pre-release
