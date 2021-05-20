import { Asset } from "../../assets";

export interface ShaderSet extends Asset {
  fragmentShader: string;
  vertexShader: string;
}
