import React, { useEffect, useMemo, useState } from "react";
import {
  getInstantiableObjects,
  getObjectDefaultParams,
  isInstantiableObject,
} from "../../../EditorDecorators";
import { DropDownItem } from "../DropDownSelect/DropDownItem";
import { DropDownSelect } from "../DropDownSelect/DropDownSelect";
import { ValueEditor } from "./ValueEditor";

interface Props {
  name: string; // the name of the field
  value: any; // current instance we are editing
  onChange: (val: any) => void; // call back when there is change
}

export const InstanceEditor = ({ name, value, onChange }: Props) => {
  // check if instance in the record of instantiable object

  const objectList = getInstantiableObjects();
  const instanceName = value && value.constructor && value.constructor.name;
  const instanceConstructorParams =
    objectList[instanceName] && objectList[instanceName].constructorParams;

  // values we guess the instance is having by checking the name in constructor and the instance
  const inferredValues = useMemo(() => {
    if (!instanceConstructorParams) return;

    return Object.keys(instanceConstructorParams).map((name, index) => {
      // Attempt accesing the value by inferring the current constructor value name
      const inferredValue = value[name]; //

      return {
        key: name,
        value: inferredValue || instanceConstructorParams[name].defaultValue,
        type: instanceConstructorParams[name].editor,
      };
    });
  }, [name, value, instanceConstructorParams]);

  // current config before being edited
  const beforeEditedConfig = useMemo(() => {
    if (!inferredValues) return;

    const inferredConfig = {};
    inferredValues.forEach(({ key, value }) => {
      inferredConfig[key] = value;
    });

    return inferredConfig;
  }, [inferredValues]);

  const [afterEditConfig, setAfterEditConfig] = useState(beforeEditedConfig);

  // send the update to the engine if there is change
  useEffect(() => {
    if (
      !instanceConstructorParams ||
      !afterEditConfig ||
      !isInstantiableObject(instanceName)
    )
      return;

    // check if there are changes, if not then return
    const isNotSame = inferredValues.some(({ key, value }) => {
      return afterEditConfig[key] !== value;
    });
    //
    if (!isNotSame) return;

    // perform check to make sure the new value is valid
    const configKeys = Object.keys(afterEditConfig);

    const valid = !configKeys.some((v: string, index) => {
      const isEmpty = v === null || v === undefined;
      const isDifferentKey = v !== inferredValues[index].key;

      return isEmpty || isDifferentKey;
    });
    if (!valid) return;

    // create a config that combines the old one with the changes
    const params = { ...beforeEditedConfig, ...afterEditConfig };

    const newInst = getNewInstance(instanceName, Object.values(params));

    // update the change
    onChange && onChange(newInst);
  }, [afterEditConfig, inferredValues]);

  /**
   * For the user selecting a new type in the library
   */
  const [selectedInstanceType, setSelectedInstanceType] = useState(
    instanceName
  );

  /**
   * When the user selected a new type
   */
  useEffect(() => {
    // only instantiate a new type there is actual change in instance type
    if (selectedInstanceType === instanceName) return;

    // make sure the selected type is valid
    if (
      !selectedInstanceType ||
      selectedInstanceType === "" ||
      !isInstantiableObject(selectedInstanceType)
    )
      return;

    const instanceParams = getObjectDefaultParams(selectedInstanceType);
    const newInstance = getNewInstance(selectedInstanceType, instanceParams);

    onChange && onChange(newInstance);
  }, [selectedInstanceType]);

  const alternativeInstancePicker = () => (
    <DropDownSelect
      selected={selectedInstanceType}
      onSelect={(val) => setSelectedInstanceType(val)}
    >
      {Object.keys(objectList).map((key, index) => {
        return (
          <DropDownItem key={index} value={key}>
            {key}
          </DropDownItem>
        );
      })}
    </DropDownSelect>
  );

  return (
    <>
      <div className="value-editor">
        <div className="value-editor__label">{name}</div>

        {/* for newly created renderable component */}
        {value === undefined && alternativeInstancePicker()}

        {/* for unsupported component */}
        {!instanceConstructorParams && (
          <>
            {alternativeInstancePicker()}
            <div
              style={{
                fontSize: "12px",
                marginTop: "var(--spacing-s)",
                opacity: 0.4,
              }}
            >
              Editing "{instanceName}" is not currently supported.
            </div>
          </>
        )}

        {/* for editing component */}
        {inferredValues && (
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                marginBottom: "var(--spacing-s)",
              }}
            >
              {alternativeInstancePicker()}
            </div>
            <div style={{ paddingLeft: "1rem" }}>
              {inferredValues.map(({ key, value, type }, index) => {
                // Attempt accesing the value by inferring the current constructor value name
                // const inferredValue = value[name];

                return (
                  <ValueEditor
                    key={index}
                    fieldName={key}
                    fieldType={type}
                    value={value}
                    onChange={(val) =>
                      setAfterEditConfig({ ...beforeEditedConfig, [key]: val })
                    }
                  />
                );
              })}
            </div>
          </div>
        )}
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
