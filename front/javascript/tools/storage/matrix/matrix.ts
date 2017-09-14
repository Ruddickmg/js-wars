import {Position} from "../../../game/coordinates/position";
import typeChecker, {TypeChecker} from "../../validation/typeChecker";

export interface Matrix<Type> {

    insert(position: Position, value: Type): Type;
    get(position: Position): Type;
    remove(position: Position): Type;
}

export default function<Type>(): Matrix<Type> {

    const {isDefined}: TypeChecker = typeChecker();
    const matrix: any = {};
    const insert = ({x, y}: Position, value: Type): Type => {

        if (!matrix[x]) {

            matrix[x] = {};
        }

        matrix[x][y] = value;

        return matrix[x][y];
    };
    const get = ({x, y}: Position): Type => {

        if (matrix[x]) {

            return matrix[x][y];
        }
    };
    const remove = (position: Position): Type => {

        const {x, y}: Position = position;
        const removed = get(position);

        if (isDefined(removed)) {

            delete matrix[x][y];
        }

        return removed;
    };

    return {

        get,
        insert,
        remove,
    };
}
