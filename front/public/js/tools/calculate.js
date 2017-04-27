/* ----------------------------------------------------------------------------------------------------------*\
    
    Calculate.js handles necessary game calculations 

\* ----------------------------------------------------------------------------------------------------------*/

"use strict";

function calculate() {

    const
        abs = Math.abs,
        floor = Math.floor,
        random = Math.random,
        round = Math.round,
        rand = () => floor((random() * 9) + 1);

    return {

        random: (range) => Math.floor(Math.random() * range),
        distance: (a, b) => abs(a.x - b.x) + abs(a.y - b.y),
        arrayDifferance(firstArray, secondArray) {

            return firstArray.reduce((difference, element) =>  {

                if (!secondArray.hasValue(element)) {

                    difference.push(element);
                }

                return difference;

            }, []);
        },
        countOfEachBuildingType(buildings) {

            return buildings.reduce((typeCount, building) => {

                const typeOfBuilding = building.type;

                if (!typeCount[typeOfBuilding]) {

                    typeCount[typeOfBuilding] = 0;
                }

                typeCount[typeOfBuilding] += 1;

                return typeCount;

            }, {});
        },
        longestArray(arrays) {

            return arrays.reduce((longestArray, currentArray) => {

                return longestArray.length < currentArray.length ? currentArray : longestArray;

            }, []);
        },
        damage(attacked, attacker) {

            const
                healthScaler = 10,
                defenseScaler = 200,
                percentageDevisor = 100,
                randomNumber = rand(),
                toPercent = (amount) => (amount / percentageDevisor),

                nameOfAttackedUnit = attacked.name().toLowerCase(),
                mapOfDamageBasedOnUnitTypes = attacker.baseDamage(),

                coAttackBoost = attacker.player().co.attack(attacker),
                coDefenseBoost = attacked.player().co.defense(attacked),
                terrainDefenseBoost = attacked.occupies().defense() || 1,

                healthOfAttacker = (attacker.health() / healthScaler),
                healthOfDefender = attacked.health(),

                damage = mapOfDamageBasedOnUnitTypes[nameOfAttackedUnit] + coAttackBoost,
                defense = healthOfDefender + coDefenseBoost + terrainDefenseBoost,

                totalDamage = abs(toPercent(damage) + randomNumber),
                totalDefense = abs(toPercent(defenseScaler - defense));

            return round(healthOfAttacker * totalDamage * totalDefense);
        }
    };
}

module.exports = calculate();