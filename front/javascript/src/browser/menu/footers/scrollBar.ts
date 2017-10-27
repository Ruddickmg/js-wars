import notifications, {PubSub} from "../../../tools/pubSub";
import createElement, {Element} from "../../dom/element/element";

export interface ScrollBar extends Element<string> {

  setText(text: string): ScrollBar;

  listen(): ScrollBar;

  stop(): ScrollBar;
}

export default function() {

  let subscription: number;

  const {subscribe, unsubscribe}: PubSub = notifications();
  const text: Element<any> = createElement("scrollingInfo", "p").setClass("scrolling");
  const scrollBar: Element<any> = createElement("scrollBar", "footer")
    .appendChild(text);

  const setText = function(message: string): ScrollBar {

    text.setText(message).setValue(message);
    scrollBar.setValue(message);

    return this;
  };
  const stop = function(): ScrollBar {

    unsubscribe(subscription);

    return this;
  };
  const listen = function(): ScrollBar {

    subscription = subscribe("scrollText", setText) as number;

    return this;
  };

  return Object.assign(scrollBar, {

    setText,
    stop,
    listen,
  });
}
