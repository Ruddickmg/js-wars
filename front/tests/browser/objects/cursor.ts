/**
 * Created by moonmaster on 5/13/17.
 */

import {default as single} from "../../tools/singleton.spec";

function cursor(x, y) {

    return {
        x, y,
        setPosition,
        getPosition,
    };
}

export default single(cursor());
