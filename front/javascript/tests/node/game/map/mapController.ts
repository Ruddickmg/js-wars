import settings from "../../settings/settings";
import {Dictionary} from "../../tools/storage/dictionary";
import notifier, {PubSub} from "../../tools/pubSub";
import typeChecker, {TypeChecker} from "../../tools/validation/typeChecker";
import createPosition, {Position} from "../coordinates/position";
import createBuilding, {Building} from "./elements/building/building";
import {MapElement} from "./elements/defaults";
import createTerrain, {Terrain} from "./elements/terrain/terrain";
import {Unit} from "./elements/unit/unit";
import {Map} from "./map";
import createMapMatrix, {MatrixMap} from "./mapMatrix";

export interface MapController {

  addUnit(unit: Unit, currentMap: Map): void;

  applyDamageToUnit(unit: Unit, damage: number, map: Map): void;

  changeHqToCity(hq: Building, {buildings}: Map): void;

  changeOwner(element: Building | Unit, currentOwner: number): void;

  getUnit(unit: Unit, {units}: Map): Unit;

  initialize({units, buildings, terrain}: Map): void;

  moveUnit(unit: Unit, target: Position, {units}: Map): Unit;

  getNeighbors(position: Position, {dimensions}: Map): MapElement[];

  removeUnit(unit: Unit, {units}: Map): Unit;

  getOccupantsOfPosition(position: Position, {units, buildings, terrain}: Map): any;

  topElementAtPosition(position: Position, currentMap: Map): MapElement;
}

export default function(map: Map): MapController {

  const mapSettings: Dictionary = settings().get("map");
  const notifications: PubSub = notifier();
  const matrix: MatrixMap = createMapMatrix(map);
  const {isUnit}: TypeChecker = typeChecker();
  const isSamePosition = ({x, y}: Position, {x: x2, y: y2}: Position) => x === x2 && y === y2;
  const restore = (element: Building | Unit): Building | Unit => {

    element.health = mapSettings.get(element.type, element.name, "health");

    return element;
  };
  const getIndex = ({type, position}: MapElement, elements: any): number => {

    return elements.findIndex((comparison: MapElement) => {

      return position.on(comparison.position) && type === comparison.type;
    });
  };
  const addUnit = (unit: Unit, currentMap: Map) => {

    const stored: Unit = matrix.insert(unit) as Unit;

    currentMap.units.push(stored);

    notifications.publish("unitAdded", stored);

    // refresh(); // TODO handle with notifications
  };
  const applyDamageToUnit = (unit: Unit, damage: number, {units}: Map): void => {

    const health = unit.health;
    const stored: Unit = matrix.getElement(unit) as Unit;

    notifications.publish("unitDamaged", {unit, health, damage});

    stored.health -= damage;
    units[getIndex(unit, units)].health -= damage; // TODO make sure these are the same reference
  };
  const changeHqToCity = (hq: Building, {buildings}: Map): void => {

    const index = getIndex(hq, buildings);
    const {position, playerNumber} = hq;
    const building: Building = createBuilding("city", position, playerNumber, index);

    buildings.splice(index, 1, building);
    matrix.insert(building);
  };
  const changeOwner = (element: Building | Unit, currentOwner: number): void => {

    const stored: Building | Unit = matrix.getElement(element) as Building | Unit;

    stored.playerNumber = currentOwner;

    restore(stored);

    notifications.publish("ownershipChange", {currentOwner, element});
    // refresh(); // TODO handle with pub sub?
  };
  const getUnit = (unit: Unit, {units}: Map): Unit => units[getIndex(unit, units)];
  const initialize = ({units, buildings, terrain}: Map) => {

    terrain.forEach((element: Terrain) => matrix.insert(element));
    buildings.forEach((building: Building) => matrix.insert(building));
    units.forEach((unit: Unit) => matrix.insert(unit));
  };
  const moveUnit = (unit: Unit, target: Position, {units}: Map): Unit => {

    const indexOfUnitBeingMoved = getIndex(unit, units);
    const unitBeingMoved = units[indexOfUnitBeingMoved];
    const mapElementAtDestination = matrix.position(target);

    if (unitBeingMoved) {

      matrix.remove(unitBeingMoved);

      unitBeingMoved.position = target;

      if (!isUnit(mapElementAtDestination)) {

        matrix.insert(unitBeingMoved);
      }

      units.splice(indexOfUnitBeingMoved, 1, unitBeingMoved);

      notifications.publish("unitMoved", {unit, target});
    }
    // refresh() // TODO make pub sub
    return unitBeingMoved;
  };
  const getNeighbors = (position: Position, {dimensions}: Map) => {

    return position.neighbors(dimensions)
      .reduce((existingNeighbors: MapElement[], neighbor: Position) => {

        const element: MapElement = matrix.position(neighbor);

        if (element) {

          existingNeighbors.push(element);
        }

        return existingNeighbors;

      }, []);
  };
  const removeUnit = (unit: Unit, {units}: Map) => {

    const index = getIndex(unit, units);
    const element = matrix.getElement(unit);

    let removed: Unit;

    if (isUnit(element) && isSamePosition(element.position, unit.position)) {

      matrix.remove(unit);

      removed = units.splice(index, 1)[0];
    }

    notifications.publish("unitRemoved", unit);
    // refresh(); // TODO pub sub

    return removed;
  };
  const getOccupantsOfPosition = (position: Position, {units, buildings, terrain}: Map): any => {

    const mapElements = [units, buildings, terrain];

    return mapElements.reduce((occupants: any, elements: MapElement[]): any => {

      const occupant: MapElement = elements.find((element: MapElement): boolean => {

        return isSamePosition(position, element.position);
      });

      if (occupant) {

        occupants[occupant.type] = occupant;
      }

      return occupants;

    }, {});
  };
  const topElementAtPosition = (position: Position, currentMap: Map): MapElement => {

    const {x, y}: Position = position;
    const {unit, building, terrain} = getOccupantsOfPosition(position, currentMap);

    return unit || building || terrain || createTerrain("plain", createPosition(x, y));
  };

  return {

    addUnit,
    applyDamageToUnit,
    changeHqToCity,
    changeOwner,
    getNeighbors,
    getOccupantsOfPosition,
    getUnit,
    initialize,
    moveUnit,
    removeUnit,
    topElementAtPosition,
  };
}

// TODO testing

// //, TODO this belongs in view/animation logic
// setBackground: (type: string, currentMap: Map) => {
//
//     currentMap.background = createTerrain(type);
// },

// refresh: function () { // TODO pub sub
//
//     app.animate(["unit","building"]);
// },
// const refresh = (hide: boolean): void => {
//
//     notifications.publish("animate", {elements: ["unit"], hide});
// };

// unitsInfo: function(units: Unit[]) { // TODO this doesn't belong here, move it to "view" logic
//
//     return units.map((unit: Unit) => {
//
//         return {
//             gas: unit.fuel,
//             hp: unit.health,
//             rounds: unit.ammo,
//             unit: unit.name,
//         };
//     });
// },
// focus: function() { // TODO this doesn't belong here, move it to "view" logic
//
//     if (app.key.keyUp(app.key.map()) && app.key.undoKeyUp(app.key.map())) {
//
//         // app.hud.show(); // TODO make respond to pub sub
//         // app.coStatus.show();
//         // app.cursor.show();
//         notifications.publish("focusingOnMap", false);
//
//     } else if (app.key.pressed(app.key.map()) && app.key.undo(app.key.map()) && !focused) {
//
//         // app.hud.hideCurrentElement(); // TODO make respond to pub sub
//         // app.coStatus.hideCurrentElement();
//         // app.cursor.hideCurrentElement();
//         notifications.publish("focusingOnMap", true);
//     }
// },
