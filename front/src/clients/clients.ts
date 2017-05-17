import {default as createClient, Client} from "./client.js";
import {default as socketHandler, SocketHandler} from "../connections/sockets/socketHandler.js";
import {default as createPlayer, Player} from "../users/players/player";
import {User, RoomId} from "../users/user";
import {AnyRoom, isRoom} from "../rooms/rooms";

export type ClientId = string | number;

export interface ClientHandler {

    bySocket(socket: any): Client,
    byId(id: ClientId): Client,
    remove(id: ClientId): Client,
    wasDisconnected(id: ClientId): boolean,
    add(socket: any, id: ClientId): Client,
    disconnect(socket: any): ClientHandler,
    reconnect(id: ClientId): Client,
    removeTimedOutDisconnections(timeAllowedToReconnect: number): ClientHandler,
    updateUser(user: any, id: RoomId): Clients,
}

interface DisconnectedClient {

    client: Client,
    timeOfDisconnect: Date
}

interface Clients {

    [index: string]: Client
}

interface DisconnectedClients {

    [index: string]: DisconnectedClient
}

type AllClients = Clients | DisconnectedClients;
type AnyClient = Client | DisconnectedClient;

export default function(): ClientHandler {

    let
        connectedClients: Clients = {},
        disconnectedClients: DisconnectedClients = {};

    const
        socketIds: SocketHandler = socketHandler(),
        getClientBySocket = (socket: any, listOfClients: Clients): Client => listOfClients[socketIds.getId(socket)],
        getClientById = (id: ClientId, listOfClients: AllClients): AnyClient => listOfClients[id],
        addClient = (client: AnyClient , id: ClientId, listOfClients: AllClients): AllClients => {

            const modifiedClientList: AllClients = Object.assign({}, listOfClients);

            modifiedClientList[id] = client;

            return modifiedClientList;
        },
        removeClient = (id: ClientId, listOfClients: AllClients): AllClients => {

            const modifiedClientList: AllClients = Object.assign({}, listOfClients);

            delete modifiedClientList[id];

            return modifiedClientList;
        };

    return {

        bySocket: (socket: any): Client => getClientBySocket(socket, connectedClients),
        byId: (id: ClientId): Client => <Client>getClientById(id, connectedClients),
        remove: (id: ClientId): Client => {

            const removedClient: Client = <Client>getClientById(id, connectedClients);

            connectedClients = <Clients>removeClient(id, connectedClients);

            return removedClient;
        },
        wasDisconnected: (id: ClientId): boolean => disconnectedClients.hasOwnProperty(`${id}`),
        add(socket: any, id: ClientId): Client {

            const client: Client = createClient(socket);

            socketIds.setId(socket, id);

            connectedClients = <Clients>addClient(client, id, connectedClients);

            return client;
        },
        disconnect(socket: any): ClientHandler {

            const
                id: ClientId = socketIds.getId(socket),
                client: Client = <Client>getClientById(id, connectedClients),
                timeOfDisconnect = new Date();

            client.disconnect();

            disconnectedClients = <DisconnectedClients>addClient({client, timeOfDisconnect}, id, disconnectedClients);

            connectedClients = <Clients>removeClient(id, connectedClients);

            return this;
        },
        reconnect(id: ClientId): Client {

            const
                connection: DisconnectedClient = <DisconnectedClient>getClientById(id, disconnectedClients),
                client = connection.client;

            disconnectedClients = <DisconnectedClients>removeClient(id, disconnectedClients);

            connectedClients = <Clients>addClient(client, id, connectedClients);

            return client;
        },
        removeTimedOutDisconnections(timeAllowedToReconnect: number): ClientHandler {

            const
                disconnectedClientIds = Object.keys(disconnectedClients),
                now = new Date();

            disconnectedClients = disconnectedClientIds.reduce((clients: DisconnectedClients, id: ClientId) => {

                const connection: DisconnectedClient = <DisconnectedClient>getClientById(id, disconnectedClients);

                let clientsWithinTimeLimit = clients;

                if (Number(now) - Number(connection.timeOfDisconnect) < timeAllowedToReconnect) {

                    clientsWithinTimeLimit = <DisconnectedClients>addClient(connection, id, clientsWithinTimeLimit);

                } else {

                    socketIds.remove(connection.client.socket());
                }

                return clientsWithinTimeLimit;

            }, {});

            return this;
        },
        updateUser(user: User, id: RoomId): Clients {

            const
                client: Client = this.remove(id),
                room: AnyRoom = client.room(),
                player: Player = createPlayer(user);

            if (isRoom(room) && client) {

                room.replacePlayer(id, player);
                this.addElement(client.socket(), id);
            }

            return this;
        }
    };
}