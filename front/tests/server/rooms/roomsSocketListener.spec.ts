import {expect} from "chai";
import pubSub, {PubSub} from "../../../javascript/tools/pubSub"; // use to mock socket.io

describe("roomsSocketListener", () => {

    const mockSocketIo: PubSub = pubSub();

    describe("addUser", () => {

        it("Handles new connections, creating/adding a user object for incoming users", () => {

            // TODO
        });
    });

    describe("join", () => {

        it("Coordinates users joining games/rooms via socket communication.", () => {

            // TODO
        });
    });

    describe("newRoom", () => {

        it("Coordinates the creation of new game rooms via socket communication", () => {

            // TODO
        });
    });

    describe("disconnect", () => {

        it("Handles disconnected sockets and the cleanup of their respective user information", () => {

            // TODO
        });
    });
});
