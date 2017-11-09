import {expect} from "chai";
import {Element} from "../../../../src/browser/dom/element/element";
import createSelectionElement from "../../../../src/browser/menu/join/selectionElement";

describe("selectionElement", () => {

  const id: string = "selection";
  const textElementId: string = `${id}Text`;
  const text: string = "this is some text";

  let selectionElement: Element<any>;
  let textElement: Element<any>;

  beforeEach(() => {

    selectionElement = createSelectionElement(id);
    textElement = selectionElement.get(textElementId);
  });

  it("Has it's properties set correctly.", () => {

    expect(selectionElement.id).to.equal(id);
    expect(selectionElement.element.tagName.toLowerCase()).to.equal("ul");
  });

  it("Has a text element with it's properties set correctly.", () => {

    expect(selectionElement.children.size()).to.equal(1);
    expect(textElement.id).to.equal(textElementId);
    expect(textElement.getClass()).to.equal("selectionText");
    expect(textElement.element.tagName.toLowerCase()).to.equal("li");
  });

  it("Can directly modify the text of its text element.", () => {

    expect(textElement.getText()).to.equal(undefined);
    selectionElement.setText(text);
    expect(textElement.getText()).to.equal(text);
  });
});
