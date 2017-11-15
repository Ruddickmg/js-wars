import {expect} from "chai";
import createElement, {Element} from "../../../../src/browser/dom/element/element";
import isElement from "../../../../src/browser/dom/element/isElement";
import random from "../../../../src/tools/calculations/random";
import typeChecker, {TypeChecker} from "../../../../src/tools/validation/typeChecker";

describe("isElement", () => {

  const id: string = "testing";
  const type: string = "div";
  const element: Element<any> = createElement<any>(id, type);
  const {isFunction}: TypeChecker = typeChecker();

  it("Reports when an object is a dom element.", () => {

    expect(isElement(element)).to.equal(true);
  });

  it("Reports when an object is not a dom element.", () => {

    const requiredParameters: string[] = ["id", "element", "children"];
    const parameters = Object.keys(element)
      .filter((name: string): boolean => isFunction(element[name]))
      .concat(requiredParameters);
    const randomRequiredParameter = parameters[random.index(parameters)];

    element[randomRequiredParameter] = void 0;

    expect(isElement(element)).to.equal(false);
  });
});
