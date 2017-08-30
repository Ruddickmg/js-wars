import createPosition, {Position} from "../../game/coordinates/position";
import createTerrain, {Terrain} from "../../game/map/elements/terrain/terrain";
import notifications, {PubSub} from "../../tools/pubSub";
import getRandom from "../../tools/random";
import getSocket from "../communication/sockets/socket";

export interface Background {

    random(): boolean;
    category(): string;
    change(): void;
    set(type: string): void;
    type(): string;
    defense(): number;
    name(): string;
    drawing(): string;
}

export default function() {

    const socket = getSocket();
    const {publish}: PubSub = notifications();
    const position: Position = createPosition(0, 0);
    const changeEvent: string = "backgroundChange";
    const snowType: string = "snow";
    const plainType: string = "plain";
    const randomType: string = "random";
    const rainType: string = "rain";
    const types: string[] = [snowType, plainType, rainType];

    let background: Terrain = createTerrain(plainType, position);
    let currentCategory: string = randomType;

    const beginningNewRound = (): boolean => true; // TODO write this boolean test
    const getAmountOfDefense = (_: Terrain): number => 5; // TODO write this boolean test
    const random = (): boolean => currentCategory === randomType;
    const isRain = (theType: string): boolean => theType === rainType;
    const category = (): string => currentCategory;
    const type = (): string => background.type;
    const defense = (): number => getAmountOfDefense(background);
    const name = (): string => background.name;
    const drawing = (): string => background.draw;
    const alias = (elementType: string): string => elementType === snowType ? snowType : plainType;
    const createBackground = (backgroundType: string): Terrain => {

        return createTerrain(isRain(backgroundType) ? plainType : alias(backgroundType), position);
    };
    const weighted = (): string => {

        const indexOfRandomType: number = getRandom.index(types);

        // TODO make better after wheather effects are all worked out
        // if(calculated < 4)
        //     return 'snow';
        // else if(calculated < 6)
        //     return 'rain';

        return plainType || types[indexOfRandomType];
    };
    const change = (): void => {

        const backgroundType: string = weighted();

        if (beginningNewRound()) {

            socket.emit(changeEvent, backgroundType);
            publish(changeEvent, backgroundType);

            background = createBackground(backgroundType);
        }
    };
    const set = (backgroundType: string): void => {

         if (random()) {

             change();

         } else {

             currentCategory = backgroundType;

             background = createBackground(backgroundType);

             publish(changeEvent, {background, type});
         }
    };

    return {

        random,
        category,
        change,
        set,
        type,
        defense,
        name,
        drawing,
    };
}
