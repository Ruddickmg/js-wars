export default {

    isArray: (object: any): boolean => object && object.constructor === Array,
    isBoolean: (object: any): boolean => object === false || object === true,
    isFunction: (object: any): boolean => object && object.constructor === Function,
    isString: (object: any): boolean => object && object.constructor === String,
};
