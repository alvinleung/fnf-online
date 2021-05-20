import { ShaderSet } from "../graphics/shader/ShaderSet";
import { AssetConfig, AssetLoader } from "./AssetLoader";

export class ShaderSetLoader extends AssetLoader<ShaderSet> {
  // implements loading function
  protected async loadItem({ name, path }: AssetConfig) {
    const shaderSet: ShaderSet = {
      fragmentShader: "str",
      vertexShader: "str",
      path: path,
      name: name,
    };

    // get shader string from asset server
    const fragStr = await (await fetch(path + ".frag")).text();
    const vertStr = await (await fetch(path + ".vert")).text();

    shaderSet.fragmentShader = fragStr;
    shaderSet.vertexShader = vertStr;

    // return the factory instance
    return shaderSet;
  }
}
