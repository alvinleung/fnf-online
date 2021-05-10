import React, { useCallback, useEffect, useRef, useState } from "react";
import { Component, ComponentClass, Entity } from "../../ecs";
import { Game } from "../../Game";
import { CollapsableSection } from "./components/CollapsableSection";
import { ValueEditor } from "./components/valueEditor/ValueEditor";
import { ComponentRegistry } from "../EditorDecorators";
import { camelCaseToSentenceCase } from "../../utils/StringUtils";
import useClickOutside from "./hooks/useClickOutside";
import {
  useComponentContext,
  useEntityContext,
  useGameContext,
} from "./EditorContextWrapper";
import { DropDownSelect } from "./components/DropDownSelect/DropDownSelect";
import { DropDownItem } from "./components/DropDownSelect/DropDownItem";

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
      if (ComponentRegistry.isComponentEditable(c)) {
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

  /**
   * For creating new component
   */
  const componentContext = useComponentContext();
  const entityContext = useEntityContext();
  const [isCreatingComponent, setIsCreatingComponent] = useState(false);
  useEffect(() => {
    if (componentContext.selectedComponent === "New Component")
      setIsCreatingComponent(true);
  }, [componentContext, isCreatingComponent]);

  const handleComponentCreation = (componentName: string) => {
    // create component and select the component
    const componentClass = ComponentRegistry.getComponentClass(componentName);
    entityContext.selectedEntity.useComponent(componentClass);

    // select the newly created entity
    componentContext.setSelectedComponent(componentName);
    setIsCreatingComponent(false);
  };
  const handleDismissComponentCreation = () => {
    // handle dismiss component creation
    componentContext.setSelectedComponent("");
    setIsCreatingComponent(false);
  };

  return (
    <div ref={inspectorContainerRef}>
      {getEntityComponent() &&
        getEntityComponent().map((componentInstance, index) => {
          if (!componentInstance)
            return <div>No editable fields in this component</div>;

          const fields = ComponentRegistry.getComponentEditableFields(
            componentInstance
          );
          const componentName = componentInstance.constructor.name;
          const fieldNames = Object.keys(fields);

          const handleUseInteractWithComponent = () => {
            handleComponentSelection(componentName);
          };

          return (
            <div
              key={index}
              onContextMenu={handleUseInteractWithComponent}
              onMouseDown={handleUseInteractWithComponent}
            >
              <CollapsableSection
                header={camelCaseToSentenceCase(componentName)}
              >
                {fieldNames.map((fieldName, index) => {
                  const fieldType = ComponentRegistry.getComponentFieldEditor(
                    componentInstance,
                    fieldName
                  );
                  const currentComponent = selectedEntity.getComponent(
                    ComponentRegistry.getComponentClass(componentName)
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
      {isCreatingComponent && (
        <DropDownSelect
          selected={""}
          onSelect={(val) => handleComponentCreation(val)}
          focus={true}
          onBlur={handleDismissComponentCreation}
        >
          {Object.keys(ComponentRegistry.getEditableComponentMap()).map(
            (componentName) => {
              return (
                <DropDownItem value={componentName}>
                  {componentName}
                </DropDownItem>
              );
            }
          )}
        </DropDownSelect>
      )}
    </div>
  );
};
