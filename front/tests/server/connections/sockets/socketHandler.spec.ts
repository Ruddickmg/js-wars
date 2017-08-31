import {expect} from "chai";
import socketHandler, {SocketHandler} from "../../../../javascript/server/connections/sockets/socketHandler";

describe("socketHandler", () => {

    const sockets: SocketHandler = socketHandler();
    const firstSocket: any = {id: 1};
    const secondSocket: any = {id: 2};

    describe("getId && setId", () => {

        it("Gets the Id assigned to a socket.", () => {

            sockets.setId(firstSocket, firstSocket.id);

            expect(sockets.getId(firstSocket)).to.equal(firstSocket.id);
        });
    });

    describe("setId", () => {

        it("Removes an assigned socket id", () => {

            sockets.setId(secondSocket, secondSocket.id);

            sockets.remove(secondSocket);

            expect(sockets.getId(secondSocket)).to.equal(undefined);
        });
    });
});
