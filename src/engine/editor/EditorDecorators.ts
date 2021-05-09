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
  [propsName: string]: Editor;
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
function EditableField(type: Editor) {
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
    editableComponentClassRefs[componentName] = target.constructor;
  };
}

/** fields of instantiableClass */
interface InstantiableObjectMap {
  [className: string]: {
    constructorParams: {
      [paramName: string]: Editor;
    };
    constructor: Function;
  };
}

const instantiableObjects: InstantiableObjectMap = {};
/**
 * Decorator for classes that are unrelated to an entity to be editable
 */
function InstantiableObject(...constructorVaribleTypes: Editor[]) {
  return function (constructor: Function) {
    const paramNames = getParamNames(constructor);
    const className = constructor.name;
    instantiableObjects[className] = {
      constructorParams: {},
      constructor: constructor,
    };

    paramNames.forEach((paramName, index) => {
      instantiableObjects[className].constructorParams[paramName] =
        constructorVaribleTypes[index];
    });
  };
}

function getInstantiableObjects() {
  return Object.freeze(instantiableObjects);
}

//https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically
//The following function will return an array of the parameter names of any function passed in
function getParamNames(func: Function) {
  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
  var ARGUMENT_NAMES = /([^\s,]+)/g;
  var fnStr = func.toString().replace(STRIP_COMMENTS, "");
  var result = fnStr
    .slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")"))
    .match(ARGUMENT_NAMES);
  if (result === null) result = [];
  return result;
}

function getEditableComponentMap(): { [name: string]: ComponentField } {
  return Object.freeze({ ...editableMap });
}

function isComponentEditable(componentClass): boolean {
  return editableComponentClassRefs[componentClass.constructor.name]
    ? true
    : false;
}

function getComponentEditableFields(componentClass: Component) {
  return editableMap[componentClass.constructor.name];
}

function getComponentFieldEditor(componentClass: Component, fieldName: string) {
  return editableMap[componentClass.constructor.name][fieldName];
}

function getComponentClass(className: string) {
  return editableComponentClassRefs[className];
}

enum Editor {
  VECTOR,
  ROTATION,
  STRING,
  NUMBER,
  BOOLEAN,
  RGBA,
  CLASS,
  ENTITY,
  SOURCE_CODE,
  INSTANCE,
  RESOURCE_IMAGE,
  FUNCTION,
}

export {
  EditableField,
  EditableComponent,
  Editor,
  getEditableComponentMap,
  getComponentClass,
  isComponentEditable,
  getComponentEditableFields,
  getComponentFieldEditor,
  InstantiableObject,
  getInstantiableObjects,
};
