import createElement, {Element} from "../../dom/element";

interface TextElementMethods {

    backgroundWidth(): TextElement;
    deselect(): TextElement;
    hideBackground(): TextElement;
    select(): TextElement;
    setColor(color: string): TextElement;
    setPosition(position: string): TextElement;
    showBackground(): TextElement;
    width(): TextElement;
}

export interface TextElement extends TextElementMethods {

    background: Element<any>;
    element: Element<any>;
}

export default (function() {

    let counter: number = 1;

    const methods: TextElementMethods = {

        width(): TextElement {

            this.element.getWidth("client");

            return this;
        },
        backgroundWidth(): TextElement {

            this.background.getWidth("offset");

            return this;
        },
        setColor(color: string) {

            this.element.setBorderColor(color);

            return this;
        },
        setPosition(position: string): TextElement {

            this.element.setClass(position);

            return this;
        },
        hideBackground() {

            this.background.setBackgroundColor("transparent");

            return this;
        },
        showBackground() {

            this.background.setBackgroundColor(null);

            return this;
        },
        select(): TextElement {

            const background: Element<any> = this.background;
            const letters = this.element.getText().length;
            const parentWidth = this.width();
            const bgWidth = this.backgroundWidth();

            // divide the text width by the width of the parent element and divide it by 4
            // to split between letter spacing and stretching
            const diff = (bgWidth / parentWidth ) / 4;

            // find the amount of spacing between letters to fill the parent
            const spacing: number = (diff * bgWidth) / letters;

            background.transform(diff + 1); // find the amount of stretch to fill the parent
            background.setSpacing(spacing);

            return this.hideBackground();
        },
        deselect(): TextElement {

            const background: Element<any> = this.background;

            background.transform(null);
            background.setSpacing(null);
            background.setBackgroundColor("white");

            return this;
        },
    };

    return function(text: string): TextElement {

        const count: number = counter++;
        const background: Element<any> = createElement(`background#${count}`, "span").setClass("textBackground");
        const element: Element<any> = createElement(`textElement#${count}`, "h1").setClass("text");

        background.setText(text);
        element.appendChild(background);

        return Object.assign(Object.create(methods), {

            background,
            element,
        });
    };
}());
