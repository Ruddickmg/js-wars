import {expect} from "chai";
import formatUrl from "../../../../src/tools/stringManipulation/formatUrl";

describe("formatUrl", () => {
  const url: string = "http://wrecked";
  const path: string = "/and/checked";
  const parameters: any = {one: true, two: false};
  const expectedOne: string = url + path;
  const expectedTwo: string = expectedOne + "?one=true&two=false";
  it("Returns a url formatted.", () => {
    expect(formatUrl(url, path)).to.equal(expectedOne);
  });
  it("Adds parameters to the url.", () => {
    expect(formatUrl(url, path, parameters)).to.equal(expectedTwo);
  });
});
