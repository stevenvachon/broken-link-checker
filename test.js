function bar()
{
	console.log(this.a);
}



function foo()
{
	console.log(this.b);
}



function test()
{
	return {
		a: "yeah",
		b: "nope",
		
		foo: foo,
		bar: bar
	};
}



test().bar();
test().foo();