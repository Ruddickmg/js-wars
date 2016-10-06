Node = function (element) {
	this.value = element;
};
Node.prototype.setLeft = function (node) {  
	this.left = node;
	node.right = this;
};
Node.prototype.setRight = function (node) {
	this.right = node;
	node.left = this;
};
Node.prototype.remove = function () {
	if (this.right) this.right.left = this.left;
	if (this.left) this.left.right = this.right;
	return this;
};
module.exports = Node;