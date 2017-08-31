import {Map} from "../../game/map/map";
import settings from "../../settings/settings";
import notifier, {PubSub} from "../../tools/pubSub";
import randomNumber from "../../tools/random";
import single from "../../tools/singleton";
import requestHandler, {RequestHandler} from "../communication/requests/requestHandler";

export interface MapsHandler {

    current(): Map;
    empty(): boolean;
    first(): Map;
    getById(id: any): Map;
    getCategory(category: string): Promise<Map[]>;
    getRandomCategory(): Promise<Map[]>;
    getRandomMap(): Promise<Map>;
    last(): Map;
    next(): Map;
    previous(): Map;
}

export default single<MapsHandler>(() => {

    const notifications: PubSub = notifier();
    const routeName = "maps";
    const routes = ["type"];
    const categories = settings().get("categories").toObject(); // TODO assure these are working
    const defaultCategory = categories[0];
    const {type: getMapsByCategory}: RequestHandler = requestHandler(routeName, routes);

    const getIndexById = (array: any[], id: any) => {

        return array.findIndex((element: any) => element.id === id);
    };

    const getMapById = function(array: any[], id: string | number) {

        return array[getIndexById(array, id)];
    };

    return function(): MapsHandler {

        let elements: any[] = [];
        let index: number = 0;

        const current = (): Map => elements[index];
        const empty = (): boolean => !elements.length;
        const first = (): Map => elements[0];
        const getById = (id: any): Map => getMapById(elements, id);
        const last = (): Map => elements[elements.length - 1];
        const next = (): Map => {

            index = index + 1 < elements.length ? index + 1 : 0;

            return current();
        };
        const previous = (): Map => {

            index = index - 1 > -1 ? index - 1 : elements.length - 1;

            return current();
        };
        const getCategory = (category: string = defaultCategory): Promise<Map[]> => {

            return getMapsByCategory(category).then((receivedMaps: Map[]) => {

                notifications.publish("mapsUpdated", receivedMaps);

                return Promise.resolve(receivedMaps);
            });
        };
        const randomCategory = (): string => categories[randomNumber.index(categories)];
        const getRandomCategory = (): Promise<Map[]> => {

            return getCategory(randomCategory()).then((receivedMaps: Map[]) => {

                return Promise.resolve(receivedMaps);
            });
        };
        const getRandomMap = (): Promise<Map> => {

            return elements[randomNumber.index(elements)];
        };
        const updateElements = (updates: any[]): void => {

            const indexOfLastElement = updates.length - 1;

            if (index > indexOfLastElement) {

                index = indexOfLastElement;
            }

            elements = updates;
        };

        notifications.subscribe("mapsUpdated", updateElements);

        return {

            current,
            empty,
            first,
            getCategory,
            getById,
            getRandomCategory,
            getRandomMap,
            last,
            next,
            previous,
        };
    };
});

// screen: function() {
//
//     return types[type].elements;
// },

// save: (map: Map, name: string, user: User) => { // TODO move to editor
//
//     map.creator = user.email;
//     map.name = name;
//
//     request.post(map, "maps/save").then((response: any) => {
//
//         notifications.publish("mapSaved", {map, response});
//     });
// },
// const elementExists = function(id, element, parent) {
//
//     const exists = document.getElementById(id);
//
//     exists ? parent.replaceChild(element, exists) : parent.appendChild(element);
// };
//
// const buildingElements = {
//
//     section: "buildingsDisplay",
//     div: "numberOfBuildings",
// };

// allSettings.add("maps", "server", {
//
//     map: {
//         url: "maps/type",
//         items: [],
//         elements: {
//             section: "mapSelectScreen",
//             div: "selectMapScreen",
//             li: "mapSelectionIndex",
//             type: "map",
//         },
//     },
//
//     game: {
//         url: "games/open",
//         items: [],
//         elements: {
//             section: "gameSelectScreen",
//             div: "selectGameScreen",
//             li: "mapSelectionIndex",
//             type: "game",
//             index: "Index",
//             attribute: "class",
//             url: "games/open",
//             properties: app.settings.categories,
//         },
//     },
// });
