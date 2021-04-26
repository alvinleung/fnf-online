abstract class AssetLoader<T> {
  private assetsDict: { [name: string]: Asset } = {};
  private loadedCount: number = 0;
  private totalCount: number = 0;
  private isDone: boolean = false;

  private loadedCallback: Function = () => {};
  private progressCallback: Function = () => {};

  public add(name: string, path: string) {
    this.assetsDict[name] = {
      path: path,
      isLoaded: false,
      reference: null,
    };
    this.totalCount++;
  }

  public get(name: string): T {
    const ref = this.assetsDict[name].reference as T;
    if (!ref) console.warn(`Asset "${name}" not found`);
    return ref;
  }

  public getAssetDictionary(): { [name: string]: Asset } {
    return this.assetsDict;
  }

  public loadAll() {
    Object.keys(this.assetsDict).forEach((key) => {
      this.assetsDict[key].reference = this.loadItem(
        this.assetsDict[key].path,
        () => {
          this.onLoad(key);
        }
      );
    });
  }

  protected abstract loadItem(path: string, callback: Function): T;
  protected onLoad(name: string) {
    this.assetsDict[name].isLoaded = true;
    this.loadedCount++;
    this.onProgress();
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

interface Asset {
  path: string;
  isLoaded: boolean;
  reference: any;
}

export default AssetLoader;
