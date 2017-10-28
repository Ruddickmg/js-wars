import {expect} from "chai";
import createPosition, {Position} from "../../../../src/game/map/coordinates/position";
import pathTracker, {PathTracker} from "../../../../src/tools/pathfinding/pathTracker";

describe("pathTracker", () => {

  const tracking: PathTracker = pathTracker();
  const position: Position = createPosition(0, 0);
  const parent: Position = createPosition(1, 1);
  const fValue: number = 11;
  const gValue: number = 5;

  it("Adds and retrieves a tracker for an element.", () => {

    let trackerPosition: Position;

    tracking.close(position);

    trackerPosition = tracking.getPosition(position).position;

    expect(position.on(trackerPosition)).to.equal(true);
  });

  it(`Sets the "F" value on tracked position`, () => {

    tracking.setF(position, fValue);

    expect(tracking.getPosition(position).f).to.equal(fValue);
  });

  it(`Retrieves the "F" value on tracked position.`, () => {

    expect(tracking.getF(position)).to.equal(fValue);
  });

  it(`Sets the "G" value on tracked position`, () => {

    tracking.setG(position, gValue);

    expect(tracking.getPosition(position).g).to.equal(gValue);
  });

  it(`Retrieves the "G" value on tracked position.`, () => {

    expect(tracking.getG(position)).to.equal(gValue);
  });

  it("Sets the parent of a tracked position.", () => {

    tracking.setParent(position, parent);

    expect(tracking.getPosition(position).parent).to.equal(parent);
  });

  it("Retrieves the parent of a tracked position.", () => {

    expect(tracking.getParent(position)).to.equal(parent);
  });

  it("Can be cleared of all tracked positions.", () => {

    tracking.clear();

    expect(tracking.getPosition(position)).to.equal(undefined);
  });
});
