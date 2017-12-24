import {expect} from "chai";
import createElement, {Element} from "../../../src/browser/dom/element/element";
import getHighLighter, {Highlighter} from "../../../src/browser/effects/highlighter";

describe("highlighter", () => {
  const highlighter: Highlighter = getHighLighter();
  const element: Element<any> = createElement<any>("testing", "div");
  it("Will set an attribute indicating that an element is highlighted.", () => {
    highlighter.highlight(element);
    expect(element.element.getAttribute("highlighted")).to.equal("true");
  });
  it("Will de-highlight a highlighted element by removing the highlighted attribute.", () => {
    highlighter.deHighlight(element);
    expect(element.element.getAttribute("highlighted")).to.equal(null);
  });
});
