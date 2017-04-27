app = require('../settings/app.js');
app.dom = require('../tools/dom.js');
app.touch = require('../input/touch.js');
app.click = require('../input/click.js');

// display damage percentage
DamageDisplay = function (percentage){

    this.setColor({h:0, s:100, l:50});

    var position = app.hud.position();
    var exists = document.getElementById('damageDisplay');
    var damageDisp = document.createElement('div');
    var damageDiv = document.createElement('div');

    damageDisp.setAttribute('id', 'damageDisplay'); 
    damageDiv.setAttribute('id', 'damage');

    damageDiv.style.backgroundColor = this.color.format();

    var heading = document.createElement('h1');
    var percent = document.createElement('h2');

    heading.innerHTML = 'DAMAGE';
    percent.innerHTML = percentage + '%';

    damageDisp.appendChild(heading);
    damageDiv.appendChild(percent);
    damageDisp.appendChild(damageDiv);

    this.b = damageDiv;
    this.o = damageDisp;
    this.p = percent;

    this.setPosition(app.hud.position());

    this.fader = new Fader(damageDiv, this.color.get()).fadeBoth().transparentBorder().start();

    if (exists) exists.parentNode.replaceChild(damageDisp, exists);
    else document.body.insertBefore(damageDisp, app.dom.insertLocation);
};
DamageDisplay.prototype.setColor = function (color) {this.color = new Hsl(color);};
DamageDisplay.prototype.setPosition = function (position) {
    this.outline().style.left = (position.x - 7) + "px";
    return this;
};
DamageDisplay.prototype.background = function () {return this.b;};
DamageDisplay.prototype.outline = function () {return this.o;};
DamageDisplay.prototype.setPercentage = function (percent) {this.p.innerHTML = percent;};
DamageDisplay.prototype.percentage = function () {return this.p.innerHTML;};
DamageDisplay.prototype.remove = function () {this.outline().parentNode.removeChild(this.outline());};
module.exports = DamageDisplay;