import createDimensions, {Dimensions} from "../coordinates/dimensions";
import createPosition from "../coordinates/position";
import createBuilding from "./elements/building/building";
import createTerrain from "./elements/terrain/terrain";
import createMap, {Map} from "./map";

export default function(id: number): Map {

  const creatorId: number = 0;
  const amountOfPlayers: number = 2;
  const terrain = [
    createTerrain("tallMountain", createPosition(5, 6)),
    createTerrain("tallMountain", createPosition(8, 9)),
    createTerrain("tallMountain", createPosition(3, 15)),
    createTerrain("tallMountain", createPosition(4, 20)),
    createTerrain("tallMountain", createPosition(10, 4)),
    createTerrain("tallMountain", createPosition(8, 12)),
    createTerrain("tallMountain", createPosition(5, 12)),
    createTerrain("tallMountain", createPosition(1, 15)),
    createTerrain("tallMountain", createPosition(3, 9)),
    createTerrain("tallMountain", createPosition(4, 6)),
    createTerrain("tallMountain", createPosition(4, 16)),
    createTerrain("tree", createPosition(2, 16)),
    createTerrain("tree", createPosition(1, 18)),
    createTerrain("tree", createPosition(3, 6)),
    createTerrain("tree", createPosition(3, 5)),
    createTerrain("tree", createPosition(15, 12)),
    createTerrain("tree", createPosition(10, 10)),
    createTerrain("tree", createPosition(11, 15)),
    createTerrain("tree", createPosition(20, 3)),
    createTerrain("tree", createPosition(19, 5)),
  ];
  const buildings = [
    createBuilding("hq", createPosition(0, 9), 1),
    createBuilding("hq", createPosition(20, 9), 2),
    createBuilding("base", createPosition(4, 9), 1),
    createBuilding("base", createPosition(16, 9), 2),
  ];
  const dimensions: Dimensions = createDimensions(20, 20);

  return createMap(`test map #${id}`, creatorId, amountOfPlayers, dimensions, terrain, buildings);
}
