/* ----------------------------------------------------------------------------------------------------------*\
    
    Calculate.js handles necessary game calculations 

\* ----------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.settings = require('../settings/game.js');
app.map = require('../controller/map.js');
app.screen = require('../controller/screen.js');

module.exports = function () {

    var abs = Math.abs;
    var floor = Math.floor;
    var random = Math.random;
    var round = Math.round;

    var rand = function(){return floor((random() * 9) + 1)};

    return {

        arrayDifferance: function (array1, array2) {
            var array = [];
            for (var push, h = 0; h < array1.length; h += 1){
                push = true;
                for(var l = 0; l < array2.length; l += 1)
                    if(array1[h] === array2[l])
                        push = false;
                if(push) array.push(array1[h]);
            }
            return array;
        },

        distance: function (a, b) { return abs(a.x - b.x) + abs(a.y - b.y); },

        numberOfBuildings: function(map) {

            // get selected maps building list
            var type, all = map.buildings, buildings = {};

            if (!all) return false;

            // add one for each building type found  to the building display list
            for (var n = 0; n < all.length; n += 1) {
                type = all[n].type;
                if (type !== 'hq') {
                    if (isNaN(buildings[type])) buildings[type] = 1;
                    else buildings[type] += 1; 
                }
            }
            return buildings;
        },

        longestLength: function (arrays) {
            var i, longest = arrays[0], length = arrays.length;
            if(length > 1)
                for (i = 1; i < length; i += 1)
                    if(arrays[i].length > longest.length)
                        longest = arrays[i];
            return longest.length;
        },

        damage:  function (attacked, attacker) {

            var r = rand();
            var baseDamage = attacker.baseDamage()[attacked.name().toLowerCase()];
            var coAttack = attacker.player().co.attack(attacker);
            var coDefense = attacked.player().co.defense(attacked);
            var terrainDefense = attacked.occupies().defense() || 1;

            // return the health of the attacker, multiplied by
            return round((attacker.showHealth()/10)

                // absolute value of the amount of damage, multiplied by the co attack and a random number
                * abs(baseDamage * coAttack/100 + r)

                // absolute valye of the defense of co, plus the terrain defense bonus, 
                // plus the health of the unit, subtracted from 200, all divided by one hundred
                * abs((200-(coDefense + terrainDefense * attacked.showHealth()))/100));
        },
        
        random: function(range) { return Math.floor(Math.random() * range); }
    };
}();