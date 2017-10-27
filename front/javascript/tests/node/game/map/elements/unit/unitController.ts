// TODO figure out unit controller
/* ------------------------------------------------------------------------------------------------------*\
   
    controller/unit.js controls the updating, modification and actions performed on unit objects
   
\* ------------------------------------------------------------------------------------------------------*/

Validator = require("../tools/validator.js");
transmit = require("../sockets/transmitter.js");
composer = require("../tools/composition.js");
createDefaults = require("../definitions/defaults.js");
buildingController = require("../controller/building.js");
terrainDefaults = require("../definitions/properties.js");
buildingDefaults = require("../definitions/buildings.js");
unitDefaults = require("../definitions/units.js");
playerController = require("../controller/players.js");
curry = require("../tools/curry.js");

module.exports = function() {

  var validate = new Validator("controller/unit.js");
  var defaults = createDefaults(unitDefaults, buildingDefaults, terrainDefaults);

  var controller = composer.including([

    "player",
    "getPlayer",
    "owns",
    "on",
    "color",
    "health",
    "position",
    "type",
    "name",
    "defense",
    "co",
    "isUnit"

  ]).compose({

    /*
        returns the id of a unit object

        @unit = Object, unit
    */

    id: function(unit) {

      return unit.id;
    },

    /*
        returns a boolean as to whether a unit object is loaded or not

        @unit = Object, unit
    */

    isLoaded: function(unit) {

      var loaded = unit.loaded;

      return loaded && loaded.length;
    },

    /*
        returns the loaded elements of the passed in unit

        @unit = Object, unit
    */

    loaded: function(unit) {

      return unit.loaded;

      // return loaded && loaded.length ? loaded : false;
    },

    /*
        returns a boolean as to whether the passed in unit object is a ranged unit

        @unit = Object, unit
    */

    ranged: function(unit) {

      return defaults.inRange(unit).high > 1;
    },

    /*
        modifies a passed in unit (unit) by marking it as selected, then returns it

        @unit = Object, unit
    */

    select: function(unit) {

      unit.selectable = false;

      return unit;
    },

    ammo: function(unit) {

      return unit.ammo;
    },

    fuel: function(unit) {

      return unit.fuel;
    },

    movement: function(unit) {

      return unit.movement;
    },

    vision: function(unit) {

      return unit.vision;
    },

    refuel: function(unit) {

      unit.fuel = defaults.fuel(unit);

      return unit;
    },

    reload: function(unit) {

      unit.ammo = defaults.ammo(unit);

      return unit;
    },

    recover: function(unit) {

      unit.movement = defaults.movement(unit);
      unit.selectable = true;
      unit.attacked = false;
      unit.captured = false;
      unit.actions = {};
      unit.targets = [];
      unit.damage = [];
      unit.moved = 0;

      return unit;
    },

    needsRepair: function(unit) {

      var repairing, l = 3;
      var repair = ['health', 'fuel', 'ammo'];

      while (l--) {

        repairing = repair[l];

        if (unit[repairing] < defaults[repairing](unit)) {

          return true;
        }
      }

      return false;
    },

    repair: function(unit) {

      // address players getting in this function
      var player = this.getPlayer(unit);
      var cost = defaults.cost(unit) / 10;

      if (this.needsRepair(unit) && playerController.canPurchase(player, cost)) {

        playerController.purchase(player, cost);

        return composer.functions([
          this.heal(false),
          this.reload,
          this.refuel
        ], Object.assign(unit));
      }

      return unit;
    },

    previous: function(unit) {

      var moves = unit.moves;

      return moves[moves.length - 1];
    },

    attack: function(attacker, attacked, damage) {

      attacker.attacked = true;
      attacker.selectable = false;

      return this.damage(attacked, damage);
    },

    attacked: function(unit) {

      return unit.attacked;
    },

    resetTargets: function(unit) {

      unit.targets = [];

      return unit;
    },

    action: function(unit) {

      return unit.action;
    },

    getActions: function(unit) {

      var actions = unit.actions;

      return actions;
    },

    selectable: function(unit) {

      return unit.selectable;
    },

    occupies: function(unit) { // maybe change this

      var square = app.map.occupantsOf(this.position(unit));

      return square.building || square.terrain;
    },

    moveBack: function(unit) {

      var moved = unit.moved;

      if (moved) {

        this.move(this.previous(unit), -moved, unit);
      }
    },

    canTransport: function(unit2, unit1) {

      var loadable = this.canLoad(unit2);
      var type = this.name(unit1).toLowerCase();

      return loadable && loadable.indexOf(type) >= 0;
    },

    canLoad: function(unit) {

      return defaults.load(unit);
    },

    showAttackRange: function(unit) {

      if (this.ranged(unit)) {

        app.path.set(this.attackRange(unit));

      } else {

        var range = app.path.reachable(unit, defaults.movement(unit));
        var visited = app.path.visited();
        var neighbor, neighbors, length = range.length;

        for (var j, i = 0; i < length; i += 1) {

          neighbors = app.map.getNeighbors(this.position(range[i]));

          for (j = 0; j < neighbors.length; j += 1) {

            neighbor = neighbors[j];

            if (!visited.element(neighbor)) {

              visited.close(neighbor);
              range.push(neighbor);
            }
          }
        }

        app.path.clean();
        app.attackRange.set(range);
      }

      return unit;
    },

    attackRange: function(unit) {

      var array = [];

      var range = defaults.inRange(unit);

      var high = this.inRange(range.high, unit);

      var low = this.inRange(range.low - 1, unit);

      var push, l, h = high.length;

      while (h--) {

        push = true;

        l = low.length;

        while (l--) {

          if (this.on(this.position(low[l]), high[h])) {

            push = false;
          }
        }

        if (push) {

          array.push(high[h]);
        }
      }

      return array;
    }

    // turn: function () { <-- take out of unit object
    //
    //     return app.players.current().owns(this);
    // }

    // showHealth: function () { return Math.ceil(health / 10)}, <-- take out of object

  }, buildingController, playerController);


  /*--------------------------------------------------------------------------------------*\
  \\ all functions below are curried functions, they are declared seperately so that they //
  // can maintain the context of "this"                                                   \\
  \*--------------------------------------------------------------------------------------*/

  /*
      finds and returns either the index of a passed in unit (loaded), or negative 1 if it is not found,
      in the loaded array of a passed in unit (unit)

      @unit = Object, unit
      @loaded = Object, unit
  */

  controller.indexOfLoaded = curry(function(loaded, unit) {

    if (isNaN(loaded.id)) {

      throw new Error("Invalid unit id found in second argument of \"indexOfLoaded\".");
    }

    if (!unit.loaded) {

      throw new Error("Loaded property missing from unit in the first argument of \"indexOfLoaded\".");
    }

    var loaded = unit.loaded;

    var l = loaded.length;

    while (l--) {

      if (loaded[l].id === loaded.id) {

        return l;
      }
    }

    return -1;

  }.bind(controller));

  /*
      returns a boolean as to whether a unit object is within a specified range or not

      @unit = Object, unit
      @range = Array, [{x:Integer, y:integer}]
  */

  controller.inRange = curry(function(range, unit) {

    var l = range.length;

    while (l--) {

      if (this.on(range[l], unit)) {

        return true;
      }
    }

    return false;

  }.bind(controller));

  /*
      returns a an array of attackable units in a specified range (range),
      from a specified position (position),
      by a specified unit (unit)

      @unit = Object, unit
      @position = Object, {x:Integer, y:Integer}
      @range = Array, [position]
  */

  controller.attackable = curry(function(position, range, unit) { // changed so that it always returns an array, will have to check for length

    // get list of units
    var array = [];
    var l = range.length;

    while (l--) {

      element = range[l];

      if (this.type(element) === 'unit' && !this.owns(unit, element) && this.canAttack(unit, element)) {

        array.push(element);
      }
    }

    // if their are any units in the attackable array, then return it, otherwise return false
    return array;

  }.bind(controller));

  /*
      modifies a passed in unit (unit) by adding a passed in unit (passanger) to it's loaded array, then returns it

      @unit = Object, unit
      @passenger = Object, unit
  */

  controller.load = curry(function(unit, passanger) {

    if (isNaN(unit.id)) {

      throw new Error("Invalid unit id found in first argument of \"load\".", "controller/unit.js");
    }

    if (isNaN(passanger.id)) {

      throw new Error("Invalid unit id found in second argument of \"load\".", "controller/unit.js");
    }

    app.map.removeUnit(passanger);

    unit.loaded.push(passanger);

    if (app.user.turn()) { // <--- check out

      transmit.load(unit.id, passanger.id);

      this.select(unit);
    }

    console.log(unit);

    return unit;

  }.bind(controller));

  /*
      modifies a passed in unit (unit) by removing an element at the passed in index from its loaded array,
      then returns the removed element

      @unit = Object, unit
      @index = Integer
  */

  controller.unload = curry(function(index, unit) {

    if (isNaN(index)) {

      throw new Error("First argument \"index\" of \"unload\" must be an integer", "controller/unit.js");
    }

    if (!unit.loaded) {

      throw new Error("Loaded property missing from unit in the second argument of \"unload\".", "controller/unit.js");
    }

    if (!unit.loaded[index]) {

      throw new Error("Index supplied to \"unload\" is undefined in the loaded property.", "controller/unit.js");
    }

    return unit.loaded.splice(index, 1)[0];

  }.bind(controller));

  /*
      removes a unit from a passed in unit's (unit) loaded array at the passed in index (unloading),
      then modifies the removed unit, setting its position to the passed in position (target) and returns it

      @unit = Object, unit
      @unloading = Integer
      @target = Object, {x:Integer, y:Integer}
  */

  controller.drop = curry(function(unloading, target, unit) {

    if (isNaN(unloading)) {

      throw new Error("Second argument \"unloading\" of \"drop\" must be an integer.", "controller/unit.js");
    }

    if (!unit.loaded) {

      throw new Error("Loaded property missing from unit in the first argument of \"drop\".", "controller/unit.js");
    }

    if (validate.isCoordinate(target)) {

      throw new Error("Invalid target position supplied as third argument of \"drop\".", "controller/unit.js");
    }

    //  var index = isNaN(unloading) ? unit.loaded.indexOf(unloading) : unloading; // <-- extract logic

    var passanger = this.unload(unit, index);

    this.setPosition(passanger, new Position(target.x, target.y));

    this.select(passanger);

    // app.mapEditor.addUnit(unit); <-- take out of unit

    if (app.user.turn()) {

      transmit.unload(unit.id, target, index);

      this.select(unit);

      // figure this out.. (function defined doesnt belong in unit object)
      // this.deselect();
    }

    return passanger;

  }.bind(controller));

  /*
      returns a new unit with the combined health, ammo, and fuel of two passed in unit objects (unit1 and unit2)

      @unit = Object, unit
      @passenger = Object, unit
  */

  controller.join = curry(function(unit2, unit1) {

    if (this.type(unit1) !== this.type(unit2)) {

      throw new Error("Units must be of the same type to be joined.", "controller/unit.js");
    }

    // copy unit2
    var unit = Object.assign(unit2);
    var min = Math.min;

    // emit units to be combined to other players games for syncronization
    if (app.user.turn()) {

      transmit.join(unit1, unit2);
    }

    unit.health = min(unit1.health + unit2.health, defaults.health(unit1));
    unit.ammo = min(unit1.ammo + unit2.ammo, defaults.ammo(unit1));
    unit.fuel = min(unit1.fuel + unit2.fuel, defaults.fuel(unit1));

    // remove selected unit
    // app.mapEditor.removeUnit(this.raw()); <-- take out of unit object

    // FIGURE IT OUT!! <--- change method location
    // this.deselect();

    return unit;

  }.bind(controller));

  controller.damage = curry(function(damage, unit) {

    unit.health -= damage;

    return unit;

  }.bind(controller));

  controller.moved = curry(function(position, path, unit) {

    if (isNaN(path.length)) {

      throw new Error("Second argument of \"moved\" must be an array.", "controller/unit.js");
    }

    var moved = 0, len = path.length;

    for (var i = 1; i < len; i += 1) {

      moved += this.moveCost(path[i], unit);

      if (this.on(position, path[i])) {

        return moved;
      }
    }

    return moved;

  }.bind(controller));

  controller.move = curry(function(target, moved, unit) { // try to make functional

    if (!isArray(unit.moves)) {

      throw new Error("The \"moves\" property in argument \"unit\" of \"move\" must be an array.", "controller/unit.js");
    }

    if (isNaN(unit.movement)) {

      throw new Error("Unit in argument \"unit\" of \"move\" has an Invalid \"movement\" property, \"movement\" must be represented as an integer.", "controller/unit.js");
    }

    if (isNaN(unit.fuel)) {

      throw new Error("Unit in argument \"unit\" of \"move\" has an Invalid \"fuel\" property, \"fuel\" must be represented as an integer.", "controller/unit.js");
    }

    if (isNaN(unit.id)) {

      throw new Error("Invalid unit id found in argument \"unit\" of \"move\".", "controller/unit.js");
    }

    var position = this.position(unit);

    unit = composer.functions([

      this.setMovement(this.movement(unit) - moved),
      this.setFuel(this.fuel(unit) - moved),
      this.setMoved(moved),
      this.resetTargets

    ], unit);

    // change selected units position to the specified location
    unit = app.map.moveUnit(unit, new Position(target.x, target.y));

    // track how much fuel has been used
    this.getPlayer(unit).score.fuel(moved);

    // save move
    if (moved < 0) {

      this.removeMove(unit);

    } else if (moved > 0) {

      this.addMove(position, unit);
    }

    return unit;

  }.bind(controller));

  controller.setAction = curry(function(action, unit) {

    unit.action = action;

    return unit;

  }.bind(controller));

  controller.setActions = curry(function(actions, unit) {

    unit.actions = actions;

    return unit;

  }.bind(controller));

  controller.getTargets = curry(function(targets, neighbors, index, unit) {

    if (this.isLoaded(unit)) {

      var neighbor, l = neighbors.length;

      while (l--) {

        neighbor = neighbors[l];

        if (this.isUnit(neighbor) || this.canLoad(unit)) {

          targets.push(neighbor);
        }
      }
    }

    return isNaN(index) ? targets : targets[index];

  }.bind(controller));

  controller.setMovement = curry(function(movement, unit) {

    unit.movement = movement;

    return unit;

  }.bind(controller));

  controller.setFuel = curry(function(fuel, unit) {

    unit.fuel = fuel;

    return unit;

  }.bind(controller));

  controller.setMoved = curry(function(moved, unit) {

    unit.moved = moved;

    return unit;

  }.bind(controller));

  controller.setTargets = curry(function(targets, unit) {

    unit.targets = targets;

    return unit;

  }.bind(controller));

  controller.addMove = curry(function(move, unit) {

    if (!isArray(unit.moves)) {

      throw new Error("\"moves\" property on argument \"unit\" in \"addMove\" must be an array.", "controller/unit.js");
    }

    unit.moves.push(new Position(move.x, move.y));

    return unit;
  });

  controller.removeMove = curry(function(move, unit) {

    if (!isArray(unit.moves)) {

      throw new Error("\"moves\" property on argument \"unit\" in \"removeMove\" must be an array.", "controller/unit.js");
    }

    unit.moves.pop();

    return unit;
  });

  controller.targets = curry(function(neighbors, index, unit) {

    return this.getTargets(targets, neighbors, index, unit);

  }.bind(controller));

  controller.target = curry(function(index, unit) {

    if (isNaN(index)) {

      throw new Error("Invalid index supplied in second argument of \"target\".", "controller/unit.js");
    }

    if (!unit.damage) {

      throw new Error("Damage parameter is missing from unit in first argument of \"target\".", "controller/unit.js");
    }

    if (!unit.damage[index]) {

      throw new Error("Damage calculation is undefined at index from unit supplied as first argument of \"target\".", "controller/unit.js");
    }

    // edit this maybe... use try catch

    return unit.damage[index] !== undefined ? unit.damage[index] :
      (unit.damage[index] = app.calculate.damage(app.map.getNeighbors(this.position(unit)), unit));

  }.bind(controller));

  controller.heal = curry(function(health, unit) {

    unit.health = Math.min(unit.health + (health || 1), defaults.health(unit));

    return unit;

  }.bind(controller));

  controller.setTargets = curry(function(targets, unit) {

    unit.targets = targets;

    return unit;

  }.bind(controller));

  controller.movementCost = curry(function(obsticle, unit) {

    return defaults.movementCosts(unit)[obsticle];

  }.bind(controller));

  controller.canAttack = curry(function(attacked, attacker) {

    return !this.canLoad(attacker) && defaults.canAttack(attacker)
      .indexOf(defaults.transportaion(attacked)) >= 0;

  }.bind(controller));

  controller.canCapture = curry(function(building, unit) {

    // if the selected unit can capture buildings then continue
    return defaults.capture(unit)
      && buildingController.isBuilding(building)
      && !this.owns(building, unit)
      && this.on(building, unit);

  }.bind(controller));

  controller.canBuildOn = curry(function(location, unit) {

    return this.movementCost(location, unit) < defaults.movement(unit);

  }.bind(controller));

  controller.moveCost = curry(function(obsticle, unit) {

    if (this.isUnit(obsticle)) {

      if (this.owns(obsticle, unit)) {

        obsticle = this.occupies(obsticle);

      } else {

        return this.movement(unit);
      }
    }

    return defaults.movementCost(unit, obsticle);

  }.bind(controller));

  controller.canCombine = curry(function(unit2, unit1) {

    // check if the unit being landed on belongs to the current players and is not the same unit
    return unit1 && unit2 && this.isUnit(unit1) && this.isUnit(unit2) && !this.isSame(unit1, unit2)

      // check if is the same unit type and can be joined
      && ((this.name(unit1) === this.name(unit2) && this.health(unit1) < defaults.health(unit1)

        // check if is a valid transport and capable of transporting
        || this.canTransport(unit2, unit1) && this.loaded(unit2).length < defaults.maxLoad(unit2)));

  }.bind(controller));

  controller.actions = curry(function(target, unit) {

    var exists = false;

    var attackable = this.attackable(
      terrainController.position(target),
      this.attackRange(unit),
      unit
    );

    var actions = {

      attack: attackable.length > 0 ? attackable : false,
      capture: this.canCapture(target, unit),
      drop: this.loaded(unit) || false
    };

    var player = this.getPlayer(unit); // maybe extract this.

    if (this.isUnit(target) && playerController.isTurn(player) && this.canCombine(target, unit)) {

      exists = true;

      if (this.name(target) === this.name(unit)) {

        actions.join = target;

      } else {

        actions.load = target;
      }
    }

    actions.wait = !actions.load;

    return actions.attack
    || actions.capture
    || actions.drop
    || actions.wait
    || exists ?
      actions : false;

  }.bind(controller));

  controller.inRange = curry(function(allowed, unit) {

    var allowed = allowed || this.movement(unit);
    var position = this.position(unit);
    var dimensions = app.map.dimensions();
    var range = (allowed * 2);
    var right = position.x + allowed;
    var left = position.x - allowed;
    var array = [], abs = Math.abs;

    // get the diamond pattern of squares
    for (var i, y, t, b, x = left, inc = 0; x <= right, inc <= range; x += 1, inc += 1) {

      i = inc > allowed ? range - inc : inc;
      t = (t = position.y - i) > 0 ? t : 0; // top
      b = (b = position.y + i) < dimensions.y ? b : dimensions.y - 1; // bottom

      // add all reachable squares to array
      if (x >= 0 && x <= dimensions.x) {

        for (y = t; y <= b; y += 1) {

          array.push(app.map.top(new Position(x, y))); // <-- maybe seperate concerns
        }
      }
    }

    return array;

  }.bind(controller));

  controller.movementRange = curry(function(distance, unit) {

    var range = [];
    var reachable = app.path.reachable(unit);
    var l = reachable.length;

    while (l--) {

      if (this.on(this.position(reachable[l]), unit)) {

        range.unshift(reachable[l]);

      } else if (!this.isUnit(reachable[l]) || this.owns(unit, reachable[l])) {

        range.push(reachable[l]);
      }
    }

    app.path.clean();

    return range;

  }.bind(controller));

  controller.inAttackRange = curry(function(unit2, unit1) {

    return this.inRange(unit2, this.attackRange(unit1));

  }.bind(controller));

  controller.inMovementRange = curry(function(unit2, unit1) {

    return this.inRange(unit2, this.movementRange(false, unit1));

  }.bind(controller));

  /*
      modifies the passed in unit, setting its position then returning it

      @unit = Object, unit
      @position = Object, {x:Integer, y:Integer}
  */

  controller.setPosition = curry(function(position, unit) {

    var error = validate.isCoordinate(position);

    if (error) {

      throw error;
    }

    unit.position = new Position(position.x, position.y);

    return unit;

  }.bind(controller));

  return controller;
}();