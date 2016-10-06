app = require('../settings/app.js');
app.display = require('../tools/display.js');
app.game = require('../game/game.js');
app.dom = require('../tools/dom.js');
app.touch = require('../tools/touch.js');
app.click = require('../tools/click.js');
app.input = require('../objects/input.js');
app.footer = require('../objects/footer.js');

Arrows = require('../objects/arrows.js');

module.exports = function () {

    var changeTitle = function (element, name) {
    	// get the title and change it to select whatever type we are selecting
        title = element.children[0];
        title.innerHTML = name;
    };

	return {

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
	            document.body.insertBefore(damageDisp, app.domInsertLocation);
	        }
	    },

		modeMenu: function () { 

	        // height of each mode element
	        var height = app.settings.selectedModeHeight;

	        // menu layout
	        var menu = app.settings.selectModeMenu;

	        // (war room, campaign) eventually integrate ai opponents?
	        var setupScreen = document.createElement('article');
	        setupScreen.setAttribute('id','setupScreen');
	        app.touch(setupScreen).swipeScreen();
	        app.click(setupScreen).swipeScreen();

	        // create title to display on page
	        var title = document.createElement('h1');
	        title.setAttribute('id', 'title');
	        title.innerHTML = 'Select*Mode';
	        setupScreen.appendChild(title);

	        // create list of selectable modes
	        var selectMenu = document.createElement('ul');
	        selectMenu.setAttribute('id', 'selectModeMenu');

	        // create footer for game info and chat
	        var footer = document.createElement('footer');
	        var info = document.createElement('p');
	        var footSpan = document.createElement('span');
	        footSpan.setAttribute('id','footerText');
	        info.appendChild(footSpan);
	        info.setAttribute('id', 'scrollingInfo');
	        footer.setAttribute('id','footer');
	        footer.appendChild(info);

	        // create and insert information for each mode
	        for( var m = 0; m < menu.length; m += 1){

	            var mi = menu[m];
	            var color = app.hsl(app.settings.colors[mi.id]);

	            // block is the background bar
	            var block = document.createElement('div');
	            block.setAttribute('class', 'block');
	            block.style.backgroundColor = color;

	            var background = document.createElement('div');
	            background.setAttribute('class', 'modeBackground');

	            // span is to make a background around the text
	            var span = document.createElement('span');
	            span.setAttribute('class', 'textBackground');
	            span.innerHTML = mi.display;

	            // set displayed text for mode selection
	            var text = document.createElement('h1');
	            text.setAttribute('class', 'text');
	            text.style.borderColor = color;
	            text.appendChild(span);

	            app.touch(text).changeMode().doubleTap();
	            app.touch(background).changeMode().doubleTap();
	            app.click(text).changeMode().doubleClick();
	            app.click(background).changeMode().doubleClick();

	            // create li item for each mode
	            var item = document.createElement('li');
	            item.setAttribute('class','modeItem');
	            item.setAttribute('modeItemIndex', m + 1);
	            item.setAttribute('id', mi.id);
	            item.style.height = height;
	            item.style.color = color;
	            item.appendChild(background);
	            item.appendChild(block);
	            item.appendChild(text);

	            // if there are further options for the mode
	            if(mi.options){

	                // create list of options
	                var options = document.createElement('ul');
	                var length = mi.options.length;
	                options.setAttribute('class', 'modeOptions');

	                // default to not showing options (hide them when not selected)
	                options.style.opacity = 0;

	                for(var o = 0; o < length; o += 1){

	                    // create li item for each option
	                    var option = document.createElement('li');
	                    option.setAttribute('class', 'modeOption');
	                    option.setAttribute('modeOptionIndex', o + 1);
	                    option.setAttribute('id', mi.options[o] + mi.id);
	                    app.touch(option).modeOptions().doubleTap();
	                    app.click(option).modeOptions().doubleClick();

	                    // create id and display name for each option
	                    option.innerHTML = mi.options[o];

	                    // add each option to options list
	                    options.appendChild(option);
	                }
	                // add options to the item
	                item.appendChild(options);
	            }
	            // add items to select menu
	            selectMenu.appendChild(item);
	        }
	        // add select menu to select mode screen
	        setupScreen.appendChild(selectMenu);
	        setupScreen.appendChild(footer);

	        // insert select mode screen into dom
	        var ss = document.getElementById('setupScreen');
	        if(ss) {
	            ss.parentNode.replaceChild(setupScreen, ss);
	        }else{
	            document.body.insertBefore(setupScreen, app.domInsertLocation);
	        }
	    }
	};
}();