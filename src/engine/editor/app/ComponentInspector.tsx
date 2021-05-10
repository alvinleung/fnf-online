import React, { useCallback, useRef } from "react";
import { Component, ComponentClass, Entity } from "../../ecs";
import { Game } from "../../Game";
import { CollapsableSection } from "./components/CollapsableSection";
import { ValueEditor } from "./components/valueEditor/ValueEditor";
import * as EditorDecorators from "../EditorDecorators";
import { camelCaseToSentenceCase } from "../../utils/StringUtils";
import useClickOutside from "./hooks/useClickOutside";

interface Props {
  selectedEntity?: Entity;
  game: Game;
  onSelectComponent?: (component: string) => void;
}

export const ComponentInspector = ({
  selectedEntity,
  game,
  onSelectComponent,
}: Props) => {
  // get the informaiton of component whne component changed
  const getEntityComponent = useCallback(() => {
    if (!selectedEntity || !game.getEntityById(selectedEntity.id as string))
      return;

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

  const handleComponentSelection = (component: string) => {
    onSelectComponent && onSelectComponent(component);
  };

  const inspectorContainerRef = useRef();
  useClickOutside(
    inspectorContainerRef,
    () => {
      onSelectComponent("");
    },
    true
  );

  return (
    <div ref={inspectorContainerRef}>
      {getEntityComponent() &&
        getEntityComponent().map((componentInstance, index) => {
          if (!componentInstance)
            return <div>No editable fields in this component</div>;

          const fields = EditorDecorators.getComponentEditableFields(
            componentInstance
          );
          const componentName = componentInstance.constructor.name;
          const fieldNames = Object.keys(fields);

          const handleUseInteractWithComponent = () => {
            handleComponentSelection(componentName);
          };

          return (
            <div
              onContextMenu={handleUseInteractWithComponent}
              onMouseDown={handleUseInteractWithComponent}
            >
              <CollapsableSection
                key={index}
                header={camelCaseToSentenceCase(componentName)}
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
                      key={`${index}-${selectedEntity.id}`}
                      onChange={handleEditorValueChange}
                    />
                  );
                })}
              </CollapsableSection>
            </div>
          );
        })}
    </div>
  );
};
