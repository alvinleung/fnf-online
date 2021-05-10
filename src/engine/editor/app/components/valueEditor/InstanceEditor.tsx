import { motion } from "framer-motion";
import { element } from "prop-types";
import React, { useEffect, useMemo, useState } from "react";
import { camelCaseToSentenceCase } from "../../../../utils/StringUtils";
import {
  getInstantiableObjects,
  getObjectDefaultParams,
  isInstantiableObject,
} from "../../../EditorDecorators";
import { DropDownItem } from "../../DropDownSelect/DropDownItem";
import { DropDownSelect } from "../../DropDownSelect/DropDownSelect";
import { CollapsableSection } from "../CollapsableSection";
import { List } from "../List";
import { ListItem } from "../ListItem";
import { Modal } from "../Modal";
import useModal from "../Modal/useModal";
import { ValueEditor } from "./ValueEditor";

interface Props {
  name: string;
  value: any;
  onChange: (val) => void;
}

export const InstanceEditor = ({ name, value, onChange }: Props) => {
  // check if instance in the record of instantiable object

  const [objectList, setObjectList] = useState({});
  const instanceName = value && value.constructor && value.constructor.name;
  const instanceConstructorParams =
    objectList[instanceName] && objectList[instanceName].constructorParams;

  // values we guess the instance is having by checking the name in constructor and the instance
  const inferredValues = useMemo(() => {
    if (!instanceConstructorParams) return;

    return Object.keys(instanceConstructorParams).map((name, index) => {
      // Attempt accesing the value by inferring the current constructor value name
      const inferredValue = value[name];
      return {
        key: name,
        value: inferredValue || instanceConstructorParams[name].value,
        type: instanceConstructorParams[name].editor,
      };
    });
  }, [name, value, instanceConstructorParams]);

  // current config before being edited
  const beforeEditedConfig = useMemo(() => {
    if (!inferredValues) return;

    let inferredConfig = {};
    inferredValues.forEach(({ key, value }) => {
      inferredConfig[key] = value;
    });

    return inferredConfig;
  }, [inferredValues]);

  const [afterEditConfig, setAfterEditConfig] = useState(beforeEditedConfig);

  // change the configured instance value to the new one when inspecting different instance
  useEffect(() => {
    setAfterEditConfig({});
  }, [name]);

  const getNewInstance = (instanceName: string, params: any[]) => {
    // get the instance constructor
    const instanceClass = getInstantiableObjects()[instanceName];

    // instantiate a new object to reflect the changes
    //@ts-ignore
    const newInst = new instanceClass.constructor(...params);

    return newInst;
  };

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

  useEffect(() => {
    const insts = getInstantiableObjects();
    setObjectList(insts);
  }, []);

  const [selectedInstanceType, setselectedInstanceType] = useState(
    instanceName
  );
  const fullList = Object.keys(objectList);
  const [filteredList, setFilteredList] = useState(fullList);
  const handleInstanceListFilter = (val: string) => {
    if (val === "") {
      setFilteredList(fullList);
      return;
    }
    const filteredList = fullList.filter((name: string) => {
      return name.includes(val);
    });
    setFilteredList(filteredList);
  };
  const handleInstanceSelect = (selectedInstanceName: string) => {
    setselectedInstanceType(selectedInstanceName);
  };

  useEffect(() => {
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

  return (
    <>
      <div className="value-editor">
        <div className="value-editor__label">{name}</div>
        {!instanceConstructorParams && (
          <div>Editing {instanceName} is not currently supported.</div>
        )}

        {inferredValues && (
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                marginBottom: "var(--spacing-s)",
              }}
            >
              <DropDownSelect
                selectedValue={selectedInstanceType}
                onFilter={handleInstanceListFilter}
              >
                {filteredList.map((key, index) => {
                  return (
                    <DropDownItem
                      key={index}
                      value={key}
                      selected={key === selectedInstanceType}
                      onSelect={handleInstanceSelect}
                    >
                      {key}
                    </DropDownItem>
                  );
                })}
              </DropDownSelect>
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
