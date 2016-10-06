/* --------------------------------------------------------------------------------------*\
    
    Hsl.js creates an object for interaction with hsl color values

\* --------------------------------------------------------------------------------------*/

Hsl = function (h, s, l) {
	this.hue = !s ? h.h : h;
	this.saturation = s || h.s;
	this.lightness = l || h.l;
};
Hsl.prototype.get = function () {return {h:this.hue, s:this.saturation, l:this.lightness};};
Hsl.prototype.format = function () {return 'hsl('+this.hue+','+this.saturation+'%,'+this.lightness+'%)';};
module.exports = Hsl;