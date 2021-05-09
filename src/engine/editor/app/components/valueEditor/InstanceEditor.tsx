import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { getInstantiableObjects } from "../../../EditorDecorators";
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
  const instanceName = value.constructor.name;
  const instanceConstructorParams =
    objectList[instanceName] && objectList[instanceName].constructorParams;

  const [instanceConfig, setInstanceConfig] = useState({});

  useEffect(() => {
    // check instnace config item are valid
    const valid = !Object.values(instanceConfig).some((v) => v === null);
    if (!valid) return;

    // create instsance
    const insts = getInstantiableObjects();
    //@ts-ignore
    const newInst = new insts[instanceName].constructor(
      ...Object.values(instanceConfig)
    );

    // update the change
    onChange && onChange(newInst);
  }, [instanceConfig]);

  useEffect(() => {
    const insts = getInstantiableObjects();
    setObjectList(insts);
  }, [value]);

  const [isVisible, showModal, hideModal] = useModal();

  return (
    <>
      <div className="value-editor">
        <div className="value-editor__label">{name}</div>
        <motion.button
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
        </motion.button>
      </div>

      {instanceConstructorParams && (
        <Modal isVisible={isVisible} onHide={hideModal}>
          <h2>Edit {instanceName}</h2>

          {!instanceConstructorParams && (
            <div>Editing {instanceName} is not currently supported.</div>
          )}

          {instanceConstructorParams &&
            Object.keys(instanceConstructorParams).map((name, index) => {
              return (
                <div className="field" key={index}>
                  <ValueEditor
                    fieldName={name}
                    fieldType={instanceConstructorParams[name]}
                    value={null}
                    onChange={(val) =>
                      setInstanceConfig({ ...instanceConfig, [name]: val })
                    }
                  />
                </div>
              );
            })}

          <div className="field field--no-stretch">
            <button className="btn-primary" onClick={hideModal}>
              Save
            </button>
            <button className="btn-secondary" onClick={hideModal}>
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};
