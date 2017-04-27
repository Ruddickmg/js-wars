"use strict";

const
    createClient = require("./client.js"),
    socketHandler = require("../connections/sockets/socketHandler.js");

function clientHandler() {

    let
        connectedClients = {},
        disconnectedClients = {};

    const
        socketIds = socketHandler(),
        getClientBySocket = (socket, listOfClients) => listOfClients[socketIds.getId(socket)],
        getClientById = (id, listOfClients) => listOfClients[id],
        addClient = (client, id, listOfClients) => {

            const modifiedClientList = Object.assign({}, listOfClients);

            modifiedClientList[id] = client;

            return modifiedClientList;
        },
        removeClient = (id, listOfClients) => {

            const modifiedClientList = Object.assign({}, listOfClients);

            delete modifiedClientList[id];

            return modifiedClientList;
        };

    return {

        bySocket: (socket) => getClientBySocket(socket, connectedClients),
        byId: (id) => getClientById(id, connectedClients),
        remove: (id) => removeClient(id, connectedClients),
        wasDisconnected: (id) => disconnectedClients.hasOwnProperty(id),
        add(socket, id) {

            const client = createClient(socket);

            socketIds.setId(socket, id);

            connectedClients = addClient(client, id, connectedClients);

            return client;
        },
        disconnect(socket) {

            const
                id = socketIds.getId(socket),
                client = getClientById(id, connectedClients),
                timeOfDisconnect = new Date();

            client.disconnect();

            disconnectedClients = addClient({client, timeOfDisconnect}, id, disconnectedClients);

            connectedClients = removeClient(id, connectedClients);

            return this;
        },
        reconnect(id) {

            const
                connection = getClientById(id, disconnectedClients),
                client = connection.client;

            disconnectedClients = removeClient(id, disconnectedClients);

            connectedClients = addClient(client, id, connectedClients);

            return client;
        },
        removeTimedOutDisconnections(timeAllowedToReconnect) {

            const
                disconnectedClientIds = Object.keys(disconnectedClients),
                now = new Date();

            disconnectedClients = disconnectedClientIds.reduce((clients, id) => {

                const client = getClientById(id, disconnectedClients);

                let clientsWithinTimeLimit = clients;

                if (now - client.timeOfDisconnect < timeAllowedToReconnect) {

                    clientsWithinTimeLimit = addClient(client, id, clientsWithinTimeLimit);

                } else {

                    socketIds.remove(client.socket());
                }

                return clientsWithinTimeLimit;

            }, {});

            return this;
        }
    };
}

module.exports = clientHandler;