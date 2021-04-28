import { Asset } from "./Asset";

export interface AssetConfig {
  path: string;
  name: string;
}

export abstract class AssetLoader<T extends Asset> {
  private assetsDict: { [name: string]: T } = {};
  private assetConfigs: Array<AssetConfig> = [];

  private loadedCount: number = 0;
  private totalCount: number = 0;
  private isDone: boolean = false;

  private loadedCallback: Function = () => {};
  private progressCallback: Function = () => {};

  public add(config: AssetConfig) {
    // this.assetsDict[name] = {
    //   path: path,
    //   name: name,
    // } as T;
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
        this.onLoad(this.assetsDict[config.name]);
      };
      this.assetsDict[config.name] = this.loadItem(config, onLoadCallback);
    });

    // Object.keys(this.assetsDict).forEach((key) => {
    //   this.assetsDict[key] = this.loadItem(
    //     this.assetsDict[key].name,
    //     this.assetsDict[key].path,
    //     () => {
    //       // this.assetsDict[key].isLoaded = true;
    //       this.loadedCount++;
    //       this.onProgress();
    //       this.onLoad(this.assetsDict[key]);
    //     }
    //   );
    // });
  }

  // protected abstract loadItem(
  //   name: string,
  //   path: string,
  //   callback: Function
  // ): T;
  protected abstract loadItem(config: AssetConfig, onLoadCallback: Function): T;

  protected onLoad(asset: T) {
    // call back when an asset is loaded
  }

  protected onProgress() {
    this.progressCallback(this.getProgress);

    if (this.loadedCount === this.totalCount) {
      this.isDone = true;
      this.onComplete();
    }
  }

  protected onComplete() {
    // when loaded
    this.loadedCallback();
  }

  public getProgress(): number {
    return this.loadedCount / this.totalCount;
  }

  public isLoaded(): boolean {
    return this.isDone;
  }

  public addLoadedListener(callback = () => {}) {
    this.loadedCallback = callback;
  }

  public addProgressListener(callback = (progress: number) => {}) {
    this.progressCallback = callback;
  }
}

interface AssetEntry {
  path: string;
  name: string;
  isLoaded: boolean;
  reference: any;
}
