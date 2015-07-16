"use strict";


function urlCache()
{
	var thisObj = this;
	this.cache = {};
	this.retrievalStore = {};
}

urlCache.prototype.clear = function()
{
	this.cache = {};
	this.retrievalStore = {};
}



urlCache.prototype.store = function(url, executionFn)
{
	this.cache[url] = executionFn;
	if (isArray(this.retrievalStore[url]))
	{
		this.retrievalStore[url].forEach(function(cb)
		{
			executionFn(cb);
		});
	}
	delete this.retrievalStore[url];
}



urlCache.prototype.retrieve = function(url)
{
	return this.cache[url];
}



urlCache.prototype.contains = function(url)
{
	return this.cache[url] !== undefined;
}



urlCache.prototype.startRetrieving = function(url)
{
	if (!this.isRetrieving(url)) {
		this.retrievalStore[url] = true;
	}
}



urlCache.prototype.isRetrieving = function(url)
{
	return this.retrievalStore[url] !== undefined;
}



urlCache.prototype.addCallback = function(url, callback)
{
	if (isArray(this.retrievalStore[url]))
	{
		this.retrievalStore[url].push(callback);
	} else {
		this.retrievalStore[url] = [callback];
	}
}



//::: PRIVATE FUNCTIONS
function isArray(item)
{
	return ((typeof item).toUpperCase() === 'OBJECT');
}



module.exports = urlCache;
