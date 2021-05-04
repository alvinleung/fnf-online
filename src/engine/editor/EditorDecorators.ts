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
const editableMap: { [name: string]: ComponentField } = {};

/**
 * Decorator Factory function to declare a level editor editable component property
 * @param type
 * @returns
 */
function Editable(type: Editor) {
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

    if (type == Editor.FUNCTION) {
      // log the function variables name
      console.log(getParamNames(target[propertyKey]));
    }

    // put the entr
    editableMap[componentName][propName] = type;
  };
}

//https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically
//The following function will return an array of the parameter names of any function passed in
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, "");
  var result = fnStr
    .slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")"))
    .match(ARGUMENT_NAMES);
  if (result === null) result = [];
  return result;
}

function getEditableComponentMap() {
  return Object.freeze({ ...editableMap });
}

enum Editor {
  VECTOR,
  QUATERNION,
  STRING,
  NUMBER,
  BOOLEAN,
  RGBA,
  CLASS,
  ENTITY,
  SOURCE_CODE,
  INSTANCE,
  FUNCTION,
}

export { Editable, Editor, getEditableComponentMap };
