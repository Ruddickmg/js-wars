/* --------------------------------------------------------------------------------------*\
    
    Modes.js controls game mode selection 

\* --------------------------------------------------------------------------------------*/

ModesElement = require(".//elements/modesElement.js");
ScrollText = require("../effects/scrollText.js");
Select = require("../tools/selection.js");

import allSettings, {Settings} from "../../settings/settings";
import createList from "../dom/list";
import createUList from "../dom/ul";
import createFader from "../effects/fade";
import createMenu, {Menu} from "./elements/menu";

export default function() {

    const settings: Settings = allSettings();
    const menu: Menu = Object.create(createMenu());
    const positions = [

        "twoAbove",
        "oneAbove",
        "selected",
        "oneBelow",
        "twoBelow",
    ];
    const messages = {

        COdesign: "Customize the look of your CO",
        continuegame: "Resume a saved game",
        continuejoin: "Re-Join a saved game started at an earlier time",
        design: "Design maps or edit CO appearance",
        game: "Create or continue a saved game",
        join: "Join a new or saved game",
        logout: "select to log out of the game",
        mapdesign: "Create your own custom maps",
        newgame: "Set up a new game",
        newjoin: "Find and join a new game",
        store: "Purchase maps, CO\"s, and other game goods",
    };

    const createListOfModeElements = (properties: string[]): any[] => {

        return properties.map((property: string, index: number) => {

            return new ModesElement(property, index);
        });
    };

    const display = function() {

        const modeScreen = this.createScreen("setupScreen");
        const properties = this.properties();
        const mode = this.mode();
        const title = this.createTitle("Select*Mode");
        const menu = document.createElement("ul");
        const footer = app.footer.scrolling();
        const selectedModeHeight = settings.get("selectedModeHeight");
        const items: any[] = createListOfModeElements(properties);
        const {background, color} = mode;

        menu.setAttribute("id", "selectModeMenu");

        items.forEach((item) => menu.appendChild(item.element()));

        modeScreen.appendChild(menu);
        modeScreen.appendChild(footer);

        this.setHeight(selectedModeHeight);
        this.setList(createList(items));
        this.setElement(createUList(menu));
        this.rotate(this.list().indexOf(mode));
        this.insert(modeScreen);
        this.fader = createFader([background], color)
            .start();

        app.footer.scroll(this.message(this.mode().id()));

        return modeScreen;
    };

    return {

        initialize,
        select,
    };
}

Modes.setList = function(elements) {this.moveLeft = elements;};
Modes.list = function() {return this.moveLeft;};
Modes.setElement =function(element) {this.e = element;};
Modes.element = function() {return this.e; };
Modes.setHeight = function(height) {this.height = height;};
Modes.height = function() {return this.height;};
Modes.properties = function() { return app.settings.selectModeMenu; };
Modes.message = function(id) {return this.messages[id];};
Modes.insert = function(screen) {document.body.insertBefore(screen, app.dom.insertLocation);};
Modes.removePlayer = function()

    app.dom.removeChildren(this.screen(), "title");
    app.footer.removePlayer();
    this.deactivate();
    this.fader.stop();
    return this;
};

Modes.options = function() {return this.mode().options;};
Modes.mode = function() {

    return this.list().current();
};
Modes.option = function () {return this.options().currentPlayer();};
Modes.setMode = function (name) { this.mode = name; };
Modes.selectMode = function () {

    if (app.key.pressed(["up","down"])) {
        this.mode().deselect();
        this.fader.changeElement(
            Select.vertical(this.list()).currentPlayer().select().background()
        ).setColor(this.mode().color.getPlayer());
        app.footer.scroll(this.message(this.mode().id()));
        this.rotate();
    }

    var options = this.options();

    if (!options && app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter()))
        return this.removePlayer().mode().id();

    if (options && app.key.pressed(app.key.moveRight()) && app.key.undo(app.key.moveRight())) {
        options.activate();
        this.fader.changeElement(this.option());
        app.footer.scroll(this.message(this.option().id));
    }
};
Modes.selectOption = function () {
    if (app.key.pressed(["up","down"])) {
        this.fader.changeElement(
            Select.vertical(this.options()).currentPlayer());
        app.footer.scroll(this.message(this.option().id));
    }

    if (app.key.pressed(app.key.enter()) && app.key.undo(app.key.enter()))
        return this.removePlayer().option().id;
    
    if (app.key.pressed(app.key.moveLeft()) && app.key.undo(app.key.moveLeft())) {
        this.fader.changeElement(this.mode().background());
        app.footer.scroll(this.message(this.mode().id()));
        this.options().deactivate();
    }
};

// rotation stuff
Modes.getPosition = function (index) { return this.positions[this.list().wrap(index)] || "hidden"; };
Modes.element = function (index) {
    var list = this.list();
    return list.elements()[list.wrap(index)];
};
Modes.setPosition = function (element, index) {this.element(element).setPosition(this.getPosition(index));};
Modes.rotate = function () {
    for (var index = 0, ind = this.mode().index(), i = ind - 2; i <= ind + 2; i += 1)
        this.setPosition(i, index++);
};
