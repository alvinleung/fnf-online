import { ImageLoader } from "../assets";
import { TransformComponent } from "../core/TransformComponent";
import { Component, ComponentClass, Entity } from "../ecs";
import { ComponentRegistry, SerializedClassObject } from "../editor";
import { InstantiableClassRegistry } from "../editor";
import { Game } from "../Game";

/**
 * Entity
 * +- component
 */

interface EntityEntry {
  id: string;
  components: ComponentEntry[];
}

interface ComponentEntry {
  name: string;
  fields: ComponentFieldEntry[];
}

interface ComponentFieldEntry {
  name: string;
  value: string | [] | Object;
}

export class GameStateParser {
  private _entities: Entity[] = [];
  private _string: string;

  public static fromGame(game: Game): GameStateParser {
    const parser = new this();
    const entities = [...game.entities];

    // step 1 - get all the editable components
    const editableComponentMap = ComponentRegistry.getEditableComponentMap();

    const formattedEntityData: EntityEntry[] = entities.map((entity) => {
      // STEP 1 - compile a list of relevent(editable) components
      const allComponents = entity.listComponents();

      const editableComponents = allComponents.filter((component) => {
        const componentName = component.constructor.name;
        const isComponentEditable = editableComponentMap[componentName] ? true : false;
        return isComponentEditable;
      });

      // STEP 2 - compile a list of relevent(editable) values inside the component
      const componentWithCurrentValues: ComponentEntry[] = editableComponents.map((component) => {
        const componentName = component.constructor.name;

        // all the editable fields inside the component
        const editableFieldNames = Object.keys(editableComponentMap[componentName]);
        const fieldWithCurrentValues: ComponentFieldEntry[] = editableFieldNames.map((name) => {
          let fieldValue = component[name];

          // check if the field a part of the instantiable class
          const fieldClassName = fieldValue.constructor.name;
          if (InstantiableClassRegistry.hasClass(fieldClassName)) {
            // serialize the class
            fieldValue = InstantiableClassRegistry.serialize(fieldClassName, fieldValue);
          }

          return {
            name: name,
            value: fieldValue,
          };
        });
        return {
          name: componentName,
          fields: fieldWithCurrentValues,
        };
      });

      return {
        id: entity.id as string,
        components: componentWithCurrentValues,
      };
    });

    parser._string = JSON.stringify(formattedEntityData);
    parser._entities = entities;

    return parser;
  }

  public static fromString(gameState: string, imageLoader: ImageLoader): GameStateParser {
    const parser = new this();
    const gameStateObject = JSON.parse(gameState) as EntityEntry[];

    const entities = gameStateObject.map((entityEntry) => {
      const entity = Entity.create(entityEntry.id);

      // add components to the entity
      entityEntry.components.forEach((componentEntry) => {
        const componentClass = ComponentRegistry.getComponentClass(componentEntry.name);
        const componentInstance = entity.useComponent(componentClass);

        componentEntry.fields.forEach((componentFieldEntry) => {
          let componentFieldValue = componentFieldEntry.value;

          // it is a serializable class if it has class name
          if ((componentFieldEntry.value as SerializedClassObject).className) {
            componentFieldValue = InstantiableClassRegistry.deserialize(
              componentFieldEntry.value as SerializedClassObject,
              imageLoader
            );
          }
          componentInstance[componentFieldEntry.name] = componentFieldValue;
        });
      });

      return entity;
    });

    parser._entities = entities;
    parser._string = gameState;

    return parser;
  }

  public getEntities(): Entity[] {
    return this._entities;
  }

  public getString(): string {
    return this._string;
  }
}
