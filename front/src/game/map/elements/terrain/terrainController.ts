import {default as createPosition, Position} from "../../../../coordinates/position";
import settings from "../../../../settings/settings";
import {MapElement} from "../defaults";

export default function(map: Map) {

    const restricted = settings().get("mapElementRestrictions").toObject();

    return {

        position: ({x, y}: Position): Position => createPosition(x, y),
        type: ({type}:MapElement): string => type,
        name: ({name}:MapElement): string => name.toLowerCase(),
        draw: ({name, draw, orientation}): string => (draw || name) + orientation,
        restrictions:(type: string): string[] => restricted[type].slice(),
        occupied(element: MapElement): boolean {

            const
                position = this.position(element),
                occupantOfPosition = map.top(position),
                typeOfOccupant = this.type(occupantOfPosition);

            return typeOfOccupant === "unit";
        },
        setOrientation(orientation: string, element: MapElement): MapElement {

            const modifiedElement = Object.assign({}, element);

            modifiedElement.orientaion = orientation;

            return modifiedElement;
        },
        setDrawing(drawing: string, element: MapElement): MapElement {

            const modifiedElement: MapElement = Object.assign({}, element);

            modifiedElement.draw = drawing;

            return modifiedElement;
        },
        setIndex(index: number, element: MapElement): MapElement {

            const modifiedElement = Object.assign(element);

            modifiedElement.index = index;

            return modifiedElement;
        },
    };
}
