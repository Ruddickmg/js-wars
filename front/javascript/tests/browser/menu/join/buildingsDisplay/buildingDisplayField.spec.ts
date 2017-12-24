import {expect} from "chai";
import {Element} from "../../../../../src/browser/dom/element/element";
import createBuildingDisplayField from "../../../../../src/browser/menu/join/buildingsDisplay/buildingDisplayField";
import capitalizeFirstLetter from "../../../../../src/tools/stringManipulation/capitalizeFirstLetter";

describe("buildingDisplayField", () => {
  const fieldName: string = "base";
  const buildingDisplayField: Element<any> = createBuildingDisplayField(fieldName);
  it("Creates a new building display field with its id and type set.", () => {
    expect(buildingDisplayField.id).to.equal(fieldName);
    expect(buildingDisplayField.element.tagName.toLowerCase()).to.equal("ul");
  });
  it("Creates a canvas element for displaying building types.", () => {
    const canvasId: string = `${fieldName}CanvasLi`;
    const canvasElement: Element<any> = buildingDisplayField.children.get(canvasId);
    expect(canvasElement.id).to.equal(canvasId);
    expect(canvasElement.getTag()).to.equal("li");
    expect(canvasElement.getClass()).to.equal("canvasLi");
  });
  it("It creates an item to display the amount of building types.", () => {
    const displayElementId: string = `numberOf${capitalizeFirstLetter(fieldName)}`;
    const displayElement: Element<any> = buildingDisplayField.children.get(displayElementId);
    expect(displayElement.id).to.equal(displayElementId);
    expect(displayElement.getTag()).to.equal("li");
    expect(displayElement.getClass()).to.equal("numberOf");
  });
});
