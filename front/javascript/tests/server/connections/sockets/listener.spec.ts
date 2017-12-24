import {expect} from "chai";
import * as sinon from "sinon";
import {SinonSpy} from "sinon";
import createListeners, {Listener, SocketListeners} from "../../../../src/server/connections/sockets/listener";

describe("listener", () => {
  const message: string = "called it!";
  const listeners: SocketListeners = createListeners();
  const mockSocket: any = {
    on(_: any, callback: any) {
      callback(message);
    },
  };
  const firstListener: SinonSpy = sinon.spy();
  const secondListener: SinonSpy = sinon.spy();
  const listenerOne: Listener = {firstListener};
  const listenerTwo: Listener = {secondListener};
  it("Adds listeners to listener and can iterate through them passing a socket to listen on.", () => {
    listeners.addListeners(listenerOne, listenerTwo)
      .listenForSocketCommunication(mockSocket);
    [firstListener, secondListener].forEach((listener: SinonSpy) => {
      expect(listener.calledWithExactly(message, mockSocket)).to.equal(true);
    });
  });
});
