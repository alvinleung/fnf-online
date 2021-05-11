import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getInstantiableObjects,
  getObjectDefaultParams,
  isInstantiableObject,
} from "../../../EditorDecorators";
import {
  InstantiableClass,
  InstantiableClassRegistry,
} from "../../../InstantiableClass";
import { DropDownItem } from "../DropDownSelect/DropDownItem";
import { DropDownSelect } from "../DropDownSelect/DropDownSelect";
import { ValueEditor } from "./ValueEditor";

interface Props {
  name: string; // the name of the field
  value: any; // current instance we are editing
  onChange: (val: any) => void; // call back when there is change
}

export const InstanceClassEditor = ({ name, value, onChange }: Props) => {
  const currentInstance = value;

  // check if instance in the record of instantiable object
  const instantiableClasses = useMemo(
    () => InstantiableClassRegistry.getAllClasses(),
    []
  );

  const currentInstanceClassName =
    value && value.constructor && value.constructor.name;
  const [selectedClassName, setSelectedClassName] = useState(
    currentInstanceClassName
  );

  const currentInstanceFields = useMemo(
    () => InstantiableClassRegistry.getFields(currentInstanceClassName),
    [value]
  );

  const handleFieldChange = (fieldName: string, val: any) => {
    // handle the changes on the instance
    currentInstance[fieldName] = val;

    console.log(currentInstance);

    onChange && onChange(currentInstance);
  };

  useEffect(() => {
    if (selectedClassName === currentInstance.constructor.name) return;

    // if instance is changed, then create a new instance
    const classConstructor =
      InstantiableClassRegistry.getClassConstructor(selectedClassName);

    // create a new instance of the class
    const newInstance = new classConstructor();

    // init the instance with some initial values
    const fields = InstantiableClassRegistry.getFields(selectedClassName);
    fields.forEach((fieldEntry) => {
      newInstance[fieldEntry.name] = fieldEntry.defaultValue;
    });

    onChange && onChange(newInstance);
  }, [selectedClassName]);

  const classPicker = () => (
    <DropDownSelect
      selected={selectedClassName}
      onSelect={(val) => setSelectedClassName(val)}
    >
      {instantiableClasses.map((classEntry, index) => {
        return (
          <DropDownItem key={index} value={classEntry.name}>
            {classEntry.name}
          </DropDownItem>
        );
      })}
    </DropDownSelect>
  );

  return (
    <>
      <div className="value-editor">
        <div className="value-editor__label">{name}</div>
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginBottom: "var(--spacing-s)",
            }}
          >
            {classPicker()}
          </div>

          {/* for the cases where instance is not currently supported */}
          {!currentInstanceFields && (
            <>
              <div
                style={{
                  fontSize: "12px",
                  marginTop: "var(--spacing-s)",
                  opacity: 0.4,
                }}
              >
                Editing "{currentInstanceClassName}" is not currently supported.
              </div>
            </>
          )}

          {/* Display the editing options */}
          <div style={{ paddingLeft: "1rem" }}>
            {currentInstanceFields &&
              currentInstanceFields.map((field, index) => {
                const fieldCurrentValue =
                  currentInstance && currentInstance[field.name];
                return (
                  <ValueEditor
                    key={index}
                    fieldName={field.name}
                    fieldType={field.type}
                    value={fieldCurrentValue || field.defaultValue}
                    onChange={(val) => handleFieldChange(field.name, val)}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Create an instance base on the constructor stored in the registry
 * @param instanceName
 * @param params
 * @returns
 */
const getNewInstance = (instanceName: string, params: any[]) => {
  // get the instance constructor
  const instanceClass = getInstantiableObjects()[instanceName];

  // instantiate a new object to reflect the changes
  //@ts-ignore
  const newInst = new instanceClass.constructor(...params);

  return newInst;
};
