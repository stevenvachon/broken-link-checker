import calmcard from "calmcard";  // TODO :: use npmjs.com/matcher or npmjs.com/minimatch



export default (url, keywords) => keywords.some(keyword =>
{
	// Check for literal keyword
	if (url.includes(keyword))
	{
		return true;
	}
	// Check for glob'bed keyword
	else if (calmcard(keyword, url))
	{
		return true;
	}
	else
	{
		return false;
	}
});
