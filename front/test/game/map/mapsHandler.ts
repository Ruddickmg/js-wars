/* --------------------------------------------------------------------------------------*\
    
    Maps.js controls the saving and retrieving of maps

\* --------------------------------------------------------------------------------------*/

app = require("../settings/app.js");
app.settings = require("../settings/game.js");
app.request = require("../tools/request.js");
app.game = require("../controller/game.js");

Validator = require("../tools/validator.js");
Map = require("./mapController.js");

module.exports = function () {

	var error, maps, keys, change, index, type = "map", category;
	var validate = new Validator("maps"), categories = ["two"], which = "open";

	var types = {

		map:{
			url:"maps/type",
			items:[],
			elements:{
	            section: "mapSelectScreen",
	            div:"selectMapScreen",
	            li:"mapSelectionIndex",
	            type:"map"
	        }
		},

		game:{
			url:"games/open",
			items:[],
			elements: {
	            section: "gameSelectScreen",
	            div:"selectGameScreen",
	            li:"mapSelectionIndex",
	            type:"game",
	            index:"Index",
	            attribute:"class",
	            url:"games/open",
	            properties: app.settings.categories
	        }
        }
	};

	var byCategory = function (cat, callback) {

		if (which === "saved") {

			cat = app.user.id();
		}

		if (cat && cat !== category) {

			maps = [], keys = [], category = cat;

	        app.request.get(category, types[type].url, function (response) {

	            if (response && !response.error) {

	            	// console.log(response);

	            	maps = types[type].items = response;
	            	keys = Object.keys(response);

	            	if (callback) {

	            		callback (maps);
	            	}
	            }
	           	change = true;
	        });
	    }
       	return this;
    };

    var format = function (map) {

	    return map ? (map.map ? map : new Map(
	   		map.id,
    		map.name,
    		map.players,
    		map.dimensions,
    		map.terrain,
    		map.buildings,
    		map.units
    	)) : {};
    };

    var byIndex = function (ind) {

		index = ind;

		var m = sub(format(maps[ind]));

		return m.map ? m.map : m;
	};

	var indexById = function (array, id) {

		return array.findIndex(function (element) {

			return element.id == id;
		});
	};

	var byId = function (array, id) {

		return array[indexById(array, id)];
	};
    
    var sub = function (map) {

    	return maps.length ? map : [];
    };

    var edit = function (array, element, callback) {

        if (category === element.category || element.saved) {

        	var index = indexById(array, element.id);

        	callback(array, element, index);

            change = true;

            return element;
        }
        return false;
    };

    var elementExists = function (id, element, parent) {

        var exists = document.getElementById(id);

        exists ? parent.replaceChild(element, exists) : parent.appendChild(element);
    };

    var buildingElements = {

    	section:"buildingsDisplay", 
    	div:"numberOfBuildings"
    };

    byCategory(categories[0]);

	return {

		byIndex:byIndex,

		type: function (t) {

			if (type !== t) {

				type = t;
				category = false;
				byCategory("two");
			}

			return this;
		},

		running: function () {

			this.setGameUrl((which = "running")); 

			return this;
		},

		open: function () {

			this.setGameUrl((which = "open")); 

			return this;
		},

		setGameUrl: function (type) {

			types.game.url = "games/"+type;
		},

		saved: function () {

			this.setGameUrl((which = "saved"));

			return this;
		},

		empty: function () { 

			return !maps.length; 
		},

		category: function () { 

			return category; 
		},

		setCategory: function (category) {

			return byCategory(category);
		},

		all: function (){ 

			return maps; 
		},

    	byId: function (id) {

	        var map = byId(maps, id);

	        if (map) {

	        	return format(map);
	        }

	        return false;
    	},

    	first: function () { 

    		return sub(maps[0]); 
    	},

    	addElement:function(room){

    		return edit(types.game.items, room, function (games, room, index) {

    			return isNaN(index) ? games.push(room) : (games[index] = room);
    		});
        },

        remove: function (room) {

        	return edit(types.game.items, room, function (games, room, index) {

        		if (!isNaN(index) && !room.saved) {

        			return games.splice(index, 1)[0];
        		}
        	});
        },

        removePlayer: function (room, player) {

        	return edit(types.game.items, room, function (games, room, index) {

        		if (!isNaN(index)) {

        			(room = games[index]).players.splice(room.players.findIndex(function (p) {
	        				
	        				return position.id === player.id;

	        		}), 1)[0];
        		}
        	});
        },

        updated: function () { 

        	if (change) {

        		change = false;
        		return true; 
        	}
        },

        random: function () {

        	byCategory(categories[app.calculate.random(categories.length - 1) || "two"], function (maps) {

        		app.map.set([app.calculate.random(maps.length - 1)]);
        	});
        },

        index: function () {

        	return index;
        },

        info: function () { 

        	return app.calculate.numberOfBuildings(byIndex(index || 0));
        },

        clear: function () {

        	maps = [], 
        	category = undefined, 
        	index = undefined;
        },
        
        screen: function () { 

        	return types[type].elements; 
        },

        save: function (map, name) {

        	if ((error = validate.defined (app.user.email(), "email") || (error = validate.map(map)))) {

        	 	throw error;
        	}

            app.request.post(mapController.setCreator(app.user.id(), map), "maps/save", function (response) {
            	
            	change = true;
            });
        }
        //getbyid: function (id) { app.request.get(id, "maps/select", function (response) { app.mapEditor.set(response); }); },
	};
}();