import {expect} from "chai";
import single from "../../javascript/tools/storage/singleton";

describe("singleton", () => {

    const createObject = () => ({});

    it("creates a single instance of an object", () => {

        const singleton = single(createObject);
        const object1 = singleton();
        const object2 = singleton();

        expect(object1).to.equal(object2);
    });
});
