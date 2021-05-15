import { SoundLoader } from "./SoundLoader";
import { ImageLoader } from "./ImageLoader";
import { EventEmitter, IEventEmitter } from "../events/EventEmitter";
import { AssetLoader, AssetLoaderEvent } from "./AssetLoader";

/**
 * Singleton class to manage all the resources in game
 */
export class AssetManager implements IEventEmitter<AssetLoaderEvent> {
  public image: ImageLoader;
  public sound: SoundLoader;

  private assetLoaders: AssetLoader<any>[] = [];

  private constructor() {
    this.image = new ImageLoader();
    this.sound = new SoundLoader();

    this.assetLoaders = [this.image, this.sound];
  }

  loadAll() {
    this.assetLoaders.forEach((loader) => loader.loadAll());
  }

  addEventListener(eventType: AssetLoaderEvent, callback: Function): void {
    this.assetLoaders.forEach((loader) => {
      loader.addEventListener(eventType, callback);
    });
  }

  removeEventListener(eventType: AssetLoaderEvent, callback: Function): void {
    this.assetLoaders.forEach((loader) => {
      loader.removeEventListener(eventType, callback);
    });
  }

  hasEventListener(eventType: AssetLoaderEvent, callback: Function): void {
    this.assetLoaders.forEach((loader) => {
      loader.hasEventListener(eventType, callback);
    });
  }

  fireEvent(eventType: AssetLoaderEvent, payload?: any): void {
    this.assetLoaders.forEach((loader) => {
      loader.fireEvent(eventType, payload);
    });
  }

  public haveAllAssetLoaded(): boolean {
    return this.assetLoaders.some((assetLoader: AssetLoader<any>) => {
      return assetLoader.isLoaded() === false;
    });
  }

  private static _instance: AssetManager;
  public static getInstance() {
    if (!AssetManager._instance) {
      AssetManager._instance = new AssetManager();
    }
    return AssetManager._instance;
  }
}
