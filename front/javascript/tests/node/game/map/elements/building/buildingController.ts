import createPosition from "../../../coordinates/position";
import typeChecker, {TypeChecker} from "../../../../tools/validation/typeChecker";
import {Player} from "../../../users/players/player";
import playerController from "../../../users/players/playerSocketListener";
import terrainController from "../terrain/terrainController";
import createUnit, {Unit} from "../unit/unit";
import createDefaults, {MapElement} from "../defaults";
import terrainDefaults from "../terrain/terrainDefaults";
import buildingDefaults from "./buildingDefaults";
import unitDefaults from "../unit/unitDefinitions";
import composer, {Composer} from "../../../../tools/object/composer";
import {Building} from "./building";

export interface BuildingController {


}

export default function() {

  const {isString}: TypeChecker = typeChecker();
  const nonExistentIndex: number = 0;
  const compose: any = composer();
  const defaults: any = createDefaults(unitDefaults, buildingDefaults, terrainDefaults);
  const unitControllerParameters = {

    playerId(element: MapElement): any {

      let player = this.player(element);
      let id: number | string;

      if (!player) {

        player = element;
      }

      id = playerController.id(player);

      return isNaN(id) ? player : id;
    },
    units: (element: MapElement): Unit[] => defaults.units(element),
    health: (element: MapElement): number => defaults.health(element),
    player: ({player}: Building): Player => player,
    getPlayer(element: MapElement): Player {

      const id = this.player(element);

      if (!isNaN(id) || isString(id)) {

        return app.players.getPlayerById(id);
      }

      throw new Error("Invalid id pulled from element passed to \"getPlayer\".");
    },
    color(element: MapElement): string {

      return this.player(element) ? this.player(element).color() : "default";
    },
    restore(element: MapElement): MapElement {

      element.health = defaults.health(element);

      return element;
    },
    indexOf(element: MapElement): number {

      return element.index;
    },
    getPlayer(element: MapElement): Player {

      return app.map.buildings()[this.indexOf(element)];
    },
    selected({selected}) {

      if (!isString(selected)) {

        throw new Error("parameter of building object: \"selected\" must be a string. in method: \"selected\".");
      }

      return selected;
    },
    isHQ(building: Building): boolean {

      const hqId: string = "hq";

      return this.name(building) === hqId;
    },
    select: (selected: string, building: Building): Building => {

      if (!isString(selected)) {

        throw new Error("parameter of building object: \"selected\" must be a string, in method: \"select\".");
      }

      building.selected = selected;

      return building;

    },
    owns: (object1: MapElement, object2: MapElement): boolean => {

      return this.playerId(object1) === this.playerId(object2);
    },
    capture: (capture: number, element: MapElement): MapElement => {

      element.health -= capture;

      return element;
    },
    // changeOwner: (players, element) => { // <--- remove, just use mapEditor
    //
    //     app.mapEditor.changeOwner(element, players);
    //
    //     return element;
    // },
    build: (type: string, element: MapElement): Unit => {

      const playerId = this.playerId(element);
      const position = this.position(element);

      return createUnit(type, createPosition(position.x, position.y), playerId);
    },
    setPlayer: (player: Player, element: MapElement): MapElement => {

      element.player = player;

      return element;
    },
    canBuild: (type: string, element: MapElement): boolean => {

      return defaults.build(element).indexOf(type) > nonExistentIndex;
    },
    canHeal: (unit: Unit, element: MapElement): boolean => {

      const canHeal = defaults.canHeal(element);
      const transportation = defaults.transportation(unit);

      return canHeal ? canHeal.indexOf(transportation) > nonExistentIndex : false;
    },
  };

  return compose.excluding("draw").combine(unitControllerParameters, terrainController);
}