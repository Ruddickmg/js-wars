export type SocketId = string | number;

export interface SocketHandler {
  getId(socket: any): SocketId;
  setId(socket: any, id: SocketId): SocketHandler;
  remove(socket: any): SocketId;
}

interface SocketIds {
  [index: string]: SocketId;
}

export default function() {
  const sockets: SocketIds = {};
  return {
    getId: (socket: any): SocketId => sockets[socket],
    setId(socket: any, id: SocketId): SocketHandler {
      sockets[socket] = id;
      return this;
    },
    remove(socket: any): SocketId {
      const id = sockets[socket];
      delete sockets[socket];
      return id;
    },
  };
}
