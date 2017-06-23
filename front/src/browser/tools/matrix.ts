/**
 * Created by moonmaster on 5/27/17.
 */

import {Position} from "../../coordinates/position";
import typeChecker, {TypeChecker} from "../../tools/typeChecker";

export interface Matrix {

    insert(position: Position, value: any): any;
    get(position: Position): any;
    remove(position: Position): any;
}

export default function() {

    const check: TypeChecker = typeChecker();
    const matrix: any = {};
    const insert = ({x, y}: Position, value: any): any => {

        if (!matrix[x]) {

            matrix[x] = {};
        }

        matrix[x][y] = value;

        return matrix[x][y];
    };
    const get = ({x, y}: Position): any => {

        if (matrix[x]) {

            return matrix[x][y];
        }
    };
    const remove = (position: Position): any => {

        const {x, y}: Position = position;
        const removed = get(position);

        if (check.isDefined(removed)) {

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
