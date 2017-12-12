import {expect} from "chai";
import createGame, {Game} from "../../../../src/game/game";
import {Map} from "../../../../src/game/map/map";
import createTestMap from "../../../../src/game/map/testMap";
import createPlayer, {Player} from "../../../../src/game/users/players/player";
import createUser, {User} from "../../../../src/game/users/user";
import backend, {Backend} from "../../../../src/server/connections/backend";
import connections, {Connections} from "../../../../src/server/connections/connections";
import {RoomId} from "../../../../src/server/rooms/room";
import database from "../../../utilities/database";
import checkForEqualityBetweenGames from "../../../utilities/gameEquality";
import checkForEqualityBetweenMaps from "../../../utilities/mapEquality";

describe("backend", function() {
  const testDatabase: string = "test";
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
  const user: User = createUser(userProperties, origin);
  const player: Player = createPlayer(user, "max");
  const map: Map = createTestMap(testId);
  const game: Game = createGame(name, category, map);
  game.players.push(player);
  before(() => clear(testDatabase));
  afterEach(() => clear(testDatabase));
  it("The database starts out empty.", () => {
    return db.getMaps(category, testDatabase).then(() => {
      throw Error("backend should return an error for non existent tables.");
    }).catch((response) => expect(response.statusCode).to.equal(500));
  });
  it("Initializes database migrations.", () => {
    return db.migrate(testDatabase).then((response: boolean) => {
      expect(response).to.deep.equal({success: true, response: "migrated"});
    });
  });
  it("Saves a map to the database.", () => {
    return db.migrate(testDatabase).then(() => {
      return db.saveMap(map, testDatabase).then(({response}: any) => {
        checkForEqualityBetweenMaps(map, response);
      });
    });
  });
  it("Gets saved maps from the database.", () => {
    return db.migrate(testDatabase).then(() => {
      return db.saveMap(map, testDatabase).then((received: any) => {
        const receivedMap: Map = received.response;
        return db.getMaps(category, testDatabase).then(({response}) => {
          const savedMap: Map = response[0];
          checkForEqualityBetweenMaps(receivedMap, savedMap);
        });
      });
    });
  });
  it("Deletes maps from the database.", () => {
    return db.migrate(testDatabase).then(() => {
      return db.saveMap(map, testDatabase).then((received: any) => {
        const receivedMap: Map = received.response;
        return db.deleteMap(receivedMap.id, testDatabase).then((deletion) => {
          checkForEqualityBetweenMaps(receivedMap, deletion.response);
          return db.getMaps(category, testDatabase).catch(({response}) => {
            expect(response.statusCode).to.equal(404);
          });
        });
      });
    });
  });
  it("Saves a user to the database.", () => {
    return db.migrate(testDatabase).then(() => {
      return db.saveUser(user, testDatabase).then(({response}) => {
        expect(user).to.deep.include(response);
      });
    });
  });
  it("Gets a saved user from database.", () => {
    const {loginWebsite, id}: User = user;
    return db.migrate(testDatabase).then(() => {
      return db.saveUser(user, testDatabase).then((received: any) => {
        const receivedUser: any = received.response;
        return db.getUser(loginWebsite, id, testDatabase).then(({response}) => {
          expect(receivedUser).to.deep.include(response);
        });
      });
    });
  });
  it("Deletes a user from the database.", () => {
    return db.migrate(testDatabase).then(() => {
      return db.saveUser(user, testDatabase).then(() => {
        return db.deleteUser(user.id, testDatabase).then(({response}) => {
          expect(user.email).to.equal(response.email);
          expect(user.last_name).to.equal(response.last_name);
          expect(user.first_name).to.equal(response.first_name);
          expect(user.name).to.equal(response.name);
        });
      });
    });
  });
  it("Saves a game to the database.", () => {
    return db.migrate(testDatabase).then(() => {
      return db.saveGame(game, testDatabase).then(({response}) => {
        checkForEqualityBetweenGames(game, response);
        expect(game.players).to.deep.equal(response.saved);
      });
    });
  });
  it("Gets a user's saved games from database.", () => {
    return db.migrate(testDatabase).then(() => {
      return db.saveUser(user, testDatabase).then((receivedUser: any) => {
        const userId: number = receivedUser.response.id;
        return db.saveGame(game, testDatabase).then(() => {
          return db.getGames(userId, testDatabase).then(({response}) => {
            const savedGame: Game = response[0];
            checkForEqualityBetweenGames(game, savedGame);
            expect(game.players).to.deep.equal(savedGame.saved);
          });
        });
      });
    });
  });
  it("Deletes a game from the database.", () => {
    return db.migrate(testDatabase).then(() => {
      return db.saveUser(user, testDatabase).then(() => {
        return db.saveGame(game, testDatabase).then((received: any) => {
          const receivedGame = received.response;
          const gameId: RoomId = receivedGame.id;
          return db.deleteGame(gameId, testDatabase).then(({response}) => {
            expect(receivedGame.saved).to.deep.equal(response.saved);
            expect(gameId).to.equal(response.id);
            checkForEqualityBetweenGames(receivedGame, response);
          });
        });
      });
    });
  });
});
