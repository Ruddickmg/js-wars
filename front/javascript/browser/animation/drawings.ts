import {Dimensions} from "../../game/coordinates/dimensions";
import createPosition, {Position} from "../../game/coordinates/position";
import {Building} from "../../game/map/elements/building/building";
import {MapElement} from "../../game/map/elements/defaults";
import {Terrain} from "../../game/map/elements/terrain/terrain";
import {Unit} from "../../game/map/elements/unit/unit";

export interface Drawings {

    attackRange(path: Position[]): Drawings;
    movementRange(path: Position[]): Drawings;
    path(path: Position[]): Drawings;
    target(): Drawings;
    hide(): Drawings;
    background(): Drawings;
    building(): Drawings;
    terrain(): Drawings;
    unit(): Drawings;
    weather(): Drawings;
    hudCanvas(elementName: string, elementType: string): Drawings;
    effects(): Drawings;
    cursor(): Drawings;
    [key: string]: any;
}

export default function(dimensions: Dimensions): Drawings {

    const drawMapElements = (...elements: any[]): void => elements.filter(withinMapDimensions).forEach(drawToCanvas);

    const withinMapDimensions = ({x, y}: Position): boolean => {

        const {left, right, top, bottom}: Dimensions = dimensions;

        return x >= left && x < right && y >= top && y < bottom;
    };
    const drawPaths = (path: Position[], animationType: string): void => {

        drawMapElements(screenPosition, ...path.map(toDrawableObject(animationType)));
    };

    const drawPaths = (path: Position[], animationType: string): void => {

        drawMapElements(screenPosition, ...path.map(toDrawableObject(animationType)));
    };
    const movementRange = function(range: Position[]): Drawings {

        drawPaths(range, "movementRange");

        return this;
    };
    const attackRange = function(range: Position[]): Drawings {

        drawPaths(range, "attackRange");

        return this;
    };
    const path = function(movementPath: Position[]): Drawings {

        drawPaths(movementPath, "path");

        return this;
    };
    const screenPosition: Position = createPosition(0, 0); // TODO get correct screen position
    const background = function(): Drawings {

        fillScreen(backgroundHandler.drawing());

        return this;
    };
    const building = function(listOfBuildings: Building[]): Drawings {

        drawMapElements(screenPosition, ...listOfBuildings);

        return this;
    };
    const cursor = function(position: Position): Drawings {

        const name: string = "cursor";

        drawMapElements(screenPosition, {name, position});

        return this;
    };
    const hide = function(): Drawings {

        drawings.hide();

        return this;
    };
    const hudCanvas = function(name: string, elementType: string): Drawings {

        const position: Position = createPosition(0, 0);

        if (elementType !== mapElementWithNoBackground) {

            drawToCanvas({name: defaultElement, position});
        }

        drawToCanvas({name, position});

        return this;
    };
    const target = function({position}: MapElement): Drawings {

        const name: string = "target";

        drawMapElements(screenPosition, {name, position});

        return this;
    };
    const terrain = function(listOfTerrain: Terrain[]): Drawings {

        drawMapElements(screenPosition, ...listOfTerrain);

        return this;
    };
    const unit = function(listOfUnits: Unit[]): Drawings {

        drawMapElements(screenPosition, ...listOfUnits);

        return this;
    };
    const weather = function(): Drawings {

        console.log("To Do: Weather....");

        return this;
    };

    subscribe("target", target);
    subscribe("cursorMoved", cursor);
    subscribe("animatePath", path);
    subscribe("animateMovementRange", movementRange);
    subscribe("animateAttackRange", attackRange);

    return {

        attackRange,
        background,
        building,
        cursor,
        hide,
        hudCanvas,
        movementRange,
        path,
        target,
        terrain,
        unit,
        weather,
    };
}
