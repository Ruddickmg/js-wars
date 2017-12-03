import {expect} from "chai";
import getSocket from "../../../../src/browser/communication/sockets/socket";

describe("socket", () => {
  it("Initializes a socket connection.", (done) => {
    const socket = getSocket();
    socket.on("connect", () => {
      expect(socket.connected).to.equal(true);
      socket.disconnect();
      done();
    });
  });
  it("Only makes one connection to be used.", () => expect(getSocket()).to.equal(getSocket()));
});
