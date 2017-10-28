import {Dimensions} from "../../game/map/coordinates/dimensions";
import createElement, {Element} from "../dom/element/element";
import createCanvas, {Canvas} from "./canvas";

export default <Type>(id: any, dimensions: Dimensions = {width: 128, height: 128}): Element<Type> => {

  const li: Element<Type> = createElement<Type>(`${id}Canvas`, "li").setClass("canvas");
  const canvas: Canvas<Type> = createCanvas<Type>(id, dimensions);

  li.appendChild(canvas);

  return li;
};
