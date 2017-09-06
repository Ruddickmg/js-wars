import notifications, {PubSub} from "../../../tools/pubSub";
import single from "../../../tools/singleton";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import {Element, isElement} from "../../dom/element";
import findFirstElementWithTag from "../../tools/findFirstElemenWithTag";

export interface GameScreen {

    add(name: string, element: Element<any>): GameScreen;
    clear(): Array<Element<any>>;
    get(name: string): Element<any>;
    remove(name: string): Element<any>;
    replace(name: string, replacement: Element<any>): GameScreen;
    setClass(name: string): GameScreen;
}

export default single<GameScreen>(function(): GameScreen {

    const className: string = "gameScreen";
    const scriptTag: string = "script";
    const elements: any = {};

    const {publish}: PubSub = notifications();
    const {isString, isDefined}: TypeChecker = typeChecker();
    const gameScreen: any = document.getElementById(className);
    const firstScript: any = findFirstElementWithTag(scriptTag);

    const validString = (name: string, method: string): boolean => {

        if (isString(name)) {

            return true;
        }

        publish("invalidInput", {className, method, input: name});

        return false;
    };
    const validElement = (element: Element<any>, method: string): boolean => {

        if (isElement(element)) {

            return true;
        }

        publish("invalidInput", {className, method, input: element});

        return false;
    };
    const validNameAndElement = (name: string, element: Element<any>, method: string) => {

        return validString(name, method) && validElement(element, method);
    };
    const clear = (): Array<Element<any>> => Object.keys(elements).map(remove);
    const get = (name: string): Element<any> => {

        if (validString(name, "get")) {
            if (isDefined(elements[name])) {

                return elements[name];
            }
            publish("notFound", {className, method: "get", message: "child does not exist", input: name});
        }
    };
    const add = function(name: string, element: Element<any>): GameScreen {

        const method: string = "add";

        if (validNameAndElement(name, element, method)) {
            if (isDefined(elements[name])) {

                publish("customError", {
                    className,
                    input: name,
                    message: "element has already been assigned to provided key",
                    method,
                });

            } else {

                elements[name] = element;

                gameScreen.appendChild(element.element);

                element.parent = gameScreen;
            }
        }

        return this;
    };
    const remove = (name: string): any => {

        const element: Element<any> = elements[name];

        if (validString(name, "remove")) {

            gameScreen.removeChild(element.element);

            element.parent = undefined;

            delete elements[name];

            return element;
        }
    };
    const setClass = function(name: string): GameScreen {

        if (validString(name, "setClass")) {

            gameScreen.setAttribute("class", name);
        }

        return this;
    };
    const replace = function(name: string, replacement: Element<any>): GameScreen {

        const old: Element<any> = get(name);

        if (old && validElement(replacement, "replace")) {

            gameScreen.replaceChild(replacement.element, old.element);
            elements[name] = replacement;
        }

        return this;
    };

    if (!gameScreen) {

        document.body.insertBefore(gameScreen, firstScript);
    }

    return {

        add,
        clear,
        get,
        remove,
        replace,
        setClass,
    };
});
