BuildingDisplay = function () {
	var property = function (id) { return document.getElementById(id).firstChild; };
	this.e = app.display.info({
	        city:{ numberOf:0, type:'city' },
	        base:{ numberOf:0, type:'base' },
	        airport:{ numberOf:0, type:'airport' },
	        seaport:{ numberOf:0, type:'seaport' },
	    }, 
	    ['numberOf', 'canvas'], 
	    {section:'buildingsDisplay', div:'numberOfBuildings'}, 
        app.dom.addCanvas
    );
	this.city = property('city');
	this.base = property('base');
	this.airport = property('airport');
	this.seaport = property('seaport');
};

BuildingDisplay.prototype.element = function () { return this.e; };
BuildingDisplay.prototype.cities = function (number) { this.city.innerHtml = number; };
BuildingDisplay.prototype.bases = function (number) { this.base.innerHTML = number; };
BuildingDisplay.prototype.airPorts = function (number) { this.airport.innerHtml = number; };
BuildingDisplay.prototype.seaPorts = function (number) { this.seaport.innerHtml = number; };
BuildingDisplay.prototype.set = function (numberOf) {
	if (numberOf.city) this.cities(numberOf.city);
	if (numberOf.base) this.bases(numberOf.base);
	if (numberOf.seaport) this.seaPorts(numberOf.seaport);
	if (numberOf.airport) this.airPorts(numberOf.airport);
};

module.exports = BuildingDisplay;