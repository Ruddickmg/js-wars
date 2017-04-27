app.dom = require('../tools/dom.js');
playerController = require("../controller/player.js");

StatusHud = function () {
    
	this._context = undefined;
    this._previous = undefined;
    this._gold = undefined;
};

StatusHud.prototype.visibility = function (visibility) {

    return document.getElementById('coStatusHud').style.display = visibility;
};

StatusHud.prototype.show = function () {

    this.visibility('');
    this._previous = undefined;
};

StatusHud.prototype.hide = function () {

    this.visibility('none');
};

StatusHud.prototype.power = function () { 

    return this._context; 
};

StatusHud.prototype.display = function (player, location) {
    
    if (location !== this._previous || this._gold !== playerController.gold(player)) {

        this._previous = location;

        var coHud = document.getElementById('coStatusHud');

        // create container section, for the whole hud
        var hud = document.createElement('section');
        hud.setAttribute('id', 'coStatusHud');

        if (location === 'left') {

            hud.style.left = '864px';
        }

        // create a ul, to be the gold display
        var gold = document.createElement('ul');
        gold.setAttribute('id', 'gold');

        // create a canvas to animate the special level 
        var power = document.createElement('canvas');
        var context = power.getContext(app.ctx);
        power.setAttribute('id', 'coPowerBar');
        power.setAttribute('width', 310);
        power.setAttribute('height', 128);

        // create the g for  gold
        var g = document.createElement('li');
        g.setAttribute('id', 'g');
        g.innerHTML = 'G.';
        gold.appendChild(g);


        // add the amount of gold the player currently has
        var playerGold = document.createElement('li');
        playerGold.setAttribute('id', 'currentGold');
        playerGold.innerHTML = this._gold = app.user.turn() ? playerController.gold(player) : '?';
        gold.appendChild(playerGold);

        // put it all together and insert it into the dom
        hud.appendChild(gold);
        hud.appendChild(power);

        if (coHud) {

            coHud.parentNode.replaceChild(hud, coHud);

        } else {

            document.body.insertBefore(hud, app.dom.insertLocation);
        }

        // return the context for animation of the power bar
        return this.context = context;
    }
    return false;
};

module.exports = StatusHud;