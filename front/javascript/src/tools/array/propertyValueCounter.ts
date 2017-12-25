import {isDefined} from "../validation/typeChecker";

export default (function() {
  return (array: any[], getProperty: (object: any) => any): any => {
    return array.reduce((count: any, element: any): any => {
      const property: any = getProperty(element);
      if (!isDefined(count[property])) {
        count[property] = 0;
      }
      count[property] += 1;
      return count;
    }, {});
  };
}());
