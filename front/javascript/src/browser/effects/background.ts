import createPosition, {Position} from "../../game/map/coordinates/position";
import createTerrain, {Terrain} from "../../game/map/elements/terrain/terrain";
import getRandom from "../../tools/calculations/random";
import {publish} from "../../tools/pubSub";
import {isString} from "../../tools/validation/typeChecker";
import getTransmitters, {Transmitters} from "../communication/sockets/transmitter";

export interface Background {
  isRandom(): boolean;
  category(): string;
  change(): string;
  type(): string;
  name(): string;
  drawing(): string;
}

const transmitters: Transmitters = getTransmitters();
const position: Position = createPosition(0, 0);
const changeEvent: string = "changeBackground";
const snowType: string = "snow";
const plainType: string = "plain";
const randomType: string = "random";
const rainType: string = "rain";
const types: string[] = [snowType, plainType, rainType];
const weightedRandomCategory = (): string => {
  const indexOfRandomType: number = getRandom.index(types);
  return plainType || types[indexOfRandomType];
};
const alias = (elementType: string): string => elementType === snowType ? snowType : plainType;
const createBackground = (backgroundType: string): Terrain => {
  return createTerrain(isRain(backgroundType) ? plainType : alias(backgroundType), position);
};
const isRain = (theType: string): boolean => theType === rainType;

let background: Terrain = createTerrain(plainType, position);
let currentCategory: string = randomType;

export const isRandom = (): boolean => currentCategory === randomType;
export const category = (): string => currentCategory;
export const type = (): string => background.type;
export const name = (): string => background.name;
export const drawing = (): string => background.drawing;
export const change = (backgroundType?: string): string => {
  let backgroundCategory: string = backgroundType;
  currentCategory = backgroundType;
  if (!isString(backgroundCategory) || isRandom()) {
    backgroundCategory = weightedRandomCategory();
  }
  background = createBackground(backgroundCategory);
  publish(changeEvent, background);
  return backgroundCategory;
};
export default {
  category,
  change,
  drawing,
  isRandom,
  name,
  type,
};

transmitters.add(changeEvent);
