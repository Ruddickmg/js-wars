import {expect} from "chai";
import truthTable, {TruthTable} from "../../../../src/tools/array/generateTruthTable";

describe("truthTable", () => {
  it("Creates an object with its properties set to true and defined by the elements of an array.", () => {
    const inTruthTable: any[] = ["foo", "bar", 2, 4];
    const notInTruthTable: any[] = ["buz", "baz", 6, 7];
    const table: TruthTable = truthTable(...inTruthTable);
    inTruthTable.forEach((value: any): void => {
      expect(table[value]).to.equal(true);
    });
    notInTruthTable.forEach((value: any): void => {
      expect(!table[value]).to.equal(true);
    });
  });
});
