export default (function() {
  const isFunction = (object: any): boolean => {
    return object !== null
      && object !== void 0
      && object.constructor === Function;
  };
  return function <Type>(object: any): (...args: any[]) => Type {
    let stored: any;
    return (...args: any[]): Type => {
      if (!stored) {
        stored = isFunction(object) ? object(...args) : object;
        return stored;
      }
      return isFunction(stored) ? stored(...args) : stored;
    };
  };
}());
