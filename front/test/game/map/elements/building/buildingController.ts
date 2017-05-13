import createPosition from "../position";
import {Player} from "../../../../users/players/player";
import {Building} from "./building";
import terrainController from "../terrain/terrainController";
import playerController from "../../../../users/players/playerSocketListener";
import createUnit from "../unit/unit";
import createDefaults from '../defaults';
import terrainDefaults from "../terrain/properties";
import buildingDefaults from "../building/buildingDefaults";
import unitDefaults from "../unit/unitDefinitions";
import {default as composer, Composer} from "../../../../tools/composer";
import players from "../../../../users/players.js";

export interface BuildingController {


}

export default function () {

	const
        compose = composer(),
        defaults = createDefaults(unitDefaults, buildingDefaults, terrainDefaults),
        unitControllerParameters = {

            playerId(element) {

                let
                    player = this.player(element),
                    id: number | string;

                if (!player) {

                    player = element;
                }

                id = playerController.id(player);

                return isNaN(id) ? player : id;
            },
            units:(element) => defaults.units(element),
            health:(element) => defaults.health(element),
            player:({player}:Building): Player => player,
            getPlayer(element) {

                const id = this.player(element);

                if (!isNaN(id) || isString(id)) {

                    return app.players.byId(id);
                }

                throw new Error("Invalid id pulled from element passed to \"getPlayer\".");
            },
            color(element) {

                return this.player(element) ? this.player(element).color() : "default";
            },
            restore(element) {

                element.health = defaults.health(element);

                return element;
            },
            indexOf(element) {

                return element.index;
            },
            get(element) {

                return app.map.buildings()[this.indexOf(element)];
            },
            selected({selected}) {

                if (!isString(selected)) {

                    throw new Error("parameter of building object: \"selected\" must be a string. in method: \"selected\".");
                }

                return selected;
            },
            isHQ: function (building) {

                return this.name(building) === "hq";
            },
            select: (selected, building) => {

                if (!isString(selected)) {

                    throw new Error("parameter of building object: \"selected\" must be a string, in method: \"select\".");
                }

                building.selected = selected;

                return building;

            },
            owns: (object1, object2) => {

                return this.playerId(object1) === this.playerId(object2);
            },
            capture: (capture, element) => {

                element.health -= capture;

                return element;
            },
            // changeOwner: (players, element) => { // <--- remove, just use mapEditor
            //
            //     app.mapEditor.changeOwner(element, players);
            //
            //     return element;
            // },
            build: (type, element) => {

                const
                    playerId = this.playerId(element),
                    position = this.position(element);

                return createUnit(type, createPosition(position.x, position.y), playerId);
            },
            setPlayer: (player, element) => {

                element.player = player;

                return element;
            },
            canBuild: (type, element) => {

                return defaults.build(element).indexOf(type) >= 0;
            },
            canHeal: (unit, element) => {

                const
                    canHeal = defaults.canHeal(element),
                    transportation = defaults.transportation(unit);

                return canHeal ? canHeal.indexOf(transportation) >= 0 : false;
            }
	    };

    return <BuildingController>compose.excluding("draw")
        .combine(unitControllerParameters, terrainController);
}