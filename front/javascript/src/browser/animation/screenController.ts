import createDimensions, {Dimensions} from "../../game/map/coordinates/dimensions";
import createPosition, {Coordinates, Position} from "../../game/map/coordinates/position";
import screenConfiguration from "../../settings/configuration/screen";
import time, {Time} from "../../tools/calculations/time";
import {publish, subscribe} from "../../tools/pubSub";
import canvasCache, {CanvasCache} from "../canvas/canvasCache";
import keyboardInput, {KeyBoard} from "../input/keyboard";
import getGameScreen from "../menu/screen/gameScreen";

export interface ScreenController {
  width(): number;
  height(): number;
  pixels(): number;
  dimensions(): Dimensions;
  position(): Position;
  top(): number;
  bottom(): number;
  left(): number;
  right(): number;
  focused(): boolean;
  setDimensions(newWidth: number, newHeight: number): ScreenController;
  reset(): ScreenController;
  scroll(cursorPosition: Position): ScreenController;
  moveTo(coordinates: Coordinates): ScreenController;
  focus(): void;
  unFocus(): void;
  withinDimensions({x, y}: Position): boolean;
}

export default function(mapDimensions: Dimensions): ScreenController {

  const floor = Math.floor;
  const {numberOfVerticalGridSquares, numberOfHorizontalGridSquares, listOfCanvasAnimations} = screenConfiguration;
  const initialX = floor((mapDimensions.width - numberOfHorizontalGridSquares) / 2);
  const initialY = floor((mapDimensions.height - numberOfVerticalGridSquares) / 2);
  const listOfAxis: string[] = ["x", "y"];
  const squaresFromEdgeBeforeMoving: number = 2;
  const bottomOrLeftEdgeOfScreen: number = 0;
  const minimumDistance: number = 0;
  const cursorBoundary: number = 1;
  const scrollSpeed: number = 50;
  const isFocused: boolean = false;
  const gameScreen: any = getGameScreen();
  const screenPosition: Position = createPosition(initialX, initialY);
  const canvases: CanvasCache = canvasCache(...listOfCanvasAnimations);
  let screenDimensions = canvases.get(listOfCanvasAnimations[0]).dimensions();
  const periodOfTime: Time = time();
  const keyboard: KeyBoard = keyboardInput();
  const width = (): number => screenDimensions.width;
  const height = (): number => screenDimensions.height;
  const pixels = (): number => screenDimensions.width * screenDimensions.height;
  const dimensions = (): Dimensions => gridDimensions;
  const position = (): Position => screenPosition;
  const top = (): number => screenPosition.y;
  const bottom = (): number => screenPosition.y + gridDimensions.height;
  const left = (): number => screenPosition.x;
  const right = (): number => screenPosition.x + gridDimensions.width;
  const focused = (): boolean => isFocused;
  const withinMapDimensions = (view: number, sign: number, limit: number): boolean => view * sign + sign < limit;
  const movementStillRemains = (distance: number): boolean => distance >= minimumDistance;

  const moveScreen = (distance: number, currentPosition: number, limit: number, sign: number, axis: string): void => {
    periodOfTime.wait(scrollSpeed)
      .then((): void => {
        if (movementStillRemains(distance) && withinMapDimensions(currentPosition, sign, limit)) {
          screenPosition[axis] += sign;
          publish("screenMovement", screenPosition);
          moveScreen(distance - 1, currentPosition + sign, limit, sign, axis);
        }
      })
      .catch((error: Error): void => {
        publish("error", `Error occurred in the moveScreen method of screenController: ${error.message}`);
      });
  };

  const cursorAtBottomOrLeftOfScreen = (cursorPosition: number, currentScreenPosition: number): boolean => {
    return cursorPosition >= bottomOrLeftEdgeOfScreen
      && cursorPosition < currentScreenPosition + squaresFromEdgeBeforeMoving
      && currentScreenPosition > bottomOrLeftEdgeOfScreen;
  };

  const cursorAtTopOrRightOfScreen = (
    cursorPosition: number,
    currentPosition: number,
    edgeOfScreen: number,
    edgeOfMap: number,
  ): boolean => {
    return cursorPosition < edgeOfMap
      && cursorPosition > currentPosition + edgeOfScreen - squaresFromEdgeBeforeMoving
      && currentPosition < edgeOfMap - cursorBoundary;
  };

  const scroll = function(cursorLocation: Position): ScreenController {
    listOfAxis.forEach((axis) => {
      const edgeOfMap: number = mapDimensions[axis];
      const edgeOfScreen: number = gridDimensions[axis];
      const cursorPosition: number = cursorLocation[axis];
      const currentPosition: number = screenPosition[axis];
      if (cursorAtBottomOrLeftOfScreen(cursorPosition, currentPosition)) {
        screenPosition[axis] -= 1;
      }
      if (cursorAtTopOrRightOfScreen(cursorPosition, currentPosition, edgeOfScreen, edgeOfMap)) {
        screenPosition[axis] += 1;
      }
    });
    publish("screenMovement", screenPosition);
    return this;
  };

  const focus = (): void => {
    if (keyboard.pressedFocus()) {
      publish("focus");
    }
  };

  const unFocus = (): void => {
    if (keyboard.releasedFocus()) {
      publish("unfocused");
    }
  };

  const setDimensions = function(newWidth: number, newHeight: number): ScreenController {
    const vertical: number = screenConfiguration.numberOfVerticalGridSquares;
    const horizontal: number = screenConfiguration.numberOfHorizontalGridSquares;
    screenDimensions = createDimensions(newWidth, newHeight);
    gridDimensions = createDimensions(horizontal, vertical);
    return this;
  };

  const withinDimensions = ({x, y}: Position): boolean => {
    const invalidIndex = -1;
    const screenPositionX = screenPosition.x;
    const screenPositionY = screenPosition.y;
    return x > invalidIndex
      && y > invalidIndex
      && x >= screenPositionX
      && y >= screenPositionY
      && x <= screenDimensions.width + screenPositionX
      && y <= screenDimensions.height + screenPositionY;
  };

  const moveTo = function(coordinates: Position): ScreenController {
    publish("changeCursorPosition", coordinates);
    listOfAxis.forEach((axis) => {
      const target = coordinates[axis];
      const leftOrBottomEdgeOfScreen = screenPosition[axis];
      const rightOrTopEdgeOfScreen = screenPosition[axis] + gridDimensions[axis];
      const middleOfScreen = rightOrTopEdgeOfScreen - Math.ceil(gridDimensions[axis] / 2);
      let sign = -1;
      let limit = -1;
      let distance = middleOfScreen - target;
      let view = leftOrBottomEdgeOfScreen;
      if (target > middleOfScreen) {
        sign = 1;
        limit = mapDimensions[axis];
        distance = target - middleOfScreen;
        view = rightOrTopEdgeOfScreen;
      }
      moveScreen(distance, view, limit, sign, axis);
    });
    return this;
  };

  const reset = function(): ScreenController {
    [
      "actionHud",
      "damageDisplay",
      "buildUnitScreen",
      "unitInfoScreen",
      "optionsMenu",
    ]
      .forEach((screenName) => gameScreen.remove(screenName));
    canvases.get("effects").clear();
    // app.coStatus.show();
    // app.options.deactivate();
    return this;
  };

  let gridDimensions: Dimensions = createDimensions(numberOfHorizontalGridSquares, numberOfVerticalGridSquares);

  subscribe("cursorMoved", scroll);
  subscribe("keyPressed", focus);
  subscribe("keyReleased", unFocus);
  subscribe("resetScreen", reset);

  return {
    bottom,
    dimensions,
    focus,
    focused,
    height,
    left,
    moveTo,
    pixels,
    position,
    reset,
    right,
    scroll,
    setDimensions,
    top,
    unFocus,
    width,
    withinDimensions,
  };
}
