/* --------------------------------------------------------------------------------------*\
    
    Obsticle.js is a generic object with methods common to all map obsticles

\* --------------------------------------------------------------------------------------*/

module.exports = function (type, defense) {

	return {
		type: type,
		defense: defense
	};
};