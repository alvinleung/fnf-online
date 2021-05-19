import { Editor, Field, Instantiable } from "../../editor";

export class MaterialProperties {}

@Instantiable("Materials")
export class Materials {
  @Field(Editor.OBJECT, {
    config: {
      fieldsInEachEntry: [{ name: "Property", editor: Editor.CLASS }],
    },
  })
  private properties = {};

  public getProperty<T extends MaterialProperties>(name: string): T {
    return this.properties[name];
  }

  public addProperty<T extends MaterialProperties>(name: string, val: T) {
    if (!this.properties[name]) {
      this.properties[name] = val;
    }
    return this;
  }
  public editProperty<T extends MaterialProperties>(name: string, val: T) {
    this.properties[name] = val;
    return this;
  }
  public hasProperty(name: string): boolean {
    if (this.properties[name]) {
      return true;
    } else {
      return false;
    }
  }
}