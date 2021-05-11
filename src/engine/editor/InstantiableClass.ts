import { S_IFREG } from "node:constants";
import { Editor } from "./EditorDecorators";

type ClassEntry = {
  name: string;
  catagory: string;
  classConstructor: Function;
  fields: {
    [fieldName: string]: FieldEntry;
  };
};

type FieldEntry = {
  name: string;
  type: Editor;
  defaultValue: any;
};

type ClassRegistry = {
  [className: string]: ClassEntry;
};

/**
 * Decorator function to declare an Instantiable Class
 */
export function InstantiableClass(classCatagory?: string) {
  // catagory of class
  return function (target: Function) {
    InstantiableClassRegistry.addClassIfEmpty(
      target.name,
      target,
      classCatagory
    );
  };
}

/**
 * Decorator function declaring a field
 */
export function Field<T>(type: Editor, defaultValue?: T) {
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
      defaultValue: defaultValue,
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
    return registry[className].classConstructor;
  }

  export function getFields(className: string): FieldEntry[] {
    if (!registry[className]) {
      console.error(`Class "${className}" does not exists on the registry.`);
      return;
    }
    return Object.values(registry[className].fields);
  }

  export function getClassesByCatagory(catagory: string): ClassEntry[] {
    return Object.values(registry).filter(
      (classEntry) => classEntry.catagory === catagory
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
    classCatagory?: string
  ) {
    if (!registry[className]) {
      const newEntry = {
        name: className,
        classConstructor: classConstructor,
        catagory: classCatagory,
        fields: {},
      };
      registry[className] = newEntry;
      return;
    }

    // only update the catagory if the class already exist
    // when the user declare a class catagory in the class
    registry[className].catagory = classCatagory;
  }

  export function addFieldToClass(className: string, field: FieldEntry) {
    if (registry[className].fields[field.name]) {
      throw new Error(`Field ${field} already exist in ${className}`);
    }
    registry[className].fields[field.name] = field;
  }
}
