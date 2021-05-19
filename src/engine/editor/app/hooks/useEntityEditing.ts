import { ComponentRegistry } from "../..";
import { TransformComponent } from "../../../core/TransformComponent";
import { Component, ComponentClass, Entity } from "../../../ecs";
import { Game } from "../../../Game";
import { useEditHistory } from "../EditHistory";

export const useEntityEditing = (game: Game) => {
  const [editHistory, pushEditHistory] = useEditHistory();

  const createEntity = (entityId: string) => {
    if (!entityId) return;

    const newEntity = Entity.create(entityId);

    // add transform component
    newEntity.useComponent(TransformComponent);

    // when the entity create
    game.addEntity(newEntity);

    pushEditHistory({
      type: "add",
      entity: newEntity.clone(),
      index: game.getEntityIndex(newEntity),
    });

    return newEntity;
  };

  const deleteEntity = (entityId: string) => {
    const entityToBeRemoved = game.getEntityById(entityId);
    const removeIndex = game.removeEntity(entityToBeRemoved);

    // add remove action to history
    pushEditHistory({
      type: "remove",
      entity: entityToBeRemoved.clone(),
      index: removeIndex,
    });
  };

  const duplicateEntity = (entityId: string) => {
    const newEntity = game.getEntityById(entityId).clone();

    const trailingNumberRegex = /\d+$/;
    const originalEntityId = newEntity.id as string;

    // check how many entity in the scene
    let finalId = originalEntityId;
    let loopCount = 1;

    // try increment the entity id until no entity occupies that name
    while (game.getEntityById(finalId)) {
      const originalEntityCountArr = originalEntityId.match(trailingNumberRegex);
      const entityCount = originalEntityCountArr && originalEntityCountArr[0];
      // if entityCount is null means that the entity doesn not use a number
      // incremental naming scheme, it is save to set nubmer 1
      const newEntityTrailingNumber = !entityCount
        ? `${loopCount}`
        : `${Number(entityCount) + loopCount}`;

      finalId = !entityCount
        ? originalEntityId + newEntityTrailingNumber
        : originalEntityId.replace(trailingNumberRegex, newEntityTrailingNumber);

      loopCount++;
    }

    console.log(game.getEntityById(finalId));

    newEntity.id = finalId;
    game.addEntity(newEntity);

    pushEditHistory({
      type: "add",
      entity: newEntity.clone(),
      index: game.getEntityIndex(newEntity),
    });

    return newEntity;
  };

  const removeComponent = (selectedEntity: Entity, componentName: string) => {
    const componentClass = ComponentRegistry.getComponentClass(componentName);
    // remove the current component in the
    selectedEntity.removeComponent(componentClass);

    pushEditHistory({
      type: "componentRemove",
      entity: selectedEntity,
      component: componentClass,
    });
  };

  const addComponent = (selectedEntity: Entity, componentName: string) => {
    // create component and select the component
    const componentClass = ComponentRegistry.getComponentClass(componentName);
    selectedEntity.useComponent(componentClass);

    pushEditHistory({
      type: "componentAdd",
      entity: selectedEntity,
      component: componentClass,
    });
  };

  const changeEntityId = (selectedEntity: Entity, newId: string) => {
    const entity = game.getEntityById(selectedEntity.id as string);
    const oldEntity = entity.clone();
    const changedEntity = game.changeEntityId(newId, entity);

    pushEditHistory({
      type: "idChange",
      entity: oldEntity,
      value: newId,
    });

    return changedEntity;
  };

  return {
    createEntity,
    deleteEntity,
    duplicateEntity,
    removeComponent,
    addComponent,
    changeEntityId,
  };
};
