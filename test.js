function SuperClass()
{
	this.superVar = Math.random();
}

SuperClass.prototype.init = function(arg1, arg2)
{
	this.arg1 = arg1;
	this.arg2 = arg2;
	
	console.log(this.arg1, this.arg2, this.superVar);
};



function SubClass(arg1, arg2)
{
	this.init(arg1, arg2);
}

SubClass.prototype = new SuperClass();
SubClass.prototype.constructor = SubClass;



new SubClass("foo1", "bar1");
new SubClass("foo2", "bar2");