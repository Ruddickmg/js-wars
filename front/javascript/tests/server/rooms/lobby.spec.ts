import {expect} from "chai";
import createPlayer, {Player} from "../../../src/game/users/players/player";
import createUser from "../../../src/game/users/user";
import createLobby, {Lobby} from "../../../src/server/rooms/lobby";

describe("lobby", () => {
  const name: string = "lobby";
  const roomId: number = 0;
  const userOne: Player = createPlayer(createUser({
    email: "test@email.com",
    first_name: "firstOne",
    gender: "male",
    id: 1,
    last_name: "lastOne",
    link: "www.testy.com",
    name: "yoMan",
  }, "facebook"), "andy");
  const userTwo: Player = createPlayer(createUser({
    email: "test@emailScheme.com",
    first_name: "test",
    gender: "female",
    id: 2,
    last_name: "McTesterson",
    link: "www.testLink.com",
    name: "testy",
  }, "twitter"), "max");
  describe("id", () => {
    const room: Lobby = createLobby(roomId);
    it("Returns the id of the room.", () => {
      expect(room.id()).to.equal(roomId);
    });
  });
  describe("name", () => {
    const room: Lobby = createLobby(roomId);
    it("Returns the name of the room.", () => {
      expect(room.name()).to.equal(name);
    });
  });
  describe("size", () => {
    const room: Lobby = createLobby(roomId);
    it("Returns the amount of players in the room.", () => {
      room.addPlayer(userOne);
      room.addPlayer(userTwo);
      expect(room.size()).to.equal(2);
    });
  });
  describe("addPlayer", () => {
    const room = createLobby(roomId);
    it("Adds a player to the room.", () => {
      room.addPlayer(userOne);
      expect(room.getPlayers()[0]).to.equal(userOne);
    });
  });
  describe("getPlayers", () => {
    const room: Lobby = createLobby(roomId);
    room.addPlayer(userOne);
    room.addPlayer(userTwo);
    it("Returns an array of all players in the room.", () => {
      const players: Player[] = room.getPlayers();
      expect(players).to.include(userOne);
      expect(players).to.include(userTwo);
      expect(players.length).to.equal(2);
    });
  });
  describe("getPlayer", () => {
    const room: Lobby = createLobby(roomId);
    room.addPlayer(userOne);
    room.addPlayer(userTwo);
    it("Returns a specified player by their id.", () => {
      expect(room.getPlayer(userTwo.id)).to.equal(userTwo);
    });
  });
  describe("removePlayer", () => {
    const room: Lobby = createLobby(roomId);
    room.addPlayer(userTwo);
    room.addPlayer(userOne);
    it("Removes a player from the room by their id.", () => {
      expect(room.getPlayer(userOne.id)).to.equal(userOne);
      expect(room.getPlayer(userTwo.id)).to.equal(userTwo);
      expect(room.size()).to.equal(2);
      room.removePlayer(userOne.id);
      expect(room.getPlayer(userTwo.id)).to.equal(userTwo);
      expect(room.getPlayer(userOne.id)).to.equal(undefined);
      expect(room.size()).to.equal(1);
    });
  });
});
