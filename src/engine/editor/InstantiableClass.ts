import { S_IFREG } from "node:constants";
import { Editor } from "./EditorDecorators";

type ClassEntry = {
  name: string;
  category: string;
  classConstructor: Function;
  fields: {
    [fieldName: string]: FieldEntry;
  };
};

type FieldEntry = {
  name: string;
  type: Editor;
  defaultValue: any;
  category: Object;
};

type ClassRegistry = {
  [className: string]: ClassEntry;
};

/**
 * Decorator function to declare an Instantiable Class
 */
export function InstantiableClass(classCategory?: string) {
  // category of class
  return function (target: Function) {
    InstantiableClassRegistry.addClassIfEmpty(
      target.name,
      target,
      classCategory
    );
  };
}

/**
 * Decorator function declaring a field
 */
export function Field<T>(
  type: Editor,
  options?: { defaultValue?: T; category?: any }
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor?: PropertyDescriptor
  ) {
    // extrect the editor information
    const ownerConstructor = target.constructor;
    const ownerClassName = target.constructor.name;
    const fieldName = propertyKey;

    const fieldEntry: FieldEntry = {
      name: fieldName,
      type: type,
      defaultValue: options && options.defaultValue,
      category: options && options.category,
    };

    InstantiableClassRegistry.addClassIfEmpty(ownerClassName, ownerConstructor);
    InstantiableClassRegistry.addFieldToClass(ownerClassName, fieldEntry);
  };
}

/**
 * Export API for the registry
 */
export module InstantiableClassRegistry {
  // record for all the instantiable class
  const registry: ClassRegistry = {};

  export function getClassConstructor(className: string): any {
    if (!registry[className]) {
      console.warn(
        `Unable to get constructor: class "${className}" does not exists on the registry.`
      );
      return;
    }
    return registry[className].classConstructor;
  }

  export function getFields(className: string): FieldEntry[] {
    if (!registry[className]) {
      console.warn(
        `Unable to get field: class "${className}" does not exists on the registry.`
      );
      return;
    }
    return Object.values(registry[className].fields);
  }

  export function getClassesByCategory(category: string): ClassEntry[] {
    return Object.values(registry).filter(
      (classEntry) => classEntry.category === category
    );
  }
  export function getAllClasses(): ClassEntry[] {
    return Object.values(registry);
  }

  export function getClass(className: string): ClassEntry {
    return registry[className];
  }

  export function hasClass(className: string): boolean {
    return registry[className] ? true : false;
  }

  export function getRegistry(): ClassRegistry {
    return Object.freeze(registry);
  }

  export function updateInstanceValue<T>(instance: T, updateValues: Object): T {
    Object.keys(updateValues).forEach((fieldName) => {
      instance[fieldName] = updateValues[fieldName];
    });
    return instance;
  }

  export function addClassIfEmpty(
    className: string,
    classConstructor: Function,
    classCategory?: string
  ) {
    if (!registry[className]) {
      const newEntry = {
        name: className,
        classConstructor: classConstructor,
        category: classCategory,
        fields: {},
      };
      registry[className] = newEntry;
      return;
    }

    // only update the category if the class already exist
    // when the user declare a class category in the class
    registry[className].category = classCategory;
  }

  export function addFieldToClass(className: string, field: FieldEntry) {
    if (registry[className].fields[field.name]) {
      throw new Error(`Field ${field} already exist in ${className}`);
    }
    registry[className].fields[field.name] = field;
  }
}
