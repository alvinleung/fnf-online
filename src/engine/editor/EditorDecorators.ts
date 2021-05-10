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
      [paramName: string]: {
        editor: Editor;
        defaultValue: any;
      };
    };
    constructor: Function;
    constructorValueNames: string[];
  };
}

const instantiableObjects: InstantiableObjectMap = {};
/**
 * Decorator for classes that are unrelated to an entity to be editable
 */
function InstantiableObject(config: { type: Editor; defaultValue: any }[]) {
  const constructorVaribleTypes: Editor[] = config.map((entry) => {
    return entry.type;
  });
  const constructorDefaultValues: Editor[] = config.map((entry) => {
    return entry.defaultValue;
  });

  return function (constructor: Function) {
    const paramNames = getParamNames(constructor);
    const className = constructor.name;
    instantiableObjects[className] = {
      ...instantiableObjects[className],
      constructorParams: {},
      constructor: constructor,
    };

    paramNames.forEach((paramName, index) => {
      instantiableObjects[className].constructorParams[paramName] = {
        editor: constructorVaribleTypes[index],
        defaultValue: constructorDefaultValues[index],
      };
    });
  };
}
function ObjectField(type: Editor) {
  return function (
    target: any,
    propertyKey: string,
    descriptor?: PropertyDescriptor
  ) {
    return;
    // extrect the editor information
    const className = target.constructor.name;
    const fieldName = propertyKey;

    // use the Editable data
    if (
      !instantiableObjects[className] &&
      !instantiableObjects[className].constructorValueNames
    ) {
      //@ts-ignore
      instantiableObjects[className] = {
        ...instantiableObjects[className],
        constructorValueNames: [],
      };
    }

    // put the entr
    instantiableObjects[className].constructorValueNames.push(fieldName);

    console.log(instantiableObjects);
  };
}

function getInstantiableObjects() {
  return Object.freeze(instantiableObjects);
}

function getObjectDefaultParams(className: string) {
  return Object.values(instantiableObjects[className].constructorParams).map(
    ({ defaultValue }) => {
      return defaultValue;
    }
  );
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
  ObjectField,
  getObjectDefaultParams,
};
