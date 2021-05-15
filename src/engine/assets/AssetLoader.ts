import { EventEmitter } from "../events/EventEmitter";
import { Asset } from "./Asset";

export interface AssetConfig {
  path: string;
  name: string;
}

export enum AssetLoaderEvent {
  PROGRESS = "asset-load",
  COMPLETE = "asset-all-complete",
  ERROR = "asset-error", // not implemented
}

export abstract class AssetLoader<T extends Asset> extends EventEmitter<AssetLoaderEvent> {
  private assetsDict: { [name: string]: T } = {};
  private assetConfigs: Array<AssetConfig> = [];

  private loadedCount: number = 0;
  private totalCount: number = 0;
  private isDone: boolean = false;

  public add(config: AssetConfig) {
    if (this.assetsDict[config.name]) {
      console.warn(
        `Item "${config.name}" already exist in the AssetLoader, abort loading process.`
      );
      return;
    }
    this.assetConfigs.push(config);
    this.totalCount++;
  }

  public get(name: string): T {
    const ref = this.assetsDict[name] as T;
    if (!ref) console.warn(`Asset "${name}" not found`);
    return ref;
  }

  public getAssetDictionary(): { [name: string]: T } {
    return this.assetsDict;
  }

  public loadAll() {
    this.assetConfigs.forEach((config: AssetConfig) => {
      const onLoadCallback = () => {
        this.loadedCount++;
        this.onProgress();
        this.fireEvent(AssetLoaderEvent.PROGRESS, this.assetsDict[config.name]);
      };
      this.assetsDict[config.name] = this.loadItem(config, onLoadCallback);
    });
  }

  protected abstract loadItem(config: AssetConfig, onLoadCallback: Function): T;

  protected onProgress() {
    if (this.loadedCount === this.totalCount) {
      this.isDone = true;
      this.fireEvent(AssetLoaderEvent.COMPLETE, this);
    }
  }

  public getProgress(): number {
    return this.loadedCount / this.totalCount;
  }

  public isLoaded(): boolean {
    return this.isDone;
  }
}
