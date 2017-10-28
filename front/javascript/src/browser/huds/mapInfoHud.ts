import {Dimensions} from "../../game/coordinates/dimensions";
import createPosition, {Position} from "../../game/coordinates/position";
import {MapElement} from "../../game/map/elements/defaults";
import getSettings from "../../settings/settings";
import notifications, {PubSub} from "../../tools/pubSub";
import {Dictionary} from "../../tools/storage/dictionary";
import singleton from "../../tools/storage/singleton";
import createCanvas, {Canvas} from "../canvas/canvas";
import cursorController, {CursorController} from "../controller/cursorController";

export interface MapInfoHud {

  add(newElement: MapElement, attributes?: any): any;
  clear(): void;
  hidden(): boolean;
  hide(): void;
  position(): Position;
  setElements(elements: any): any;
  show(): void;
}

export default singleton<MapInfoHud>(function(initialElements: any[], dimensions: Dimensions): MapInfoHud {

  let left: number;
  let numberOfDisplayedElements: number = 0;

  const unitType: string = "unit";
  const screenWidth: number = dimensions.width;
  const isUnit = (element: MapElement): boolean => element.type === unitType;
  const {publish, subscribe}: PubSub = notifications();
  const cursor: CursorController = cursorController();
  const settings: Dictionary = getSettings();
  const hudWidth: number = settings.get("hudWidth");
  const hudLeft: number = settings.get("hudLeft");
  const hudHeight: number = settings.get("hudHeight");
  const hoverInfo: any = settings.get("hoverInfo");
  const hiddenElement = "none";
  const element = document.createElement("div");
  const clear = (): void => {

    numberOfDisplayedElements = 0;

    while (element.firstChild) {

      element.removeChild(element.firstChild);
    }
  };
  const hidden = (): boolean => element.style.display === hiddenElement;
  const show = (): void => {

    element.style.display = null;
    setElements(cursor.hovered());
  };
  const position = (): Position => createPosition(left, element.offsetTop);
  const hide = (): void => {

    element.style.display = hiddenElement;
  };
  const resize = (canvas: any): void => { // todo change this to react to cursor movement.

    const width = hudWidth * numberOfDisplayedElements;
    const sizeOfScreenBorder: number = 4;
    const pixelsFromRight: number = 150;
    const pixelsFromLeft: number = 120;
    const offsetDisplayedElements: number = numberOfDisplayedElements - 1;
    const totalWidth: number = pixelsFromLeft * offsetDisplayedElements;
    const positionOffsetByScreenBorder: number = totalWidth - sizeOfScreenBorder;

    left = cursor.onRightSide() && cursor.onBottom() ?
      screenWidth - (screenWidth - hudWidth) + pixelsFromRight :
      hudLeft + pixelsFromLeft - width;

    element.style.height = hudHeight.toString() + "px";
    element.style.left = left.toString() + "px";
    element.style.width = width.toString() + "px";

    canvas.style.moveLeft = positionOffsetByScreenBorder.toString() + "px";
    canvas.setAttribute("class", "hudCanvas");
  };
  const add = (newElement: MapElement, attributes: any = hoverInfo): any => {

    const name: string = "mapInfoHudCanvas";
    const {type, drawing}: MapElement = newElement;
    const width: number = 128;
    const height: number = 128;
    const image: Canvas = createCanvas(newElement.name, {width, height});
    const canvas = dom.createElement("li", name, "canvas");
    const context: any = image.context();
    const list = dom.createList(type, newElement, attributes);

    canvas.appendChild(image.get());

    list.appendChild(canvas);

    resize(canvas);

    // drawings.hudCanvas(draw, type, image.context);
    publish("drawMapInfoHud", {drawing, type, context});

    element.appendChild(list);

    if (isUnit(newElement)) {

      numberOfDisplayedElements += 1;
    }

    return list;
  };

  const setElements = function(elements: any) {

    const propertiesToShow: string[] = ["ammo", "showHealth", "name", "fuel", "canvas"];
    const canvasType: string = "canvas";
    const {unit, building, terrain}: any = elements;

    clear();

    if (unit) {

      if (unit.loaded) {

        unit.loaded.forEach(() => add(unit, [canvasType])
          .setAttribute("loaded", true));
      }

      add(unit, propertiesToShow);
    }

    add(building || terrain, [building ? "building" : "terrain"]);

    dom.appendOrReplace(element);
  };

  subscribe(["deselect", "unfocused", "inputReceived", "isUsersTurn", "resetScreen"], show);
  subscribe(["select", "focus", "receivingInput", " endOfUsersTurn"], hide);
  subscribe("cursorMoved", setElements);

  setElements(initialElements);

  element.setAttribute("id", "hud");

  return {

    add,
    clear,
    hidden,
    hide,
    position,
    setElements,
    show,
  };
});
