import { TransformComponent } from "../core/TransformComponent";
import { Component, ComponentClass, Entity } from "../ecs";
import { getComponentClass, getEditableComponentMap } from "../editor";
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
    const editableComponentMap = getEditableComponentMap();

    const formattedEntityData: EntityEntry[] = entities.map((entity) => {
      // STEP 1 - compile a list of relevent(editable) components
      const allComponents = entity.listComponents();

      const editableComponents = allComponents.filter((component) => {
        const componentName = component.constructor.name;
        const isComponentEditable = editableComponentMap[componentName]
          ? true
          : false;
        return isComponentEditable;
      });

      // STEP 2 - compile a list of relevent(editable) values inside the component
      const componentWithCurrentValues: ComponentEntry[] = editableComponents.map(
        (component) => {
          const componentName = component.constructor.name;
          // all the editable fields inside the component
          const editableFieldNames = Object.keys(
            editableComponentMap[componentName]
          );
          const fieldWithCurrentValues: ComponentFieldEntry[] = editableFieldNames.map(
            (name) => {
              return {
                name: name,
                value: component[name],
              };
            }
          );
          return {
            name: componentName,
            fields: fieldWithCurrentValues,
          };
        }
      );

      return {
        id: entity.id as string,
        components: componentWithCurrentValues,
      };
    });

    parser._string = JSON.stringify(formattedEntityData);
    parser._entities = entities;
    return parser;
  }

  public static fromString(gameState: string): GameStateParser {
    const parser = new this();
    const gameStateObject = JSON.parse(gameState) as EntityEntry[];

    const entities = gameStateObject.map((entityEntry) => {
      const entity = Entity.create(entityEntry.id);

      // add components to the entity
      entityEntry.components.forEach((componentEntry) => {
        const componentClass = getComponentClass(componentEntry.name);
        const componentInstance = entity.useComponent(componentClass);

        componentEntry.fields.forEach((componentFieldEntry) => {
          componentInstance[componentFieldEntry.name] =
            componentFieldEntry.value;
        });
      });

      return entity;
    });

    console.log(entities);

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
