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
import { VectorEditor } from "./components/valueEditor/VectorEditor";
import { v3 } from "twgl.js";
import { BooleanEditor } from "./components/valueEditor/BooleanEditor";
import { RotationEditor } from "./components/valueEditor/RotationEditor";
import { NumberEditor } from "./components/valueEditor/NumberEditor";
import { ColorEditor } from "./components/valueEditor/ColorEditor";
import { Game } from "../../Game";
import { Component, Entity } from "../../ecs";
import * as EditorDecorators from "../EditorDecorators";
import { TransformComponent } from "../../core/TransformComponent";
import { ValueEditor } from "./components/valueEditor/ValueEditor";

interface Props {
  game: Game;
}

const App = ({ game }: Props) => {
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

  // add and remove component in the list when notified
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

                  return (
                    <ValueEditor
                      fieldName={fieldName}
                      fieldType={fieldType}
                      value={currentComponentVal}
                      key={index}
                    />
                  );
                })}
              </CollapsableSection>
            );
          })}

        {/* <CollapsableSection header="Component Name">
          <VectorEditor name="Position" initialValue={[9, 9, 2]} />
          <VectorEditor name="Scale" initialValue={[9, 9, 2]} />
          <RotationEditor name="Rotation" initialValue={[9, 9, 2]} />
          <NumberEditor name="23455" initialValue={2} />
          <BooleanEditor name="test" initialValue={false} />
        </CollapsableSection>
        <CollapsableSection header="Renderable Component">
          <BooleanEditor name="Enable" initialValue={false} />
          <ColorEditor name="Color" />
        </CollapsableSection>
        <CollapsableSection header="Renderable Component">
          <BooleanEditor name="Enable" initialValue={false} />
          <ColorEditor name="Color" />
          <ColorEditor name="Color" />
          <ColorEditor name="Color" />
          <ColorEditor
            name="Color"
            initialValue={{ r: 1, g: 1, b: 1, a: 0.5 }}
          />
        </CollapsableSection> */}
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
