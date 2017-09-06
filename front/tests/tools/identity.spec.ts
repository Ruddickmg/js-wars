import {expect} from "chai";
import {default as identifier, Identifier} from "../../javascript/tools/identity";
import random from "../../javascript/tools/calculations/random";

describe("identity", () => {

    const incrementId = (n: number) => n + 1;
    const decrementId = (n: number) => n - 1;
    const numberOfTests = 100;

    describe("get", () => {

        const identity: Identifier<number> = identifier<number>(1, incrementId, decrementId);

        it("returns a unique id", () => {

            const record: any = {};
            let testing: number = numberOfTests;
            let id;

            while (testing--) {

                id = identity.get();
                expect(!record[id]).to.equal(true);
                record[id] = true;
            }
        });
    });

    describe("remove", () => {

        const identity: Identifier<number> = identifier<number>(1, incrementId, decrementId);

        it("removes an id from the pool of used ids", () => {

            let testing = numberOfTests;
            let id;

            while (testing--) {

                id = identity.get();

                if (random.boolean()) {

                    identity.remove(id);

                    expect(identity.get()).to.equal(id);
                }
            }
        });
    });

    describe("reserveIds", () => {

        const identity: Identifier<number> = identifier<number>(1, incrementId, decrementId);

        let currentId: number = numberOfTests;
        const reservedIds: any = {};

        while (currentId--) {

            if (random.boolean()) {

                reservedIds[currentId] = true;
            }
        }

        it("adds ids to the pool of used ids", () => {

            const ids = Object.keys(reservedIds)
                .map((id: string) => Number(id));

            let currentNumber = numberOfTests;
            let id;

            identity.reserveIds(ids);

            while (currentNumber--) {

                id = identity.get();

                expect(!reservedIds[id]).to.equal(true);
            }
        });
    });
});
