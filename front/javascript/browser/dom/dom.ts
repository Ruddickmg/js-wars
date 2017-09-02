import {Dimensions} from "../../game/coordinates/dimensions";
import getSettings from "../../settings/settings";
import {Dictionary} from "../../tools/dictionary";
import indexExists from "../../tools/nonNegativeIndex";
import single from "../../tools/singleton";
import typeChecker, {TypeChecker} from "../../tools/typeChecker";
import createElement, {Element} from "./element";

export interface Dom {

    getFirst(tag: string): any;
    createCanvas(id: any, element: any, dimension: Dimensions): any;
    createCanvasLi(id: any, object: any, dimensions: Dimensions): any;
    createList(id: string, list: any, displayedAttributes?: any[]): any;
    findElementByTag(tag: string, value: string, elements: any[]): any;
    getDisplayedValue(id: string): string;
    getUrlParameters(): string;
    redirectTo(url: string): void;
    removeChildrenOfElement(element: any): void;
    removeElement(element: any): void;
    createMenu(

        listOfProperties: any,
        allowedProperties: string[],
        {div, section}: any,
        editList?: any,

    ): any;
}

export default single<Dom>(function(): Dom {

    const settings: Dictionary = getSettings();
    const {isObject, isDefined}: TypeChecker = typeChecker();
    const nameOfInsertLocation: string = "before";
    const insertLocation: any = document.getElementById(nameOfInsertLocation);

    const removeElement = (element: any) => {

        const existingElement = document.getElementById(element);

        if (existingElement) {

            existingElement.parentNode.removeChild(existingElement);
        }

        return this;
    };

    const createCanvas = (id: any, {type, className}: any, {width, height}: Dimensions): any => {

        const canvas = createElement(type || `${id}Canvas`, "canvas");
        const animationContext: string = settings.get("canvas", "context");
        const context = canvas.element.getContext(animationContext);

        canvas.setWidth(width);
        canvas.setHeight(height);

        return {

            canvas,
            context,
            type,
            className,
        };
    };

    const createCanvasLi = (id: any, object: any, dimensions: Dimensions = {width: 128, height: 128}): any => {

        const li: Element<any> = createElement(`${id}Canvas`, "li").setClass("canvas");
        const {canvas}: any = createCanvas(id, object, dimensions);

        li.appendChild(canvas);

        return li;
    };

    const createList = (id: string, list: any, limitations: any[] = []): any => {

        const ul = createElement("ul", id);
        const properties = Object.keys(list);
        const none: number = 0;
        const unlimited = limitations.length <= none;

        let li: Element<any>;

        properties.forEach((property: string, index: number) => {

            const value = list[property];
            const count: number = index + 1;

            if (unlimited || limitations.indexOf(property) > -1 && isDefined(value)) {

                li = createElement(`${property}#${count}`, "li").setClass(property);

                // if (list.hideCurrentElement) {
                //
                //     li.style.display = "none";
                // }

                if (isObject(value)) {

                    li.appendChild(createList(value, property, limitations));

                } else {

                    li.setText(property);
                }

                ul.appendChild(li);
            }
        });

        return ul;
    };

    const getDisplayedValue = (element: Element<any>): any => {

        const hidden = "none";
        const isHidden = ({style}: any): boolean => style.display !== hidden;
        const displayed: Element<any> = element.children
            .find((child: Element<any>): boolean => isHidden(child.element));

        if (isDefined(displayed)) {

            return displayed.getValue();
        }
    };

    const removeChildrenOfElement = (element: any): void => {

        while (element.firstChild) {

            element.removeChild(element.firstChild);
        }
    };

    const findElementByTag = (tag: string, value: string, elements: any[]): any => {

        const numberOfElements: number = elements.length;

        let index: number = 0;
        let element: any;

        for (index; index < numberOfElements; index += 1) {

            element = elements[index];

            if (element.getAttribute(tag) === value) {

                return element;
            }
        }
    };

    const createMenu = (

        listOfProperties: any,
        allowedProperties: string[] = [],
        {div, section}: any,
        editList?: any,

    ): any => {

        const display: any = createElement(section, "section");
        const innerScreen: any = createElement(div, "div");
        const properties: string[] = Object.keys(listOfProperties);
        const first: number = 0;

        properties.forEach((propertyName: string, index: number): void => {

            const listObject = listOfProperties[propertyName];
            const list = createList(propertyName, listObject, allowedProperties);

            if (index === first) {

                list.setAttribute("id", listObject.id);
            }

            if (div) {

                list.setAttribute("class", `${div}Item`);
            }

            if (editList) {

                editList(list, propertyName);
            }

            innerScreen.appendChild(list);
        });

        display.appendChild(innerScreen);

        return display;
    };

    const redirectTo = (url: string): void => {

        window.top.location.href = url;
    };

    const getUrlParameters = (): string => {

        const url = window.location.toString();
        const indexOfParameterList = url.indexOf("?");

        return indexExists(indexOfParameterList) ? url.slice(indexOfParameterList) : "";
    };

    const getFirst = (tag: string): any => document.getElementsByTagName(tag)[0];

    return {

        createCanvas,
        createCanvasLi,
        createList,
        createMenu,
        findElementByTag,
        getDisplayedValue,
        getFirst,
        getUrlParameters,
        redirectTo,
        removeChildrenOfElement,
        removeElement,
    };
})();
