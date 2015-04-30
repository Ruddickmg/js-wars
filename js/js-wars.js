window.addEventListener("keydown", function (e) {
	app.keys[e.keyCode] = true;
}, false);

window.addEventListener("keyup", function (e) {
	app.keys[e.keyCode] = false;
	app.keys.splice(e.keyCode, 1);
	delete app.keys[e.keyCode];
}, false);

app = {	

	inArray: function (value, array) {
  		return array.indexOf(value) > -1;
	},

	objectArrayCompare:function ( array1, array2, values ){
		v.len = values.length - 1;
		for ( z = 0; z < array1.length; z += 1 ){
			for ( n = 0; n < array2.length; n += 1 ){
				for ( x = 0; x <= v.len; x += 1 ){
					if( array1[z][values[x]] === array2[n][values[x]] && values[x] === v.len ) return true;
				}
			}
		}
		return false;
	},

	// remove one arrays values from another
	offsetArray: function (array, offsetArray) {
		for ( z = 0; z < offsetArray.length; z += 1 ){
			for ( n = 0; n < array.length; n += 1 ){
				if ( array[n].x === offsetArray[z].x && array[n].y === offsetArray[z].y ){
					array.splice(n,1);
				}
			}
		}
		return array;
	},

	findKey: function ( key ) {
		for(i = 0; i < app.keys; i += 1 ){
			if( app.keys[i].keyCode === key ){
				return i;
			}
		}
		return false;
	},

	settings:{

		// types to look through when determining terrains effect on unit movement
		obsticleTypes: ['unit', 'terrain'],

		// list of the effects each obsticle has on each unit type
		obsticleStats: {
			mountain: {
				infantry: 1
			},
			wood: {
				infantry: 2
			},
			plain: {
				infantry: 0
			},
			building: {
				infantry:0
			},
			unit:{
				infantry:0
			}
		},

		// dimensions of diplay hud
		hudWidth:120,
		hudHeight:200,

		// which attributes of objects ( unit, buildings etc ) will be displayed in hud
		displayedAttributes: ['ammo','health','type','fuel','def'],
		
		// cursor settings
		cursor: {
			x:6,
			y:4,
			speed:50
		},

		// keyboard settings
		keyMap:{
			select:13,
			up:38,
			down:40,
			left:37,
			right:39
		}
	},

	keys:[],
	players:[],
	
	// animation objects
	objects: function ( canvas, dimensions, base ) {

		var temp = {};

		var random = function (min, max) {
 			 return (Math.random() * (max - min)) + min;
		};

		var base = base === null || base === undefined ? 64 : base;

		if( dimensions === null || dimensions === undefined ){
			var w = 64;
			var h = 64;
		}else{
			var width = dimensions.width;
			var height = dimensions.height;	
			var w = width / 15;
			var h = height / 10;		
		}

		var calcBase = function ( d ) {
			return d / base;
		};

		var scale = function ( type, value ) {
			var multiple = type === 'w' ? calcBase(w) : calcBase(h);
			return value === null || value === undefined ? multiple : multiple * value;
		};

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
				y:y
			};
		};

		obj = {
			cursor: function () {
				var m = temp.pos;

				// size of cursor corners
				var size = 15;

				canvas.strokeStyle = "black";
				canvas.fillStyle = "#fff536";
				canvas.beginPath();
				// bottom left
				canvas.moveTo(m.l(3),m.u(size));
				canvas.lineTo(m.l(3),m.d(3));
				canvas.lineTo(m.r(size),m.d(3));
				canvas.lineTo(m.l(3),m.u(size));
				// bottem right
				canvas.moveTo(m.r(67),m.u(size));
				canvas.lineTo(m.r(67),m.d(3));
				canvas.lineTo(m.r(64-size),m.d(3));
				canvas.lineTo(m.r(67),m.u(size));
				// top right
				canvas.moveTo(m.r(67),m.u(64-size));
				canvas.lineTo(m.r(67),m.u(67));
				canvas.lineTo(m.r(64-size),m.u(67));
				canvas.lineTo(m.r(67),m.u(64-size));
				// bottem left
				canvas.moveTo(m.l(3),m.u(64-size));
				canvas.lineTo(m.l(3),m.u(67));
				canvas.lineTo(m.r(size),m.u(67));
				canvas.lineTo(m.l(3),m.u(64-size));
				canvas.fill();
				canvas.stroke();
			},

			highlight: function () {
				var m = temp.pos;
				canvas.fillStyle = "rgba(255,255,255,0.3)";
				canvas.beginPath();
				canvas.lineTo( m.r(w), m.y);
				canvas.lineTo( m.r(w), m.u(h));
				canvas.lineTo(m.x,m.u(h));
				canvas.lineTo(m.x,m.y);
				canvas.fill();
			},

			path: function () {
				var m = temp.pos;
				canvas.fillStyle = "rgba(255,0,0,0.5)";
				canvas.beginPath();
				canvas.lineTo( m.r(w), m.y);
				canvas.lineTo( m.r(w), m.u(h));
				canvas.lineTo(m.x,m.u(h));
				canvas.lineTo(m.x,m.y);
				canvas.fill();
			},

			// dimensions 
			plain: function () {
				var m = temp.pos;
				canvas.fillStyle = "#d6f71b";
				canvas.strokeStyle = "black";
				canvas.beginPath();
				canvas.lineTo( m.r(w), m.y);
				canvas.lineTo( m.r(w), m.u(h));
				canvas.lineTo(m.x,m.u(h));
				canvas.lineTo(m.x,m.y);
				canvas.fill();
				canvas.stroke();
				canvas.strokeStyle = "#f2ff00";
				canvas.beginPath();
				for ( rand = 0; rand < width; rand +=1 ){
					var randomHeight = random( m.y, m.u(h) );
					var randomWidth = random( m.x, m.r(w) );
					canvas.moveTo( randomWidth, randomHeight );
					canvas.lineTo( randomWidth + 4, randomHeight );
				}
				canvas.stroke();
				canvas.strokeStyle = "black";
				canvas.beginPath();
				canvas.lineTo( m.r(w), m.y);
				canvas.lineTo( m.r(w), m.u(h));
				canvas.lineTo(m.x,m.u(h));
				canvas.lineTo(m.x,m.y);
				canvas.stroke();
			},

			tallMountain: function () {
				var m = temp.pos;
				canvas.strokeStyle = "#41471d";
				canvas.fillStyle = "#ff8800";
				canvas.beginPath();
				canvas.moveTo( m.x, m.u(20));
				canvas.lineTo(m.x,m.u(30));
				canvas.lineTo(m.r(5), m.u(45));
				canvas.quadraticCurveTo( m.r(15), m.u(50), m.r(15), m.u(50));
				canvas.moveTo(m.r(10),m.u(35));
				canvas.lineTo(m.r(20),m.u(67));
				canvas.quadraticCurveTo(m.r(25), m.u(78),m.r(52),m.u(67));
				canvas.lineTo(m.r(62),m.u(34));
				canvas.quadraticCurveTo(m.r(68),m.u(20),m.r(38),m.y);
				canvas.quadraticCurveTo(m.r(22),m.y,m.x,m.u(20));
				canvas.fill();
				canvas.stroke();
			},

			shortMountain: function () {
				var m = temp.pos;
				canvas.strokeStyle = "#41471d";
				canvas.fillStyle = "#ff8800";
				canvas.beginPath();
				canvas.moveTo( x, m.u(10));
				canvas.lineTo( m.r(20), m.u(h));
				canvas.lineTo( m.r(40), m.u(h));
				canvas.lineTo( m.r(w), m.u(10));
				canvas.quadraticCurveTo( m.r(31), m.d(9), m.r(5), m.u(10));
				canvas.quadraticCurveTo( m.r(20));
				canvas.fill();
				canvas.stroke();
			},

			tree: function () {
				var m = temp.pos;
				canvas.strokeStyle = "black";
				canvas.fillStyle = "rgb(41,148,35)";
				canvas.beginPath();
				//bottom
				canvas.moveTo(m.r(21), m.u(15));
				canvas.quadraticCurveTo(m.r(42),m.d(1),m.r(60),m.u(15));
				canvas.quadraticCurveTo(m.r(74),m.u(25), m.r(59),m.u(33));
				canvas.moveTo(m.r(21), m.u(15));
				canvas.quadraticCurveTo(m.r(16),m.u(20),m.r(29),m.u(30));
				//middle
				canvas.moveTo(m.r(27),m.u(30));
				canvas.quadraticCurveTo(m.r(42),m.u(20), m.r(60), m.u(34));
				canvas.quadraticCurveTo(m.r(58),m.u(34), m.r(50), m.u(43));
				//canvas.quadraticCurveTo(m.r(58),m.u(38), m.r(50), m.u(43));
				canvas.moveTo(m.r(27),m.u(30));
				canvas.quadraticCurveTo(m.r(34), m.u(34),m.r(37),m.u(40));
				//top
				canvas.moveTo(m.r(35), m.u(40));
				canvas.quadraticCurveTo(m.r(44), m.u(35), m.r(51), m.u(41));
				canvas.quadraticCurveTo(m.r(52), m.u(43), m.r(42), m.u(50));
				canvas.moveTo(m.r(35), m.u(40));
				canvas.quadraticCurveTo(m.r(40),m.u(42),m.r(42), m.u(50));
				canvas.fill();
				canvas.stroke();
			},

			infantry: function () {
				var m = temp.pos;
				canvas.fillStyle = "blue";
				canvas.beginPath();
				canvas.arc(m.r(32),m.u(32),10,0,2*Math.PI);
				canvas.fill();
			}
		};

		return {

			// place drawings where they belong on board based on coorinates
			coordinate: function ( objectClass ,object, coordinet ) {
				coordinates = coordinet === undefined ? app[objectClass][object] : coordinet;
				for ( c = 0; c < coordinates.length; c += 1 ){
					var objec = objectClass === 'map' && coordinet === undefined ? coordinates[c].type : object;
					temp.pos = setPosition(coordinates[c].x * w, coordinates[c].y * h);
					obj[objec]();
				}
			},

			// fills background
			background: function ( object ) {
			for ( x = 0; x < app.map[object].x; x += 1 ) {
				for( y = 0;  y < app.map[object].y; y += 1 ) {
						temp.pos = setPosition( x * w, y * h );
						obj[app.map[object]['type']](); 
					}
				}
			}
		};
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
			var ctx = context === undefined || context === null ? '2d' : context;

			// get the canvas context and put canvas in screen
			var animate = canvas.getContext(ctx);

	     	// get width and height
			var sty = window.getComputedStyle(canvas);
			var padding = parseFloat(sty.paddingLeft) + parseFloat(sty.paddingRight);
			var screenWidth = canvas.clientWidth - padding;
			var screenHeight = canvas.clientHeight - padding;
   			
   			var screenClear = function () {
				animate.clearRect(0, 0, screenWidth, screenHeight);
			};

			calculate = {

				path: function (x,y){
					var o = temp.selectedObject;
					var operationX = x < o.x ? -1 : 1;
					var operationY = y < o.y ? -1 : 1;
					var pathType = 'path';
					var p = app.effect.path;
					var ex = o.x + ( Math.abs( o.x - x ) * operationX );
					var wy = o.y + ( Math.abs( o.y - y ) * operationY );
					for( i = 0; i < p.length; i += 1 ){
						if( p[i].x === ex && p[i].y === wy ){
							app.effect.path.splice(i, p.length);
						}
					}
					app.effect.path.push({ x:ex, y:wy, type:pathType });
					console.log(app.effect.path);
					window.requestAnimationFrame(app.animateEffects);
					return this;
				},

				offset: function ( x, y, offset ) {
					
					var so = temp.selectedObject;
					var offCalc = function ( origin, movement, addition ){
						if ( origin < addition ) {
							return movement - offset; 
						} else if ( origin === addition ) {
							return 0; 
						}else {
							return offset - movement;
						}
					};

					var xOff = offCalc( so.x, so.movement, x );
					var yOff = offCalc( so.y, so.movement, y );

					return {x:( so.x + xOff ), y:( so.y + yOff )};
				},

				move: function (  move, range ) {
					for( o = 0; o < range.length; o += 1 ){
						if( range[o].x === move.x && range[o].y === move.y ){
							return true;
						}
					}
					return false;
				},

				// create a range of movement based on the unit allowed square movement
				range: function ( origin, x, y ) {

					// calculate the difference between the current cursor location and the origin, add the operation on the axis being moved on
				    return Math.abs( Math.abs((origin.x + x ) - origin.x ) + Math.abs(( origin.y + y ) - origin.y ));
				},

				movement: function (type, index) {
					var xmove = Math.abs( temp.selectedObject.x - app.settings.cursor.x );
					var ymove = Math.abs( temp.selectedObject.y - app.settings.cursor.y );
					app.map.unit[temp.selectedObject.ind].movement -= Math.abs( xmove + ymove );
				}
			},

			// methods that move things
			movement = {

				limit: function ( axis, operation ){
					var oAxis = axis === 'x' ? 'y' : 'x';
					var attempt = {};

					attempt[axis] = app.settings.cursor[axis] + operation;
					attempt[oAxis] = app.settings.cursor[oAxis];

					if ( calculate.move( attempt, temp.range ) ){
					    app.settings.cursor[axis] += operation;
					    return app.settings.cursor;
					}
					return false;
				},

			    setRange: function () {
					if( temp.selectedObject !== undefined && temp.selectedObject.movement !== undefined ){

						var rArray = []; // holds rage values
						temp.offset = []; // holds offset values
						var selected = temp.selectedObject;

						// amount of allotted movement for unit
						var len = selected.movement;

						// loop through x and y axis range of movement
						for ( ex = -len; ex <= len; ex += 1){
							for ( wy = -len; wy <= len; wy += 1 ){

								// return cost of each movement
								var cost = calculate.range( selected, ex, wy );

								// if movement cost is less then or eual to the allotted movement then add it to the range array
								if ( cost <= selected.movement ){

									// add origin to range of movement values
									var x = selected.x + ex;
									var y = selected.y + wy;

									// locate obsticles									
									var obsticle = this.findObsticles(x, y);	

									if ( obsticle !== undefined ){
										// get the number of offset movement from the obsticle
										var offset = app.settings.obsticleStats[obsticle.obsticle][temp.selectedObject['type']];
									
										if ( offset !== undefined ){
											// make an array of offset values, starting point, plus movement, and the amount of offset beyond that movement
											temp.offset.push(calculate.offset( x, y, offset ));
										}
									}
									// add all values to array
									rArray.push({ x: x, y: y, type:'highlight'});
								}
							}
						}
						temp.range = app.offsetArray( rArray, temp.offset );
					}
					return this;
				},

				findObsticles: function ( x, y ) {
					for ( ot = 0; ot < app.settings.obsticleTypes.length; ot += 1 ){
						var obs = select.gridPoint( app.settings.obsticleTypes[ot], x, y);
						if ( obs.stat === true ){
							return app.map[obs.objectClass][obs.ind];
						}
					}
				},

   				cursor: function ( axis, comparison, operation ) {
					if( temp.selectedObject !== undefined && temp.selectedObject.movement !== undefined ){
						var result = this.limit( axis, operation );
						if ( result ){
							calculate.path(result.x, result.y);
							effects.displayPath();
							return true;
						}
						return false;
					}else if( operation < 0 ){
						if ( app.settings.cursor[axis] + operation > comparison ){
							app.settings.cursor[axis] += operation;
							return true;
						}
						return false;
					}else{
						if ( app.settings.cursor[axis] + operation < comparison ){
							app.settings.cursor[axis] += operation;
							return true;
						}
						return false;					
					}
				},

				// moves a unit that has been selected
				move: function (type, index) {
					if ( temp.selectedObject && temp.selectActive && app.settings.keyMap.select in app.keys ){
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
				displayPath: function (){
				},
				displayRange: function () {
					for (i = 0; i < temp.range.length; i += 1 ){
						app.effect.highlight.push(temp.range[i]);
					}
					window.requestAnimationFrame(app.animateEffects);
				}
			};

			undo = {
				keyPress: function () {
					if (app.keys.splice(app.findKey(app.keys.select),1)) return true
					return false;
				},

				selectElement: function () {
					temp.offset.splice(0,temp.offset.length);
					temp.range.splice(0,temp.range.length);
					temp.selectActive = false;
					delete temp.selectedObject;
					window.requestAnimationFrame(app.animateUnit);
				},

				effect: function (effect) {
					app.effect[effect].splice(0,app.effect[effect].length);
					window.requestAnimationFrame(app.animateEffects);
					return this;
				},
				displayHUD: function () {
					var remove = document.getElementById('hud');
					if ( remove ) remove.parentNode.removeChild(remove);
					return this;
				}
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
					if ( temp.selectedObject !== undefined ) {
						return true;
					}
					return false;
				},

				hovered: function (type, index) {
					if ( temp.selectActive === false && type !== 'terrain' && app.settings.keyMap.select in app.keys  ) {
						temp.selectedObject = app.map[type][index];
						temp.selectedObject.objectClass = type;
						temp.selectedObject.ind = index;
						movement.setRange();
						undo.displayHUD();
						effects.displayRange();
						app.keys.splice(app.findKey(app.keys.select),1);
						temp.selectActive = true;
						return true;
					}
				},

				// check what is occupying a specific point on the game map based on type
				gridPoint: function(type, x, y) {
					x = x === null || x === undefined || x === false ? app.settings.cursor.x : x;
					y = y === null || y === undefined || y === false ? app.settings.cursor.y : y;

					var arr = app.map[type];
					for( p = 0; p < arr.length; p += 1) {
						if( arr[p].x === x && arr[p].y === y ){
							return { ind:p, objectClass:type, stat:true };
						}
					}
	    			return { objectClass:type, stat:false };
	   			}
	   		};

			hud = {

				terrainInfo: function (info){

					// if there is a selectable element then return its info
					if( info !== undefined && info.stat !== false ){
						return { ul:hud.updateList( app.map[info.objectClass][info.ind], info.objectClass ), ind:info.ind};

					// if there is nothing found it means that it is plains, return the default of the plain object
					}else if ( info.objectClass === 'terrain' ){
						return { ul:hud.updateList( app.map.plain, info.objectClass ), ind:false};
					}
					return false;
				},

				updateList: function (object, id) {

					// get a list of property names
					var properties = Object.keys(object);

					// create an unordered list and give it the specified id
					var ul = document.createElement('ul');
					ul.setAttribute("id", id);

					// go through each property and create a list element for it, then add it to the ul;
					for ( i = 0; i < properties.length; i += 1 ){
						
						// properties
						temp.uProps = properties[i];
						
						// only use properties specified in the displayed attributes array
						if( app.inArray( temp.uProps, app.settings.displayedAttributes )) {
							var li = document.createElement('li');
							li.setAttribute("id", temp.uProps );
							li.innerHTML =  temp.uProps + ': ' + object[temp.uProps];
							ul.appendChild(li);
						}
					}
					return ul;
				},

				// display information on currently selected square, and return selectable objects that are being hovered over
				displayHUD: function () {

					// unset cursor move
					temp.cursorMoved = false;

					// create hud element or remove the existing element
					var exists = document.getElementById('hud');
					var display = document.createElement('div');
					display.setAttribute( 'id', 'hud' );
					
					// array holds what properties should exist in hud
					var properties = [];

					// array of map elements, ordered by which will be selected and displayed over the other
					var selected = [ 'unit', 'building', 'terrain'];

					// move through each possible map element, display information to 
					// the dom and return info on selectable map elements
					for ( x = 0; x < selected.length; x += 1 ){

						// check if the currsor is over the map element type, 
						// if so get the coordinates and info on the map element
						var hovering = hud.terrainInfo(select.gridPoint(selected[x]));

						// if the cursor is over the current map element...
						if( hovering ){

							// push the map element type into the props array so that
							// a diff can be performed between it and the current dom
							properties.push(selected[x]);

							// if the map element needs to be added to the dom then do so
							if( hovering.ul ){
								display.appendChild(hovering.ul);
							}

							// if the return value has not been set, ( meaning the previous map element is not being hovered over)
							// then set it for the current map element ( which is being hovered over )
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

				displayInfo: function () {
					if ( temp.cursorMoved && temp.selectActive === false ) this.hovered = hud.displayHUD();
					return this;
				},

				interact: function (type) {
					if ( this.hovered === undefined && type === undefined ){
						throw new Error('no type or input specified, please enter a type of map element into the input of the "interact()" method or chain the "info()" method prior to the "interact()" method');
						return false;
					}else if ( this.hovered !== false || this.hovered === undefined ) {
						var typ = type === undefined ? this.hovered.objectClass : type
						var intInd = this.hovered === undefined ? undefined : this.hovered.ind;
						if( select.element( typ, intInd ) && temp.selectedObject.objectClass === 'unit' ){
							movement.move( 'unit', temp.selectedObject.ind );
						}
					}
					return this;
				},

				// keep track of cursor position
				move: function () {

					// cursor speed
					var delay = app.settings.cursor.speed === undefined ? 50 : app.settings.cursor.speed;

					if ( app.cursorTimeKeeper === undefined ){
						app.cursorTimeKeeper = new Date();
					}

					var now = new Date() - app.cursorTimeKeeper;

					if ( now > delay ){

						var h =  (screenHeight / (screenHeight / 10 )) - 1; // ============> if width / 64 pixles is a whole number then use the whole number as divisor ? same with height ! <====
						var w = (screenWidth / (screenWidth / 15 )) -1; // =======================================================================================================================
						if (app.settings.keyMap.up in app.keys) { // Player holding up
							temp.cursorMoved = movement.cursor('y',0,-1);
						}
						if (app.settings.keyMap.down in app.keys) { // Player holding down
							temp.cursorMoved = movement.cursor('y',h, 1); 
						}
						if (app.settings.keyMap.left in app.keys) { // Player holding left
							temp.cursorMoved = movement.cursor('x',0,-1);
						}
						if ( app.settings.keyMap.right in app.keys) { // Player holding right
							temp.cursorMoved = movement.cursor('x',w, 1);
						}
						app.cursorTimeKeeper = new Date();
					}	
					return this;
				},

				// set the context for the animation, defaults to 2d
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
				render: function (){
					if( this.animations === undefined ){
						throw new Error('No animations were specified');
						return false;
					}
					screenClear();
					this.animations(animate);
				},

				// draw to canvas and loop it 
				loop: function (loop){

					if( this.animations === undefined ){
						throw new Error('No animations were specified');
						return false;
					}
					screenClear();
					this.animations(animate);
					window.requestAnimationFrame(loop);
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

app.effect = {
	highlight:[],
	path:[]
};

app.map = {
	background: { 
		type:'plain',
		x:15, 
		y:10 
	},
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
		{ x:0, y:5, type:'base', obsticle:'building', player:1, color: 'red' , def:4},
		{ x:15, y:5, type:'base', obsticle:'building', player:2, color: 'blue' , def:4},
		{ x:0,y:4, type:'barracks', obsticle:'building', player:1,color:'red', def:4},
		{ x:15,y:4, type:'barracks', obsticle:'building', player:2, color:'blue', def:4}
	],
	unit:[
		{ x:2, y:5, type:'infantry', obsticle:'unit', movement:3, player: 1, health:10, ammo:10 ,fuel:100, id: 1 }
	]
};

// for unit, should probly have an empty array, or object if necessary, if an array, the unit can be kept track of by its index
// if an object, type could be specified as its index ( maybe more useul but lose array methods ).. a new unit may be created
// and then stored in the array. other info could be stored in the object of the specific unit.. health, ammo, fuel, etc.. 
// when a unit is moved, the unit can be called by its index, removed from the array and have the new object info inserted into the array
app.unit = {
	add: function (unit) {
		app.unit.push(unit);
	},

	change: function (unit) {
		index = app.unit[unit.type].indexOf(unit);

		if (~index) {
	    	app.map.unit[unit.type] = unit;
		}
	}
};

app.bg = app.init('background');
app.build = app.init('buildings');
app.effe = app.init('effects');
app.uni = app.init('units');
app.weath = app.init('weather');
app.curs = app.init('cursor');

app.drawEffects = function (canvas) {
	var object = app.objects(canvas, app.effe.dimensions());
	object.coordinate('effect','highlight');
	object.coordinate('effect','path');
};

app.drawWeather = function ( canvas ){
	var object = app.objects(canvas, app.weath.dimensions());
};

app.drawBuildings = function (canvas){
	var object = app.objects(canvas, app.build.dimensions());
	object.coordinate( 'map', 'building');
};

app.drawUnit = function (canvas) {
	var object = app.objects(canvas, app.uni.dimensions());
	object.coordinate( 'map', 'unit');
};

app.drawCursor = function (canvas) {
	var object = app.objects(canvas, app.curs.dimensions());
	object.coordinate( 'map', 'cursor', [app.settings.cursor]);
};

app.drawMap = function (canvas) {
	var object = app.objects(canvas, app.bg.dimensions());
	object.background('background');
	object.coordinate( 'map', 'terrain');
};

app.animateBuildings = function () {
	app.build.setAnimations(app.drawBuildings);
	app.build.loop(app.animateBuildings);
};

app.animateUnit = function () {
	app.uni.setAnimations(app.drawUnit);
	app.uni.loop(app.animateUnit);
};

app.animateBackground = function () {
	app.bg.setAnimations(app.drawMap);
	app.bg.render();
};

app.animateCursor = function () {
	app.curs.setAnimations(app.drawCursor);
	app.curs.move()
		.displayInfo()
		.interact()
		.loop(app.animateCursor);
};

app.animateEffects = function (){
	app.effe.setAnimations(app.drawEffects);
	app.effe.render();
}

app.draw = function () {
	app.animateBackground();
	//app.animateBuildings();
	app.animateUnit();
	app.animateCursor();
};
