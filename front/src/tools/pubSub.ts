/**
 * Created by moonmaster on 5/13/17.
 */

import {default as identifier, Identifier} from "./identity";
import {default as single} from "./singleton";

export interface PubSub {

    publish(eventId: string, data: any): void;
    subscribe(eventId: string, handler: Emitter): number;
    unsubscribe(id: number, event?: string): Subscriber;
}

export interface Subscriber {

    id: number;
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

function publishSubscribe(): PubSub {

    const events: Events = {};
    const increment = (id: number) => id + 1;
    const decrement = (id: number) => id - 1;
    const identity: Identifier<number> = identifier<number>(1, increment, decrement);

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

    const removeSubscriberFromEvent = (id: number, event: Event): Subscriber => {

        const nonExistentIndex = -1;
        const elementsToRemoveFromEvents = 1;
        const firstElementInReturnedArray = 0;
        const subscribers = event.subscribers;
        const indexOfSubscriber = subscribers.findIndex((subscriber) => subscriber.id === id);

        let subscriber;
        let arrayOfSplicedOutSubscribers;

        if (indexOfSubscriber > nonExistentIndex) {

            arrayOfSplicedOutSubscribers = subscribers.splice(indexOfSubscriber, elementsToRemoveFromEvents);
            subscriber = arrayOfSplicedOutSubscribers[firstElementInReturnedArray];

            if (!subscribers.length) {

                removeEvent(event.name);
            }

            return subscriber;
        }
    };

    const removeSubscriberById = (id: number): Subscriber => {

        return iterateThroughEvents((event: Event): Subscriber => {

            return removeSubscriberFromEvent(id, event);
        });
    };

    const addSubscriber = (subscribers: Subscriber[], eventHandler: Emitter): number => {

        const subscriber = createSubscriber(eventHandler);

        subscribers.push(subscriber);

        return subscriber.id;
    };

    const getSubscribers = (name: string) => getEvent(name).subscribers;

    const subscribe = (eventId: string, handler: Emitter): number => {

        return addSubscriber(getSubscribers(eventId), handler);
    };

    const publish = (eventId: string, data: any): void => {

        const event = getEvent(eventId);
        const subscribers = getSubscribers(eventId);
        const subscriptionIds: string[] = Object.keys(subscribers);
        const currentTime: Date = new Date();
        const timeOfLastUpdate: Date = event.timeOfLastUpdate;
        const timeSinceLastUpdate = Number(currentTime) - Number(timeOfLastUpdate);

        let indexOfUnnotifiedSubscriberId = subscriptionIds.length;
        let subscriptionId: any;
        let subscriber: Subscriber;

        event.timeOfLastUpdate = currentTime;

        while (indexOfUnnotifiedSubscriberId--) {

            subscriptionId = subscriptionIds[indexOfUnnotifiedSubscriberId];
            subscriber = subscribers[subscriptionId];

            subscriber.emit(data, timeSinceLastUpdate);
        }
    };

    const unsubscribe = (id: number, event?: string): Subscriber => {

        identity.remove(id);

        if (event) {

            return removeSubscriberFromEvent(id, events[event]);
        }

        return removeSubscriberById(id);
    };

    return {

        publish,
        subscribe,
        unsubscribe,
    };
}

export default single(publishSubscribe());
