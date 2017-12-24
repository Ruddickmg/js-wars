import {expect} from "chai";
import createGame, {Game, isGame} from "../../../src/game/game";
import {Map} from "../../../src/game/map/map";
import testMap from "../../../src/game/map/testMap";

describe("game", () => {
  const category: string = "twoPlayer";
  const name: string = "The Game";
  const map: Map = testMap(1);
  const id: number = 5;
  const game: Game = createGame(name, category, map, id);
  it("Creates a new game.", () => expect(isGame(createGame(name, category, map, id))).to.equal(true));
  it("Can tell the difference between what is and is not a game.", () => {
    expect(isGame(game)).to.equal(true);
    expect(isGame({})).to.equal(false);
  });
});
