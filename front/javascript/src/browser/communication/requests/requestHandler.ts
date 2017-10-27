import notifications, {PubSub} from "../../../tools/pubSub";
import requestMaker, {IncompleteRequest, Request} from "./request";

export interface RequestHandler {

  [index: string]: IncompleteRequest;
}

export default function(routeName: string, ...routes: string[]): RequestHandler {

  const {subscribe}: PubSub = notifications();
  const {get, post}: Request = requestMaker();
  const formatUrl = (url: string): string => `${routeName}/${url}`;
  const request = get(routeName) as IncompleteRequest;
  const sendErrorToServer = (message: string): Promise<any> | IncompleteRequest => post(message, formatUrl("errors"));

  subscribe("sendErrorToServer", sendErrorToServer);

  return routes.reduce((handler: any, route: string): IncompleteRequest => {

    handler[route] = (parameter?: string): Promise<any> => {

      const url: string = parameter ? `${route}/${parameter}` : route;

      return request(url);
    };

    return handler;

  }, {sendErrorToServer});
}
