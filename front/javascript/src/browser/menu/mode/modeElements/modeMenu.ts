import getSettings from "../../../../settings/settings";
import createList, {ArrayList} from "../../../../tools/storage/lists/arrayList/list";
import createElement, {Element} from "../../../dom/element/element";
import createModeElement, {ModeElement} from "./modeElement";
import {ModeMenuItem} from "./modeItem";

export interface ModeMenu<Type> extends Element<Type> {
  elements: ArrayList<ModeElement>;
}

export default function <Type>() {
  const modeMenuId: string = "selectModeMenu";
  const modeMenuType: string = "ul";
  const modes: any = getSettings().toObject("mode", "modes");
  const menu: Element<Type> = createElement<Type>(modeMenuId, modeMenuType);
  const gameModes: ModeElement[] = modes.map(({options, id}: ModeMenuItem): ModeElement => {
    return createModeElement(id, options);
  });
  const elements: ArrayList<ModeElement> = createList<ModeElement>(gameModes);
  elements.forEach((modeElement: ModeElement) => menu.appendChild(modeElement));
  return Object.assign(menu, {elements});
}
