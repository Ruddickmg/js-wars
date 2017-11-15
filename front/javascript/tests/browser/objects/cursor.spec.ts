import {expect} from "chai";
import getCursor, {Cursor} from "../../../src/browser/objects/cursor";
import createPosition, {Position} from "../../../src/game/map/coordinates/position";
describe("cursor", () => {
  const firstPosition: Position = createPosition(0, 0);
  const secondPosition: Position = createPosition(0, 1);
  const cursor: Cursor = getCursor();
  it("Begins at the center of the screen.", () => expect(cursor.getPosition().on({x: 7, y: 5})).to.equal(true));
  it("Can have its position set, without modifying the passed in position.", () => {
    let position: Position;
    cursor.setPosition(firstPosition);
    position = cursor.getPosition();
    expect(position.on(firstPosition)).to.equal(true);
    expect(position).to.not.equal(firstPosition);
  });
  it("Can change its position without modifying the passed in positions.", () => {
    let position: Position = cursor.getPosition();
    expect(position.on(firstPosition)).to.equal(true);
    expect(position).to.not.equal(firstPosition);
    cursor.setPosition(secondPosition);
    position = cursor.getPosition();
    expect(position.on(secondPosition)).to.equal(true);
    expect(position).to.not.equal(secondPosition);
  });
});
