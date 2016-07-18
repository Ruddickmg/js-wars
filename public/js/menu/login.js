socket = require('../tools/sockets.js');
app.screens = require('../objects/screens.js');
app.display = require('../tools/display.js');
app.menu = require('../menu/menu.js');
app.user = require('../objects/user.js');

module.exports = function () {

	var loginScreen;

	// Here we run a very simple test of the Graph API after login is
	// successful.  See statusChangeCallback() for when this call is made.
	var testAPI = function () {FB.api('/me', function(response) { return loginToSetup(response, 'facebook');});};

	// allow login through fb ---- fb sdk
	// This is called with the results from from FB.getLoginStatus().
	var statusChangeCallback = function (response) {

	    // if connected then return response
	    if (response.status === 'connected') {
	        return testAPI();
	    } else {
	    	loginScreen.style.display = null;
	    	if (response.status === 'not_authorized') {
	    		document.getElementById('status').innerHTML = 'Log in to play JS-WARS!';
	   		} else {
	        	document.getElementById('status').innerHTML = 'Please log in';
	        }
	    }
	};

	// format is where the login is coming from, allowing different actions for different login sources
	var loginToSetup = function (user, format){

	    if(user && user.id) {

	       	app.user = new app.user(user);

	        socket.emit('addUser', user);

	        if(!app.testing) loginScreen.parentNode.removeChild(loginScreen);
	        
	        // display the game selection menu
	        app.screens.modeMenu();

	        app.menu.setup();
	        
	        return true;
	    }
	};

	return function () {

	    if(!app.testing) {

	    	window.fbAsyncInit = function() {

	            FB.init({
	                appId     : '1481194978837888',
	                oauth     : true,
	                cookie    : true,  // enable cookies to allow the server to access 
	                xfbml     : true,  // parse social plugins on this page
	                version   : 'v2.3' // use version 2.2
	            });

	            FB.getLoginStatus(function(response) {
	                statusChangeCallback(response);
	            });
	        };

	        // // Load the SDK asynchronously
	        (function(d, s, id) {

	            var js, fjs = d.getElementsByTagName(s)[0];

	            if (d.getElementById(id)) return;
	            js = d.createElement(s); js.id = id;
	            js.src = "//connect.facebook.net/en_US/sdk.js";
	            fjs.parentNode.insertBefore(js, fjs);
	        }(document, 'script', 'facebook-jssdk'));

	        loginScreen = app.screens.login();
	        document.body.insertBefore(loginScreen, app.domInsertLocation);

	        // hide the login screen, only show if someone has logged in
	        loginScreen.style.display = 'none';

	    }else{
	        loginToSetup({
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
}();