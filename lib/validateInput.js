"use strict";



// TODO :: consider using "istype" package
function validateInput(args)
{
	var arg,type,valid,value;
	
	for (arg in args)
	{
		type  = args[arg].type;
		value = args[arg].value;
		
		switch(type)
		{
			case "array":
			{
				valid = Object.prototype.toString.call(value) === "[object Array]";
				break;
			}
			case "object":
			{
				valid = Object.prototype.toString.call(value) === "[object Object]";
				break;
			}
			default:
			{
				valid = typeof value === type;
			}
		}
		
		if (valid === false)
		{
			var message = arg + " must be ";
			
			// If type's first letter starts with a vowel (skip "y")
			if (type[0]==="a" || type[0]==="e" || type[0]==="i" || type[0]==="o" || type[0]==="u")
			{
				message += "an ";
			}
			else
			{
				message += "a ";
			}
			
			message += type;
			
			throw new Error(message);
		}
	}
}



module.exports = validateInput;
