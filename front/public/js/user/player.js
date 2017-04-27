Score = require('../definitions/score.js');

module.exports = function (user) {

    return {
        
        name: user.first_name,
        id: user.id,
        score: new Score(),
        co: user.co || null,
        id: user.id,
        gold: 0,
        special: 0,
        ready: user.ready || false,
        number: user.number,
        isComputer: false
    };
};