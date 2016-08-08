* 0.7.3 updated tests and dependencies
* 0.7.2 added `options.retry405Head`
* 0.7.1 bug fix
* 0.7.0
  * added `SiteChecker`
  * methods added: `numPages()`, `numSites()`
  * methods removed: `numActiveItems()`
  * methods renamed: `length()`->`numQueuedLinks()`
  * options added: `honorRobotExclusions`
  * options removed: `excludeResponseData`
  * handlers added: `html`, `robots`
  * handlers renamed: `item`->`page`
  * CLI options added: `--follow`, `--recursive`, `--user-agent`
  * linkObj added: `brokenReason`, `excludedReason`, `html.location`
  * linkObj removed: `error`, `http.redirects`, `http.statusCode`
  * HTML streaming
  * added support for `<meta>` redirects
* 0.6.7
  * reduced redundant URL checks by storing `HtmlUrlChecker` responses in cache
  * optimizations
* 0.6.6 bug fix
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
