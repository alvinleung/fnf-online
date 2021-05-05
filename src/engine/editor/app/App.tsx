import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import "./style/typography.css";
import "./style/layout.css";
import "./style/variables.css";
import { Panel } from "./components/Panel";
import { List } from "./components/List";
import { ListItem } from "./components/ListItem";
import { EntityInspectorHead } from "./components/EntityInspectorHead";
import { CollapsableSection } from "./components/CollapsableSection";
import { v3 } from "twgl.js";
import { Game } from "../../Game";
import { Component, ComponentClass, Entity } from "../../ecs";
import * as EditorDecorators from "../EditorDecorators";
import { ValueEditor } from "./components/valueEditor/ValueEditor";
import useForceUpdate from "./hooks/useForceUpdate";

interface Props {
  game: Game;
}

const App = ({ game }: Props): JSX.Element => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity>();
  const editableComponent = useMemo(
    () => EditorDecorators.getEditableComponentMap(),
    []
  );

  const handleEntityAdded = (entity: Entity) => {
    setEntities([...entities, entity]);
  };
  const handleEntityRemoved = (entity: Entity) => {
    setEntities(entities.splice(entities.indexOf(entity), 1));
  };

  const handleEntityListSelect = (val: string) => {
    const selectedEntity = game.getEntityById(val);
    setSelectedEntity(selectedEntity);
  };

  const handleEntityValueUpdate = (
    entity: Entity,
    currentComponent: Component,
    field: any,
    val: any
  ) => {
    currentComponent[field] = val;
  };

  const forceUpdate = useForceUpdate();
  const handleEngineUpdate = useCallback(
    (game: Game, _delta: number) => {
      // force update the ui if we are inspecting a particular entity
      if (selectedEntity) forceUpdate();
    },
    [selectedEntity]
  );
  useEffect(() => {
    game.onUpdate(handleEngineUpdate);
  }, [selectedEntity]);

  // add and remove entity in the list when notified
  useEffect(() => {
    game.addEntityListener({
      onEntityAdded: handleEntityAdded,
      onEntityRemoved: handleEntityRemoved,
    });
  }, []);

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

  return (
    <>
      <Panel
        header="Entity List"
        dockingSide="left"
        minSize={150}
        initialState="collapsed"
      >
        <List onSelect={handleEntityListSelect}>
          {game.entities.map((entity, index) => {
            return (
              <ListItem value={entity.id as string} key={index}>
                {entity.id as string}
              </ListItem>
            );
          })}
        </List>
      </Panel>
      <Panel dockingSide="right" initialState="collapsed">
        <EntityInspectorHead
          selectedEntity={selectedEntity && (selectedEntity.id as string)}
        />
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
                    handleEntityValueUpdate(
                      selectedEntity,
                      componentInstance,
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
      </Panel>
    </>
  );
};

function camelCaseToSentenceCase(text: string) {
  const result = text.replace(/([A-Z])/g, " $1");
  const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
  return finalResult;
}

export default App;
