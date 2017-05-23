import {default as socketHandler, SocketHandler} from "../connections/sockets/socketHandler.js";
import {AnyRoom, isRoom} from "../rooms/rooms";
import {default as createPlayer, Player} from "../users/players/player";
import {RoomId, User} from "../users/user";
import {Client, default as createClient} from "./client.js";

export type ClientId = string | number;

export interface ClientHandler {

    bySocket(socket: any): Client;
    byId(id: ClientId): Client;
    remove(id: ClientId): Client;
    wasDisconnected(id: ClientId): boolean;
    add(socket: any, id: ClientId): Client;
    disconnect(socket: any): ClientHandler;
    reconnect(id: ClientId): Client;
    removeTimedOutDisconnections(timeAllowedToReconnect: number): ClientHandler;
    updateUser(user: any, id: RoomId): Player;
}

interface DisconnectedClient {

    client: Client;
    timeOfDisconnect: Date;
}

interface Clients {

    [index: string]: Client;
}

interface DisconnectedClients {

    [index: string]: DisconnectedClient;
}

type AllClients = Clients | DisconnectedClients;
type AnyClient = Client | DisconnectedClient;

export default function(): ClientHandler {

    let connectedClients: Clients = {};
    let disconnectedClients: DisconnectedClients = {};

    const socketIds: SocketHandler = socketHandler();
    const getClientBySocket = (socket: any, listOfClients: Clients): Client => listOfClients[socketIds.getId(socket)];
    const getClientById = (id: ClientId, listOfClients: AllClients): AnyClient => listOfClients[id];
    const addClient = (client: AnyClient , id: ClientId, listOfClients: AllClients): AllClients => {

        const modifiedClientList: AllClients = Object.assign({}, listOfClients);

        modifiedClientList[id] = client;

        return modifiedClientList;
    };
    const removeClient = (id: ClientId, listOfClients: AllClients): AllClients => {

        const modifiedClientList: AllClients = Object.assign({}, listOfClients);

        delete modifiedClientList[id];

        return modifiedClientList;
    };
    const add = (socket: any, id: ClientId): Client => {

        const client: Client = createClient(socket);

        socketIds.setId(socket, id);

        connectedClients = addClient(client, id, connectedClients) as Clients;

        return client;
    };
    const byId = (id: ClientId): Client => getClientById(id, connectedClients) as Client;
    const bySocket = (socket: any): Client => getClientBySocket(socket, connectedClients);
    const disconnect = function(socket: any): ClientHandler {

        const id: ClientId = socketIds.getId(socket);
        const client: Client = getClientById(id, connectedClients) as Client;
        const timeOfDisconnect: Date = new Date();

        client.disconnect();

        disconnectedClients = addClient({client, timeOfDisconnect}, id, disconnectedClients) as DisconnectedClients;

        connectedClients = removeClient(id, connectedClients) as Clients;

        return this;
    };

    const reconnect = (id: ClientId): Client => {

        const connection: DisconnectedClient = getClientById(id, disconnectedClients) as DisconnectedClient;
        let client ;

        if (connection) {

            client = connection.client;

            disconnectedClients = removeClient(id, disconnectedClients) as DisconnectedClients;

            connectedClients = addClient(client, id, connectedClients) as Clients;

            return client;
        }
    };

    const remove = (id: ClientId): Client => {

        const removedClient: Client = getClientById(id, connectedClients) as Client;

        connectedClients = removeClient(id, connectedClients) as Clients;

        return removedClient;
    };

    const removeTimedOutDisconnections = function(timeAllowedToReconnect: number): ClientHandler {

        const disconnectedClientIds = Object.keys(disconnectedClients);
        const now = new Date();

        disconnectedClients = disconnectedClientIds.reduce((clients: DisconnectedClients, id: ClientId) => {

            const connection: DisconnectedClient = getClientById(id, disconnectedClients) as DisconnectedClient;

            let clientsWithinTimeLimit = clients;

            if (Number(now) - Number(connection.timeOfDisconnect) < timeAllowedToReconnect) {

                clientsWithinTimeLimit = addClient(connection, id, clientsWithinTimeLimit) as DisconnectedClients;

            } else {

                socketIds.remove(connection.client.getSocket());
            }

            return clientsWithinTimeLimit;

        }, {});

        return this;
    };

    const updateUser = function(user: User, id: RoomId): Player {

        let client: Client = remove(id);
        const room: AnyRoom = client.getRoom();
        const player: Player = createPlayer(user);

        if (isRoom(room) && client) {

            room.replacePlayer(id, player);

            client = add(client.getSocket(), id);
            client.setPlayer(player);
            client.setRoom(room);

            return player;
        }
    };

    const wasDisconnected = (id: ClientId): boolean => disconnectedClients.hasOwnProperty(`${id}`);

    return {

        add,
        byId,
        bySocket,
        disconnect,
        reconnect,
        remove,
        removeTimedOutDisconnections,
        updateUser,
        wasDisconnected,
    };
}
