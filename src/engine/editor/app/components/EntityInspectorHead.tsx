import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { config } from "../AnimationConfig";
import { useSelectedEntity } from "../EditorContextWrapper";
import "./EntityInspectorHead.css";

/**
 * To display selected entity in the inspector panel
 * @returns
 */
export const EntityInspectorHead = () => {
  const [selectedEntity, setSelectedEntity] = useSelectedEntity();

  return (
    // <div>
    <>
      {selectedEntity && (
        <div className="entity-inspector-head">
          <div className="panel-hor-spacing header-label">Inspecting</div>
          <div className="panel-hor-spacing entity-inspector-head__entity-name">
            {selectedEntity.id}
          </div>
        </div>
      )}

      {!selectedEntity && (
        <div className="entity-inspector-head entity-inspector-head--empty">
          <div className="panel-hor-spacing header-label">Inspector</div>
          <div className="entity-inspector-empty-state">
            Start inspecting by selecting an entity in the scene.
          </div>
        </div>
      )}
    </>
    // </div>
  );
};
