import { SoundLoader } from "./SoundLoader";
import { ImageLoader } from "./ImageLoader";
import { EventEmitter, IEventEmitter } from "../events/EventEmitter";
import { AssetLoader, AssetLoaderEvent } from "./AssetLoader";

export interface AssetEntry {
  name: string;
  path: string;
}

export interface AssetSheet {
  [assetType: string]: AssetEntry[];
}

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

  public async loadFromAssetSheet(url: string) {
    const response = await fetch(url);
    const assetSheetContent = (await response.json()) as AssetSheet;

    assetSheetContent.image.forEach((item) => {
      this.image.add({ name: item.name, path: item.path });
    });

    assetSheetContent.sound.forEach((item) => {
      this.sound.add({ name: item.name, path: item.path });
    });

    // load all item here
    this.loadAll();
  }

  public loadAll() {
    this.assetLoaders.forEach((loader) => loader.loadAll());
  }
  public haveAllAssetLoaded(): boolean {
    return this.assetLoaders.some((assetLoader: AssetLoader<any>) => {
      return assetLoader.isLoaded() === false;
    });
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

  private static _instance: AssetManager;
  public static getInstance() {
    if (!AssetManager._instance) {
      AssetManager._instance = new AssetManager();
    }
    return AssetManager._instance;
  }
}
