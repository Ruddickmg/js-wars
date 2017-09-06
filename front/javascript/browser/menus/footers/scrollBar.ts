import textWidthChecker, {TextWidthChecker} from "../../../tools/calculations/textWidth";
import timeKeeper, {Time} from "../../../tools/calculations/time";
import notifications, {PubSub} from "../../../tools/pubSub";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import createElement, {Element} from "../../dom/element";

export interface ScrollBar extends Element<string> {

    scroll(): void;
    setText(text: string): ScrollBar;
    stop(): ScrollBar;
}

export default function() {

    const scrollingSpeed: number = 4;
    const offScreen: number = 1;
    const widthType: string = "client";
    const amountToIncrementBy: number = 1;
    const scrollBar: Element<any> = createElement("scrollBar", "footer");
    const text: Element<any> = createElement("scrollingInfo", "p");

    const calculator: TextWidthChecker = textWidthChecker();
    const {isString}: TypeChecker = typeChecker();
    const {subscribe}: PubSub = notifications();
    const time: Time = timeKeeper();
    const textPosition = (): number => text.position().left;
    const textHasMovedOffScreen = (): boolean => {

        const limit: number = scrollBar.getWidth(widthType);
        const position: number = textPosition();

        return position > limit;
    };
    const widthOfText = (): number => calculator.calculateTextWidth(text.text, "30px").width;
    const increase = (): void => move(amountToIncrementBy);
    // const decrease = (): void => move(-amountToIncrementBy);
    const reset = (): any => text.setLeft(-widthOfText() * offScreen);
    const move = (movement: number): void => {

        text.setLeft(textPosition() + movement);
    };
    const setText = function(message: string): ScrollBar {

        const position: number = textPosition();

        text.setText(message);

        position ? text.setLeft(position) : reset();

        scrollBar.setValue(message);

        return this;
    };
    const scroll = (): void => {

        if (isString(text.text)) {

            textHasMovedOffScreen() ? reset() : increase();

            time.wait(scrollingSpeed).then(scroll);
        }
    };
    const stop = (): ScrollBar => {

        calculator.removeFromDom();
        return setText(null);
    };

    calculator.attachToDom();

    scrollBar.appendChild(text);

    subscribe("scrollText", setText);

    return Object.assign(scrollBar, {

        scroll,
        setText,
        stop,
    });
}
