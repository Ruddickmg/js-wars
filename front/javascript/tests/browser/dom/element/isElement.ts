// TODO implement test for isElement

import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";

export default (element: any): boolean => {

  const {isDefined, isFunction}: TypeChecker = typeChecker();

  return isDefined(element)
    && isFunction(element.makeInvisible);
};
