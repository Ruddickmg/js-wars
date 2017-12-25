import {subscribe, unsubscribe} from "../../../tools/pubSub";
import isList from "../../../tools/storage/lists/arrayList/isList";
import createList, {ArrayList} from "../../../tools/storage/lists/arrayList/list";
import createStack, {Stack} from "../../../tools/storage/stack/listStack";
import {isDefined} from "../../../tools/validation/typeChecker";
import validator, {Validator} from "../../../tools/validation/validator";
import keyboardInput, {KeyBoard} from "../../input/keyboard";
import {SelectionHandler} from "./twoDimensionalSelector";

interface SelectorMethods<Type> {
  selectVertically(): SelectionHandler<Type>;
  selectHorizontally(): SelectionHandler<Type>;
  setSelections(selections: ArrayList<Type>): SelectionHandler<Type>;
  vertical(selectionHandler: Handler): SelectionHandler<Type>;
  horizontal(selectionHandler: Handler): SelectionHandler<Type>;
  stop(): SelectionHandler<Type>;
}

export interface SelectionHandler<Type> extends SelectorMethods<Type> {
  getSelected(): Type;
  listen(): SelectionHandler<Type>;
}

type Handler = (selected: any, previous: any, selections: any) => any;
export default function <Type>(container: ArrayList<Type> = createList<any>()): SelectionHandler<Type> {
  const upKey: string = "pressedUpKey";
  const downKey: string = "pressedDownKey";
  const leftKey: string = "pressedLeftKey";
  const rightKey: string = "pressedRightKey";
  const keyboard: KeyBoard = keyboardInput();
  const previous: Stack<ArrayList<Type>> = createStack<ArrayList<Type>>();
  const {validateFunction}: Validator = validator("selectionHandler");
  let subscriptions: number[] = [];
  let selectingVertically: boolean = true;
  let isVertical: boolean = selectingVertically;
  let selections: ArrayList<Type> = container;
  let current: Type = selections.getCurrentElement();
  let verticalSelectionHandler: Handler;
  let horizontalSelectionHandler: Handler;
  const elementSelection = (handleSelection: Handler, movingForward: boolean): any => {
    const selected = movingForward ? selections.next() : selections.previous();
    if (isDefined(selected) && isDefined(current)) {
      if (isDefined(handleSelection)) {
        handleSelection(selected, current, selections);
      }
      current = selected;
    }
  };
  const listSelection = (handleSelection: Handler): void => {
    let list: any;
    let selected: any;
    const target: Type = selections.getCurrentElement();
    if (isList(target)) {
      list = target;
      previous.push(selections);
    } else if (!previous.isEmpty()) {
      list = previous.pop();
    }
    if (isDefined(list)) {
      selected = list.getCurrentElement();
      if (isDefined(selected)) {
        if (isDefined(handleSelection)) {
          handleSelection(selected, current, selections);
        }
        selections = list;
        current = selected;
      }
    }
  };
  const handleKeyPress = (movementHandler: Handler, isOuter: boolean, moveForward: boolean): any => {
    return isOuter ?
      elementSelection(movementHandler, !moveForward) :
      listSelection(movementHandler);
  };
  const getSelected = (): any => current;
  const listen = function(): SelectionHandler<Type> {
    subscriptions = subscriptions.concat(subscribe([upKey, downKey], (): void => {
      handleKeyPress(verticalSelectionHandler, selectingVertically, keyboard.pressedUp());
    }));
    subscriptions = subscriptions.concat(subscribe([leftKey, rightKey], (): void => {
      handleKeyPress(horizontalSelectionHandler, !selectingVertically, keyboard.pressedRight());
    }));
    return this;
  };
  const methods: SelectorMethods<Type> = {
    selectVertically(): SelectionHandler<Type> {
      selectingVertically = isVertical === selectingVertically;
      isVertical = true;
      return this;
    },
    selectHorizontally(): SelectionHandler<Type> {
      selectingVertically = isVertical !== selectingVertically;
      isVertical = false;
      return this;
    },
    setSelections(newSelections: ArrayList<Type>): SelectionHandler<Type> {
      selections = newSelections;
      current = selections.getCurrentElement();
      previous.clear();
      return this;
    },
    vertical(selectionHandler: Handler): SelectionHandler<Type> {
      if (validateFunction(selectionHandler, "vertical")) {
        verticalSelectionHandler = selectionHandler;
      }
      return this;
    },
    horizontal(selectionHandler: Handler): SelectionHandler<Type> {
      if (validateFunction(selectionHandler, "horizontal")) {
        horizontalSelectionHandler = selectionHandler;
      }
      return this;
    },
    stop(): SelectionHandler<Type> {
      subscriptions.forEach((subscription: any): any => unsubscribe(subscription));
      return this;
    },
  };
  return Object.assign(methods, {getSelected, listen});
}
