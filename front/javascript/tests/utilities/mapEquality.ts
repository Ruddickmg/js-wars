import {expect} from "chai";
import {Coordinates} from "../../src/game/map/coordinates/position";
import {Map} from "../../src/game/map/map";
import typeChecker, {TypeChecker} from "../../src/tools/validation/typeChecker";
import {isNumber} from "util";

export function checkIfMapElementsAreEqual(one: any[], two: any[]) {
  one.forEach((element: any, index: number) => {
    const elementTwo: any = two[index];
    const position: Coordinates = element.position;
    const positionTwo: Coordinates = element.position;
    element.position = undefined;
    elementTwo.position = undefined;
    expect(position.x).to.equal(positionTwo.x);
    expect(position.y).to.equal(positionTwo.y);
    expect(element).to.deep.equal(elementTwo);
    element.position = position;
    elementTwo.position = positionTwo;
  });
}

export default function(receivedMap: Map, map: Map): any {
  const {isString}: TypeChecker = typeChecker();
  if (isNumber(receivedMap.id) && isNumber(map.id)) {
    expect(receivedMap.id).to.equal(map.id);
  }
  expect(receivedMap.dimensions).to.deep.equal(map.dimensions);
  if (isString(receivedMap.creator) && isString(map.creator)) {
    expect(receivedMap.creator).to.equal(map.creator);
  }
  expect(receivedMap.category).to.equal(map.category);
  expect(receivedMap.name).to.equal(map.name);
  expect(receivedMap.maximumAmountOfPlayers).to.equal(map.maximumAmountOfPlayers);
  checkIfMapElementsAreEqual(receivedMap.buildings, map.buildings);
  checkIfMapElementsAreEqual(receivedMap.units, map.units);
  checkIfMapElementsAreEqual(receivedMap.terrain, map.terrain);
}
