import request = require("request-promise-native");
import {expect} from "chai";
import createGame, {Game} from "../../../../src/game/game";
import {Map} from "../../../../src/game/map/map";
import createTestMap from "../../../../src/game/map/testMap";
import createPlayer, {Player} from "../../../../src/game/users/players/player";
import createUser, {User} from "../../../../src/game/users/user";
import backend, {Backend} from "../../../../src/server/connections/backend";
import connections, {Connections} from "../../../../src/server/connections/connections";
import checkForEqualityBetweenGames from "../../../utilities/gameEquality";
import checkForEqualityBetweenMaps from "../../../utilities/mapEquality";

describe("backend", function() {
  const connection: Connections = connections({});
  const url: string = connection.backend().url;
  const db: Backend = backend(url);
  const uri: string = `${url}/drop`;
  const json: boolean = true;
  const method: any = "GET";
  const category: string = "two";
  const name: string = "testGame";
  const testId: number = 5;
  const clear = (): any => request({uri, method, json});
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
  const game: Game = createGame(name, category, map);
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

  it("Get a saved user from database.", () => {
    const {loginWebsite, id}: User = user;
    return db.getUser(loginWebsite, id).then(({response}) => {
      expect(user).to.deep.include(response);
    });
  });

  // it("Saves a game to the database.", () => {
  //   return db.saveGame(game).then(({response}) => {
  //     checkForEqualityBetweenGames(game, response);
  //   });
  // });
  //
  // it("Gets saved games from database.", () => {
  //   console.log(game);
  //   return db.getGames(user.id).then(({response}) => {
  //     checkForEqualityBetweenGames(game, response[0]);
  //   });
  // });
  //
  // it("Deletes a game from the database.", () => {
  //   // TODO
  // });
  //
  // it("Deletes a user from the database.", () => {
  //
  //   // TODO
  // });
  //
  // it("Syncs the saved game and map id's from the database with the server.", () => {
  //
  //   // TODO
  // });
});
