import { Image } from "../graphics/Image/Image";
import Sound from "../sounds/Sound";
import { AssetConfig, AssetLoader } from "./AssetLoader";

export class SoundLoader extends AssetLoader<Sound> {
  // implements loading function
  protected loadItem({ name, path }: AssetConfig, onLoad: Function) {
    const audio = new Audio(path);
    audio.addEventListener("canplaythrough", () => {
      onLoad();
    });

    // return the factory instance
    return new Sound(name, path, audio);
  }
}
