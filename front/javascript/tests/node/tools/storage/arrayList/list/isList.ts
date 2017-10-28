// TODO impliment test for isList

import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";

export default function isList(element: any): boolean {

  const {isDefined, isFunction}: TypeChecker = typeChecker();

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
    && isFunction(element.getRandom)
    && isFunction(element.getElementAtIndex)
    && isFunction(element.getNeighboringElements)
    && isFunction(element.moveToElement)
    && isFunction(element.moveToLastElement)
    && isFunction(element.moveToFirstElement);
}
