Heap = require("./binaryHeap.js");
Sort = function (list) {
	this.l = list;
	this.b = false;
	this.m = false;
	this.h = new Heap();
};
Sort.prototype.list = function(list) {return list ? (this.l = list) : list.l;};
Sort.prototype.by = function (parameter) {
	console.log("sorting by: "+parameter);
	this.h.setProperty((this.b = parameter)); return this;
};
Sort.prototype.max = function () {
	this.m = true;
	this.h.setToMax();
	return this;
};
Sort.prototype.min = function () {
	this.m = false;
	this.h.setToMin();
	return this;
};
Sort.prototype.insertion = function () {

};
Sort.prototype.merge = function () {

};
Sort.prototype.quick = function () {

};
Sort.prototype.heap = function () {
	var sorted = [], list = this.l;
	var l = list.length, heap = this.h;
	heap.clear();
	while (l--) heap.push(list[l]);
	while (heap.size()) sorted.push(heap.pop());
	return sorted;
};
module.exports = Sort;