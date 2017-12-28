import {expect} from "chai";
import getReceivers, {Receivers} from "../../../../src/browser/communication/sockets/reciever";
import {subscribe, unsubscribe} from "../../../../src/tools/pubSub";

describe("transmitter", () => {
  const actions: string[] = ["addUser", "cursorMove"];
  const on: any = () => true;
  const mockSocket: any = {on};
  const receivers: Receivers = getReceivers(mockSocket);
  it("Creates routes to publish on when a socket message is received.", () => {
    receivers.add(...actions);
    actions.forEach((action: string): any => {
      expect(receivers[action]).to.be.a("function");
    });
  });
  it("Triggers a socket emit when calling a transmitter.", () => {
    const value: string = "OkOkOkOK";
    actions.forEach((transmitter: string): any => {
      const id: any = subscribe(transmitter, (receivedValue: any): any => {
        expect(receivedValue).to.equal(value);
      });
      receivers[transmitter](value);
      unsubscribe(id);
    });
  });
});
