/**
 * Created by moonmaster on 5/13/17.
 */

import {default as pubSub, PubSub} from "../../src/tools/pubSub";

function pubSubTest() {

     const router: PubSub = pubSub();

     router.subscribe("cursorPosition", ({x, y}) => {

         console.log(`subscriber 1 recieved cursor Position change! position is now X: ${x}, Y: ${y}`);
     });

     router.publish("cursorPosition", {x: 5, y: 6});
}

pubSubTest();