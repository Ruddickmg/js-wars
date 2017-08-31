import notifications, {PubSub} from "../../../tools/pubSub";
import single from "../../../tools/singleton";
import typeChecker, {TypeChecker} from "../../../tools/typeChecker";
import dom from "../../dom/dom";
import {Element, isElement} from "../../dom/element";

export interface GameScreen {

    add(name: string, element: Element<any>): void;
    clear(): Array<Element<any>>;
    get(name: string): Element<any>;
    remove(name: string): Element<any>;
    setClass(name: string): void;
}

export default single<GameScreen>(function(): GameScreen {

    const {publish}: PubSub = notifications();
    const {isString}: TypeChecker = typeChecker();
    const scriptTag: string = "script";
    const gameScreenId: string = "gameScreen";
    const gameScreen: any = document.getElementById(gameScreenId);
    const firstScript: any = dom.getFirst(scriptTag);
    const elements: any = {};

    const clear = (): Array<Element<any>> => Object.keys(elements).map(remove);
    const get = (name: string): Element<any> => {

        if (isString(name)) {

            return elements[name];
        }
        publish("invalidInput", {className: "gameScreen", method: "get", input: name});
    };
    const add = (name: string, element: Element<any>): void => {

        if (isString(name)) {
            if (isElement(element)) {

                elements[name] = element;

                gameScreen.appendChild(element.element);

                element.parent = gameScreen;

                return;
            }
            publish("invalidInput", {className: "gameScreen", method: "add", input: element});
        }
        publish("invalidInput", {className: "gameScreen", method: "add", input: name});
    };
    const remove = (name: string): any => {

        const element: any = elements[name];

        if (isString(name)) {

            gameScreen.removeChild(element.element);

            element.parent = undefined;

            delete elements[name];

            return element;
        }
        publish("invalidInput", {className: "gameScreen", method: "remove", input: name});
    };
    const setClass = (name: string): void => {

        gameScreen.setAttribute("class", name);
    };
    if (!gameScreen) {

        document.body.insertBefore(gameScreen, firstScript);
    }

    return {

        add,
        clear,
        get,
        remove,
        setClass,
    };
});
