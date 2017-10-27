import {expect} from "chai";
import pubSub, {PubSub} from "../../../../src/tools/pubSub"; // use to mock socket.io

describe("roomsSocketListener", () => {

  const mockSocketIo: PubSub = pubSub();

  it("Handles new connections, creating/adding a user object for incoming users", () => {

    // TODO
  });

  it("Coordinates users joining games/rooms via socket communication.", () => {

    // TODO
  });

  it("Coordinates the creation of new game rooms via socket communication", () => {

    // TODO
  });

  it("Handles disconnected sockets and the cleanup of their respective user information", () => {

    // TODO
  });
});
