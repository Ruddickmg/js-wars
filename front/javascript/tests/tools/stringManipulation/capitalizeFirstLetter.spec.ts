import {expect} from "chai";
import capitalizeFirstLetter from "../../../src/tools/stringManipulation/capitalizeFirstLetter";

describe("capitalizeFirstLetter", () => {
  it("Capitalizes the first character of a string.", () => {
    expect(capitalizeFirstLetter("hello friend")).to.equal("Hello friend");
  });
});
