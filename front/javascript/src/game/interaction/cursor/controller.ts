import animationHandler, {CanvasCache} from "../../../browser/canvas/canvasCache";
import getSocket from "../../../browser/communication/sockets/socket";
import keyBoardInput, {KeyBoard} from "../../../browser/input/keyboard";
import {publish, subscribe} from "../../../tools/pubSub";
import single from "../../../tools/storage/singleton";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import createPosition, {Coordinates, Position} from "../../map/coordinates/position";
import {MapElement} from "../../map/elements/defaults";
import map from "../../map/map";
import getCursor, {Cursor} from "./cursor";

// const actions = require("./actionsController.js");
// const app = require("../configuration/settings/app.ts");
//
// app.options = require("../menu/options/optionsMenu.js");

interface KeyRanges {

  [index: string]: any;
}

export interface CursorController {

  clear(): CursorController;
  deleteMode(): CursorController;
  deselect(): CursorController;
  getSelected(): MapElement;
  hide(): CursorController;
  hovered(): MapElement;
  isActive(): boolean;
  isDeleting(): boolean;
  onBottom(): boolean;
  onLeftSide(): boolean;
  onRightSide(): boolean;
  onTop(): boolean;
  position(): Position;
  select(element: MapElement): CursorController;
  selectMode(): CursorController;
  setPosition(position: Position): CursorController;
  setSelected(element: MapElement): CursorController;
  show(): CursorController;
  side(): string;
}

export default single<CursorController>(function() {

  const cursorAnimation: string = "cursor";
  const xAxis: string = "x";
  const yAxis: string = "y";
  const leftSide: string = "left";
  const rightSide: string = "right";
  const topSide: string = "top";
  const bottomSide: string = "bottom";
  const cursor: Cursor = getCursor();
  const keyboard: KeyBoard = keyBoardInput();
  const socket: any = getSocket();
  const check: TypeChecker = typeChecker();
  const mapDimensions: Coordinates = app.map.dimensions();
  const keyRange = (axis: string, border: number, sign: number): any => ({axis, border, sign});
  const keyRanges: KeyRanges = {
    down: keyRange(yAxis, mapDimensions.y, 1),
    left: keyRange(xAxis, 0, -1),
    right: keyRange(xAxis, mapDimensions.x, 1),
    up: keyRange(yAxis, 0, -1),
  };

  let selected: MapElement;
  let deleting: boolean;
  let active: boolean;
  let hidden: boolean;
  let cursorPosition: Position = cursor.getPosition();

  const allowedToMove = (element: any) => {

    return !isBuilding(element)
      && !app.options.active()
      && !hidden
      && app.user.turn();
  };
  const movementIsWithinMapBoundaries = (axis: string, comparison: number, operation: number) => {

    const edgeOfScreen = 0;
    const move = cursorPosition[axis] + operation;

    return comparison <= edgeOfScreen ? move >= edgeOfScreen : move < comparison;
  };
  const canInteractWithCursor = () => {

    return app.user.turn() && !app.target.active() && !app.options.active();
  };
  const checkSide = (axis: string) => {

    const dimensions: number = app.screen.dimensions()[axis];
    const screenPosition: number = app.screen.position()[axis];
    const position: number = cursorPosition[axis];

    return position > screenPosition + (dimensions / 2);
  };
  const clear = function(): CursorController {

    setSelected(undefined);
    hidden = false;

    return this;
  };
  const deleteMapElement = (elementPosition: Position): void => publish("delete", elementPosition);
  const deleteMode = function(): CursorController {

    deleting = true;

    return this;
  };
  const deselect = function(): CursorController {

    selected = undefined;

    return this;
  };
  const getSelected = (): MapElement => selected;
  const hide = function(): CursorController {

    publish("hidingCursor", cursorPosition);

    return this;
  };
  const hovered = () => map.occupantsOf(cursorPosition);
  const isActive = () => active;
  const isBuilding = (element: any): boolean => element.type === "building";
  const isDeleting = () => deleting;
  const isMapElement = (element: any): boolean => isUnit(element) || isBuilding(element) || isTerrain(element);
  const isSelected = (element: MapElement): boolean => element === selected;
  const isTerrain = (element: any): boolean => element.type === "terrain";
  const isUnit = (element: any): boolean => element.type === "unit";
  const moveCursor = (axis: string, operator: number, range: any[] = []) => {

    const {x, y}: Coordinates = cursorPosition;
    const start: Position = selected.position;
    const end: Position = createPosition(x, y);

    cursorPosition[axis] += operator;

    if (selected && movementWithinRange(range)) {

      publish("showPath", {start, end});
      // animation.show("effects");
    }

    publish("cursorMoved", cursorPosition);
  };
  const movementWithinRange = (range: any[]) => {

    return range.reduce((isAllowed: boolean, element: any) => {

      const positionInRange = element.position;

      return positionInRange.on(cursorPosition) || isAllowed;

    }, false);
  };
  const position = () => createPosition(cursorPosition.x, cursorPosition.y);
  const select = function(element: MapElement): CursorController {

    if (!hidden && !deleting && element) {

      setSelected(element);
    }

    return this;
  };
  const selectTopElement = (topElement: MapElement) => {

    if (app.user.owns(topElement)) {

      // save the selected element and select it
      if (actions.type(selected).select(selected)) {

        setSelected(topElement);
        publish("select", selected);
        app.hud.hide();

      } else {

        publish("deselect", selected);
        setSelected(undefined);
      }
    }
  };
  const selectMode = function() {

    deleting = false;
    return this;
  };
  const setPosition = ({x, y}: Position) => {

    if (!check.isNumber(x + y)) {

      throw Error("Position must have an x and a y axis that are both numeric");
    }

    cursorPosition = createPosition(x, y);
  };
  const setSelected = function(selecting: any) {

    if (!isMapElement(selecting)) {

      throw Error("Cursor attempted to select a non map element.");
    }

    selected = selecting;

    return this;
  };
  const show = function(): CursorController {

    publish("showingCursor", cursorPosition);

    animation.show(cursorAnimation);

    return this;
  };
  const showAttackRange = () => {

    active = true;
    keyboard.undo(keyboard.inRange());
    publish("showAttackRange", cursorPosition);
  };
  const side = (axis: string): string => {

    if (checkSide(axis)) {

      return axis === xAxis ? rightSide : bottomSide;
    }

    return axis === xAxis ? leftSide : topSide;
  };
  const unitCanMoveToPosition = (element: MapElement) => {

    return isUnit(element) && movementWithinRange(getRange(element));
  };
  const performAction = (topElement: MapElement) => {

    if (isSelected(topElement) || unitCanMoveToPosition(topElement) || canCombine(topElement, selected)) {

      if (actions.type(selected).execute(hovered, selected)) {

        return selected = false;
      }
    }
  };
  const onRightSide = (): boolean => side(xAxis) === rightSide;
  const onLeftSide = (): boolean => side(xAxis) === leftSide;
  const onTop = (): boolean => side(yAxis) === topSide;
  const onBottom = (): boolean => side(yAxis) === bottomSide;

  subscribe("keyPressed", (pressed: number) => {

    const topElement: MapElement = hovered();
    const key: string = keyboard.getAssignment(pressed);
    const {axis, border, operator}: any = keyRanges[key];

    if (canInteractWithCursor()) {

      if (allowedToMove(selected) && movementIsWithinMapBoundaries(axis, border, operator)) {

        moveCursor(axis, operator);

      } else if (keyboard.pressedRange() && !getSelected() && !isActive()) {

        showAttackRange();

      } else if (keyboard.pressedEnter()) {

        if (deleting) {

          deleteMapElement(cursorPosition);

        } else if (!active) {

          if (getSelected()) {

            performAction(topElement);

          } else {

            selectTopElement(topElement);
          }
        }

        keyboard.undo(keyboard.enter());
      }
    }
  });

  subscribe("resetScreen", () => deselect() && show());
  subscribe("unFocus", show);
  subscribe("focus", hide);
  subscribe("keyReleased", () => {

    if (keyboard.releasedRange()) {

      active = false;
      // app.highlight.clear();
      publish("clearHighlights");
    }
  });

  return {

    clear,
    deleteMode,
    deselect,
    selected: getSelected,
    hide,
    hovered,
    isActive,
    isDeleting,
    onBottom,
    onLeftSide,
    onRightSide,
    onTop,
    position,
    select,
    selectMode,
    setPosition,
    setSelected,
    show,
    side,
  };
});
