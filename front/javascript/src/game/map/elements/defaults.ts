import getSettings from "../../../settings/settings";
import {Dictionary} from "../../../tools/storage/dictionary";
import single from "../../../tools/storage/singleton";
import {Building} from "./building/building";
import {Terrain} from "./terrain/terrain";
import {Unit} from "./unit/unit";

interface Element {

  name: string;
  type: string;

  [index: string]: string;
}

export type MapElement = Terrain | Building | Unit;

export default single(function() {

  const settings: Dictionary = getSettings();
  const buildingSettings: Dictionary = settings.get("typesOfUnitsABuildingCanHeal");
  const typesOfMapElements: Dictionary = settings.get("typesOfMapElements");
  const mapElements: Dictionary = settings.get("map", "elements");

  const get = (element: any): any => {

    const type: string = element.type.toLowerCase();
    const name: string = element.name.toLowerCase();

    return mapElements.get(type, name);
  };

  const property = (element: Element): any => get(element).properties;

  const name = (type: string): string => {

    return mapElements.reduce((nameOfElement: string, elements: any) => {

      const element: MapElement = elements[type];

      let foundName: string;

      if (element) {

        foundName = element.name;
      }

      return nameOfElement || foundName;
    });
  };

  const canHeal = (building: Element): string[] => {

    const typeOfBuilding: string = building.name.toLocaleLowerCase();
    const typesTheBuildingCanHeal: string[] = buildingSettings.get(typeOfBuilding);

    return typesTheBuildingCanHeal || [];
  };

  const movementCost = (unit: Element, obstacle: Element): number => {

    const properties = property(unit);
    const nameOfMapElement: string = obstacle.name.toLowerCase();
    const key: string = typesOfMapElements.get(nameOfMapElement) || nameOfMapElement;
    const costOfMovement = properties.movementCosts[key];

    if (isNaN(costOfMovement)) {

      throw new Error(`Could not determine a valid movement cost, found: ${costOfMovement}`);
    }

    return property(unit).movementCosts[key || nameOfMapElement];
  };

  const find = (type: string) => mapElements.get("unit", type);
  const ammo = (unit: Element): number => property(unit).ammo;
  const fuel = (unit: Element): number => property(unit).fuel;
  const movement = (unit: Element): number => property(unit).movement;
  const vision = (unit: Element): number => property(unit).vision;
  const canAttack = (unit: Element): boolean => property(unit).canAttack;
  const inRange = (unit: Element): number => property(unit).inRange;
  const damageType = (unit: Element): string => property(unit).damageType;
  const movable = (unit: Element): boolean => property(unit).movable;
  const transportation = (unit: Element): string => property(unit).transportation;
  const capture = (unit: Element): boolean => property(unit).capture;
  const firstWeapon = (unit: Element): string => property(unit).weapon1;
  const secondWeapon = (unit: Element): string => property(unit).weapon2;
  const maxLoad = (unit: Element): number => property(unit).maxLoad;
  const load = (unit: Element): boolean => property(unit).load;
  const loaded = (unit: Element): Unit[] => property(unit).loaded;
  const cost = (unit: Element): number => get(unit).cost;
  const health = (): number => settings.get("defaultHealth");

  return {

    name,
    canHeal,
    movementCost,
    find,
    ammo,
    fuel,
    movement,
    vision,
    canAttack,
    inRange,
    damageType,
    movable,
    transportation,
    capture,
    firstWeapon,
    secondWeapon,
    maxLoad,
    load,
    loaded,
    cost,
    health,
  };
});
