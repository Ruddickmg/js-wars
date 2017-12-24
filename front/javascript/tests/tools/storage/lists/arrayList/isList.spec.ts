import {expect} from "chai";
import random from "../../../../../src/tools/calculations/random";
import isList from "../../../../../src/tools/storage/lists/arrayList/isList";
import createList, {ArrayList} from "../../../../../src/tools/storage/lists/arrayList/list";

describe("isList", () => {
  it("Reports whether an object is an.", () => expect(isList(createList<any>())).to.equal(true));
  it("Reports if an object is not a list.", () => {
    const list: ArrayList<any> = createList<any>();
    const keys: string[] = Object.keys(list);
    const randomProperty: string = keys[random.index(keys)];
    list[randomProperty] = undefined;
    expect(isList(list)).to.equal(false);
  });
});
