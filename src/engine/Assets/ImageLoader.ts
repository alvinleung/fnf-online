import AssetLoader from "./AssetLoader";

class ImageLoader extends AssetLoader<HTMLImageElement> {
  // implements loading function
  protected loadItem(path: string, onLoad: Function) {
    const image = document.createElement("img");
    image.src = path;
    image.addEventListener("load", onLoad.bind(this));

    // return the factory instance
    return image;
  }
}

export default ImageLoader;
