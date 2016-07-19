Counter = function (limit) {
	this.limit = limit;
	this.frames = 0;
}

Counter.prototype.incriment = function () { this.frames += 1; };
Counter.prototype.reached = function (limit) { return this.frames > (limit ? limit : this.limit); };
Counter.prototype.reset = function () { if (this.reached()) this.frames = 0; };

module.exports = Counter;