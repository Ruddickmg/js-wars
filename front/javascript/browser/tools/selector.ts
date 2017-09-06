import notifications, {PubSub} from "../../tools/pubSub";
import createStack, {Stack} from "../../tools/stack/listStack";
import typeChecker, {TypeChecker} from "../../tools/validation/typeChecker";
import createList, {List} from "../dom/list";
import keyboardInput, {KeyBoard} from "../input/keyboard";

interface SelectorMethods<Type> {

    selectVertically(): SelectionHandler<Type>;
    selectHorizontally(): SelectionHandler<Type>;
    setSelections(selections: List<Type>): SelectionHandler<Type>;
    vertical(selectionHandler: Handler): SelectionHandler<Type>;
    horizontal(selectionHandler: Handler): SelectionHandler<Type>;
    stop(): SelectionHandler<Type>;
}

export interface SelectionHandler<Type> extends SelectorMethods<Type> {

    getSelected(): Type;
    select(): void;
    start(): SelectionHandler<Type>;
}

type Handler = (selected: any, previous: any, selections: any) => any;

export default function<Type>(container: List<Type> = createList<any>()): SelectionHandler<Type> {

    const keyEvent: string = "keyPressed";
    const keyboard: KeyBoard = keyboardInput();
    const previous: Stack<List<Type>> = createStack<List<Type>>();
    const {isFunction, isDefined}: TypeChecker = typeChecker();
    const {subscribe, publish, unsubscribe}: PubSub = notifications();

    let subscription: number;
    let isVertical: boolean = true;
    let selections: List<Type> = container;
    let current: Type = selections.getCurrentElement();
    let verticalSelectionHandler: Handler;
    let horizontalSelectionHandler: Handler;

    const isList = (selection: any): boolean => isDefined(selection) && isFunction(selection.getCurrentElement);
    const elementSelection = (handleSelection: Handler, movingForward: boolean): any => {

        const selected = movingForward ? selections.next() : selections.previous();

        if (isDefined(selected) && isDefined(current)) {

            handleSelection(selected, current, selections);
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

                handleSelection(selected, current, selections);

                selections = list;
                current = selected;
            }
        }
    };
    const handleKeyPress = (movementHandler: Handler, isOuter: boolean, moveForward: boolean): void => {

        isOuter ? elementSelection(movementHandler, !moveForward) : listSelection(movementHandler);
    };
    const select = (): void => {

        const pressedUp: boolean = keyboard.pressedUp();
        const pressedDown: boolean = keyboard.pressedDown();
        const pressedLeft: boolean = keyboard.pressedLeft();
        const pressedRight: boolean = keyboard.pressedRight();

        if (pressedUp || pressedDown) {

            handleKeyPress(verticalSelectionHandler, isVertical, pressedUp);
        }

        if (pressedLeft || pressedRight) {

            handleKeyPress(horizontalSelectionHandler, !isVertical, pressedLeft);
        }
    };
    const getSelected = (): Type => current;
    const start = function(): SelectionHandler<Type> {

        subscription = subscribe(keyEvent, select) as number;

        return this;
    };
    const methods: SelectorMethods<Type> = {

        selectVertically(): SelectionHandler<Type> {

            isVertical = true;

            return this;
        },
        selectHorizontally(): SelectionHandler<Type> {

            isVertical = false;

            return this;
        },
        setSelections(newSelections: List<Type>): SelectionHandler<Type> {

            selections = newSelections;
            current = selections.getCurrentElement();
            previous.clear();

            return this;
        },
        vertical(selectionHandler: Handler): SelectionHandler<Type> {

            if (isFunction(selectionHandler)) {

                verticalSelectionHandler = selectionHandler;

            } else {

                publish("invalidInput", {className: "selectionHandler", method: "vertical", input: selectionHandler});
            }

            return this;
        },
        horizontal(selectionHandler: Handler): SelectionHandler<Type> {

            if (isFunction(selectionHandler)) {

                horizontalSelectionHandler = selectionHandler;

            } else {

                publish("invalidInput", {className: "selectionHandler", method: "vertical", input: selectionHandler});
            }

            return this;
        },
        stop(): SelectionHandler<Type> {

            unsubscribe(subscription, keyEvent);

            return this;
        },
    };

    return Object.assign(methods, {select, getSelected, start});
}
