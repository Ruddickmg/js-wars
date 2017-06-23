import {Dimensions} from "../../coordinates/dimensions";
import settings from "../../settings/settings";
import single from "../../tools/singleton";
import typeChecker, {TypeChecker} from "../../tools/typeChecker";

export interface Dom {

    removeElement(element: any): void;
    createCanvas(id: any, element: any, dimension: Dimensions): any;
    createCanvasLi(id: any, object: any, dimensions: Dimensions): any;
    createElement(type: string, id?: any, classOfElement?: string): any;
    createList(id: string, list: any, displayedAttributes?: any[]): any;
    getDisplayedValue(id: string): string;
    removeChildrenOfElement(element: any): void;
    findElementByTag(tag: string, value: string, elements: any[]): any;
    getImmediateChildrenByTagName(element: any, tag: string): any[];
    show(element: any, display: string): any;
    hide(elementName: string): void;
    changeDefault(change: string, element: any): void;
    getDefault(element: any): string;
    appendOrReplace(element: any): void;
    createMenu(

        listOfProperties: any,
        allowedProperties: string[],
        {div, section}: any,
        editList?: any,

    ): any;
}

export default single<Dom>(function(): Dom {

    const check: TypeChecker = typeChecker();
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

        const canvas = document.createElement("canvas");
        const animationContext = settings.get("canvas", "context"); // TODO include in settings
        const context = canvas.getContext(animationContext);

        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);
        canvas.setAttribute("id", type || `${id}Canvas`);

        return {

            canvas,
            context,
            type,
            className,
        };
    };

    const createCanvasLi = (id: any, object: any, dimensions: Dimensions = {width: 128, height: 128}): any => {

        const li = createElement("li", false, "canvas");
        const {canvas}: any = createCanvas(id, object, dimensions);

        li.appendChild(canvas);

        return li;
    };

    const createElement = (type: string, id?: any, classOfElement?: string): any => {

        const element = document.createElement(type);

        if (classOfElement) {

            element.setAttribute("class", classOfElement);
        }

        if (id) {

            element.setAttribute("id", id);
        }

        return element;
    };

    const createList = (id: string, list: any, limitations: any[] = []): any => {

        const ul = createElement("ul", id);
        const properties = Object.keys(list);
        const none: number = 0;
        const unlimited = limitations.length <= none;
        const {isDefined} = check;

        let li;

        properties.forEach((property: string) => {

            const value = list[property];

            if (unlimited || limitations.indexOf(property) > -1 && isDefined(value)) {

                li = createElement("li", false, property);

                // if (list.hideCurrentElement) {
                //
                //     li.style.display = "none";
                // }

                if (check.isObject(value)) {

                    li.appendChild(createList(value, property, limitations));

                } else {

                    li.innerHTML = property;
                }

                ul.appendChild(li);
            }
        });

        return ul;
    };

    const getDisplayedValue = (id: string): string => {

        const hidden = "none";
        const isHidden = ({style}: any): boolean => style.display !== hidden;
        const element = document.getElementById(id);
        const children = element.childNodes;
        const length = children.length;

        let child;
        let indexOfChild;

        for (indexOfChild = 0; indexOfChild < length; indexOfChild += 1) {

            child = children[indexOfChild];

            if (isHidden(child)) {

                return child.getAttribute("class");
            }
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

    const getImmediateChildrenByTagName = (element: any, tag: string): any[] => {

        const elements = [];
        const children = element.childNodes;
        const tagName = tag.toUpperCase();
        const amountOfChildren = children.length;
        const elementType = 1;

        let indexOfChild = 0;
        let child;

        if (element) {

            for (indexOfChild; indexOfChild < amountOfChildren; indexOfChild += 1) {

                child = children[indexOfChild];

                if (child.nodeType === elementType && child.tagName === tagName) {

                    elements.push(child);
                }
            }
        }

        return elements;
    };

    const show = (element: any, display: string = ""): any => {

        element.style.display = display;
        element.setAttribute("default", true );

        return element.getAttribute("class");
    };

    const hide = function(elementName: string) {

        const element = document.getElementById(elementName);

        element.hidden.style.visibility = "hidden";
    };

    const changeDefault = (change: string, element: any): void => {

        const nodes = element.childNodes;
        const amountOfChildren = nodes.length;

        let indexOfChild = 0;
        let node;

        for (indexOfChild; indexOfChild < amountOfChildren; indexOfChild += 1) {

            node = nodes[indexOfChild];

            if (node.getAttribute("default")) {

                node.style.display = "none";
                node.removeAttribute("default");
            }

            if (node.getAttribute("class") === change) {

                show(node);
            }
        }
    };

    const getDefault = (element: any): string => {

        const children: any[] = element.childNodes;

        let indexOfChild: number = 0;
        let child;

        if (element && children) {

            while (children[indexOfChild]) {

                child = children[indexOfChild];

                if (child.getAttribute("default")) {

                    return child.getAttribute("class");
                }

                indexOfChild += 1;
            }
        }
    };

    const appendOrReplace = (element: any): void => {

        const nameOfElement: string = element.id;
        const exists = document.getElementById(nameOfElement);

        if (exists) {

            exists.parentNode.replaceChild(element, exists);

        } else {

            document.body.insertBefore(element, insertLocation);
        }
    };

    const createMenu = (

        listOfProperties: any,
        allowedProperties: string[] = [],
        {div, section}: any,
        editList?: any,

    ): any => {

        const display: any = createElement("section", section);
        const innerScreen: any = createElement("div", div);
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

    return {

        appendOrReplace,
        changeDefault,
        createCanvas,
        createCanvasLi,
        createElement,
        createList,
        createMenu,
        findElementByTag,
        getDefault,
        getDisplayedValue,
        getImmediateChildrenByTagName,
        hide,
        removeChildrenOfElement,
        removeElement,
        show,
    };
})();
