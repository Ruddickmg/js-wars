import identifier, {Identifier} from "./identity";
import {isArray, isFunction, isString} from "./validation/typeChecker";

export interface PubSub {
  publish(eventId: string | string[], data?: any): void;
  subscribe(eventId: string | string[], handler: Emitter): number | number[];
  unsubscribe(id: number, event?: string): Subscriber;
}

export type SubscriptionId = number;

export interface Subscriber {
  id: SubscriptionId;
  emit: Emitter;
}

interface Events {
  [index: string]: Event;
}

interface Event {
  name: string;
  subscribers: Subscriber[];
  timeOfLastUpdate: Date;
}

type Emitter = (data: any, timeSinceLastUpdate: number) => any;
const nonExistentIndex = -1;
const singleElement: number = 1;
const elementsToRemoveFromEvents = singleElement;
const firstElementInReturnedArray = 0;
const errorEventId: string = "error";
const events: Events = {};
const isEmpty = (subscribers: Subscriber[]): boolean => subscribers.length < elementsToRemoveFromEvents;
const increment = (id: SubscriptionId) => id + 1;
const decrement = (id: SubscriptionId) => id - 1;
const identity: Identifier<SubscriptionId> = identifier<SubscriptionId>(1, increment, decrement);
const createEvent = (name: string): Event => ({name, subscribers: [], timeOfLastUpdate: new Date()});
const createSubscriber = (eventHandler: Emitter): Subscriber => {
  return {
    emit: eventHandler,
    id: identity.get(),
  };
};
const getEvent = (name: string): Event => {
  if (!events[name]) {
    events[name] = createEvent(name);
  }
  return events[name];
};
const removeEvent = (name: string): Event => {
  const event = events[name];
  delete events[name];
  return event;
};
const iterateThroughEvents = (callback: (event: Event) => any): any => {
  const eventIds = Object.keys(events);
  let indexOfEventId = eventIds.length;
  let nameOfEvent;
  let result;
  while (indexOfEventId--) {
    nameOfEvent = eventIds[indexOfEventId];
    result = callback(events[nameOfEvent]);
    if (result) {
      return result;
    }
  }
};
const removeSubscriberFromEvent = (id: SubscriptionId, event: Event): Subscriber => {
  const subscribers = event.subscribers;
  const indexOfSubscriber = subscribers.findIndex((subscription) => subscription.id === id);
  let subscriber;
  let arrayOfSplicedOutSubscribers;
  if (indexOfSubscriber > nonExistentIndex) {
    arrayOfSplicedOutSubscribers = subscribers.splice(indexOfSubscriber, elementsToRemoveFromEvents);
    subscriber = arrayOfSplicedOutSubscribers[firstElementInReturnedArray];
    if (isEmpty(subscribers)) {
      removeEvent(event.name);
    }
    return subscriber;
  }
};
const removeSubscriberById = (id: SubscriptionId): Subscriber => {
  return iterateThroughEvents((event: Event): Subscriber => {
    return removeSubscriberFromEvent(id, event);
  });
};
const addSubscriber = (subscribers: Subscriber[], eventHandler: Emitter): SubscriptionId => {
  const subscriber = createSubscriber(eventHandler);
  subscribers.push(subscriber);
  return subscriber.id;
};
const getSubscribers = (name: string) => getEvent(name).subscribers;
const addSubscription = (eventId: string, handler: Emitter): SubscriptionId => {
  if (isString(eventId)) {
    if (isFunction(handler)) {
      return addSubscriber(getSubscribers(eventId), handler);
    }
    publish(errorEventId, Error("Invalid callback provided to subscribe method of pubSub."));
  }
  publish(errorEventId, Error(`Invalid input: ${eventId}, provided to the subscribe method of pubSub.`));
};
const addEvent = (eventId: string, data?: any): void => {
  const event = getEvent(eventId);
  const subscribers = getSubscribers(eventId);
  const currentTime: Date = new Date();
  const timeOfLastUpdate: Date = event.timeOfLastUpdate;
  const timeSinceLastUpdate = Number(currentTime) - Number(timeOfLastUpdate);
  if (isString(eventId)) {
    event.timeOfLastUpdate = currentTime;
    subscribers.forEach((subscriber: Subscriber): void => {
      subscriber.emit(data, timeSinceLastUpdate);
    });
  } else {
    publish(errorEventId, Error(`Invalid input: ${eventId}, provided to the publish method of pubSub`));
  }
};
const handleArrayOrString = (event: string | string[], data: any, action: (id: string, data: any) => void): any => {
  return isString(event) ?
    action(event as string, data) :
    (event as string[]).map((eventId: string) => action(eventId, data));
};
export const subscribe = (event: string | string[], handler: Emitter): number | number[] => {
  return handleArrayOrString(event, handler, addSubscription);
};
export const publish = (event: string | string[], data?: any): void => {
  handleArrayOrString(event, data, addEvent);
};
export const unsubscribe = (
  subscriptionId: SubscriptionId | SubscriptionId[],
  event?: string,
): Subscriber | Subscriber[] => {
  const subscriptions: SubscriptionId[] = (isArray(subscriptionId) ?
    subscriptionId :
    [subscriptionId]) as SubscriptionId[];
  return subscriptions.map((id: SubscriptionId) => {
    identity.remove(id);
    if (event && events[event]) {
      return removeSubscriberFromEvent(id, events[event]);
    }
    return removeSubscriberById(id);
  });
};
