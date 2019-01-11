import {expect} from "chai";
import backend, {Backend} from "../../../src/server/connections/backend";
import connections, {Connections} from "../../../src/server/connections/connections";
import initialize from "../../../src/server/connections/initializeDatabase";
import database from "../../utilities/database";

describe("initializeDatabase", () => {
  const testDatabase: string = "test";
  const connection: Connections = connections({});
  const url: string = connection.backend().url;
  const {clear}: any = database(url);
  const db: Backend = backend(url);
  const category: string = "two";
  before(() => clear(testDatabase));
  after(() => clear(testDatabase));
  it("The database starts out empty.", () => {
    return db.getMaps(category, testDatabase)
      .catch((response) => expect(response.statusCode).to.equal(500));
  });
  it("Creates tables in the database.", () => {
    const timesToAttemptConnection: number = 6;
    return initialize(db, timesToAttemptConnection, testDatabase)
      .then((response: string) => {
        expect(response).to.equal("migrated");
      });
  });
  it("Tables have been created in the database.", () => {
    return db.getMaps(category, testDatabase)
      .catch((response) => expect(response.statusCode).to.equal(404));
  });
});
