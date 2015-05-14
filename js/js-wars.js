
/* ---------------------------------------------------------------------------------------------------------*\
	
	event listeners
	
\* ---------------------------------------------------------------------------------------------------------*/

window.addEventListener("keydown", function (e) {
	app.keys[e.keyCode] = true;
}, false);

window.addEventListener("keyup", function (e) {
	app.keys[e.keyCode] = false;
	app.keys.splice(e.keyCode, 1);
}, false);

/* ---------------------------------------------------------------------------------------------------------*\
	
	add useful methods to prototypes
	
\* ---------------------------------------------------------------------------------------------------------*/

// add first letter capitalization funcitonality
String.prototype.uc_first = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
},

// simple check if value is in a flat array
Array.prototype.hasValue = function ( value ){
  	return this.indexOf(value) > -1;
},

// remove one arrays values from another
Array.prototype.offsetArray = function ( offsetArray ) {
	for (var z = 0; z < offsetArray.length; z += 1 ){
		for (var n = 0; n <this.length; n += 1 ){
			if (this[n].x === offsetArray[z].x &&this[n].y === offsetArray[z].y ){
				this.splice(n,1);
			}
		}
	}
	return this;
};

/* ---------------------------------------------------------------------------------------------------------*\
	
	app is a container and holds low level variables for all elements of the application 

\* ---------------------------------------------------------------------------------------------------------*/

app = {

	// holds temporary shared variables, usually info on game state changes that need to be accessed globally
	temp:{
		selectActive: false,
		cursorMoved: true,
		path:[]
	},

	users:[{ co: 'G money', name:'grant'}, {co:'betick', name:'steve'}],
	game:{},
	cache:{},
	keys:[], // holds array of key pressed events
	players:[], // array of players ( havent yet implimented player or turn system yet )

	player: function ( co, name, id ) { 

		var getHQ = function () {
			var buildings = app.map.building;
			for ( var b = 0; b < buildings.length; b += 1 ){
				if( buildings[b].type === 'hq' && buildings[b].player === id ) {
					return buildings[b];
				}
			}
		};

		var getCO = function () {
			return app.co[co];
		};

		return {
			// player id
			id:id,
			// player name
			name: name,
			// name of chosen co for this game
			co:co,

			hq:getHQ(),
			// holds amount of special built up
			special:0,
			unitsLost:0,
			gold:0
		};
	},

	// set custom animation repo
	setAnimationRepo: function ( repo ) {
		this.animationRepo = repo;
		return this;
	}
};

/* ---------------------------------------------------------------------------------------------------------*\
	
	app.start sets up the game with the players and other info necessary for the new game

\* ---------------------------------------------------------------------------------------------------------*/

app.start = function ( players ) {
	for ( var p = 0; p < players.length; p += 1 ) {
		app.players.push(app.player( players[p].co, players[p].name, p + 1 ));
	}
	app.temp.player = app.players[0];
};

/* ---------------------------------------------------------------------------------------------------------*\
	
	app.init creates a new canvas instance, taking the name of the target canvas id and optionally the context
	as a second perameter, it defaults to a 2d context. init also provides methods for rendering, setting 
	animations and returning the screen dimensions

\* ---------------------------------------------------------------------------------------------------------*/

app.init = function (element, context) {

 	var canvas = document.getElementById(element);

	// check if browser supports canvas
	if ( canvas.getContext ){

		// if the context is not set, default to 2d
		app.ctx = context === undefined || context === null ? '2d' : context;

		// get the canvas context and put canvas in screen
		var animate = canvas.getContext(app.ctx);

     	// get width and height
		var sty = window.getComputedStyle(canvas);
		var padding = parseFloat(sty.paddingLeft) + parseFloat(sty.paddingRight);
		var screenWidth = canvas.clientWidth - padding;
		var screenHeight = canvas.clientHeight - padding;
		var screenClear = function () {
			//animate.clearRect( element.positionX, element.positionY, element.width, element.height );
			animate.clearRect(0, 0, screenWidth, screenHeight);
		};
		
		return {

			// set the context for tvarhe animation, defaults to 2d
			setContext: function (context) {
				this.context = context;
				return this;
			},

			// insert animation into canvas
			setAnimations: function(animations){
				this.animations = animations;
				return this;
			},

			// draw to canvas
			render: function ( loop, gridSquareSize ){ // pass a function to loop if you want it to loop, otherwise it will render only once, or on demand
				if( !this.animations ){
					throw new Error('No animations were specified');
					return false;
				}
				screenClear();
				var drawings = app.draw( animate, { width: screenWidth, height: screenHeight }, gridSquareSize);
				this.animations( drawings);
				if ( loop ) window.requestAnimationFrame(loop);
			},

			// return the dimensions of the canvas screen
			dimensions: function(){
				return {
					width: screenWidth,
					height: screenHeight
				};
			}
		};
	}else{
		// if canvas not supported then throw an error
		throw new Error("browser does not support canvas element. canvas support required for animations");
		return false;
	};	
};

/* ---------------------------------------------------------------------------------------------------------*\
	
	app.build handles the creation of new units, buildings or terrain on the map

\* ---------------------------------------------------------------------------------------------------------*/

app.build = function () { 

	// create new unit if/after one is selected
	var createUnit = function ( building, unitType, player ) {
		var newUnit = { x: building.x, y: building.y, obsticle: 'unit', player: player };
		var unit = app.units[building.type][unitType].properties;
		var properties = Object.keys( unit );
		for ( var p = 0; p < properties.length; p += 1 ) {
			newUnit[properties[p]] = unit[properties[p]]; // this may cause issues if pointers are maintained to original object properties, probly not, but keep en eye out
		}
		return newUnit;
	};

	return {
		units: function () {
			var building = app.temp.selectedBuilding;
			if ( building ) {
				var unit = app.display.select( 'unitSelectionIndex', 'selectUnitScreen', building.type );
				if ( unit ) {
					app.map.unit.push( createUnit( building, unit, app.temp.player.id )); // player still needs to be figured out, change this when it is
					app.undo.all(); // removes the selection screen and variables created during its existance
					app.temp.cursorMoved = true; // refreshes the hud system to detect new unit on map;
					window.requestAnimationFrame(app.animateUnit);
				}
			}
			return this;
		}
	};
}();

/* ---------------------------------------------------------------------------------------------------------*\
	
	app.undo handles the cleanup and disposal of elements that are no longer needed or need to be removed

\* ---------------------------------------------------------------------------------------------------------*/

app.undo = function () {

	return {
		keyPress: function (key) {
			if (app.keys.splice(key,1)) return true
			return false;
		},

		selectElement: function () {
			if( app.temp.range ) app.temp.range.splice(0,app.temp.range.length);
			app.temp.selectActive = false;
			if ( app.temp.selectedUnit ){
				delete app.temp.selectedUnit;
				window.requestAnimationFrame(app.animateUnit);
			}
			if ( app.temp.selectedElement ) delete app.temp.selectedElement;
			if ( app.temp.selectedBuilding ) delete app.temp.selectedBuilding;
			if ( app.temp.unitSelectionIndex ) delete app.temp.unitSelectionIndex;
			if ( app.temp.prevIndex ) delete app.temp.prevIndex;
			if ( app.temp.hide ) delete app.temp.hide;
			if ( app.temp.optionsActive ) delete app.temp.optionsActive;
		},

		effect: function (effect) {
			if ( app.effect[effect] ) {
				app.effect[effect].splice(0,app.effect[effect].length);
				window.requestAnimationFrame(app.animateEffects);
			}
			return this;
		},

		displayHUD: function () {
			var remove = document.getElementById('hud');
			if ( remove ) remove.parentNode.removeChild(remove);
			return this;
		},

		buildUnitScreen: function () {
			var removeArray = [ 'buildUnitScreen', 'unitInfoScreen', 'optionsMenu'];
			for ( r = 0; r < removeArray.length; r += 1 ){
				var remove = document.getElementById(removeArray[r]);
				if ( remove ) remove.parentNode.removeChild(remove);
			}
			return this;
		},

		all: function () {
			this.keyPress(app.settings.keyMap.select);
			this.buildUnitScreen();
			this.selectElement();
			this.effect('highlight').effect('path');
			app.temp.cursorMoved = true; // refreshes the hud system to detect new unit on map
			return this;
		}
	}
}();

/* ----------------------------------------------------------------------------------------------------------*\
	
	app.options handles the in game options selection, end turn, save etc.

\* ----------------------------------------------------------------------------------------------------------*/

app.options = function () {

	var nextPlayer = function () {
		if ( app.temp.player.id === app.players.length ) return app.players[0];
		return app.players[app.temp.player.id];
	};

	var endTurn = function () {
		var player = nextPlayer();
		app.move.screenToHQ(player);
		app.temp.player = player;
	};

	return {
		unit: function (){
			alert('unit!');
		},

		intel: function (){
			alert('intel');
		},

		options: function (){
			alert('options');
		},

		save: function (){
			alert('save');
		},
		end: function (){
			endTurn();
			return this;
		}
	};
}();

/* ----------------------------------------------------------------------------------------------------------*\
	
	app.calculate handles the more intense calculations like pathfinding and the definition of movement range

\* ----------------------------------------------------------------------------------------------------------*/

app.calculate = function () {

	var abs = Math.abs;

	// create a range of movement based on the unit allowed square movement
	var movementCost = function ( origin, x, y ) {

		// calculate the difference between the current cursor location and the origin, add the operation on the axis being moved on
	    return abs((origin.x + x ) - origin.x ) + abs(( origin.y + y ) - origin.y );
	};

	// calculate true offset location considering movement and position
	var offset = function (off, orig) {
		var ret = [];
		var inRange = function( obj ){
			if( abs( obj.x - orig.x) + abs( obj.y - orig.y ) <= orig.movement && obj.x >= 0 && obj.y >= 0 ){
				return true;
			}
			return false;
		};
		if ( orig.movable.hasValue( off.obsticle )){
			var opX = off.x < orig.x ? -1 : 1;
			var opY = off.y < orig.y ? -1 : 1;
			var x = ( orig.x + ( orig.movement * opX ) - ( off.cost * opX ) + opX);
			var y = ( orig.y + ( orig.movement * opY ) - ( off.cost * opY ) + opY);
			var objX = { x:x , y:off.y };
			var objY = { x:off.x, y:y };
			if ( inRange(objX) ) ret.push(objX);
			if ( inRange(objY) ) ret.push(objY);
		}else{
			ret.push({ x: off.x, y: off.y }); // check this if issues with unit offset, could be faulty method of dealing with this problem
		}
		return ret;
	};

	// detect if a square is an obsticle
	var findObsticles = function ( x, y ) {

		// loop over obsticle types
		for (var ot = 0; ot < app.settings.obsticleTypes.length; ot += 1 ){

			// check if the currently examined grid square is one of the obsticle types
			var obs = app.select.hovered( app.settings.obsticleTypes[ot], x, y);

			// if it is and has a cost etc.. then return it
			if ( obs.stat === true ){
				return app.map[obs.objectClass][obs.ind];
			}
		}
	};

	var pathfinder = function ( orig, dest, grid, mode ){
		var mov = orig.movement;
		var ret = [];
		var open = [grid[0]];
		var closed = [];
		var index = 0;
		var neighbor, opi, x, y, cur;

		var cleanGrid = function (g){
			var del = ['ind', 'p', 'f', 'g', 'visited', 'close'];
			for( var a = 1; a < g.length; a += 1 ){
				for( var b = 0; b < del.length; b += 1 ){
					delete g[a][del[b]];
				}
			}
		};

		var getNeighbors = function (c){
	       	var x = c.x;
	       	var y = c.y;
	       	var g, gpx, gpy;
        	var neighbors = [];
        	for ( var l = 0; l < grid.length; l += 1 ){
        		g = grid[l];
        		gpx = abs( g.x - x );
	        	gpy = abs( g.y - y );
	        	if( gpx < 2 && gpy < 2 && gpx !== gpy ){
	       			neighbors.push(g);
	       		}
	       	}
	       	if(mode === undefined ){
	       }
	       	return neighbors;
	    };

		var inOpen = function ( id ){
			for ( var o = 0; o < open.length; o += 1 ){
	        	if( open[o].id === id ) return o;
      		}
  			return false;
		};

		var dist = function( c ) {						
			var dx1 = c.x - dest.x;
			var dy1 = c.y - dest.y;
			var dx2 = orig.x - dest.x;
			var dy2 = orig.y - dest.y;
			var cross = abs(dx1*dy2 - dx2*dy1);
			return (( abs( c.x - dest.x ) + abs( c.y - dest.y )) + ( cross * 0.001 ));
		};

	    while ( length = open.length ) {
		
	    	// set the current starting point to the point closest to the destination
	    	for (var f = 0; f < length; f += 1 ){
				if( open[f].f < open[index] ){ index = f };
			}

			cur = open[index];
	    	closed = closed.concat(open.splice(index, 1));
	    	grid[cur.ind].close = true;

			// if the destination has been reached, return the array of values
	        if (dest.x === cur.x && dest.y === cur.y ) {
		        var ret = [cur];
		        while( cur.p ){
				    for ( var c = 0; c < closed.length; c += 1 ){
				    	if( cur.p === closed[c].id ){
				    		cur = closed[c];
				    		ret.push(cur);
				    	}
				    }
			    }
			    if( ret.length <= mov + 1 ) {
			    	cleanGrid(grid);
	        		if( mode === undefined ){	
			        	return ret;
			        }
			        return undefined;
	        	}
	        }

	        n = getNeighbors(cur);

	        for ( var i = 0; i < n.length; i += 1 ) {

	        	neighbor = n[i]; // current neighboring square
	        	cost = cur.g + neighbor.cost;

	        	if ( neighbor.close )	continue; // if the neghboring square has been inspected before then ignore it
	        	if ( cost > mov ) continue;	// if the cost of moving to the neighboring square is more then allowed then ignore it

	        	// check to see if the currently inspected square is in the open array, return the index if it is
	        	opi = inOpen(neighbor.id);

	        	// if the current square is in the open array and a better position then update it
	        	if( opi && neighbor.g > cur.g ){
	        		open[opi].g = cost; // distance from start to neighboring square
	        		open[opi].f = cost + neighbor.h; // distance from start to neighboring square added to the distance from neighboring square to destination
	        		open[opi].p = cur.id

	        	// if the neighboring square hasent been encountered add it to the open list for comparison
	        	}else if ( neighbor.ind === undefined ){
			        n[i].g = cost; // distance from start to neighboring square
			        n[i].h = cost + dist( neighbor, dest ); // distance from neighboring to destination
			     	n[i].ind = i; // save the index to help with future identification of this neighboring square
			     	n[i].p = cur.id; // add the current square as this neighboring squares parent
			        open.push(n[i]); // add the neighboring square to the open list for further comparison
			    }					        
		    }
	    }
	    cleanGrid(grid); // clean all assigned variables from grid so they wont interfier with future path finding in a loop
	    if( mode !== undefined ){ // if the goal is to tell if a path can be reached or not, and it couldnt be reached

	    	// return the destination as an unreachable location
    		return dest;
	    }
	};

	// calculate the movement costs of terrain land marks etc..
	var evaluateOffset = function ( origin, dest, grid ) {

		var range = [];

		for ( var i = 0; i < dest.length; i += 1 ) {

			var g = grid.slice( 0 );

			var path = pathfinder( origin, dest[i], g, 'subtract' );

			if ( path ) range.push( path );
		}

		return range;
	};

	var rightSide = function () {
		var w = app.cursorCanvas.dimensions().width; // screen width
		var x = app.settings.cursor.scroll.x; // map position relative to scroll
		var c = app.settings.cursor.x;	// cursor location
		if( c > ( w / 2 ) + x ) return true;
		return false;
	};

	return {
		path: function ( orig, dest, grid, mode ) {
			return pathfinder( orig, dest, grid, mode );
		},

		isRightSide: function () {
			return rightSide();
		},

		range: function () {

			if( app.temp.selectedUnit ){

				var id = 0; // id for gvarp identificaion;
				var range = [];
				var offs = [];
				var selected = app.temp.selectedUnit;

				// amount of allotted movement for uvarnit
				var len = selected.movement;

				// loop through x and y axis range of movement
				for (var ex = -len; ex <= len; ex += 1){
					for (var wy = -len; wy <= len; wy += 1 ){

						// if movement cost is less then or eual to the allotted movement then add it to the range array
						if ( movementCost( selected, ex, wy ) <= selected.movement ){

							// incremient id
							id += 1;

							// add origin to range of movement values
							var x = selected.x + ex;
							var y = selected.y + wy;

							// locate obsticles									
							var obsticle = findObsticles(x, y);	

							if ( obsticle !== undefined ){

								// get the number of offset movement from the obsticle based on unit type and obsticle type
								var obsticleOffset = app.settings.obsticleStats[obsticle.obsticle][app.temp.selectedUnit['type']];
							
								if ( obsticleOffset !== undefined ){
									if ( selected.x === x && selected.y === y ) {
										range.unshift({ x: x, y: y, cost:0, g:0, f:0, ind:0, id:id, type:'highlight'});
									}else{
										// make an array of obsticleOffset values, starting point, plus movement, and the amount of obsticleOffset beyond that movement
										obsticle.cost = obsticleOffset;
										obsticle.id = id;
										range.push(obsticle);
										offs = offs.concat( offset(obsticle, selected) );
									}
								}
							}else{
								range.push({ x: x, y: y, cost:1, id:id, type:'highlight'});
							}
						}
					}
				}
				return range.offsetArray(evaluateOffset( selected, offs, range ));
			}
			return false;
		}
	};
}();

/* ------------------------------------------------------------------------------------------------------*\
	
	app.select handles the selection and movement of map elements

\* ------------------------------------------------------------------------------------------------------*/

app.select = function () {
	var abs = Math.abs;

	// moves a unit
	var move = function ( type, index ) {
		if ( app.temp.selectedUnit && app.temp.selectActive && app.settings.keyMap.select in app.keys ){
			var xmove = abs( app.temp.selectedUnit.x - app.settings.cursor.x );
			var ymove = abs( app.temp.selectedUnit.y - app.settings.cursor.y );
			app.map.unit[app.temp.selectedUnit.ind].movement -= xmove + ymove;
			app.map[type][index].x = app.settings.cursor.x;
			app.map[type][index].y = app.settings.cursor.y;
			app.undo.keyPress();
			app.undo.selectElement();
			app.undo.effect('highlight').effect('path');
			return true;
		}
		return false;
	};

	var element = function ( type, index ) {
		//  if the index input is undefined or false then use the current cursor location
		if ( index === undefined || index === false ){
		
				var hover = app.select.hovered(type);

			// if the selectable status is not false and the map element is defined then select it
			if ( hover !== undefined && hover.stat !== false ){
				select( type, hover.ind );
			}
		}else{
			// if there is an index supplied then use it allong with the type
			select( type, index );
		}

		// if an object was selected then return true, otherwise return false
		if ( app.temp.selectedUnit ) {
			return true;
		}
		return false;
	};

	var select = function ( type, index ) {

		// create key value pairs that name selectedObject by type
		var objectClass = { building: 'selectedBuilding', unit: 'selectedUnit' };

		// if their is not a selection active and the cursor is not hovering over empty terrain, 
		// then do the following when the select key is pressed
		if ( app.temp.selectActive === false && type !== 'terrain' && app.settings.keyMap.select in app.keys  ) {

			attempt = app.map[type][index];

			// set properties for selected object
			if( !app.settings.notSelectable.hasValue(attempt.type) && attempt.player === app.temp.player.id ){
				app.temp[objectClass[type]] = attempt;
				app.temp[objectClass[type]].objectClass = type;
				app.temp[objectClass[type]].ind = index;
				app.undo.keyPress(app.keys.select);

				// if the selected object is a unit, do unit stuff
				if ( app.temp.selectedUnit ) {
					app.temp.range = app.calculate.range(); // set range of movement
					app.display.range(); // highlight rang of movemet

				// otherwise do building stuff
				}else{
					app.display.selectionInterface( app.temp.selectedBuilding.type, 'unitSelectionIndex' );
				}

				// remove the terrain info display
				app.undo.displayHUD();
				app.temp.selectActive = true;
				return true;
			}
		}
		return false;
	};

	// check what is occupying a specific point on the game map based on type
	var gridPoint = function(type, x, y) {
		x = x === null || x === undefined || x === false ? app.settings.cursor.x : x;
		y = y === null || y === undefined || y === false ? app.settings.cursor.y : y;

		var arr = app.map[type];
		for( var p = 0; p < arr.length; p += 1) {
			if( arr[p].x === x && arr[p].y === y ){
				return { ind:p, objectClass:type, stat:true };
			}
		}
		return { objectClass:type, stat:false };
	};

	return {
		
		// on press of the exit key ( defined in app.settings.keyMap ) undo any active select or interface
		exit: function (exit) { 
			if ( app.settings.keyMap.exit in app.keys ){
				app.undo.all();
			}
			return this;
		},

		// returns info on the grid square currently hovered over
		hovered: function ( type, x, y ){
			return gridPoint( type, x, y );
		},
		
		// allows selection and movement of objects on screen
		move: function ( type ) {

			// if theres no input then say so
			if ( !app.temp.hovered && !type ){
				throw new Error('no type or input specified, please enter a type of map element into the input of the "interact()" method or chain the "info()" method prior to the "interact()" method');
				return false;

			// if there is an object being hovered over, or hovered is undefined ( meaning input is possibly from type input rather then hud )
			}else if ( app.temp.hovered || app.temp.hovered === undefined ) {

				// get the type of object being hovered over
				var typ = type === undefined ? app.temp.hovered.objectClass : type

				// get the index of the object being hovered over
				var intInd = app.temp.hovered === undefined ? undefined : app.temp.hovered.ind;

				// if the map element is selectable and the selected map element is a unit then facilitate interaction with that unit
				if( element( typ, intInd ) && app.temp.selectedUnit ){
					move( 'unit', app.temp.selectedUnit.ind );
				}
			}
		}
	};
}();

/* ------------------------------------------------------------------------------------------------------*\
	
	app.hud handles all the display screens and the users interaction with them

\* ------------------------------------------------------------------------------------------------------*/

app.display = function () {

	var optionsHud = function () {
		var elements = { section:'optionsMenu', div:'optionSelect' };
		if ( displayInfo( app.settings.options, app.settings.optionsDisplay, elements, 'optionSelectionIndex' )){
			app.temp.optionsActive = true;
			app.temp.selectActive = true;
			return true;
		} 
		return false;
	};

	var coStatus = function ( player, side ) {

		var exists = document.getElementById('coStatusHud');

		app.temp.side = side;

		// create container section, for the whole hud
		var hud = document.createElement('section');
			hud.setAttribute('id', 'coStatusHud');

		// create a ul, to be the gold display
		var gold = document.createElement('ul');
			gold.setAttribute('id', 'gold');

		// create a canvas to animate the special level	
		var power = document.createElement('canvas');
		var context = power.getContext(app.ctx);
		power.setAttribute('id', 'coPowerBar');
		power.setAttribute('width', 310 );
		power.setAttribute('height', 128 );

		// create the g for  gold
		var g = document.createElement('li');
		g.setAttribute('id', 'g');
		g.innerHTML = 'G.';
		gold.appendChild(g);

		// add the amount of gold the player currently has
		var playerGold = document.createElement('li');
		playerGold.setAttribute( 'id', 'currentGold' );
		playerGold.innerHTML = player.gold;
		gold.appendChild(playerGold);

		// put it all together and insert it into the dom
		hud.appendChild(gold);
		hud.appendChild(power);

		if(exists){
			exists.parentNode.replaceChild( hud, exists );
		}else{
			document.body.insertBefore( hud, document.getElementById('before'));
		}			

		// return the context for animation of the power bar
		return context;
	};

	var action = function ( actions ) {
		var elements = { section:'actionHud', div:'actions' };
		displayInfo( actions, app.settings.actionsDisplay, elements, 'actionSelectionIndex' );
	};

	var unitInfo = function ( building, unit, tag ) {

		var elements = { section:'unitInfoScreen' , div:'unitInfo' }
		var props = app.units[building][unit].properties;
		var allowed = app.settings.unitInfoDisplay;
		var properties = {};
		var propName = Object.keys(props);

		for ( var n = 0; n < propName.length; n += 1 ){
			if( allowed.hasValue(propName[n]) ){
				properties[propName[n]] = {
					property: propName[n].uc_first(),
					value: props[propName[n]]
				};
			}
		}
		displayInfo( properties, allowed, elements );
	};

	var selectionInterface = function ( building ){
		// get the selectable unit types for the selected building
		var units = app.units[building];
		var elements = { section: 'buildUnitScreen', div:'selectUnitScreen' }
		displayInfo( units, app.settings.unitSelectionDisplay, elements, 'unitSelectionIndex' );
	};

	var displayInfo = function ( properties, allowedProperties, elements, tag ){

		// build the outside screen container or use the existing element
		var display = document.createElement( 'section' );
		display.setAttribute( 'id', elements.section );

		// build inner select screen or use existing one
		var exists = document.getElementById(elements.div);
		var innerScreen = document.createElement( 'div' );
		innerScreen.setAttribute( 'id', elements.div );
		
		// get each unit type for looping over
		var keys = Object.keys( properties );

		for ( u = 0; u < keys.length; u += 1 ){

			// create list for each unit with its cost
			var list = createList( properties[keys[u]], keys[u], allowedProperties, tag );
			if( tag ) list.ul.setAttribute( tag, u + 1 );

			// add list to the select screen
			innerScreen.appendChild(list.ul);
		}

		if( exists ) {
			exists.parentNode.replaceChild(innerScreen, exists);
		}else{
			// add select screen to build screen container
			display.appendChild(innerScreen);
		
			// insert build screen into dom
			document.body.insertBefore(display, document.getElementById('before'));
		}
		return true;
	};

	var select = function ( tag, id, selected ) {

		// if the index is undefined set it to one
		if ( app.temp.unitSelectionIndex === undefined ) app.temp.unitSelectionIndex = 1;

		// all the ul children from the selected element for highlighting
		var hudElement = document.getElementById(id);
		var elements = hudElement.getElementsByTagName('ul');
		var len = elements.length;

		if ( app.temp.unitSelectionIndex > 7 ){
			app.temp.hide = app.temp.unitSelectionIndex - 7;
			for ( var h = 1; h <= app.temp.hide; h += 1 ){
				var hideElement = findElementByTag( tag, h, elements );
				hideElement.style.display = 'none';
			}
		}else if( app.temp.unitSelectionIndex <= len - 7 && app.temp.hide ){
			var showElement = findElementByTag( tag, app.temp.unitSelectionIndex, elements );
			showElement.style.display = '';
		}

		// if the index is not the same as it was prior, then highlight the new index ( new element )
		if( app.temp.prevIndex !== app.temp.unitSelectionIndex ){
			app.temp.selectedElement = findElementByTag( tag, app.temp.unitSelectionIndex, elements );
			if ( app.temp.selectedElement ) {

				// apply highlighting 
				app.temp.selectedElement.style.backgroundColor = 'tan';

				// display info on the currently hovered over element
				if( id === 'selectUnitScreen' ) unitInfo( selected, app.temp.selectedElement.id );

				// check if there was a previous element that was hovered over
				if ( app.temp.prevIndex ) {

					// if there is then remove its highlighting
					var prevElement = findElementByTag( tag, app.temp.prevIndex, elements );
					prevElement.style.backgroundColor = '';
				}
			}
			app.temp.prevIndex = app.temp.unitSelectionIndex;
		}

		if( app.settings.keyMap.select in app.keys && app.temp.selectedElement ){
			app.undo.keyPress(app.settings.keyMap.select);
			return app.temp.selectedElement.getAttribute('id');

		}else if( app.settings.keyMap.down in app.keys ) {
			if ( app.temp.unitSelectionIndex < len ){
				app.temp.unitSelectionIndex += 1;
			} 
			app.undo.keyPress(app.settings.keyMap.down);

		}else if( app.settings.keyMap.up in app.keys ) {
			if( app.temp.unitSelectionIndex > 1 ) app.temp.unitSelectionIndex -= 1;
			app.undo.keyPress(app.settings.keyMap.up);
		}
		return false;				
	};

	var findElementByTag = function ( tag, index, element ) {
		var len = element.length;
		for ( var e = 0; e < len ; e += 1 ){
			// element returns a string, so must cast the index to string for comparison
			if( element[e].getAttribute(tag) === index.toString()){
				return element[e];
			}
		}
	};

	var terrainInfo = function ( info ) {
		// if there is a selectable element then return its info
		if( info !== undefined && info.stat !== false ){
			var object = app.map[info.objectClass][info.ind];
			var list = createList( object, info.objectClass, app.settings.hoverInfo, 'hud' );
			return { ul: list.ul , ind:info.ind, canvas: list.canvas, type: object.type };

		// if there is nothing found it means that it is plains, return the default of the plain object
		}else if ( info.objectClass === 'terrain' ){
			var list = createList( app.map.plain, info.objectClass, app.settings.hoverInfo, 'hud' );
			return { ul: list.ul, ind:false, canvas: list.canvas, type:'plain' };
		}
		return false;
	};

	var hudCanvas = function ( canvasId, type, objectClass ) {
		var canvas = document.createElement('canvas');
		var context = canvas.getContext(app.ctx);
		canvas.setAttribute('width', 128);
		canvas.setAttribute('height', 128);
		canvas.setAttribute('id', type + canvasId + 'Canvas' );
		return { canvas:canvas, context:context, type: type, objectClass: objectClass };
	};

	var createList = function ( object, id, displayedAttributes, canvasId ) {

		if ( canvasId ) {
			// create canvas and add it to the object
			var canvas = hudCanvas( canvasId, object.type, id );
			object['canvas'] = canvas.canvas;
		};

		// get a list of property names
		var properties = Object.keys(object);

		// create an unordered list and give it the specified id
		var ul = document.createElement('ul');
		ul.setAttribute("id", id);

		// go through each property and create a list element for ivart, then add it to the ul;
		for (var i = 0; i < properties.length; i += 1 ){
			
			// properties
			var props = properties[i];

			// only use properties specified in the displayed attributes array
			if( displayedAttributes === '*' || displayedAttributes.hasValue( props )) {
				var li = document.createElement('li');
				li.setAttribute('class', props );
				if( props === 'canvas' ){
					li.appendChild(object[props]);
				}else if ( typeof(object[props]) === 'object' ){
					var list = createList( object[props], props, displayedAttributes );
					li.appendChild(list.ul); 
				}else{
					li.innerHTML = object[props];
				}
				ul.appendChild(li);
			}
		}
		return { ul:ul, canvas:canvas };
	};

	// display informavartion on currently selected square, and return selectable objects that are being hovered over
	var displayHUD = function () {

		// unset cursor move
		app.temp.cursorMoved = false;

		// create hud element or remove the existing element
		var exists = document.getElementById( 'hud' );
		var display = document.createElement( 'div' );
		display.setAttribute( 'id', 'hud' );
		
		// array holds what properties should exist in hud
		// array of map elements, ordered by which will be selected and displayed over the other
		var canvas = [];
		var properties = [];
		var selected = [ 'unit', 'building', 'terrain' ];

		// move through each possible map element, display informavartion to 
		// the dom and return info on selectable map elements
		for ( var x = 0; x < selected.length; x += 1 ){

			// check if the currsor is over the map element type, 
			// if so get the coordinates and info on the map element
			var hovering = terrainInfo(app.select.hovered(selected[x]));

			// if the cursor is over the current map element...
			if( hovering ){

				// add canvas image to its array if exists
				if( hovering.canvas ) canvas.push(hovering.canvas);

				// push the map element type into the props array so that
				// a diff can be performevard between it and the current dom
				properties.push(selected[x]);

				// if the map element needs to be added to the dom then do so
				if( hovering.ul ){
					display.appendChild(hovering.ul);
				}

				// if the return value has not been set, ( meaning the previous map element is not being hovered over)
				// then set it for tvarhe current map element ( which is being hovered over )
				if ( selected[x] === 'unit' || properties[0] !== 'unit' ){
					var object = { objectClass: selected[x], ind: hovering.ind };
				}
				if ( selected[x] === 'building') break; 
			}
		}

		// apply proper width to element
		var displayWidth = app.settings.hudWidth * properties.length;
		var hudLeft = app.settings.hudLeft - 120;
		display.style.left = properties.length > 1 ? hudLeft.toString() + 'px' : app.settings.hudLeft.toString() + 'px';
		display.style.width = displayWidth.toString() + 'px';
		display.style.height = app.settings.hudHeight.toString() + 'px';

		if ( exists ) {
			exists.parentNode.replaceChild( display, exists );
		}else{
			document.body.insertBefore( display, document.getElementById("before"));
		}

		// if there was a canvas elemnt added for display, then render it
		if ( canvas ) {
			for( var c = 0; c < canvas.length; c += 1) {
				if ( canvas[c].objectClass !== 'unit' && canvas.length > 1 ) canvas[c].canvas.setAttribute('class', 'secondHudCanvas');
				app.draw( canvas[c].context ).hudCanvas( canvas[c].type, canvas[c].objectClass );
			}
		}
		return object;
	};

	return {

		selectionInterface: function ( building, tag ) {
			return selectionInterface( building, tag );
		},

		select: function ( tag, id, selected ) {
			return select( tag, id, selected );
		},

		// display terrain info
		hud: function () {

			// if the cursor has been moved, and a selection is active then get the display info for the new square
			if ( app.temp.cursorMoved && !app.temp.selectActive ) app.temp.hovered = displayHUD();
			return this;
		},

		options: function () {
			// if nothing is selected and the user presses the exit key, show them the options menu
			if ( app.settings.keyMap.exit in app.keys && !app.temp.selectActive ){
				optionsHud();
				app.undo.keyPress(app.settings.keyMap.exit);
			}
			if ( app.temp.optionsActive ){
				var selection = select( 'optionSelectionIndex', 'optionsMenu' );
				if ( selection ){
					app.options[selection]();
					app.undo.all();
				} 
			}
			return this;
		},

		coStatus: function () {
			var side = app.calculate.isRightSide();
			if( app.temp.side !== side ) app.draw( coStatus( app.player('grant', 'grant', 1 ), side ));
			return this;
		},

		path: function ( cursor ) {
			var grid = app.temp.range.slice(0);
			var p = app.calculate.path( app.temp.selectedUnit, cursor, grid);
			if ( p ) app.effect.path = app.effect.path.concat(p);
			window.requestAnimationFrame(app.animateEffects);
		},

		range: function () {
			app.effect.highlight = app.effect.highlight.concat(app.temp.range);
			window.requestAnimationFrame(app.animateEffects);
		}
	};
}();

/* ------------------------------------------------------------------------------------------------------*\
	
	app.move handles all the movement in the game, the cursor, scrolling, and moving of units etc..

\* ------------------------------------------------------------------------------------------------------*/

app.move = function () {

	var abs = Math.abs;

	// refresh the postions on the screen of all the units/terrain/buildings/etc
	var refresh = function(){ 
		window.requestAnimationFrame(app.animateTerrain);
		window.requestAnimationFrame(app.animateBuildings);
		window.requestAnimationFrame(app.animateUnit);
	};

	var moveScreen = function ( axis, x, screenDim ) {

		var delay = app.settings.scrollSpeed;
		var screenZeroWidth = app.settings.cursor.scroll[axis];
		var midScreen = screenDim / 2;
		var lower = screenZeroWidth + midScreen;
		var scroll = app.settings.cursor.scroll[axis] + screenDim;
		var dimensions = app.map.dimensions[axis];
		
		if ( !app.temp.scrollTimer ) app.temp.scrollTimer = new Date();

		app.settings.cursor[axis] = x;

		// if the hq is located to the right or below the center of the screen then move there
		if ( x > scroll - midScreen ) {
			// loop with a recursive function so that the time can be delayed
			// creating the effect of moving the screen rather then immediately jumping to the hq
			( function loopDelay (i, dim) {          
				setTimeout( function () {   // set delay time
					screenDim += 1;
					app.settings.cursor.scroll[axis] += 1;
					refresh();
					// if the distance between the center screen position and the hq has not been traveled
					// then keep going, or if the screen has reached the limit of the map dimensions then stop
			 		if ( --i && screenDim <= dim ) loopDelay( i, dim ); 
				}, delay) // <--- delay time
			})( x - ( scroll - midScreen ), dimensions );

		// if its to the left or above the screen then move the opposite direction
		} else if ( x < lower ) {
			( function loopDelay2 (i, dim) {          
				setTimeout( function () {   // set delay time
					screenZeroWidth -= 1;
					app.settings.cursor.scroll[axis] -= 1;
					refresh();
			 		if ( --i && screenZeroWidth > dim ) loopDelay2( i, dim ); 
				}, delay) // <--- delay time
			})( lower - x, 0 );
		}
	};

	// checks if movement is within allowed range
	var canMove = function (  move, range ) {

		for ( var o = 0; o < range.length; o += 1 ) {

			if ( range[o].x === move.x && range[o].y === move.y ) {
				return true;
			}
		}
		return false;
	};

	// creates scrolling effect allowing movement and map dimensions beyond screen dimensions
	var scrol = function ( incriment,  axis, operation ) {

		var d = app.map.dimensions[axis]; // map dimensions
		var screenDimensions = { x:15, y:10 }; // screen dimensions
		var s = screenDimensions[axis];
		var c = app.settings.cursor.scroll[axis];

		// if the resulting movement is greater then the screen size but within the dimensions of the map then scroll
		if ( incriment >= s + c && incriment <= d ){
			app.settings.cursor.scroll[axis] += operation;
			refresh();

		// if the resulting movement is less then the screen size but within the dimensions of the map then scroll back
		}else if( incriment < c && incriment >= 0 ){
			app.settings.cursor.scroll[axis] += operation;
			refresh();
		}
	};

	var cursor = function ( axis, comparison, operation ) {
		if ( !app.temp.selectedBuilding ){
			if ( !app.temp.optionsActive ){
				var cursor = app.settings.cursor[axis]; // cursor location

				scrol( cursor + operation, axis, operation ); // handle scrolling

				if( app.temp.selectedUnit ){
					var result = limit( axis, operation );
					if ( result ){
						app.undo.effect('path');
						app.display.path({ x: result.x, y: result.y });
						return true;
					}
				}else if( operation < 0 ){
					if ( cursor + operation >= comparison ){
						app.settings.cursor[axis] += operation;
						return true;
					}
				}else{
					if ( cursor + operation <= comparison ){
						app.settings.cursor[axis] += operation;
						return true;
					}
				}
			}
		}
		return false;
	};

	var limit = function ( axis, operation ){
		var oAxis = axis === 'x' ? 'y' : 'x';
		var a = {};
		var d = app.map.dimensions;

		a[axis] = app.settings.cursor[axis] + operation;
		a[oAxis] = app.settings.cursor[oAxis];

		if( canMove( a, app.temp.range ) && a[axis] >= 0 && a['x'] <= d.x && a['y'] <= d.y ){
		    app.settings.cursor[axis] += operation;
		    return app.settings.cursor;
		}
		return false;
	};

	return {

		// move screen to current players hq
		screenToHQ: function ( player ) {
			var sd = app.cursorCanvas.dimensions();
			var screenWidth = sd.width / 64;
			var screenHeight = sd.height / 64;
			var x = player.hq.x;
			var y = player.hq.y;

			moveScreen('x', x, screenWidth);
			moveScreen('y', y, screenHeight);
		},

		// keep track of cursor position
		cursor: function () {

			// cursor speed
			var delay = !app.settings.cursor.speed ? 50 : app.settings.cursor.speed;

			if ( !app.cursorTimeKeeper ) {
				app.cursorTimeKeeper = new Date();
			}

			var now = new Date() - app.cursorTimeKeeper;

			if ( now > delay ){
				// map dimensions
				var d =  app.map.dimensions; 

				if (app.settings.keyMap.up in app.keys) { // Player holding up

				// if the cursor has moved store a temporary varibale that expresses this @ app.temp.cursorMoved
					app.temp.cursorMoved = cursor('y',0,-1);
				}
				if (app.settings.keyMap.down in app.keys) { // Player holding down
					app.temp.cursorMoved = cursor('y',d.y, 1);
				}
				if (app.settings.keyMap.left in app.keys) { // Player holding left
					app.temp.cursorMoved = cursor('x',0,-1);
				}
				if ( app.settings.keyMap.right in app.keys) { // Player holding right
					app.temp.cursorMoved = cursor('x',d.x, 1);
				}
				window.requestAnimationFrame(app.animateCursor);
				app.cursorTimeKeeper = new Date();
			}	
			return this;
		}
	};
}();

/* --------------------------------------------------------------------------------------*\
	
	app.settings consolidates all the customizable options and rules for the game into
	an object for easy and dynamic manipulation

\* --------------------------------------------------------------------------------------*/

app.settings = {

	// speed at which the screen will move to next hq at the changinf of turns
	scrollSpeed: 50,

	// types to look through when determining terrains effect on unit movement
	obsticleTypes: ['unit', 'terrain'],

	// list of the effects each obsticle has on each unit type
	obsticleStats: {
		mountain: {
			infantry: 2
		},
		wood: {
			infantry: 1
		},
		plain: {
			infantry: 1
		},
		unit:{
			infantry:0
		}
	},

	// rules on how attacks will be handled between unit types
	attackStats: {},

	// terrain each unit is allowed to walk on
	movable:{
		foot: [ 'plain', 'river', 'mountain', 'wood', 'road', 'building' ],
		wheels: [ 'plain', 'wood', 'road', 'building' ],
		flight: [ 'plain', 'river', 'mountain', 'wood', 'road', 'water', 'building' ],
		boat: ['water', 'building']
	},

	options:{ 
		unit:{ name:'Unit' }, 
		intel:{ name:'Intel'}, 
		options:{ name:'Options' }, 
		save:{ name:'Save' }, 
		end:{ name:'End'} 
	},

	// dimensions of diplay hud
	hudWidth: 120,
	hudHeight: 200,
	hudLeft: 1050,

	// which attributes of objects ( unit, buildings etc ) will be displayed in hud
	hoverInfo: ['ammo','health','name','fuel','def', 'canvas' ],

	// unit info attributes for display
	unitInfoDisplay: [ 'movement', 'vision', 'fuel','weapon1', 'weapon2', 'property', 'value' ],

	// options displayed
	optionsDisplay: [ 'options', 'unit', 'intel', 'save', 'end' ],

	// which attributes of units will be displayed on unit selection/purchase/building hud
	unitSelectionDisplay: [ 'name', 'cost' ],

	// options attributes for displ
	optionsDisplay: [ 'options', 'unit', 'intel', 'save', 'end', 'name' ],

	// map elements that cannot be selected
	notSelectable: ['terrain', 'hq', 'city'],
	
	// cursor settings
	cursor: {
		x:6,
		y:4,
		speed:50,
		scroll:{ x:0, y:0 }
	},

	// keyboard settings
	keyMap:{
		exit:27,
		select:13,
		up:38,
		down:40,
		left:37,
		right:39
	}
};

/* --------------------------------------------------------------------------------------*\
	
	app.effect is holds the coordinates for effects, these are dynamic, hence the empty
	arrays, they will fill and remove data as necessary to animate the game effects

\* --------------------------------------------------------------------------------------*/

app.effect = {
	highlight:[],
	path:[]
};

/* --------------------------------------------------------------------------------------*\
	
	app.map contains all the settings for the map, unit locations, terrain, buildings, etc. 
	it holds coordinates of objects that correspond to animations in the animation repo
	maps can be built and edited dynamically by inserting or removing objects from/into the 
	arrays

\* --------------------------------------------------------------------------------------*/

app.map = {
	background: { 
		type:'plain',
		x:20, 
		y:20 
	},
	dimensions: { x:20, y:20 },
	plain: { 
		type:'plain', name:'Plains', def: 1 },
	terrain: [
		{x:1,y:7, type:'tallMountain', name:'Mountain', obsticle:'mountain', def:2},
		{x:2,y:5, type:'tallMountain', name:'Mountain', obsticle:'mountain', def:2},
		{x:3,y:4, type:'tallMountain', name:'Mountain', obsticle:'mountain', def:2},
		{x:8,y:5, type:'tallMountain', name:'Mountain', obsticle:'mountain', def:2},
		{x:1,y:1, type:'tallMountain', name:'Mountain', obsticle:'mountain', def:2},
		{x:1,y:5, type:'tree', name:'Woods', obsticle:'wood', def:3},
		{x:1,y:6, type:'tree', name:'Woods', obsticle:'wood', def:3},
		{x:1,y:8, type:'tree', name:'Woods', obsticle:'wood', def:3},
		{x:3,y:5, type:'tree', name:'Woods', obsticle:'wood', def:3},
		{x:6,y:2, type:'tree', name:'Woods', obsticle:'wood', def:3},
		{x:6,y:3, type:'tree', name:'Woods', obsticle:'wood', def:3},
		{x:9,y:5, type:'tree', name:'Woods', obsticle:'wood', def:3},
		{x:9,y:6, type:'tree', name:'Woods', obsticle:'wood', def:3},
	],
	building: [
		{ x:0, y:5, type:'hq', name:'HQ', obsticle:'building', player:1, color: 'red' , def:4},
		{ x:20, y:5, type:'hq', name:'HQ', obsticle:'building', player:2, color: 'blue' , def:4},
		{ x:0,y:4, type:'base', name:'Base', obsticle:'building', player:1,color:'red', def:4},
		{ x:15,y:4, type:'base', name:'Base', obsticle:'building', player:2, color:'blue', def:4}
	],
	unit:[
		{ x:2, y:5, type:'infantry', name:'Infantry', obsticle:'unit', movable: app.settings.movable.foot, movement:3, player: 1, health:10, ammo:10, fuel:99, weapon1:{}, weapon2:{}, id: 1 }
	]
};

/* --------------------------------------------------------------------------------------*\
	
	app.units is a repo for the units that may be created on the map, it holds all their
	stats and is organized by which building type can create them

\* --------------------------------------------------------------------------------------*/

app.units = {
	base: {
		infantry: {
			properties: { 
				type:'infantry', 
				name:'Infantry', 
				movement:3, 
				vision:2, 
				range:{ 
					lo: 1, 
					hi: 1 
				},
				movable: app.settings.movable.foot, 
				health:10, 
				ammo:10 ,
				fuel:99,
				weapon1:{}, 
				weapon2:{}, 
				weapon1:{},
				weapon2:{},
			
			},
			name: 'Infantry',
			cost: 1000
		},
		mech: {
			properties: { 
				type:'mech',
				name:'Mech',
				movement:2,
				vision:2,
				range:{ 
					lo: 1,
					hi: 1 
				},
				movable: app.settings.movable.foot,
				health:10,
				ammo:10 ,
				fuel:70,
				weapon1:{},
				weapon2:{}, 
			},
			name: 'Mech',
			cost: 3000
		},
		recon: {
			properties: { 
				type:'recon',
				name:'Recon',
				movement:8,
				vision: 5,
				range:{ 
					lo: 1,
					hi: 1 
				},
				movable: app.settings.movable.wheels,
				health:10,
				ammo:10 ,
				fuel:80,
				weapon1:{},
				weapon2:{}, 
			},
			name: 'Recon',
			cost: 4000
		},
		apc: {
			properties: {
				type:'apc',
				name:'APC',
				movement:6,
				vision: 1,
				range:{ 
					lo: 1,
					hi: 1 
				},
				movable: app.settings.movable.wheels,
				health:10,
				fuel:70,
				weapon1:{},
				weapon2:{}, 
			},
			name: 'APC',
			cost: 5000
		},
		antiAir: {
			properties: { 
				type:'antiAir',
				name:'Anti-Air',
				movement:6,
				vision: 2,
				range:{ 
					lo: 1,
					hi: 1 
				},
				movable: app.settings.movable.wheels,
				health:10,
				ammo:10 ,
				fuel:60,
				weapon1:{},
				weapon2:{}, 
			},
			name: 'Anti-Aircraft',
			cost: 8000
		},
		tank: {
			properties: { 
				type:'tank',
				name:'Tank',
				movement:6,
				vision: 3,
				range:{ 
					lo: 1,
					hi: 1 
				},
				movable: app.settings.movable.wheels,
				health:10,
				ammo:10 ,
				fuel:60,
				weapon1:{},
				weapon2:{}, 
			},
			name: 'Tank',
			cost: 7000
		},
		midTank: {
			properties: { 
				type:'midTank',
				name:'Mid Tank',
				movement:5,
				vision: 1,
				range:{ 
					lo: 1,
					hi: 1 
				},
				movable: app.settings.movable.wheels,
				health:10,
				ammo:10 ,
				fuel:50,
				weapon1:{},
				weapon2:{}, 
			},
			name: 'Mid Tank',
			cost: 16000
		},
		artillery: {
			properties: { 
				type:'artillery',
				name:'Artillary',
				movement:5,
				vision: 1,
				range:{ 
					lo: 2,
					hi: 3 
				},
				movable: app.settings.movable.wheels,
				health:10,
				ammo:10 ,
				fuel:50,
				weapon1:{},
				weapon2:{}, 
			},
			name: 'Artillery',
			cost: 6000
		},
		rockets: {
			properties: { 
				type:'rockets',
				name:'Rockets',
				movement:5,
				vision: 1,
				range:{ 
					lo: 3,
					hi: 5 
				},
				movable: app.settings.movable.wheels,
				health:10,
				ammo:10 ,
				fuel:50,
				weapon1:{},
				weapon2:{}, 
			},
			name: 'Rockets',
			cost: 15000
		},
		missles: {
			properties: { 
				type:'missles',
				name:'Missles',
				movement:4,
				vision: 1,
				range:{ 
					lo: 3,
					hi: 5 
				},
				movable: app.settings.movable.wheels,
				health:10,
				ammo:10 ,
				fuel:50,
				weapon1:{},
				weapon2:{}, 
			},
			name: 'Missles',
			cost: 12000
		},	
		neoTank: {
			properties: { 
				type:'neoTank',
				name:'Neo Tank',
				movement:6,
				vision:1 ,
				range:{ 
					lo: 1,
					hi: 1 
				},
				movable: app.settings.movable.wheels,
				health:10,
				ammo:10 ,
				fuel:99,
				weapon1:{},
				weapon2:{}, 
			},
			name: 'Neo Tank',
			cost: 22000
		}
	},
	airport: {
		tCopter: {
			properties: { 
				type:'tCopter',
				name:'T-Copter',
				movement:6,
				vision:2,
				range:{ 
					lo: 1,
					hi: 1 
				},
				movable: app.settings.movable.flight,
				health:10,
				fuel:99,
				weapon1:{},
				weapon2:{},
				fpt:2 
			},
			name: 'T-Copter',
			cost: 5000
		},
		bCopter: {
			properties: { 
				type:'bCopter',
				name: 'B-Copter',
				movement:6,
				vision:3 ,
				range:{ 
					lo: 1,
					hi: 1 
				},
				movable: app.settings.movable.flight,
				health:10,
				ammo:10 ,
				fuel:99,
				weapon1:{},
				weapon2:{},
				fpt:1 
			},
			name: 'B-Copter',
			cost: 9000
		},
		fighter: {
			properties: { 
				type:'fighter',
				name:'Fighter',
				movement:9,
				vision:2 ,
				range:{ 
					lo: 1,
					hi: 1 
				},
				movable: app.settings.movable.flight,
				health:10,
				ammo:10 ,
				fuel:99,
				weapon1:{},
				weapon2:{},
				fpt:5 
			},
			name: 'Fighter',
			cost: 20000
		},
		bomber: {
			properties: { 
				type:'bomber',
				name:'Bomber',
				movement:7,
				vision:2 ,
				range:{ 
					lo: 1,
					hi: 1 
				},
				movable: app.settings.movable.flight,
				health:10,
				ammo:10 ,
				fuel:99,
				weapon1:{},
				weapon2:{},
				fpt:5 
			},
			name: 'Bomber',
			cost: 22000
		}
	},
	seaport:{
		lander: {
			properties: { 
				type:'lander',
				name: 'Lander',
				movement:6,
				vision:1 ,
				range:{ 
					lo: 1,
					hi: 1 
				},
				movable: app.settings.movable.flight,
				health:10,
				fuel:99,
				weapon1:{},
				weapon2:{},
				fpt:1 
			},
			name: 'Lander',
			cost: 12000
		},
		cruiser: {
			properties: { 
				type:'cruiser',
				name:'Cruiser',
				movement:6,
				vision:3,
				range:{ 
					lo: 1,
					hi: 1 
				},
				movable: app.settings.movable.flight,
				health:10, ammo:10 ,
				fuel:99,
				weapon1:{},
				weapon2:{}, fpt:1 
			},
			name: 'Cruiser',
			cost: 18000
		},
		submerine: {
			properties: { 
				type:'submerine',
				name:'Submerine',
				movement:5,
				vision:5 ,
				range:{ 
					lo: 1,
					hi: 1 
				},
				movable: app.settings.movable.flight,
				health:10,
				ammo:10,
				fuel:60,
				weapon1:{},
				weapon2:{},
				fpt:1,
				divefpt:5
			},
			name: 'Submerine',
			cost: 20000
		},
		bShip: {
			properties: { 
				type:'bShip',
				name:'B-Ship',
				movement:5,
				vision:2 ,
				range:{ 
					lo: 2,
					hi: 6 
				},
				movable: app.settings.movable.flight,
				health:10,
				ammo:10,
				fuel:99,
				weapon1:{},
				weapon2:{},
				fpt:1 
			},
			name: 'B-Ship',
			cost: 28000
		}
	}
};

/* --------------------------------------------------------------------------------------------------------*\

	app.init sets up a working canvas instance to the specified canvas dom element id, it is passed the id
	of a canvas element that exists in the dom and takes care of initialization of that canvas element

\*---------------------------------------------------------------------------------------------------------*/

app.backgroundCanvas = app.init('background');
app.terrainCanvas = app.init('landforms');
app.buildingCanvas = app.init('buildings');
app.effectsCanvas = app.init('effects');
app.unitCanvas = app.init('units');
app.weatherCanvas = app.init('weather');
app.cursorCanvas = app.init('cursor');

/* ----------------------------------------------------------------------------------------------------------*\

	The draw functions are passed into the setAnimations method of an initialized game canvas. 
	In the initialization they are passed the 'draw' variable, which is a repo of objects/drawings.
	The repo can be set with the 'setAnimationRepo' method of app.init, the default repo is app.objects
	setting a new repo for a canvas will overwrite the app.objects repo with its replacement for that canvas
 	( not all canvases will be effected if you are using multiple canvases ).

	The methods of draw, used to access the repo are as follows:

	coordinate: can take specific coordinates, or you can specify a coordinate object containing an array
	or multiple arrays of objects with x and y coordinate properties and a type the specifies what to
	draw at those coordinates. for example "draw.coordinate('map', 'unit');" will look at app.map.unit where 
	app.map.unit is an array of object coordinates with a type property. Within the coordinates, while looping, 
	the coordinate method will look at the coordinate objects type property, find a drawing in the specified or
	default repo by the same name, and draw the matching image at the specified coordinates. this allows multiple
	coordinates to be specified for a specific type of drawing, unit, terrain, whatever and also allows them to 
	be added, removed or updated dynamically by adding or removing objects to the arrays.

	background: background will simply fill the entire background with a specified drawing from the repo

	cache: can be chained in the draw command and specifies that you want the objects being drawn to be cached 
	and drawn as a whole image, rather then drawn repeatedly for each coordinate, can improve performance when
	objects that dont need to change their appearance must be moved around allot ( scrolling for example will be
	faster with cached terrain elements )

\*-----------------------------------------------------------------------------------------------------------*/

app.drawEffects = function ( draw ) {
	draw.coordinate( 'effect', 'highlight' ); // highlighting of movement range
	draw.coordinate( 'effect', 'path' ); // highlighting current path
};

app.drawWeather = function ( draw ){
	// weather stuff animated here
};

app.drawBuildings = function ( draw ){
	draw.coordinate( 'map', 'building' ); 
};

app.drawUnits = function ( draw ) {
	draw.coordinate('map', 'unit');
};

app.drawCursor = function ( draw ) {
	draw.coordinate( 'map', 'cursor', [app.settings.cursor]);
};

app.drawBackground = function ( draw ) {
	draw.background( 'background' );
};

app.drawTerrain = function ( draw ) {
	draw.cache().coordinate( 'map', 'terrain' );
};

/* --------------------------------------------------------------------------------------------------------*\

	The animate functions insert the draw methods into the specified canvas for rendering and then make a 
	call to the canvas to render those drawings with the render method. Calling the render method of an
	initialized canvas object will render the animations once. If a loop is wanted ( for changing animations 
	for example ), you may pass the parent function into the render function to be called recursively.

\*---------------------------------------------------------------------------------------------------------*/

app.animateBuildings = function () {
	app.buildingCanvas.setAnimations(app.drawBuildings).render();
};

app.animateUnit = function () {
	app.unitCanvas.setAnimations(app.drawUnits).render();
};

app.animateBackground = function () {
	app.backgroundCanvas.setAnimations(app.drawBackground).render();
};

app.animateTerrain = function () {
	app.terrainCanvas.setAnimations(app.drawTerrain).render();
};

app.animateCursor = function () {
	app.cursorCanvas.setAnimations(app.drawCursor).render(); 
};

app.animateEffects = function () {
	app.effectsCanvas.setAnimations(app.drawEffects).render();
};

/* --------------------------------------------------------------------------------------------------------*\

	app.gameLoop consolidates all the game logic and runs it in a loop, coordinating animation calls and 
	running the game

\*---------------------------------------------------------------------------------------------------------*/

app.gameLoop = function () {
	app.move.cursor(); // controls cursor and screen movement
	app.display.hud().coStatus().options(); // displays menus, huds, etc..
	app.select.move(); // controls selection and interaction with map elements
	app.build.units(); // controls building of units
	app.select.exit(); // controls the ability to escape display menus 
	window.requestAnimationFrame(app.gameLoop);
};

/* --------------------------------------------------------------------------------------------------------*\

	app.run starts the main game loop and calls all the animate functions

\*---------------------------------------------------------------------------------------------------------*/

app.run = function () {
	app.start(app.users);
	app.gameLoop();
	app.animateBackground();
	app.animateTerrain();
	app.animateBuildings();
	app.animateUnit();
	app.animateCursor();
};

/* --------------------------------------------------------------------------------------------------------*\

	app.draw provides a set of methods for interacting with, scaling, caching, coordinating  
	and displaying the drawings/animations provided in the app.animationRepo

\*---------------------------------------------------------------------------------------------------------*/

app.draw = function ( canvas, dimensions, base ) {

	var temp = {}; // holds temporary persistant variables that can be passed between functions ( similar to static variables / functions )

	// base is the amount of pixles in each grid square, used to scale canvas elements if needed
	var base = base === null || base === undefined ? 64 : base;

	// set/get width and height dimensions for the game map
	if( dimensions === null || dimensions === undefined ){
		var w = 64;
		var h = 64;
	}else{
		var width = dimensions.width;
		var height = dimensions.height;	
		var w = width / 15;
		var h = height / 10;
	}

	var animationObjects = app.animationRepo( width, height );

	// creates a small canvas
	var smallCanvas = function () {
		var smallCanvas = document.createElement('canvas');
			smallCanvas.width = w * 2;
			smallCanvas.height = h * 2;
		return smallCanvas;
	};

	// caches drawings so they can be recalled without redrawing ( performance boost in certain situations )
	var cacheDrawing = function ( name ) {

		// create a canvas
		var canvas = smallCanvas();

		// get context	
		var cacheCanvas = canvas.getContext(app.ctx);

		// set the position of the image to the center of the cached canvas							
		var position = setPosition((w/2),(h/2));


		// draw image to cache to canvas
		animationObjects[name](cacheCanvas, position);

		// cache the canvas with drawing on it ( drawings cached by their class name )
		app.cache[name] = canvas;

	};

	// calculates the base for scaling
	var calcBase = function ( d ) {
		return d / base;
	};

	// scales items by calculating their base size multplied by 
	var scale = function ( type, value ) {
		var multiple = type === 'w' ? calcBase(w) : calcBase(h);
		return value === null || value === undefined ? multiple : multiple * value;
	};

	// creates a friendlier interface for drawing and automatically scales drawings etc for screen size
	var setPosition = function ( x, yAxis ) {

		var y = yAxis + h;

		return {
			// u = right, will move right the amonut of pixles specified
			r:function ( number ){
				return x + scale('w', number);
			},
			// u = left, will move left the amonut of pixles specified
			l:function ( number ){
				return x - scale('w', number);
			},
			// u = down, will move down the amonut of pixles specified
			d:function ( number ){
				return y + scale('h', number);
			},
			// u = up, will move up the amonut of pixles specified
			u:function ( number ){
				return y - scale('h', number);
			},
			// x is the x axis
			x:x,
			// y is the y axis
			y:y,
			// width
			w:w,
			// height
			h:h,
			// random number generator, used for grass background texture
			random: function (min, max) {
					 return (Math.random() * (max - min)) + min;
			}
		};
	};
	
	// offset of small canvas drawing ( since the drawing is larger then single grid square it needs to be centered )
	var smallX = w/2;
	var smallY = h/2; 

	return {

		// cache all images for performant display ( one drawing to rule them all )
		cache: function (){
			this.cached = true;
			return this;
		},

		// place drawings where they belong on board based on coorinates
		coordinate: function ( objectClass , object, coordinet ) {

			var s = {}; // holder for scroll coordinates
			var name; // holder for the name of an object to be drawn
			var scroll = app.settings.cursor.scroll; // scroll positoion ( map relative to display area )
			var wid = ( w * 16 ); // display range
			var len = ( h * 11 );

			// get the coordinates for objects to be drawn
			coordinates = coordinet === undefined ? app[objectClass][object] : coordinet;

			// for each coordinate
			for (var c = 0; c < coordinates.length; c += 1 ){

				// var s modifys the coordinates of the drawn objects to allow scrolling behavior
				// subtract the amount that the cursor has moved beyond the screen width from the 
				// coordinates x and y axis, making them appear to move in the opposite directon
				s.x = ( coordinates[c].x * w ) - ( scroll.x * w );
				s.y = ( coordinates[c].y * h ) - ( scroll.y * h );

				// only display coordinates that are withing the visable screen
				if( s.x >= 0 && s.y >= 0 && s.x <= wid && s.y <= len ){

					// get the name of the object to be drawn on the screen
					name = objectClass === 'map' && coordinet === undefined ? coordinates[c].type : object;

					// if it is specified to be cached
					if( this.cached ){

						// check if it has already been cached and cache the drawing if it has not yet been cached
						if ( app.cache[name] === undefined ) cacheDrawing(name);
						
						// draw the cached image to the canvas at the coordinates minus 
						// its offset to make sure its centered in the correct position
						canvas.drawImage( app.cache[name], s.x - smallX, s.y - smallY );

					}else{

						// if it is not cached then draw the image normally at its specified coordinates
						animationObjects[name](canvas, setPosition( s.x, s.y ));
					}
				}
			}
		},

		// fills background
		background: function ( object ) {
		for (var x = 0; x < app.map[object].x; x += 1 ) {
			for( var y = 0;  y < app.map[object].y; y += 1 ) {
					animationObjects[app.map[object]['type']]( canvas, setPosition( x * w, y * h ));
				}
			}
		},

		hudCanvas: function ( object, objectClass ) {

			// draw a backgrond behind terrain and building elements
			if( objectClass !== 'unit') animationObjects.plain(canvas, setPosition( smallX, smallY ));

			if ( app.cache[object] ){ // use cached drawing if available
				canvas.drawImage( app.cache[object], 0, 0);
			}else{
				animationObjects[object]( canvas, setPosition( smallX, smallY ));
			}			
		}
	};
};

/* --------------------------------------------------------------------------------------------------------*\

	app.animationRepo is the default object repo the 'm' parameter is a method passed from 
	app.draw that scales the coordinates of the drawings to fit any grid square size, as 
	well as providing some functionality like random(), which generates random numbers within the specified 
	range of numbers. 

	'm' does not have to be used

	default is a base of 64 ( 64 X 64 pixles ), the base is set as a perameter of initializing the 
	app.draw();

\*---------------------------------------------------------------------------------------------------------*/

app.animationRepo = function ( width, height ) {
	return {
		cursor: function (canv, m) {
			// size of cursor corners
			var size = 15;
			canv.strokeStyle = "black";
			canv.fillStyle = "#fff536";
			canv.beginPath();
			// bottom left
			canv.moveTo(m.l(3),m.u(size));
			canv.lineTo(m.l(3),m.d(3));
			canv.lineTo(m.r(size),m.d(3));
			canv.lineTo(m.l(3),m.u(size));
			// bottem right
			canv.moveTo(m.r(67),m.u(size));
			canv.lineTo(m.r(67),m.d(3));
			canv.lineTo(m.r(64-size),m.d(3));
			canv.lineTo(m.r(67),m.u(size));
			// top right
			canv.moveTo(m.r(67),m.u(64-size));
			canv.lineTo(m.r(67),m.u(67));
			canv.lineTo(m.r(64-size),m.u(67));
			canv.lineTo(m.r(67),m.u(64-size));
			// bottem left
			canv.moveTo(m.l(3),m.u(64-size));
			canv.lineTo(m.l(3),m.u(67));
			canv.lineTo(m.r(size),m.u(67));
			canv.lineTo(m.l(3),m.u(64-size));
			canv.fill();
			canv.stroke();
			return canv;
		},
		highlight: function (canv, m) {
			canv.fillStyle = "rgba(255,255,255,0.3)";
			canv.beginPath();
			canv.lineTo( m.r(m.w), m.y);
			canv.lineTo( m.r(m.w), m.u(m.h));
			canv.lineTo(m.x,m.u(m.h));
			canv.lineTo(m.x,m.y);
			canv.fill();
			return canv;
		},
		path: function (canv, m) {
			canv.fillStyle = "rgba(255,0,0,0.5)";
			canv.beginPath();
			canv.lineTo( m.r(m.w), m.y);
			canv.lineTo( m.r(m.w), m.u(m.h));
			canv.lineTo(m.x,m.u(m.h));
			canv.lineTo(m.x,m.y);
			canv.fill();
			return canv;
		},
		base: function (canv, m) {
			canv.fillStyle = "rgba(0,0,200,0.9)";
			canv.beginPath();
			canv.lineTo( m.r(m.w - 5), m.y - 5 );
			canv.lineTo( m.r(m.w - 5), m.u(m.h + 5));
			canv.lineTo(m.x -5,m.u(m.h + 5));
			canv.lineTo(m.x -5,m.y - 5);
			canv.fill();
			return canv;
		},
		hq: function (canv, m) {
			canv.fillStyle = "rgba(80,0,20,0.9)";
			canv.beginPath();
			canv.lineTo( m.r(m.w - 5), m.y - 5 );
			canv.lineTo( m.r(m.w - 5), m.u(m.h + 5));
			canv.lineTo(m.x -5,m.u(m.h + 5));
			canv.lineTo(m.x -5,m.y - 5);
			canv.fill();
			return canv;
		},
		// dimensions 
		plain: function (canv, m) {
			canv.fillStyle = "#d6f71b";
			//canv.strokeStyle = "black";
			canv.beginPath();
			canv.lineTo( m.r(m.w), m.y);
			canv.lineTo( m.r(m.w), m.u(m.h));
			canv.lineTo(m.x,m.u(m.h));
			canv.lineTo(m.x,m.y);
			canv.fill();
			//canv.stroke();
			canv.strokeStyle = "#f2ff00";
			canv.beginPath();
			for (var rand = 0; rand < width; rand +=1 ){
				var randomHeight = m.random( m.y, m.u(m.h) );
				var randomWidth = m.random( m.x, m.r(m.w) );
				canv.moveTo( randomWidth, randomHeight );
				canv.lineTo( randomWidth + 4, randomHeight );
			}
			canv.stroke();
			//canv.strokeStyle = "black";
			canv.beginPath();
			canv.lineTo( m.r(m.w), m.y);
			canv.lineTo( m.r(m.w), m.u(m.h));
			canv.lineTo(m.x,m.u(m.h));
			canv.lineTo(m.x,m.y);
			//canv.stroke();
			return canv;
		},
		tallMountain: function (canv, m) {
			canv.strokeStyle = "#41471d";
			canv.fillStyle = "#ff8800";
			canv.beginPath();
			canv.moveTo( m.x, m.u(20));
			canv.lineTo(m.x,m.u(30));
			canv.lineTo(m.r(5), m.u(45));
			canv.quadraticCurveTo( m.r(15), m.u(50), m.r(15), m.u(50));
			canv.moveTo(m.r(10),m.u(35));
			canv.lineTo(m.r(20),m.u(67));
			canv.quadraticCurveTo(m.r(25), m.u(78),m.r(52),m.u(67));
			canv.lineTo(m.r(62),m.u(34));
			canv.quadraticCurveTo(m.r(68),m.u(20),m.r(38),m.y);
			canv.quadraticCurveTo(m.r(22),m.y,m.x,m.u(20));
			canv.fill();
			canv.stroke();
			return canv;
		},
		shortMountain: function (canv, m) {
			canv.strokeStyle = "#41471d";
			canv.fillStyle = "#ff8800";
			canv.beginPath();
			canv.moveTo( x, m.u(10));
			canv.lineTo( m.r(20), m.u(m.h));
			canv.lineTo( m.r(40), m.u(m.h));
			canv.lineTo( m.r(m.w), m.u(10));
			canv.quadraticCurveTo( m.r(31), m.d(9), m.r(5), m.u(10));
			canv.quadraticCurveTo( m.r(20));
			canv.fill();
			canv.stroke();
			return canv;
		},
		tree: function (canv, m) {
			canv.strokeStyle = "black";
			canv.fillStyle = "rgb(41,148,35)";
			canv.beginPath();
			//bottom
			canv.moveTo(m.r(21), m.u(15));
			canv.quadraticCurveTo(m.r(42),m.d(1),m.r(60),m.u(15));
			canv.quadraticCurveTo(m.r(74),m.u(25), m.r(59),m.u(33));
			canv.moveTo(m.r(21), m.u(15));
			canv.quadraticCurveTo(m.r(16),m.u(20),m.r(29),m.u(30));
			//middle
			canv.moveTo(m.r(27),m.u(30));
			canv.quadraticCurveTo(m.r(42),m.u(20), m.r(60), m.u(34));
			canv.quadraticCurveTo(m.r(58),m.u(34), m.r(50), m.u(43));
			//canv.quadraticCurveTo(m.r(58),m.u(38), m.r(50), m.u(43));
			canv.moveTo(m.r(27),m.u(30));
			canv.quadraticCurveTo(m.r(34), m.u(34),m.r(37),m.u(40));
			//top
			canv.moveTo(m.r(35), m.u(40));
			canv.quadraticCurveTo(m.r(44), m.u(35), m.r(51), m.u(41));
			canv.quadraticCurveTo(m.r(52), m.u(43), m.r(42), m.u(50));
			canv.moveTo(m.r(35), m.u(40));
			canv.quadraticCurveTo(m.r(40),m.u(42),m.r(42), m.u(50));
			canv.fill();
			canv.stroke();
			return canv;
		},
		infantry: function (canv, m) {
			canv.fillStyle = "blue";
			canv.beginPath();
			canv.arc(m.r(32),m.u(32),10,0,2*Math.PI);
			canv.fill();
			return canv;
		}
	}
};
