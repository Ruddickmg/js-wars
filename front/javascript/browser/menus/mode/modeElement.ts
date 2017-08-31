import createElement, {Element} from "../../dom/element";

export interface ModeElement<ValueType> extends Element<ValueType> {

    clearHeight(): ModeElement<ValueType>;
}

export default function<ValueType>(id: string, classOfElement: string): ModeElement<ValueType> {

    return Object.assign(createElement(id, "li").setClass(classOfElement), {

        clearHeight(): ModeElement<ValueType> {

            this.element.setHeight("");

            return this;
        },
    });
}
