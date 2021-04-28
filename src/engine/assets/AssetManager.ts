import { SoundLoader } from "./SoundLoader";
import { ImageLoader } from "./ImageLoader";

export interface AssetManager {
  image: ImageLoader;
  sound: SoundLoader;
}
