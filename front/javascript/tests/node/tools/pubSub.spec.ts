import {expect} from "chai";
import {publish, subscribe, unsubscribe} from "../../../src/tools/pubSub";

describe("pubSub", () => {
  const sinon = require("sinon");
  describe("publish", () => {
    const data: string = "world";
    it("emits data to an event handler", () => {
      subscribe("hello", (result: any) => expect(result).to.equal(data));
      publish("hello", data);
    });
  });

  describe("subscribe", () => {

    const channel = "testing";
    const data = "w00t";
    const callback = sinon.spy();

    it("subscribes to and receives data from a channel", () => {

      subscribe(channel, callback);
      publish(channel, data);

      expect(callback.calledOnce).to.equal(true);
    });
  });

  describe("unsubscribe", () => {

    const channel = "testing";
    const data = "w00t";

    describe("unsubscribe by id", () => {

      it("unsubscribes a subscriber by their id", () => {

        const callback = sinon.spy();
        const subscriberId: number = subscribe(channel, callback) as number;

        publish(channel, data);
        unsubscribe(subscriberId);
        publish(channel, data);

        expect(callback.calledOnce).to.equal(true);
      });
    });

    describe("unsubscribe by channel and id", () => {

      it("unsubscribes a subscriber from a specified channel using their id", () => {

        const callback = sinon.spy();
        const subscriberId: number = subscribe(channel, callback) as number;

        publish(channel, data);
        unsubscribe(subscriberId, channel);
        publish(channel, data);

        expect(callback.calledOnce).to.equal(true);
      });
    });
  });
});
