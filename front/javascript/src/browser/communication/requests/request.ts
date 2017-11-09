import {SinonFakeXMLHttpRequest} from "sinon";
import curry from "../../../tools/function/curry";
import single from "../../../tools/storage/singleton";
import typeChecker, {TypeChecker} from "../../../tools/validation/typeChecker";

export type IncompleteRequest = (input: any) => Promise<any>;

export interface Request {

  get(url: string, input?: any): Promise<any> | IncompleteRequest;
  post(url: string, input?: any): Promise<any> | IncompleteRequest;
  del(url: string, input?: any): Promise<any> | IncompleteRequest;
}

export default single<Request>(function(mock: SinonFakeXMLHttpRequest) {

  const ok: number = 200;
  const ready: number = 4;
  const isEqual = (state: any, comparison: number): boolean => Number(state) === Number(comparison);
  const isReady = (state: any): boolean => isEqual(state, ready);
  const isOk = (state: any): boolean => isEqual(state, ok);
  const {isError}: TypeChecker = typeChecker();
  const requestTypes: string[] = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
  const getRequest = (request: any, type?: string): any => {

    try {

      return new request(type);

    } catch (error) {

      return error;
    }
  };
  const connect = () => {

    return mock || requestTypes.reduce((response: any, type: string): any => {

      return isError(response) ? getRequest(ActiveXObject, type) : response;

    }, getRequest(XMLHttpRequest));
  };
  const ajaj = (input: any, action: string, url: string): Promise<any> => {

    return new Promise((resolve: any, reject: any): Promise<any> => {

      const request: any = connect();
      const now: number = new Date().getTime();

      if (isError(request)) {

        return reject(request);
      }

      request.onreadystatechange = () => {

        const status: number = request.status;
        if (isReady(request.readyState)) {

          return isOk(status) ?
            resolve(JSON.parse(request.responseText)) :
            reject(Error(`Request failed with status: ${status}`));
        }
      };

      try {

        request.open(action, `${url}?ts=${now}`, true);
        request.setRequestHeader("Content-type", "application/json;charset=UTF-8");
        request.send(JSON.stringify(input));

      } catch (error) {

        return reject(error);
      }
    });
  };

  const del = curry((url: string, input?: any) => ajaj(input, "DELETE", `${url}/${input}`));
  const get = curry((url: string, input?: any) => ajaj(input, "GET", `${url}/${input}`));
  const post = curry((url: string, input?: any) => ajaj(input, "POST", url));

  return {

    del,
    get,
    post,
  };
});
