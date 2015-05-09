window.addEventListener("keydown", function (e) {
	app.keys[e.keyCode] = true;
}, false);

window.addEventListener("keyup", function (e) {
	app.keys[e.keyCode] = false;
	app.keys.splice(e.keyCode, 1);
	delete app.keys[e.keyCode];
}, false);

app = {	
	// simple check if value is in a flat array
	inArray: function (value, array) {
  		return array.indexOf(value) > -1;
	},

	// compares two arrays of objects, looking for values in both arrays of objects
	objectArrayCompare:function ( array1, array2, values ){
		var len = values.length - 1;

		// for each item in the first array
		for (var z = 0; z < array1.length; z += 1 ){

			// and each item in the second
			for (var n = 0; n < array2.length; n += 1 ){

				// and each value in the values array
				for (var x = 0; x <= len; x += 1 ){

					// if all the values have been gone through ( meaning all exist in each array of objects ) return true
					if( array1[z][values[x]] === array2[n][values[x]] && values[x] === v.len ) return true;
				}
			}
		}
		return false;
	},

	// remove one arrays values from another
	offsetArray: function ( array, offsetArray ) {
		for (var z = 0; z < offsetArray.length; z += 1 ){
			for (var n = 0; n < array.length; n += 1 ){
				if ( array[n].x === offsetArray[z].x && array[n].y === offsetArray[z].y ){
					array.splice(n,1);
				}
			}
		}
		return array;
	},

	// check if a value exists in an array of objects
	inObjectArray: function ( array, value, key ) {
		for( vari = 0; i < array.length; i += 1 ){
			if ( key ){
				if( array[i][key] === value ) return i;
			}else{
				var keys = Object.keys(array[i]);
				for( var k = 0; k < keys.length; k += 1 ){
					if( array[i][keys[k]] === value ){
						return i;
					}
				}
			}
		}
		return false;
	},

	// find the index of a key ( used to clear out the key pressed events so that 
	// one key can be used multiple times without being percieved as held down )
	findKey: function ( key ) {

		return false;
	},

	cache:{},

	settings:{

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

		// terrain each unit is allowed to walk on
		movable:{
			foot: [ 'plain', 'river', 'mountain', 'wood', 'road', 'building' ],
			wheels: [ 'plain', 'wood', 'road', 'building' ],
			flight: [ 'plain', 'river', 'mountain', 'wood', 'road', 'water', 'building' ],
			boat: ['water', 'building']
		},

		// dimensions of diplay hud
		hudWidth:120,
		hudHeight:200,

		// which attributes of objects ( unit, buildings etc ) will be displayed in hud
		hoverInfo: ['ammo','health','type','fuel','def'],

		// which attributes of units will be displayed on unit selection/purchase/building
		unitSelectionDisplay: [ 'name', 'cost' ],
		
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
	},

	keys:[], // holds array of key pressed events
	players:[], // array of players ( havent yet implimented player or turn system yet )
	
	// animation objects
	accessAnimationRepo: function ( canvas, dimensions, base ) {

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

		// caches drawings so they can be recalled without redrawing ( performance boost in certain situations )
		var cacheDrawing = function ( name ) {

			// create a canvas
			var smallCanvas = document.createElement('canvas');
				smallCanvas.width = w * 2;
				smallCanvas.height = h * 2;

			// get context	
			var cacheCanvas = smallCanvas.getContext(app.ctx);

			// set the position of the image to the center of the cached canvas							
			var position = setPosition((w/2),(h/2));


			// draw image to cache to canvas
			animationObjects[name](cacheCanvas, position);

			// cache the canvas with drawing on it ( drawings cached by their class name )
			app.cache[name] = smallCanvas;

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
				var x = ( w / 2 ); // offset of small canvas drawing ( since the drawing is larger then single grid square it needs to be centered )
				var y = ( h / 2 );
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
							canvas.drawImage( app.cache[name], s.x - x, s.y - y );
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
			}
		};
	},

	setAnimationRepo: function (repo){
		this.animationRepo = repo;
		return this;
	},

	// create canvas interaction
    init : function (element, context) {
		
		// default and temporary variable storage
		var temp = { 
			selectActive: false,
			cursorMoved: true,
			path:[]
		};
		var plain = { def: 1 };
		var terrainIndex = [];
     	var canvas = document.getElementById(element);

		// check if browser supports canvas
		if ( canvas.getContext ){

			// if the context is not set, default to 2d
			app.ctx = context === undefined || context === null ? '2d' : context;
			var abs = Math.abs;

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

			calculate = {

				offset: function (off, orig) {
					var ret = [];
					var inRange = function( obj ){
						if( abs( obj.x - orig.x) + abs( obj.y - orig.y ) <= orig.movement && obj.x >= 0 && obj.y >= 0 ){
							return true;
						}
						return false;
					};
					if ( app.inArray( off.obsticle, orig.movable )){
						var opX = off.x < orig.x ? -1 : 1;
						var opY = off.y < orig.y ? -1 : 1;
						var x = ( orig.x + ( orig.movement * opX ) - ( off.cost * opX ) + opX);
						var y = ( orig.y + ( orig.movement * opY ) - ( off.cost * opY ) + opY);
						var objX = { x:x , y:off.y };
						var objY = { x:off.x, y:y };
						if ( inRange(objX) ) ret.push(objX);
						if ( inRange(objY) ) ret.push(objY);
					}else{
						ret.push({ x: off.x, y: off.y });
					}
					return ret;
				},
				
				path: function ( orig, dest, grid, mode ){
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
				},

				// calculate the movement costs of terrain land marks etc..
				evalOffset: function ( origin, dest, grid ) {

					var range = [];

					for ( var i = 0; i < dest.length; i += 1 ) {

						var g = grid.slice( 0 );

						var path = this.path( origin, dest[i], g, 'subtract' );

						if ( path ) range.push( path );
					}

					return range;
				},

				move: function (  move, range ) {

					for ( var o = 0; o < range.length; o += 1 ) {

						if ( range[o].x === move.x && range[o].y === move.y ) {
							return true;
						}
					}
					return false;
				},

				// create a range of movement based on the unit allowed square movement
				range: function ( origin, x, y ) {

					// calculate the difference between the current cursor location and the origin, add the operation on the axis being moved on
				    return abs( abs((origin.x + x ) - origin.x ) + abs(( origin.y + y ) - origin.y ));
				},

				movement: function (type, index) {
					var xmove = abs( temp.selectedUnit.x - app.settings.cursor.x );
					var ymove = abs( temp.selectedUnit.y - app.settings.cursor.y );
					app.map.unit[temp.selectedUnit.ind].movement -= xmove + ymove;
				}
			},

			// methods that move things
			movement = {

				scrol: function ( incriment,  axis, operation ) {

					var refresh = function(){ // refresh the postions on the screen of all the units/terrain/buildings/etc
						window.requestAnimationFrame(app.animateTerrain);
						window.requestAnimationFrame(app.animateBuildings);
						window.requestAnimationFrame(app.animateUnit);
					};
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
				},

				limit: function ( axis, operation ){
					var oAxis = axis === 'x' ? 'y' : 'x';
					var a = {};
					var d = app.map.dimensions;

					a[axis] = app.settings.cursor[axis] + operation;
					a[oAxis] = app.settings.cursor[oAxis];

					if ( calculate.move( a, temp.range ) && a[axis] >= 0 && a['x'] <= d.x && a['y'] <= d.y ){
					    app.settings.cursor[axis] += operation;
					    return app.settings.cursor;
					}
					return false;
				},

			    setRange: function () {
					if( temp.selectedUnit ){

						var id = 0; // id for gvarp identificaion;
						var range = [];
						var offs = [];
						var selected = temp.selectedUnit;

						// amount of allotted movement for uvarnit
						var len = selected.movement;

						// loop through x and y axis range of movement
						for (var ex = -len; ex <= len; ex += 1){
							for (var wy = -len; wy <= len; wy += 1 ){

								// return cost of each movement
								var cost = calculate.range( selected, ex, wy );

								// if movement cost is less then or eual to the allotted movement then add it to the range array
								if ( cost <= selected.movement ){
									// incremient id
									id += 1;

									// add origin to range of movement values
									var x = selected.x + ex;
									var y = selected.y + wy;

									// locate obsticles									
									var obsticle = this.findObsticles(x, y);	

									if ( obsticle !== undefined ){

										// get the number of offset movement from the obsticle based on unit type and obsticle type
										var offset = app.settings.obsticleStats[obsticle.obsticle][temp.selectedUnit['type']];
									
										if ( offset !== undefined ){
											if ( selected.x === x && selected.y === y ) {
												range.unshift({ x: x, y: y, cost:0, g:0, f:0, ind:0, id:id, type:'highlight'});
											}else{
												// make an array of offset values, starting point, plus movement, and the amount of offset beyond that movement
												obsticle.cost = offset;
												obsticle.id = id;
												range.push(obsticle);
												offs = offs.concat(calculate.offset(obsticle, selected));
											}
										}
									}else{
										range.push({ x: x, y: y, cost:1, id:id, type:'highlight'});
									}
								}
							}
						}
						temp.range = app.offsetArray( range, calculate.evalOffset( selected, offs, range ));
					}
					return this;
				},

				findObsticles: function ( x, y ) {
					for (var ot = 0; ot < app.settings.obsticleTypes.length; ot += 1 ){
						var obs = select.gridPoint( app.settings.obsticleTypes[ot], x, y);
						if ( obs.stat === true ){
							return app.map[obs.objectClass][obs.ind];
						}
					}
				},

   				cursor: function ( axis, comparison, operation ) {
   					if ( temp.selectedBuilding === undefined ){

	   					var cursor = app.settings.cursor[axis]; // cursor location

	   					this.scrol( cursor + operation, axis, operation ); // handle scrolling

						if( temp.selectedUnit ){
							var result = this.limit( axis, operation );
							if ( result ){
								undo.effect('path');
								effects.displayPath({ x: result.x, y: result.y });
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
					return false;
				},

				// moves a unit that has been selected
				move: function (type, index) {
					if ( temp.selectedUnit && temp.selectActive && app.settings.keyMap.select in app.keys ){
						calculate.movement( type, index );
						app.map[type][index].x = app.settings.cursor.x;
						app.map[type][index].y = app.settings.cursor.y;
						undo.keyPress();
						undo.selectElement();
						undo.effect('highlight').effect('path');
						return true;
					}
					return false;
				}
			};

			effects = {
				displayPath: function (cursor){
					var grid = temp.range.slice(0);
					var p = calculate.path( temp.selectedUnit, cursor, grid);
					if ( p ) app.effect.path = app.effect.path.concat(p);
					window.requestAnimationFrame(app.animateEffects);
				},
				displayRange: function () {
					app.effect.highlight = app.effect.highlight.concat(temp.range);
					window.requestAnimationFrame(app.animateEffects);
				}
			};

			undo = {

				keyPress: function (key) {
					if (app.keys.splice(key,1)) return true
					return false;
				},

				selectElement: function () {
					if( temp.range ) temp.range.splice(0,temp.range.length);
					temp.selectActive = false;
					if ( temp.selectedUnit ){
						delete temp.selectedUnit;
						window.requestAnimationFrame(app.animateUnit);
					}
					if ( temp.selectedElement ) delete temp.selectedElement;
					if ( temp.selectedBuilding ) delete temp.selectedBuilding;
					if ( temp.unitSelectionIndex ) delete temp.unitSelectionIndex;
					if ( temp.prevIndex ) delete temp.prevIndex;
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
					var remove = document.getElementById('buildUnitScreen');
					if ( remove ) remove.parentNode.removeChild(remove);
					return this;
				},

				all: function () {
					this.keyPress(app.settings.keyMap.select);
					this.buildUnitScreen();
					this.selectElement();
					this.effect('highlight').effect('path');
				}
			};

			build = { 

				// create new unit if/after one is selected
				unit: function ( building, unitType, player ) {
					var newUnit = { x: building.x, y: building.y, obsticle: 'unit', player: player };
					var unit = app.units[building.type][unitType].properties;
					var properties = Object.keys( unit );
					for ( var p = 0; p < properties.length; p += 1 ) {
						newUnit[properties[p]] = unit[properties[p]]; // this may cause issues if pointers are maintained to original object properties, probly not, but keep en eye out
					}
					return newUnit;
				},
			};

			// methods that select things
			select = {

				element: function ( type, index ) {
					//  if the index input is undefined or false then use the current cursor location
					if ( index === undefined || index === false ){
					
							var hover = select.gridPoint(type);

						// if the selectable status is not false and the map element is defined then select it
						if ( hover !== undefined && hover.stat !== false ){
							select.hovered( type, hover.ind );
						}
					}else{
						// if there is an index supplied then use it allong with the type
						select.hovered( type, index );
					}

					// if an object was selected then return true, otherwise return false
					if ( temp.selectedUnit ) {
						return true;
					}
					return false;
				},

				hovered: function (type, index) {

					// create key value pairs that name selectedObject by type
					var objectClass = { building: 'selectedBuilding', unit: 'selectedUnit' };

					// if their is not a selection active and the cursor is not hovering over empty terrain, 
					// then do the following when the select key is pressed
					if ( temp.selectActive === false && type !== 'terrain' && app.settings.keyMap.select in app.keys  ) {

						// set properties for selected object
						temp[objectClass[type]] = app.map[type][index];
						temp[objectClass[type]].objectClass = type;
						temp[objectClass[type]].ind = index;
						undo.keyPress(app.keys.select);

						// if the selected object is a unit, do unit stuff
						if ( temp.selectedUnit ) {
							movement.setRange(); // set range of movement
							effects.displayRange(); // highlight rang of movemet

						// otherwise do building stuff
						}else{
							hud.selectionInterface( temp.selectedBuilding.type, 'unitSelectionIndex' );
						}

						// remove the terrain info display
						undo.displayHUD();
						temp.selectActive = true;
						return true;
					}
				},

				// check what is occupying a specific point on the game map based on type
				gridPoint: function(type, x, y) {
					x = x === null || x === undefined || x === false ? app.settings.cursor.x : x;
					y = y === null || y === undefined || y === false ? app.settings.cursor.y : y;

					var arr = app.map[type];
					for( var p = 0; p < arr.length; p += 1) {
						if( arr[p].x === x && arr[p].y === y ){
							return { ind:p, objectClass:type, stat:true };
						}
					}
	    			return { objectClass:type, stat:false };
	   			}
	   		};

			hud = {

				selectionInterface: function ( building, tag ){

					// build the outside screen container
					var buildUnitScreen = document.createElement( 'section' );
					buildUnitScreen.setAttribute( 'id', 'buildUnitScreen' );

					// build inner select screen
					var selectUnitScreen = document.createElement( 'div' );
					selectUnitScreen.setAttribute( 'id', 'selectUnitScreen' );

					// get the selectable unit types for the selected building
					var units = app.units[building];

					// get each unit type for looping over
					unitTypes = Object.keys(units);

					for ( u = 0; u < unitTypes.length; u += 1 ){

						// create list for each unit with its cost
						var unitList = this.createList( units[unitTypes[u]], unitTypes[u], app.settings.unitSelectionDisplay );
						unitList.setAttribute( tag, u + 1 );

						// add list to the select screen
						selectUnitScreen.appendChild(unitList);
					}

					// add select screen to build screen container
					buildUnitScreen.appendChild(selectUnitScreen);

					// insert build screen into dom
					document.body.insertBefore(buildUnitScreen, document.getElementById('before'));
				},

				options: function () {

				},

				coStatus: function () {

				},

				action: function () {

				},

				terrainInfo: function ( info ) {

					// if there is a selectable element then return its info
					if( info !== undefined && info.stat !== false ){
						return { ul:hud.createList( app.map[info.objectClass][info.ind], info.objectClass, app.settings.hoverInfo ), ind:info.ind };

					// if there is nothing found it means that it is plains, return the default of the plain object
					}else if ( info.objectClass === 'terrain' ){
						return { ul:hud.createList( app.map.plain, info.objectClass, app.settings.hoverInfo ), ind:false};
					}
					return false;
				},

				createList: function ( object, id, displayedAttributes ) {

					// get a list of property names
					var properties = Object.keys(object);

					// create an unordered list and give it the specified id
					var ul = document.createElement('ul');
					ul.setAttribute("id", id);

					// go through each property and create a list element for ivart, then add it to the ul;
					for (var i = 0; i < properties.length; i += 1 ){
						
						// properties
						temp.uProps = properties[i];

						// only use properties specified in the displayed attributes array
						if( app.inArray( temp.uProps, displayedAttributes ) && typeof(object[temp.uProps]) !== 'object' ) {
							var li = document.createElement('li');
							li.setAttribute('class', temp.uProps );
							li.innerHTML = object[temp.uProps];
							ul.appendChild(li);
						}
					}
					return ul;
				},

				select: function ( tag, id, selected ) {

					// if the index is undefined set it to one
					if ( temp.unitSelectionIndex === undefined ) temp.unitSelectionIndex = 1;

					// all the ul children from the selected element for highlighting
					var hudElement = document.getElementById(id)
					var elements = hudElement.getElementsByTagName('ul');
					var len = elements.length;

					// if the index is not the same as it was prior, then highlight the new index ( new element )
					if( temp.prevIndex !== temp.unitSelectionIndex ){
						temp.selectedElement = this.findElementByTag( tag, temp.unitSelectionIndex, elements );
						if ( temp.selectedElement ) {
							temp.selectedElement.style.backgroundColor = 'tan';
							if ( temp.prevIndex ){
								var prevElement = this.findElementByTag( tag, temp.prevIndex, elements );
								prevElement.style.backgroundColor = '';
							}
						}
						temp.prevIndex = temp.unitSelectionIndex;
					}
					console.log(app.keys);

					if( app.settings.keyMap.select in app.keys && temp.selectedElement ){

						return temp.selectedElement.getAttribute('id');

					}else if( app.settings.keyMap.down in app.keys ) {

						if ( temp.unitSelectionIndex <= len ) temp.unitSelectionIndex += 1;
						undo.keyPress(app.settings.keyMap.down);

					}else if( app.settings.keyMap.up in app.keys ) {

						temp.unitSelectionIndex -= 1;
						undo.keyPress(app.settings.keyMap.up);
					}
					console.log(temp.unitSelectionIndex);
					return false;				
				},

				findElementByTag: function ( tag, index, element ) {
					var len = element.length;
					for ( var e = 0; e < len ; e += 1 ){
						// element returns a string, so must cast the index to string for comparison
						if( element[e].getAttribute(tag) === index.toString()){
							return element[e];
						}
					}
				},

				// display informavartion on currently selected square, and return selectable objects that are being hovered over
				displayHUD: function () {

					// unset cursor move
					temp.cursorMoved = false;

					// create hud element or remove the existing element
					var exists = document.getElementById( 'hud' );
					var display = document.createElement( 'div' );
					display.setAttribute( 'id', 'hud' );
					
					// array holds what properties should exist in hud
					// array of map elements, ordered by which will be selected and displayed over the other
					var properties = [];
					var selected = [ 'unit', 'building', 'terrain'];

					// move through each possible map element, display informavartion to 
					// the dom and return info on selectable map elements
					for ( var x = 0; x < selected.length; x += 1 ){

						// check if the currsor is over the map element type, 
						// if so get the coordinates and info on the map element
						var hovering = hud.terrainInfo(select.gridPoint(selected[x]));

						// if the cursor is over the current map element...
						if( hovering ){

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
					var displayWidth = properties.length > 1 ? app.settings.hudWidth * 2 : app.settings.hudWidth;
					display.setAttribute( 'width', displayWidth );
					display.setAttribute('height', app.settings.hudheight );
					if ( exists ) {
						exists.parentNode.replaceChild( display, exists );
					}else{
						document.body.insertBefore( display, document.getElementById("before"));
					}
					return object;
				}
			};
			
			return {

				building: function (player) {
					var player = 1; // temporary
					var building = temp.selectedBuilding;
					if ( building ) {
						var unit = hud.select( 'unitSelectionIndex', 'selectUnitScreen', building.type );
						if ( unit ) {
							app.map.unit.push( build.unit( building, unit, player )); // player still needs to be figured out, change this when it is
							undo.all(); // removes the selection screen and variables created during its existance
							temp.cursorMoved = true; // refreshes the hud system to detect new unit on map;
							window.requestAnimationFrame(app.animateUnit);
						}
					}
					return this;
				},

				exit: function (exit) { // on press of the exit key ( defined in app.settings.keyMap ) undo any active select or interface
					if ( app.settings.keyMap.exit in app.keys ){
						undo.all();
					}
					return this;
				},

				// displays all huds
				displayInfo: function () {
					// if the cursor has been moved, and a selection is active then get the display info for the new square
					if ( temp.cursorMoved && temp.selectActive === false ) this.hovered = hud.displayHUD();
					return this;
				},

				// allows selection and moving of objects on screen
				interact: function (type) {

					// if theres no input then say so
					if ( this.hovered === undefined && type === undefined ){
						throw new Error('no type or input specified, please enter a type of map element into the input of the "interact()" method or chain the "info()" method prior to the "interact()" method');
						return false;
					// if there is an object being hovered over, or hovered is undefined ( meaning input is possibly from type input rather then hud )
					}else if ( this.hovered || this.hovered === undefined ) {

						// get the type of object being hovered over
						var typ = type === undefined ? this.hovered.objectClass : type

						// get the index of the object being hovered over
						var intInd = this.hovered === undefined ? undefined : this.hovered.ind;

						// if the map element is selectable and the selected map element is a unit then facilitate interaction with that unit
						if( select.element( typ, intInd ) && temp.selectedUnit ){
							movement.move( 'unit', temp.selectedUnit.ind );
						}
					}
					return this;
				},

				// keep track of cursor position
				move: function () {

					// cursor speed
					var delay = !app.settings.cursor.speed ? 50 : app.settings.cursor.speed;

					if ( !app.cursorTimeKeeper ){
						app.cursorTimeKeeper = new Date();
					}

					var now = new Date() - app.cursorTimeKeeper;

					if ( now > delay ){
						// map dimensions
						var d =  app.map.dimensions; 

						if (app.settings.keyMap.up in app.keys) { // Player holding up

						// if the cursor has moved store a temporary varibale that expresses this @ temp.cursorMoved
							temp.cursorMoved = movement.cursor('y',0,-1); 
						}
						if (app.settings.keyMap.down in app.keys) { // Player holding down
							temp.cursorMoved = movement.cursor('y',d.y, 1); 
						}
						if (app.settings.keyMap.left in app.keys) { // Player holding left
							temp.cursorMoved = movement.cursor('x',0,-1);
						}
						if ( app.settings.keyMap.right in app.keys) { // Player holding right
							temp.cursorMoved = movement.cursor('x',d.x, 1);
						}
						app.cursorTimeKeeper = new Date();
					}	
					return this;
				},

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
					var drawings = app.accessAnimationRepo( animate, { width: screenWidth, height: screenHeight }, gridSquareSize);
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
	},
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
		x:15, 
		y:10 
	},
	dimensions: { x:20, y:20 },
	plain: { type:'plain', def: 1 },
	terrain: [
		{x:1,y:7, type:'tallMountain', obsticle:'mountain', def:2},
		{x:2,y:5, type:'tallMountain', obsticle:'mountain', def:2},
		{x:3,y:4, type:'tallMountain', obsticle:'mountain', def:2},
		{x:8,y:5, type:'tallMountain', obsticle:'mountain', def:2},
		{x:1,y:1, type:'tallMountain', obsticle:'mountain', def:2},
		{x:1,y:5, type:'tree', obsticle:'wood', def:3},
		{x:1,y:6, type:'tree', obsticle:'wood', def:3},
		{x:1,y:8, type:'tree', obsticle:'wood', def:3},
		{x:3,y:5, type:'tree', obsticle:'wood', def:3},
		{x:6,y:2, type:'tree', obsticle:'wood', def:3},
		{x:6,y:3, type:'tree', obsticle:'wood', def:3},
		{x:9,y:5, type:'tree', obsticle:'wood', def:3},
		{x:9,y:6, type:'tree', obsticle:'wood', def:3},
	],
	building: [
		//{ x:0, y:5, type:'base', player:1, color: 'red' , def:4},
		//{ x:15, y:5, type:'base', player:2, color: 'blue' , def:4},
		{ x:0,y:4, type:'base', obsticle:'building', player:1,color:'red', def:4},
		{ x:15,y:4, type:'base', obsticle:'building', player:2, color:'blue', def:4}
	],
	unit:[
		{ x:2, y:5, type:'infantry', obsticle:'unit', movable: app.settings.movable.foot, movement:3, player: 1, health:10, ammo:10 ,fuel:100, id: 1 }
	]
};

/* --------------------------------------------------------------------------------------*\
	
	app.units is a repo for the units that may be created on the map, it holds all their
	stats and is organized by which building type can create them

\* --------------------------------------------------------------------------------------*/

app.units = {
	base: {
		infantry: {
			properties: { type:'infantry', movement:3, vision:2, range:{ lo: 1, hi: 1 }, movable: app.settings.movable.foot, health:10, ammo:10 ,fuel:99 },
			name: 'Infantry',
			cost: 1000
		},
		mech: {
			properties: { type:'mech', movement:2, vision:2, range:{ lo: 1, hi: 1 }, movable: app.settings.movable.foot, health:10, ammo:10 ,fuel:70 },
			name: 'Mech',
			cost: 3000
		},
		recon: {
			properties: { type:'recon', movement:8, vision: 5, range:{ lo: 1, hi: 1 }, movable: app.settings.movable.wheels, health:10, ammo:10 ,fuel:80 },
			name: 'Recon',
			cost: 4000
		},
		apc: {
			properties: { type:'apc', movement:6, vision: 1, range:{ lo: 1, hi: 1 }, movable: app.settings.movable.wheels, health:10, fuel:70 },
			name: 'APC',
			cost: 5000
		},
		antiAir: {
			properties: { type:'anitAir', movement:6, vision: 2, range:{ lo: 1, hi: 1 }, movable: app.settings.movable.wheels, health:10, ammo:10 ,fuel:60 },
			name: 'Anti-Aircraft',
			cost: 8000
		},
		tank: {
			properties: { type:'tank', movement:6, vision: 3, range:{ lo: 1, hi: 1 },movable: app.settings.movable.wheels, health:10, ammo:10 ,fuel:60 },
			name: 'Tank',
			cost: 7000
		},
		midTank: {
			properties: { type:'midTank', movement:5, vision: 1, range:{ lo: 1, hi: 1 }, movable: app.settings.movable.wheels, health:10, ammo:10 ,fuel:50 },
			name: 'Mid Tank',
			cost: 16000
		},
		artillery: {
			properties: { type:'artillery', movement:5, vision: 1, range:{ lo: 2, hi: 3 }, movable: app.settings.movable.wheels, health:10, ammo:10 ,fuel:50 },
			name: 'Artillery',
			cost: 6000
		},
		rockets: {
			properties: { type:'rockets', movement:5, vision: 1, range:{ lo: 3, hi: 5 }, movable: app.settings.movable.wheels, health:10, ammo:10 ,fuel:50 },
			name: 'Rockets',
			cost: 15000
		},
		missles: {
			properties: { type:'missles', movement:4, vision: 1, range:{ lo: 3, hi: 5 }, movable: app.settings.movable.wheels, health:10, ammo:10 ,fuel:50 },
			name: 'Missles',
			cost: 12000
		},	
		neoTank: {
			properties: { type:'neoTank', movement:6, vision:1 , range:{ lo: 1, hi: 1 }, movable: app.settings.movable.wheels, health:10, ammo:10 ,fuel:99 },
			name: 'Neo Tank',
			cost: 22000
		}
	},
	airport: {
		tCopter: {
			properties: { type:'tCopter', movement:6, vision:2, range:{ lo: 1, hi: 1 }, movable: app.settings.movable.flight, health:10, fuel:99, fpt:2 },
			name: 'T-Copter',
			cost: 5000
		},
		bCopter: {
			properties: { type:'bCopter', movement:6, vision:3 , range:{ lo: 1, hi: 1 }, movable: app.settings.movable.flight, health:10, ammo:10 ,fuel:99, fpt:1 },
			name: 'B-Copter',
			cost: 9000
		},
		fighter: {
			properties: { type:'fighter', movement:9, vision:2 , range:{ lo: 1, hi: 1 }, movable: app.settings.movable.flight, health:10, ammo:10 ,fuel:99, fpt:5 },
			name: 'Fighter',
			cost: 20000
		},
		bomber: {
			properties: { type:'bomber', movement:7, vision:2 , range:{ lo: 1, hi: 1 }, movable: app.settings.movable.flight, health:10, ammo:10 ,fuel:99, fpt:5 },
			name: 'Bomber',
			cost: 22000
		}
	},
	seaport:{
		lander: {
			properties: { type:'lander', movement:6, vision:1 , range:{ lo: 1, hi: 1 }, movable: app.settings.movable.flight, health:10, fuel:99, fpt:1 },
			name: 'Lander',
			cost: 12000
		},
		cruiser: {
			properties: { type:'cruiser', movement:6, vision:3, range:{ lo: 1, hi: 1 }, movable: app.settings.movable.flight, health:10, ammo:10 ,fuel:99, fpt:1 },
			name: 'Cruiser',
			cost: 18000
		},
		submerine: {
			properties: { type:'submerine', movement:5, vision:5 , range:{ lo: 1, hi: 1 }, movable: app.settings.movable.flight, health:10, ammo:10 ,fuel:60, fpt:1, divefpt:5 },
			name: 'Submerine',
			cost: 20000
		},
		bShip: {
			properties: { type:'bShip', movement:5, vision:2 , range:{ lo: 2, hi: 6 }, movable: app.settings.movable.flight, health:10, ammo:10 ,fuel:99, fpt:1 },
			name: 'B-Ship',
			cost: 28000
		}
	}
};

/* --------------------------------------------------------------------------------------------------------*\

	app.init sets up a working canvas instance to the specified canvas dom element id, it is passed the id
	of a canvas element that exists in the dom and takes care of initialization of that canvas element

\*---------------------------------------------------------------------------------------------------------*/

app.bg = app.init('background');
app.ter = app.init('landforms');
app.build = app.init('buildings');
app.effe = app.init('effects');
app.uni = app.init('units');
app.weath = app.init('weather');
app.curs = app.init('cursor');

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
	app.build.setAnimations(app.drawBuildings);
	app.build.render(app.animateBuildings);
};

app.animateUnit = function () {
	app.uni.setAnimations(app.drawUnits);
	app.uni.render(app.animateUnit);
};

app.animateBackground = function () {
	app.bg.setAnimations(app.drawBackground);
	app.bg.render();
};

app.animateTerrain = function () {
	app.ter.setAnimations(app.drawTerrain);
	app.ter.render();
};

app.animateCursor = function () {
	app.curs.setAnimations(app.drawCursor)
		.move() // controls movement of cursor
		.displayInfo() // controls hud display
		.interact() // controls selection and interaction with map elements
		.building() // allows building of units etc
		.exit() // allows exiting of the menus at any time
		.render(app.animateCursor); // basically main game loop ( cursor constantly checks for activity )
};

app.animateEffects = function (){
	app.effe.setAnimations(app.drawEffects);
	app.effe.render();
};

/* --------------------------------------------------------------------------------------------------------*\

	draw calls all the animate functions, putting everything together on the screen

\*---------------------------------------------------------------------------------------------------------*/

app.run = function () {
	app.animateBackground();
	app.animateTerrain();
	app.animateBuildings();
	app.animateUnit();
	app.animateCursor();
};

/* --------------------------------------------------------------------------------------------------------*\

	app.objects is the default object repo the 'm' parameter is a method passed from app.accessAnimationRepo 
	that scales the coordinates of the drawings to fit any grid square size, as well as providing some 
	functionality like random(), which generates random numbers within the specified range of numbers. 

	'm' does not have to be used

	default is a base of 64 ( 64 X 64 pixles ), the base is set as a perameter of initializing the 
	app.accessAnimationRepo();

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
		// dimensions 
		plain: function (canv, m) {
			canv.fillStyle = "#d6f71b";
			canv.strokeStyle = "black";
			canv.beginPath();
			canv.lineTo( m.r(m.w), m.y);
			canv.lineTo( m.r(m.w), m.u(m.h));
			canv.lineTo(m.x,m.u(m.h));
			canv.lineTo(m.x,m.y);
			canv.fill();
			canv.stroke();
			canv.strokeStyle = "#f2ff00";
			canv.beginPath();
			for (var rand = 0; rand < width; rand +=1 ){
				var randomHeight = m.random( m.y, m.u(m.h) );
				var randomWidth = m.random( m.x, m.r(m.w) );
				canv.moveTo( randomWidth, randomHeight );
				canv.lineTo( randomWidth + 4, randomHeight );
			}
			canv.stroke();
			canv.strokeStyle = "black";
			canv.beginPath();
			canv.lineTo( m.r(m.w), m.y);
			canv.lineTo( m.r(m.w), m.u(m.h));
			canv.lineTo(m.x,m.u(m.h));
			canv.lineTo(m.x,m.y);
			canv.stroke();
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
