import {publish} from "../../../tools/pubSub";
import single from "../../../tools/storage/singleton";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import getSocket from "./socket";

export type Receiver = (value: any) => Receivers;

export interface Receivers {
  add(...actions: string[]): Receivers;
  [action: string]: Receiver;
}

export default single<Receivers>(function(socket: any = getSocket()): Receivers {
  const {isString}: TypeChecker = typeChecker();
  const add = function(...additionalActions: string[]): Receivers {
    return additionalActions.reduce((receiving: Receivers, action: string): any => {
      const receiver: Receiver = function(value: any): Receivers {
        publish(action, value);
        return this;
      };
      if (isString(action)) {
        receiving[action] = receiver;
        socket.on(action, receiver);
      }
      return receiving;
    }, receivers);
  };
  const receivers: Receivers = {add};
  return receivers;
  // // all in game commands
  // socket.on('confirmSave', function(player) {
  //
  //   app.confirm.save(app.players.getPlayer(player));
  // });
  //
  // socket.on('confirmationResponse', function(response) {
  //
  //   app.confirm.player(response.answer, app.players.getPlayer(response.sender));
  // });
  //
  // socket.on('cursorMove', function(move) {
  //
  //   app.key.press(move);
  //
  //   app.cursor.move(true);
  // });
  //
  // socket.on('background', function(type) {
  //
  //   app.background.set(type);
  // });
  //
  // socket.on('endTurn', function(id) {
  //
  //   if (validate.turn(id)) {
  //
  //     app.options.end();
  //   }
  // });
  //
  // socket.on('addUnit', function(unit) {
  //
  //   var player = app.players.getPlayer(unitController.player(unit));
  //
  //   if (validate.build(unit)) {
  //
  //     if (playerController.canPurchase(player, unitController.cost(unit))) {
  //
  //       playerController.purchase(player, unit.cost());
  //
  //       app.map.addUnit(unit);
  //     }
  //   }
  // });
  //
  // socket.on('attack', function(action) {
  //
  //   if (validate.attack(action)) {
  //
  //     var attacker = app.map.getUnit(action.attacker);
  //     var attacked = app.map.getUnit(action.attacked);
  //
  //     unitController.attack(attacker, attacked, action.damage);
  //
  //     if (app.user.owns(attacked) && !unitController.attacked(attacked)) {
  //
  //       unitController.attack(attacked, attacker);
  //     }
  //   }
  // });
  //
  // socket.on('joinUnits', function(action) {
  //
  //   if (validate.combine(action)) {
  //
  //     var target = app.map.getUnit(action.unit);
  //     var selected = app.map.getUnit(action.selected);
  //
  //     unitController.join(target, selected);
  //   }
  // });
  //
  // socket.on('moveUnit', function(move) {
  //
  //   var unit = app.map.getUnit(move);
  //   var target = move.position;
  //
  //   if (validate.move(unit, target)) {
  //
  //     unitController.move(target, move.moved, unit);
  //
  //     app.animate("unit");
  //   }
  // });
  //
  // socket.on('loadUnit', function(load) {
  //
  //   var passanger = app.map.getUnit({id: load.passanger});
  //   var transport = app.map.getUnit({id: load.transport});
  //
  //   if (validate.load(transport, passanger)) {
  //
  //     unitController.load(passanger, transport);
  //   }
  // });
  //
  // socket.on('delete', function(unit) {
  //
  //   app.map.removeUnit(unit);
  // });
  //
  // socket.on('unload', function(transport) {
  //
  //   var unit = app.map.getUnit(transport);
  //
  //   unitController.drop(transport.index, transport, unit);
  // });
  //
  // socket.on('defeat', function(battle) {
  //
  //   var player = app.players.getPlayer(battle.conqueror);
  //   var defeated = app.players.getPlayer(battle.defeatedPlayers);
  //
  //   playerController.playerDefeated(player, defeated, battle.capturing);
  // });
  //
  // // all setup and menu commands
  // socket.on('setMap', function(map) {
  //
  //   app.game.setMap(map);
  // });
  //
  // socket.on('start', function(game) {
  //
  //   app.game.start();
  // });
  //
  // socket.on('userAdded', function(message) {
  //
  //   app.chat.post(message);
  // });
  //
  // socket.on('gameReadyMessage', function(message) {
  //
  //   app.chat.post(message);
  // });
  //
  // socket.on('propertyChange', function(properties) {
  //
  //   app.players.changeProperty(properties);
  // });
  //
  // socket.on('readyStateChange', function(player) {
  //
  //   var player = app.players.getPlayer(player);
  //
  //   playerController.isReady(player);
  //
  //   app.players.checkReady();
  // });
  //
  // socket.on('addPlayer', function(player) {
  //
  //   app.players.addPlayer(player);
  // });
  //
  // socket.on('addRoom', function(room) {
  //
  //   app.maps.addPlayer(room);
  // });
  //
  // socket.on('removeRoom', function(room) {
  //
  //   app.maps.removePlayer(room);
  // });
  //
  // socket.on('disc', function(user) {
  //
  //   app.chat.post({
  //     message: 'has been disconnected.',
  //     user: user.name.uc_first()
  //   });
  //
  //   app.players.removePlayer(user);
  // });
  //
  // socket.on("userLeftRoom", function(game) {
  //
  //   app.maps.removePlayer(game.getRoom, game.player);
  // });
  //
  // socket.on('userLeft', function(user) {
  //
  //   app.chat.post({
  //     message: 'has left the game.',
  //     user: user.name.uc_first()
  //   });
  //
  //   app.players.removePlayer(user);
  //   app.players.checkReady();
  // });
  //
  // socket.on('userRemoved', function(user) {
  //
  //   app.chat.post({
  //     message: 'has been removed from the game.',
  //     user: user.name.uc_first()
  //   });
  //
  //   app.players.removePlayer(user);
  // });
  //
  // socket.on('userJoined', function(user) {
  //
  //   app.players.addPlayer(user);
  //
  //   if (!playerController.isComputer(user)) {
  //
  //     app.chat.post({
  //       message: 'has joined the game.',
  //       user: user.name.uc_first(),
  //     });
  //   }
  // });
  //
  // socket.on('joinedGame', function(joined) {
  //
  //   app.game.load(joined);
  // });
  //
  // socket.on('back', function() {
  //
  //   Teams.boot();
  // });
  //
  // socket.on('getPlayerStates', function() {
  //
  //   socket.emit("ready", app.user.player());
  // });
  //
  // return socket;
});
