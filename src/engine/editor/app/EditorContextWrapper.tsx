import React, { Children } from "react";
import { Entity } from "../../ecs";
import { Game } from "../../Game";
import { AssetExplorerContextProvider } from "./components/AssetExplorer/AssetExplorerContext";

const GameContext = React.createContext<Game>(null);
export const useGameContext = () => React.useContext(GameContext);

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
}
const EntityContext = React.createContext<EntityContextInterface>({
  selectedEntity: null,
});
export const useEntityContext = () => React.useContext(EntityContext);

interface Props {
  children: React.ReactNode;
  game: Game;
  selectedEntity: Entity;
  selectedComponent: string;
  setSelectedComponent: (val: any) => void;
}

export const EditorContextWrapper = ({
  children,
  selectedEntity,
  selectedComponent,
  setSelectedComponent,
  game,
}: Props) => {
  return (
    <GameContext.Provider value={game}>
      <EntityContext.Provider value={{ selectedEntity: selectedEntity }}>
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
