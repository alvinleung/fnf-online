import { Image } from "../graphics/image/Image";
import { AssetConfig, AssetLoader } from "./AssetLoader";

export class ImageLoader extends AssetLoader<Image> {
  // implements loading function
  protected loadItem({ name, path }: AssetConfig): Promise<Image> {
    return new Promise((resolve, reject) => {
      const image = document.createElement("img");
      image.src = path;

      image.addEventListener("load", () => {
        // return the factory instance
        resolve(new Image(name, path, image));
      });
      image.addEventListener("error", () => reject);
    });
  }
}
