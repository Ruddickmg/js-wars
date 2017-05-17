export interface Listener {

    [index: string]: (error: Error, data: any, socket: any) => void
}

export interface SocketListeners {

    addListener(listeners: Listener)
    addListeners(...listeners: Listener[])
    listenForSocketCommunication(socket:any): void
}

export default function(): SocketListeners {

    let allListeners: Listener[] = [];

    const addListener = (listener: Listener, listeners: Listener[]): Listener[] => {

        const modifiedListeners: Listener[] = listeners.slice();

        modifiedListeners.push(listener);

        return modifiedListeners;
    };

    return {

        addListener(listener: Listener) {

            allListeners = addListener(listener, allListeners);
        },
        addListeners(...listeners: Listener[]) {

            allListeners = listeners.reduce((listeners, listener) => {

                return addListener(listener, listeners);

            }, allListeners)
        },
        listenForSocketCommunication(socket: any){

            allListeners.forEach((listener: Listener) => {

                const listenerDirectives: string[] = Object.keys(listener);

                listenerDirectives.forEach((directive: string) => {

                    socket.on(directive, (message: any): void => {

                        const
                            errorReported: string = message.error,
                            error = errorReported ? new Error(errorReported) : undefined;

                        listener[directive](error, message, socket);
                    });
                });
            })
        }
    }
};
