import {expect} from "chai";
import createCanvas, {Canvas, isCanvas} from "../../../src/browser/canvas/canvas";
import createDimensions, {Dimensions} from "../../../src/game/map/coordinates/dimensions";

describe("canvas", () => {
  const id: string = "testCanvas";
  const dimensionsOfCanvas: Dimensions = createDimensions(120, 140);
  const testCanvas: any = document.createElement("canvas");
  const canvasElement: Canvas<any> = createCanvas<any>(id, dimensionsOfCanvas, testCanvas);
  testCanvas.width = dimensionsOfCanvas.width;
  testCanvas.height = dimensionsOfCanvas.height;
  window.document.body.appendChild(canvasElement.element);
  it("Can be instantiated creating a new element.", () => {
    const testId: string = "testing";
    const element: Canvas<any> = createCanvas(testId, dimensionsOfCanvas);
    const dimensions: Dimensions = element.dimensions();
    expect(element.id).to.equal(testId);
    expect(dimensions.width).to.equal(dimensionsOfCanvas.width);
    expect(dimensions.height).to.equal(dimensionsOfCanvas.height);
    expect(isCanvas(element)).to.equal(true);
  });
  it("Can get its dimensions from the passed in element.", () => {
    const testId: string = "testing";
    const element: Canvas<any> = createCanvas(testId, null, testCanvas);
    const {width, height}: Dimensions = element.dimensions();
    expect(element.element).to.equal(testCanvas);
    expect(element.id).to.equal(testId);
    expect(width).to.equal(dimensionsOfCanvas.width);
    expect(height).to.equal(dimensionsOfCanvas.height);
  });
  it("Can be cleared of animations", () => {

    // TODO figure out how to test this.
  });
  it("Can return its animation context", () => {
    expect(canvasElement.context().toString())
      .to.equal("[object CanvasRenderingContext2D]");
  });
  it("Will report its dimensions.", () => {
    const {width, height}: Dimensions = canvasElement.dimensions();
    expect(width).to.equal(dimensionsOfCanvas.width);
    expect(height).to.equal(dimensionsOfCanvas.height);
  });
  it("Will report the amount of pixels it uses.", () => {
    const {width, height}: Dimensions = canvasElement.dimensions();
    const pixels: number = width * height;
    expect(canvasElement.pixels()).to.equal(pixels);
  });
  it("Will render an animation or image at a specified coordinate.", () => {

    // TODO figure out how to test this.
  });
});
