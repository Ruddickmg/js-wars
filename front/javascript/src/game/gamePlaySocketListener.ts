import {ClientHandler} from "../server/clients/clients";
import {Listener} from "../server/connections/sockets/listener";
import {Unit} from "./map/elements/unit/unit";
import {Player} from "./users/players/player";

export default function(clients: ClientHandler): Listener {
  const getPlayer = (socket: any): Player => clients.bySocket(socket).getPlayer();
  const toRoom = (action: string, value: any, socket: any): any => clients.bySocket(socket).broadcast(action, value);
  const addUnit = (unit: Unit, socket: any): void => toRoom("addUnit", unit, socket);
  const moveUnit = (move: any, socket: any): void => toRoom("moveUnit", move, socket);
  const attack = (damage: any, socket: any): void => toRoom("attack", damage, socket);
  const join = (joinedUnits: any, socket: any): void => toRoom("joinUnits", joinedUnits, socket);
  const load = (loading: any, socket: any): void => toRoom("loadUnit", loading, socket);
  const unload = (transport: any, socket: any): void => toRoom("unload", transport, socket);
  const capture = (capturing: any, socket: any): void => toRoom("capture", capturing, socket);
  const endTurn = (end: any, socket: any): void => toRoom("endTurn", end, socket);
  const deleteUnit = (unit: any, socket: any): void => toRoom("delete", unit, socket);
  const defeat = (battle: any, socket: any): void => toRoom("defeat", battle, socket);
  const moveCursor = (moved: any, socket: any): void => toRoom("cursorMove", moved, socket);
  const save = (__: any, socket: any): void => toRoom("confirmSave", getPlayer(socket), socket);
  const confirm = (response: any, socket: any): void => {
    const player: Player = getPlayer(socket);
    toRoom("confirmationResponse", {
      answer: response.answer,
      sender: player,
    }, socket);
  };
  const ready = (isReady: boolean, socket: any): void => {
    const player: Player = getPlayer(socket);
    player.ready = isReady;
    toRoom("readyStateChange", player, socket);
  };
  return {
    addUnit,
    attack,
    capture,
    confirm,
    defeat,
    deleteUnit, // TODO secure deletion
    endTurn,
    join,
    load,
    moveCursor,
    moveUnit,
    ready,
    save,
    unload,
  };
}
