/* ------------------------------------------------------------------------------------------------------*\
   
    unit.js creates new units 
   
\* ------------------------------------------------------------------------------------------------------*/

app = require("../settings/app.js");
app.increment = require("../tools/increment.js");

Position = require("../objects/position.js");
createDefaults = require("../definitions/defaults.js");
terrainDefaults = require("../definitions/properties.js");
buildingDefaults = require("../definitions/buildings.js");
unitDefaults = require("../definitions/units.js");

module.exports = function (type, position, player) {

    if (isNaN(player)) {

        throw new Error("Invalid player number supplied in third argument of unit.", "map/unit.js");
    }

    if (isNaN(position.x) || isNaN(position.y)) {

        throw new Error("Invalid position supplied in second argument of unit.", "map/unit.js");
    }

    var defaults = createDefaults(unitDefaults, buildingDefaults, terrainDefaults);

    if (typeof(type) !== "string" || !defaults.find(type)) {

        throw new Error("Invalid type supplied in first argument of unit.", "map/unit.js");
    }

    var identity = {

        type: "unit",
        name: type
    };

    return composer.exclude(["type", "health", "index"]).compose({

        type: "unit",
        name: type,
        id: app.increment.id(),
        player: player,
        position: new Position(position.x, position.y),
        actions: {},
        targets: [],
        damage: [],
        health: defaults.health(identity),
        ammo: defaults.ammo(identity),
        fuel: defaults.fuel(identity),
        vision: defaults.vision(identity),
        movement: 0,
        selectable: false,
        loaded: defaults.loaded(identity),
        moves: [],
        moved: 0,
        action: false

    }, createBuilding(type, position, player));
};