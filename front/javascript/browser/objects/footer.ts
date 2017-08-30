import dom from "../dom/dom";
import createElement, {Element} from "../dom/element";

export default function() {

    const scrollSpeed = 8;
    const offScreen = 4;
    const incrementNumber = 1;
    const textFieldIndex = 0;
    const section = "descriptionOrChatScreen";
    const div = "descriptionOrChat";

    const display = function() {

        const footer = dom.createMenu([], [], {section, div});
        const description = document.createElement("h1");
        const chat = document.createElement("ul");
        const textField = footer.children[textFieldIndex];

        this.setElement(footer);

        chat.setAttribute("id", "chat");

        description.setAttribute("id", "descriptions");

        textField.appendChild(chat);
        textField.appendChild(description);

        return textField;
    };

    const scrolling = function() {

        const footer = document.createElement("footer");
        const info = document.createElement("p");
        const footSpan = document.createElement("span");

        footSpan.setAttribute("id", "footerText");

        info.appendChild(footSpan);
        info.setAttribute("id", "scrollingInfo");

        footer.setAttribute("id", "footer");
        footer.appendChild(info);

        this.setElement(footer);
        this.setScrollBar(info);
        this.setSpan(footSpan);

        return footer;
    };

    const setElement = function(element) {

        this.e = element;
    };

    const element = function() {

        return this.e;
    };

    const remove = function() {

        const element = this.element();

        if (element) {

            element.parentNode.removeChild(element);
        }
    };

    const hide = function() {

        this.element().display = "none";
    };

    const show = function() {

        this.element().display = null;
    };

    const setScrollBar = function(bar) {

        this.s = bar;
    };

    const scrollBar = function() {

        return this.s;
    };

    const setText = function(text: string) {

        this.t = text;
        this.scrollBar().innerHTML = text;
    };

    const setSpan = function(span) {

        this.sp = span;
    };

    const span = function() {

        return this.sp;
    };

    const text = function() {

        return this.t;
    };

    const width = function() {

        return this.element().offsetWidth;
    };

    const textWidth = function() {

        return this.span().offsetWidth;
    };

    const increment = function() {

        return this.scrollBar().offsetWidth;
    };

    const increase = function() {

        this.move(incrementNumber);
    };

    const decrease = function() {

        this.move(-incrementNumber);
    };

    const move = function(movement: number) {

        this.setPosition(this.position() + movement);
    };

    const setPosition = function(position) {

        this.setLeft(position);
        this.position = position;
    };

    const position = function() {

        return this.position;
    };

    const reset = function() {

        this.setPosition(-(this.incriment() * offScreen));
    };

    const setLeft = function(left: number) {

        this.scrollBar().style.left = left + "px";
    };

    const scroll = function(message) {

        const scope = this;
        const position = this.position();

        if (message) {

            if (this.scroller) {

                clearTimeout(this.scroller);
            }

            if (!position) {

                this.setPosition(-this.incriment());
            }

            this.setText(message);
        }

        this.position() <= this.width() ? this.increase() : this.reset();

        this.scroller = setTimeout(function() {

            scope.scroll();

        }, scrollSpeed);
    };

    return {

        display,
        scrolling,
        setElement,
        element,
        remove,
        hide,
        show,
        setScrollBar,
        scrollBar,
        setText,
        setSpan,
        span,
        text,
        width,
        textWidth,
        increment,
        increase,
        decrease,
        move,
        setPosition,
        position,
        reset,
        setLeft,
        scroll,
    };
}
