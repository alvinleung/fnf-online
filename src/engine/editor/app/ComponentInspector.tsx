import React, { useCallback } from "react";
import { Component, ComponentClass, Entity } from "../../ecs";
import { Game } from "../../Game";
import { CollapsableSection } from "./components/CollapsableSection";
import { ValueEditor } from "./components/valueEditor/ValueEditor";
import * as EditorDecorators from "../EditorDecorators";

interface Props {
  selectedEntity: Entity;
  game: Game;
}

export const ComponentInspector = ({ selectedEntity, game }: Props) => {
  // get the informaiton of component whne component changed
  const getEntityComponent = useCallback(() => {
    if (!selectedEntity) return;

    const componentList = game
      .getEntityById(selectedEntity.id as string)
      .listComponents();
    const editableComponentList = componentList.filter((c) => {
      if (EditorDecorators.isComponentEditable(c)) {
        return true;
      }
    });

    return editableComponentList;
  }, [selectedEntity]);

  const onEntityValueUpdate = (
    liveComponentInstance: ComponentClass<any>,
    field: any,
    val: any
  ) => {
    // write change to the in game component field value
    liveComponentInstance[field] = val;
  };

  return (
    <>
      {getEntityComponent() &&
        getEntityComponent().map((componentInstance, index) => {
          if (!componentInstance)
            return <div>No editable fields in this component</div>;

          const fields = EditorDecorators.getComponentEditableFields(
            componentInstance
          );
          const componentName = componentInstance.constructor.name;
          const fieldNames = Object.keys(fields);
          return (
            <CollapsableSection
              key={index}
              header={camelCaseToSentenceCase(
                componentInstance.constructor.name
              )}
            >
              {fieldNames.map((fieldName, index) => {
                const fieldType = EditorDecorators.getComponentFieldEditor(
                  componentInstance,
                  fieldName
                );
                const currentComponent = selectedEntity.getComponent(
                  EditorDecorators.getComponentClass(componentName)
                );
                const currentComponentVal = currentComponent[fieldName];
                const handleEditorValueChange = (val) => {
                  onEntityValueUpdate(
                    componentInstance as ComponentClass<any>,
                    fieldName,
                    val
                  );
                };

                return (
                  <ValueEditor
                    fieldName={fieldName}
                    fieldType={fieldType}
                    value={currentComponentVal}
                    key={index}
                    onChange={handleEditorValueChange}
                  />
                );
              })}
            </CollapsableSection>
          );
        })}
    </>
  );
};

function camelCaseToSentenceCase(text: string) {
  const result = text.replace(/([A-Z])/g, " $1");
  const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
  return finalResult;
}
