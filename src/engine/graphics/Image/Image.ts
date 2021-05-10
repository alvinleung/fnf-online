import { Asset } from "../../assets";

export class Image implements Asset {
  public readonly elm: HTMLImageElement;
  public readonly path: string;
  public readonly name: string;
  public readonly useSmoothScaling: boolean;

  public static createEmpty(): Image {
    return new Image("", "", document.createElement("img"), false);
  }

  constructor(
    name: string,
    path: string,
    elm: HTMLImageElement,
    useSmoothScaling = false
  ) {
    this.elm = elm;
    this.path = path;
    this.name = name;
    this.useSmoothScaling = useSmoothScaling;
  }

  public get width() {
    return this.elm.width;
  }

  public set width(val: number) {
    this.elm.width = val;
  }

  public get height() {
    return this.elm.height;
  }

  public set height(val: number) {
    this.elm.width = val;
  }
}
