import createPosition, {Position} from "../../coordinates/position";
import {MapElement} from "../../game/map/elements/defaults";
import createMatrix, {Matrix} from "./matrix";

export interface MatrixTracker {

    clear(): MatrixTracker;
    close(element: MapElement): any;
    getElement({position}: MapElement): any;
    getF(element: MapElement): number;
    getG(element: MapElement): number;
    getParent(element: MapElement): any;
    getPosition(position: Position): void;
    setF(element: MapElement, value: number): MatrixTracker;
    setG(element: MapElement, value: number): MatrixTracker;
    setParent(element: MapElement, value: number): MatrixTracker;
}

export default function() {

    let tracking: Matrix = createMatrix();

    const add = function(currentPosition: Position): MatrixTracker {

        const {x, y} = currentPosition;
        tracking.insert(currentPosition, {position: createPosition(x, y)});

        return this;
    };

    const clear = function(): MatrixTracker {

        tracking = createMatrix();

        return this;
    };

    const close = function(element: MapElement): MatrixTracker {

        const position = element.position;

        add(position);

        return getPosition(position);
    };
    const get = function(element: MapElement, property: string): any {

        const stored = tracking.get(element.position);

        if (stored) {

            return stored[property];
        }
    };
    const getElement = ({position}: MapElement): any => getPosition(position);
    const getF = (element: MapElement): number => get(element, "f");
    const getG = (element: MapElement): number => get(element, "g");
    const getParent = (element: MapElement) => get(element, "p");
    const getPosition = function(position: Position): any {

        return tracking.get(position);
    };
    const setF = function(element: MapElement, value: number): MatrixTracker {

        set(element, value, "f");

        return this;
    };
    const setG =  function(element: MapElement, value: number): MatrixTracker {

        set(element, value, "g");

        return this;
    };
    const setParent = function(element: MapElement, value: number): MatrixTracker {

        set(element, value, "p");

        return this;
    };
    const set = function(element: MapElement, value: any, property: string): void {

        const stored = tracking.get(element.position);

        if (stored) {

            stored[property] = value;
        }
    };

    return {

        clear,
        close,
        getElement,
        getF,
        getG,
        getParent,
        getPosition,
        setF,
        setG,
        setParent,
    };
}
