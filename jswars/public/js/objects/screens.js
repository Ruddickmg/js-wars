app = require('../settings/app.js');
app.game = require('../game/game.js');
app.dom = require('../tools/dom.js');
app.touch = require('../tools/touch.js');
app.menu = require('../menu/menu.js');

module.exports = function () {

    var inputField = function (name) {
        var text = document.createElement('input');
        text.setAttribute('id', name + 'Input');
        text.setAttribute('class','textInput');
        text.setAttribute('autocomplete','off');
        text.setAttribute('type','text');
        return text;
    };

    var arrow = {

        up: function () {

            var exists = document.getElementById('upArrowOutline');

            var upArrowBackground = document.createElement('div');
            upArrowBackground.setAttribute('id','upArrowBackground');
            upArrowBackground.setAttribute('class','upArrow');

            var upArrowOutline = document.createElement('div');
            upArrowOutline.setAttribute('id','upArrowOutline');
            upArrowOutline.setAttribute('class','upArrow');

            upArrowOutline.appendChild(upArrowBackground);

            if(exists){
                //exists.parentNode.replaceChild(upArrowOutline, exists);
                //return false;
                return upArrowOutline;
            }else{
                return upArrowOutline;
            }
        },
        down: function () {

            var exists = document.getElementById('downArrowOutline');

            var downArrowBackground = document.createElement('div');
            downArrowBackground.setAttribute('id','downArrowBackground');
            downArrowBackground.setAttribute('class','downArrow');

            var downArrowOutline = document.createElement('div');
            downArrowOutline.setAttribute('id','downArrowOutline');
            downArrowOutline.setAttribute('class','downArrow');

            downArrowOutline.appendChild(downArrowBackground);

            if(exists){
                //exists.parentNode.replaceChild(downArrowOutline, exists);
                //return false;
                return downArrowOutline;
            }else{
                return downArrowOutline;
            }        
        }
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
	            app.menu.start();
	        });
	        screen.appendChild(button);

	        return {
	            show: function () {button.style.display = '';},
	            hide: function () {button.style.display = 'none';},
	            remove: function (){screen.removeChild(button);}
	        };
	    },

	    rules: function (element, textField, back) {

	        var allowed = ['on', 'off', 'num', 'clear', 'rain', 'snow', 'random', 'a', 'b', 'c']
	        var settings = app.game.settings();
	        var rules = app.settings.settingsDisplayElement;
	        var keys = Object.keys(rules);
	        var len = keys.length;
	        var offScreen = Number(app.offScreen);

	        var cont = document.createElement('section');
	        cont.setAttribute('id', 'settings');

	        var width = element.offsetWidth;
	        var height = element.offsetHeight;

	        var left = width * .05;
	        var middle = height * .5;
	        var top = back ? middle - offScreen : middle + offScreen;
	        var id = 0;

	        var nameInput = app.screens.inputForm('name', textField, 'Enter name here.');
	        textField.appendChild(nameInput);

	        for (var i = 0; i < len; i += 1){

	            var div = document.createElement('div');
	            var stable = document.createElement('div');

	            var property = keys[i];
	            var rule = rules[property];
	            rule.hide = true;
	            rule.index = true;

	            if (rule.inc){
	                for (var n = rule.min; n <= rule.max; n += rule.inc){
	                    rule[n] = n;
	                }
	            }

	            var heading = document.createElement('h1');
	            heading.innerHTML = property;

	            var ul = app.dom.createList(rule, property + 'Settings', allowed).ul;

	            div.setAttribute('id', property + 'Background');
	            div.setAttribute('class', 'rules');

	            stable.setAttribute('id', property + 'Container');
	            stable.setAttribute('class', 'stable');

	            stable.appendChild(heading);

	            div.style.left = left + 'px';
	            div.style.top = top + 'px';

	            stable.style.left = left + 'px';
	            stable.style.top = top + 'px';

	            left += .13 * width;
	            top -= .06 * height;

	            var list = app.dom.getImmediateChildrenByTagName(ul, 'li');

	            var show = app.dom.findElementByTag('class', list, settings[property]);

	            app.dom.show(show, list, 'inline-block');
	            app.touch(stable).element().scroll(ul);

	            stable.appendChild(ul);
	            cont.appendChild(stable);
	            cont.appendChild(div);
	        }

	        var up = arrow.up();
	        var down = arrow.down();
	        if (up) cont.appendChild(up);
	        if (down) cont.appendChild(down);
	        element.appendChild(cont);

	        return cont;
	    },

		teams: function (element, textField) {

	        var cos = app.co;
	        var coList = Object.keys(cos);
	        var len = coList.length;
	        var elem = {};
	        var obj = {};
	        var teamElements = {};
	        var height = element.offsetHeight;
	        var width = element.offsetWidth;
	        var size = 200;
	        var fontSize = size / 4;
	        var nop = app.map.players();
	        var top = (height * .3) + app.offScreen;
	        var exists = document.getElementById('teams');
	        var teams = document.createElement('article');
	        teams.setAttribute('id','teams');

	        var chatScreen = document.getElementById('descriptionOrChatScreen');
	        var chat = app.screens.inputForm('chat', chatScreen, 'type here to chat with other players');

	        chatScreen.appendChild(chat);

	        if(nop === undefined)
	        	throw new Error('players missing!', 'screens', 182);

	        if(nop > 2) {
	            var teamProperties = {
	                ind: true,
	                hide: true,
	                description:'Set alliances by selecting the same team.'
	            };
	            var allowed = [];
	            var teamArr = ['a','b','c','d'];
	            for(var i = 0; i < nop; i += 1){
	                var t = teamArr[i];
	                allowed[i] = t;
	                teamProperties[t] = t.toUpperCase() + 'Team';
	            }
	            var teamSelect = true;
	        }

	        for (var p = 1; p <= nop; p += 1){

	            var ind = p - 1;
	            var playa = 'player' + p;
	            var pName = p+'p';
	            var modes = {
	                index: true,
	                hide:true,
	                Cp:'Cp',
	                description: 'Chose Player or Computer.'
	            };

	            var modeAllow = ['Cp', pName];
	            var sections =  width / nop;
	            var position = (sections * ind) + ((sections - size) / 2);

	            var player = document.createElement('section');

	            player.setAttribute('id','player' + p);
	            player.setAttribute('class','players');
	            player.style.width = size + 'px';
	            player.style.height = size + 'px';
	            player.style.left = position + 'px';
	            player.style.top = top + 'px';

	            var coId = playa + 'co';
	            var modeId = playa + 'mode';

	            elem[coId] = {description: 'Chose a CO.'};

	            for(var i = 0; i < len; i += 1){
	                var name = coList[i];
	                var co = cos[name];
	                elem[coId][name] = {
	                    name:co.name,
	                    image:co.image
	                }
	                obj[name] = name;
	            }

	            modes[pName] = pName;

	            elem[modeId] = modes;

	            obj.index = true;
	            obj.hide = true;

	            var modeUl = app.dom.createList(modes, modeId, modeAllow).ul;
	            modeUl.setAttribute('class','playerMode');
	            modeUl.style.fontSize = fontSize + 'px';
	            modeUl.style.left = size - (fontSize / 2) + 'px';

	            var coUl = app.dom.createList(obj, coId, coList).ul;
	            coUl.setAttribute('class','coList');

	            var users = app.players.all()[ind];

	            if(users && users.mode) pName = users.mode;

	            var modeList = app.dom.getImmediateChildrenByTagName(modeUl, 'li');
	            var list = app.dom.getImmediateChildrenByTagName(coUl, 'li');

	            if(users && users.co){
	                var co = app.dom.show(app.dom.findElementByTag('class', list, users.co), list);
	            }else{
	                var co = app.dom.show(app.dom.findElementByTag(coId + 'Index', list, p), list);
	            }

	            var mode = app.dom.show(app.dom.findElementByTag('class', modeList, pName), modeList);

	            if(teamSelect){
	                teamElements[ playa + 'Team' ] = teamProperties;
	                var id = playa + 'Team';
	                var teamsElement = app.dom.createList(teamProperties, id, allowed).ul;
	                teamsElement.setAttribute('class', 'team');
	                teamsElement.style.width = size + 'px';
	                teamsElement.style.top = size * 4 + 'px';
	                var teamList = app.dom.getImmediateChildrenByTagName(teamsElement, 'li');
	                var def = users && users.team ? users.team : teamArr[ind];
	                var team = app.dom.show(app.dom.findElementByTag('class', teamList, def), teamList);
	            }

	            if(!users && !app.players.empty()){
	                app.players.setProperty(modeId, mode);
	                app.players.setProperty(coId, co);
	                if (teamSelect)
	                    app.players.setProperty(id, team);
	            }

	            player.appendChild(modeUl);
	            player.appendChild(coUl);
	            app.touch(modeUl).element().scroll();
	            app.touch(coUl).element().scroll().doubleTap().esc();

	            if (teamSelect){
	             	player.appendChild(teamsElement);
	             	app.touch(teamsElement).element().scroll().doubleTap();
	            }
	            teams.appendChild(player);
	        }

	        var up = arrow.up();
	        var down = arrow.down();

	        if (up) teams.appendChild(up);
	        if (down) teams.appendChild(down);

	        app.settings.playersDisplayElement = elem;
	        if(teamSelect) app.settings.teamsDisplayElement = teamElements;

	        if(exists){
	            element.replaceChild(teams, exists);
	        }else{
	            element.appendChild(teams);
	        }
	        return teams;
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
	    },

		inputForm: function (name, element, placeHolder) {

	        var input = document.createElement('p');
	        input.setAttribute('class', 'inputForm');
	        input.setAttribute('id', name + 'Form');
	        var text = inputField(name);

	        if (placeHolder) text.setAttribute('placeholder', placeHolder);

	        text.style.width = element.offsetWidth;
	        input.appendChild(text);

	        return input;
	    },

	    login: function () {

	        // create login screen
	        var loginScreen = document.createElement('article');
	        loginScreen.setAttribute('id', 'login');

	        // login form
	        loginForm = document.createElement('section');
	        loginForm.setAttribute('id', 'loginForm');
	        var form = this.inputForm('loginText', loginForm,'Guest name input.');
	        loginForm.appendChild(form);

	        // create button for fb login
	        var fbButton = document.createElement('button');
	        fbButton.setAttribute('scope', 'public_profile, email');
	        fbButton.setAttribute('onClick', 'app.menu.login();');
	        fbButton.setAttribute('onLogin', 'app.display.checkLoginState();');
	        fbButton.setAttribute('id', 'fbButton');

	        // create a holder for the login status
	        var fbStatus = document.createElement('div');
	        fbStatus.setAttribute('id', 'status');

	        loginForm.appendChild(fbButton);

	        loginScreen.appendChild(loginForm);
	        loginScreen.appendChild(fbStatus);

	        return loginScreen;
	    }
	};
}();