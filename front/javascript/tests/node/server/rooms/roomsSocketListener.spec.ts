import {expect} from "chai";
import {mock, SinonMock, SinonSpy, spy} from "sinon";
import createGame, {Game} from "../../../../src/game/game";
import {Map} from "../../../../src/game/map/map";
import testMap from "../../../../src/game/map/testMap";
import createUser, {User} from "../../../../src/game/users/user";
import createClient, {Client} from "../../../../src/server/clients/client";
import getClientHandler, {ClientHandler} from "../../../../src/server/clients/clients"; // use to mock socket.io
import {Listener} from "../../../../src/server/connections/sockets/listener";
import {Lobby} from "../../../../src/server/rooms/lobby";
import createRoom, {Room} from "../../../../src/server/rooms/room";
import getRoomHandler, {Rooms} from "../../../../src/server/rooms/rooms";
import roomsSocketListener from "../../../../src/server/rooms/roomsSocketListener";

describe("roomsSocketListener", () => {
  const roomsListener: Listener = roomsSocketListener();
  const loginSite: string = "testing";
  const userId: number = 1;
  const testUserData: any = {
    email: "joejohn@jswars.com",
    first_name: "joe",
    gender: "male",
    id: userId,
    last_name: "john",
    link: "https://www.whereareyourpantsjoe.com",
    name: "joe",
  };
  const rooms: Rooms = getRoomHandler("goTeam");
  const lobby: Lobby = rooms.lobby();
  const join: SinonSpy = spy();
  const leave: SinonSpy = spy();
  const emit: SinonSpy = spy();
  const moveTo: SinonSpy = spy();
  const testSocket: any = {
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
  };
  const name: string = "testing";
  const category: string = "two";
  const map: Map = testMap(userId);
  const testGame: Game = createGame(name, category, map);
  const clients: ClientHandler = getClientHandler();
  const client: Client = createClient(testSocket);
  const user: User = createUser(testUserData, loginSite);
  const room: Room = createRoom(userId, testGame);
  let mockedRoom: SinonMock;
  let mockedRooms: SinonMock;
  let mockedClients: SinonMock;
  let mockedClient: SinonMock;
  beforeEach(() => {
    mockedRoom = mock(room);
    mockedRooms = mock(rooms);
    mockedClients = mock(clients);
    mockedClient = mock(client);
  });
  afterEach(() => {
    [mockedRooms, mockedClients, mockedClient, mockedRoom]
      .forEach((mockery: SinonMock) => {
        mockery.verify();
        mockery.restore();
      });
  });
  it("Handles new connections, creating/adding a user object for incoming users", () => {
    mockedClients.expects("wasDisconnected").once().withExactArgs(userId).returns(false);
    mockedClients.expects("add").once().withExactArgs(testSocket, userId).returns(client);
    mockedClient.expects("setPlayer").once().returns(client);
    mockedClient.expects("setUser").once().withExactArgs(user);
    mockedClients.expects("byId").withExactArgs(userId).returns(client);
    mockedClient.expects("joinRoom").once().withExactArgs(lobby).once();
    mockedClient.expects("emit").once().withArgs("player");
    roomsListener.addUser(user, testSocket);
  });
  it("Reconnects returning users that have been disconnected.", () => {
    mockedClients.expects("wasDisconnected").once().withExactArgs(userId).returns(true);
    mockedClients.expects("reconnect").withExactArgs(userId).returns(client);
    mockedClient.expects("setSocket").once().withExactArgs(testSocket);
    mockedClients.expects("byId").once().withExactArgs(userId).returns(client);
    mockedClient.expects("joinRoom").withExactArgs(lobby).once();
    mockedClient.expects("emit").once().withArgs("player");
    roomsListener.addUser(user, testSocket);
  });
  it("Coordinates users joining games/rooms via socket communication.", () => {
    mockedClients.expects("bySocket").once().withExactArgs(testSocket).returns(client);
    mockedRooms.expects("get").once().withExactArgs(room).returns(room);
    mockedClient.expects("joinRoom").once().withExactArgs(room);
    mockedClient.expects("emit").once().withExactArgs("joinedGame", testGame);
    mockedClient.expects("broadcast").twice();
    roomsListener.join(room, testSocket);
  });
  it("Will report an error if an invalid room is found while attempting to join.", () => {
    const errorMessage: string = "Invalid room found in call to join on the roomsSocketListener.";
    const methodUnderTest: any = roomsListener.join.bind({}, room, testSocket);
    mockedRooms.expects("get").returns(false);
    expect(methodUnderTest).to.throw(errorMessage);
  });
  it("Adds a new game to the available games.", () => {
    mockedClients.expects("bySocket").once().withExactArgs(testSocket).returns(client);
    mockedRooms.expects("get").once().withExactArgs(testGame).returns(false);
    mockedRooms.expects("add").once().withExactArgs(testGame).returns(room);
    mockedClient.expects("emit").once().withExactArgs("joinedGame", testGame);
    mockedClient.expects("emitToLobby").once().withExactArgs("addRoom", testGame);
    roomsListener.newRoom(testGame, testSocket);
  });
  it("Reports if a game is already created when attempting to add a new one.", () => {
    mockedClients.expects("bySocket").once().withExactArgs(testSocket).returns(client);
    mockedRooms.expects("get").once().withExactArgs(testGame).returns(room);
    mockedClient.expects("emit").once().withExactArgs("roomAlreadyExists", testGame);
    roomsListener.newRoom(testGame, testSocket);
  });
  it("Handles disconnected sockets and the cleanup of their respective user information", () => {
    mockedClients.expects("bySocket").once().withExactArgs(testSocket).returns(client);
    mockedClient.expects("getRoom").once().returns(room);
    mockedClients.expects("disconnect").once().withExactArgs(testSocket);
    mockedRooms.expects("remove").once().withExactArgs(room);
    mockedRoom.expects("getAiPlayers").returns([]);
    roomsListener.disconnect(void 0, testSocket);
  });
});
