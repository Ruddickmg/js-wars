import notifications, {PubSub} from "../../tools/pubSub";
import typeChecker, {TypeChecker} from "../../tools/typeChecker";
import createList, {List} from "../dom/list";
import keyboardInput, {KeyBoard} from "../input/keyboard";

interface SelectorMethods {

    selectVertically(): SelectionHandler;
    selectHorizontally(): SelectionHandler;
    vertical(selectionHandler: Handler): SelectionHandler;
    horizontal(selectionHandler: Handler): SelectionHandler;
    stop(): SelectionHandler;
}

export interface SelectionHandler extends SelectorMethods {

    selected(): any;
    select(): any;
}

type Handler = (selected: any, previous: any, selections: any) => any;

export default function<OuterType>(...initialSelections: OuterType[]): SelectionHandler {

    const keyEvent: string = "keyPressed";
    const {isFunction, isDefined}: TypeChecker = typeChecker();
    const container: List<OuterType> = createList<OuterType>(initialSelections);
    const {subscribe, publish, unsubscribe}: PubSub = notifications();
    const keyboard: KeyBoard = keyboardInput();

    let isVertical: boolean = true;
    let selections: List<any> = container;
    let current: any = selections.getCurrentElement();
    let verticalSelectionHandler: Handler;
    let horizontalSelectionHandler: Handler;

    const isIterable = (selection: any): boolean => isDefined(selection) && isFunction(selection.getCurrentElement);
    const elementSelection = (movementHandler: Handler, moveForward: boolean): any => {

        const selected = moveForward ? selections.next() : selections.previous();

        movementHandler(selected, current, selections);

        current = selected;
    };
    const listSelection = (movementHandler: Handler): any => {

        const targetList: List<any> = selections.getCurrentElement();
        const list: List<any> = isIterable(targetList) ? targetList : container;
        const selected: any = list.getCurrentElement();

        if (isDefined(selected)) {

            movementHandler(selected, current, selections);

            selections = list;
            current = selected;
        }
    };
    const assignHandlers = (movementHandler: Handler, isOuter: boolean, moveForward: boolean): any => {

        return isOuter ?
            elementSelection(movementHandler, !moveForward) :
            listSelection(movementHandler);
    };

    const select = (): any => {

        const pressedUp: boolean = keyboard.pressedUp();
        const pressedDown: boolean = keyboard.pressedDown();
        const pressedLeft: boolean = keyboard.pressedLeft();
        const pressedRight: boolean = keyboard.pressedRight();

        if (pressedUp || pressedDown) {

            assignHandlers(verticalSelectionHandler, isVertical, pressedUp);
        }

        if (pressedLeft || pressedRight) {

            assignHandlers(horizontalSelectionHandler, !isVertical, pressedRight);
        }
    };

    const selected = (): any => current;
    const subscription: any = subscribe(keyEvent, select);
    const methods: SelectorMethods = {

        selectVertically(): SelectionHandler {

            isVertical = true;

            return this;
        },
        selectHorizontally(): SelectionHandler {

            isVertical = false;

            return this;
        },
        vertical(selectionHandler: Handler): SelectionHandler {

            if (isFunction(selectionHandler)) {

                verticalSelectionHandler = selectionHandler;

                return this;

            } else {

                publish("invalidInput", {className: "selectionHandler", method: "vertical", input: selectionHandler});
            }
        },
        horizontal(selectionHandler: Handler): SelectionHandler {

            if (isFunction(selectionHandler)) {

                horizontalSelectionHandler = selectionHandler;

                return this;

            } else {

                publish("invalidInput", {className: "selectionHandler", method: "vertical", input: selectionHandler});
            }
        },
        stop(): SelectionHandler {

            unsubscribe(subscription, keyEvent);

            return this;
        },
    };

    return Object.assign(methods, {select, selected});
}
