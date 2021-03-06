import {isDefined, isFunction} from "../../../validation/typeChecker";

export default function isList(element: any): boolean {
  return isDefined(element)
    && isFunction(element.modify)
    && isFunction(element.next)
    && isFunction(element.previous)
    && isFunction(element.getCurrentElement)
    && isFunction(element.getCurrentIndex)
    && isFunction(element.length)
    && isFunction(element.addElement)
    && isFunction(element.addElements)
    && isFunction(element.isEmpty)
    && isFunction(element.reduce)
    && isFunction(element.map)
    && isFunction(element.filter)
    && isFunction(element.forEach)
    && isFunction(element.find)
    && isFunction(element.sort)
    && isFunction(element.findIndex)
    && isFunction(element.getRandom)
    && isFunction(element.getElementAtIndex)
    && isFunction(element.getNeighboringElements)
    && isFunction(element.moveToElement)
    && isFunction(element.moveToLastElement)
    && isFunction(element.moveToFirstElement);
}
