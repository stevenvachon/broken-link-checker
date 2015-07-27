"use strict";



function UrlCache()
{
	this.clear();
}



/*
	Run a callback function when a URL response has been retrieved.
*/
UrlCache.prototype.addCallback = function(url, callback)
{
	if (Array.isArray(this.retrievalStore[url]) === true)
	{
		this.retrievalStore[url].push(callback);
	}
	else
	{
		this.retrievalStore[url] = [callback];
	}
};



/*
	Remove all cached URL responses.
*/
UrlCache.prototype.clear = function()
{
	this.cache = {};
	this.retrievalStore = {};
};



/*
	Returns `true` if a URL response exists in cache.
*/
UrlCache.prototype.contains = function(url)
{
	return this.cache[url] !== undefined;
};



/*
	Returns a cached URL response.
*/
UrlCache.prototype.get = function(url)
{
	return this.cache[url];
};



/*
	Returns `true` if a URL response is currently being retrieved.
*/
UrlCache.prototype.isRetrieving = function(url)
{
	return this.retrievalStore[url] !== undefined;
};



/*
	Store a URL response in cache.
*/
UrlCache.prototype.set = function(url, response)
{
	var i,numCallbacks;
	var callbacks = this.retrievalStore[url];
	
	this.cache[url] = response;
	
	// If `setRetrieving()` was called -- not a manual `set()`
	if (callbacks !== undefined)
	{
		if (Array.isArray(callbacks) === true)
		{
			numCallbacks = callbacks.length;
			
			for (i=0; i<numCallbacks; i++)
			{
				callbacks[i](response, url);
			}
		}
		
		delete this.retrievalStore[url];
	}
};



/*
	Mark a URL as being actively retrieved.
*/
UrlCache.prototype.setRetrieving = function(url)
{
	if (this.isRetrieving(url) === false)
	{
		this.retrievalStore[url] = true;
	}
};



module.exports = UrlCache;
