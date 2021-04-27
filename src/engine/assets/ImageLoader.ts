import { Image } from "../graphics/Image/Image";
import { AssetLoader } from "./AssetLoader";

export class ImageLoader extends AssetLoader<Image> {
  // implements loading function
  protected loadItem(name: string, path: string, onLoad: Function) {
    const image = document.createElement("img");
    image.src = path;
    image.addEventListener("load", onLoad.bind(this));

    // return the factory instance
    return new Image(name, path, image);
  }
}