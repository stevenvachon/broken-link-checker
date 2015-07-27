"use strict";



/*
	Call an event handler if it exists.
*/
function callHandler(handler, args)
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
		
		handler.apply(null, args);
	}
}



module.exports = callHandler;
