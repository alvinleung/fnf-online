import { ShaderSet } from "../shader/ShaderSet";

export abstract class Material {
  public aliasMapping: { [name: string]: string } = { a: "b" };
  public shader: ShaderSet = ShaderSet.createEmpty();

  public get(variableName: string): any {
    return this[variableName];
  }
}
