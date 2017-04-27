"use strict";

const
    defaultPort = 8080,
    defaultIp = "127.0.0.1",
    defaultBackendPort = 8000;

function connections(environmentVariables) {

    const
        createUrl = (ip, port) => `http://${ip}:${port}`,
        createConnectionObject = (ip, port) => ({

            port: port,
            ip: ip,
            url: createUrl(ip, port)
        });

    const
        frontendAddress = createConnectionObject(
            environmentVariables.OPENSHIFT_NODEJS_IP || environmentVariables.IP || defaultIp,
            environmentVariables.OPENSHIFT_NODEJS_PORT || environmentVariables.PORT || defaultPort
        ),

        backendAddress = createConnectionObject(
            environmentVariables.BACKEND_PORT_8000_TCP_ADDR,
            defaultBackendPort
        );

    return {

        frontend: () => frontendAddress,
        backend: () => backendAddress,
    };
}

module.exports = connections;