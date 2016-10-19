app = require('../settings/app.js');
app.dom = require('../tools/dom.js');
app.touch = require('../input/touch.js');
app.click = require('../input/click.js');

// display damage percentage
DamageDisplay = function (percentage){

    var exists = document.getElementById('damageDisplay');
    var damageDisp = document.createElement('div');
    var damageDiv = document.createElement('div');

    damageDisp.setAttribute('id', 'damageDisplay'); 
    damageDiv.setAttribute('id', 'damage');

    var heading = document.createElement('h1');
    var percent = document.createElement('h2');

    heading.innerHTML = 'DAMAGE';
    percent.innerHTML = percentage + '%';

    damageDisp.appendChild(heading);
    damageDiv.appendChild(percent);
    damageDisp.appendChild(damageDiv);

    if (exists) exists.parentNode.replaceChild(damageDisp, exists);
    else document.body.insertBefore(damageDisp, app.dom.insertLocation);
};

module.exports = DamageDisplay;