import {expect} from "chai";
import createDimensions from "../../../src/game/map/coordinates/dimensions";
import createPosition, {Position} from "../../../src/game/map/coordinates/position";
import createTerrain, {Terrain} from "../../../src/game/map/elements/terrain/terrain";
import createPathFinder, {PathFinder} from "../../../src/tools/pathfinding/pathFinder";
import createMatrix, {Matrix} from "../../../src/tools/storage/matrix/matrix";

describe("pathfinder", () => {
  const startingPoint: number = 1;
  const allowedMovement: number = 22;
  const sizeSquared: number = 10;
  const range: number = 10;
  const mountainType: string = "tallMountain";
  const plainType: string = "plain";
  const matrix: Matrix<Terrain> = createMatrix<Terrain>();
  const getPosition = (element: any): Position => element.position;
  const getAllowedMovement = (element: any): number => element.movement;
  const getCost = (element: any): number => element.drawing === plainType ? 1 : 4;
  const pathfinder: PathFinder<Terrain> = createPathFinder<Terrain>(
    matrix,
    createDimensions(sizeSquared, sizeSquared),
    getPosition,
    getCost,
    getAllowedMovement,
  );
  const startingPosition: Position = createPosition(0, 9);
  const endingPosition: Position = createPosition(9, 0);
  const path: Position[] = [
    startingPosition,
    createPosition(1, 9),
    createPosition(2, 9),
    createPosition(3, 9),
    createPosition(4, 9),
    createPosition(4, 8),
    createPosition(4, 7),
    createPosition(4, 6),
    createPosition(5, 6),
    createPosition(6, 6),
    createPosition(6, 5),
    createPosition(6, 4),
    createPosition(6, 3),
    createPosition(5, 3),
    createPosition(4, 3),
    createPosition(4, 2),
    createPosition(4, 1),
    createPosition(4, 0),
    createPosition(5, 0),
    createPosition(6, 0),
    createPosition(7, 0),
    createPosition(8, 0),
    endingPosition,
  ];
  const expectedToBeReachable: Position[] = [
    startingPosition,
    createPosition(0, 8),
    createPosition(1, 9),
    createPosition(1, 8),
    createPosition(2, 9),
    createPosition(2, 8),
    createPosition(3, 9),
    createPosition(3, 8),
    createPosition(4, 9),
    createPosition(0, 7),
    createPosition(4, 8),
    createPosition(5, 9),
    createPosition(1, 7),
    createPosition(4, 7),
    createPosition(5, 8),
    createPosition(2, 7),
    createPosition(3, 7),
    createPosition(4, 6),
    createPosition(5, 7),
    createPosition(5, 6),
    createPosition(6, 6),
    createPosition(6, 5),
  ];
  const testElement: any = {
    movement: allowedMovement,
    position: startingPosition,
  };
  let x: number = 0;
  let y: number = 0;
  let obstaclePosition: Position;
  for (x; x < sizeSquared; x++) {
    for (y = 0; y < sizeSquared; y++) {
      obstaclePosition = createPosition(x, y);
      matrix.insert(createTerrain(mountainType, obstaclePosition), obstaclePosition);
    }
  }
  path.map((position: Position): any => createTerrain(plainType, position))
    .forEach((pathElement: any): any => {
      matrix.insert(pathElement, pathElement.position);
    });
  matrix.insert(testElement, startingPosition);
  it("Finds the shortest path between two points and returns it in order.", () => {
    const foundPath: any[] = pathfinder.getShortestPath(testElement, endingPosition);
    path.forEach((currentPosition: Position, index: number): void => {
      expect(currentPosition.on(foundPath[index])).to.equal(true);
    });
  });
  it("Returns a partial path if the path could not be reached.", () => {
    const amountShortOfTarget: number = 3;
    const expectedPathLength: number = allowedMovement + startingPoint - amountShortOfTarget;
    let partialPath: Position[];
    testElement.movement -= amountShortOfTarget;
    partialPath = pathfinder.getShortestPath(testElement, endingPosition);
    expect(partialPath.length).to.equal(expectedPathLength);
    partialPath.forEach((position: Position, index: number): void => {
      expect(position.on(path[index])).to.equal(true);
    });
  });
  it("Returns an empty path if the target could not be found.", () => {
    expect(pathfinder.getShortestPath(testElement, createPosition(20, 20)).length).to.equal(0);
  });
  it("Finds every position that can be reached from a point given an allowed amount of movement.", () => {
    const reachablePositions: Position[] = pathfinder.getAllReachablePositions(testElement, range);
    expectedToBeReachable.forEach((position: Position, index: number): void => {
      expect(position.on(reachablePositions[index])).to.equal(true);
    });
  });
});
