import zipWith from "../../tools/zipWith.spec";
import {default as createList, List} from "./list";
import {default as scrollHandler, ScrollHandler} from "./scrollHandler";

export interface UList extends List {

    element(): any;
    moveToElement(element: any): UList;
    hideAll(): UList;
    move(element: any): UList;
    setLeft(left: string | number): UList;
    highlight(): UList;
    deHighlight(): UList;
    show(property: string, display: any): UList;
    hide(): any;
    value(): any;
    add(element: any): any;
    setId(id: string | number): any;
    getId(element: any): string | number;
    className(element: any): any;
    setClass(desiredClass: string | number): any;
    setBackgroundColor(color: string): any;
    prepHorizontal(): UList;
}

export default function(parent: any = document.createElement("ul"), childNodes: any = []): UList {

    const children: any[] = childNodes || Array.prototype.slice.call(parent.childNodes);
    const scroller: ScrollHandler = scrollHandler();
    const display = (element: any, elementDisplaySetting: string = null): any => {

        element.style.display = elementDisplaySetting;

        return element;
    };
    const hideElement = (element: any): any => display(element, "none");
    const showElement = (element: any): any => display(element);
    const getElement = (): any => parent;
    const setId = (id: string | number): any => parent.setAttribute("id", id);
    const setLeftPosition = (left: string | number): void => {

        parent.style.moveLeft = `${left}px`;
    };
    const highlight = (): void => setBackgroundColor("tan");
    const deHighlight = (): void => setBackgroundColor(null);
    const addElement = (element: any): any => parent.appendChild(element);
    const setClass = (desiredClass: string | number): any => parent.setAttribute("class", desiredClass);

    const hideAll = function(): void {

        this.forEach((element: any) => hideElement(element));
    };
    const moveAndScroll = function(element: any): void {

        const positionInList = this.currentIndex();

        scroller.moveToIndex(positionInList);

        this.moveToElement(element)
            .forEach((child: any, index: number) => {

                if (scroller.outOfBounds(index)) {

                    hideElement(child);

                } else {

                    showElement(child);
                }
            });
    };
    const setBackgroundColor = function(color: string = null): void {

        const currentElement = this.currentElement();

        currentElement.style.backgroundColor = color;
    };
    const className = function(element: any): any {

        return element ? element.className : this.currentElement().className;
    };
    const getIdOfCurrentElement = function(): string | number {

        return this.currentElement().id;
    };
    const valueOfCurrentElement = function(): any {

        return this.currentElement().innerHTML.toLowerCase();
    };

    const moveToElement = function(targetElement: any): void {

        hideElement(this.currentElement());
        this.moveToElement(targetElement);
        showElement(this.currentElement());
    };

    const moveToAndHighlightElement = function(targetElement: any, displaySetting: string = "block"): void {

        if (targetElement) {

            moveToElement(targetElement);
        }

        display(this.currentElement(), displaySetting);
    };

    const hideCurrentElement = function(): any {

        return hideElement(this.currentElement());
    };

    const prepHorizontal = function(): UList {

        const currentPlusLeftAndRightElements = this.neighbors(1);

        zipWith(currentPlusLeftAndRightElements, ["left", "center", "right"], (element, position) => {

            return element.setAttribute("pos", position);
        });

        return this;
    };

    return Object.assign(Object.create(createList(children)), {

        deHighlight,
        element,
        getIdOfCurrentElement,
        hideAll,
        highlight,
        moveAndScroll,
        moveToAndHighlightElement,
        moveToElement,
        setBackgroundColor,
        setLeftPosition,
        valueOfCurrentElement,
        addElement,
        className,
        hideCurrentElement,
        prepHorizontal,
        setClass,
        setId,
    });
}
