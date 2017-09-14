import notifications, {PubSub} from "../../../tools/pubSub";
import createElement, {Element} from "../../dom/element/element";
import textScroller, {TextScroller} from "../../effects/scrollingText";

export interface ScrollBar extends Element<string>, TextScroller {

    setText(text: string): ScrollBar;
    listen(): ScrollBar;
    stop(): ScrollBar;
}

export default function() {

    let subscription: number;

    const scrollingSpeed: number = 14;
    const amountToIncrementBy: number = 2;
    const {subscribe, unsubscribe}: PubSub = notifications();
    const text: Element<any> = createElement("scrollingInfo", "p");
    const scrollBar: Element<any> = createElement("scrollBar", "footer")
        .appendChild(text);

    const scroller: TextScroller = textScroller(text, scrollBar)
        .setIncrement(amountToIncrementBy)
        .setSpeed(scrollingSpeed) as TextScroller;

    const setText = function(message: string): ScrollBar {

        text.setText(message).setValue(message);
        scrollBar.setValue(message);

        return this;
    };
    const stop = function(): ScrollBar {

        unsubscribe(subscription);
        scroller.stop();

        return this;
    };
    const listen = function(): ScrollBar {

        subscription = subscribe("scrollText", setText) as number;

        return this;
    };

    return Object.assign(Object.create(scroller), scrollBar, {

        setText,
        stop,
        listen,
    });
}
