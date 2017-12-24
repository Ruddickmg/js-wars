import {expect} from "chai";
import createGame, {Game} from "../../../src/game/game";
import {Map} from "../../../src/game/map/map";
import map from "../../../src/game/map/testMap";
import createAiPlayer, {AiPlayer} from "../../../src/game/users/ai/aiPlayer";
import createPlayer, {Player} from "../../../src/game/users/players/player";
import createUser from "../../../src/game/users/user";
import createRoom, {Room} from "../../../src/server/rooms/room";

describe("room", () => {
  const name: string = "szechuan sauce";
  const category: string = "twoPlayer";
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
  const aiPlayer: AiPlayer = createAiPlayer(createPlayer(createUser({
    email: "none",
    first_name: "testAi",
    gender: "computer",
    id: 2,
    last_name: "AiMcTesterson",
    link: "none",
    name: "aiPlayer",
  }), "max"));
  const mapOne: Map = map(1);
  const mapTwo: Map = map(2);
  describe("category", () => {
    const game: Game = createGame(name, category, mapOne);
    const room: Room = createRoom(roomId, game);
    it("returns the category of the room", () => {
      expect(room.category()).to.equal(category);
    });
  });
  describe("id", () => {
    const game: Game = createGame(name, category, mapOne);
    const room: Room = createRoom(roomId, game);
    it("Returns the id of the room.", () => {
      expect(room.id()).to.equal(roomId);
    });
  });
  describe("name", () => {
    const game: Game = createGame(name, category, mapOne);
    const room: Room = createRoom(roomId, game);
    it("Returns the name of the room.", () => {
      expect(room.name()).to.equal(name);
    });
  });
  describe("size", () => {
    const game: Game = createGame(name, category, mapOne);
    const room: Room = createRoom(roomId, game);
    it("Returns the amount of players in the room.", () => {
      room.addPlayer(userOne);
      room.addPlayer(userTwo);
      expect(room.size()).to.equal(2);
    });
  });
  describe("addPlayer", () => {
    const game: Game = createGame(name, category, mapOne);
    const room = createRoom(roomId, game);
    it("Adds a player to the room.", () => {
      room.addPlayer(userOne);
      expect(room.getUsers()[0]).to.equal(userOne);
    });
  });
  describe("addAi", () => {
    const game: Game = createGame(name, category, mapOne);
    const room: Room = createRoom(roomId, game);
    it("Adds an ai player to the room.", () => {
      room.addPlayer(userOne);
      room.addPlayer(userTwo);
      expect(room.getUsers()[1]).to.equal(userTwo);
      room.addAi(aiPlayer);
      expect(room.getPlayers()[1]).to.equal(aiPlayer);
    });
  });
  describe("getPlayers", () => {
    const game: Game = createGame(name, category, mapOne);
    const room: Room = createRoom(roomId, game);
    room.addPlayer(userOne);
    room.addPlayer(userTwo);
    it("Returns an array of all players in the room.", () => {
      const players = room.getPlayers();
      expect(players[0]).to.equal(userOne);
      expect(players[1]).to.equal(userTwo);
      expect(players.length).to.equal(2);
    });
  });
  describe("getAiPlayers", () => {
    const game: Game = createGame(name, category, mapOne);
    const room: Room = createRoom(roomId, game);
    room.addPlayer(userOne);
    room.addPlayer(userTwo);
    room.addPlayer(aiPlayer);
    it("Returns an array of all ai players in the room.", () => {
      const aiPlayers = room.getAiPlayers();
      expect(aiPlayers[0]).to.equal(aiPlayer);
      expect(aiPlayers.length).to.equal(1);
    });
  });
  describe("getPlayer", () => {
    const game: Game = createGame(name, category, mapOne);
    const room: Room = createRoom(roomId, game);
    room.addPlayer(userOne);
    room.addPlayer(userTwo);
    room.addPlayer(aiPlayer);
    it("Returns a specified player by their id.", () => {
      expect(room.getPlayer(userTwo.id)).to.equal(userTwo);
    });
  });
  describe("getGame", () => {
    const game: Game = createGame(name, category, mapOne);
    const room: Room = createRoom(roomId, game);
    it("Returns the game being hosted by the room.", () => {
      expect(room.getGame()).to.equal(game);
    });
  });
  describe("isSaved", () => {
    const game: Game = createGame(name, category, mapOne);
    const room: Room = createRoom(roomId, game);
    it("Returns a boolean indicating whether a game was saved or not.", () => {
      expect(room.isSaved()).to.equal(false);
      game.saved = true;
      expect(room.isSaved()).to.equal(true);
    });
  });
  describe("isEmpty", () => {
    const game: Game = createGame(name, category, mapOne);
    const room: Room = createRoom(roomId, game);
    it("Returns a boolean indicating whether the room contains players or not.", () => {
      room.addPlayer(aiPlayer);
      expect(room.isEmpty()).to.equal(true);
      room.addPlayer(userTwo);
      expect(room.isEmpty()).to.equal(false);
    });
  });
  describe("isFull", () => {
    const game: Game = createGame(name, category, mapOne);
    const room: Room = createRoom(roomId, game);
    let numberOfPlayersNeededToFill = game.max;
    it("Returns a boolean indicating whether the game is full or not.", () => {
      expect(room.isFull()).to.equal(false);
      while (numberOfPlayersNeededToFill--) {
        room.addPlayer(userTwo);
      }
      expect(room.isFull()).to.equal(true);
    });
  });
  describe("hasStarted", () => {
    const game: Game = createGame(name, category, mapOne);
    const room: Room = createRoom(roomId, game);
    room.addPlayer(userOne);
    room.addPlayer(userTwo);
    it("Returns a boolean indicating whether the game has started or not.", () => {
      expect(room.hasStarted()).to.equal(false);
      game.started = true;
      expect(room.hasStarted()).to.equal(true);
    });
  });
  describe("isSameAs", () => {
    const roomTwoId: number = roomId + 1;
    const roomTwoName: string = name + "Two";
    const game: Game = createGame(name, category, mapOne);
    const gameTwo: Game = createGame(roomTwoName, category, mapTwo);
    const room: Room = createRoom(roomId, game);
    const roomTwo: Room = createRoom(roomTwoId, gameTwo);
    it("Returns a boolean indicating whether a game is the same as the current or not.", () => {
      expect(room.isSameAs(room)).to.equal(true);
      expect(room.isSameAs(roomTwo)).to.equal(false);
    });
  });
  describe("getUsers", () => {
    const game: Game = createGame(name, category, mapOne);
    const room: Room = createRoom(roomId, game);
    room.addPlayer(aiPlayer);
    room.addPlayer(userOne);
    it("Returns an array of all actual users in game room (no ai players).", () => {
      expect(room.getUsers()[0]).to.equal(userOne);
    });
  });
  describe("removePlayer", () => {
    const game: Game = createGame(name, category, mapOne);
    const room: Room = createRoom(roomId, game);
    room.addPlayer(userTwo);
    room.addPlayer(userOne);
    it("Removes a player from the room by their id.", () => {
      expect(room.getPlayers()[1]).to.equal(userOne);
      expect(room.getPlayers()[0]).to.equal(userTwo);
      expect(room.size()).to.equal(2);
      room.removePlayer(userOne.id);
      expect(room.getPlayers()[0]).to.equal(userTwo);
      expect(room.size()).to.equal(1);
    });
  });
  describe("replacePlayer", () => {
    const game: Game = createGame(name, category, mapOne);
    const room: Room = createRoom(roomId, game);
    room.addPlayer(userOne);
    it("Removes a player then inserts another in its place.", () => {
      expect(room.getPlayers()[0]).to.equal(userOne);
      room.replacePlayer(userOne.id, userTwo);
      expect(room.getPlayers()[0]).to.equal(userTwo);
      expect(room.size()).to.equal(1);
    });
  });
});
