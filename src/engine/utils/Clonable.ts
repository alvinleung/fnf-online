import lodashCloneDeep from "lodash.clonedeep";

//https://gist.github.com/GeorgeGkas/36f7a7f9a9641c2115a11d58233ebed2
/**
 * @function
 * @description Deep clone a class instance.
 * @param {object} instance The class instance you want to clone.
 * @returns {object} A new cloned instance.
 */
export function deepCloneClass(instance) {
  // const newInstance = Object.assign(
  //   Object.create(
  //     // Set the prototype of the new object to the prototype of the instance.
  //     // Used to allow new object behave like class instance.
  //     Object.getPrototypeOf(instance)
  //   )
  //   // Prevent shallow copies of nested structures like arrays, etc
  //   JSON.parse(JSON.stringify(instance))
  // );
  return lodashCloneDeep(instance);
}

export interface IClonable<T> {
  clone(): T;
}
export abstract class Clonable<T> implements IClonable<T> {
  clone(): T {
    return deepCloneClass(this) as T;
  }
}
