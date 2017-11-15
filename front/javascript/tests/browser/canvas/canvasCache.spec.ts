import {expect} from "chai";
import {isCanvas} from "../../../src/browser/canvas/canvas";
import createCache, {CanvasCache} from "../../../src/browser/canvas/canvasCache";
import {Dimensions} from "../../../src/game/map/coordinates/dimensions";

describe("canvasCache", () => {

  const idOne: string = "testCanvasOne";
  const idTwo: string = "testCanvasTwo";
  const dimensionsOfCanvasOne: Dimensions = {width: 140, height: 120};
  const dimensionsOfCanvasTwo: Dimensions = {width: 250, height: 250};
  const testCanvasOne: any = document.createElement("canvas");
  const testCanvasTwo: any = document.createElement("canvas");
  const cache: CanvasCache = createCache();

  testCanvasOne.setAttribute("id", idOne);
  testCanvasTwo.setAttribute("id", idTwo);
  testCanvasOne.style.height = dimensionsOfCanvasOne.height;
  testCanvasOne.style.width = dimensionsOfCanvasOne.width;
  testCanvasTwo.style.height = dimensionsOfCanvasTwo.height;
  testCanvasTwo.style.width = dimensionsOfCanvasTwo.width;

  window.document.body.appendChild(testCanvasOne);
  window.document.body.appendChild(testCanvasTwo);

  it("Can be instantiated with multiple canvases and automatically initialize them.", () => {

    const cacheCanvas: CanvasCache = createCache(idOne, idTwo);

    expect(isCanvas(cacheCanvas.get(idOne))).to.equal(true);
    expect(isCanvas(cacheCanvas.get(idTwo))).to.equal(true);
    expect(cacheCanvas.get(idOne).element).to.equal(testCanvasOne);
    expect(cacheCanvas.get(idTwo).element).to.equal(testCanvasTwo);
  });

  it("Can initialize its canvases manually.", () => {

    cache.initialize(idOne, idTwo);

    expect(isCanvas(cache.get(idOne))).to.equal(true);
    expect(isCanvas(cache.get(idTwo))).to.equal(true);
    expect(cache.get(idOne).element).to.equal(testCanvasOne);
    expect(cache.get(idTwo).element).to.equal(testCanvasTwo);
  });
});
