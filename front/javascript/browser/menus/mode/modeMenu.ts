import getSettings from "../../../settings/settings";
import {Dictionary} from "../../../tools/dictionary";
import notifications, {PubSub} from "../../../tools/pubSub";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";
import createHsl, {Hsl} from "../../color/hsl";
import createElement, {Element} from "../../dom/element";
import createList, {List} from "../../dom/list";
import createFader, {Fader} from "../../effects/fade";
import keyboardInput, {KeyBoard} from "../../input/keyboard";
import createSelector, {SelectionHandler} from "../../tools/selector";
import createScrollBar, {ScrollBar} from "../footers/scrollBar";
import getGameScreen, {GameScreen} from "../main/gameScreen";
import createModeElement, {ModeElement} from "./modeElement";
import {ModeMenuItem} from "./modeItem";

export default function() {

    const keyEvent: string = "keyPressed";
    const screenName: string = "setupScreen";
    const modeMenuId: string = "selectModeMenu";
    const titleOfScreen: string = "Select*Mode";
    const modeMenuType: string = "ul";
    const modeSettings: string = "mode";
    const optionType = "modeOption";
    const nonSelectableElements: any = {
        design: true,
        game: true,
        join: true,
    };

    const settings: Dictionary = getSettings();
    const {isDefined}: TypeChecker = typeChecker();
    const keyboard: KeyBoard = keyboardInput();
    const {publish, subscribe, unsubscribe}: PubSub = notifications();
    const setupScreen: GameScreen = getGameScreen();
    const {modes, positions, messages, events}: any = settings.toObject(modeSettings);
    const colors: any = settings.toObject("colors", "definitions");
    const scrollBar: ScrollBar = createScrollBar();
    const fader: Fader = createFader();

    const menu: Element<any> = createElement(modeMenuId, modeMenuType);
    const gameModes: ModeElement[] = modes.map(({options, id}: ModeMenuItem): ModeElement => {

        return createModeElement(id, options);
    });
    const modeElements: List<ModeElement> = createList<ModeElement>(gameModes);
    const selector: SelectionHandler<ModeElement> = createSelector<ModeElement>(modeElements);
    const currentMode: ModeElement = modeElements.getCurrentElement();

    const isOption = (list: any): boolean => isDefined(list) && list.type === optionType;
    const toHsl = ({h, s, l}: any): Hsl => createHsl(h, s, l);
    const getDescriptionOf = ({id}: Element<any>): string => messages[id];
    const isSelectable = (mode: string): boolean => !nonSelectableElements[mode];
    const rotateMenuElements = (list: List<ModeElement>): void => {

        let position = 0;

        list.getNeighboringElements(2)
            .forEach((element: any) => element.setPosition(positions[position++]));
    };
    const remove = function() {

        scrollBar.stop();
        fader.stop();
        selector.stop();
        setupScreen.remove(scrollBar.id);
        setupScreen.remove(menu.id);
        unsubscribe(subscription, keyEvent);
    };
    const selectMode = (current: any, previous: any): void => {

        const mode: string = current.getValue();

        if (!isOption(current)) {

            fader.setColor(toHsl(colors[mode]));
        }

        previous.setBorderColor(null);

        fader.setCallbacks((color: string): void => current.setBorderColor(color));

        scrollBar.setText(messages[mode]);
    };

    const subscription: number = subscribe(keyEvent, (): void => {

        const mode: any = selector.getSelected().getValue();

        if (keyboard.pressedEnter() && isSelectable(mode)) {

            remove();

            publish(events[mode], mode);
        }

    }) as number;

    selector.vertical((selected: ModeElement, previous: ModeElement, selections: List<ModeElement>): void => {

        if (!isOption(selected)) {

            rotateMenuElements(selections);
        }

        selectMode(selected, previous);

    }).horizontal(selectMode).start();

    rotateMenuElements(modeElements);
    selectMode(currentMode, currentMode);

    setupScreen.add(menu.id, menu);
    setupScreen.add(scrollBar.id, scrollBar);
    setupScreen.setClass(screenName);
    setupScreen.get("title").setText(titleOfScreen);

    modeElements.forEach((modeElement: ModeElement) => menu.appendChild(modeElement));

    scrollBar.setText(getDescriptionOf(modeElements.getCurrentElement()))
        .scroll();

    fader.start();

    return {remove};
}
