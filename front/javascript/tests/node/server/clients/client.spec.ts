import {expect} from "chai";
import createGame, {Game} from "../../../../src/game/game";
import map from "../../../../src/game/map/testMap";
import createPlayer, {Player} from "../../../../src/game/users/players/player";
import createUser, {User} from "../../../../src/game/users/user";
import createClient, {Client} from "../../../../src/server/clients/client";
import createRoom, {Room} from "../../../../src/server/rooms/room";

// TODO redo tests with actual socket.io

describe("client", () => {

  const sinon = require("sinon");
  const roomId: number = 1;
  const testRoomName: string = "testRoom";
  const category: string = "testCategory";
  const testPath: string = "testPath";
  const testData: string = "testData";
  const testUser: User = createUser({

    email: "test@email.com",
    first_name: "firstOne",
    gender: "male",
    id: 1,
    last_name: "lastOne",
    link: "www.testy.com",
    name: "yoMan",
  }, "none");
  const testPlayer: Player = createPlayer(testUser, "andy");
  const testGame: Game = createGame(testRoomName, category, map(5));
  const testRoom: Room = createRoom(roomId, testGame);
  const join: any = sinon.spy();
  const leave: any = sinon.spy();
  const moveTo: any = sinon.spy();
  const mockSocket: any = (emit) => ({
    id: 1,
    name: "mock socket",
    emit,
    broadcast: {
      moveTo: (roomName: string): any => {
        moveTo(roomName);
        return {emit};
      },
    },
    join,
    leave,
  });
  const testEmitter: any = sinon.spy();
  const testSocket: any = mockSocket(testEmitter);

  describe("broadcast", () => {

    const client: Client = createClient(testSocket);

    it("Broadcasts data to browser side client.", () => {

      client.joinRoom(testRoom);
      client.broadcast(testPath, testData);

      expect(testEmitter.calledWith(testPath, testData)).to.equal(true);
    });
  });

  describe("disconnect", () => {

    const client: Client = createClient(testSocket);
    const messageSentOnLeaving = "userLeftRoom";
    const messageSentOnDisconnect = "disconnected";

    client.setPlayer(testPlayer);
    client.setUser(testUser);

    it("Handles the disconnection of a client.", () => {

      client.joinRoom(testRoom);
      client.disconnect();

      expect(testEmitter.calledWith(messageSentOnDisconnect, testPlayer)).to.equal(true);
      expect(leave.calledWith(testRoomName)).to.equal(true);

      testGame.saved = true;

      client.joinRoom(testRoom);
      client.disconnect();

      expect(testEmitter.calledWith(messageSentOnLeaving)).to.equal(true);
      expect(leave.calledWith(testRoomName)).to.equal(true);
    });
  });

  describe("emit", () => {

    const client: Client = createClient(testSocket);

    it("Emits data to all users in the same room as the specified client.", () => {

      client.joinRoom(testRoom);
      client.emit(testData);

      expect(testEmitter.calledWith(testData)).to.equal(true);
    });
  });

  describe("emitToLobby", () => {

    const client: Client = createClient(testSocket);

    it("Emits data to every user connected to the lobby", () => {

      client.emitToLobby(testPath, testData);

      expect(moveTo.calledWith("lobby")).to.equal(true);
      expect(testEmitter.calledWith(testPath, testData));
    });
  });

  describe("joinRoom", () => {

    const client: Client = createClient(testSocket);

    it("Adds client to a specific room", () => {

      client.joinRoom(testRoom);

      expect(join.calledWith(testRoomName)).to.equal(true);
    });
  });

  describe("getPlayer", () => {

    const client: Client = createClient(testSocket);

    client.setPlayer(testPlayer);

    it("Returns the clients player object", () => {

      expect(client.getPlayer()).to.equal(testPlayer);
    });
  });

  describe("getRoom", () => {

    const client: Client = createClient(testSocket);

    client.joinRoom(testRoom);

    it("Returns the room a client is connected to", () => {

      expect(client.getRoom()).to.equal(testRoom);
    });
  });

  describe("getSocket", () => {

    const client: Client = createClient({});

    client.setSocket(testSocket);

    it("Returns the socket used by the client", () => {

      expect(client.getSocket()).to.equal(testSocket);
    });
  });

  describe("setPlayer", () => {

    const client: Client = createClient({});

    it("Sets the player object for the client", () => {

      client.setPlayer(testPlayer);

      expect(client.getPlayer()).to.equal(testPlayer);
    });
  });

  describe("setSocket", () => {

    const client: Client = createClient({});

    it("Sets the socket used by the client", () => {

      client.setSocket(testSocket);

      expect(client.getSocket()).to.equal(testSocket);
    });
  });

  describe("setUser", () => {

    const client: Client = createClient({});

    it("Sets the user data associated with the client", () => {

      client.setUser(testUser);

      expect(client.getUser()).to.equal(testUser);
    });
  });

  describe("getUser", () => {

    const client: Client = createClient({});

    client.setUser(testUser);

    it("Gets the user data associated with the client", () => {

      expect(client.getUser()).to.equal(testUser);
    });
  });
});
