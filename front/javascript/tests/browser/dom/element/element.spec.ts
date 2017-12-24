import {expect} from "chai";
import * as sinon from "sinon";
import {SinonSpy} from "sinon";
import createElement, {Element} from "../../../../src/browser/dom/element/element";

describe("element", () => {
  const id: string = "testElement";
  const childId: string = "testChild";
  const type: string = "div";
  const className: string = "first";
  const secondClass: string = "second";
  const appended: string = `${className} ${secondClass}`;
  const prepended: string = `${secondClass} ${className}`;
  const element: Element<any> = createElement(id, type);
  const childElement: Element<any> = createElement(childId, type);
  const attribute: string = "testAttribute";
  const value: any = {};
  const color: string = "blue";
  const top: number = 5;
  const width: number = 50;
  const eventListener: SinonSpy = sinon.spy();
  const text: string = "this is some text!";
  window.document.body.appendChild(element.element);
  it("Starts out with no children.", () => expect(element.children.size()).to.equal(0));
  it("Can add children.", () => {
    element.appendChild(childElement);
    expect(element.children.size()).to.equal(1);
    expect(element.get(childElement.id)).to.equal(childElement);
  });
  it("Can remove children.", () => {
    element.removeChild(childElement);
    expect(element.children.size()).to.equal(0);
    expect(element.get(childElement.id)).to.equal(undefined);
  });
  it("Can retrieve all children.", () => {
    element.appendChild(childElement);
    expect(element.getChildren()[0]).to.equal(childElement);
  });
  it("Can remove all children", () => {
    element.removeChildren();
    expect(element.children.size()).to.equal(0);
  });
  it("Can set the class on an element.", () => {
    element.setClass(className);
    expect(element.getClass()).to.equal(className);
  });
  it("Can append to the end of its current class list.", () => {
    element.appendClass(secondClass);
    expect(element.getClass()).to.equal(appended);
  });
  it("Can remove a class from its class list.", () => {
    element.removeClass(secondClass);
    expect(element.getClass()).to.equal(className);
  });
  it("Can prepend a class to its class list.", () => {
    element.prependClass(secondClass);
    expect(element.getClass()).to.equal(prepended);
  });
  it("Can have a value set on it.", () => {
    element.setValue(value);
    expect(element.getValue()).to.equal(value);
  });
  it("Can have text set on it.", () => {
    element.setText(text);
    expect(element.getText()).to.equal(text);
  });
  it("Can have its top position set.", () => {
    const expected: string = `${top}px`;
    element.setTop(top);
    expect(element.element.style.top).to.equal(expected);
    expect(element.getTop()).to.equal(expected);
  });
  it("Can have its width set.", () => {
    element.setWidth(width);
    expect(element.element.style.width).to.equal(`${width}px`);
    expect(element.getWidth()).to.equal(width);
  });
  it("Can have its id set.", () => {
    const tempId: string = "temporary_id";
    element.setId(tempId);
    expect(element.id).to.equal(tempId);
    expect(element.element.id).to.equal(tempId);
    element.setId(id);
  });
  it("Can have its opacity set.", () => {
    const opacity: number = 0.5;
    element.setOpacity(opacity);
    expect(element.element.style.opacity).to.equal(`${opacity}`);
  });
  it("Can be made invisible.", () => {
    element.makeInvisible();
    expect(element.element.style.opacity).to.equal(`${0}`);
  });
  it("Can be made visible.", () => {
    element.makeVisible();
    expect(element.element.style.opacity).to.equal(`${1}`);
  });
  it("Can return its tag name.", () => expect(element.getTag()).to.equal(type));
  it("Can have its display property set.", () => {
    const displayString: string = "block";
    element.display(displayString);
    expect(element.element.style.display)
      .to.equal(displayString);
  });
  it("Can be hidden.", () => {
    element.hide();
    expect(element.element.style.display).to.equal("none");
  });
  it("Can be shown.", () => {
    element.show();
    expect(element.element.style.display).to.equal("");
  });
  it("Can have event listeners added to it", () => {
    element.addEventListener("click", eventListener);
    element.element.click();
    expect(eventListener.calledOnce).to.equal(true);
  });
  it("Can have event listeners removed from it.", () => {
    element.removeEventListener("click", eventListener);
    element.element.click();
    expect(eventListener.calledOnce).to.equal(true);
  });
  it("Can set its border color.", () => {
    element.setBorderColor(color);
    expect(element.element.style.borderColor).to.equal(color);
  });
  it("Can set its background color.", () => {
    element.setBackgroundColor(color);
    expect(element.element.style.backgroundColor).to.equal(color);
  });
  it("Can set its text color.", () => {
    element.setTextColor(color);
    expect(element.element.style.color).to.equal(color);
  });
  it("Can set an attribute.", () => {
    element.setAttribute(attribute, text);
    expect(element.element.getAttribute(attribute)).to.equal(text);
  });
  it("Can remove an attribute.", () => {
    element.removeAttribute(attribute);
    expect(element.element.getAttribute(attribute)).to.equal(null);
  });
  it("Can have its height set.", () => {
    element.setHeight(width);
    expect(element.element.style.height).to.equal(`${width}px`);
  });
  it("Can have its left position set.", () => {
    element.setLeft(width);
    expect(element.element.style.left).to.equal(`${width}px`);
  });
  // TODO test these remaining four methods.
// getInput(): any;
// position(): ElementPosition;
// refresh(replacement: Element<any>): Element<Type>;
// setSpacing(spacing?: number): Element<Type>;
});
