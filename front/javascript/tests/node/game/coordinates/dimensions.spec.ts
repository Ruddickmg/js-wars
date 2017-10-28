/**
 * Created by moonmaster on 5/17/17.
 */

import {expect} from "chai";
import createDimensions, {Dimensions} from "../../../../src/game/map/coordinates/dimensions";

describe("dimensions", () => {

  it("returns an object representing the size of something", () => {

    const width: number = 5;
    const height: number = 6;
    const expectedNumberOfProperties: number = 2;
    const dimensions: Dimensions = createDimensions(width, height);

    expect(Object.keys(dimensions).length).to.equal(expectedNumberOfProperties);
    expect(dimensions.width).to.equal(width);
    expect(dimensions.height).to.equal(height);
  });
});
