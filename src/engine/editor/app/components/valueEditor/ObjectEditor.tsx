import React, { useCallback, useEffect, useRef, useState } from "react";
import { Editor } from "../../..";
import { ValueEditor } from "./ValueEditor";

import "./ObjectEditor.css";
import useClickOutside from "../../hooks/useClickOutside";
import { useHotkeys } from "react-hotkeys-hook";
import { HotkeyConfig } from "../../Hotkeys";

interface Props {
  name: string; // the name of the field
  value: any; // current instance we are editing
  onChange: (val: any) => void; // call back when there is change
  config: any;
}

interface FieldConfig {
  name: string;
  defaultValue: string;
  type: Editor;
}

const ADD_BUTTON = require("url:../../images/add.svg");
const REMOVE_BUTTON = require("url:../../images/remove.svg");

export const ObjectEditor = ({ value, name, onChange, config }: Props) => {
  const fieldConfig = config && (config.fieldsInEachEntry as FieldConfig[]);
  const currentObject = value;

  const containerRef = useRef();

  const [entriesArray, setEntriesArray] = useState<{ key: string; value: any }[]>([]);
  const [newItemCount, setNewItemCount] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    setSelectedEntry(null);
  }, [value]);

  useClickOutside(containerRef, () => {
    setSelectedEntry(null);
  });

  useHotkeys(
    HotkeyConfig.DELETE,
    () => {
      handleItemRemove(entriesArray[selectedEntry].key);
      setSelectedEntry(null);
    },
    [entriesArray, selectedEntry, currentObject]
  );

  // rebuild the entry array when we have new value coming from the engine
  useEffect(() => {
    const keyAndValueArr = Object.keys(currentObject).map((entryKey) => {
      return {
        key: entryKey,
        value: currentObject[entryKey],
      };
    });
    setEntriesArray(keyAndValueArr);
  }, [value]);

  const buildObjectFromEntriesArray = (entriesArray) => {
    let obj = {};
    entriesArray.forEach((entry) => {
      obj[entry.key] = entry.value;
    });

    return obj;
  };

  const handleEntryNameChange = (index: number, newName: string) => {
    entriesArray[index].key = newName;
    const newObj = buildObjectFromEntriesArray(entriesArray);

    // copy the ref to the new one de-reference the old one
    onChange && onChange(newObj);
  };

  const handleEntryFieldChange = useCallback(
    (entryName: string, fieldName: string, newValue: any) => {
      if (!currentObject[entryName]) currentObject[entryName] = {};

      currentObject[entryName][fieldName] = newValue;
      onChange && onChange({ ...currentObject });
    },
    [currentObject]
  );

  const handleItemAdd = () => {
    const newObject = {};

    fieldConfig.forEach((fieldEntryConfig) => {
      if (fieldEntryConfig.defaultValue) {
        newObject[fieldEntryConfig.name] = fieldEntryConfig.defaultValue;
      }
    });

    currentObject["New Item " + newItemCount] = newObject;
    setNewItemCount(newItemCount + 1);

    onChange && onChange({ ...currentObject });
  };

  const handleItemRemove = useCallback(
    (itemName: string) => {
      // delete an item in the real value
      delete currentObject[itemName];

      // Because we are editing the referece, technically we
      // dont have to trigger change. But we still call onChange
      // for consistency sake
      onChange && onChange({ ...currentObject });
    },
    [currentObject]
  );

  return (
    <div className="value-editor" ref={containerRef}>
      <div className="value-editor__label">
        {name}
        <button className="value-editor__button-icon" onClick={handleItemAdd}>
          Add Entry <img src={ADD_BUTTON} />
        </button>
      </div>
      <div className="object-editor">
        {/* Render lookup table values here */}
        {Object.keys(currentObject).map((currentObjectKey, index) => {
          const entry = currentObject[currentObjectKey];

          // for each editable entry in the object
          const fieldEditors = fieldConfig.map((fieldEntryConfig, index) => {
            return (
              <ValueEditor
                key={index}
                fieldName={fieldEntryConfig.name}
                fieldType={fieldEntryConfig.type}
                value={entry[fieldEntryConfig.name]}
                onChange={(val) => {
                  handleEntryFieldChange(currentObjectKey, fieldEntryConfig.name, val);
                }}
              />
            );
          });

          return (
            <div
              className={
                selectedEntry === index
                  ? "object-editor__field object-editor__field--selected"
                  : "object-editor__field"
              }
              key={index}
              onClick={() => {
                setSelectedEntry(index);
              }}
            >
              <div className="object-editor__field-header">
                <input
                  type="text"
                  value={currentObjectKey}
                  onChange={(e) => {
                    // make sure that the name is not exist in the curent entry
                    if (!currentObject[e.target.value])
                      handleEntryNameChange(index, e.target.value);
                    else
                      alert(
                        `"${e.target.value}" already exist in the list! Please select another name for the key.`
                      );
                  }}
                  className="object-editor__label-editor"
                />
                <button
                  className="value-editor__button-icon"
                  onClick={() => {
                    handleItemRemove(currentObjectKey);
                  }}
                >
                  <img src={REMOVE_BUTTON} />
                </button>
              </div>
              {fieldEditors}
            </div>
          );
        })}
      </div>
    </div>
  );
};
