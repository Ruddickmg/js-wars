import settings from "../../../../settings/settings";
import createPosition, {Position} from "../../coordinates/position";
import {MatrixMap} from "../../mapMatrix";
import {MapElement} from "../defaults";

export default function(map: MatrixMap<MapElement>) {
  const restricted = settings().get("mapElementRestrictions").toObject();
  return {
    draw: ({name, drawing, orientation}: MapElement): string => (drawing || name) + orientation,
    name: ({name}: MapElement): string => name.toLowerCase(),
    occupied(element: MapElement): boolean {
      const unitType: string = "unit";
      const position = this.position(element);
      const occupantOfPosition = map.get(position);
      const typeOfOccupant = this.type(occupantOfPosition);
      return typeOfOccupant === unitType;
    },
    position: ({x, y}: Position): Position => createPosition(x, y),
    restrictions: (type: string): string[] => restricted[type].slice(),
    setDrawing(drawing: string, element: MapElement): MapElement {
      const modifiedElement: MapElement = Object.assign({}, element);
      modifiedElement.drawing = drawing;
      return modifiedElement;
    },
    setIndex(index: number, element: MapElement): MapElement {
      const modifiedElement = Object.assign(element);
      modifiedElement.index = index;
      return modifiedElement;
    },
    setOrientation(orientation: string, element: MapElement): MapElement {
      const modifiedElement = Object.assign({}, element);
      modifiedElement.orientation = orientation;
      return modifiedElement;
    },
    type: ({type}: MapElement): string => type,
  };
}
