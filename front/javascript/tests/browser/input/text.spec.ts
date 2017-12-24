import {expect} from "chai";
import {Element} from "../../../src/browser/dom/element/element";
import isElement from "../../../src/browser/dom/element/isElement";
import textInput from "../../../src/browser/input/text";

describe("text", () => {
  const id: string = "test";
  const defaultText: string = "default";
  const className: string = "inputForm";
  const textId: string = `${id}Input`;
  const textClass: string = "textInput";
  const input: Element<any> = textInput(id, defaultText);
  const text: Element<any> = input.children.get(textId);
  it("Creates an element for text input.", () => {
    expect(isElement(textInput(id, defaultText))).to.equal(true);
  });
  it("Has its class set appropriately.", () => {
    expect(input.getClass()).to.equal(className);
  });
  it("Has a child element for text input.", () => {
    expect(isElement(input.children.get(textId))).to.equal(true);
  });
  it("Its child has its class set appropriately", () => {
    expect(text.getClass()).to.equal(textClass);
  });
  it(`Has its property "autocomplete" set to "off".`, () => {
    expect(text.element.getAttribute("autoComplete")).to.equal("off");
  });
  it(`Has its property "type" set to "text".`, () => {
    expect(text.element.getAttribute("type")).to.equal("text");
  });
  it("Sets the default text to the specified text.", () => {
    expect(text.element.getAttribute("placeholder")).to.equal(defaultText);
  });
});
