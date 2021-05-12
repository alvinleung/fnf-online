export enum EventDictionary {}

export interface IEventEmitter<T extends string> {
  addEventListener(eventType: T, callback: Function): void;
  removeEventListener(eventType: T, callback: Function): void;
  hasEventListener(eventType: T, callback: Function): void;
  fireEvent(eventType: T): void;
}

export class EventEmitter<T extends string> implements IEventEmitter<T> {
  private _eventCallbackRegistry: {
    [EventType: string]: Function[];
  };

  addEventListener(eventType: T, callback: Function): void {
    if (!this._eventCallbackRegistry[eventType])
      this._eventCallbackRegistry[eventType] = [];

    this._eventCallbackRegistry[eventType].push(callback);
  }
  removeEventListener(eventType: T, callback: Function): void {
    const eventTypeCallbacks = this._eventCallbackRegistry[eventType];

    if (eventTypeCallbacks) {
      eventTypeCallbacks.splice(eventTypeCallbacks.indexOf(callback), 1);
    }
  }
  hasEventListener(eventType: T, callback: Function): boolean {
    const eventTypeCallbacks = this._eventCallbackRegistry[eventType];

    if (eventTypeCallbacks) {
      return eventTypeCallbacks.indexOf(callback) !== -1;
    }
    return false;
  }

  fireEvent(eventType: T): void {
    this._eventCallbackRegistry[eventType].forEach((callback) =>
      callback(this)
    );
  }
}
