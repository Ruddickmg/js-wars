import {expect} from "chai";
import initConnections from "../../../javascript/server/connections/connections";

describe("connections", () => {

    const initial = {

        BACKEND_PORT_8000_TCP_ADDR: "127.0.0.1",
        IP: "125.34.56.12",
        PORT: "8080",
    };
    const connections = initConnections(initial);

    describe("frontend", () => {

        it("Returns a connection object with connection information on server to browser communication", () => {

            const frontEndConnectionInfo = connections.frontend();
            const port = initial.PORT;
            const ip = initial.IP;

            expect(frontEndConnectionInfo.port).to.equal(port);
            expect(frontEndConnectionInfo.ip).to.equal(ip);
            expect(frontEndConnectionInfo.url).to.equal(`http://${ip}:${port}`);
        });
    });

    describe("backend", () => {

        // TODO
        // make more generic?

        it("Returns a connection object with connection information on server to database communication", () => {

            const backendConnectionInfo = connections.backend();
            const ip = initial.BACKEND_PORT_8000_TCP_ADDR;
            const port = "8000";

            expect(backendConnectionInfo.port).to.equal(port);
            expect(backendConnectionInfo.ip).to.equal(ip);
            expect(backendConnectionInfo.url).to.equal(`http://${ip}:${port}`);
        });
    });
});
