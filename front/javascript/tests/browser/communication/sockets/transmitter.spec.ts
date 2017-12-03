import {expect} from "chai";
import {mock, SinonMock} from "sinon";
import getTransmitters, {Transmitters} from "../../../../src/browser/communication/sockets/transmitter";

describe("transmitter", () => {
  const actions: string[] = ["addUser", "cursorMove"];
  const emit: any = () => true;
  const mockSocket: any = {emit};
  const mockedSocket: SinonMock = mock(mockSocket);
  const transmitters: Transmitters = getTransmitters(mockSocket);
  it("initializes routes for pub sub to call socket.io emit from.", () => {
    transmitters.add(...actions);
    actions.forEach((action: string): any => expect(transmitters[action]).to.be.a("function"));
  });
  it("Triggers a socket emit when calling a transmitter.", () => {
    const value: string = "OkOkOkOK";
    actions.forEach((transmitter: string): any => {
      mockedSocket.expects("emit").withExactArgs(transmitter, value);
      transmitters[transmitter](value);
    });
    mockedSocket.verify();
    mockedSocket.restore();
  });
});
