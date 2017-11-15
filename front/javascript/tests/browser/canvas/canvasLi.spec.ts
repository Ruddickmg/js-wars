import {expect} from "chai";
import {isCanvas} from "../../../src/browser/canvas/canvas";
import createCanvasLi from "../../../src/browser/canvas/canvasLi";
import {Element} from "../../../src/browser/dom/element/element";

describe("canvasLi", () => {

  it("Creates a list item containing a canvas element.", () => {

    const id: string = "test";
    const canvasId: string = `${id}Canvas`;
    const canvasLi: Element<any> = createCanvasLi(id);

    expect(canvasLi.id).to.equal(`${id}CanvasLi`);
    expect(canvasLi.getTag()).to.equal("li");
    expect(canvasLi.getClass()).to.equal("canvasLi");
    expect(isCanvas(canvasLi.children.get(canvasId))).to.equal(true);
  });
});
