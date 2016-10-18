app = require('../settings/app.js');
app.game = require('../game/game.js');
app.dom = require('../tools/dom.js');
app.touch = require('../input/touch.js');
app.click = require('../input/click.js');

module.exports = {

	startButton: function (id) {

        var screen = document.getElementById(id);
        button = document.createElement('div');
        button.setAttribute('class', 'button');
        button.setAttribute('id', 'startButton');
        button.style.display = 'none';
        button.addEventListener("click", function(event){
            event.preventDefault();
            app.game.start();
        });
        screen.appendChild(button);

        return {
            show: function () {button.style.display = '';},
            hide: function () {button.style.display = 'none';},
            remove: function (){screen.removeChild(button);}
        };
    },

	// display damage percentage
    damage: function (percentage){

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
        if(exists){
            exists.parentNode.replaceChild(damageDisp, exists);
        }else{
            document.body.insertBefore(damageDisp, app.dom.insertLocation);
        }
    }
};