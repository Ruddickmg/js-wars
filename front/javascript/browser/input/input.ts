import subscription, {PubSub} from "../../tools/pubSub";
import dom from "../dom/dom";
import createElement, {Element} from "../dom/element";
import typeWriter, {TypeWriter} from "../effects/typing";
import footerFactory from "../objects/footer";

export interface GameInput {

    addInput(text: string): void;
    clear(): void;
    // // descriptions(): any;
    createForm(name: string, width: number, defaultText?: string): Element<any>;
    message(newMessage: string): any;
    name(text: string): any;
    remove(element: Element<any>): void;
    removeInput(): void;
    value(): any;
}

export default (function() {

    const footer = footerFactory();
    const writer: TypeWriter = typeWriter();
    const subscriber: PubSub = subscription();

    const createForm = (name: string, width: number, defaultText?: string): Element<any> => {

        const input: Element<any> = createElement(`${name}Form`, "p");
        const text: Element<any> = createElement(`${name}Input`, "input");

        input.setClass("inputForm");
        input.appendChild(text);

        text.setClass("textInput");
        text.setAttribute("autocomplete", "off");
        text.setAttribute("type", "text");

        if (defaultText) {

            text.setAttribute("placeholder", defaultText);
        }

        text.setWidth(width);

        return input;
    };

    const name = function(text: string): any {

        const nameOfInputLocation = "descriptionOrChatScreen";
        const description = document.getElementById("descriptions");
        const textField = footer.display();
        const parentOfTextField = textField.parentNode;

        dom.appendOrReplace(parentOfTextField, nameOfInputLocation);

        description.style.paddingTop = "2%";
        description.style.paddingBottom = "1.5%";
        description.parentNode.style.overflow = "hidden";

        this.parent = parentOfTextField;
        this.description = description;
        this.text = textField;
        this.addInput();

        writer.type(this.description, text || "Enter name for game.");

        return parentOfTextField;
    };

    // remove input form from footer
    const clear = function(): void {

        subscriber.publish("clearInput", true);

        this.description.style.paddingTop = null;
        this.description.style.paddingBottom = null;
        this.nameInput.style.display = null;
        this.nameInput.style.height = null;
    };

    const remove = function(element: Element<any>): void {

        subscriber.publish("removeInput", element.getValue());

        this.val = undefined;

        // app.confirm.deactivate();
        // app.type.reset();
        // app.footer.removePlayer();
        // app.screen.reset();
    };

    const removeInput = function(): void {

        this.text.removeChild(this.nameInput);

        // this.description.style.display = 'inline-block';
        // this.text.style.display = 'inline-block';
    };

    const addInput = function(text: string): void {

        const createdForm = this.form("name", text, "Enter name here.");
        const input = document.getElementById("nameForm");

        input.appendChild(createdForm);

        input.style.display = "block";
        input.style.height = "30%";

        this.nameInput = input;

        // this.description.style.display = null;

        document.getElementById("nameInput").focus();
    };

    const value = function(): any {

        return this.val || document.getElementById("nameInput").valueOfCurrentElement;
    };

    const message =  function(newMessage: string): any {

        return writer.type(this.descriptions(), newMessage);
    };

    return function(): GameInput {

        return {

            addInput,
            clear,
            // descriptions,
            // entry,
            createForm,
            message,
            name,
            remove,
            removeInput,
            value,
        };
    };
}());
