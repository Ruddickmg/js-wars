import {Position} from "../../coordinates/position";
import {Building} from "../../game/map/elements/building/building";
import {Unit} from "../../game/map/elements/unit/unit";

export default function calculate() {

    const abs = Math.abs;
    const floor = Math.floor;
    const random = Math.random;
    const round = Math.round;
    const rand = () => floor((random() * 9) + 1);

    return {

        distanceBetweenTwoPositions: (a: Position, b: Position) => abs(a.x - b.x) + abs(a.y - b.y),
        arrayDifference(firstArray: any[], secondArray: any[]): any[] {

            const elementsInSecondArray = secondArray.reduce((elements, element) => {

                elements[element] = true;
            }, {});

            return firstArray.filter((element: any): boolean => {

                return !elementsInSecondArray[element];
            });
        },
        longestArray(...arrays: any[][]): any[] {

            return arrays.reduce((longestArray, currentArray) => {

                return longestArray.length < currentArray.length ? currentArray : longestArray;

            }, []);
        },
        countOfEachBuildingType(buildings: Building[]) {

            return buildings.reduce((typeCount: any, building: Building) => {

                const typeOfBuilding = building.type;

                if (!typeCount[typeOfBuilding]) {

                    typeCount[typeOfBuilding] = 0;
                }

                typeCount[typeOfBuilding] += 1;

                return typeCount;

            }, {});
        },
        damage(attacked: Unit, attacker: Unit) {

            const healthScaler = 10;
            const defenseScaler = 200;
            const percentageDivisor = 100;
            const randomNumber = rand();

            const toPercent = (amount: number) => (amount / percentageDivisor);
            const nameOfAttackedUnit = attacked.name().toLowerCase();
            const mapOfDamageBasedOnUnitTypes = attacker.baseDamage();

            const coAttackBoost = attacker.playerNumber().co.attack(attacker);
            const coDefenseBoost = attacked.playerNumber().co.defense(attacked);
            const terrainDefenseBoost = attacked.occupies().defense() || 1;

            const healthOfAttacker = (attacker.health() / healthScaler);
            const healthOfDefender = attacked.health();

            const damage = mapOfDamageBasedOnUnitTypes[nameOfAttackedUnit] + coAttackBoost;
            const defense = healthOfDefender + coDefenseBoost + terrainDefenseBoost;

            const totalDamage = abs(toPercent(damage) + randomNumber);
            const totalDefense = abs(toPercent(defenseScaler - defense));

            return round(healthOfAttacker * totalDamage * totalDefense);
        },
    };
}
