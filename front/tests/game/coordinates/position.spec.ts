import {expect} from "chai";
import {Dimensions} from "../../javascript/coordinates/dimensions";
import createPosition, {Coordinates, Position} from "../../javascript/coordinates/position";
import {Map} from "../../../javascript/game/map/map";
import testMap from "../../../javascript/game/map/testMap";

describe("position", () => {

    const map = testMap();
    const x = 5;
    const y = 6;
    const {width, height}: Dimensions = map.dimensions;
    const checkNeighbors = (expectedNeighbors: Position[], neighbors: Position[], dimensions: Dimensions) => {

        return expectedNeighbors.reduce((allContained, expectedNeighbor) => {

            if (expectedNeighbor.inRange(dimensions)) {

                return allContained && neighbors.reduce((isIn, neighbor) => {

                    return isIn || neighbor.on(expectedNeighbor);

                }, false);
            }

            return allContained;

        }, true);
    };

    const corners = [

        createPosition(x + 1, y + 1),
        createPosition(x - 1, y - 1),
        createPosition(x - 1, y + 1),
        createPosition(x + 1, y - 1),
    ];
    const badNeighbors = [

        createPosition(x, y),
        createPosition(x - 1, y),
        createPosition(x, y + 1),
        createPosition(x, y - 1),
    ];
    const adjacentNeighbors = [

        createPosition(x + 1, y),
        createPosition(x - 1, y),
        createPosition(x, y + 1),
        createPosition(x, y - 1),
    ];

    describe("on", () => {

        it("Reports whether or not two positions are the same.", () => {

            const position: Position = createPosition(x, y);
            const samePosition: Coordinates = {x, y};
            const differentPosition: Coordinates = {
                x: x + 1,
                y: x + 2,
            };

            expect(position.on(samePosition)).to.equal(true);
            expect(position.on(differentPosition)).to.equal(false);
        });
    });

    describe("toString", () => {

        it("Returns a string representation of a position.", () => {

            expect(createPosition(x, y).toString()).to.equal(`{x: ${x}, y: ${y}}`);
        });
    });

    describe("inMap", () => {

        it("Reports whether a position is within the bounds of the supplied map.", () => {

            const position: Position = createPosition(width - 1, height - 1);
            const badPosition: Position = createPosition(width + 1, height + 1);

            expect(position.inRange(map.dimensions)).to.equal(true);
            expect(badPosition.inRange(map.dimensions)).to.equal(false);
        });
    });

    describe("neighbors", () => {

        it("Returns an array of directly adjacent grid squares.", () => {

            const neighbors = createPosition(x, y).neighbors(map.dimensions);

            expect(checkNeighbors(adjacentNeighbors, neighbors, map.dimensions)).to.equal(true);
            expect(checkNeighbors(badNeighbors, neighbors, map.dimensions)).to.equal(false);
        });
    });

    describe("corners", () => {

        it("Returns an array of diagonally neighboring squares.", () => {

            const neighbors = createPosition(x, y).corners(map.dimensions);

            expect(checkNeighbors(corners, neighbors, map.dimensions)).to.equal(true);
            expect(checkNeighbors(badNeighbors, neighbors, map.dimensions)).to.equal(false);
        });
    });

    describe("surrounding", () => {

        it("Returns an array of all neighbors both adjacent and diagonal.", () => {

            const neighbors = createPosition(x, y).surrounding(map.dimensions);
            const expectedNeighbors = adjacentNeighbors.concat(corners);

            expect(checkNeighbors(expectedNeighbors, neighbors, map.dimensions)).to.equal(true);
            expect(checkNeighbors(badNeighbors, neighbors, map.dimensions)).to.equal(false);
        });
    });
});
