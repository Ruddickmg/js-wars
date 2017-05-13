import buildingController from "./building/buildingController";
import {Unit} from "./unit/unit";
import {Building} from "./building/building";
import {Terrain} from "./terrain/terrain";

interface Element {

    name: string
    type: string
}

export type MapElement = Terrain | Building | Unit;

export default function(units, buildings, terrain) {

	const
        defaultHealth: number = 100,
		elements = {
            unit: units,
            building: buildings,
            terrain: terrain
        },
	    healing = {

            hq:["foot", "wheels"],
            city:["foot", "wheels"],
            base:["foot", "wheels"],
            seaport:["boat"],
            airport:["flight"]
        },
        get = (element: Element): any => {

	        const
                type = element.type.toLowerCase(),
                name = element.name.toLowerCase();

            return elements[type][name];
        },
        property = (element: Element): any => get(element).properties;

	return {

		name(type: string): string {

            return Object.keys(elements).reduce((nameOfElement,mapElement, mapElements) => {

                const
                    elements = mapElements[mapElement],
                    element = elements[type],
                    foundName: string = element.name,
                    nameNotFoundBefore: boolean = !nameOfElement;

                return foundName && nameNotFoundBefore ? foundName : nameOfElement;
            });
		},
        canHeal(building: Element): string[] {

            const name: string = building.name;

            return healing[name.toLowerCase()];
        },
		movementCost(unit: Element, obstacle: Element): number {

			const
                name: string = obstacle.name.toLowerCase(),
                key = {
                    plains: "plain",
                    woods: "wood",
                    base: "building",
                    seaport: "building",
                    airport: "building",
                    hq: "building"
                }[name];

			return property(unit).movementCosts[key || name];
		},
        find: (type: string) => elements.unit[type],
        ammo: (unit: Element): number => property(unit).ammo,
        fuel: (unit: Element): number => property(unit).fuel,
        movement: (unit: Element): number => property(unit).movement,
        vision: (unit: Element): number => property(unit).vision,
        canAttack: (unit: Element): boolean => property(unit).canAttack,
        inRange: (unit: Element): number => property(unit).inRange,
        damageType: (unit: Element): string => property(unit).damageType,
		movable: (unit: Element): boolean => property(unit).movable,
		transportation: (unit: Element): string => property(unit).transportation,
		capture: (unit: Element): boolean => property(unit).capture,
		weapon1: (unit: Element): string => property(unit).weapon1,
		weapon2: (unit: Element): string => property(unit).weapon2,
		maxLoad: (unit: Element): number => property(unit).maxLoad,
		load: (unit: Element): boolean => property(unit).load,
		loaded: (unit: Element): Unit[] => property(unit).loaded,
        cost: (unit: Element): number => get(unit).cost,
        health: (): number => defaultHealth
	};
};