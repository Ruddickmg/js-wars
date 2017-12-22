import {subscribe} from "../../../tools/pubSub";
import single from "../../../tools/storage/singleton";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import getSocket from "./socket";

export type Transmitter = (value: any) => Transmitters;

export interface Transmitters {
  add(...additionalActions: string[]): Transmitters;
 [action: string]: Transmitter;
}

export default single<Transmitters>(function(socket: any = getSocket()): Transmitters {
  const {isString}: TypeChecker = typeChecker();
  const add = function(...additionalActions: string[]): Transmitters {
    return additionalActions.reduce((transmitting: Transmitters, action: string): any => {
      const transmitter: Transmitter = function(value: any): Transmitters {
        socket.emit(action, value);
        return this;
      };
      if (isString(action)) {
        transmitting[action] = transmitter;
        subscribe(action, transmitter);
      }
      return transmitting;
    }, transmitters);
  };
  const transmitters: Transmitters = {add};
  return transmitters;

  // captured(unit, building) {
  //
  //     if (app.user.turn()) {
  //
  //     	app.socket.emit("captured", {unit:unit, building:building});
  //     }
  // },
  //
  // attack: function (attacker, attacked, damage) {
  //
  // 	app.socket.emit("attack", { attacker:attacker, attacked:attacked, damage:damage });
  // },
  //
  // move: function (id, target, distance) {
  //
  //     if(app.user.turn()) {
  //
  //     	app.socket.emit("moveUnit", {id: id, position: target, moved: distance});
  //     }
  // },
  //
  // join: function (unit1, unit2) {
  //
  //     if (app.user.turn()) {
  //
  //     	app.socket.emit("joinUnits", { unit: unit2, selected: unit1 });
  //     }
  // },
  //
  // load: function (id1, id2) {
  //
  //     app.socket.emit("loadUnit", { transport: id2, passanger: id1 });
  // },
  //
  // unload: function (id, position, index) {
  //
  //     app.socket.emit("unload", { id: id, pos: position, index: index });
  // },
  //
  //
  // delete: function (unit) {
  //
  // 	app.socket.emit("delete", unit);
  // },
  //
  // createRoom: function (room) {
  //
  // 	app.socket.emit("newRoom", room);
  // },
  //
  // removeRoom: function (room) {
  //
  //     app.socket.emit("removeRoom", room);
  // },
  //
  // setUserProperty: function (player, property, value) {
  //
  // 	app.socket.emit("setUserProperties", {property: property, value: value, player: player});
  // },
  //
  // aiTurn: function (player) {
  //
  // 	app.socket.emit("aiTurn", {map:app.map.getPlayer(), player:player});
  // },
  //
  // endTurn: function (player) {
  //
  //     app.socket.emit("endTurn", playerController.id(player));
  // },
  //
  // defeat: function (conqueror, player, capturing) {
  //
  // 	app.socket.emit("defeat", {defeated: player, conqueror: conqueror, capturing: capturing});
  // },
  //
  // removeAi: function (player) {
  //
  // 	app.socket.emit("removeAiPlayer", player);
  // },
  //
  // join: function (game) {
  //
  //     app.socket.emit("join", game);
  // },
  //
  // ready: function (player) {
  //
  //     app.socket.emit("ready", player);
  // },
  //
  // exit: function (player) {
  //
  //     app.socket.emit("exit", player);
  // },
  //
  // boot: function (player) {
  //
  //     app.socket.emit("boot", player);
  // },
  //
  // getPlayerStates: function (category, name, id) {
  //
  //     app.socket.emit("getPlayerStates", {
  //
  //         category: category,
  //         name: name,
  //         id: id
  //     });
  // },
  //
  // addAi: function (player) {
  //
  //     app.socket.emit("addAiPlayer", player);
  // },
  //
  // message: function (message) {
  //
  //     app.socket.emit("gameReadyChat", message);
  // },
  //
  // confirmationResponse: function (response, sender) {
  //
  //     app.socket.emit("confirmationResponse", {
  //
  //         answer: response,
  //         to: playerController.id(sender)
  //     });
  // },
  //
  // confirmSave: function (player) {
  //
  //     app.socket.emit('confirmSave', player);
  // },
  //
  // cancelSave: function (player) {
  //
  //     app.socket.emit('saveCancelled', player);
  // },
  //
  // background: function (background) {
  //
  //     app.socket.emit('background', background);
  // },
  //
  // start: function (game) {
  //
  //     app.socket.emit("start", game);
  // },
  //
  // addUnit: function (unit) {
  //
  //     app.socket.emit("addUnit", unit);
  // }
});
