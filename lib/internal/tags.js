import deepFreeze from "deep-freeze-node";



// Clickable links
const flatLevel0 =
{
	a:      { href:true },
	area:   { href:true }
};

// Clickable links, media, frames, meta refreshes
const flatLevel1 =
{
	...flatLevel0,
	applet:   { archive:true, code:true, src:true },
	audio:    { src:true },
	body:     { background:true },
	embed:    { src:true },
	frame:    { src:true },
	iframe:   { src:true },
	img:      { src:true, srcset:true },
	input:    { src:true },
	menuitem: { icon:true },
	meta:     { content:true },
	object:   { data:true },
	source:   { src:true, srcset:true },
	table:    { background:true },
	tbody:    { background:true },
	td:       { background:true },
	tfoot:    { background:true },
	th:       { background:true },
	thead:    { background:true },
	tr:       { background:true },
	track:    { src:true },
	video:    { poster:true, src:true }
};

// Clickable links, media, frames, meta refreshes, stylesheets, scripts, forms
const flatLevel2 =
{
	...flatLevel1,
	button: { formaction:true },
	form:   { action:true },
	input:  { formaction:true, ...flatLevel1.input },
	link:   { href:true },
	script: { src:true }
};

// Clickable links, media, frames, meta refreshes, stylesheets, scripts, forms, metadata
const flatLevel3 =
{
	...flatLevel2,
	"*":        { itemtype:true },
	a:          { ping:true, ...flatLevel2.a },
	applet:     { codebase:true, object:true, ...flatLevel2.applet },
	area:       { ping:true, ...flatLevel2.area },
	blockquote: { cite:true },
	del:        { cite:true },
	frame:      { longdesc:true, ...flatLevel2.frame },
	head:       { profile:true },
	html:       { manifest:true },
	iframe:     { longdesc:true, ...flatLevel2.iframe },
	img:        { longdesc:true, ...flatLevel2.img },
	ins:        { cite:true },
	object:     { codebase:true, ...flatLevel2.object },
	q:          { cite:true }
};



const recursiveLevel0 = flatLevel0;

const recursiveLevel1 =
{
	...recursiveLevel0,
	iframe: { src:true },
	meta:   { content:true }
};

const recursiveLevel2 = recursiveLevel1;

const recursiveLevel3 =
{
	...recursiveLevel2,
	blockquote: { cite:true },
	del:        { cite:true },
	frame:      { longdesc:true },
	iframe:     { longdesc:true, ...recursiveLevel2.iframe },
	img:        { longdesc:true },
	ins:        { cite:true },
	q:          { cite:true }
};



export default deepFreeze(
{
	0: flatLevel0,
	1: flatLevel1,
	2: flatLevel2,
	3: flatLevel3,
	length: 4,  // simulate Array

	recursive:  // only used for `SiteChecker`
	{
		0: recursiveLevel0,
		1: recursiveLevel1,
		2: recursiveLevel2,
		3: recursiveLevel3
	}
});
