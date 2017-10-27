export interface TruthTable {

  [property: string]: boolean;
}

export default function(...allowedProperties: any[]): TruthTable {

  return allowedProperties.reduce((truthObject: any, allowedProperty: string): any => {

    truthObject[allowedProperty] = true;

    return truthObject;

  }, {});
}
