import {expect} from "chai";
import socketIo = require("socket.io");
import ioClient = require("socket.io-client");
import createGame, {Game} from "../../../src/game/game";
import map from "../../../src/game/map/testMap";
import createPlayer, {Player} from "../../../src/game/users/players/player";
import createUser, {User} from "../../../src/game/users/user";
import createClient, {Client} from "../../../src/server/clients/client";
import connections, {Connections} from "../../../src/server/connections/connections";
import getServer from "../../../src/server/connections/server";
import createRoom, {Room} from "../../../src/server/rooms/room";

describe("client", () => {
  const sinon = require("sinon");
  const roomId: number = 1;
  const testRoomName: string = "testRoom";
  const category: string = "testCategory";
  const testPath: string = "testPath";
  const testData: string = "testData";
  const messageSentOnLeaving = "userLeftRoom";
  const messageSentOnDisconnect = "disconnected";
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
  const mockSocket: any = (emit: any) => ({
    broadcast: {
      to: (roomName: string): any => {
        moveTo(roomName);
        return {emit};
      },
    },
    emit,
    id: 1,
    join,
    leave,
    name: "mock socket",
  });
  const testEmitter: any = sinon.spy();
  const testSocket: any = mockSocket(testEmitter);
  const socketOptions: any = {
    "force new connection": true,
    "reconnection delay": 0,
    "reopen delay": 0,
    "transports": ["websocket"],
  };
  const pathToRootDirectory: string = `${__dirname}/../../../../../`;
  const connection: Connections = connections({
    IP: "127.0.9.4",
    PORT: "8050",
  });
  const frontend: any = connection.frontend();
  const url: string = frontend.url;
  let client: Client;
  let testClient: Client;
  let socketTwo: any;
  let socketOne: any;
  let server: any;
  let io: any;
  beforeEach((done) => {
    client = createClient(testSocket);
    server = getServer(pathToRootDirectory, connection);
    server.listen(frontend.port, frontend.ip);
    io = socketIo(server);
    socketOne = ioClient.connect(url, socketOptions);
    socketTwo = ioClient.connect(url, socketOptions);
    done();
  });
  afterEach((done) => {
    server.close();
    io.close();
    [socketOne, socketTwo].forEach((socket: any) => {
      if (socket.connected) {
        socket.disconnect();
      }
    });
    done();
  });
  it("Broadcasts data to browser side clients.", (done) => {
    socketOne.on(testPath, (data: string) => {
      expect(data).to.equal(testData);
      expect(testEmitter.calledWith(testPath, testData)).to.equal(true);
      done();
    });
    io.on("connection", (socket: any) => {
      client.joinRoom(testRoom);
      client.broadcast(testPath, testData);
      testClient = createClient(socket);
      testClient.joinRoom(testRoom);
      testClient.broadcast(testPath, testData);
    });
  });
  it("Emits data to browser side client.", (done) => {
    socketOne.on(testPath, (data: string) => {
      expect(data).to.equal(testData);
      expect(testEmitter.calledWith(testPath, testData)).to.equal(true);
      done();
    });
    io.on("connection", (socket: any) => {
      client.joinRoom(testRoom);
      client.emit(testPath, testData);
      testClient = createClient(socket);
      testClient.joinRoom(testRoom);
      testClient.emit(testPath, testData);
    });
  });
  it("Handles the disconnection of a client.", () => {
    client.setPlayer(testPlayer);
    client.setUser(testUser);
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
  it("Emits data to client", () => {
    client.joinRoom(testRoom);
    client.emit(testPath, testData);
    expect(testEmitter.calledWith(testPath, testData)).to.equal(true);
  });
  it("Emits data to every user connected to the lobby", () => {
    client.emitToLobby(testPath, testData);
    expect(moveTo.calledWith("lobby")).to.equal(true);
    expect(testEmitter.calledWith(testPath, testData));
  });
  it("Adds client to a specific room", () => {
    client.joinRoom(testRoom);
    expect(join.calledWith(testRoomName)).to.equal(true);
  });
  it("Returns the clients player object", () => {
    client.setPlayer(testPlayer);
    expect(client.getPlayer()).to.equal(testPlayer);
  });
  it("Returns the room a client is connected to", () => {
    client.joinRoom(testRoom);
    expect(client.getRoom()).to.equal(testRoom);
  });
  it("Returns the socket used by the client", () => {
    client.setSocket(testSocket);
    expect(client.getSocket()).to.equal(testSocket);
  });
  it("Sets the player object for the client", () => {
    client.setPlayer(testPlayer);
    expect(client.getPlayer()).to.equal(testPlayer);
  });
  it("Sets the socket used by the client", () => {
    client.setSocket(testSocket);
    expect(client.getSocket()).to.equal(testSocket);
  });
  it("Sets the user data associated with the client", () => {
    client.setUser(testUser);
    expect(client.getUser()).to.equal(testUser);
  });
  it("Gets the user data associated with the client", () => {
    client.setUser(testUser);
    expect(client.getUser()).to.equal(testUser);
  });
});
