abstract class AssetLoader {
  private assetList: Array<IAsset> = new Array<IAsset>();

  public add(path: string) {
    this.assetList.push({
      path: path,
      loaded: false,
    });
  }
  public loadAll() {}
}

interface IAsset {
  path: string;
  loaded: boolean;
}

export { AssetLoader, IAsset };
