import createPosition, {Position} from "../../game/map/coordinates/position";
import createTerrain, {Terrain} from "../../game/map/elements/terrain/terrain";
import getRandom from "../../tools/calculations/random";
import notifications, {PubSub} from "../../tools/pubSub";
import getSocket from "../communication/sockets/socket";

export interface Background {
  isRandom(): boolean;
  category(): string;
  change(): Background;
  set(type: string): Background;
  type(): string;
  defense(): number;
  name(): string;
  drawing(): string;
}

export default function() {
  const {publish}: PubSub = notifications();
  const position: Position = createPosition(0, 0);
  const changeEvent: string = "changeBackground";
  const snowType: string = "snow";
  const plainType: string = "plain";
  const randomType: string = "random";
  const rainType: string = "rain";
  const types: string[] = [snowType, plainType, rainType];
  let background: Terrain = createTerrain(plainType, position);
  let currentCategory: string = randomType;
  const getAmountOfDefense = (_: Terrain): number => 5; // TODO write this boolean test
  const isRandom = (): boolean => currentCategory === randomType;
  const isRain = (theType: string): boolean => theType === rainType;
  const category = (): string => currentCategory;
  const type = (): string => background.type;
  const defense = (): number => getAmountOfDefense(background);
  const name = (): string => background.name;
  const drawing = (): string => background.drawing;
  const alias = (elementType: string): string => elementType === snowType ? snowType : plainType;
  const createBackground = (backgroundType: string): Terrain => {
    return createTerrain(isRain(backgroundType) ? plainType : alias(backgroundType), position);
  };
  const weighted = (): string => {

    const indexOfRandomType: number = getRandom.index(types);

    // TODO fix after wheather effects are all worked out
    // if(calculated < 4)
    //     return 'snow';
    // else if(calculated < 6)
    //     return 'rain';

    return plainType || types[indexOfRandomType];
  };
  const change = function(): Background {
    const backgroundType: string = weighted();
    publish(changeEvent, backgroundType);
    background = createBackground(backgroundType);
    return this;
  };
  const set = function(backgroundType: string): Background {
    if (isRandom()) {
      change();
    } else {
      currentCategory = backgroundType;
      background = createBackground(backgroundType);
      publish(changeEvent, {background, type});
    }
    return this;
  };

  return {
    isRandom,
    category,
    change,
    set,
    type,
    defense,
    name,
    drawing,
  };
}
