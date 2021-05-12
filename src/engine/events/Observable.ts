/**
 * A light weight alternative to Event Emitter for scenario
 * that can afford a little bit more coupling
 */
export interface IObserverable {
  notifyUdpate();
  observe(callback: Function);
  unobserve(callback: Function);
}

type ObserverableCallback = (observable: IObserverable) => void;

export abstract class AbstractObservable implements IObserverable {
  private _observee: ObserverableCallback[] = [];

  notifyUdpate() {
    this._observee.forEach((callback) => callback(this));
  }
  observe(callback: ObserverableCallback) {
    this._observee.push(callback);
  }
  unobserve(callback: ObserverableCallback) {
    this._observee.splice(this._observee.indexOf(callback), 1);
  }
}
