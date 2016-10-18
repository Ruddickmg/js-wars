socket = require('../tools/sockets.js');
app.game = require('../game/game.js');
app.screens = require('../objects/screens.js');
app.user = require('../objects/user.js');
app.input = require('../objects/input.js');
Menu = require('../objects/menu.js');

Login = Object.create(Menu);
Login.testAPI = function () {
	var scope = this;
	FB.api('/me', function(response) { 
		return scope.loginToSetup(response, 'facebook');
	});
};

// allow login through fb ---- fb sdk
// This is called with the results from from FB.getLoginStatus().
Login.statusChangeCallback = function (response) {
    if (response.status === 'connected') return this.testAPI();
    else {
    	this.loginScreen.style.display = null;
    	if (response.status === 'not_authorized') document.getElementById('status').innerHTML = 'Log in to play JS-WARS!';
   		else document.getElementById('status').innerHTML = 'Please log in';
    }
};

// format is where the login is coming from, allowing different actions for different login sources
Login.loginToSetup = function (user, format) {
    if(user && user.id) {
       	app.user = new app.user(user);
        socket.emit('addUser', user);
        if(!app.testing) this.loginScreen.parentNode.removeChild(this.loginScreen);
        app.game.setup();
        return true;
    }
};

Login.setup = function () {

    // create login screen
    var loginScreen = this.createScreen('login');

    // login form
    loginForm = document.createElement('section');
    loginForm.setAttribute('id', 'loginForm');
    var form = app.input.form('loginText', loginForm,'Guest name input.');
    loginForm.appendChild(form);

    // create button for fb login
    var fbButton = document.createElement('button');
    fbButton.setAttribute('scope', 'public_profile, email');
    fbButton.setAttribute('onClick', 'app.login.send();');
    fbButton.setAttribute('onLogin', 'app.login.verify();');
    fbButton.setAttribute('id', 'fbButton');

    // create a holder for the login status
    var fbStatus = document.createElement('div');
    fbStatus.setAttribute('id', 'status');

    loginForm.appendChild(fbButton);

    loginScreen.appendChild(loginForm);
    loginScreen.appendChild(fbStatus);

    return loginScreen;
};

Login.send = function () {
    // if login is successful go to game setup, otherwise the user has declined
    var paramsLocation=window.location.toString().indexOf('?');
    var params="";
    if (paramsLocation>=0)
    params=window.location.toString().slice(paramsLocation);
    top.location = 'https://graph.facebook.com/oauth/authorize?client_id=1481194978837888&scope=public_profile&email&redirect_uri=http://localhost/'+params;
};
Login.verify = function () {
	var scope = this;
	FB.getLoginStatus(function(response) {
		scope.statusChangeCallback(response);
	});
};
Login.display = function () {

    if(!app.testing) {
    	var scope = this;
    	window.fbAsyncInit = function() {
            FB.init({
                appId     : '1481194978837888',
                oauth     : true,
                cookie    : true,  // enable cookies to allow the server to access 
                xfbml     : true,  // parse social plugins on this page
                version   : 'v2.3' // use version 2.2
            });
            FB.getLoginStatus(function(response) {scope.statusChangeCallback(response);});
        };

        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        this.loginScreen = this.setup();
        document.body.appendChild(this.loginScreen, app.dom.insertLocation);

        // hide the login screen, only show if someone has logged in
        this.loginScreen.style.display = 'none';

    } else {
        this.loginToSetup({
            email: "testUser@test.com",
            first_name: "Testy",
            gender: "male",
            id: "10152784238931286",
            last_name: "McTesterson",
            link: "https://www.facebook.com/app_scoped_user_id/10156284235761286/",
            locale: "en_US",
            name: "Testy McTesterson"
        });
    }
};
module.exports = Login;