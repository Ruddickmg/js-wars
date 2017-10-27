export interface Connections {

  frontend(): Connection;

  backend(): Connection;
}

export interface Connection {

  port: string;
  ip: string;
  url: string;
}

export default function connections(environmentVariables: any): Connections {

  const defaultPort: string = "8080";
  const defaultIp: string = "127.0.0.1";
  const defaultBackendPort: string = "8000";
  const ipAddress = environmentVariables.OPENSHIFT_NODEJS_IP || environmentVariables.IP || defaultIp;
  const portAddress = environmentVariables.OPENSHIFT_NODEJS_PORT || environmentVariables.PORT || defaultPort;
  const createUrl = (ip: string, port: string): string => `http://${ip}:${port}`;
  const createConnectionObject = (ip: string, port: string): Connection => {

    const url = createUrl(ip, port);

    return {port, ip, url};
  };
  const frontendAddress = createConnectionObject(ipAddress, portAddress);
  const backendAddress = createConnectionObject(
    environmentVariables.BACKEND_PORT_8000_TCP_ADDR,
    defaultBackendPort,
  );

  return {

    backend: () => backendAddress,
    frontend: () => frontendAddress,
  };
}
