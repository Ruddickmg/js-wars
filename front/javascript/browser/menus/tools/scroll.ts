// import notifications, {PubSub} from "../../tools/pubSub";
import keyBoardInput, {KeyBoard} from "../../input/keyboard";

export default function() {

    let then: Date = new Date();
    let move: number = 0;

    const minimumTimeBetweenSwipes: number = 200;
    const center: number = 0;
    const down: number = 1;
    const left: number = -1;
    const right: number = 1;
    const up: number = -1;
    const directionalValues: any = {down, left, right, up};
    const {getAssignment}: KeyBoard = keyBoardInput();

    const timePassedSince = (previous: Date): number => Number(new Date()) - Number(previous);
    const movementBasedScroll = (movement: number, negativeMovement: string, positiveMovement: string): number => {

        if (timePassedSince(then) > minimumTimeBetweenSwipes) {

            then = new Date();

            return scroll(movement < center ? negativeMovement : positiveMovement);
        }
    };
    const keyBoardBasedScroll = (pressedKey: number): number => scroll(getAssignment(pressedKey));
    const scroll = function(direction: string): number {

        const scrolling: boolean = Object.keys(directionalValues).indexOf(direction) > -1;

        move = scrolling ? directionalValues[direction] : center;

        return move;
    };

    return {
        keyBoardBasedScroll,
        movementBasedScroll,
        horizontal() {

            // TODO
        },
        vertical() {

            // TODO
        },
        infinite(index: number, firstIndex: number, lastIndex: number): number {

            const next: number = index + move;
            const wrapped: number = move < center ? lastIndex : firstIndex;

            move = (next > lastIndex || next < firstIndex) ? wrapped : next;

            return move;
        },
        finite(index: number, firstIndex: number, lastIndex: number) {

            const next = index + move;

            if (next <= lastIndex && next >= firstIndex) {

                move = next;

                return next;
            }

            return index;
        },
        wheel() {

            // TODO
        },
        swipe() {

            // TODO
        },
    };
}
