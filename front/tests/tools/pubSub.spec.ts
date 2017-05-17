/**
 * Created by moonmaster on 5/13/17.
 */

import {expect} from "chai";
import {default as pubSub, PubSub} from "../../src/tools/pubSub";

describe("pubSub", () => {

    const sinon = require("sinon");

    describe("publish", () => {

        const router: PubSub = pubSub();
        const data: string = "world";

        it("emits data to an event handler", () => {

            router.subscribe("hello", (result) => expect(result).to.equal(data));
            router.publish("hello", data);
        });
    });

    describe("subscribe", () => {

        const channel = "testing";
        const data = "w00t";
        const callback = sinon.spy();
        const router: PubSub = pubSub();

        it ("subscribes to and receives data from a channel", () => {

            router.subscribe(channel, callback);
            router.publish(channel, data);

            expect(callback.calledOnce).to.be.true;
        });
    });

    describe("unsubscribe", () => {

        const channel = "testing";
        const data = "w00t";
        const router: PubSub = pubSub();

        describe("unsubscribe by id", () => {

            it ("unsubscribes a subscriber by their id", () => {

                const callback = sinon.spy();
                const subscriberId = router.subscribe(channel, callback);

                router.publish(channel, data);
                router.unsubscribe(subscriberId);
                router.publish(channel, data);

                expect(callback.calledOnce).to.be.true;
            });
        });

        describe("unsubscribe by channel and id", () => {

            it ("unsubscribes a subscriber from a specified channel using their id", () => {

                const callback = sinon.spy();
                const subscriberId = router.subscribe(channel, callback);

                router.publish(channel, data);
                router.unsubscribe(subscriberId, channel);
                router.publish(channel, data);

                expect(callback.calledOnce).to.be.true;
            });
        });
    });
});
