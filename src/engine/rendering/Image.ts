export default class Image {
  public readonly elm: HTMLImageElement;
  constructor(elm: HTMLImageElement) {
    this.elm = elm;
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
}
