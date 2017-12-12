import curry from "../function/curry";
import typeChecker, {TypeChecker} from "../validation/typeChecker";
export default curry(function(url: string, path: string, args: any = {}): string {
  const {isString, isBoolean, isNumber}: TypeChecker = typeChecker();
  const parameters: string[] = Object.keys(args);
  const length: number = parameters.length;
  const lastIndex: number = length - 1;
  let uri: string = `${url}${path}`;
  if (length) {
    uri += "?";
    parameters.forEach((parameter: string, index: number): any => {
      const value: any = args[parameter];
      if (isString(value) || isNumber(value) || isBoolean(value)) {
        uri += `${parameter}=${value}`;
        if (index < lastIndex) {
          uri += "&";
        }
      }
    });
  }
  return uri;
});
