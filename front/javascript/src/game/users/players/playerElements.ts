// import {} from "../../../tools/pubSub";

  // TODO
  // ----------- decouple ------------ //
  // Teams.playerElement(playerNumber)
  //     .co()
  //     .changeCurrent(player.co);
  // });
  // if (indexOfRemovedPlayer < playerNumber) {
  //
  //     Teams.arrows.setPosition(Teams.playerElement(app.user.number()).co());
  // }
  // TODO decouple - changePropertyOnPlayer
  // const changeProperty = (property) => { // change this its weird
  //
  //     var player = players[indexOfPlayer(position.player)];
  //     var property = position.property;
  //     var value = position.valueOfCurrentElement;
  //     var element = Teams.playerElement(playerController.number(player));
  //
  //     if (element && element[property]) {
  //
  //         element[property]().changeCurrent(value);
  //     }
  //
  //     playerController.setProperty(player, property, value);
  // }
  // TODO - playerAdded
  // var element = Teams.playerElement(player.number);
  //
  // if (element) {
  //
  //     player.co = element.coName();
  // }

import {Player} from "./player";

let elements: Player[] = [];

export function setElements(newElements: Player[]): void {
  elements = newElements;
  return this;
}

export function  addElement(element: Player) {
  elements.push(element);
  return this;
}

export const getElement = (elementNumber: number) => elements[elementNumber - 1];
