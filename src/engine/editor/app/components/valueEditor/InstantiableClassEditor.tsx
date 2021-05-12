import React, { useCallback, useEffect, useMemo, useState } from "react";
import { InstantiableClassRegistry } from "../../../InstantiableClass";
import { DropDownItem } from "../DropDownSelect/DropDownItem";
import { DropDownSelect } from "../DropDownSelect/DropDownSelect";
import { ValueEditor } from "./ValueEditor";

interface Props {
  name: string; // the name of the field
  value: any; // current instance we are editing
  onChange: (val: any) => void; // call back when there is change
  config: any;
}

export const InstantiableClassEditor = ({
  name,
  value,
  onChange,
  config,
}: Props) => {
  const currentInstance = value;

  const hasSpecifiedCategory = config && config.category;

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
    () =>
      selectedClassName &&
      InstantiableClassRegistry.getFields(currentInstanceClassName),
    [selectedClassName, value]
  );

  const handleFieldChange = (fieldName: string, val: any) => {
    // handle the changes on the instance
    currentInstance[fieldName] = val;

    onChange && onChange(currentInstance);
  };

  useEffect(() => {
    if (!selectedClassName) return;

    // only create new instance when the user pick new object
    // or the system is instantiating a new object itself
    if (
      currentInstance &&
      selectedClassName === currentInstance.constructor.name
    )
      return;

    // if instance is changed, then create a new instance
    const classConstructor =
      InstantiableClassRegistry.getClassConstructor(selectedClassName);

    // abort if constructor not found
    if (!classConstructor) return;

    // create a new instance of the class
    const newInstance = new classConstructor();

    // init the instance with some initial values
    const fields = InstantiableClassRegistry.getFields(selectedClassName);
    fields.forEach((fieldEntry) => {
      if (fieldEntry.defaultValue)
        newInstance[fieldEntry.name] = fieldEntry.defaultValue;
    });

    onChange && onChange(newInstance);
  }, [selectedClassName]);

  const classPicker = () => (
    <DropDownSelect
      selected={selectedClassName}
      onSelect={(val) => setSelectedClassName(val)}
    >
      {instantiableClasses.reduce((dropDownItems, classEntry, index) => {
        if (
          !hasSpecifiedCategory || // add all items if no category specified
          (hasSpecifiedCategory && classEntry.category === config.category) // filter out category if category is specified
        ) {
          dropDownItems.push(
            <DropDownItem key={index} value={classEntry.name}>
              {classEntry.name}
            </DropDownItem>
          );
        }
        return dropDownItems;
      }, [])}
    </DropDownSelect>
  );

  return (
    <>
      <div className="value-editor">
        <div className="value-editor__label">
          {name}{" "}
          {hasSpecifiedCategory && (
            <span className="value-editor__description">
              Value: {config.category}
            </span>
          )}
        </div>
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
                {currentInstanceClassName &&
                  `Editing class instance "${currentInstanceClassName}" is not currently supported.`}
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
                    config={{ category: field.category }}
                    value={fieldCurrentValue || field.defaultValue}
                    onChange={(val: any) => handleFieldChange(field.name, val)}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
};
