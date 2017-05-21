import {default as createPosition, Position} from "../../../../coordinates/position";
import {MapElement} from "../defaults";

export default function(map: Map) {

	const
		restricted = {

			sea: ["sea", "reef", "shoal"],
			reef: this.sea,
			shoal: this.sea,
			road:["road"],
			pipe:["pipe"],
			bridge: ["bridge"],
			river:["river"],
		};

    return {

        position: ({x, y}: Position): Position => createPosition(x, y),
        type: ({type}:MapElement): string => type,
        name: ({name}:MapElement): string => name.toLowerCase(),
        draw: ({name, draw, orientation}): string => (draw || name) + orientation,
        restrictions:(type: string): string[] => restricted[type].slice(),
        isPlain:(element: MapElement): boolean => this.name(element) === "plain",
        isTerrain: (element: MapElement): boolean => this.type(element) === "terrain",
        isBuilding: (element: MapElement): boolean => this.type(element) === "building",
        isUnit: (element: MapElement): boolean => this.type(element) === "unit",
        isShoal:(element: MapElement): boolean => this.name(element) === "shoal",
        isReef:(element: MapElement): boolean => this.name(element) === "reef",
        isRiver:(element: MapElement): boolean => this.name(element) === "river",
        isSea(element: MapElement): boolean {

            const nameOfElement = this.name(element);

            return restricted.sea.indexOf(nameOfElement) > -1;
        },
        occupied(element: MapElement): boolean {

            const
                position = this.position(element),
                occupantOfPosition = map.top(position),
                typeOfOccupant = this.type(occupantOfPosition);

            return typeOfOccupant === "unit";
        },
        isBeach(element: MapElement): boolean {

            const
                isSea = this.isSea,
                neighbors = this.position(element)
                .neighbors();

            if (isSea(element)) {

                return neighbors.reduce((isBeach, neighbor) => {

                    return !isSea(neighbor) || isBeach;

                }, false);
            }

            return false;
        },
        setOrientation(orientation: string, element: MapElement): MapElement {

            const modifiedElement = Object.assign({}, element);

            modifiedElement.orientaion = orientation;

            return modifiedElement;
        },
        setDrawing(drawing: string, element: MapElement): MapElement {

            const modifiedElement = Object.assign({}, element);

            modifiedElement.draw = drawing;

            return modifiedElement;
        },
        setIndex(index: number, element: MapElement): MapElement {

            const modifiedElement = Object.assign(element);

            modifiedElement.index = index;

            return modifiedElement;
        },
        onSameSpace({x, y}: Position, element: MapElement): boolean {

            const position = this.position(element);

            return position.x === x && position.y === y;
        },
    };
}
