import { Component, ComponentClass } from "../ecs";

/**
 * Editable Map Structure
 * {
 *   TransformComponent: {
 *     position: Editor.VECTOR,
 *     scale: Editor.VECTOR,
 *     rotation: Editor.QUATERNION,
 *   },
 *   ...
 * }
 */
interface ComponentField {
  [propsName: string]: {
    editor: Editor;
    config: Object;
  };
}
interface EditableComponentMap {
  [componentName: string]: ComponentField;
}
const editableMap: EditableComponentMap = {};
const editableComponentClassRefs = {};

/**
 * Decorator to declare a level editor editable component
 * @param target
 * @param propertyKey
 * @param descriptor
 */
function EditableComponent(constructor: Function) {
  if (!editableComponentClassRefs[constructor.name])
    editableComponentClassRefs[constructor.name] = constructor;
  if (!editableMap[constructor.name]) editableMap[constructor.name] = {};
}

/**
 * Decorator Factory function to declare a level editor editable component property
 * @param type
 * @returns
 */
function EditableField(type: Editor, config?: Object) {
  return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
    // extrect the editor information
    const componentName = target.constructor.name;
    const propName = propertyKey;

    // use the Editable data

    // create an entry for the component if it doesn't exit
    const propOwnerComponent = editableMap[componentName];
    if (!propOwnerComponent) {
      editableMap[componentName] = {};
    }

    // put the entry
    editableMap[componentName][propName] = {
      editor: type,
      config: config,
    };
    editableComponentClassRefs[componentName] = target.constructor;
  };
}

//https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically
//The following function will return an array of the parameter names of any function passed in
function getParamNames(func: Function) {
  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
  var ARGUMENT_NAMES = /([^\s,]+)/g;
  var fnStr = func.toString().replace(STRIP_COMMENTS, "");
  var result = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(ARGUMENT_NAMES);
  if (result === null) result = [];
  return result;
}

export module ComponentRegistry {
  export function getEditableComponentMap(): {
    [name: string]: ComponentField;
  } {
    return Object.freeze({ ...editableMap });
  }

  export function isComponentEditable(componentClass): boolean {
    return editableComponentClassRefs[componentClass.constructor.name] ? true : false;
  }

  export function getComponentEditableFields(componentClass: Component) {
    return editableMap[componentClass.constructor.name];
  }

  export function getComponentFieldEditor(componentClass: Component, fieldName: string) {
    return editableMap[componentClass.constructor.name][fieldName];
  }

  export function getComponentClass(className: string): ComponentClass<any> {
    return editableComponentClassRefs[className];
  }
}

enum Editor {
  VECTOR = "vector",
  ROTATION = "rotation",
  STRING = "string",
  NUMBER = "number",
  INTEGER = "int",
  BOOLEAN = "boolean",
  RGBA = "rgba",
  CLASS = "class",
  ENTITY = "entity",
  SOURCE_CODE = "code",
  INSTANCE = "instance",
  RESOURCE_IMAGE = "image",
  FUNCTION = "function",
  ARRAY = "array",
  ARRAY_NUMBER = "array-number",
  OBJECT = "object",
}

export { EditableField, EditableComponent, Editor };
