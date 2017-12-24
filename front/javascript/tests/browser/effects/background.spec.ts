import {expect} from "chai";
import background from "../../../src/browser/effects/background";
import createPosition from "../../../src/game/map/coordinates/position";
import createTerrain, {Terrain} from "../../../src/game/map/elements/terrain/terrain";

describe("background", () => {
  const snowType: string = "snow";
  const plainType: string = "plain";
  const randomType: string = "random";
  const rainType: string = "rain";
  const plainBackground: Terrain = createTerrain(plainType, createPosition(0, 0));
  const types: string[] = [snowType, plainType, rainType];
  it("Can have its type set", () => {
    types.concat([randomType]).forEach((type: string) => {
      background.change(type);
      expect(background.category()).to.equal(type);
    });
  });
  it("Will report if it is random.", () => {
    background.change(randomType);
    expect(background.isRandom()).to.equal(true);
    background.change(plainType);
    expect(background.isRandom()).to.equal(false);
  });
  it("Will select Randomly from background categories", () => expect(types).contains(background.change()));
  it("Will report the name of its background", () => {
    background.change(plainType);
    expect(background.name()).to.equal(plainBackground.name);
  });
  it("Will report the type of its background", () => {
    background.change(plainType);
    expect(background.type()).to.equal(plainBackground.type);
  });
  it("Will report the drawing of its background", () => {
    background.change(plainType);
    expect(background.drawing()).to.equal(plainBackground.drawing);
  });
  it("Will report the category of its background", () => {
    background.change(plainType);
    expect(background.category()).to.equal(plainType);
  });
});
