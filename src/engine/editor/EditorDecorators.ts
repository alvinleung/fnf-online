/**
 * Decorator Factory function to configure a component field
 * @param type
 * @returns
 */
export function Editable(type: Editor) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // do something
  };
}

export enum Editor {
  VECTOR,
  QUATERNION,
  STRING,
  NUMBER,
  CLASS,
  CODE,
}
