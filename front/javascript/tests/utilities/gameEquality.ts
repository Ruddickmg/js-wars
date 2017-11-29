import {expect} from "chai";
import {Game} from "../../src/game/game";
import checkForMapEquality from "./mapEquality";
export default function(gameOne: Game, gameTwo: Game): any {
  expect(gameOne.category).to.equal(gameTwo.category);
  expect(gameOne.settings).to.deep.equal(gameTwo.settings);
  expect(gameOne.name).to.equal(gameTwo.name);
  expect(gameOne.background).to.equal(gameTwo.background);
  checkForMapEquality(gameOne.map, gameTwo.map);
}
