import React, { Children } from "react";
import { Entity } from "../../ecs";
import { Game } from "../../Game";
import { AssetExplorerContextProvider } from "./components/AssetExplorer/AssetExplorerContext";

/**
 * Game Context
 */
const GameContext = React.createContext<Game>(null);
export const useGameContext = () => React.useContext(GameContext);

/**
 * Entity Context
 */
const ComponentContext = React.createContext({
  selectedComponent: "",
  setSelectedComponent: (val: any) => {},
});
export const useComponentContext = () => React.useContext(ComponentContext);

/**
 * Entity Context
 */
interface EntityContextInterface {
  selectedEntity: Entity;
  setSelectedEntity: React.Dispatch<React.SetStateAction<Entity>>;
  entities: Entity[];
}
const EntityContext = React.createContext<EntityContextInterface>({
  selectedEntity: null,
  setSelectedEntity: null,
  entities: null,
});
export const useEntityContext = () => React.useContext(EntityContext);
export const useSelectedEntity = () =>
  [
    React.useContext(EntityContext).selectedEntity,
    React.useContext(EntityContext).setSelectedEntity,
  ] as [Entity, React.Dispatch<React.SetStateAction<Entity>>];

interface Props {
  children: React.ReactNode;
  game: Game;
  entities: Entity[];
  selectedEntity: Entity;
  setSelectedEntity: React.Dispatch<React.SetStateAction<Entity>>;
  selectedComponent: string;
  setSelectedComponent: (val: any) => void;
}

export const EditorContextWrapper = ({
  children,
  entities,
  selectedEntity,
  setSelectedEntity,
  selectedComponent,
  setSelectedComponent,
  game,
}: Props) => {
  return (
    <GameContext.Provider value={game}>
      <EntityContext.Provider
        value={{ selectedEntity: selectedEntity, setSelectedEntity: setSelectedEntity, entities }}
      >
        <AssetExplorerContextProvider>
          <ComponentContext.Provider
            value={{
              selectedComponent: selectedComponent,
              setSelectedComponent: setSelectedComponent,
            }}
          >
            {children}
          </ComponentContext.Provider>
        </AssetExplorerContextProvider>
      </EntityContext.Provider>
    </GameContext.Provider>
  );
};
