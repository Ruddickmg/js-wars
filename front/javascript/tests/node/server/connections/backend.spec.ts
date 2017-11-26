import request = require("request-promise-native");
import {expect} from "chai";
import {Map} from "../../../../src/game/map/map";
import createTestMap from "../../../../src/game/map/testMap";
import backend, {Backend} from "../../../../src/server/connections/backend";
import connections, {Connections} from "../../../../src/server/connections/connections";
import checkForEqualityBetweenMaps from "../../../utilities/mapEquality";

describe("backend", () => {

  const connection: Connections = connections({});
  const url: string = connection.backend().url;
  const db: Backend = backend(url);
  const uri: string = `${url}/drop`;
  const json: boolean = true;
  const method: any = "GET";
  const category: string = "two";
  const clear = (): any => request({uri, method, json});
  let map: Map = createTestMap(5);

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

  // it("Saves a game to the database.", () => {
  //   // TODO
  // });
  //
  // it("Gets saved games from database.", () => {
  //   // TODO
  // });
  //
  // it("Deletes a game from the database.", () => {
  //   // TODO
  // });
  //
  //
  // it("Saves a user to the database.", () => {
  //
  //   // TODO
  // });
  //
  // it("Get a saved user from database.", () => {
  //
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
