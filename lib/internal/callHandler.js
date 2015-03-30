"use strict";



/*
	Call an event handler if it exists.
*/
function callHandler(handler, args, synchronous)
{
	if (typeof handler === "function")
	{
		if (args !== undefined)
		{
			if (Array.isArray(args) !== true)
			{
				args = [args];
			}
		}
		else
		{
			args = [];
		}
		
		if (synchronous === true)
		{
			handler.apply(null, args);
		}
		else
		{
			args.unshift(handler);
			
			setImmediate.apply(null, args);
		}
	}
}



callHandler.async = function(handler, args)
{
	callHandler(handler, args, false);
};



callHandler.sync = function(handler, args)
{
	callHandler(handler, args, true);
};



module.exports = callHandler;
