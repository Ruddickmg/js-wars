import createElement, {Element} from "../../dom/element/element";

export default function(setting: string): Element<any> {

    return createElement(`${setting}Container`, "div").setClass("stable");
}
