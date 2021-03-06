import settings from "../../../settings/settings";
import randomNumber from "../../../tools/calculations/random";
import {publish} from "../../../tools/pubSub";
import createRequest, {IncompleteRequest, Request} from "./request";
import requestHandler from "./requestHandler";

export interface MapRequestHandler<Type> {
  byCategory(category: string): Promise<Type[]>;
  randomCategory(): Promise<Type[]>;
}

export default function <Type>(
  route: string,
  type: string,
  request: Request = createRequest(),
): MapRequestHandler<Type> {
  const settingsLocation: string = "categories";
  const categorySettings = settings().toObject("map", settingsLocation);
  const categories: string[] = Object.keys(categorySettings);
  const defaultCategory = categories[0];
  const getMapsByCategory: IncompleteRequest = requestHandler(route, [type], request)[type];
  const getRandomCategory = (): string => categories[randomNumber.index(categories)];
  const byCategory = (category: string = defaultCategory): Promise<Type[]> => {
    return getMapsByCategory(category).then(({response}): Promise<Type[]> => {
      publish("selectionsUpdated", response);
      return Promise.resolve(response);
    });
  };
  const randomCategory = (): Promise<Type[]> => {
    return byCategory(getRandomCategory()).then((receivedMaps: Type[]) => {
      return Promise.resolve(receivedMaps);
    });
  };
  return {
    byCategory,
    randomCategory,
  };
}
