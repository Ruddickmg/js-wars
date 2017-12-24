import single from "../../tools/storage/singleton";
import isValidIndex from "../../tools/validation/nonNegativeIndex";
import validator, {Validator} from "../../tools/validation/validator";

export interface UrlParameters {
  [id: string]: any;
}

export interface Url {
  toString(): string;
  redirect(url: string): Url;
  parameters(): UrlParameters;
}

export default single<Url>(function(source: any): Url {
  const {validateString}: Validator = validator("url");
  const redirect = function(url: string): Url {
    if (validateString(url, "redirect")) {
      source.top.location.href = url;
    }
    return this;
  };
  const toString = (): string => source.top.location.href;
  const parameters = (): UrlParameters => {
    const url = source.top.location.href;
    const indexOfParameterList = url.indexOf("?");
    let urlParameters: UrlParameters = {};
    if (isValidIndex(indexOfParameterList)) {
      urlParameters = url.slice(indexOfParameterList + 1)
        .split("&")
        .reduce((currentParameters: UrlParameters, keyValuePair: string): UrlParameters => {
          const [key, value] = keyValuePair.split("=");
          currentParameters[key] = value;
          return currentParameters;
        }, urlParameters);
    }
    return urlParameters;
  };
  return {
    parameters,
    redirect,
    toString,
  };
});
