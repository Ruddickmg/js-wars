import notifications, {PubSub} from "../../tools/pubSub";
import typeChecker, {TypeChecker} from "../../tools/validation/typeChecker";
import wrapIndex from "../../tools/wrapIndex";
import {Element} from "../dom/element";
import {isList, List} from "../dom/list";

export type Scroller = (movingForward: boolean) => void;
export type ScrollHandler = (list: List<Element<any>>) => Scroller;

export default (function() {

    const className: string = "scrolling";
    const {publish}: PubSub = notifications();
    const {isNumber, isBoolean}: TypeChecker = typeChecker();
    const oneStep: number = 1;
    const firstIndex: number = 0;
    const floor = Math.floor;
    const min = Math.min;
    const max = Math.max;
    const abs = Math.abs;
    const getLastIndex = (currentList: List<Element<any>>): number => currentList.length() - 1;
    const getValueOfDirection = (movingForward: boolean): number => movingForward ? 1 : -1;
    const showElement = (element: Element<any>): any => element.show();
    const getDistance = (index: number, secondIndex: number, length: number) => {

        return index >= secondIndex ? abs((length - index) + secondIndex) : secondIndex - index;
    };

    return (numberOfElementsToShow: number = 1, amountOfBuffering: number = 0): ScrollHandler => {

        let bufferAmount: number;
        let amountOfElementsToShow: number;
        let firstElementToShow: number;
        let lastElementToShow: number;
        let amountAbove: number;
        let amountBelow: number;
        let list: List<Element<any>>;

        const canScroll = (index: number): boolean => {

            const lastIndex: number = getLastIndex(list);

            return lastIndex > amountOfElementsToShow
                && index + bufferAmount + oneStep >= firstIndex
                && index - bufferAmount - oneStep <= lastIndex;
        };
        const scroll = (movingForward: boolean, currentIndex: number): any => {

            let elementToShow: number;

            const lastIndex: number = getLastIndex(list);
            const length: number = list.length();
            const movement: number = getValueOfDirection(movingForward);
            const elementToHide: number = movingForward ? firstElementToShow : lastElementToShow;
            const distanceFromEdge: number = movingForward ?
                getDistance(currentIndex, lastIndex, length) :
                getDistance(firstIndex, currentIndex, length);

            if (distanceFromEdge > bufferAmount) {

                firstElementToShow = wrapIndex(firstElementToShow + movement, length);
                lastElementToShow = wrapIndex(lastElementToShow + movement, length);
                elementToShow = movingForward ? lastElementToShow : firstElementToShow;

                list.getElementAtIndex(elementToShow).show();
                list.getElementAtIndex(elementToHide).hide();
            }
        };
        const scroller = (movingForward: boolean): void => {

            const index: number = list.getCurrentIndex();

            if (isBoolean(movingForward)) {

                if (canScroll(index)) {

                    scroll(movingForward, index);
                }
            } else {

                publish("invalidInputError", {className, method: "scroller", input: movingForward});
            }
        };
        const setList = (listToBeScrolled: List<Element<any>>): Scroller => {

            let currentIndex: number;
            let lastIndex: number;
            let positionOfFirstElement: number;
            let positionOfLastElement: number;

            if (isList(listToBeScrolled)) {

                lastIndex = getLastIndex(listToBeScrolled);
                currentIndex = listToBeScrolled.getCurrentIndex();
                positionOfFirstElement = currentIndex - amountAbove;
                positionOfLastElement = currentIndex + amountBelow;

                firstElementToShow = positionOfLastElement > lastIndex ?
                    lastIndex - numberOfElementsToShow :
                    max(positionOfFirstElement, firstIndex);

                lastElementToShow = positionOfFirstElement < firstIndex ?
                    numberOfElementsToShow :
                    min(positionOfLastElement, lastIndex);

                if (lastIndex < amountOfElementsToShow) {

                    listToBeScrolled.forEach(showElement);

                }  else {

                    listToBeScrolled.modify(showElement, firstElementToShow, lastElementToShow);
                }

                list = listToBeScrolled;

                return scroller;
            }

            publish("invalidInputError", {className, method: "setList", input: listToBeScrolled});
        };
        const numberOfElementsIsANumber: boolean = isNumber(numberOfElementsToShow);

        if (numberOfElementsIsANumber && isNumber(amountOfBuffering)) {

            bufferAmount = max(amountOfBuffering, firstIndex);
            amountOfElementsToShow = max(numberOfElementsToShow - 1, firstIndex);
            amountAbove = floor(amountOfElementsToShow / 2);
            amountBelow = amountOfElementsToShow - amountAbove;

            return setList;
        }

        publish("invalidInputError", {
            className,
            input: numberOfElementsIsANumber ? amountOfBuffering : numberOfElementsToShow,
            method: "constructor",
        });
    };
}());
