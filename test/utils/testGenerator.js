"use strict";
var isString = require("is-string");
var slashes = require("slashes");

var varStringPattern = /{{([^}]+)}}/;



function a_an(followingWord)
{
	var firstChar = followingWord[0].toLowerCase();

	// Skip "y" because it's always special cased
	if (firstChar==="a" || firstChar==="e" || firstChar==="i" || firstChar==="o" || firstChar==="u")
	{
		return "an";
	}

	return "a";
}



function addSlashes(str)
{
	return slashes.add(str);
}



function format(input)
{
	if (isString(input) === true)
	{
		var match = varStringPattern.exec(input);

		// If {{text}}, which is intended to be outputted literally
		if (match !== null)
		{
			// Code/Variable
			return match[1];
		}

		// String
		return '"'+input+'"';
	}

	// Rely on JavaScript's internal stringification
	return input;
}



/*function italic(string)
{
	string = "\u001b[3m"+string+"\u001b[23m";

	// Italics are not widely supported
	string = "*"+string+"*";

	return string;
}*/



module.exports =
{
	a_an: a_an,
	addSlashes: addSlashes,
	format: format/*,
	italic: italic*/
};
