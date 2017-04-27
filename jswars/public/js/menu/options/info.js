Table = require("../../dom/table.js");
Sort = require("../../tools/sort.js");
Info = function (type, display, parameters) {

	var outline = document.createElement("section");
	var container = document.createElement("div");
	var table = new Table(type, display, parameters);
	
	outline.setAttribute("id", type);
	outline.setAttribute("class", "infoTable");
	outline.appendChild(container);
	
	container.setAttribute("id","innerInfo");
	container.appendChild(table.element);

	this.display = display;
	this.parameters = parameters;
	this.type = type;
	this.parent = outline;
	this.child = container;
	this.table = table;

	this.screen().appendChild(this.parent);
};
Info.prototype.remove = function () {this.screen().removeChild(this.parent)};
Info.prototype.screen = function () {return document.getElementById("gameScreen");};

module.exports = Info;