/* --------------------------------------------------------------------------------------*\
    
    creates map object

\* --------------------------------------------------------------------------------------*/

Validator = require('../tools/validator.js');

Map = function (id, name, players, dimensions, terrain, buildings, units) {

    var error, validate = new Validator('map');
    var category = units.length ? 'preDeployed' : {
        2:'two', 3:'three', 4:'four', 5:'five', 6:'six', 7:'seven', 8:'eight'
    } [players];

    this.id = id;
    this.name = name;
    this.players = players;
    this.category = category;
    this.dimensions = dimensions;
    this.terrain = terrain;
    this.buildings = buildings;
    this.units = units;
    if((error = validate.map(this)))
        throw error;
};
module.exports = Map;