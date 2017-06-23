import requestMaker, {IncompleteRequest, Request} from "./request";

export interface RequestHandler {

    [index: string]: IncompleteRequest;
}

export default function(routeName: string, routes: string[]): RequestHandler {

    const {get}: Request = requestMaker();
    const request = get(routeName) as IncompleteRequest;

    return routes.reduce((handler: any, route: string): any => {

        handler[route] = (parameter?: string): Promise<any> => {

            const url: string = parameter ? `${route}/${parameter}` : route;

            return request(url);
        };

        return handler;

    }, {});
}
