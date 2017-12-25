import request = require("request-promise-native");
import {isString} from "../../src/tools/validation/typeChecker";

export default function(url: string) {
  const json: boolean = true;
  const method: any = "DELETE";
  const clear = (databaseName?: string): any => {
    const parameters: string = isString(databaseName) ? `?database=${databaseName}` : "";
    const uri: string = `${url}/drop${parameters}`;
    return request({uri, method, json});
  };
  return {
    clear,
  };
}
