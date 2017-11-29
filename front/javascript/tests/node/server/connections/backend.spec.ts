import {expect} from "chai";
import createGame, {Game} from "../../../../src/game/game";
import {Map} from "../../../../src/game/map/map";
import createTestMap from "../../../../src/game/map/testMap";
import createPlayer, {Player} from "../../../../src/game/users/players/player";
import createUser, {User} from "../../../../src/game/users/user";
import backend, {Backend} from "../../../../src/server/connections/backend";
import connections, {Connections} from "../../../../src/server/connections/connections";
import database from "../../../utilities/database";
import checkForEqualityBetweenGames from "../../../utilities/gameEquality";
import checkForEqualityBetweenMaps from "../../../utilities/mapEquality";

describe("backend", function() {
  const connection: Connections = connections({});
  const url: string = connection.backend().url;
  const {clear}: any = database(url);
  const db: Backend = backend(url);
  const category: string = "two";
  const name: string = "testGame";
  const testId: number = 5;
  const origin = "facebook";
  const userProperties: any = {
    email: "joejohn@jswars.com",
    first_name: "joe",
    gender: "male",
    id: 1,
    last_name: "john",
    link: "https://www.whereareyourpantsjoe.com",
    name: "joe",
  };
  let map: Map = createTestMap(testId);
  let game: Game = createGame(name, category, map);
  const user: User = createUser(userProperties, origin);
  const player: Player = createPlayer(user, "max");
  game.players.push(player);
  before(clear);
  after(clear);
  it("The database starts out empty.", () => {
    return db.getMaps(category).then(() => {
      throw Error("backend should return an error for non existent tables.");
    }).catch((response) => expect(response.statusCode).to.equal(500));
  });
  it("Initializes database migrations.", () => {
    return db.migrate().then((response: boolean) => {
      expect(response).to.deep.equal({success: true, response: "migrated"});
    });
  });
  it("Saves a map to the database.", () => {
    return db.saveMap(map).then(({response}: any) => checkForEqualityBetweenMaps(map, response));
  });
  it("Gets saved maps from the database.", () => {
    return db.getMaps(category).then(({response}) => {
      const savedMap: Map = response[0];
      checkForEqualityBetweenMaps(map, savedMap);
      map = savedMap;
    });
  });
  it("Deletes maps from the database.", () => {
    return db.deleteMap(map.id).then((deletion) => {
      checkForEqualityBetweenMaps(map, deletion.response);
      return db.getMaps(category).catch(({response}) => {
        expect(response.statusCode).to.equal(404);
      });
    });
  });
  it("Saves a user to the database.", () => {
    return db.saveUser(user).then(({response}) => {
      expect(user).to.deep.include(response);
    });
  });
  it("Gets a saved user from database.", () => {
    const {loginWebsite, id}: User = user;
    return db.getUser(loginWebsite, id).then(({response}) => {
      expect(user).to.deep.include(response);
    });
  });
  it("Saves a game to the database.", () => {
    return db.saveGame(game).then(({response}) => {
      checkForEqualityBetweenGames(game, response);
      expect(game.players).to.deep.equal(response.saved);
    });
  });
  it("Gets a user's saved games from database.", () => {
    return db.getGames(user.id).then(({response}) => {
      const savedGame: Game = response[0];
      checkForEqualityBetweenGames(game, savedGame);
      expect(game.players).to.deep.equal(savedGame.saved);
      game = savedGame;
    });
  });
  it("Deletes a game from the database.", () => {
    return db.deleteGame(game.id).then(({response}) => {
      checkForEqualityBetweenGames(game, response);
      expect(game.saved).to.deep.equal(response.saved);
      expect(game.id).to.equal(response.id);
    });
  });
  it("Deletes a user from the database.", () => {
    return db.deleteUser(user.id).then(({response}) => {
      expect(user.email).to.equal(response.email);
      expect(user.last_name).to.equal(response.last_name);
      expect(user.first_name).to.equal(response.first_name);
      expect(user.name).to.equal(response.name);
    });
  });
});
