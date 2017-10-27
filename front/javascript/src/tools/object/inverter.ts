export default (object: any): any => {

  return Object.keys(object).reduce((inverted: any, key: string) => {

    const value = object[key];

    inverted[value] = key;

    return inverted;

  }, {});
};
