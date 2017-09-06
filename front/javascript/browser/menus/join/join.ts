import {Game} from "../../../game/game";
import {Building} from "../../../game/map/elements/building/building";
import {isMap, Map} from "../../../game/map/map";
import settings from "../../../settings/settings";
import capitalizeFirstLetter from "../../../tools/capitalizeFirstLetter";
import countBuildings from "../../../tools/counter";
import notifications, {PubSub} from "../../../tools/pubSub";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import zipWith from "../../../tools/zipWith";
import gameElementHandler, {GameElementHandler} from "../../controller/gameElementHandler";
import {Element} from "../../dom/element";
import createList, {List} from "../../dom/list";
import highlighter, {Highlighter} from "../../effects/highlighter";
import createScroller, {Scroller, ScrollHandler} from "../../effects/scrolling";
import keyboardInput, {KeyBoard} from "../../input/keyboard";
import selectionHandler, {SelectionHandler} from "../../tools/selector";
import createGameMenu, {GameMenu} from "../elements/gameMenu";
import {Title} from "../elements/title";
import getGameScreen, {GameScreen} from "../main/gameScreen";
import createBuildingsDisplay, {BuildingsDisplay} from "./buildingsDisplay/buildingsDisplay";
import createSelectionElement from "./selectionElement";

export interface JoinMenu<Type> {

    goBack(): JoinMenu<Type>;
    remove(): JoinMenu<Type>;
    update(category: string): Promise<Type[]>;
}

export default (function() {

    const {isDefined, isArray, isString}: TypeChecker = typeChecker();
    const {subscribe, publish, unsubscribe}: PubSub = notifications();
    const {highlight, deHighlight}: Highlighter = highlighter();
    const keyBoard: KeyBoard = keyboardInput();
    const setupScreen: GameScreen = getGameScreen();
    const bufferAmountForMapScrolling: number = 1;
    const amountOfMapsToShowWhileScrolling: number = 5;
    const amountOfCategoryNeighbors: number = 2;
    const amountOfCategoriesToShow: number = 1;
    const className: string = "join";
    const idOfTitle: string = "title";
    const positionAttribute = "postion";
    const defaultCategory: string = "two";
    const selectionMenuType: string = "section";
    const mapSelectionId: string = "mapSelection";
    const classOfMapSelectionElement: string = "mapSelectionElement";
    const mapSelectionType = "map";
    const gameSelectionType = "game";
    const categorySelectionId: string = "categorySelection";
    const classOfCategoryScreen: string = "categorySelectionElement";
    const keyPressEvent = "keyPressed";
    const configurations = settings();
    const {
        list: categories,
        definitions: categoryDefinitions,
        positions,
    } = configurations.toObject("map", "categories");
    const categoryPositions: string[] = positions.slice();
    const categorySelectionMenu: GameMenu<any> = createGameMenu(categorySelectionId, selectionMenuType);
    const createSelectionMenu = (): GameMenu<any> => createGameMenu(mapSelectionId, selectionMenuType) as GameMenu<any>;
    const buildingsDisplay: BuildingsDisplay = createBuildingsDisplay();
    const categoryElements: List<Element<string>> = createList<Element<string>>(
        categories.map((category: string): Element<string> => {

        return createSelectionElement<string>(category)
            .setClass(classOfCategoryScreen)
            .setText(categoryDefinitions[category])
            .setValue(category)
            .hide();
    }));
    const addElementToCategorySelection = (element: Element<any>): any => {

        categorySelectionMenu.appendChild(element);
    };
    const scrollThroughCategories: Scroller = createScroller(amountOfCategoriesToShow)(categoryElements);
    const positionCategoryElements = (elements: Array<Element<string>>): Array<Element<string>> => {

        return zipWith(elements, categoryPositions, (element: Element<string>, position: string): Element<string> => {

            return element.setAttribute(positionAttribute, position);
        });
    };

    return function<Type>(type: string, game?: Game): JoinMenu<Type> {

        let selectionMenu: GameMenu<any> = createSelectionMenu();
        let scrollThroughSelectionMenu: Scroller;
        let selections: GameElementHandler<Type>;

        const selectionMenuScroller: ScrollHandler = createScroller(
            amountOfMapsToShowWhileScrolling,
            bufferAmountForMapScrolling,
        );
        const selectingMaps: boolean = isDefined(game);
        const selectionType: string = selectingMaps ? mapSelectionType : gameSelectionType;
        const finishedSelecting: string = `finishedSelecting${capitalizeFirstLetter(selectionType)}`;
        const title: Title = setupScreen.get(idOfTitle) as Title;
        const getMap = (element: any): Map => selectingMaps ? element : element.map;
        const selector: SelectionHandler<Element<Type>> = selectionHandler<Element<Type>>();
        const categorySelection: SelectionHandler<Element<string>> = selectionHandler<Element<string>>(categoryElements)
            .selectHorizontally();
        const selectableElement = <Type>(element: any, category: string, count: number): any => {

            return createSelectionElement<Type>(`${category}${selectionType}#${count}`)
                .setClass(classOfMapSelectionElement)
                .setText(element.name)
                .setValue(element);
        };
        const updateBuildingsDisplay = ({buildings}: Map): void => {

            buildingsDisplay.set(countBuildings(buildings, ({name}: Building): string => name));
        };
        const remove = function(): JoinMenu<Type> {

            setupScreen.remove(selectionMenu.id);
            setupScreen.remove(categorySelectionMenu.id);
            setupScreen.remove(buildingsDisplay.id);
            categorySelection.stop();
            selector.stop();
            unsubscribe(subscription, keyPressEvent);

            return this;
        };
        const goBack = function(): JoinMenu<Type> {

            remove();
            setupScreen.remove(idOfTitle);
            publish(["beginGameSetup", "settingUpGame"], true);

            return this;
        };
        const update = function(category: string): Promise<Type[]> {

            const current: Element<Type> = selector.getSelected();

            return selections.byCategory(category).then((received: Type[] = []): any => {

                let count: number = 1;
                let newSelections: List<Element<Type>>;
                let selectedElement: Element<Type>;

                selectionMenu = createSelectionMenu();

                if (isArray(received)) {

                    newSelections = createList<Element<Type>>(received.map((element: Type): Element<Type> => {

                        const selectionElement: Element<Type> = selectableElement<Type>(element, category, count++);

                        selectionMenu.appendChild(selectionElement);

                        return selectionElement;

                    })).moveToElement(current);

                    scrollThroughSelectionMenu = selectionMenuScroller(newSelections);
                    selectedElement = selector.setSelections(newSelections).getSelected();

                    highlight(selectedElement);
                    updateBuildingsDisplay(getMap(selectedElement.getValue()));

                } else {

                    buildingsDisplay.clearCount();
                }

                setupScreen.replace(selectionMenu.id, selectionMenu);

                return Promise.resolve(received);
            });
        };
        const subscription: number = subscribe(keyPressEvent, () => {

            const selected: Element<Type> = selector.getSelected();
            let element: Type;
            let map: Map;

            if (isDefined(selected)) {

                element = selected.getValue();
                map = getMap(element);
            }

            if (keyBoard.pressedEnter() && isMap(map)) {

                if (selectingMaps) {

                    game.map = map;
                }

                remove();

                publish(finishedSelecting, game || element);
            }

            if (keyBoard.pressedEscape()) {

                goBack();
            }

        }) as number;
        const verticalSelection = (current: any, previous: any) => {

            const map: Map = getMap(current.getValue());

            deHighlight(previous);
            highlight(current);
            scrollThroughSelectionMenu(keyBoard.pressedDown());
            updateBuildingsDisplay(map);
        };
        const horizontalSelection = (current: any, _: any, currentCategory: List<Element<string>>): void => {

            const category: string = current.getValue();
            const neighbors: Array<Element<string>> = currentCategory.getNeighboringElements(amountOfCategoryNeighbors);
            const movingForward: boolean = keyBoard.pressedRight();
            const firstElement: Element<string> = neighbors.shift();
            const lastElement: Element<string> = neighbors.pop();

            (movingForward ? firstElement : lastElement)
                .removeAttribute(positionAttribute);

            scrollThroughCategories(movingForward);
            positionCategoryElements(neighbors);

            update(category).catch(({message}: Error): any => {

                publish("customError", {className, method: "horizontalSelection", input: category, message});
            });
        };
        const category: string = categorySelection.horizontal(horizontalSelection)
            .start()
            .getSelected()
            .show()
            .getValue();

        if (isString(type)) {

            selections = gameElementHandler<Type>(`${selectionType}s`, type);

            selector.vertical(verticalSelection)
                .start();

            update(category).catch(({message}: Error): any => {

                publish("customError", {className, method: "update", input: defaultCategory, message});
            });

            categoryElements.forEach(addElementToCategorySelection);

            setupScreen.add(selectionMenu.id, selectionMenu);
            setupScreen.add(buildingsDisplay.id, buildingsDisplay);
            setupScreen.add(categorySelectionMenu.id, categorySelectionMenu);

            title.setText(`Select*${selectionType}`);

            return {

                goBack,
                update,
                remove,
            };
        }
        publish("invalidInput", {className, method: "constructor", input: type});
    };
}());
