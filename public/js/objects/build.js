Building = require('../objects/building.js');
//ListElement = require('../tools/dom/listElement.js');

Build = function () {
	this.element = document.createElement('section');
	this.element.setAttribute('id', 'buildSelectionScreen');
	// this.element.appendChild(this.mapElements);
	// this.element.appendChild(this.units);
	this.selecting = false;
	this.player = 1;
	this.selected = 'HQ';
};

Build.prototype.active = function () { return this.selecting; };
Build.prototype.set = function (element) { this.selected = element.name(); };
Build.prototype.select = function () { 
	if (app.key.pressed(app.key.enter() && app.key.undo(app.key.enter()))){
		this.down();
		this.selecting = false;
		//this.selected = this.selection[]
	}
};

//Building.prototype.mapElements = new ListElement('buildings', ['hq','base']);
//Building.prototype.units = new ListElement('buildings', ['infantry','apc']);

module.exports = Build;