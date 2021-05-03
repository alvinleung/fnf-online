import { TransformComponent } from "../core/TransformComponent";

 // for getting all the public properties
 function getPublicProperties(obj: any): string[] {
    const result = [];
    for (let property in obj) {
      if (obj.hasOwnProperty(property) && !property.startsWith('_')) {
        result.push(property);
      }
    }
    return result;
  }

  // It is "setters" when property descriptors "configurable" is "true"
  const fields = getEditableFields(TransformComponent);

  function getEditableFields(component:any) {
    const publicProps = getPublicProperties(new component());
    const propsDescriptors = Object.getOwnPropertyDescriptors(component.prototype);
    const gettersSetters = Object.keys(propsDescriptors).filter((propName) =>{
      const currentProp = propsDescriptors[propName];
      if(!currentProp.writable)
        return propName;
    });

    const editableFields = [...publicProps, ...gettersSetters];
    return editableFields;
  }