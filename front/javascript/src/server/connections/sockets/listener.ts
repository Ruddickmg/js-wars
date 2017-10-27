export interface Listener {

  [index: string]: (error: Error, data: any, socket: any) => void;
}

export interface SocketListeners {

  addListener(listeners: Listener): void;

  addListeners(...listeners: Listener[]): void;

  listenForSocketCommunication(socket: any): void;
}

export default function(): SocketListeners {

  let allListeners: Listener[] = [];

  const addListener = (listener: Listener, listeners: Listener[]): Listener[] => {

    const modifiedListeners: Listener[] = listeners.slice();

    modifiedListeners.push(listener);

    return modifiedListeners;
  };

  return {

    addListener(listener: Listener): void {

      allListeners = addListener(listener, allListeners);
    },
    addListeners(...listeners: Listener[]): void {

      allListeners = listeners.reduce((addedListeners: Listener[], listener: Listener): Listener[] => {

        return addListener(listener, addedListeners);

      }, allListeners);
    },
    listenForSocketCommunication(socket: any): void {

      allListeners.forEach((listener: Listener) => {

        const listenerDirectives: string[] = Object.keys(listener);

        listenerDirectives.forEach((directive: string) => {

          socket.on(directive, (message: any): void => {

            const errorReported: string = message.error;
            const error = errorReported ? Error(errorReported) : undefined;

            listener[directive](error, message, socket);
          });
        });
      });
    },
  };
}

