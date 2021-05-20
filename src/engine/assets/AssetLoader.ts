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
  private assetLoadingList: Array<AssetConfig> = [];

  private loadedCount: number = 0;
  private totalCount: number = 0;
  private isDone: boolean = true;

  public add(config: AssetConfig) {
    if (this.assetsDict[config.name]) {
      console.warn(
        `Skipped asset loading: Item "${config.name}" already exist in the AssetLoader.`
      );
      return;
    }
    this.assetLoadingList.push(config);
    this.totalCount++;
  }

  public get(name: string): T {
    const ref = this.assetsDict[name] as T;
    if (!ref) console.warn(`Asset "${name}" not found`);
    return ref;
  }

  /**
   * Check if the assset loader has loaded from a given path.
   * @param path
   * @returns
   */
  public hasAsset(path: string): boolean {
    return Object.values(this.assetsDict).some((asset) => asset.path === path);
  }

  /**
   * Get a resource base on a given path
   * @param path
   * @returns
   */
  public getAssetByPath(path: string) {
    return Object.values(this.assetsDict).find((asset) => asset.path === path);
  }

  public getAssetDictionary(): { [name: string]: T } {
    return this.assetsDict;
  }

  public loadAll() {
    // if nothing to load, trigger complete
    if (this.assetLoadingList.length === 0) {
      this.onComplete();
      return;
    }
    // reset isloaded state
    this.isDone = false;

    // load each assets
    this.assetLoadingList.forEach(async (config: AssetConfig) => {
      // wait for resource to load
      const assetInstance = await this.loadItem(config);

      // after the asset loaded...
      this.assetsDict[config.name] = assetInstance;

      this.loadedCount++;
      this.onProgress();
      this.fireEvent(AssetLoaderEvent.PROGRESS, this.assetsDict[config.name]);
    });

    // reset the loadint list
    this.assetLoadingList = [];
  }

  protected abstract loadItem(config: AssetConfig): Promise<T>;

  protected onProgress() {
    if (this.loadedCount === this.totalCount) {
      this.onComplete();
    }
  }

  protected onComplete() {
    this.isDone = true;
    this.fireEvent(AssetLoaderEvent.COMPLETE, this);
  }

  public getProgress(): number {
    return this.loadedCount / this.totalCount;
  }

  public isLoaded(): boolean {
    return this.isDone;
  }
}
