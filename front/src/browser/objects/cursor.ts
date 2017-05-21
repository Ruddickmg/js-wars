/**
 * Created by moonmaster on 5/13/17.
 */

import {default as createPosition, Position} from "../../coordinates/position";
import single from "../../tools/singleton";

function cursor(initialX: number = 0, initialY: number = 0) {

    let position = createPosition(initialX, initialY);

    const getPosition = () => position;
    const setPosition = ({x, y}: Position) => {

        position = createPosition(x, y);
    };

    return {
        setPosition,
        getPosition,
    };
}

export default single(cursor(7, 5));
