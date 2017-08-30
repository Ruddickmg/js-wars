import getSettings from "../../../settings/settings";
import getGameScreen, {GameScreen} from "../main/gameScreen";

// ScrollText = require("../../effects/scrollText.js");
// Select = require("../../tools/selection.js");

import createElement, {Element} from "../../dom/element";
import createList, {List} from "../../dom/list";
import createUList, {UList} from "../../dom/ul";
import createFader, {Fader, FaderFactory} from "../../effects/fade";
import {ModeMenuItem} from "./modeMenuItem";
import createModeElement, {ModesElement} from "./modesElement";
import createTitle, {Title} from "../elements/title";
import footer from "../../objects/footer";

export default function() {

    const modeSettings: string = "mode";
    const gameScreen: GameScreen = getGameScreen();
    const {heightOfSelected, selections, positions}: any = getSettings().toObject(modeSettings);

    const createListOfModeElements = (properties: ModeMenuItem[]): List<ModesElement> => {

        return createList<ModesElement>(properties.map((item: ModeMenuItem, index: number): ModesElement => {

            return createModeElement(item.id, index, item.options);
        }));
    };

    const screenName: string = "setupScreen";
    const modeMenuId: string = "selectModeMenu";
    const titleText: string = "Select*Mode";
    const modeMenuType: string = "ul";

    const display = function() {

        const menu: Element<any> = createElement(modeMenuId, modeMenuType);
        const title: Title = createTitle(titleText);
        const footer = footer.scrolling();

        const modeElements: List<ModesElement> = createListOfModeElements(selections);
        // const element: UList = createUList(menu);
        // const {background, color} = mode;

        modeElements.forEach((modeElement: ModesElement) => menu.appendChild(modeElement));

        rotate(modeElements);

        gameScreen.add(title.id, title);
        gameScreen.add(menu.id, menu);
        gameScreen.setClass(screenName);
        // gameScreen.add(footer.id, footer);

        // this.fader = createFader([background], color).start();
        //
        // app.footer.scroll(this.message(this.mode().id()));

        return gameScreen;
    };

    const rotate = (list: List<ModesElement>): void => {

        let position = 0;

        list.getNeighboringElements(2)
            .forEach((element: any) => element.setPosition(positions[position++]));
    };

    return {

        display,
    };
}
//
// Modes.setList = function(elements) {this.moveLeft = elements;};
// Modes.list = function() {return this.moveLeft;};
// Modes.setElement =function(element) {this.e = element;};
// Modes.element = function() {return this.e; };
// Modes.setHeight = function(height) {this.height = height;};
// Modes.height = function() {return this.height;};
// Modes.properties = function() { return app.settings.selectModeMenu; };
// Modes.message = function(id) {return this.messages[id];};
// Modes.insert = function(screen) {document.body.insertBefore(screen, app.dom.insertLocation);};
// Modes.removePlayer = function()
//
//     app.dom.removeChildren(this.screen(), "title");
//     app.footer.removePlayer();
//     this.deactivate();
//     this.fader.stop();
//     return this;
// };
//
// Modes.options = function() {return this.mode().options;};
// Modes.mode = function() {
//
//     return this.list().current();
// };
// Modes.option = function() {return this.options().currentPlayer();};
// Modes.setMode = function(name) { this.mode = name; };
// Modes.selectMode = function () {
//
//     if (app.key.pressed(["up","down"])) {
//         this.mode().deselect();
//         this.fader.changeElement(
//             Select.vertical(this.list()).currentPlayer().select().background()
//         ).setColor(this.mode().color.getPlayer());
//         app.footer.scroll(this.message(this.mode().id()));
//         this.rotate();
//     }
//
//     var options = this.options();
//
//     if (!options && app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter()))
//         return this.removePlayer().mode().id();
//
//     if (options && app.key.pressed(app.key.moveRight()) && app.key.undo(app.key.moveRight())) {
//         options.activate();
//         this.fader.changeElement(this.option());
//         app.footer.scroll(this.message(this.option().id));
//     }
// };
// Modes.selectOption = function () {
//     if (app.key.pressed(["up","down"])) {
//         this.fader.changeElement(
//             Select.vertical(this.options()).currentPlayer());
//         app.footer.scroll(this.message(this.option().id));
//     }
//
//     if (app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter()))
//         return this.removePlayer().option().id;
//
//     if (app.key.pressed(app.key.moveLeft()) && app.key.undo(app.key.moveLeft())) {
//         this.fader.changeElement(this.mode().background());
//         app.footer.scroll(this.message(this.mode().id()));
//         this.options().deactivate();
//     }
// };
//
// // rotation stuff
// Modes.getPosition = function (index) { return this.positions[this.list().wrap(index)] || "hidden"; };
// Modes.element = function (index) {
//     var list = this.list();
//     return list.elements()[list.wrap(index)];
// };
