import notifications, {PubSub} from "../../../tools/pubSub";
import createRequest, {IncompleteRequest, Request} from "./request";

export interface RequestHandler {

  [index: string]: IncompleteRequest;
}

export default function(routeName: string, routes: string[], {get, post}: Request = createRequest()): RequestHandler {

  const {subscribe}: PubSub = notifications();
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
