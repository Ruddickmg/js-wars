/* --------------------------------------------------------------------------------------*\
    
    Maps.js controls the saving and retrieving of maps

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.settings = require('../settings/game.js');
app.request = require('../tools/request.js');
app.game = require('../game/game.js');

Validator = require('../tools/validator.js');
Map = require('../objects/map.js')

module.exports = function () {

	var error, maps, keys, change, index, type = 'map', category;
	var validate = new Validator('maps'), categories = ['two'];

	var types = {
		map:{
			url:'maps/type',
			items:[],
			elements:{
	            section: 'mapSelectScreen',
	            div:'selectMapScreen',
	            li:'mapSelectionIndex',
	            type:'map'
	        }
		},
		game:{
			url:'games/open',
			items:[],
			elements: {
	            section: 'gameSelectScreen',
	            div:'selectGameScreen',
	            li:'mapSelectionIndex',
	            type:'game',
	            index:'Index',
	            attribute:'class',
	            url:'games/open',
	            properties: app.settings.categories
	        }
        }
	},

	byCategory = function (cat, callback) {
		if (cat && cat !== category) {
			maps = [], keys = [], category = cat;
	        app.request.get(category, types[type].url, function (response) {
	            if (response && !response.error) {
	            	maps = types[type].items = response;
	            	keys = Object.keys(response);
	            	if (callback) callback (maps);
	            }
	           	change = true;
	        });
	    }
       	return this;
    },

    format = function (map) { 
    	if(map) 
	    	return map.map ? map :
	    	new Map(
	    		map.id,
	    		map.name,
	    		map.players,
	    		map.dimensions,
	    		map.terrain,
	    		map.buildings,
	    		map.units
	    	);
	    else return {};
    },

    byIndex = function (ind) {
		index = ind;
		var m = sub(format(maps[keys[ind]]));
		return m.map ? m.map : m;
	},
    
    sub = function (map) { return maps.length ? map : {}; };

    var elementExists = function (id, element, parent){
        var exists = document.getElementById(id);
        if(exists){
            parent.replaceChild(element, exists);
        }else{
            parent.appendChild(element);
        }
    };

    var buildingElements = {section:'buildingsDisplay', div:'numberOfBuildings'}

    byCategory(categories[0]);

	return {
		byIndex:byIndex,
		type: function (t) {
			if (type !== t) {
				type = t;
				category = false;
				byCategory('two');
			}
			return this;
		},
		empty: function () { return !maps.length; },
		category: function () { return category; },
		setCategory:function (category) {return byCategory(category);},
		all: function (){ return maps; },
    	byId: function (id) {
	        for (map in maps)
	            if(maps[map].id == id)
	            	return format(maps[map]);
	        return false;
    	},
    	first: function () { return sub(maps[keys[0]]); },
    	add:function(room){
            if (category === room.category) {
            	var games = types.game.items;
            	games[room.name] = room;
            	keys = Object.keys(games);
            	return change = true;
            }
            return false
        },
        remove: function(room){
        	var games = types.game.items;
	        if (category === room.category && games[room.name]) {
	            delete games[room.name];
	            keys = Object.keys(games);
	            change = true;
	            return room;
	        }
	        return false;
        },
        updated: function () { 
        	if (change) {
        		change = false;
        		return true; 
        	}
        },
        random: function () {
        	byCategory('two' || categories[app.calculate.random(categories.length - 1)], function (maps) {
        		app.map.set([app.calculate.random(maps.length - 1)]);
        	});
        },
        index: function () {return index;},
        info: function () { return app.calculate.numberOfBuildings(byIndex(index || 0));},
        clear: function () {maps = [], category = undefined, index = undefined;},
        screen: function () { return types[type].elements; },
        save: function (map, name) {

        	 if((error = validate.defined (app.user.email(), 'email') || (error = validate.map(map))))
        	 	throw error;

            app.request.post({
			    creator: app.user.email(),
			    name: name || map.name,
			    players: map.players,
			    category: map.category,
			    dimensions: map.dimensions,
			    terrain: map.terrain,
			    buildings: map.buildings,
			    background: map.background,
			    units: map.units
            }, 'maps/save', function (response) {
				console.log(response);
            	change = true;
            });
        }
        //getbyid: function (id) { app.request.get(id, 'maps/select', function (response) { app.map.set(response); }); },
	};
}();