/* ---------------------------------------------------------------------- *\
    
    Obsticles.js holds the each possible object for the map 

\* ---------------------------------------------------------------------- */

var obsticle = require('../map/obsticle.js');

module.exports = {
    mountain: obsticle('mountain', 2),
    wood: obsticle('wood', 3),
    building: obsticle('building', 2),
    plain: obsticle('plain', 1),
    snow: obsticle('snow', 1),
    unit: obsticle('unit', 0)
};