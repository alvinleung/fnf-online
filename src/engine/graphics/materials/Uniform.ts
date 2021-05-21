import { MaterialManager } from "./MaterialManager";

/**
 * Decorator function to declare a shader variable in Material
 * @param type
 * @param nameInShader
 * @returns
 */

export function Uniform(type: number, nameInShader?: string): any {
  return function (target: any, property: string, descriptor: PropertyDescriptor) {
    const parent = target.constructor.name;
    MaterialManager.getInstance().addMaterialVariable(parent, property, type, nameInShader);
    return descriptor;
  };
}
