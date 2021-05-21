import { Asset } from "../../assets";

export class ShaderSet implements Asset {
  path: string;
  name: string;
  fragmentShader: string;
  vertexShader: string;

  public static createEmpty() {
    const shaderSet = new ShaderSet();
    shaderSet.fragmentShader = "";
    shaderSet.vertexShader = "";
    shaderSet.name = "empty-shader";
    shaderSet.path = "";

    return shaderSet;
  }

  public static create(name: string, path: string, fragmentShader: string, vertexShader: string) {
    const shaderSet = new ShaderSet();
    shaderSet.fragmentShader = fragmentShader;
    shaderSet.vertexShader = vertexShader;
    shaderSet.name = name;
    shaderSet.path = path;

    return shaderSet;
  }
}
