import {expect} from "chai";
import createGame, {Game} from "../../../src/game/game";
import {Map} from "../../../src/game/map/map";
import map from "../../../src/game/map/testMap";
import createPlayer from "../../../src/game/users/players/player";
import createUser from "../../../src/game/users/user";
import {isLobby, Lobby} from "../../../src/server/rooms/lobby";
import {Room} from "../../../src/server/rooms/room";
import roomHandler, {Rooms} from "../../../src/server/rooms/rooms";

describe("rooms", () => {
  const backendUrl = "www.test.com";
  const category: string = "twoPlayer";
  const mapOne: Map = map(1);
  const mapTwo: Map = map(2);
  const rooms: Rooms = roomHandler(backendUrl);
  it("Adds a room to the rooms handler.", () => {
    const game: Game = createGame("szechuan sauce", category, mapOne);
    const room = rooms.add(game);
    expect(rooms.get(room.id())).to.equal(room);
    rooms.remove(room);
  });
  it("reserves ids that are already being used", () => {
    const ids = [2, 3, 4, 5, 6, 7];
    let name = "szechuan sauce";
    let createdRooms: Room[];
    rooms.addReservedIds(ids);
    createdRooms = ids.map(() => {
      name += " sauce!.";
      return rooms.add(createGame(name, category, mapOne));
    });
    ids.forEach((id) => expect(rooms.get(id)).to.equal(undefined));
    createdRooms.forEach((room: Room): any => rooms.remove(room));
  });
  it("Retrieves all games of a specified category.", () => {
    const categoryOne: string = "onePlayer";
    const categoryTwo: string = "twoPlayer";
    const categoryThree: string = "threePlayer";
    const firstRoom: Room = rooms.add(createGame(categoryOne, categoryOne, mapOne));
    const secondRoom: Room = rooms.add(createGame(categoryTwo, categoryTwo, mapOne));
    expect(rooms.category(categoryOne)[firstRoom.id()]).to.equal(firstRoom);
    expect(rooms.category(categoryTwo)[secondRoom.id()]).to.equal(secondRoom);
    expect(Object.keys(rooms.category(categoryThree)).length).to.equal(0);
    rooms.remove(firstRoom);
    rooms.remove(secondRoom);
  });
  it("Returns a specified game", () => {
    const room: Room = rooms.add(createGame(category, category, mapOne));
    expect(rooms.get(room.id())).to.equal(room);
    rooms.remove(room);
  });
  it("Retrieves all open/non-full/non-running games.", () => {
    const closedGame = createGame(category, category, mapOne);
    const firstRoom: Room = rooms.add(closedGame);
    const secondRoom: Room = rooms.add(createGame(category + "Two", category, mapOne));
    const numberOfRoomsExpectedToBeFound = 1;
    let openRooms;
    closedGame.started = true;
    openRooms = rooms.getOpenRooms(category);
    expect(openRooms[0]).to.equal(secondRoom.getGame());
    expect(openRooms.indexOf(firstRoom.getGame())).is.below(0);
    expect(openRooms.length).to.equal(numberOfRoomsExpectedToBeFound);
    [firstRoom, secondRoom].forEach((room: Room): any => rooms.remove(room));
  });
  it("Retrieves all running games that are open to join.", () => {
    const runningGame = createGame(category, category, mapOne);
    const fullRunningGame = createGame(category + "Three", category, mapTwo);
    const firstRoom: Room = rooms.add(runningGame);
    const secondRoom: Room = rooms.add(createGame(category + "Two", category, map(3)));
    const thirdRoom: Room = rooms.add(fullRunningGame);
    const numberOfRoomsExpectedToBeFound = 1;
    let numberOfPlayersNeededToFillGame = fullRunningGame.max;
    let openRooms;
    runningGame.started = true;
    fullRunningGame.started = true;
    while (numberOfPlayersNeededToFillGame--) {
      thirdRoom.addPlayer(createPlayer(createUser({
        email: `test#${numberOfPlayersNeededToFillGame}@email.com`,
        first_name: "firstOne",
        gender: "male",
        id: 1,
        last_name: "lastOne",
        link: "www.testy.com",
        name: "yoMan",
      }, "facebook"), "andy"));
    }
    openRooms = rooms.getRunningRooms(category);
    expect(openRooms[0]).to.equal(firstRoom.getGame());
    expect(openRooms.indexOf(secondRoom.getGame())).is.below(0);
    expect(openRooms.indexOf(thirdRoom.getGame())).is.below(0);
    expect(openRooms.length).to.equal(numberOfRoomsExpectedToBeFound);
  });
  it("Retrieves the lobby room.", () => {
    const lobby: Lobby = rooms.lobby();
    expect(isLobby(lobby)).to.equal(true);
  });
  it("Matches running or open games with loaded saved games so that they may be rejoined.", () => {
    const runningGame = createGame(category, category, mapOne);
    const savedGame = Object.assign({}, runningGame);
    const firstRoom: Room = rooms.add(runningGame);
    const secondRoom: Room = rooms.add(createGame(category + "Two", category, mapOne));
    const numberOfRoomsExpectedToBeFound = 1;
    let matchedGames;
    runningGame.started = true;
    savedGame.id = firstRoom.id();
    matchedGames = rooms.matchRunningGames([savedGame]);
    expect(matchedGames[0]).to.equal(firstRoom.getGame());
    expect(matchedGames.indexOf(secondRoom.getGame())).is.below(0);
    expect(matchedGames.length).to.equal(numberOfRoomsExpectedToBeFound);
  });
  it("Removes a game from the room list.", () => {
    const room: Room = rooms.add(createGame(category, category, mapOne));
    rooms.remove(room);
    expect(rooms.get(room.id())).to.equal(undefined);
  });
});
