/* --------------------------------------------------------------------------------------*\
    
    Obsticle.js is a generic object with methods common to all map obsticles

\* --------------------------------------------------------------------------------------*/

module.exports = function (type, defense) {
    this.type = function () { return type };
    this.defense = function () { return defense };
};