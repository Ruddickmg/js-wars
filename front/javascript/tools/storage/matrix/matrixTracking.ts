import createPosition, {Position} from "../../../game/coordinates/position";
import createMatrix, {Matrix} from "./matrix";

export interface MatrixTracker<Type> {

    clear(): MatrixTracker<Type>;
    close(element: Type): MatrixTracker<Type>;
    getElement(element: Type): Type;
    getF(element: Type): number;
    getG(element: Type): number;
    getParent(element: Type): Type;
    getPosition(position: Position): Type;
    setF(element: Type, value: number): MatrixTracker<Type>;
    setG(element: Type, value: number): MatrixTracker<Type>;
    setParent(element: Type, parent: Type): MatrixTracker<Type>;
}

export default function<Type>(
    positionOfElement: (element: Type) => Position = (element: any) => element.position,
): MatrixTracker<Type> {

    let tracking: Matrix = createMatrix();

    const parentId: string = "parent";
    const fId: string = "f";
    const gId: string = "g";
    const add = function(currentPosition: Position): MatrixTracker<Type> {

        const {x, y} = currentPosition;
        tracking.insert(currentPosition, {position: createPosition(x, y)});

        return this;
    };

    const clear = function(): MatrixTracker<Type> {

        tracking = createMatrix();

        return this;
    };

    const close = function(element: Type): MatrixTracker<Type> {

        add(positionOfElement(element));

        return this;
    };
    const get = (element: Type, property: string): any => {

        const stored = tracking.get(positionOfElement(element));

        if (stored) {

            return stored[property];
        }
    };
    const getElement = (element: Type): Type => getPosition(positionOfElement(element));
    const getF = (element: Type): number => get(element, fId);
    const getG = (element: Type): number => get(element, gId);
    const getParent = (element: Type): Type => get(element, parentId);
    const getPosition = function(position: Position): Type {

        return tracking.get(position);
    };
    const setF = function(element: Type, value: number): MatrixTracker<Type> {

        set(element, value, fId);

        return this;
    };
    const setG =  function(element: Type, value: number): MatrixTracker<Type> {

        set(element, value, gId);

        return this;
    };
    const setParent = function(element: Type, parent: Type): MatrixTracker<Type> {

        set(element, parent, parentId);

        return this;
    };
    const set = function(element: Type, value: any, property: string): void {

        const stored = tracking.get(positionOfElement(element));

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
