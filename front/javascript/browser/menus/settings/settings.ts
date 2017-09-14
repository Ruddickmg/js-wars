import game from "../../../game/game";

Arrows = require('../../objects/arrows/arrows.ts');
Teams = require('.//teams.js');
Select = require('../../tools/selection.js');
SettingElement = require('.//elements/settingElement.js');
DefaultSettings = require('../../configuration/settings/settingsSelection/defaults.ts');
Sweller = require('../../effects/swell.ts');

Settings.rules = {

    // optional parameter defines what display type will be displayed when revealing an element
    display:'inline-block',

    // holds the name of the element used for chat and description etc, displayed text
    text: 'descriptions',
};

Settings.init = function(movingForward: boolean) {

    if (this.arrows) {

            movingForward ?
                this.fall(function() {scope.sweller.start();}) :
                this.rise(function() {scope.sweller.start();});
    } else {

        this.sweller.start();
    }
    
    Select.setHorizontal(this.elements);
};

Settings.selected = function() {

    return this.elements.currentPlayer();
};

Settings.select = function (selected) {

    if (!this.active()) {

        this.init();
    }

    if (!app.input.active() || app.input.back()) {

        if (app.key.pressed(['left','right'])){

            selected = Select.setHorizontal(Select.horizontal(this.elements)).getHorizontal();
            
            this.sweller.stop().setElement(selected.background()).start();
            
            if (this.arrows) {

                this.arrows.setPosition(selected);
            }
        }

        if(app.key.pressed(['up','down']) && !app.game.started()) {

            selected = Select.setVertical(Select.vertical(Select.getHorizontal().hideCurrentElement()))
                .getHorizontal().show();
        }
        
        if (selected && !app.game.started()) {

            this.set(selected.type(), selected.valueOfCurrentElement());
        }
    }
    
    if (!app.game.started()) {

        if (app.key.pressed(app.key.enter()) || app.input.active()) {
            
            return this.input();
        
        } else return this.exit(this, function (scope) { 

            scope.m = false;
            scope.goBack();
            scope.removePlayer();
        });
    }
};

Settings.set = function(setting, value) {

    return this.parameters[setting] = value; 
};

Settings.input = function () {

    if (!app.input.active() || app.input.back()) {
        app.input.undoBack();
        app.input.name(this.screen());
        if (this.arrows) this.arrows.hideCurrentElement();
        app.key.undo();
    }
    
    if (app.key.pressed(app.key.enter())) {

        var weather, name = app.input.valueOfCurrentElement(), scope = this;

        if (name) {

            app.players.addPlayer(app.user.raw());
            app.game.setSettings(this.parameters);
            app.game.create(name);

            if ((weather = this.parameters.weather)) {

                app.background.set(weather);
                transmit.background(weather);
            }

            this.removePlayer();

            this.rise(function(){scope.element.parentNode.removeChild(scope.element);}, 5);

            return this.parameters;
        }

    } else if(app.key.pressed(app.key.esc())) {

        app.key.undo(app.key.esc());
        app.input.clear();
        this.arrows.show();
    }
};

Settings.removePlayer = function() {

    app.footer.removePlayer();

    if (this.arrows) {

        this.arrows.removePlayer();
    }

    this.deactivate();
    this.swelling = false;

    delete this.elements;

    Select.clear();

    if (app.key.pressed(app.key.esc())) {

        this.screen().removeChild(this.element);
    }

    app.key.undo();
};

import getGameScreen, {GameScreen} from "../screen/gameScreen";
import getSettings from "../../../settings/settings";
import {Dictionary} from "../../../tools/storage/dictionary";
import createElement, {Element} from "../../dom/element/element";
import createFooter, {Footer} from "../footers/footer";
import input from "../../input/input";
import createSettingElement, {SettingElement} from "./settingElement";
import createList, {List} from "../../dom/list/list";
import createSelector, {SelectionHandler} from "../../tools/selector";

export default (function() {

    const offScreen: number = 4;
    const startingPoint: number = 0.05;
    const centerOfScreen: number = 0.5;
    const distanceBetweenSettingElements: number = 0.13;
    const amountOFVerticalMovement: number = 0.06;
    const settingsMenuId: string = "settings";
    const settingsMenuType: string = "section";
    const titleId: string = "title";
    const titleText: string = "rules";
    const widthType: string = "offset";
    const settingSelector: SelectionHandler<SettingElement> = createSelector<SettingElement>();
    const setupScreen: GameScreen = getGameScreen();
    const settings: Dictionary = getSettings();
    const settingsElementDefinitions: any = settings.toObject(settingsMenuId);
    const namesOfEachSetting = Object.keys(settingsElementDefinitions);
    const settingsSelectionMenu: Element<any> = createElement<any>(settingsMenuId, settingsMenuType);
    const footer: Footer = createFooter();
    const width: number = setupScreen.getWidth(widthType);
    const height: number = setupScreen.getHeight(widthType);
    const nameInput = input.form('name', footer, 'Enter name here.');

    return function(): SettingsMenu {

        let top = height * centerOfScreen;
        let left = width * startingPoint;

        const settingElements: Element<string>[] = namesOfEachSetting.map((settingName: string) => {

            const setting: SettingElement = createSettingElement(settingName, settingsElementDefinitions);

            setting.setPosition(left, top);

            left += distanceBetweenSettingElements * width;
            top -= amountOFVerticalMovement * height;

            settingsSelectionMenu.appendChild(setting.outline);
            settingsSelectionMenu.appendChild(setting.background);

            return setting;
        });

        const listOfSettingElements: List<SettingElement> = createList<SettingElement>(settingElements);

        settingSelector.setSelections(listOfSettingElements)
            .vertical(verticalSelection)
            .horizontal(horizontalSelection)
            .start();

        footer.appendChild(nameInput);

        setupScreen.appendChild(footer);
        setupScreen.appendChild(settingsSelectionMenu);
        setupScreen.get(titleId).setText(titleText);

        // this.sweller = new Sweller(elements[0].background(), 50, 100);

        // var top = this.arrows ? (input.back() ? middle - offScreen : middle + offScreen) : middle;

        // if (this.arrows) {
        //
        //     this.arrows.insert(settingsSelectionMenu).setSpace(40)
        //         .setPosition(this.elements.current())
        //         .fade();
        // }
    };
}());
