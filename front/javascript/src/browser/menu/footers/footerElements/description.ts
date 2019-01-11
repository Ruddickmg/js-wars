import {subscribe} from "../../../../tools/pubSub";
import createElement, {Element} from "../../../dom/element/element";

export interface FooterDescription extends Element<string> {
  activate(): FooterDescription;
  hide(): FooterDescription;
  moveUp(): FooterDescription;
  center(): FooterDescription;
  setDescription(description: string): void;
}

export default function(): FooterDescription {

  const activationClass = "active";
  const moveUpClass = "movedUp";
  const description: Element<string> = createElement<string>("descriptions", "h1");

  const activate = function(): FooterDescription {
     description.appendClass(activationClass);
     return this;
  };

  const center = function(): FooterDescription {
    description.removeClass(moveUpClass);
    return this;
  };

  const hide = function(): FooterDescription {
    description.removeClass(activationClass);
    return this;
  };

  const moveUp = function(): FooterDescription {
    description.appendClass(moveUpClass);
    return this;
  };

  const setDescription = (text: string): void => {
    description.setText(text);
    description.setValue(text);
  };

  subscribe("setFooterDescription", setDescription);

  return Object.assign(description, {
    activate,
    center,
    hide,
    moveUp,
    setDescription,
  });
}
