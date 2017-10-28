// export default (tag: string): Element => document.getElementsByTagName(tag)[0];
import {expect} from "chai";
import findFirstElementWithTag from "../../../src/browser/tools/findFirstElemenWithTag";

describe("findFirstElementWithTag", () => {

  it("Finds the first dom element with a specified tag.", () => {

    const tag: string = "h1";
    const firstElement: Element = document.createElement(tag);
    const secondElement: Element = document.createElement(tag);

    document.body.appendChild(firstElement);
    document.body.appendChild(secondElement);

    expect(findFirstElementWithTag(tag)).to.equal(firstElement);
  });
});
