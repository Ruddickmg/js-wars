/* ---------------------------------------------------------------------- *\
    
    Terrain.js holds the terrain object, defining specific map terrain

\* ---------------------------------------------------------------------- */

app = require('../settings/app.js');
app.properties = require('../definitions/properties.js');
Position = require('../objects/position.js');
Validator = require('../tools/validator.js');
MapElement = require('../map/mapElement.js');
terrainDefaults = require("../definitions/properties.js");
buildingDefaults = require("../definitions/buildings.js");
unitDefaults = require("../definitions/units.js");
createDefaults = require("../definitions/defaults.js");

module.exports = function (type, position) {

    var defaults = createDefaults(unitDefaults, buildingDefaults, terrainDefaults);

	var error, validate = new Validator("terrain.js");
    
    // if ((error = (validate.mapElementType(type) || validate.isCoordinate(position)))) {

    //     console.log(position);
    //     console.log("type: "+type);

    //     throw error;
    // }

    return {
        
        type: "terrain",
        orientation:"",
        name: defaults.name(type),
        draw: type,
        position: new Position(position.x, position.y)
    };
};