import Asset from "../../Assets/Asset";

export default class Image implements Asset {
  public readonly elm: HTMLImageElement;
  public readonly path: string;
  public readonly name: string;

  constructor(name: string, path: string, elm: HTMLImageElement) {
    this.elm = elm;
    this.path = path;
    this.name = name;
  }

  public get width() {
    return this.elm.width;
  }

  public set width(val: number) {
    this.elm.width = val;
  }

  public get height() {
    return this.elm.width;
  }

  public set height(val: number) {
    this.elm.width = val;
  }

  public get isLoaded(): boolean {
    return this.elm.complete;
  }
}
