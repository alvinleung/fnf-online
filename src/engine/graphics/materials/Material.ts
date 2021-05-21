export abstract class Material {
  public aliasMapping: { [name: string]: string } = { a: "b" };

  public get(variableName: string): any {
    return this[variableName];
  }
}
