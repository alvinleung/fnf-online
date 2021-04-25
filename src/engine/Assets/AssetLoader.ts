abstract class AssetLoader<T> {
  private assetsDict: { [name: string]: Asset };
  private loadedCount: number = 0;
  private totalCount: number = 0;
  private isDone: boolean = false;

  public add(name: string, path: string) {
    this.assetsDict[name] = {
      path: path,
      loaded: false,
      reference: null,
    };
    this.totalCount++;
  }

  public get(name: string): T {
    return this.assetsDict[name].reference;
  }

  public loadAll() {
    Object.keys(this.assetsDict).forEach((key) => {
      this.loadItem(this.assetsDict[key].path, this.onLoad.bind(this));
    });
  }

  protected abstract loadItem(path: string, callback: Function): T;
  protected onLoad(name: string) {
    this.assetsDict[name].loaded = true;
    this.loadedCount++;

    this.onProgress();
  }

  protected onProgress() {
    if (this.loadedCount === this.totalCount) {
      this.isDone = true;
      this.onComplete();
    }
  }

  protected onComplete() {
    // when loaded
  }

  public getProgress(): number {
    return this.loadedCount / this.totalCount;
  }

  public isLoaded(): boolean {
    return this.isDone;
  }
}

interface Asset {
  path: string;
  loaded: boolean;
  reference: any;
}

export default AssetLoader;
