"use strict";



function urlCache()
{
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
	var i,numCallbacks;
	var callbacks = this.retrievalStore[url];

	this.cache[url] = executionFn;

	if (Array.isArray(callbacks) === true)
	{
		numCallbacks = callbacks.length;

		for (i=0; i<numCallbacks; i++)
		{
			executionFn( callbacks[i] );
		}
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
	if (this.isRetrieving(url) === false)
	{
		this.retrievalStore[url] = true;
	}
}



urlCache.prototype.isRetrieving = function(url)
{
	return this.retrievalStore[url] !== undefined;
}



urlCache.prototype.addCallback = function(url, callback)
{
	if (Array.isArray(this.retrievalStore[url]) === true)
	{
		this.retrievalStore[url].push(callback);
	}
	else
	{
		this.retrievalStore[url] = [callback];
	}
}



module.exports = urlCache;
