"use strict";



function Queue(handlers)
{
	this.handlers = handlers;
	this.paused = false;
	this.queue = [];
}



Queue.prototype.enqueue = function(input)
{
	this.queue.push(input);
};



Queue.prototype.next = function(emitComplete)
{
	if (this.paused === false)
	{
		if (this.queue.length > 0)
		{
			this.handlers.item( this.queue.shift() );
		}
		else if (emitComplete !== false)
		{
			this.handlers.complete();
		}
	}
};



Queue.prototype.pause = function()
{
	this.paused = true;
};



Queue.prototype.resume = function(runNext)
{
	this.paused = false;
	
	if (runNext !== false)
	{
		this.next();
	}
};



module.exports = Queue;
