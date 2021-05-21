import { ShaderSet } from "../graphics/shader/ShaderSet";
import { AssetConfig, AssetLoader } from "./AssetLoader";

export class ShaderSetLoader extends AssetLoader<ShaderSet> {
  // implements loading function
  protected async loadItem({ name, path }: AssetConfig) {
    // get shader string from asset server
    const fragStr = await (await fetch(path + ".frag")).text();
    const vertStr = await (await fetch(path + ".vert")).text();
    // return the factory instance
    return ShaderSet.create(name, path, fragStr, vertStr);
  }
}
