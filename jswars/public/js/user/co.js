/* --------------------------------------------------------------------------------------*\
    
    holds all co"s, their skills and implimentation

\* --------------------------------------------------------------------------------------*/

app = require("../settings/app.js");

module.exports = function () {

    var percent = function (amount) {

        return amount / 100;
    };

    var addToEach = function(player, funk, property, amount, parameter1, parameter2, parameter3) {

        if (!parameter) {

            parameter = 100;
        }

        var units = app.map.unit;

        for (var u = 0; u < units.length; u += 1) {

            if (units[u].player === player.id) {

                app.map.unit[u][property] = funk( unit[u], property, amount, parameter1, parameter2, parameter);
            }
        }
    };

    var editProperty = function(unit, property, amount, parameter) {

        if (unit[property] + amount > parameter) {

            return parameter;
        
        } else {
            
            return unit[property] + amount;
        }
    };

    var filter = function (unit, property, amount, max, parameter1, parameter2) {

        if (unit[parameter1] === parameter2) {
            
            if (unit[property] + amount > max) {
                
                return max;
            
            } else {

                return unit[property] + amount;
            }
        }
    };

    var editRange = function (unit, property, amount) {

        if (unit.damageType === "ranged") {

            unit.range.hi += amount;
            
            return unit.range;
        }
    };

    var editArray = function (unit, property, amount, parameter1, parameter2) {

        var baseDamage = {};
        var damage = Object.keys(unit[property]);

        for (var d = 0; d < damage.length; d += 1 ) {
 
            // if there is no perameter then simply find the percentage added to all units
            if (!parameter1) {

                var dam = unit[property][damage[d]];

                // add the damage plus the percent of increase
                baseDamage[damage[d]] *= amount;

            // if there is a parameter then only add to the damage type specified in the perameter
            } else if ( unit[parameter1] === parameter2 ) {

                var dam = unit[property][damage[d]];
                baseDamage[damage[d]] *= amount
            }
        }
        return baseDamage;
    };

    return {

        andy: function (player) {

            var image = "red";
            var special = 100;
            var powerActive = false;
            var superPowerActive = false;
            var damage = 100;

            return {

                image: image,
                name:"Andy",

                power: function() {

                    addToEach(player, editProperty(), "health", 2, 10);
                },

                superPower: function() {

                    superPowerActive = true;
                    addToEach(player, editProperty(),"health", 5, 10);
                    addToEach(player, editProperty(),"movement", 1);
                    special = 130;
                },

                attack: function() {

                    return damage * percent(special);
                },

                defense: function() {

                    return 100;
                },

                endPower: function() {

                    if (superPowerActive) {
                    
                        addToEach(player, editProperty(),"movement", -1);
                        special = 100;
                        superPowerActive = false;
                    }
                }
            }
        },

        max: function (player) {

            var image = "blue";
            var damage = 100;
            var special = 120;
            var powerActive = false;
            var superPowerActive = false;  

            return {

                image: image,

                name:"Max",

                power: function() {

                    powerActive = true;
                    special = 140;
                },

                superPower: function() {

                    powerActive = true;
                    special = 170;
                },

                attack: function(unit) {

                    if (unit.damageType === "direct") {

                        return damage * percent(special);

                    }else{

                        return damage;
                    }
                },

                defense: function() {

                    return 100;
                },

                endPower: function() {

                    if (powerActive) {
                        special = 120;
                        powerActive = false;
                    }
                },

                build:function(unit){
                    unit.range.hi -= 1;
                    return unit;
                }
            }
        },

        sami: function (player) {

            var image = "green";
            var damage = 100;
            var special = 120;
            var powerActive = false;
            var superPowerActive = false;  
            var capSpecial = 150;
            var penalty = 90;

            return {

                image:image,
                name:"Sami",

                power: function () {

                    powerActive = true;
                    addToEach(player, filter(), "movement", 1, 20, "transportaion", "foot");
                    special = 170;
                },

                superPower:  function() {

                    superPowerActive = true;
                    addToEach(player, filter(), "movement", 2, 20, "transportaion", "foot");
                    special = 200;
                    capSpecial = 2000;
                },

                attack: function(unit){

                    if (unit.transportaion === "foot") {

                        return damage * percent(special);

                    } else if(unit.damageType === direct) {

                        return damage * percent(penalty);
                    }

                    return damage;
                },

                defense: function() {

                    return 100;
                },

                endPower: function() {

                    if (powerActive) {

                        addToEach(player, filter(), "movement", -1, 20, "transportaion", "foot");

                    } else if (superPowerActive) {

                        addToEach(player, filter(), "movement", -2, 20, "transportaion", "foot");
                    }

                    special = 120;
                },

                capture: function (capture) {

                    return capture * percent(capSpecial);
                }
            };
        }
    };
}();