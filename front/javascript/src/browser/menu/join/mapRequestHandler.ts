import settings from "../../../settings/settings";
import randomNumber from "../../../tools/calculations/random";
import notifier, {PubSub} from "../../../tools/pubSub";
import createRequest, {IncompleteRequest, Request} from "../../communication/requests/request";
import requestHandler from "../../communication/requests/requestHandler";

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
  const {publish}: PubSub = notifier();
  const categorySettings = settings().toObject("map", settingsLocation);
  const categories: string[] = Object.keys(categorySettings);
  const defaultCategory = categories[0];
  const getMapsByCategory: IncompleteRequest = requestHandler(route, [type], request)[type];
  const getRandomCategory = (): string => categories[randomNumber.index(categories)];
  const byCategory = (category: string = defaultCategory): Promise<Type[]> => {

    return getMapsByCategory(category).then((elements: Type[]): Promise<Type[]> => {

      publish("selectionsUpdated", elements);

      return Promise.resolve(elements);
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
