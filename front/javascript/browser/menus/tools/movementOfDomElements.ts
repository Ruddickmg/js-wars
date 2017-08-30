import allSettings from "../../../settings/settings";
import timeKeeper, {Time} from "../../../tools/calculations/time";
import {Dictionary} from "../../../tools/dictionary";
import moveInDirection from "./moveInDirection";

export default function() {

    const millisecondsUntilOffScreen = 30;
    const settings: Dictionary = allSettings();
    const offScreen = Number(settings.get("offScreen"));
    const {wait}: Time = timeKeeper();

    const cleanUpAfterOffScreen = (element: any): Promise<any> => {

        return new Promise((resolve: any) => {

            element.style.transition = null;

            resolve(element);
        });
    };

    const moveElementOffScreen = (element: any, direction: string, speed: number): Promise<any> => {

        return wait(millisecondsUntilOffScreen)
            .then(() => {

                const movement = moveInDirection(direction, offScreen);
                const position = element.style.top.replace("px", "");

                element.style.transition = `top .${speed}s ease`;

                if (position && movement) {

                    element.style.top = `${position + movement}px`;
                }

                return cleanUpAfterOffScreen(element);
            });
    };

    const moveElementsOffScreen = (

        elements: any[],
        direction: string,
        speed: number = 5,
        index: number = 0,

    ): Promise<any> => {

        const timeBetweenMovingElements = speed * 100;

        if (elements.length > index) {

            return moveElementOffScreen(elements[index], direction, speed)
                .then(() => wait(timeBetweenMovingElements))
                .then(() => moveElementsOffScreen(elements, direction, speed, index + 1));
        }

        return Promise.resolve(elements);
    };

    return {

        moveElementOffScreen,
        moveElementsOffScreen,
    };
}
