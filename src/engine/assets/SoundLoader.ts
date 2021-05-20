import { Image } from "../graphics/Image/Image";
import Sound from "../sounds/Sound";
import { AssetConfig, AssetLoader } from "./AssetLoader";

export class SoundLoader extends AssetLoader<Sound> {
  // implements loading function
  protected loadItem({ name, path }: AssetConfig): Promise<Sound> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(path);
      audio.addEventListener("canplaythrough", () => {
        // return the factory instance
        resolve(new Sound(name, path, audio));
      });
      audio.addEventListener("error", () => reject);
    });
  }
}
