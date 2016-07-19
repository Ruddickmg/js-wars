/* --------------------------------------------------------------------------------------*\

    holds functions for the selection of game modes / logout etc.. <--- can be redone better

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.menu = require('../menu/menu.js');
app.maps = require('../controller/maps.js');
app.user = require('../objects/user.js');
app.settings = require('../settings/game.js');
app.request = require('../tools/request.js');
app.key = require('../tools/keyboard.js');
app.testMap = require('../objects/testMap.js');
app.editor = require('../game/mapEditor.js');

module.exports = function (){

    var sent;
    var game = {};
    var boot = false, active = false;
    var exitSetupScreen = function () {
        var ss = document.getElementById('setupScreen');
        if (ss) ss.parentNode.removeChild(ss);                
    };
    
    return {
        boot:function(){boot = true},
        logout: function (){
            alert('log out!');
            /*  
            // log user out of facebook
            FB.logout(function(response) {
              console.log(response);
            });
            */
        },
        newgame:function(setupScreen){

            // handle map selection
            if (!game.map){
                game.map = app.menu.choseMapOrGame('map');
                //console.log(game.map);
                if(game.map === 'back'){
                    delete game.map;
                    return 'back';
                }
            }

            // handle settings selection
            if (game.map && !game.settings){
                game.settings = app.menu.choseSettings(setupScreen);
                if (game.settings === 'back') {
                    delete game.settings;
                    delete game.map;
                }
            }

            // handle co position and selection as well as joining the game
            if (game.map && game.settings && !game.players){
                game.players = app.menu.join(setupScreen);
                if(game.players === 'back'){
                    app.display.resetPreviousIndex();
                    socket.emit('exit', boot);
                    delete game.players;
                    delete game.settings;
                    boot = false;
                }
            }

            if (game.map && game.settings && game.players){
                socket.emit('start', game);
                return game;
            }

            return false;
        },
        continuegame:function(){
            alert('continue an old game is under construction. try new game or join new');
        },
        newjoin:function(){
            // handle game selection
            if (!game.room){
                game.room = app.menu.choseMapOrGame('game');
                if(game.room === 'back'){
                    delete game.room;
                    return 'back';
                }
            }

            if(game.room && !game.players){
                game.players = app.menu.join('choseGame');
                if(game.players === 'back'){
                    app.display.resetPreviousIndex();
                    socket.emit('exit');
                    delete game.room;
                    delete game.players;
                }
            }

            if(game.room && game.players){
                if(app.user.player() === app.players.first()) 
                    socket.emit('start', game);
                return game;
            }
        },
        continuejoin:function(){
            alert('continue join is under construction, try new game or join new');
        },
        COdesign:function(){
            alert('design a co is under construction. try new game or join new');
        },
        mapdesign:function(){
            app.map.set(app.maps.random());
            app.players.add(app.user.raw());
            return 'editor'; 
        },
        store:function(){
            alert('go to the game store is under construction. try new game or join new');
        },
        active: function(){return active;},
        activate: function(){active = true;},
        deactivate: function(){active = false;},
    };
}();