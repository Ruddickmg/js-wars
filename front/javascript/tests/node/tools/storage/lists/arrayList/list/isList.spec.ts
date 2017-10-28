import {expect} from "chai";
import random from "../../../../../../../src/tools/calculations/random";
import isList from "../../../../../../../src/tools/storage/lists/arrayList/list/isList";
import createList, {ArrayList} from "../../../../../../../src/tools/storage/lists/arrayList/list/list";

describe("isList", () => {

  const list: ArrayList<any> = createList<any>();

  it("Reports whether an object is an arrayList or not.", () => {

    const keys: string[] = Object.keys(list);
    const randomProperty: string = keys[random.index(keys)];

    expect(isList(list)).to.equal(true);

    list[randomProperty] = undefined;

    expect(isList(list)).to.equal(false);
  });
});
