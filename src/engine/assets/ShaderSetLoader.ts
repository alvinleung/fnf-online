import { ShaderSet } from "../graphics/Materials/ShaderManager";
import { AssetConfig, AssetLoader } from "./AssetLoader";

export class ShaderSetLoader extends AssetLoader<ShaderSet> {
  // implements loading function
  protected loadItem({ name, path }: AssetConfig, onLoad: Function) {
    const shaderSet: ShaderSet = {
      fragmentShader: "str",
      vertexShader: "str",
      path: path,
      name: name
    }

    // get shader string from asset server 
    async function fetchShaders() {
      const fragStr = await(await fetch(path+".frag")).text();
      const vertStr = await(await fetch(path+".vert")).text();

      shaderSet.fragmentShader = fragStr;
      shaderSet.vertexShader = vertStr;

      //callback to notify loading complete
      onLoad()
    }

    fetchShaders();

    // return the factory instance
    return shaderSet;
  }
}
