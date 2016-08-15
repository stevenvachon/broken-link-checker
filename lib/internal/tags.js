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
	a:        { href:true },
	applet:   { archive:true, code:true, src:true },
	area:     { href:true },
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
	a:        { href:true },
	applet:   { archive:true, code:true, src:true },
	area:     { href:true },
	audio:    { src:true },
	body:     { background:true },
	button:   { formaction:true },
	embed:    { src:true },
	form:     { action:true },
	frame:    { src:true },
	iframe:   { src:true },
	img:      { src:true, srcset:true },
	input:    { formaction:true, src:true },
	link:     { href:true },
	menuitem: { icon:true },
	meta:     { content:true },
	object:   { data:true },
	script:   { src:true },
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

// Clickable links, media, frames, meta refreshes, stylesheets, scripts, forms, metadata
const flatLevel3 =
{
	"*":        { itemtype:true },
	a:          { href:true, ping:true },
	applet:     { archive:true, code:true, codebase:true, object:true, src:true },
	area:       { href:true, ping:true },
	audio:      { src:true },
	blockquote: { cite:true },
	body:       { background:true },
	button:     { formaction:true },
	del:        { cite:true },
	embed:      { src:true },
	form:       { action:true },
	frame:      { longdesc:true, src:true },
	head:       { profile:true },
	html:       { manifest:true },
	iframe:     { longdesc:true, src:true },
	img:        { longdesc:true, src:true, srcset:true },
	input:      { formaction:true, src:true },
	ins:        { cite:true },
	link:       { href:true },
	menuitem:   { icon:true },
	meta:       { content:true },
	object:     { codebase:true, data:true },
	q:          { cite:true },
	script:     { src:true },
	source:     { src:true, srcset:true },
	table:      { background:true },
	tbody:      { background:true },
	td:         { background:true },
	tfoot:      { background:true },
	th:         { background:true },
	thead:      { background:true },
	tr:         { background:true },
	track:      { src:true },
	video:      { poster:true, src:true }
};



const recursiveLevel0 = flatLevel0;

const recursiveLevel1 =
{
	a:        { href:true },
	area:     { href:true },
	iframe:   { src:true },
	meta:     { content:true }
};

const recursiveLevel2 =
{
	a:        { href:true },
	area:     { href:true },
	iframe:   { src:true },
	meta:     { content:true }
};

const recursiveLevel3 =
{
	a:          { href:true },
	area:       { href:true },
	blockquote: { cite:true },
	del:        { cite:true },
	frame:      { longdesc:true },
	iframe:     { longdesc:true, src:true },
	img:        { longdesc:true },
	ins:        { cite:true },
	meta:       { content:true },
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
