/* ---------------------------------------------------------------------- *\
    
    Obsticles.js holds the each possible object for the map 

\* ---------------------------------------------------------------------- */

var obsticle = require('../objects/obsticle.js');

module.exports = {
    mountain: new obsticle('mountain', 2),
    wood: new obsticle('wood', 3),
    building: new obsticle('building', 2),
    plain: new obsticle('plain', 1),
    snow: new obsticle('snow', 1),
    unit: new obsticle('unit', 0)
};