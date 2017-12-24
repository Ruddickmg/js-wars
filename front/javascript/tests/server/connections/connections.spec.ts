import {expect} from "chai";
import initConnections from "../../../src/server/connections/connections";
import settings from "../../../src/settings/settings";

describe("connections", () => {
  const initial = {
    IP: "125.34.56.12",
    PORT: "8080",
  };
  const connection = settings().toObject("connection");
  const connections = initConnections(initial);
  it("Returns a connection object with connection information on server to browser communication", () => {
    const frontEndConnectionInfo = connections.frontend();
    const port = initial.PORT;
    const ip = initial.IP;
    expect(frontEndConnectionInfo.port).to.equal(port);
    expect(frontEndConnectionInfo.ip).to.equal(ip);
    expect(frontEndConnectionInfo.url).to.equal(`http://${ip}:${port}`);
  });
  it("Returns a connection object with connection information on server to database communication", () => {
    const backendConnectionInfo = connections.backend();
    const ip = connection.backendIp;
    const port = connection.backendPort;
    expect(backendConnectionInfo.port).to.equal(port);
    expect(backendConnectionInfo.ip).to.equal(ip);
    expect(backendConnectionInfo.url).to.equal(`http://${ip}:${port}`);
  });
});
