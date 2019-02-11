import {expect} from "chai";
import {SinonSpy, spy} from "sinon";
import {publish, subscribe, unsubscribe} from "../../src/tools/pubSub";

describe("pubSub", () => {

  const channel = "testing";
  const data = "w00t";
  const ids: any[] = [];

  let callback: SinonSpy;

  beforeEach(() => { callback = spy(); });
  afterEach(() => ids.forEach((id) => unsubscribe(id)));

  it("emits data to an event handler", () => {
    ids.push(subscribe("hello", (result: any) => expect(result).to.equal(data)));
    publish("hello", data);
  });

  it("subscribes to and receives data from a channel", () => {
    ids.push(subscribe(channel, callback));
    publish(channel, data);
    expect(callback.calledOnce).to.equal(true);
  });

  it("unsubscribes a subscriber by their id", () => {
    const subscriberId: number = subscribe(channel, callback) as number;
    publish(channel, data);
    unsubscribe(subscriberId);
    publish(channel, data);
    expect(callback.calledOnce).to.equal(true);
  });

  it("unsubscribes a subscriber from a specified channel using their id", () => {
    const subscriberId: number = subscribe(channel, callback) as number;
    publish(channel, data);
    unsubscribe(subscriberId, channel);
    publish(channel, data);
    expect(callback.calledOnce).to.equal(true);
  });
});
