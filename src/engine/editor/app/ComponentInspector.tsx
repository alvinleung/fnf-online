import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  useSelectedEntity,
} from "./EditorContextWrapper";
import { DropDownSelect } from "./components/DropDownSelect/DropDownSelect";
import { DropDownItem } from "./components/DropDownSelect/DropDownItem";
import { useEditHistory } from "./EditHistory";
import lodashCloneDeep from "lodash.clonedeep";
import { AssetExplorer } from "./components/AssetExplorer/AssetExplorer";
import { Modal } from "./components/Modal";
import useForceUpdate from "./hooks/useForceUpdate";
import hasPropChanged from "./hooks/hasPropChanged";
import { useEntityEditing } from "./hooks/useEntityEditing";
import { ContextMenu, MenuItem } from "react-contextmenu";

export const ComponentInspector = () => {
  const [editHistory, pushEditHistory] = useEditHistory();
  const game = useGameContext();
  const [selectedEntity, setSelectedEntity] = useSelectedEntity();

  // get the informaiton of component whne component changed
  const selectedEntityComponent = useMemo(() => {
    if (!selectedEntity || !game.getEntityById(selectedEntity.id as string)) return;

    const componentList = game.getEntityById(selectedEntity.id as string).listComponents();
    const editableComponentList = componentList.filter((c) => {
      if (ComponentRegistry.isComponentEditable(c)) {
        return true;
      }
    });

    return editableComponentList;
  }, [selectedEntity, editHistory]); // use edit history to trigger the component change update

  const forceUpdate = useForceUpdate();

  const onEntityValueUpdate = (
    liveComponentInstance: ComponentClass<any>,
    field: any,
    val: any
  ) => {
    if (liveComponentInstance[field] === val) return;

    const beforeValue = liveComponentInstance[field];

    // write change to the in game component field value
    liveComponentInstance[field] = val;

    pushEditHistory(
      {
        type: "componentFieldChange",
        component: liveComponentInstance,
        field: field,
        beforeValue: beforeValue,
        value: val,
      },
      200 // push change every 200 milisec
    );

    // force reflect the change when field change
    forceUpdate();
  };

  const handleComponentSelection = (component: string) => {
    componentContext.setSelectedComponent(component);
  };

  const inspectorContainerRef = useRef();
  useClickOutside(
    inspectorContainerRef,
    () => {
      componentContext.setSelectedComponent("");
    },
    true
  );

  /**
   * For creating new component
   */
  const componentContext = useComponentContext();
  const [isCreatingComponent, setIsCreatingComponent] = useState(false);
  useEffect(() => {
    if (componentContext.selectedComponent === "New Component") setIsCreatingComponent(true);
  }, [componentContext, isCreatingComponent]);

  const { addComponent, removeComponent } = useEntityEditing(game);
  const handleComponentAdd = (componentName: string) => {
    addComponent(selectedEntity, componentName);

    // select the newly created entity
    componentContext.setSelectedComponent(componentName);
    setIsCreatingComponent(false);
  };
  const handleDismissComponentCreation = () => {
    // handle dismiss component creation
    componentContext.setSelectedComponent("");
    setIsCreatingComponent(false);
  };

  const handleComponentRemove = () => {
    removeComponent(selectedEntity, componentContext.selectedComponent);
  };

  return (
    <div ref={inspectorContainerRef}>
      {selectedEntityComponent &&
        selectedEntityComponent.map((componentInstance, index) => {
          if (!componentInstance) return <div>No editable fields in this component</div>;

          const fields = ComponentRegistry.getComponentEditableFields(componentInstance);
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
              <CollapsableSection header={camelCaseToSentenceCase(componentName)}>
                {fieldNames.map((fieldName, index) => {
                  const field = ComponentRegistry.getComponentFieldEditor(
                    componentInstance,
                    fieldName
                  );
                  const currentComponent = selectedEntity.getComponent(
                    ComponentRegistry.getComponentClass(componentName)
                  );
                  const currentComponentVal = currentComponent[fieldName];
                  const handleEditorValueChange = (val) => {
                    onEntityValueUpdate(componentInstance as ComponentClass<any>, fieldName, val);
                  };
                  return (
                    <ValueEditor
                      fieldName={fieldName}
                      fieldType={field.editor}
                      value={currentComponentVal}
                      key={`${index}-${selectedEntity.id}`}
                      onChange={handleEditorValueChange}
                      config={field.config}
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
          onSelect={(val) => handleComponentAdd(val)}
          focus={true}
          onBlur={handleDismissComponentCreation}
        >
          {Object.keys(ComponentRegistry.getEditableComponentMap()).map((componentName, index) => {
            return (
              <DropDownItem value={componentName} key={index}>
                {componentName}
              </DropDownItem>
            );
          })}
        </DropDownSelect>
      )}

      {selectedEntity && (
        <ContextMenu id="entity-component-inspector">
          <MenuItem onClick={() => componentContext.setSelectedComponent("New Component")}>
            Add Component
          </MenuItem>

          {componentContext.selectedComponent !== "" && (
            <>
              <MenuItem divider={true} />
              <MenuItem onClick={handleComponentRemove}>
                Remove "{componentContext.selectedComponent}"
              </MenuItem>
            </>
          )}
        </ContextMenu>
      )}
    </div>
  );
};
