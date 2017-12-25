import {publish} from "../../../tools/pubSub";
import {isDefined, isObject, isString} from "../../../tools/validation/typeChecker";

export interface Listener {
  [index: string]: (data: any, socket: any) => void;
}

export interface SocketListeners {
  addListeners(...listeners: Listener[]): SocketListeners;
  listenForSocketCommunication(socket: any): SocketListeners;
}

export default function(): SocketListeners {
  const allListeners: Listener[] = [];
  const errorEventId: string = "error";
  return {
    addListeners(...listeners: Listener[]): SocketListeners {
      listeners.forEach((listener: Listener): any => {
        if (isObject(listener)) {
          allListeners.push(listener);
        }
      });
      return this;
    },
    listenForSocketCommunication(socket: any): SocketListeners {
      allListeners.forEach((listener: Listener) => {
        const listenerDirectives: string[] = Object.keys(listener);
        listenerDirectives.forEach((directive: string) => {
          socket.on(directive, (message: any): void => {
            if (isDefined(message) && isString(message.error)) {
              return publish(errorEventId, message.error);
            }
            listener[directive](message, socket);
          });
        });
      });
      return this;
    },
  };
}
