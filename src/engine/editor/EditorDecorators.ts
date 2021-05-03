interface ComponentField {
  [propsName: string]: Editor;
}

/**
 * Structure
 * {
 *   TransformComponent: {
 *     position: Editor.VECTOR,
 *     scale: Editor.VECTOR,
 *     rotation: Editor.QUATERNION,
 *   },
 *   ...
 * }
 */
const editableMap: { [name: string]: ComponentField } = {};

/**
 * Decorator Factory function to declare a level editor editable component property
 * @param type
 * @returns
 */
export function Editable(type: Editor) {
  return function (
    target: any,
    propertyKey: string,
    descriptor?: PropertyDescriptor
  ) {
    // extrect the editor information
    const componentName = target.constructor.name;
    const propName = propertyKey;

    // use the Editable data

    // create an entry for the component if it doesn't exit
    const propOwnerComponent = editableMap[componentName];
    if (!propOwnerComponent) {
      editableMap[componentName] = {};
    }

    // put the entr
    editableMap[componentName][propName] = type;
  };
}

export function getEditableComponentMap() {
  return Object.freeze({ ...editableMap });
}

export enum Editor {
  VECTOR,
  QUATERNION,
  STRING,
  NUMBER,
  BOOLEAN,
  CLASS,
  SOURCE_CODE,
}
