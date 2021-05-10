import { motion } from "framer-motion";
import { element } from "prop-types";
import React, { useEffect, useMemo, useState } from "react";
import { camelCaseToSentenceCase } from "../../../../utils/StringUtils";
import { getInstantiableObjects } from "../../../EditorDecorators";
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

  const inferredValues = useMemo(() => {
    if (!instanceConstructorParams) return;

    return Object.keys(instanceConstructorParams).map((name, index) => {
      // Attempt accesing the value by inferring the current constructor value name
      const inferredValue = value[name];
      return {
        key: name,
        value: inferredValue,
        type: instanceConstructorParams[name],
      };
    });
  }, [name, value, instanceConstructorParams]);

  const inferredConfig = useMemo(() => {
    if (!inferredValues) return;

    let inferredConfig = {};
    inferredValues.forEach(({ key, value }) => {
      inferredConfig[key] = value;
    });

    return inferredConfig;
  }, [inferredValues]);

  const [instanceConfig, setInstanceConfig] = useState(inferredConfig);

  useEffect(() => {
    setInstanceConfig({});
  }, [name]);

  useEffect(() => {
    if (!instanceConstructorParams || !instanceConfig) return;

    // check if there are changes, if not then return
    const isNotSame = inferredValues.some(({ key, value }) => {
      return instanceConfig[key] !== value;
    });
    //
    if (!isNotSame) return;

    // perform check to make sure the new value is valid
    const configKeys = Object.keys(instanceConfig);

    const valid = !configKeys.some((v: string, index) => {
      const isEmpty = v === null || v === undefined;
      const isDifferentKey = v !== inferredValues[index].key;

      return isEmpty || isDifferentKey;
    });
    if (!valid) return;

    // create a config that combines the old one with the changes
    const params = { ...inferredConfig, ...instanceConfig };

    // get the instance constructor
    const instanceClass = getInstantiableObjects()[instanceName];

    // instantiate a new object to reflect the changes
    //@ts-ignore
    const newInst = new instanceClass.constructor(...Object.values(params));

    // update the change
    onChange && onChange(newInst);
  }, [instanceConfig, inferredValues]);

  useEffect(() => {
    const insts = getInstantiableObjects();
    setObjectList(insts);
  }, []);

  const [isVisible, showModal, hideModal] = useModal();

  return (
    <>
      <div className="value-editor">
        <div className="value-editor__label">{name}</div>
        {/* <motion.button
          style={{
            width: "100%",
            backgroundColor: "var(--clr-bg-lighter)",
            borderRadius: "4px",
            border: "1px solid rgba(255,255,255, .2)",
            color: "var(--clr-text)",
            padding: ".5rem",
          }}
          whileHover={{
            border: "1px solid rgba(255,255,255, .5)",
          }}
          onClick={() => showModal()}
        >
          {instanceName}
        </motion.button> */}
        <CollapsableSection header={camelCaseToSentenceCase(instanceName)}>
          {!instanceConstructorParams && (
            <div>Editing {instanceName} is not currently supported.</div>
          )}

          {inferredValues && (
            <div>
              {inferredValues.map(({ key, value, type }, index) => {
                // Attempt accesing the value by inferring the current constructor value name
                // const inferredValue = value[name];
                // console.log(inferredConfig);

                return (
                  <ValueEditor
                    fieldName={key}
                    fieldType={type}
                    value={value}
                    onChange={(val) =>
                      setInstanceConfig({ ...inferredConfig, [key]: val })
                    }
                  />
                );
              })}
            </div>
          )}
        </CollapsableSection>
      </div>

      {/* <Modal isVisible={isVisible} onHide={hideModal}>
        <h2>Edit {instanceName}</h2>

        {!instanceConstructorParams && (
          <div>Editing {instanceName} is not currently supported.</div>
        )}

        {inferredValues && (
          <div>
            {inferredValues.map(({ key, value, type }, index) => {
              // Attempt accesing the value by inferring the current constructor value name
              // const inferredValue = value[name];
              // console.log(inferredConfig);

              return (
                <div className="field" key={index}>
                  <ValueEditor
                    fieldName={key}
                    fieldType={type}
                    value={value}
                    onChange={(val) =>
                      setInstanceConfig({ ...inferredConfig, [key]: val })
                    }
                  />
                </div>
              );
            })}
          </div>
        )}
      </Modal> */}
    </>
  );
};
