import createPosition, {Position} from "../../coordinates/position";
import {MapElement} from "../../game/map/elements/defaults";
import notifications, {PubSub} from "../../tools/pubSub";
import single from "../../tools/storage/singleton";
import keyBoardInput, {KeyBoard} from "../input/keyboard";

export interface TargetHandler {

  attack(): TargetHandler;

  cursor(): string;

  drop(): TargetHandler;

  position(): Position;

  set(element: MapElement): TargetHandler;
}

export default single<TargetHandler>(function(): TargetHandler {

  let index: number = 0;
  let unit: MapElement;
  let currentPosition: Position;
  let action: string = "attack";

  const actions: any = {attack: "target", drop: "pointer"};
  const keys: any = {left: -1, down: -1, up: 1, right: 1};
  const keyboard: KeyBoard = keyBoardInput();
  const {publish, subscribe}: PubSub = notifications();
  const wrapIndex = (target: number, length: number): number => {

    const lowestIndex = 0;
    const highestIndex = length - 1;
    const remainder = target % length;

    if (target < lowestIndex) {

      return highestIndex - remainder;
    }

    return target < length ? target : remainder;
  };
  const setAction = (actionType: string) => {

    if (actions[actionType]) {

      action = actionType;

    } else {

      throw Error(`Invalid action: ${actionType}, passed to target.`);
    }
  };
  const attack = function(): TargetHandler {

    setAction("attack");

    return this;
  };
  const cursor = (): string => actions[action];
  const drop = function(): TargetHandler {

    setAction("drop");

    return this;
  };
  const position = (): Position => createPosition(currentPosition.x, currentPosition.y);
  const set = function(element: MapElement): TargetHandler {

    unit = element;

    return this;
  };
  const changeTarget = (target: MapElement): void => {

    currentPosition = target.position;

    publish("target", target);
  };
  const cancelTargetSelection = (): void => {

    // app.hud.hide();
    // actions.type(unit).displayActions();

    publish("cancelTargetSelection", unit);
  };
  const performActionOnTarget = (target: MapElement): void => publish(action, {unit, target});
  const getTargets = (currentElement: MapElement): MapElement[] => {

    return [currentElement]; // TODO impliment get targets
  };

  subscribe("action", setAction);
  subscribe("keyPressed", (pressed: number) => {

    const targets = getTargets(unit); // TODO impliment target retreival
    const key: string = keyboard.getAssignment(pressed);
    const movement: number = keys[key] || 0;
    const newIndex: number = wrapIndex(index + movement, targets.length);
    const {esc, enter}: KeyBoard = keyboard;
    const target: MapElement = targets[newIndex];

    if (index !== newIndex) {

      index = newIndex;

      changeTarget(target);

    } else if (keyboard.pressed(esc(), enter())) {

      if (keyboard.pressedEsc()) {

        cancelTargetSelection();

      } else {

        performActionOnTarget(target);
      }

      keyboard.undo(pressed);
    }
  });

  return {

    attack,
    cursor,
    drop,
    position,
    set,
  };
});

// function damageDisplay(target: MapElement) {
//
//     if (action === "attack") {
//
//         damage = calculateDamage(element, target);
//         damageDisplay = createDamageDisplay(Math.round(damage));
//     }
// }
