import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import "./style/typography.css";
import "./style/layout.css";
import "./style/variables.css";
import "./style/form.css";
import { Panel } from "./components/Panel";
import { EntityInspectorHead } from "./components/EntityInspectorHead";
import { Game } from "../../Game";
import { Entity } from "../../ecs";
import { ComponentInspector } from "./ComponentInspector";
import { PanelGroup } from "./components/Panel/PanelGroup";
import { ContextMenuTrigger } from "react-contextmenu";
import { EditorContextWrapper } from "./EditorContextWrapper";
import { useSceneFileDrop } from "./components/FileDrop/useFileDrop";
import { useFileSave } from "./components/FileDrop/useFileSave";
import useEagerUpdate from "./hooks/GameEngineCommunication/useEagerUpdate";
import useEditorHotkeys from "./hooks/useEditorHotkeys";
import { EntityListView } from "./components/EntityListView";
import useEntityListUpdate from "./hooks/GameEngineCommunication/useEntityListUpdate";
import useTriggerViewportContextMenu from "./hooks/GameEngineCommunication/useTriggerViewportContextMenu";
import { Modal } from "./components/Modal";
import useModal from "./components/Modal/useModal";
import { AssetExplorer } from "./components/AssetExplorer/AssetExplorer";
import { useHotkeys } from "react-hotkeys-hook";
import { HotkeyConfig } from "./Hotkeys";

interface Props {
  game: Game;
}

const EAGER_ENGINE_REFRESH = false;

const App = ({ game }: Props): JSX.Element => {
  // entities
  const [entities, setEntities] = useState<Entity[]>([]);

  // selection states
  const [selectedEntity, setSelectedEntity] = useState<Entity>();
  const [selectedComponent, setSelectedComponent] = useState("");

  useSceneFileDrop(game);
  useFileSave(game);
  useEditorHotkeys(game, selectedEntity, setSelectedEntity);

  /**
   * Engine communication functionalities
   */
  useEagerUpdate(game, selectedEntity, EAGER_ENGINE_REFRESH);
  useEntityListUpdate(game, setSelectedEntity, setEntities);

  /**
   * File Explorer
   */
  const [visible, showModal, hideModal] = useModal();
  useHotkeys(HotkeyConfig.ASSET_EXPLORER, () => {
    showModal();
  });

  const entityContextMenuTriggerRef = useTriggerViewportContextMenu();

  return (
    <EditorContextWrapper
      game={game}
      entities={entities}
      setSelectedEntity={setSelectedEntity}
      selectedEntity={selectedEntity}
      selectedComponent={selectedComponent}
      setSelectedComponent={setSelectedComponent}
    >
      <PanelGroup>
        <Panel dockingSide="left" minSize={200} initialState="expanded">
          <ContextMenuTrigger id="item-menu-trigger" ref={entityContextMenuTriggerRef}>
            <div className="entity-list-container">
              <EntityListView />
            </div>
          </ContextMenuTrigger>
        </Panel>
        <Panel dockingSide="right" initialState="expanded" minSize={250}>
          <ContextMenuTrigger id="entity-component-inspector">
            <div className="inspector-container">
              <EntityInspectorHead />
              <ComponentInspector />
            </div>
          </ContextMenuTrigger>
        </Panel>
      </PanelGroup>
      <Modal isVisible={visible} onHide={hideModal} canDismiss canDismissClickOutside noPadding>
        <AssetExplorer />
      </Modal>
    </EditorContextWrapper>
  );
};

export default App;
