// import {expect} from "chai";
// import backend, {Backend} from "../../../../src/server/connections/backend";
// import connections, {Connections} from "../../../../src/server/connections/connections";
// import initialize from "../../../../src/server/connections/initializeDatabase";
// import database from "../../../utilities/database";
//
// describe("initializeDatabase", () => {
//   const connection: Connections = connections({});
//   const url: string = connection.backend().url;
//   const {clear}: any = database(url);
//   const db: Backend = backend(url);
//   const category: string = "two";
//   before(clear);
//   after(clear);
//   it("The database starts out empty.", () => {
//     return db.getMaps(category).catch((response) => expect(response.statusCode).to.equal(500));
//   });
//   it("Creates tables in the database.", () => {
//     return initialize(db).then((response: boolean) => {
//       expect(response).to.equal("migrated");
//     });
//   });
//   it("Tables have been created in the database.", () => {
//     return db.getMaps(category).catch((response) => expect(response.statusCode).to.equal(404));
//   });
// });
