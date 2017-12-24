import {expect} from "chai";
import pixelStringConversion,
{PixelStringConversion} from "../../../../src/tools/stringManipulation/pixelStringConversion";

describe("pixelStringConversion", () => {
  const pixels: PixelStringConversion = pixelStringConversion();
  const value: number = 3;
  it("Converts a number to a string representation for that amount of pixels.", () => {
    expect(pixels.formatPixelString(value)).to.equal(`${value}px`);
  });
  it("Converts a string representation of pixels into a number.", () => {
    const pixelRepresentation: string = pixels.formatPixelString(value);
    expect(pixels.getNumericalValue(pixelRepresentation)).to.equal(value);
  });
});
