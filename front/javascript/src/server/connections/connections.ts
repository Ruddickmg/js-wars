import settings from "../../settings/settings";

export interface Connections {
  frontend(): Connection;
  backend(): Connection;
}

export interface Connection {
  port: string;
  ip: string;
  url: string;
}

export default function(environmentVariables: any = {}): Connections {

  const connectionSettings: any = settings().toObject("connection");
  const defaultPort: string = connectionSettings.port;
  const defaultIp: string = connectionSettings.ip;
  const defaultBackendPort: string = connectionSettings.backendPort;
  const defaultBackendIp: string = connectionSettings.backendIp;
  const ipAddress = environmentVariables.OPENSHIFT_NODEJS_IP || environmentVariables.IP || defaultIp;
  const portAddress = environmentVariables.OPENSHIFT_NODEJS_PORT || environmentVariables.PORT || defaultPort;

  const backendIp = environmentVariables.BACKEND_PORT_8000_TCP_ADDR
    || environmentVariables.BACKEND_IP
    || defaultBackendIp;

  const backendPort = environmentVariables.BACKEND_PORT_8000_TCP_PORT
    || environmentVariables.BACKEND_PORT
    || defaultBackendPort;

  const createUrl = (ip: string, port: string): string => `http://${ip}:${port}`;

  const createConnectionObject = (ip: string, port: string): Connection => {
    const url = createUrl(ip, port);
    return {port, ip, url};
  };

  const frontendAddress = createConnectionObject(ipAddress, portAddress);
  const backendAddress = createConnectionObject(backendIp, backendPort);

  return {
    backend: () => backendAddress,
    frontend: () => frontendAddress,
  };
}
