import Asset from "../../Assets/Asset";

interface SpriteSheetConfig {
  frameRate: number;
  frameWidth: number;
  frameHeight: number;
}

export default class SpriteSheet implements Asset, SpriteSheetConfig {
  public readonly elm: HTMLImageElement;
  public readonly path: string;
  public readonly name: string;

  public readonly frameRate: number;
  public readonly frameWidth: number;
  public readonly frameHeight: number;

  constructor(
    name: string,
    path: string,
    elm: HTMLImageElement,
    config: SpriteSheetConfig
  ) {
    this.elm = elm;
    this.path = path;
    this.name = name;

    this.frameRate = config.frameRate;
    this.frameWidth = config.frameWidth;
    this.frameHeight = config.frameHeight;
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
