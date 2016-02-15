/* --------------------------------------------------------------------------------------*\

    holds functions for the selection of game modes / logout etc..

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.game = require('../menu/game.js');
app.request = require('../tools/request.js');

module.exports = function (){

    var key = app.game.keys, sent;
    var game = {};
    var boot = false, active = false;
    
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
        newgame:function(setupScreen, callback){

            // handle map selection
            if (!game.map){
                game.map = app.game.choseMapOrGame('map');
                if(game.map === 'back'){
                    delete game.map;
                    return 'back';
                }
            }

            // handle settings selection
            if (game.map && !game.settings){
                game.settings = app.game.choseSettings(setupScreen);
                if (game.settings === 'back') {
                    delete game.settings;
                    delete game.map;
                    console.log('here...');
                    console.log(game.map);
                    console.log(game.settings);
                }
            }

            // handle co position and selection as well as joining the game
            if (game.map && game.settings && !game.players){
                game.players = app.game.join(setupScreen);
                if(game.players === 'back'){
                    console.log('back');
                    socket.emit('exit', boot);
                    delete game.players;
                    delete game.settings;
                    boot = false;
                }
            }

            if (game.map && game.settings && game.players) return game;
            return false;
        },
        continuegame:function(){
            alert('continue an old game is under construction. try new game or join new');
        },
        newjoin:function(){
            // handle game selection
            if (!game.room){
                game.room = app.game.choseMapOrGame('game');
                if(game.room === 'back'){
                    delete game.room;
                    return 'back';
                }
            }

            if(game.room && !game.players){
                game.players = app.game.join('choseGame');
                if(game.players === 'back'){
                    socket.emit('exit');
                    delete game.room;
                    delete game.players;
                }
            }
        },
        continuejoin:function(){
            alert('continue join is under construction, try new game or join new');
        },
        COdesign:function(){
            alert('design a co is under construction. try new game or join new');
        },
        mapdesign:function(){
            if(!sent){
                app.request.post(gameMap, 'maps/save', function(response){
                    console.log(response);
                });
                sent = true;
            }
            if(app.key.pressed('esc')){
                return 'back';
            }
        },
        store:function(){
            alert('go to the game store is under construction. try new game or join new');
        },
        active: function(){return active;},
        activate: function(){active = true;},
        deactivate: function(){active = false;},
    };
}();